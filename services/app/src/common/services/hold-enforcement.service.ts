import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LegalHold, LegalHoldStatus } from '../entities/legal-hold.entity';
import { LegalHoldCustodian, CustodianStatus } from '../entities/legal-hold-custodian.entity';
import { Document } from '../entities/document.entity';
import { User } from '../entities/user.entity';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: 'document_upload' | 'document_modification' | 'hold_creation' | 'schedule';
  conditions: {
    keywords?: string[];
    file_types?: string[];
    custodian_ids?: string[];
    matter_ids?: string[];
    client_ids?: string[];
    size_threshold?: number;
  };
  actions: {
    apply_hold?: boolean;
    notify_custodians?: boolean;
    alert_legal_team?: boolean;
    prevent_deletion?: boolean;
    escalate?: boolean;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EnforcementResult {
  success: boolean;
  actions_taken: string[];
  documents_affected: number;
  custodians_notified: number;
  errors: string[];
}

@Injectable()
export class HoldEnforcementService {
  private readonly logger = new Logger(HoldEnforcementService.name);

  constructor(
    @InjectRepository(LegalHold)
    private readonly legalHoldRepository: Repository<LegalHold>,
    @InjectRepository(LegalHoldCustodian)
    private readonly custodianRepository: Repository<LegalHoldCustodian>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  // Automatically apply legal holds to new documents that match criteria
  async enforceHoldsOnDocument(documentId: string): Promise<EnforcementResult> {
    this.logger.debug(`Enforcing legal holds on document ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['matter', 'firm'],
    });

    if (!document) {
      return {
        success: false,
        actions_taken: [],
        documents_affected: 0,
        custodians_notified: 0,
        errors: ['Document not found'],
      };
    }

    if (document.legal_hold) {
      return {
        success: true,
        actions_taken: ['Document already under legal hold'],
        documents_affected: 0,
        custodians_notified: 0,
        errors: [],
      };
    }

    const applicableHolds = await this.findApplicableHolds(document);
    const actionsTaken: string[] = [];
    let custodianNotifications = 0;
    const errors: string[] = [];

    for (const hold of applicableHolds) {
      try {
        await this.applyHoldToDocument(document, hold);
        actionsTaken.push(`Applied legal hold: ${hold.name}`);

        // Notify relevant custodians about the new document under hold
        const holdCustodians = await this.custodianRepository.find({
          where: { legal_hold_id: hold.id },
          relations: ['custodian', 'legal_hold'],
        });

        if (holdCustodians.length > 0) {
          await this.notifyNewDocumentUnderHold(holdCustodians, document);
          custodianNotifications += holdCustodians.length;
          actionsTaken.push(`Notified ${holdCustodians.length} custodians`);
        }

      } catch (error) {
        this.logger.error(`Failed to apply hold ${hold.id} to document ${documentId}`, error);
        errors.push(`Failed to apply hold ${hold.name}: ${error.message}`);
      }
    }

    await this.auditService.log({
      user: { sub: 'system', email: 'system', roles: ['system'] } as any,
      action: 'automated_hold_enforcement',
      resource_type: 'document',
      resource_id: documentId,
      details: {
        applicable_holds: applicableHolds.length,
        actions_taken: actionsTaken,
        errors,
      },
      ip_address: '127.0.0.1',
    });

    return {
      success: errors.length === 0,
      actions_taken: actionsTaken,
      documents_affected: applicableHolds.length > 0 ? 1 : 0,
      custodians_notified: custodianNotifications,
      errors,
    };
  }

  // Check for document modifications that might violate legal holds
  async checkDocumentModificationCompliance(documentId: string): Promise<EnforcementResult> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['legal_hold_reference'],
    });

    if (!document || !document.legal_hold) {
      return {
        success: true,
        actions_taken: ['Document not under legal hold'],
        documents_affected: 0,
        custodians_notified: 0,
        errors: [],
      };
    }

    const hold = document.legal_hold_reference;
    if (!hold || hold.status !== 'active') {
      return {
        success: true,
        actions_taken: ['Legal hold not active'],
        documents_affected: 0,
        custodians_notified: 0,
        errors: [],
      };
    }

    const actionsTaken: string[] = [];
    let custodianNotifications = 0;

    // Log potential violation
    await this.auditService.log({
      user: { sub: 'system', email: 'system', roles: ['system'] } as any,
      action: 'potential_hold_violation',
      resource_type: 'document',
      resource_id: documentId,
      details: {
        legal_hold_id: hold.id,
        legal_hold_name: hold.name,
        modification_time: new Date(),
        document_filename: document.original_filename,
      },
      ip_address: '127.0.0.1',
    });

    actionsTaken.push('Logged potential hold violation');

    // Notify legal team about the modification
    const legalTeamUsers = await this.userRepository.find({
      where: {
        firm_id: document.firm_id,
        roles: Like('%legal%'),
        is_active: true,
      },
    });

    if (legalTeamUsers.length > 0) {
      await this.notifyLegalTeamOfModification(legalTeamUsers, document, hold);
      custodianNotifications += legalTeamUsers.length;
      actionsTaken.push(`Notified ${legalTeamUsers.length} legal team members`);
    }

    return {
      success: true,
      actions_taken: actionsTaken,
      documents_affected: 1,
      custodians_notified: custodianNotifications,
      errors: [],
    };
  }

  // Prevent deletion of documents under legal hold
  async preventDocumentDeletion(documentId: string): Promise<{ allowed: boolean; reason?: string }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['legal_hold_reference'],
    });

    if (!document) {
      return { allowed: false, reason: 'Document not found' };
    }

    if (!document.legal_hold) {
      return { allowed: true };
    }

    const hold = document.legal_hold_reference;
    if (!hold || hold.status !== 'active') {
      return { allowed: true };
    }

    // Log attempted deletion
    await this.auditService.log({
      user: { sub: 'system', email: 'system', roles: ['system'] } as any,
      action: 'blocked_document_deletion',
      resource_type: 'document',
      resource_id: documentId,
      details: {
        legal_hold_id: hold.id,
        legal_hold_name: hold.name,
        attempted_deletion_time: new Date(),
        document_filename: document.original_filename,
      },
      ip_address: '127.0.0.1',
    });

    return {
      allowed: false,
      reason: `Document is under active legal hold: ${hold.name}. Deletion is not permitted.`,
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async performAutomatedEnforcementCheck(): Promise<void> {
    this.logger.log('Starting automated enforcement check');

    try {
      // Check for new documents that should be under hold
      await this.checkNewDocumentsForHolds();

      // Check for expired holds that should be released
      await this.checkExpiredHolds();

      // Send overdue acknowledgment reminders
      await this.sendOverdueReminders();

    } catch (error) {
      this.logger.error('Error during automated enforcement check', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async performDailyEnforcementTasks(): Promise<void> {
    this.logger.log('Starting daily enforcement tasks');

    try {
      // Clean up released holds
      await this.cleanupReleasedHolds();

      // Generate enforcement metrics
      await this.generateEnforcementMetrics();

    } catch (error) {
      this.logger.error('Error during daily enforcement tasks', error);
    }
  }

  private async findApplicableHolds(document: Document): Promise<LegalHold[]> {
    const activeHolds = await this.legalHoldRepository.find({
      where: {
        status: 'active' as LegalHoldStatus,
        firm_id: document.firm_id,
        auto_apply_to_new_documents: true,
      },
    });

    const applicableHolds: LegalHold[] = [];

    for (const hold of activeHolds) {
      if (await this.doesDocumentMatchHoldCriteria(document, hold)) {
        applicableHolds.push(hold);
      }
    }

    return applicableHolds;
  }

  private async doesDocumentMatchHoldCriteria(document: Document, hold: LegalHold): Promise<boolean> {
    if (!hold.search_criteria) {
      return false;
    }

    const { keywords, date_range, document_types, matters } = hold.search_criteria;

    // Check matter match
    if (matters && matters.length > 0 && document.matter_id) {
      if (!matters.includes(document.matter_id)) {
        return false;
      }
    }

    // Check document type match
    if (document_types && document_types.length > 0) {
      const fileExtension = document.original_filename?.split('.').pop()?.toLowerCase();
      if (!fileExtension || !document_types.includes(fileExtension)) {
        return false;
      }
    }

    // Check keyword match in filename
    if (keywords && keywords.length > 0) {
      const filename = document.original_filename?.toLowerCase() || '';
      const hasMatchingKeyword = keywords.some(keyword => 
        filename.includes(keyword.toLowerCase())
      );
      if (!hasMatchingKeyword) {
        return false;
      }
    }

    // Check date range
    if (date_range) {
      if (date_range.start && document.created_at < new Date(date_range.start)) {
        return false;
      }
      if (date_range.end && document.created_at > new Date(date_range.end)) {
        return false;
      }
    }

    return true;
  }

  private async applyHoldToDocument(document: Document, hold: LegalHold): Promise<void> {
    await this.documentRepository.update(document.id, {
      legal_hold: true,
      legal_hold_reason: hold.reason,
      legal_hold_set_by: 'system',
      legal_hold_set_at: new Date(),
      legal_hold_ref: hold.id,
    });

    // Update hold document count
    await this.legalHoldRepository.update(hold.id, {
      documents_count: hold.documents_count + 1,
    });
  }

  private async notifyNewDocumentUnderHold(
    custodians: LegalHoldCustodian[],
    document: Document,
  ): Promise<void> {
    // In a real implementation, this would send notifications about new documents under hold
    this.logger.log(`New document ${document.original_filename} placed under hold, notifying ${custodians.length} custodians`);
  }

  private async notifyLegalTeamOfModification(
    legalTeam: User[],
    document: Document,
    hold: LegalHold,
  ): Promise<void> {
    // In a real implementation, this would send alerts to legal team about document modifications
    this.logger.warn(`Document under hold modified: ${document.original_filename} (Hold: ${hold.name})`);
  }

  private async checkNewDocumentsForHolds(): Promise<void> {
    const recentDocuments = await this.documentRepository.find({
      where: {
        legal_hold: false,
        created_at: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      },
      take: 100,
    });

    let processed = 0;
    for (const document of recentDocuments) {
      await this.enforceHoldsOnDocument(document.id);
      processed++;
    }

    if (processed > 0) {
      this.logger.log(`Processed ${processed} new documents for legal hold enforcement`);
    }
  }

  private async checkExpiredHolds(): Promise<void> {
    const expiredHolds = await this.legalHoldRepository.find({
      where: {
        status: 'active' as LegalHoldStatus,
        expiry_date: new Date(),
      },
    });

    for (const hold of expiredHolds) {
      await this.legalHoldRepository.update(hold.id, {
        status: 'expired' as LegalHoldStatus,
      });

      this.logger.log(`Legal hold expired: ${hold.name}`);
    }
  }

  private async sendOverdueReminders(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const overdueCustodians = await this.custodianRepository.find({
      where: {
        status: CustodianStatus.PENDING,
        created_at: sevenDaysAgo,
      },
      relations: ['custodian', 'legal_hold'],
    });

    if (overdueCustodians.length > 0) {
      for (const custodian of overdueCustodians) {
        await this.notificationService.sendComplianceReminder(custodian as any);
      }

      this.logger.log(`Sent overdue reminders to ${overdueCustodians.length} custodians`);
    }
  }

  private async cleanupReleasedHolds(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const oldReleasedHolds = await this.legalHoldRepository.find({
      where: {
        status: 'released' as LegalHoldStatus,
        released_at: thirtyDaysAgo,
      },
    });

    // Archive or perform cleanup actions on old released holds
    this.logger.log(`Found ${oldReleasedHolds.length} old released holds for potential cleanup`);
  }

  private async generateEnforcementMetrics(): Promise<void> {
    const metrics = {
      active_holds: await this.legalHoldRepository.count({ where: { status: 'active' as LegalHoldStatus } }),
      documents_under_hold: await this.documentRepository.count({ where: { legal_hold: true } }),
      pending_custodians: await this.custodianRepository.count({ where: { status: CustodianStatus.PENDING } }),
    };

    this.logger.log('Daily enforcement metrics', metrics);
  }
}