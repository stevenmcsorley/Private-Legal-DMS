import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface ExtractionResult {
  text: string;
  metadata: {
    contentType: string;
    pages?: number;
    author?: string;
    title?: string;
    subject?: string;
    creator?: string;
    created?: string;
    modified?: string;
    language?: string;
    wordCount?: number;
    characterCount?: number;
  };
}

@Injectable()
export class TextExtractionService {
  private readonly logger = new Logger(TextExtractionService.name);
  private readonly tikaUrl: string;

  constructor(private configService: ConfigService) {
    this.tikaUrl = this.configService.get<string>('TIKA_URL', 'http://tika:9998');
  }

  /**
   * Extract text content from a file buffer using Apache Tika
   */
  async extractText(fileBuffer: Buffer, filename: string): Promise<ExtractionResult> {
    try {
      this.logger.debug(`Extracting text from file: ${filename}`);

      // Extract text content
      const textResponse = await this.callTika('/tika', fileBuffer, {
        'Accept': 'text/plain',
        'Content-Type': 'application/octet-stream',
      });

      // Extract metadata
      const metadataResponse = await this.callTika('/meta', fileBuffer, {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
      });

      const extractedText = textResponse.data || '';
      const metadata = this.parseMetadata(metadataResponse.data, filename);

      this.logger.debug(`Extracted ${extractedText.length} characters from ${filename}`);

      return {
        text: extractedText.trim(),
        metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to extract text from ${filename}:`, error.message);
      
      // Return empty result on failure rather than throwing
      return {
        text: '',
        metadata: {
          contentType: this.guessContentType(filename),
        },
      };
    }
  }

  /**
   * Extract text and detect language
   */
  async extractTextWithLanguage(fileBuffer: Buffer, filename: string): Promise<ExtractionResult & { language?: string }> {
    try {
      // First get the basic extraction
      const result = await this.extractText(fileBuffer, filename);

      // Try to detect language if we have enough text
      if (result.text.length > 100) {
        try {
          const langResponse = await this.callTika('/language/string', Buffer.from(result.text), {
            'Accept': 'text/plain',
            'Content-Type': 'text/plain',
          });

          const detectedLanguage = langResponse.data?.trim();
          if (detectedLanguage) {
            result.metadata.language = detectedLanguage;
          }
        } catch (langError) {
          this.logger.debug(`Language detection failed for ${filename}: ${langError.message}`);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to extract text with language from ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a file type is supported for text extraction
   */
  isSupportedFileType(mimeType: string, filename: string): boolean {
    const supportedTypes = [
      // Microsoft Office
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
      'application/msword', // doc
      'application/vnd.ms-excel', // xls
      'application/vnd.ms-powerpoint', // ppt
      
      // PDF
      'application/pdf',
      
      // Text files
      'text/plain',
      'text/html',
      'text/xml',
      'application/xml',
      'text/csv',
      
      // Rich text
      'application/rtf',
      'text/rtf',
      
      // OpenOffice
      'application/vnd.oasis.opendocument.text', // odt
      'application/vnd.oasis.opendocument.spreadsheet', // ods
      'application/vnd.oasis.opendocument.presentation', // odp
      
      // Images (OCR capable)
      'image/jpeg',
      'image/png',
      'image/tiff',
      'image/bmp',
      'image/gif',
    ];

    // Check by MIME type
    if (supportedTypes.includes(mimeType)) {
      return true;
    }

    // Fallback: check by file extension
    const extension = filename.toLowerCase().split('.').pop();
    const supportedExtensions = [
      'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt',
      'pdf', 'txt', 'html', 'xml', 'csv', 'rtf',
      'odt', 'ods', 'odp',
      'jpg', 'jpeg', 'png', 'tiff', 'bmp', 'gif'
    ];

    return supportedExtensions.includes(extension || '');
  }

  /**
   * Get estimated word count from text
   */
  getWordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get preview snippet from extracted text
   */
  getPreviewSnippet(text: string, maxLength: number = 300): string {
    if (!text) return '';
    
    const cleaned = text.trim().replace(/\s+/g, ' ');
    if (cleaned.length <= maxLength) return cleaned;
    
    // Find a good break point near the limit
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > maxLength * 0.8 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  private async callTika(endpoint: string, data: Buffer, headers: Record<string, string>): Promise<AxiosResponse> {
    const url = `${this.tikaUrl}${endpoint}`;
    
    return await axios({
      method: 'PUT',
      url,
      data,
      headers,
      timeout: 30000, // 30 second timeout
      maxContentLength: 100 * 1024 * 1024, // 100MB max
    });
  }

  private parseMetadata(metadata: any, filename: string): ExtractionResult['metadata'] {
    try {
      const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      
      return {
        contentType: meta['Content-Type'] || this.guessContentType(filename),
        pages: this.parseNumber(meta['xmpTPg:NPages'] || meta['meta:page-count']),
        author: meta['meta:author'] || meta['dc:creator'] || meta['Author'],
        title: meta['dc:title'] || meta['title'] || meta['Title'],
        subject: meta['dc:subject'] || meta['subject'] || meta['Subject'],
        creator: meta['meta:creation-tool'] || meta['Application-Name'] || meta['Creator'],
        created: meta['meta:creation-date'] || meta['dcterms:created'] || meta['Creation-Date'],
        modified: meta['dcterms:modified'] || meta['Last-Modified'] || meta['Modified'],
        language: meta['meta:language'] || meta['language'] || meta['Language'],
        wordCount: this.parseNumber(meta['meta:word-count'] || meta['Word-Count']),
        characterCount: this.parseNumber(meta['meta:character-count'] || meta['Character-Count']),
      };
    } catch (error) {
      this.logger.warn(`Failed to parse metadata for ${filename}: ${error.message}`);
      return {
        contentType: this.guessContentType(filename),
      };
    }
  }

  private parseNumber(value: any): number | undefined {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  }

  private guessContentType(filename: string): string {
    const extension = filename.toLowerCase().split('.').pop();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'doc': 'application/msword',
      'xls': 'application/vnd.ms-excel',
      'ppt': 'application/vnd.ms-powerpoint',
      'txt': 'text/plain',
      'html': 'text/html',
      'xml': 'text/xml',
      'csv': 'text/csv',
      'rtf': 'application/rtf',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Health check for Tika service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.tikaUrl}/version`, { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}