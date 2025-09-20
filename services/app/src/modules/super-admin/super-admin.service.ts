import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Firm, AuditLog } from '../../common/entities';

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
  ) {}

  async getSystemHealth(): Promise<SystemHealthMetrics> {
    try {
      // Calculate uptime
      const uptimeMs = Date.now() - this.startTime;
      const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));

      // Get basic counts
      const totalFirms = await this.firmRepository.count();
      const totalUsers = await this.userRepository.count();

      // Get API requests in last 24h (simplified mock data for now)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentAuditLogs = await this.auditLogRepository
        .createQueryBuilder('audit')
        .where('audit.timestamp >= :yesterday', { yesterday })
        .getCount();

      // Mock data for demonstration - in production these would come from 
      // actual monitoring systems like Prometheus, New Relic, etc.
      return {
        api_server: 'healthy',
        database: 'healthy',
        storage: 'healthy',
        search_engine: 'healthy',
        uptime_hours: uptimeHours,
        total_firms: totalFirms,
        total_system_users: totalUsers,
        storage_used_gb: 45.2, // Mock data
        storage_total_gb: 1000, // Mock data
        database_size_gb: 12.8, // Mock data
        api_requests_last_24h: recentAuditLogs * 5, // Rough estimate
        avg_response_time_ms: 125, // Mock data
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
      // Get basic firm counts (simplified since we don't have status field yet)
      const totalFirms = await this.firmRepository.count();

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSignups = await this.firmRepository
        .createQueryBuilder('firm')
        .where('firm.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
        .orderBy('firm.created_at', 'DESC')
        .limit(10)
        .getMany();

      const formattedSignups = recentSignups.map(firm => ({
        firm_name: firm.name,
        contact_email: firm.contact_email || 'N/A',
        signup_date: firm.created_at.toISOString(),
        status: 'approved' as 'pending' | 'approved' | 'trial', // Default for now
      }));

      return {
        pending_approvals: 0, // Mock data for now
        active_firms: totalFirms,
        trial_firms: 0, // Mock data for now
        enterprise_firms: totalFirms, // For now, all firms are enterprise
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
      order: { created_at: 'DESC' },
    });
  }
}