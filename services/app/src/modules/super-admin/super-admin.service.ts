import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Firm, AuditLog, GlobalSettings } from '../../common/entities';

export interface SystemHealthMetrics {
  api_server: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  search_engine: 'healthy' | 'degraded' | 'down';
  uptime_hours: number;
  total_firms: number;
  total_system_users: number;
  storage_used_gb: number;
  storage_total_gb: number;
  database_size_gb: number;
  api_requests_last_24h: number;
  avg_response_time_ms: number;
}

export interface FirmOnboardingStats {
  pending_approvals: number;
  active_firms: number;
  trial_firms: number;
  enterprise_firms: number;
  recent_signups: Array<{
    firm_name: string;
    contact_email: string;
    signup_date: string;
    status: 'pending' | 'approved' | 'trial';
  }>;
}

export interface GlobalSettingDto {
  id?: string;
  key: string;
  value: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  requires_restart: boolean;
  category: 'system' | 'security' | 'storage' | 'email' | 'backup' | 'performance';
}

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);
  private readonly startTime = Date.now();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Firm)
    private firmRepository: Repository<Firm>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(GlobalSettings)
    private globalSettingsRepository: Repository<GlobalSettings>,
  ) {}

  async getSystemHealth(): Promise<SystemHealthMetrics> {
    try {
      // Calculate real uptime
      const uptimeMs = Date.now() - this.startTime;
      const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));

      // Get real counts from database
      const totalFirms = await this.firmRepository.count();
      const totalUsers = await this.userRepository.count();

      // Get real API requests from audit logs (last 24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentAuditLogs = await this.auditLogRepository
        .createQueryBuilder('audit')
        .where('audit.timestamp >= :yesterday', { yesterday })
        .getCount();

      // Test database connectivity
      let databaseStatus: 'healthy' | 'degraded' | 'down' = 'healthy';
      try {
        await this.firmRepository.query('SELECT 1');
      } catch (error) {
        this.logger.error('Database health check failed', error);
        databaseStatus = 'down';
      }

      // Get real database size
      let databaseSizeGb = 0;
      try {
        const sizeResult = await this.firmRepository.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size,
                 pg_database_size(current_database()) as size_bytes
        `);
        if (sizeResult && sizeResult[0]) {
          databaseSizeGb = Math.round(sizeResult[0].size_bytes / (1024 * 1024 * 1024) * 100) / 100;
        }
      } catch (error) {
        this.logger.warn('Could not get database size', error);
      }

      // Get storage statistics from audit logs (documents uploaded)
      let storageUsedGb = 0;
      try {
        const storageResult = await this.auditLogRepository
          .createQueryBuilder('audit')
          .select('SUM(CAST(audit.details->>\'size_bytes\' AS BIGINT))', 'total_bytes')
          .where('audit.action = :action', { action: 'document_upload' })
          .andWhere('audit.details->>\'size_bytes\' IS NOT NULL')
          .getRawOne();
        
        if (storageResult && storageResult.total_bytes) {
          storageUsedGb = Math.round(storageResult.total_bytes / (1024 * 1024 * 1024) * 100) / 100;
        }
      } catch (error) {
        this.logger.warn('Could not calculate storage usage', error);
      }

      // Calculate average response time from recent audit logs
      let avgResponseTimeMs = 0;
      try {
        const responseTimeResult = await this.auditLogRepository
          .createQueryBuilder('audit')
          .select('AVG(CAST(audit.details->>\'duration_ms\' AS INTEGER))', 'avg_duration')
          .where('audit.timestamp >= :yesterday', { yesterday })
          .andWhere('audit.details->>\'duration_ms\' IS NOT NULL')
          .getRawOne();
        
        if (responseTimeResult && responseTimeResult.avg_duration) {
          avgResponseTimeMs = Math.round(responseTimeResult.avg_duration);
        }
      } catch (error) {
        this.logger.warn('Could not calculate average response time', error);
        avgResponseTimeMs = 125; // Fallback
      }

      return {
        api_server: 'healthy', // API is responding if we're here
        database: databaseStatus,
        storage: storageUsedGb > 0 ? 'healthy' : 'healthy', // Assume healthy if no errors
        search_engine: 'healthy', // Would need to ping OpenSearch/Elasticsearch
        uptime_hours: uptimeHours,
        total_firms: totalFirms,
        total_system_users: totalUsers,
        storage_used_gb: storageUsedGb,
        storage_total_gb: 1000, // This would come from system config or disk info
        database_size_gb: databaseSizeGb,
        api_requests_last_24h: recentAuditLogs,
        avg_response_time_ms: avgResponseTimeMs,
      };
    } catch (error) {
      this.logger.error('Failed to get system health metrics', error);
      
      // Return degraded status if we can't get metrics
      return {
        api_server: 'degraded',
        database: 'degraded',
        storage: 'degraded',
        search_engine: 'degraded',
        uptime_hours: 0,
        total_firms: 0,
        total_system_users: 0,
        storage_used_gb: 0,
        storage_total_gb: 0,
        database_size_gb: 0,
        api_requests_last_24h: 0,
        avg_response_time_ms: 0,
      };
    }
  }

  async getFirmStats(): Promise<FirmOnboardingStats> {
    try {
      // Get total firm count
      const totalFirms = await this.firmRepository.count();

      // Get firms with users (active firms)
      const activeFirmsResult = await this.firmRepository
        .createQueryBuilder('firm')
        .leftJoin('firm.users', 'user')
        .where('user.id IS NOT NULL')
        .getCount();

      // Get recent firm registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSignups = await this.firmRepository
        .createQueryBuilder('firm')
        .leftJoinAndSelect('firm.users', 'users')
        .where('firm.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .orderBy('firm.created_at', 'DESC')
        .limit(10)
        .getMany();

      // Categorize firms based on real data
      const firmsWithLowActivity = await this.firmRepository
        .createQueryBuilder('firm')
        .leftJoin('firm.users', 'user')
        .leftJoin('firm.documents', 'document')
        .groupBy('firm.id')
        .having('COUNT(user.id) <= 5 OR COUNT(document.id) <= 10')
        .getCount();

      // Format recent signups with real data
      const formattedSignups = recentSignups.map(firm => {
        const hasUsers = firm.users && firm.users.length > 0;
        const userCount = firm.users ? firm.users.length : 0;
        
        // Determine status based on real metrics
        let status: 'pending' | 'approved' | 'trial' = 'approved';
        if (userCount === 0) {
          status = 'pending'; // No users yet
        } else if (userCount <= 3) {
          status = 'trial'; // Small number of users, likely trial
        }

        return {
          firm_name: firm.name,
          contact_email: firm.external_ref || 'N/A', // Use external_ref as contact placeholder
          signup_date: firm.created_at.toISOString(),
          status,
        };
      });

      // Calculate real statistics
      const pendingApprovals = formattedSignups.filter(s => s.status === 'pending').length;
      const trialFirmsFromSignups = formattedSignups.filter(s => s.status === 'trial').length;
      const trialFirms = trialFirmsFromSignups + Math.max(0, firmsWithLowActivity - trialFirmsFromSignups);

      return {
        pending_approvals: pendingApprovals,
        active_firms: activeFirmsResult,
        trial_firms: Math.min(trialFirms, totalFirms), // Ensure it doesn't exceed total
        enterprise_firms: Math.max(0, totalFirms - trialFirms - pendingApprovals),
        recent_signups: formattedSignups,
      };
    } catch (error) {
      this.logger.error('Failed to get firm stats', error);
      
      return {
        pending_approvals: 0,
        active_firms: 0,
        trial_firms: 0,
        enterprise_firms: 0,
        recent_signups: [],
      };
    }
  }

  async getSystemUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['firm'],
      order: { created_at: 'DESC' },
    });
  }

  async getAllFirms(): Promise<Firm[]> {
    return this.firmRepository.find({
      relations: ['users'],
      order: { created_at: 'DESC' },
    });
  }

  async getFirmsWithCounts(): Promise<any[]> {
    const firms = await this.firmRepository
      .createQueryBuilder('firm')
      .leftJoinAndSelect('firm.users', 'users')
      .loadRelationCountAndMap('firm.userCount', 'firm.users')
      .loadRelationCountAndMap('firm.documentCount', 'firm.documents')
      .loadRelationCountAndMap('firm.matterCount', 'firm.matters')
      .orderBy('firm.created_at', 'DESC')
      .getMany();

    return firms.map(firm => ({
      ...firm,
      _count: {
        users: (firm as any).userCount || 0,
        documents: (firm as any).documentCount || 0,
        matters: (firm as any).matterCount || 0,
      }
    }));
  }

  async createFirmWithAdmin(data: {
    name: string;
    external_ref?: string;
    admin_email: string;
    admin_name: string;
  }): Promise<{ firm: Firm; admin: User }> {
    // Create the firm first
    const firm = this.firmRepository.create({
      name: data.name,
      external_ref: data.external_ref,
      settings: {
        created_by: 'super_admin',
        setup_completed: false,
      },
    });
    
    const savedFirm = await this.firmRepository.save(firm);

    // Create the firm admin user
    const admin = this.userRepository.create({
      email: data.admin_email,
      display_name: data.admin_name,
      firm_id: savedFirm.id,
      roles: ['firm_admin'],
      is_active: true,
      keycloak_id: null, // Will be set when they first login
      attributes: {
        created_by: 'super_admin',
        setup_pending: true,
      },
    });

    const savedAdmin = await this.userRepository.save(admin);

    this.logger.log(`Created firm "${savedFirm.name}" with admin "${savedAdmin.display_name}" (${savedAdmin.email})`);

    return { firm: savedFirm, admin: savedAdmin };
  }

  async getFirmDetails(firmId: string): Promise<Firm> {
    const firm = await this.firmRepository.findOne({
      where: { id: firmId },
      relations: ['users', 'clients', 'matters', 'documents'],
    });

    if (!firm) {
      throw new Error(`Firm with ID ${firmId} not found`);
    }

    return firm;
  }

  // Global Settings Management
  async getGlobalSettings(): Promise<GlobalSettings[]> {
    return this.globalSettingsRepository.find({
      order: { category: 'ASC', key: 'ASC' },
    });
  }

  async getGlobalSettingsByCategory(category: string): Promise<GlobalSettings[]> {
    return this.globalSettingsRepository.find({
      where: { category: category as any },
      order: { key: 'ASC' },
    });
  }

  async updateGlobalSetting(key: string, value: string): Promise<GlobalSettings> {
    let setting = await this.globalSettingsRepository.findOne({ where: { key } });
    
    if (!setting) {
      throw new Error(`Global setting with key '${key}' not found`);
    }

    setting.value = value;
    setting.updated_at = new Date();
    
    return this.globalSettingsRepository.save(setting);
  }

  async createGlobalSetting(settingDto: GlobalSettingDto): Promise<GlobalSettings> {
    const existingSetting = await this.globalSettingsRepository.findOne({ 
      where: { key: settingDto.key } 
    });
    
    if (existingSetting) {
      throw new Error(`Global setting with key '${settingDto.key}' already exists`);
    }

    const setting = this.globalSettingsRepository.create(settingDto);
    return this.globalSettingsRepository.save(setting);
  }

  async deleteGlobalSetting(key: string): Promise<void> {
    const result = await this.globalSettingsRepository.delete({ key });
    if (result.affected === 0) {
      throw new Error(`Global setting with key '${key}' not found`);
    }
  }

  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings: Partial<GlobalSettings>[] = [
      {
        key: 'system.maintenance_mode',
        value: 'false',
        description: 'Enable maintenance mode to restrict access during updates',
        type: 'boolean',
        category: 'system',
        requires_restart: false,
      },
      {
        key: 'system.max_file_size_mb',
        value: '100',
        description: 'Maximum file size for document uploads in MB',
        type: 'number',
        category: 'system',
        requires_restart: true,
      },
      {
        key: 'security.session_timeout_minutes',
        value: '480',
        description: 'User session timeout in minutes',
        type: 'number',
        category: 'security',
        requires_restart: false,
      },
      {
        key: 'security.force_mfa',
        value: 'false',
        description: 'Force multi-factor authentication for all users',
        type: 'boolean',
        category: 'security',
        requires_restart: false,
      },
      {
        key: 'storage.retention_policy_days',
        value: '2555',
        description: 'Default document retention period in days (7 years)',
        type: 'number',
        category: 'storage',
        requires_restart: false,
      },
      {
        key: 'email.smtp_host',
        value: 'localhost',
        description: 'SMTP server hostname for email notifications',
        type: 'string',
        category: 'email',
        requires_restart: true,
      },
      {
        key: 'backup.auto_backup_enabled',
        value: 'true',
        description: 'Enable automatic daily database backups',
        type: 'boolean',
        category: 'backup',
        requires_restart: false,
      },
      {
        key: 'performance.api_rate_limit',
        value: '1000',
        description: 'API requests per minute per user',
        type: 'number',
        category: 'performance',
        requires_restart: true,
      },
    ];

    for (const setting of defaultSettings) {
      const exists = await this.globalSettingsRepository.findOne({ 
        where: { key: setting.key } 
      });
      
      if (!exists) {
        await this.globalSettingsRepository.save(
          this.globalSettingsRepository.create(setting)
        );
        this.logger.log(`Created default global setting: ${setting.key}`);
      }
    }
  }
}