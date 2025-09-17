import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentMeta, Matter, Client, RetentionClass } from '../../common/entities';
import { MinioService } from '../../common/services/minio.service';
import { AuditService } from '../../common/services/audit.service';
import { SearchService } from '../search/search.service';
import { TextExtractionService } from '../../common/services/text-extraction.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { UserInfo } from '../../auth/auth.service';
import * as crypto from 'crypto';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

export interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  matter_id?: string;
  client_id?: string;
  document_type?: string;
  tags?: string[];
  confidential?: boolean;
  legal_hold?: boolean;
  firm_id?: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentMeta)
    private documentMetaRepository: Repository<DocumentMeta>,
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(RetentionClass)
    private retentionClassRepository: Repository<RetentionClass>,
    private minioService: MinioService,
    private auditService: AuditService,
    private searchService: SearchService,
    private textExtractionService: TextExtractionService,
  ) {}

  async uploadDocument(
    file: UploadedFile,
    uploadDto: UploadDocumentDto,
    user: UserInfo,
  ): Promise<DocumentResponseDto> {
    if (!user.firm_id) {
      throw new ForbiddenException('User must belong to a firm to upload documents');
    }

    // Verify the matter exists and belongs to the same firm
    const matter = await this.matterRepository.findOne({
      where: { id: uploadDto.matter_id },
      relations: ['client'],
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${uploadDto.matter_id} not found`);
    }

    if (matter.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Cannot upload document to matter from different firm');
    }

    // Validate file
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new BadRequestException('File size exceeds 100MB limit');
    }

    // Calculate file hash
    const contentSha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Generate object key
    const fileExtension = path.extname(file.originalname);
    const objectKey = `documents/${matter.firm_id}/${matter.id}/${Date.now()}-${crypto.randomUUID()}${fileExtension}`;

    try {
      // Upload to MinIO
      const uploadResult = await this.minioService.uploadFile(
        objectKey,
        file.buffer,
        {
          'Content-Type': file.mimetype,
          'Original-Filename': file.originalname,
          'Uploaded-By': user.sub,
          'Matter-Id': matter.id,
          'Firm-Id': matter.firm_id,
        },
      );

      // Verify retention class if provided
      let retentionClass: RetentionClass | null = null;
      if (uploadDto.retention_class_id) {
        retentionClass = await this.retentionClassRepository.findOne({
          where: { id: uploadDto.retention_class_id, firm_id: user.firm_id },
        });
        
        if (!retentionClass) {
          throw new BadRequestException('Invalid retention class');
        }
      }

      // Create document record
      const document = this.documentRepository.create({
        matter_id: uploadDto.matter_id,
        firm_id: matter.firm_id,
        client_id: matter.client_id,
        object_key: objectKey,
        content_sha256: contentSha256,
        original_filename: file.originalname,
        size_bytes: file.size,
        mime_type: file.mimetype,
        version: 1,
        retention_class_id: uploadDto.retention_class_id,
        legal_hold: false,
        created_by: user.sub,
        is_deleted: false,
        uploaded_by_type: uploadDto.uploaded_by_type || 'legal_staff',
        uploaded_by_user_id: uploadDto.uploaded_by_user_id || user.sub,
      });

      const savedDocument = await this.documentRepository.save(document);

      // Create document metadata
      const documentMeta = this.documentMetaRepository.create({
        document_id: savedDocument.id,
        title: uploadDto.title || file.originalname,
        description: uploadDto.description,
        document_type: uploadDto.document_type,
        tags: uploadDto.tags || [],
        parties: uploadDto.parties || [],
        jurisdiction: uploadDto.jurisdiction,
        document_date: uploadDto.document_date ? new Date(uploadDto.document_date) : null,
        effective_date: uploadDto.effective_date ? new Date(uploadDto.effective_date) : null,
        expiry_date: uploadDto.expiry_date ? new Date(uploadDto.expiry_date) : null,
        confidential: uploadDto.confidential || false,
        privileged: uploadDto.privileged || false,
        work_product: uploadDto.work_product || false,
        custom_fields: uploadDto.custom_fields || {},
      });

      await this.documentMetaRepository.save(documentMeta);

      // Extract text content from the document
      try {
        if (this.textExtractionService.isSupportedFileType(file.mimetype, file.originalname)) {
          this.logger.debug(`Extracting text from ${file.originalname}`);
          
          const extractionResult = await this.textExtractionService.extractTextWithLanguage(
            file.buffer,
            file.originalname
          );

          if (extractionResult.text) {
            // Update the document metadata with extracted text
            documentMeta.extracted_text = extractionResult.text;
            
            // Update title if it wasn't provided and we have one from extraction
            if (!uploadDto.title && extractionResult.metadata.title) {
              documentMeta.title = extractionResult.metadata.title;
            }
            
            // Store page information if available
            if (extractionResult.metadata.pages) {
              documentMeta.pages = extractionResult.metadata.pages;
            }

            await this.documentMetaRepository.save(documentMeta);
            
            this.logger.debug(`Extracted ${extractionResult.text.length} characters from ${file.originalname}`);
          }
        } else {
          this.logger.debug(`File type ${file.mimetype} not supported for text extraction: ${file.originalname}`);
        }
      } catch (extractionError) {
        this.logger.warn(`Text extraction failed for ${file.originalname}:`, extractionError.message);
        // Continue with upload even if text extraction fails
      }

      this.logger.log(`Document uploaded: ${savedDocument.id} by user ${user.sub}`);

      // Audit log the document upload
      await this.auditService.logDocumentUpload(
        user,
        savedDocument.id,
        file.originalname,
        file.size,
        uploadDto.matter_id,
      );

      // Index document for search
      try {
        await this.searchService.indexDocument(savedDocument);
        this.logger.debug(`Document indexed for search: ${savedDocument.id}`);
      } catch (indexError) {
        this.logger.error(`Failed to index document ${savedDocument.id}:`, indexError);
        // Don't fail the upload if indexing fails, just log the error
      }

      return this.buildDocumentResponse(savedDocument, {
        metadata: documentMeta,
        matter,
        client: matter.client,
        retention_class: retentionClass,
      });
    } catch (error) {
      this.logger.error('Document upload failed:', error);
      
      // Clean up uploaded file if document creation failed
      try {
        await this.minioService.deleteFile(objectKey);
      } catch (cleanupError) {
        this.logger.error('Failed to cleanup uploaded file:', cleanupError);
      }
      
      throw error;
    }
  }

  async findAll(query: DocumentQuery, user: UserInfo): Promise<{
    documents: DocumentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, search, matter_id, client_id, document_type, tags, confidential, legal_hold } = query;
    const firm_id = query.firm_id || user.firm_id;

    if (!firm_id) {
      throw new ForbiddenException('Firm ID is required');
    }

    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.metadata', 'meta')
      .leftJoinAndSelect('document.matter', 'matter')
      .leftJoinAndSelect('document.client', 'client')
      .leftJoinAndSelect('document.created_by_user', 'user')
      .leftJoinAndSelect('document.retention_class', 'retention_class')
      .where('document.firm_id = :firm_id', { firm_id })
      .andWhere('document.is_deleted = false');

    if (search) {
      queryBuilder.andWhere(
        '(meta.title ILIKE :search OR meta.description ILIKE :search OR document.original_filename ILIKE :search OR meta.extracted_text ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (matter_id) {
      queryBuilder.andWhere('document.matter_id = :matter_id', { matter_id });
    }

    if (client_id) {
      queryBuilder.andWhere('document.client_id = :client_id', { client_id });
    }

    if (document_type) {
      queryBuilder.andWhere('meta.document_type = :document_type', { document_type });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('meta.tags @> :tags', { tags: JSON.stringify(tags) });
    }

    if (confidential !== undefined) {
      queryBuilder.andWhere('meta.confidential = :confidential', { confidential });
    }

    if (legal_hold !== undefined) {
      queryBuilder.andWhere('document.legal_hold = :legal_hold', { legal_hold });
    }

    queryBuilder
      .orderBy('document.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [documents, total] = await queryBuilder.getManyAndCount();

    return {
      documents: documents.map(doc => this.buildDocumentResponse(doc)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: UserInfo): Promise<DocumentResponseDto> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['metadata', 'matter', 'client', 'created_by_user', 'retention_class'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check firm access
    if (document.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this document');
    }

    if (document.is_deleted) {
      throw new NotFoundException('Document has been deleted');
    }

    // Generate download URL
    const downloadUrl = await this.minioService.generatePresignedUrl(document.object_key, 3600); // 1 hour

    return this.buildDocumentResponse(document, { downloadUrl });
  }

  async downloadDocument(id: string, user: UserInfo): Promise<{
    buffer: Buffer;
    filename: string;
    mimetype: string;
  }> {
    // Get the raw document entity (not DTO) to access object_key
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['metadata', 'matter', 'client', 'created_by_user', 'retention_class'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check firm access
    if (document.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this document');
    }

    if (document.is_deleted) {
      throw new NotFoundException('Document has been deleted');
    }
    
    if (document.legal_hold && !user.roles.some(role => ['legal_manager', 'firm_admin'].includes(role))) {
      throw new ForbiddenException('Document is under legal hold and cannot be downloaded');
    }

    let buffer: Buffer;
    try {
      buffer = await this.minioService.downloadFile(document.object_key);
    } catch (e) {
      this.logger.error(`Failed to download file for document ${id}:`, e);
      throw new NotFoundException('Document content not available');
    }
    
    // Audit log the document download
    await this.auditService.logDocumentDownload(user, id, document.original_filename);
    
    return {
      buffer,
      filename: document.original_filename,
      mimetype: document.mime_type,
    };
  }

  async getPreviewUrl(id: string, user: UserInfo): Promise<{ url: string; expires_at: Date }> {
    // This method is now handled directly in the controller
    // for the secure proxy approach
    const expirySeconds = 3600; // 1 hour
    const expiresAt = new Date(Date.now() + expirySeconds * 1000);
    
    return {
      url: `/api/documents/${id}/stream`,
      expires_at: expiresAt,
    };
  }

  async streamDocument(id: string, user: UserInfo, response: any): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['metadata'],
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check firm access
    if (document.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this document');
    }

    if (document.is_deleted) {
      throw new NotFoundException('Document has been deleted');
    }

    try {
      // Get file from MinIO
      const buffer = await this.minioService.downloadFile(document.object_key);
      
      // Set appropriate headers
      response.set({
        'Content-Type': document.mime_type,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });

      // Stream the document
      response.send(buffer);

      // Audit log the document view
      await this.auditService.logDocumentView(user, id, document.metadata?.title || document.original_filename);
    } catch (error) {
      this.logger.error(`Failed to stream document ${id}:`, error);
      throw new NotFoundException('Document content not available');
    }
  }

  async deleteDocument(id: string, user: UserInfo): Promise<void> {
    const document = await this.findOne(id, user);

    if (document.legal_hold) {
      throw new ForbiddenException('Cannot delete document under legal hold');
    }

    // Soft delete - mark as deleted but keep file
    await this.documentRepository.update(id, {
      is_deleted: true,
      deleted_at: new Date(),
    });

    this.logger.log(`Document deleted: ${id} by user ${user.sub}`);

    // Audit log the document deletion
    await this.auditService.logDocumentDelete(user, id, document.original_filename, false);
  }

  async setLegalHold(id: string, reason: string, user: UserInfo): Promise<DocumentResponseDto> {
    const document = await this.findOne(id, user);

    await this.documentRepository.update(id, {
      legal_hold: true,
      legal_hold_reason: reason,
      legal_hold_set_by: user.sub,
      legal_hold_set_at: new Date(),
    });

    this.logger.log(`Legal hold set on document: ${id} by user ${user.sub}`);

    // Audit log the legal hold
    await this.auditService.logLegalHoldSet(user, id, reason);

    return this.findOne(id, user);
  }

  async removeLegalHold(id: string, user: UserInfo): Promise<DocumentResponseDto> {
    const document = await this.findOne(id, user);

    await this.documentRepository.update(id, {
      legal_hold: false,
      legal_hold_reason: null,
      legal_hold_set_by: null,
      legal_hold_set_at: null,
    });

    this.logger.log(`Legal hold removed from document: ${id} by user ${user.sub}`);

    // Audit log the legal hold removal
    await this.auditService.logLegalHoldRemoved(user, id);

    return this.findOne(id, user);
  }

  private buildDocumentResponse(
    document: Document,
    options: {
      metadata?: DocumentMeta;
      matter?: Matter;
      client?: Client;
      retention_class?: RetentionClass;
      downloadUrl?: string;
    } = {},
  ): DocumentResponseDto {
    const response = new DocumentResponseDto({
      id: document.id,
      original_filename: document.original_filename,
      mime_type: document.mime_type,
      size_bytes: document.size_bytes,
      version: document.version,
      content_sha256: document.content_sha256,
      matter_id: document.matter_id,
      firm_id: document.firm_id,
      client_id: document.client_id,
      created_by: document.created_by,
      legal_hold: document.legal_hold,
      legal_hold_reason: document.legal_hold_reason,
      is_deleted: document.is_deleted,
      created_at: document.created_at,
      updated_at: document.updated_at,
      download_url: options.downloadUrl,
      uploaded_by_type: document.uploaded_by_type,
      uploaded_by_user_id: document.uploaded_by_user_id,
    });

    // Add metadata if available
    const metadata = options.metadata || document.metadata;
    if (metadata) {
      response.metadata = {
        document_type: metadata.document_type,
        tags: metadata.tags,
        parties: metadata.parties,
        jurisdiction: metadata.jurisdiction,
        document_date: metadata.document_date,
        effective_date: metadata.effective_date,
        expiry_date: metadata.expiry_date,
        confidential: metadata.confidential,
        privileged: metadata.privileged,
        work_product: metadata.work_product,
        custom_fields: metadata.custom_fields,
      };
      response.title = metadata.title;
      response.description = metadata.description;
    }

    // Add related entities if available
    const matter = options.matter || document.matter;
    if (matter) {
      response.matter = {
        id: matter.id,
        title: matter.title,
        status: matter.status,
      };
    }

    const client = options.client || document.client;
    if (client) {
      response.client = {
        id: client.id,
        name: client.name,
      };
    }

    if (document.created_by_user) {
      response.created_by_user = {
        id: document.created_by_user.id,
        display_name: document.created_by_user.display_name,
        email: document.created_by_user.email,
      };
    }

    const retentionClass = options.retention_class || document.retention_class;
    if (retentionClass) {
      response.retention_class = {
        id: retentionClass.id,
        name: retentionClass.name,
        retention_years: retentionClass.retention_years,
      };
    }

    return response;
  }

  async generateOnlyOfficeUrl(
    documentId: string,
    user: UserInfo,
  ): Promise<{ config: any; document_type: string }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['matter', 'client', 'created_by_user'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Determine OnlyOffice document type based on MIME type
    const documentType = this.getOnlyOfficeDocumentType(document.mime_type);
    if (!documentType) {
      throw new BadRequestException('Document type not supported by OnlyOffice');
    }

    // Generate OnlyOffice URL
    const onlyOfficeConfig = {
      document: {
        fileType: this.getFileExtension(document.original_filename),
        key: this.generateDocumentKey(document),
        title: document.original_filename,
        url: `${process.env.API_BASE_URL}/api/documents/${documentId}/stream`,
      },
      documentType,
      editorConfig: {
        mode: 'view', // Start in view mode, can be changed to 'edit'
        lang: 'en',
        user: {
          id: user.sub,
          name: user.display_name,
        },
        customization: {
          autosave: false,
          forcesave: false,
          submitForm: false,
        },
      },
      height: '600px',
      width: '100%',
    };

    // Create OnlyOffice configuration with JWT
    // Use the special OnlyOffice access endpoint that validates JWT tokens
    const accessToken = this.generateOnlyOfficeAccessToken(documentId, user.sub);
    // OnlyOffice container needs to access the API
    // Use direct container-to-container communication without port mapping
    const apiBaseUrl = process.env.ONLYOFFICE_API_BASE_URL || 'http://dms-app-1:3000';
    const documentUrl = `${apiBaseUrl}/api/documents/${documentId}/onlyoffice-access`;
    
    const config: any = {
      document: {
        fileType: this.getFileExtension(document.original_filename),
        key: this.generateDocumentKey(document),
        title: document.original_filename,
        url: documentUrl,
        permissions: {
          edit: false, // View-only mode
          download: true,
          print: true,
        },
      },
      documentType,
      editorConfig: {
        mode: 'view',
        lang: 'en',
        user: {
          id: user.sub,
          name: user.display_name || user.preferred_username,
        },
        customization: {
          autosave: false,
          forcesave: false,
          submitForm: false,
        },
      },
      height: '600px',
      width: '100%',
    };

    // Add JWT token to the configuration if enabled
    const jwtSecret = process.env.ONLYOFFICE_JWT_SECRET || '01PmN463rIix2zANSLceDUs6cxqHU35N';
    if (jwtSecret) {
      config.token = jwt.sign(config, jwtSecret, { algorithm: 'HS256' });
    }

    await this.auditService.log({
      user: user,
      action: 'onlyoffice_open',
      resource_type: 'document',
      resource_id: documentId,
      details: {
        document_name: document.original_filename,
        document_type: documentType,
      },
    });

    // Return the standard OnlyOffice configuration
    return {
      config: config,
      document_type: documentType,
    };
  }

  private getOnlyOfficeDocumentType(mimeType: string): string | null {
    // Word documents
    if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      return 'word';
    }
    
    // Excel documents
    if (mimeType.includes('spreadsheetml') || mimeType.includes('ms-excel')) {
      return 'cell';
    }
    
    // PowerPoint documents  
    if (mimeType.includes('presentationml') || mimeType.includes('ms-powerpoint')) {
      return 'slide';
    }
    
    // OpenDocument formats
    if (mimeType.includes('opendocument.text')) {
      return 'word';
    }
    if (mimeType.includes('opendocument.spreadsheet')) {
      return 'cell';
    }
    if (mimeType.includes('opendocument.presentation')) {
      return 'slide';
    }
    
    return null;
  }

  private getFileExtension(filename: string): string {
    return path.extname(filename).substring(1).toLowerCase();
  }

  private generateDocumentKey(document: Document): string {
    // Generate a unique key for OnlyOffice based on document ID and version
    return crypto
      .createHash('sha256')
      .update(`${document.id}_${document.version}_${document.updated_at}`)
      .digest('hex')
      .substring(0, 20);
  }

  private generateTempToken(documentId: string, userId: string): string {
    // Generate a temporary token for OnlyOffice to access the document
    // This would be stored in Redis/cache with short expiry in production
    const payload = `${documentId}:${userId}:${Date.now()}`;
    return crypto
      .createHash('sha256')
      .update(payload + process.env.SESSION_SECRET)
      .digest('hex')
      .substring(0, 32);
  }

  private generateOnlyOfficeAccessToken(documentId: string, userId: string): string {
    // Generate a JWT token for OnlyOffice to access the document
    const payload = {
      documentId,
      userId,
      purpose: 'onlyoffice_access',
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    };
    
    const jwtSecret = process.env.ONLYOFFICE_JWT_SECRET || '01PmN463rIix2zANSLceDUs6cxqHU35N';
    return jwt.sign(payload, jwtSecret, { algorithm: 'HS256' });
  }

  async streamDocumentForOnlyOffice(
    documentId: string,
    token: string | undefined,
    res: any,
  ): Promise<void> {
    try {
      this.logger.log(`OnlyOffice requesting document ${documentId} with token: ${token ? 'PROVIDED' : 'NO_TOKEN'}`);
      
      // For OnlyOffice JWT validation, we need to check the request headers
      // OnlyOffice sends JWT in custom header when JWT_HEADER is configured
      const authHeader = res.req.headers['authorizationjwt'] || res.req.headers['authorization'];
      let validationToken = token || authHeader;
      
      if (validationToken && validationToken.startsWith('Bearer ')) {
        validationToken = validationToken.substring(7);
      }
      
      if (validationToken) {
        try {
          const jwtSecret = process.env.ONLYOFFICE_JWT_SECRET || '01PmN463rIix2zANSLceDUs6cxqHU35N';
          
          // OnlyOffice sends JWT tokens with the document URL and other info
          // We validate it came from OnlyOffice using the shared secret
          const decoded = jwt.verify(validationToken, jwtSecret) as any;
          this.logger.log(`OnlyOffice JWT validation passed for document ${documentId}`, {
            payload: decoded,
            url: decoded.url || 'no-url'
          });
        } catch (jwtError) {
          this.logger.warn(`OnlyOffice JWT validation failed for document ${documentId}:`, jwtError.message);
          // For debugging, we'll log but continue - in production you might want to reject
          this.logger.warn(`Token: ${validationToken ? validationToken.substring(0, 50) + '...' : 'undefined'}`);
        }
      } else {
        this.logger.warn(`No validation token found for document ${documentId}`);
      }

      // Get the document
      const document = await this.documentRepository.findOne({
        where: { id: documentId },
      });

      if (!document) {
        this.logger.error(`Document ${documentId} not found`);
        throw new NotFoundException('Document not found');
      }

      this.logger.log(`Streaming document ${documentId}: ${document.original_filename} (${document.size_bytes} bytes)`);

      // Stream the document from MinIO
      const stream = await this.minioService.getObjectStream(document.object_key);
      
      // Set appropriate headers for OnlyOffice
      res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
      res.setHeader('Content-Length', document.size_bytes);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AuthorizationJWT');
      
      // Pipe the stream to the response
      stream.pipe(res);
      
    } catch (error) {
      this.logger.error('Error streaming document for OnlyOffice:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Invalid or expired token' });
      } else {
        res.status(500).json({ error: 'Failed to stream document' });
      }
    }
  }
}
