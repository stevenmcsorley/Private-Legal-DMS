import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { Document, DocumentMeta } from '../entities';
import { TextExtractionService } from '../services/text-extraction.service';
import { SearchService } from '../../modules/search/search.service';
import { MinioService } from '../services/minio.service';
import { DocumentProcessingJobData, VirusScanJobData, OCRJobData, DocumentProcessingQueue } from '../queues/document-processing.queue';
import * as net from 'net';

@Processor('document-processing')
@Injectable()
export class DocumentProcessingProcessor {
  private readonly logger = new Logger(DocumentProcessingProcessor.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentMeta)
    private documentMetaRepository: Repository<DocumentMeta>,
    private textExtractionService: TextExtractionService,
    private searchService: SearchService,
    private minioService: MinioService,
    private documentProcessingQueue: DocumentProcessingQueue,
  ) {}

  @Process('virus-scan')
  async handleVirusScan(job: Job<VirusScanJobData>): Promise<void> {
    const { documentId, documentPath, originalFilename } = job.data;
    
    this.logger.log(`Processing virus scan for document ${documentId}: ${originalFilename}`);
    
    try {
      job.progress(10);

      // Download file from MinIO for scanning
      const fileBuffer = await this.minioService.downloadFile(documentPath);
      job.progress(30);

      // Scan with ClamAV
      const scanResult = await this.scanFileWithClamAV(fileBuffer, originalFilename);
      job.progress(80);

      if (!scanResult.clean) {
        this.logger.error(`Virus detected in document ${documentId}: ${scanResult.virus}`);
        
        // Mark document as infected and quarantine
        await this.documentRepository.update(documentId, {
          is_deleted: true, // Mark as deleted to prevent access
          // Add virus scan fields to document entity if needed
        });

        // Delete from MinIO for security
        await this.minioService.deleteFile(documentPath);
        
        throw new Error(`Virus detected: ${scanResult.virus}`);
      }

      this.logger.log(`Document ${documentId} passed virus scan`);
      job.progress(100);

    } catch (error) {
      this.logger.error(`Virus scan failed for document ${documentId}:`, error.message);
      throw error;
    }
  }

  @Process('extract-text')
  async handleTextExtraction(job: Job<DocumentProcessingJobData>): Promise<void> {
    const { documentId, documentPath, originalFilename, mimeType } = job.data;
    
    this.logger.log(`Processing text extraction for document ${documentId}: ${originalFilename}`);
    
    try {
      job.progress(10);

      // Get document from database
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['metadata'],
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      job.progress(20);

      // Check if file type is supported
      if (!this.textExtractionService.isSupportedFileType(mimeType, originalFilename)) {
        this.logger.debug(`File type ${mimeType} not supported for text extraction: ${originalFilename}`);
        job.progress(100);
        return;
      }

      // Download file from MinIO
      const fileBuffer = await this.minioService.downloadFile(documentPath);
      job.progress(40);

      // Extract text
      const extractionResult = await this.textExtractionService.extractTextWithLanguage(
        fileBuffer,
        originalFilename
      );
      job.progress(80);

      if (extractionResult.text) {
        // Update document metadata with extracted text
        let documentMeta = document.metadata;
        if (!documentMeta) {
          // Create metadata if it doesn't exist
          documentMeta = this.documentMetaRepository.create({
            document_id: documentId,
            title: originalFilename,
          });
          documentMeta = await this.documentMetaRepository.save(documentMeta);
        }

        documentMeta.extracted_text = extractionResult.text;
        
        // Update title if it wasn't provided and we have one from extraction
        if (!documentMeta.title || documentMeta.title === originalFilename) {
          if (extractionResult.metadata.title) {
            documentMeta.title = extractionResult.metadata.title;
          }
        }
        
        // Store page information if available
        if (extractionResult.metadata.pages) {
          documentMeta.pages = extractionResult.metadata.pages;
        }

        await this.documentMetaRepository.save(documentMeta);
        
        this.logger.log(`Extracted ${extractionResult.text.length} characters from ${originalFilename}`);
      }

      job.progress(100);

    } catch (error) {
      this.logger.error(`Text extraction failed for document ${documentId}:`, error.message);
      // Don't throw error - text extraction failure shouldn't block other processing
    }
  }

  @Process('ocr-process')
  async handleOCRProcessing(job: Job<OCRJobData>): Promise<void> {
    const { documentId, documentPath, originalFilename, mimeType } = job.data;
    
    this.logger.log(`Processing OCR for document ${documentId}: ${originalFilename}`);
    
    try {
      job.progress(10);

      // Check if OCR is needed (only for image files or PDFs that might be scanned)
      if (!this.isOCRCandidate(mimeType, originalFilename)) {
        this.logger.debug(`File type ${mimeType} not suitable for OCR: ${originalFilename}`);
        job.progress(100);
        return;
      }

      // Get document from database
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['metadata'],
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      // Check if text extraction already succeeded (skip OCR if we have text)
      if (document.metadata?.extracted_text && document.metadata.extracted_text.trim().length > 0) {
        this.logger.debug(`Document ${documentId} already has extracted text, skipping OCR`);
        job.progress(100);
        return;
      }

      job.progress(30);

      // Download file from MinIO
      const fileBuffer = await this.minioService.downloadFile(documentPath);
      job.progress(50);

      // Process with OCR
      const ocrResult = await this.processFileWithOCR(fileBuffer, originalFilename, mimeType);
      job.progress(90);

      if (ocrResult.text && ocrResult.text.trim().length > 0) {
        // Update document metadata with OCR text
        let documentMeta = document.metadata;
        if (!documentMeta) {
          documentMeta = this.documentMetaRepository.create({
            document_id: documentId,
            title: originalFilename,
          });
          documentMeta = await this.documentMetaRepository.save(documentMeta);
        }

        documentMeta.extracted_text = ocrResult.text;
        await this.documentMetaRepository.save(documentMeta);
        
        this.logger.log(`OCR extracted ${ocrResult.text.length} characters from ${originalFilename}`);

        // If significant text was found and we created a searchable PDF, update the document
        if (ocrResult.searchablePdfBuffer && ocrResult.text.length > 100) {
          this.logger.log(`Converting ${originalFilename} to searchable PDF due to substantial text content (${ocrResult.text.length} characters)`);
          
          // Upload the searchable PDF to MinIO, replacing the original image
          const newObjectKey = documentPath.replace(/\.(jpe?g|png|tiff?)$/i, '.pdf');
          await this.minioService.uploadFile(newObjectKey, ocrResult.searchablePdfBuffer, { 'Content-Type': 'application/pdf' });
          
          // Update document metadata
          await this.documentRepository.update(documentId, {
            object_key: newObjectKey,
            mime_type: 'application/pdf',
            size_bytes: ocrResult.searchablePdfBuffer.length,
            original_filename: originalFilename.replace(/\.(jpe?g|png|tiff?)$/i, '.pdf'),
          });

          // Delete the original image file
          await this.minioService.deleteFile(documentPath);
          
          this.logger.log(`Successfully converted ${originalFilename} to searchable PDF`);
        }

        // Trigger reindexing now that OCR text is available
        await this.documentProcessingQueue.triggerReindexAfterOCR({
          documentId,
          documentPath: ocrResult.searchablePdfBuffer ? documentPath.replace(/\.(jpe?g|png|tiff?)$/i, '.pdf') : documentPath,
          originalFilename: ocrResult.searchablePdfBuffer ? originalFilename.replace(/\.(jpe?g|png|tiff?)$/i, '.pdf') : originalFilename,
          mimeType: ocrResult.searchablePdfBuffer ? 'application/pdf' : mimeType,
          userId: job.data.userId,
          firmId: job.data.firmId,
        });
      }

      job.progress(100);

    } catch (error) {
      this.logger.error(`OCR processing failed for document ${documentId}:`, error.message);
      // Don't throw error - OCR failure shouldn't block other processing
    }
  }

  @Process('index-document')
  async handleSearchIndexing(job: Job<DocumentProcessingJobData>): Promise<void> {
    const { documentId, originalFilename } = job.data;
    
    this.logger.log(`Processing search indexing for document ${documentId}: ${originalFilename}`);
    
    try {
      job.progress(20);

      // Get document with fresh metadata (including extracted text)
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
        relations: ['metadata', 'matter', 'client'],
      });

      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      job.progress(50);

      // Index document for search
      await this.searchService.indexDocument(document);
      job.progress(100);

      this.logger.log(`Successfully indexed document ${documentId} for search`);

    } catch (error) {
      this.logger.error(`Search indexing failed for document ${documentId}:`, error.message);
      throw error;
    }
  }

  private async scanFileWithClamAV(fileBuffer: Buffer, filename: string): Promise<{ clean: boolean; virus?: string }> {
    return new Promise((resolve, reject) => {
      const clamAVHost = process.env.CLAMAV_HOST || 'clamav';
      const clamAVPort = parseInt(process.env.CLAMAV_PORT || '3310', 10);
      
      this.logger.debug(`Connecting to ClamAV at ${clamAVHost}:${clamAVPort}`);
      
      const socket = new net.Socket();
      
      socket.setTimeout(30000); // 30 second timeout
      
      socket.connect(clamAVPort, clamAVHost, () => {
        this.logger.debug(`Connected to ClamAV, scanning ${filename}`);
        
        // Send INSTREAM command
        socket.write('zINSTREAM\0');
        
        // Send file size (4 bytes, big endian)
        const sizeBuffer = Buffer.alloc(4);
        sizeBuffer.writeUInt32BE(fileBuffer.length, 0);
        socket.write(sizeBuffer);
        
        // Send file data
        socket.write(fileBuffer);
        
        // Send zero-length chunk to indicate end
        const endBuffer = Buffer.alloc(4);
        endBuffer.writeUInt32BE(0, 0);
        socket.write(endBuffer);
      });
      
      let responseData = '';
      
      socket.on('data', (data) => {
        responseData += data.toString();
      });
      
      socket.on('end', () => {
        this.logger.debug(`ClamAV response: ${responseData.trim()}`);
        
        if (responseData.includes('OK')) {
          resolve({ clean: true });
        } else if (responseData.includes('FOUND')) {
          const virusMatch = responseData.match(/stream: (.+) FOUND/);
          const virusName = virusMatch ? virusMatch[1] : 'Unknown virus';
          resolve({ clean: false, virus: virusName });
        } else {
          reject(new Error(`Unexpected ClamAV response: ${responseData}`));
        }
      });
      
      socket.on('error', (error) => {
        this.logger.error(`ClamAV connection error:`, error);
        reject(error);
      });
      
      socket.on('timeout', () => {
        this.logger.error('ClamAV scan timeout');
        socket.destroy();
        reject(new Error('ClamAV scan timeout'));
      });
    });
  }

  private isOCRCandidate(mimeType: string, filename: string): boolean {
    // Image files that might contain text
    const imageTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/tiff',
      'image/tif',
      'image/bmp',
      'image/gif'
    ];
    
    // PDFs that might be scanned documents
    const pdfTypes = ['application/pdf'];
    
    return imageTypes.includes(mimeType.toLowerCase()) || 
           pdfTypes.includes(mimeType.toLowerCase());
  }

  private async processFileWithOCR(fileBuffer: Buffer, filename: string, mimeType: string): Promise<{text: string, searchablePdfBuffer?: Buffer}> {
    const { spawn } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();
      const timestamp = Date.now();
      const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const inputFile = path.join(tempDir, `ocr_input_${timestamp}_${safeName}`);
      const textOutputFile = path.join(tempDir, `ocr_text_${timestamp}.txt`);
      const pdfOutputFile = path.join(tempDir, `ocr_pdf_${timestamp}`);
      
      try {
        // Write input file
        fs.writeFileSync(inputFile, fileBuffer);
        
        this.logger.debug(`Running Tesseract OCR on ${filename}`);
        
        // First, extract text only to check content length
        const tesseractTextProcess = spawn('tesseract', [
          inputFile,
          textOutputFile.replace('.txt', ''), // Tesseract adds .txt automatically
          '-l', 'eng',
          '--psm', '3', // Fully automatic page segmentation
          '--oem', '3'  // Default OCR Engine Mode
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stderr = '';
        
        tesseractTextProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        tesseractTextProcess.on('close', (code) => {
          try {
            if (code === 0 && fs.existsSync(textOutputFile)) {
              // OCR succeeded, read the text
              const ocrText = fs.readFileSync(textOutputFile, 'utf8').trim();
              
              this.logger.log(`OCR extracted ${ocrText.length} characters from ${filename}`);
              
              // If substantial text found (>100 characters), create searchable PDF
              if (ocrText.length > 100) {
                this.logger.debug(`Creating searchable PDF for ${filename} (${ocrText.length} characters)`);
                
                // Create searchable PDF using Tesseract
                const tesseractPdfProcess = spawn('tesseract', [
                  inputFile,
                  pdfOutputFile, // Tesseract will add .pdf automatically
                  '-l', 'eng',
                  '--psm', '3',
                  '--oem', '3',
                  'pdf'  // Output format: searchable PDF
                ], {
                  stdio: ['pipe', 'pipe', 'pipe']
                });
                
                tesseractPdfProcess.on('close', (pdfCode) => {
                  try {
                    // Clean up input and text files
                    this.cleanupOCRFiles([inputFile, textOutputFile]);
                    
                    if (pdfCode === 0 && fs.existsSync(pdfOutputFile + '.pdf')) {
                      // Read the searchable PDF
                      const pdfBuffer = fs.readFileSync(pdfOutputFile + '.pdf');
                      
                      // Clean up PDF file
                      fs.unlinkSync(pdfOutputFile + '.pdf');
                      
                      this.logger.log(`Created searchable PDF for ${filename} (${pdfBuffer.length} bytes)`);
                      resolve({ 
                        text: ocrText, 
                        searchablePdfBuffer: pdfBuffer 
                      });
                    } else {
                      this.logger.warn(`PDF creation failed for ${filename}, keeping as image with OCR text`);
                      resolve({ text: ocrText });
                    }
                  } catch (cleanupError) {
                    this.logger.error('Error during PDF OCR cleanup:', cleanupError);
                    resolve({ text: ocrText }); // Still return text even if PDF failed
                  }
                });
                
                tesseractPdfProcess.on('error', (error) => {
                  this.logger.error('Tesseract PDF process error:', error);
                  this.cleanupOCRFiles([inputFile, textOutputFile]);
                  resolve({ text: ocrText }); // Still return text even if PDF failed
                });
                
              } else {
                // Not enough text for PDF conversion, just return text
                this.cleanupOCRFiles([inputFile, textOutputFile]);
                resolve({ text: ocrText });
              }
              
            } else {
              // Clean up files
              this.cleanupOCRFiles([inputFile, textOutputFile]);
              
              this.logger.error(`OCR failed for ${filename} with code ${code}: ${stderr}`);
              reject(new Error(`OCR process failed: ${stderr}`));
            }
          } catch (cleanupError) {
            this.logger.error('Error during OCR cleanup:', cleanupError);
            reject(cleanupError);
          }
        });
        
        tesseractTextProcess.on('error', (error) => {
          this.logger.error('Tesseract process error:', error);
          this.cleanupOCRFiles([inputFile, textOutputFile]);
          reject(error);
        });
        
      } catch (error) {
        this.logger.error('Error setting up OCR:', error);
        reject(error);
      }
    });
  }

  private cleanupOCRFiles(filePaths: string[]): void {
    const fs = require('fs');
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        this.logger.warn(`Failed to cleanup OCR file ${filePath}:`, error.message);
      }
    });
  }

  private async extractTextFromOCRPDF(pdfPath: string): Promise<string> {
    const fs = require('fs');
    
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const result = await this.textExtractionService.extractTextWithLanguage(pdfBuffer, 'ocr_output.pdf');
      return result.text || '';
    } catch (error) {
      this.logger.error('Failed to extract text from OCR PDF:', error);
      throw error;
    }
  }
}