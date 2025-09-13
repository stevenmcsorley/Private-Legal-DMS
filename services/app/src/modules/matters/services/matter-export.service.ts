import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matter, Document, User } from '../../../common/entities';
import { MinioService } from '../../../common/services/minio.service';
import * as archiver from 'archiver';
import { Readable } from 'stream';

export interface MatterExportOptions {
  includeDocuments: boolean;
  includeMetadata: boolean;
  includeAuditTrail: boolean;
  documentTypes?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  confidentialityLevels?: ('public' | 'confidential' | 'privileged' | 'work_product')[];
}

export interface ExportManifest {
  matter: {
    id: string;
    title: string;
    matter_number: string;
    client_name: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  export: {
    generated_at: string;
    generated_by: string;
    firm_name: string;
    options: MatterExportOptions;
    total_documents: number;
    total_size_bytes: number;
  };
  documents: Array<{
    id: string;
    filename: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
    tags: string[];
    confidential: boolean;
    privileged: boolean;
    work_product: boolean;
    export_path: string;
  }>;
}

@Injectable()
export class MatterExportService {
  private readonly logger = new Logger(MatterExportService.name);

  constructor(
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly minioService: MinioService,
  ) {}

  async exportMatter(
    matterId: string,
    user: User,
    options: MatterExportOptions = {
      includeDocuments: true,
      includeMetadata: true,
      includeAuditTrail: false,
    },
  ): Promise<{ stream: NodeJS.ReadableStream; filename: string; manifest: ExportManifest }> {
    this.logger.log(`Starting matter export for matter ${matterId} by user ${user.id}`);

    // Fetch matter with relations
    const matter = await this.matterRepository.findOne({
      where: { id: matterId },
      relations: ['client'],
    });

    if (!matter) {
      throw new NotFoundException('Matter not found');
    }

    // TODO: Add authorization check - ensure user can export this matter
    // For now, we'll assume the controller handles authorization

    // Fetch documents based on options
    const documentsQuery = this.documentRepository.createQueryBuilder('doc')
      .leftJoinAndSelect('doc.metadata', 'metadata')
      .where('doc.matter_id = :matterId', { matterId });

    if (options.documentTypes && options.documentTypes.length > 0) {
      documentsQuery.andWhere('doc.document_type IN (:...types)', { types: options.documentTypes });
    }

    if (options.dateRange) {
      documentsQuery.andWhere('doc.uploaded_at BETWEEN :from AND :to', {
        from: options.dateRange.from,
        to: options.dateRange.to,
      });
    }

    if (options.confidentialityLevels && options.confidentialityLevels.length > 0) {
      const conditions = [];
      if (options.confidentialityLevels.includes('public')) {
        conditions.push('(doc.confidential = false AND doc.privileged = false AND doc.work_product = false)');
      }
      if (options.confidentialityLevels.includes('confidential')) {
        conditions.push('doc.confidential = true');
      }
      if (options.confidentialityLevels.includes('privileged')) {
        conditions.push('doc.privileged = true');
      }
      if (options.confidentialityLevels.includes('work_product')) {
        conditions.push('doc.work_product = true');
      }
      if (conditions.length > 0) {
        documentsQuery.andWhere(`(${conditions.join(' OR ')})`);
      }
    }

    const documents = await documentsQuery.getMany();

    // Create export manifest
    const manifest: ExportManifest = {
      matter: {
        id: matter.id,
        title: matter.title,
        matter_number: matter.id.slice(-8), // Use last 8 chars as matter number
        client_name: matter.client?.name || '',
        description: matter.description,
        status: matter.status,
        created_at: matter.created_at.toISOString(),
        updated_at: matter.updated_at.toISOString(),
      },
      export: {
        generated_at: new Date().toISOString(),
        generated_by: user.display_name,
        firm_name: 'Legal Firm', // TODO: Get from user's firm
        options,
        total_documents: documents.length,
        total_size_bytes: documents.reduce((sum, doc) => sum + Number(doc.size_bytes), 0),
      },
      documents: documents.map((doc, index) => ({
        id: doc.id,
        filename: doc.original_filename, // Document entity uses original_filename
        original_filename: doc.original_filename,
        file_size: Number(doc.size_bytes), // Document entity uses size_bytes
        mime_type: doc.mime_type,
        uploaded_at: doc.created_at.toISOString(), // Document entity uses created_at for upload time
        tags: doc.metadata?.tags || [],
        confidential: doc.metadata?.confidential || false,
        privileged: doc.metadata?.privileged || false,
        work_product: doc.metadata?.work_product || false,
        export_path: `documents/${String(index + 1).padStart(3, '0')}_${doc.original_filename}`,
      })),
    };

    // Create ZIP archive with archiver
    this.logger.log(`Creating ZIP archive for matter export with ${documents.length} documents, ${this.formatFileSize(manifest.export.total_size_bytes)}`);

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const matterNumber = matter.id.slice(-8);
    const filename = `matter_export_${matterNumber}_${timestamp}.zip`;

    // Add manifest to archive
    if (options.includeMetadata) {
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
      
      // Add matter metadata file
      const matterInfo = {
        matter: manifest.matter,
        export_summary: {
          total_documents: manifest.export.total_documents,
          total_size: this.formatFileSize(manifest.export.total_size_bytes),
          export_date: manifest.export.generated_at,
          exported_by: manifest.export.generated_by,
        },
        document_summary: documents.map(doc => ({
          filename: doc.original_filename,
          size: this.formatFileSize(Number(doc.size_bytes)),
          type: doc.mime_type,
          uploaded: doc.created_at.toISOString().slice(0, 10),
          confidentiality: this.getConfidentialityLevel(doc),
        })),
      };
      archive.append(JSON.stringify(matterInfo, null, 2), { name: 'matter_info.json' });
    }

    // Add documents to archive
    if (options.includeDocuments) {
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const manifestDoc = manifest.documents[i];
        
        try {
          // Get document from MinIO
          const documentBuffer = await this.minioService.downloadFile(doc.object_key);
          archive.append(documentBuffer, { name: manifestDoc.export_path });
          
          this.logger.debug(`Added document ${doc.original_filename} to archive`);
        } catch (error) {
          this.logger.warn(`Failed to add document ${doc.id} to archive: ${error.message}`);
          // Continue with other documents
        }
      }
    }

    // Add audit trail if requested
    if (options.includeAuditTrail) {
      // TODO: Implement audit trail export
      const auditInfo = {
        note: 'Audit trail export not yet implemented',
        matter_id: matterId,
        export_date: new Date().toISOString(),
      };
      archive.append(JSON.stringify(auditInfo, null, 2), { name: 'audit_trail.json' });
    }

    // Finalize archive
    archive.finalize();

    this.logger.log(`Matter export completed for matter ${matterId} - ${documents.length} documents, ${this.formatFileSize(manifest.export.total_size_bytes)}`);

    return {
      stream: archive,
      filename,
      manifest,
    };
  }

  private getConfidentialityLevel(document: Document): string {
    if (document.metadata?.privileged) return 'privileged';
    if (document.metadata?.work_product) return 'work_product';
    if (document.metadata?.confidential) return 'confidential';
    return 'public';
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}