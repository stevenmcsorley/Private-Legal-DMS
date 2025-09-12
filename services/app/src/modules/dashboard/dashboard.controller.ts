import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matter, Client, Document, User, MatterStatus } from '../../common/entities';

interface DashboardStats {
  totalDocuments: number;
  activeMatters: number;
  totalClients: number;
  totalUsers: number;
  storageUsed: string;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(Matter) private matterRepo: Repository<Matter>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Document) private documentRepo: Repository<Document>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Get('public-stats')
  @ApiOperation({
    summary: 'Get public dashboard statistics',
    description: 'Returns basic system statistics for demo purposes - no authentication required'
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getPublicStats(): Promise<DashboardStats> {
    // Get basic counts
    const [totalDocuments, activeMatters, totalClients, totalUsers] = await Promise.all([
      this.documentRepo.count({ where: { is_deleted: false } }),
      this.matterRepo.count({ where: { status: MatterStatus.ACTIVE } }),
      this.clientRepo.count(),
      this.userRepo.count(),
    ]);

    // Get recent activity (last 10 items)
    const recentDocuments = await this.documentRepo.find({
      take: 5,
      order: { created_at: 'DESC' },
      relations: ['matter'],
    });

    const recentMatters = await this.matterRepo.find({
      take: 5, 
      order: { created_at: 'DESC' },
    });

    // Create activity feed
    const recentActivity = [
      ...recentDocuments.map(doc => ({
        type: 'document',
        description: `Document "${doc.original_filename}" uploaded to matter "${doc.matter?.title || 'Unknown'}"`,
        timestamp: doc.created_at,
      })),
      ...recentMatters.map(matter => ({
        type: 'matter',
        description: `Matter "${matter.title}" created`,
        timestamp: matter.created_at,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Calculate storage (simplified - just document count * average size)
    const avgDocSize = 2.5; // MB average
    const storageUsedMB = totalDocuments * avgDocSize;
    const storageUsed = storageUsedMB > 1024 
      ? `${(storageUsedMB / 1024).toFixed(1)} GB`
      : `${storageUsedMB.toFixed(1)} MB`;

    return {
      totalDocuments,
      activeMatters,
      totalClients,
      totalUsers,
      storageUsed,
      recentActivity,
    };
  }
}
