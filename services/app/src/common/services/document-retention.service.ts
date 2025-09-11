import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Document, RetentionClass } from '../entities';
import { MinioService } from './minio.service';

export interface RetentionPolicyResult {
  documentsEvaluated: number;
  documentsEligibleForDeletion: number;
  documentsDeleted: number;
  documentsSkipped: number;
  errors: string[];
}

@Injectable()
export class DocumentRetentionService {
  private readonly logger = new Logger(DocumentRetentionService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(RetentionClass)
    private retentionClassRepository: Repository<RetentionClass>,
    private minioService: MinioService,
  ) {}

  /**
   * Evaluates documents for retention policy compliance and deletion
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async enforceRetentionPolicies(): Promise<RetentionPolicyResult> {
    this.logger.log('Starting document retention policy enforcement');

    const result: RetentionPolicyResult = {
      documentsEvaluated: 0,
      documentsEligibleForDeletion: 0,
      documentsDeleted: 0,
      documentsSkipped: 0,
      errors: [],
    };

    try {
      // Get all retention classes
      const retentionClasses = await this.retentionClassRepository.find();
      
      for (const retentionClass of retentionClasses) {
        if (retentionClass.retention_years > 0) {
          await this.processRetentionClass(retentionClass, result);
        }
      }

      // Process documents without retention classes (use default 7 years)
      await this.processDocumentsWithoutRetentionClass(result);

      this.logger.log('Document retention policy enforcement completed', {
        documentsEvaluated: result.documentsEvaluated,
        documentsEligibleForDeletion: result.documentsEligibleForDeletion,
        documentsDeleted: result.documentsDeleted,
        documentsSkipped: result.documentsSkipped,
        errorCount: result.errors.length,
      });

    } catch (error) {
      this.logger.error('Error during retention policy enforcement:', error);
      result.errors.push(`General error: ${error.message}`);
    }

    return result;
  }

  private async processRetentionClass(
    retentionClass: RetentionClass,
    result: RetentionPolicyResult,
  ): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionClass.retention_years);

    this.logger.debug(`Processing retention class: ${retentionClass.name} (${retentionClass.retention_years} years)`);

    const documents = await this.documentRepository.find({
      where: {
        retention_class_id: retentionClass.id,
        created_at: LessThan(cutoffDate),
        is_deleted: false,
        legal_hold: false, // Never delete documents under legal hold
      },
      relations: ['metadata'],
    });

    result.documentsEvaluated += documents.length;

    for (const document of documents) {
      try {
        // Additional business rules
        if (await this.shouldSkipDeletion(document)) {
          result.documentsSkipped++;
          continue;
        }

        result.documentsEligibleForDeletion++;

        if (retentionClass.auto_delete) {
          await this.softDeleteDocument(document);
          result.documentsDeleted++;
          
          this.logger.log(`Document ${document.id} soft-deleted due to retention policy`, {
            retentionClass: retentionClass.name,
            documentAge: Math.floor((Date.now() - document.created_at.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
            filename: document.original_filename,
          });
        }
      } catch (error) {
        this.logger.error(`Error processing document ${document.id}:`, error);
        result.errors.push(`Document ${document.id}: ${error.message}`);
      }
    }
  }

  private async processDocumentsWithoutRetentionClass(
    result: RetentionPolicyResult,
  ): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // Default 7 years

    const documents = await this.documentRepository.find({
      where: {
        retention_class_id: IsNull(),
        created_at: LessThan(cutoffDate),
        is_deleted: false,
        legal_hold: false,
      },
    });

    result.documentsEvaluated += documents.length;

    for (const document of documents) {
      try {
        if (await this.shouldSkipDeletion(document)) {
          result.documentsSkipped++;
          continue;
        }

        result.documentsEligibleForDeletion++;
        // Don't auto-delete documents without retention class - just mark as eligible
        
        this.logger.warn(`Document ${document.id} eligible for deletion but no retention class assigned`, {
          documentAge: Math.floor((Date.now() - document.created_at.getTime()) / (365.25 * 24 * 60 * 60 * 1000)),
          filename: document.original_filename,
        });
      } catch (error) {
        this.logger.error(`Error processing document ${document.id}:`, error);
        result.errors.push(`Document ${document.id}: ${error.message}`);
      }
    }
  }

  /**
   * Additional business rules for skipping deletion
   */
  private async shouldSkipDeletion(document: Document): Promise<boolean> {
    // Skip if document has been accessed recently (within last 30 days)
    // This would require an access log table - for now we'll skip this check
    
    // Skip if document is marked as privileged or work product
    if (document.metadata?.privileged || document.metadata?.work_product) {
      return true;
    }

    // Skip if document is part of an active matter
    if (document.matter && document.matter.status === 'active') {
      return true;
    }

    return false;
  }

  /**
   * Soft delete a document (mark as deleted but keep file)
   */
  private async softDeleteDocument(document: Document): Promise<void> {
    await this.documentRepository.update(document.id, {
      is_deleted: true,
      deleted_at: new Date(),
    });
  }

  /**
   * Hard delete a document (remove from storage and database)
   * This should only be called for documents that have been soft-deleted for a period
   */
  async hardDeleteDocument(documentId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    if (!document.is_deleted) {
      throw new Error(`Document ${documentId} is not soft-deleted`);
    }

    if (document.legal_hold) {
      throw new Error(`Cannot hard delete document ${documentId} - under legal hold`);
    }

    // Delete from MinIO
    try {
      await this.minioService.deleteFile(document.object_key);
    } catch (error) {
      this.logger.warn(`Failed to delete file from MinIO: ${document.object_key}`, error);
    }

    // Delete from database
    await this.documentRepository.delete(documentId);

    this.logger.log(`Document ${documentId} hard-deleted`, {
      filename: document.original_filename,
      objectKey: document.object_key,
    });
  }

  /**
   * Clean up soft-deleted documents older than specified days
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupSoftDeletedDocuments(daysOld: number = 30): Promise<number> {
    this.logger.log(`Starting cleanup of soft-deleted documents older than ${daysOld} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const documentsToHardDelete = await this.documentRepository.find({
      where: {
        is_deleted: true,
        deleted_at: LessThan(cutoffDate),
        legal_hold: false,
      },
    });

    let deletedCount = 0;

    for (const document of documentsToHardDelete) {
      try {
        await this.hardDeleteDocument(document.id);
        deletedCount++;
      } catch (error) {
        this.logger.error(`Failed to hard delete document ${document.id}:`, error);
      }
    }

    this.logger.log(`Cleanup completed: ${deletedCount} documents hard-deleted`);
    return deletedCount;
  }

  /**
   * Get documents eligible for deletion based on retention policies
   */
  async getDocumentsEligibleForDeletion(firmId?: string): Promise<Document[]> {
    const queryBuilder = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.retention_class', 'retention_class')
      .leftJoinAndSelect('document.metadata', 'metadata')
      .leftJoinAndSelect('document.matter', 'matter')
      .where('document.is_deleted = false')
      .andWhere('document.legal_hold = false');

    if (firmId) {
      queryBuilder.andWhere('document.firm_id = :firmId', { firmId });
    }

    // Documents with retention classes
    queryBuilder.andWhere(
      `(
        (retention_class.retention_years > 0 AND 
         document.created_at < (CURRENT_DATE - INTERVAL '1 year' * retention_class.retention_years))
        OR
        (document.retention_class_id IS NULL AND 
         document.created_at < (CURRENT_DATE - INTERVAL '7 years'))
      )`
    );

    return queryBuilder.getMany();
  }

  /**
   * Bulk apply legal hold to documents
   */
  async bulkApplyLegalHold(
    documentIds: string[],
    reason: string,
    userId: string,
  ): Promise<{ applied: number; errors: string[] }> {
    const result = { applied: 0, errors: [] };

    for (const documentId of documentIds) {
      try {
        await this.documentRepository.update(documentId, {
          legal_hold: true,
          legal_hold_reason: reason,
          legal_hold_set_by: userId,
          legal_hold_set_at: new Date(),
        });
        result.applied++;
      } catch (error) {
        result.errors.push(`Document ${documentId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk legal hold applied to ${result.applied} documents`, {
      reason,
      userId,
      errorCount: result.errors.length,
    });

    return result;
  }

  /**
   * Bulk remove legal hold from documents
   */
  async bulkRemoveLegalHold(
    documentIds: string[],
    userId: string,
  ): Promise<{ removed: number; errors: string[] }> {
    const result = { removed: 0, errors: [] };

    for (const documentId of documentIds) {
      try {
        await this.documentRepository.update(documentId, {
          legal_hold: false,
          legal_hold_reason: null,
          legal_hold_set_by: null,
          legal_hold_set_at: null,
        });
        result.removed++;
      } catch (error) {
        result.errors.push(`Document ${documentId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk legal hold removed from ${result.removed} documents`, {
      userId,
      errorCount: result.errors.length,
    });

    return result;
  }
}