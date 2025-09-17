import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities';
import { UserInfo } from '../../auth/auth.service';

export interface AuditContext {
  user: UserInfo;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  outcome?: 'success' | 'failure' | 'partial';
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(context: AuditContext): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        user_id: context.user.sub,
        firm_id: context.user.firm_id,
        action: context.action,
        resource_type: context.resource_type,
        resource_id: context.resource_id,
        details: context.details || {},
        ip_address: context.ip_address,
        user_agent: context.user_agent,
        risk_level: context.risk_level || 'low',
        outcome: context.outcome || 'success',
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);

      // Log high-risk activities to application logs as well
      if (context.risk_level === 'high' || context.risk_level === 'critical') {
        this.logger.warn(`High-risk activity: ${context.action} on ${context.resource_type}:${context.resource_id}`, {
          userId: context.user.sub,
          userEmail: context.user.email,
          firmId: context.user.firm_id,
          details: context.details,
          riskLevel: context.risk_level,
          ipAddress: context.ip_address,
        });
      }
    } catch (error) {
      this.logger.error('Failed to log audit event', error, {
        action: context.action,
        resourceType: context.resource_type,
        resourceId: context.resource_id,
        userId: context.user.sub,
      });
    }
  }

  // Authentication & Authorization Events
  async logLogin(user: UserInfo, ip_address?: string, user_agent?: string): Promise<void> {
    await this.log({
      user,
      action: 'login',
      resource_type: 'authentication',
      resource_id: user.sub,
      details: { login_method: 'keycloak_sso' },
      ip_address,
      user_agent,
      risk_level: 'low',
      outcome: 'success',
    });
  }

  async logLogout(user: UserInfo, ip_address?: string): Promise<void> {
    await this.log({
      user,
      action: 'logout',
      resource_type: 'authentication',
      resource_id: user.sub,
      ip_address,
      risk_level: 'low',
      outcome: 'success',
    });
  }

  async logFailedLogin(email: string, ip_address?: string, reason?: string): Promise<void> {
    // Create a minimal user context for failed logins
    const user: UserInfo = {
      sub: 'unknown',
      email,
      preferred_username: email,
      roles: [],
    };

    await this.log({
      user,
      action: 'login_failed',
      resource_type: 'authentication',
      resource_id: email,
      details: { reason },
      ip_address,
      risk_level: 'medium',
      outcome: 'failure',
    });
  }

  async logUnauthorizedAccess(user: UserInfo, resource_type: string, resource_id: string | null, attempted_action: string, ip_address?: string): Promise<void> {
    await this.log({
      user,
      action: 'unauthorized_access',
      resource_type,
      resource_id,
      details: { attempted_action },
      ip_address,
      risk_level: 'high',
      outcome: 'failure',
    });
  }

  // Document Events
  async logDocumentUpload(user: UserInfo, documentId: string, filename: string, size: number, matterId: string): Promise<void> {
    await this.log({
      user,
      action: 'document_upload',
      resource_type: 'document',
      resource_id: documentId,
      details: {
        filename,
        size_bytes: size,
        matter_id: matterId,
      },
      risk_level: 'low',
    });
  }

  async logDocumentDownload(user: UserInfo, documentId: string, filename: string): Promise<void> {
    await this.log({
      user,
      action: 'document_download',
      resource_type: 'document',
      resource_id: documentId,
      details: { filename },
      risk_level: 'low',
    });
  }

  async logDocumentView(user: UserInfo, documentId: string, filename: string): Promise<void> {
    await this.log({
      user,
      action: 'document_view',
      resource_type: 'document',
      resource_id: documentId,
      details: { filename },
      risk_level: 'low',
    });
  }

  async logDocumentDelete(user: UserInfo, documentId: string, filename: string, permanent: boolean = false): Promise<void> {
    await this.log({
      user,
      action: permanent ? 'document_hard_delete' : 'document_soft_delete',
      resource_type: 'document',
      resource_id: documentId,
      details: { filename, permanent },
      risk_level: permanent ? 'high' : 'medium',
    });
  }

  async logLegalHoldSet(user: UserInfo, documentId: string, reason: string): Promise<void> {
    await this.log({
      user,
      action: 'legal_hold_set',
      resource_type: 'document',
      resource_id: documentId,
      details: { reason },
      risk_level: 'high',
    });
  }

  async logLegalHoldRemoved(user: UserInfo, documentId: string): Promise<void> {
    await this.log({
      user,
      action: 'legal_hold_removed',
      resource_type: 'document',
      resource_id: documentId,
      risk_level: 'high',
    });
  }

  async logBulkLegalHoldOperation(user: UserInfo, documentIds: string[], action: 'apply' | 'remove', reason?: string): Promise<void> {
    await this.log({
      user,
      action: `bulk_legal_hold_${action}`,
      resource_type: 'document',
      resource_id: 'bulk',
      details: {
        document_count: documentIds.length,
        document_ids: documentIds,
        reason,
      },
      risk_level: 'critical',
    });
  }

  // User Management Events
  async logUserCreated(admin: UserInfo, newUserId: string, newUserEmail: string, roles: string[]): Promise<void> {
    await this.log({
      user: admin,
      action: 'user_created',
      resource_type: 'user',
      resource_id: newUserId,
      details: {
        email: newUserEmail,
        roles,
      },
      risk_level: 'medium',
    });
  }

  async logUserUpdated(admin: UserInfo, targetUserId: string, targetUserEmail: string, changes: Record<string, any>): Promise<void> {
    await this.log({
      user: admin,
      action: 'user_updated',
      resource_type: 'user',
      resource_id: targetUserId,
      details: {
        email: targetUserEmail,
        changes,
      },
      risk_level: 'medium',
    });
  }

  async logUserRoleChanged(admin: UserInfo, targetUserId: string, targetUserEmail: string, oldRoles: string[], newRoles: string[]): Promise<void> {
    await this.log({
      user: admin,
      action: 'user_role_changed',
      resource_type: 'user',
      resource_id: targetUserId,
      details: {
        email: targetUserEmail,
        old_roles: oldRoles,
        new_roles: newRoles,
      },
      risk_level: 'high',
    });
  }

  async logUserDeactivated(admin: UserInfo, targetUserId: string, targetUserEmail: string): Promise<void> {
    await this.log({
      user: admin,
      action: 'user_deactivated',
      resource_type: 'user',
      resource_id: targetUserId,
      details: {
        email: targetUserEmail,
      },
      risk_level: 'medium',
    });
  }

  async logUserActivated(admin: UserInfo, targetUserId: string, targetUserEmail: string): Promise<void> {
    await this.log({
      user: admin,
      action: 'user_activated',
      resource_type: 'user',
      resource_id: targetUserId,
      details: {
        email: targetUserEmail,
      },
      risk_level: 'medium',
    });
  }

  // Client & Matter Events
  async logClientCreated(user: UserInfo, clientId: string, clientName: string): Promise<void> {
    await this.log({
      user,
      action: 'client_created',
      resource_type: 'client',
      resource_id: clientId,
      details: { name: clientName },
      risk_level: 'low',
    });
  }

  async logClientUpdated(user: UserInfo, clientId: string, clientName: string, changes: Record<string, any>): Promise<void> {
    await this.log({
      user,
      action: 'client_updated',
      resource_type: 'client',
      resource_id: clientId,
      details: {
        name: clientName,
        changes,
      },
      risk_level: 'low',
    });
  }

  async logMatterCreated(user: UserInfo, matterId: string, matterTitle: string, clientId: string): Promise<void> {
    await this.log({
      user,
      action: 'matter_created',
      resource_type: 'matter',
      resource_id: matterId,
      details: {
        title: matterTitle,
        client_id: clientId,
      },
      risk_level: 'low',
    });
  }

  async logMatterUpdated(user: UserInfo, matterId: string, matterTitle: string, changes: Record<string, any>): Promise<void> {
    await this.log({
      user,
      action: 'matter_updated',
      resource_type: 'matter',
      resource_id: matterId,
      details: {
        title: matterTitle,
        changes,
      },
      risk_level: 'low',
    });
  }

  // Retention & Compliance Events
  async logRetentionPolicyEnforced(user: UserInfo, stats: any): Promise<void> {
    await this.log({
      user,
      action: 'retention_policy_enforced',
      resource_type: 'system',
      resource_id: 'retention',
      details: stats,
      risk_level: 'medium',
    });
  }

  async logRetentionClassCreated(user: UserInfo, retentionClassId: string, name: string, retentionYears: number): Promise<void> {
    await this.log({
      user,
      action: 'retention_class_created',
      resource_type: 'retention_class',
      resource_id: retentionClassId,
      details: {
        name,
        retention_years: retentionYears,
      },
      risk_level: 'low',
    });
  }

  async logRetentionClassUpdated(user: UserInfo, retentionClassId: string, name: string, changes: Record<string, any>): Promise<void> {
    await this.log({
      user,
      action: 'retention_class_updated',
      resource_type: 'retention_class',
      resource_id: retentionClassId,
      details: {
        name,
        changes,
      },
      risk_level: 'low',
    });
  }

  async logRetentionClassDeleted(user: UserInfo, retentionClassId: string, name: string): Promise<void> {
    await this.log({
      user,
      action: 'retention_class_deleted',
      resource_type: 'retention_class',
      resource_id: retentionClassId,
      details: { name },
      risk_level: 'medium',
    });
  }

  // Search Events
  async logSearch(user: UserInfo, query: string, resultCount: number, resourceTypes: string[]): Promise<void> {
    await this.log({
      user,
      action: 'search',
      resource_type: 'system',
      resource_id: 'search',
      details: {
        query,
        result_count: resultCount,
        resource_types: resourceTypes,
      },
      risk_level: 'low',
    });
  }

  // System Events
  async logSystemConfigChange(user: UserInfo, configType: string, details: Record<string, any>): Promise<void> {
    await this.log({
      user,
      action: 'system_config_change',
      resource_type: 'system',
      resource_id: configType,
      details,
      risk_level: 'high',
    });
  }

  async logDataExport(user: UserInfo, exportType: string, recordCount: number, filters?: Record<string, any>): Promise<void> {
    await this.log({
      user,
      action: 'data_export',
      resource_type: 'system',
      resource_id: exportType,
      details: {
        record_count: recordCount,
        filters,
      },
      risk_level: 'medium',
    });
  }

  // Query audit logs with filters
  async queryAuditLogs(filters: {
    firmId?: string;
    userId?: string;
    resourceType?: string;
    action?: string;
    riskLevel?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC');

    if (filters.firmId) {
      queryBuilder.andWhere('audit.firm_id = :firmId', { firmId: filters.firmId });
    }

    if (filters.userId) {
      queryBuilder.andWhere('audit.user_id = :userId', { userId: filters.userId });
    }

    if (filters.resourceType) {
      queryBuilder.andWhere('audit.resource_type = :resourceType', { resourceType: filters.resourceType });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('audit.risk_level = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: filters.toDate });
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 1000); // Cap at 1000 records

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  // Query matter-specific audit logs
  async queryMatterAuditLogs(matterId: string, filters: {
    firmId?: string;
    action?: string;
    riskLevel?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC');

    // Filter by firm
    if (filters.firmId) {
      queryBuilder.andWhere('audit.firm_id = :firmId', { firmId: filters.firmId });
    }

    // Matter-specific conditions: include matter events, documents in matter, and related activities
    queryBuilder.andWhere(
      `(
        (audit.resource_type = 'matter' AND audit.resource_id = :matterId) OR
        (audit.resource_type = 'document' AND audit.details->>'matter_id' = :matterIdText) OR
        (audit.action LIKE '%matter%' AND audit.details->>'matter_id' = :matterIdText)
      )`,
      { matterId, matterIdText: matterId }
    );

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('audit.risk_level = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters.fromDate) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: filters.fromDate });
    }

    if (filters.toDate) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: filters.toDate });
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 1000); // Cap at 1000 records

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  // Get audit statistics
  async getAuditStats(firmId?: string, days: number = 30): Promise<{
    totalEvents: number;
    eventsByRisk: Record<string, number>;
    eventsByAction: Record<string, number>;
    topUsers: Array<{ user_id: string; display_name: string; event_count: number }>;
    recentHighRiskEvents: AuditLog[];
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .where('audit.timestamp >= :fromDate', { fromDate });

    if (firmId) {
      queryBuilder.andWhere('audit.firm_id = :firmId', { firmId });
    }

    const logs = await queryBuilder.getMany();

    const totalEvents = logs.length;

    // Group by risk level
    const eventsByRisk: Record<string, number> = {};
    logs.forEach(log => {
      eventsByRisk[log.risk_level] = (eventsByRisk[log.risk_level] || 0) + 1;
    });

    // Group by action
    const eventsByAction: Record<string, number> = {};
    logs.forEach(log => {
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
    });

    // Top users by activity
    const userCounts: Record<string, { user_id: string; display_name: string; count: number }> = {};
    logs.forEach(log => {
      if (!userCounts[log.user_id]) {
        userCounts[log.user_id] = {
          user_id: log.user_id,
          display_name: log.user?.display_name || 'Unknown',
          count: 0,
        };
      }
      userCounts[log.user_id].count++;
    });

    const topUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(user => ({
        user_id: user.user_id,
        display_name: user.display_name,
        event_count: user.count,
      }));

    // Recent high-risk events
    const recentHighRiskEvents = logs
      .filter(log => log.risk_level === 'high' || log.risk_level === 'critical')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    return {
      totalEvents,
      eventsByRisk,
      eventsByAction,
      topUsers,
      recentHighRiskEvents,
    };
  }
}
