import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LegalHold, LegalHoldStatus } from '../entities/legal-hold.entity';
import { LegalHoldCustodian, CustodianStatus } from '../entities/legal-hold-custodian.entity';
import { Document } from '../entities/document.entity';
import { User } from '../entities/user.entity';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export interface ComplianceReport {
  legal_hold_id: string;
  legal_hold_name: string;
  compliance_status: 'compliant' | 'non_compliant' | 'at_risk';
  custodian_compliance: {
    total: number;
    acknowledged: number;
    pending: number;
    non_compliant: number;
    compliance_rate: number;
  };
  document_compliance: {
    total_documents: number;
    preserved_documents: number;
    deleted_documents: number;
    at_risk_documents: number;
  };
  last_checked: Date;
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  type: 'custodian_non_acknowledgment' | 'document_deletion' | 'hold_breach' | 'missing_preservation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: Date;
  affected_entity_id: string;
  affected_entity_type: 'custodian' | 'document' | 'user';
}

export interface SystemComplianceMetrics {
  total_active_holds: number;
  compliant_holds: number;
  non_compliant_holds: number;
  at_risk_holds: number;
  overall_compliance_rate: number;
  total_custodians: number;
  acknowledged_custodians: number;
  pending_custodians: number;
  overdue_acknowledgments: number;
  recent_violations: ComplianceViolation[];
}

@Injectable()
export class ComplianceTrackingService {
  private readonly logger = new Logger(ComplianceTrackingService.name);

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

  async generateComplianceReport(legalHoldId: string): Promise<ComplianceReport> {
    const legalHold = await this.legalHoldRepository.findOne({
      where: { id: legalHoldId },
      relations: ['custodians', 'documents'],
    });

    if (!legalHold) {
      throw new Error('Legal hold not found');
    }

    // Get custodian compliance data
    const custodians = await this.custodianRepository.find({
      where: { legal_hold_id: legalHoldId },
      relations: ['custodian'],
    });

    const custodianCompliance = this.calculateCustodianCompliance(custodians);

    // Get document compliance data
    const documents = await this.documentRepository.find({
      where: { legal_hold_ref: legalHoldId },
    });

    const documentCompliance = await this.calculateDocumentCompliance(documents, legalHold);

    // Identify violations
    const violations = await this.identifyViolations(legalHold, custodians, documents);

    // Determine overall compliance status
    const complianceStatus = this.determineComplianceStatus(custodianCompliance, documentCompliance, violations);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, custodianCompliance, documentCompliance);

    return {
      legal_hold_id: legalHoldId,
      legal_hold_name: legalHold.name,
      compliance_status: complianceStatus,
      custodian_compliance: custodianCompliance,
      document_compliance: documentCompliance,
      last_checked: new Date(),
      violations,
      recommendations,
    };
  }

  async getSystemComplianceMetrics(firmId?: string): Promise<SystemComplianceMetrics> {
    const whereCondition = firmId ? { firm_id: firmId, status: 'active' as LegalHoldStatus } : { status: 'active' as LegalHoldStatus };
    
    const activeHolds = await this.legalHoldRepository.find({
      where: whereCondition,
      relations: ['custodians'],
    });

    let compliantHolds = 0;
    let nonCompliantHolds = 0;
    let atRiskHolds = 0;
    let totalCustodians = 0;
    let acknowledgedCustodians = 0;
    let pendingCustodians = 0;
    let overdueAcknowledgments = 0;
    const allViolations: ComplianceViolation[] = [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const hold of activeHolds) {
      const report = await this.generateComplianceReport(hold.id);
      
      switch (report.compliance_status) {
        case 'compliant':
          compliantHolds++;
          break;
        case 'non_compliant':
          nonCompliantHolds++;
          break;
        case 'at_risk':
          atRiskHolds++;
          break;
      }

      totalCustodians += report.custodian_compliance.total;
      acknowledgedCustodians += report.custodian_compliance.acknowledged;
      pendingCustodians += report.custodian_compliance.pending;
      
      // Check for overdue acknowledgments (7+ days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const overdueCustodians = await this.custodianRepository.count({
        where: {
          legal_hold_id: hold.id,
          status: CustodianStatus.PENDING,
          created_at: Between(new Date('2020-01-01'), sevenDaysAgo),
        },
      });
      
      overdueAcknowledgments += overdueCustodians;
      allViolations.push(...report.violations);
    }

    const recentViolations = allViolations.filter(v => v.detected_at >= thirtyDaysAgo);

    return {
      total_active_holds: activeHolds.length,
      compliant_holds: compliantHolds,
      non_compliant_holds: nonCompliantHolds,
      at_risk_holds: atRiskHolds,
      overall_compliance_rate: activeHolds.length > 0 ? (compliantHolds / activeHolds.length) * 100 : 100,
      total_custodians: totalCustodians,
      acknowledged_custodians: acknowledgedCustodians,
      pending_custodians: pendingCustodians,
      overdue_acknowledgments: overdueAcknowledgments,
      recent_violations: recentViolations,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async performDailyComplianceCheck(): Promise<void> {
    this.logger.log('Starting daily compliance check');

    try {
      const activeHolds = await this.legalHoldRepository.find({
        where: { status: 'active' as LegalHoldStatus },
      });

      let totalViolations = 0;
      const criticalViolations: ComplianceViolation[] = [];

      for (const hold of activeHolds) {
        const report = await this.generateComplianceReport(hold.id);
        
        const newViolations = report.violations.filter(v => 
          v.detected_at >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        );

        totalViolations += newViolations.length;
        
        const critical = newViolations.filter(v => v.severity === 'critical');
        criticalViolations.push(...critical);

        // Update compliance status in database if needed
        await this.updateHoldComplianceStatus(hold.id, report.compliance_status);
      }

      // Send alerts for critical violations
      if (criticalViolations.length > 0) {
        await this.sendComplianceAlert(criticalViolations);
      }

      this.logger.log(`Daily compliance check completed. Found ${totalViolations} violations, ${criticalViolations.length} critical`);

    } catch (error) {
      this.logger.error('Error during daily compliance check', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async sendWeeklyComplianceReport(): Promise<void> {
    this.logger.log('Generating weekly compliance report');

    try {
      const metrics = await this.getSystemComplianceMetrics();
      
      // In a real implementation, this would send an email report
      this.logger.log('Weekly compliance report generated', {
        overall_compliance_rate: metrics.overall_compliance_rate,
        total_active_holds: metrics.total_active_holds,
        recent_violations: metrics.recent_violations.length,
      });

    } catch (error) {
      this.logger.error('Error generating weekly compliance report', error);
    }
  }

  private calculateCustodianCompliance(custodians: LegalHoldCustodian[]) {
    const total = custodians.length;
    const acknowledged = custodians.filter(c => c.status === CustodianStatus.ACKNOWLEDGED).length;
    const pending = custodians.filter(c => c.status === CustodianStatus.PENDING).length;
    const nonCompliant = custodians.filter(c => c.status === CustodianStatus.NON_COMPLIANT).length;

    return {
      total,
      acknowledged,
      pending,
      non_compliant: nonCompliant,
      compliance_rate: total > 0 ? (acknowledged / total) * 100 : 100,
    };
  }

  private async calculateDocumentCompliance(documents: Document[], legalHold: LegalHold) {
    const totalDocuments = documents.length;
    const preservedDocuments = documents.filter(d => !d.is_deleted).length;
    const deletedDocuments = documents.filter(d => d.is_deleted).length;
    
    // Check for documents at risk (modified after hold was placed)
    const atRiskDocuments = documents.filter(d => 
      d.updated_at > legalHold.created_at && !d.is_deleted
    ).length;

    return {
      total_documents: totalDocuments,
      preserved_documents: preservedDocuments,
      deleted_documents: deletedDocuments,
      at_risk_documents: atRiskDocuments,
    };
  }

  private async identifyViolations(
    legalHold: LegalHold,
    custodians: LegalHoldCustodian[],
    documents: Document[]
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const now = new Date();

    // Check for custodian acknowledgment violations (7+ days without acknowledgment)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const overdueAcknowledgments = custodians.filter(c => 
      c.status === CustodianStatus.PENDING && c.created_at < sevenDaysAgo
    );

    for (const custodian of overdueAcknowledgments) {
      violations.push({
        type: 'custodian_non_acknowledgment',
        severity: 'medium',
        description: `Custodian has not acknowledged legal hold for ${Math.floor((now.getTime() - custodian.created_at.getTime()) / (24 * 60 * 60 * 1000))} days`,
        detected_at: now,
        affected_entity_id: custodian.custodian_id,
        affected_entity_type: 'custodian',
      });
    }

    // Check for document deletion violations
    const deletedDocuments = documents.filter(d => 
      d.is_deleted && d.deleted_at && d.deleted_at > legalHold.created_at
    );

    for (const doc of deletedDocuments) {
      violations.push({
        type: 'document_deletion',
        severity: 'critical',
        description: `Document was deleted after legal hold was placed`,
        detected_at: doc.deleted_at!,
        affected_entity_id: doc.id,
        affected_entity_type: 'document',
      });
    }

    // Check for hold breach (documents modified after hold)
    const modifiedDocuments = documents.filter(d => 
      d.updated_at > legalHold.created_at && !d.is_deleted
    );

    for (const doc of modifiedDocuments) {
      violations.push({
        type: 'hold_breach',
        severity: 'high',
        description: `Document was modified after legal hold was placed`,
        detected_at: doc.updated_at,
        affected_entity_id: doc.id,
        affected_entity_type: 'document',
      });
    }

    return violations;
  }

  private determineComplianceStatus(
    custodianCompliance: any,
    documentCompliance: any,
    violations: ComplianceViolation[]
  ): 'compliant' | 'non_compliant' | 'at_risk' {
    const criticalViolations = violations.filter(v => v.severity === 'critical');
    const highViolations = violations.filter(v => v.severity === 'high');

    if (criticalViolations.length > 0) {
      return 'non_compliant';
    }

    if (highViolations.length > 0 || custodianCompliance.compliance_rate < 80) {
      return 'at_risk';
    }

    if (custodianCompliance.compliance_rate >= 95 && documentCompliance.deleted_documents === 0) {
      return 'compliant';
    }

    return 'at_risk';
  }

  private generateRecommendations(
    violations: ComplianceViolation[],
    custodianCompliance: any,
    documentCompliance: any
  ): string[] {
    const recommendations: string[] = [];

    if (custodianCompliance.pending > 0) {
      recommendations.push(`Send reminders to ${custodianCompliance.pending} pending custodians`);
    }

    if (custodianCompliance.compliance_rate < 90) {
      recommendations.push('Escalate non-compliant custodians to management');
    }

    if (documentCompliance.deleted_documents > 0) {
      recommendations.push('Investigate document deletions and attempt recovery');
    }

    if (documentCompliance.at_risk_documents > 0) {
      recommendations.push('Review and verify document modifications are legitimate');
    }

    const criticalViolations = violations.filter(v => v.severity === 'critical');
    if (criticalViolations.length > 0) {
      recommendations.push('Immediately address critical compliance violations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Legal hold compliance is satisfactory');
    }

    return recommendations;
  }

  private async updateHoldComplianceStatus(holdId: string, status: string): Promise<void> {
    // This could update a compliance_status field if we add it to the LegalHold entity
    // For now, we'll just log it
    this.logger.debug(`Legal hold ${holdId} compliance status: ${status}`);
  }

  private async sendComplianceAlert(violations: ComplianceViolation[]): Promise<void> {
    // In a real implementation, this would send alerts to legal team
    this.logger.warn(`Critical compliance violations detected`, {
      count: violations.length,
      violations: violations.map(v => ({
        type: v.type,
        severity: v.severity,
        entity: v.affected_entity_id,
      })),
    });
  }
}