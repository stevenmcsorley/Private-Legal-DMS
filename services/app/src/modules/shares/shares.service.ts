import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { MatterShare, ShareStatus, ShareRole } from '../../common/entities/matter-share.entity';
import { User, Firm, Matter } from '../../common/entities';
import { AuditLog } from '../../common/entities/audit-log.entity';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(MatterShare)
    private readonly shareRepository: Repository<MatterShare>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(Firm)
    private readonly firmRepository: Repository<Firm>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async getOutgoingShares(firmId: string, role?: string) {
    const queryBuilder = this.shareRepository.createQueryBuilder('share')
      .leftJoinAndSelect('share.matter', 'matter')
      .leftJoinAndSelect('matter.client', 'client')
      .leftJoinAndSelect('share.shared_with_firm_entity', 'shared_with_firm')
      .leftJoinAndSelect('share.shared_by_user', 'shared_by_user')
      .innerJoin('share.shared_by_user', 'user')
      .where('user.firm_id = :firmId', { firmId })
      .andWhere('share.status != :revokedStatus', { revokedStatus: ShareStatus.REVOKED })
      .orderBy('share.created_at', 'DESC');

    if (role) {
      queryBuilder.andWhere('share.role = :role', { role });
    }

    const shares = await queryBuilder.getMany();

    return Promise.all(shares.map(async share => ({
      id: share.id,
      matter_id: share.matter_id,
      matter: {
        title: share.matter.title,
        matter_number: share.matter.id.slice(-8), // Use last 8 chars of ID as matter number
        client: {
          name: share.matter.client?.name || '',
        },
      },
      shared_with_firm: share.shared_with_firm,
      shared_with_firm_name: share.shared_with_firm_entity?.name || '',
      shared_by: {
        display_name: share.shared_by_user?.display_name || '',
      },
      role: share.role,
      permissions: share.permissions || [],
      status: share.isExpired() ? 'expired' : share.status,
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      access_count: await this.getShareAccessCount(share.id),
      last_accessed: null,
      message: share.invitation_message,
    })));
  }

  async getIncomingShares(firmId: string, role?: string) {
    const queryBuilder = this.shareRepository.createQueryBuilder('share')
      .leftJoinAndSelect('share.matter', 'matter')
      .leftJoinAndSelect('matter.client', 'client')
      .leftJoinAndSelect('share.shared_by_user', 'shared_by_user')
      .leftJoinAndSelect('shared_by_user.firm', 'shared_by_firm')
      .where('share.shared_with_firm = :firmId', { firmId })
      .andWhere('share.status != :revokedStatus', { revokedStatus: ShareStatus.REVOKED })
      .orderBy('share.created_at', 'DESC');

    if (role) {
      queryBuilder.andWhere('share.role = :role', { role });
    }

    const shares = await queryBuilder.getMany();

    return shares.map(share => ({
      id: share.id,
      matter_id: share.matter_id,
      matter_title: share.matter.title,
      matter_number: share.matter.id.slice(-8), // Use last 8 chars of ID as matter number
      client_name: share.matter.client?.name || '',
      shared_by_firm: share.shared_by_user?.firm_id || '',
      shared_by_firm_name: share.shared_by_user?.firm?.name || '',
      shared_by_user: share.shared_by_user?.display_name || '',
      role: share.role,
      permissions: share.permissions || [],
      status: share.isExpired() ? 'expired' : share.status,
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      message: share.invitation_message,
    }));
  }

  async acceptShare(shareId: string, user: User) {
    const share = await this.shareRepository.findOne({
      where: { 
        id: shareId,
        shared_with_firm: user.firm_id,
        status: Not(ShareStatus.REVOKED)
      },
      relations: ['matter', 'matter.client', 'shared_by_user', 'shared_by_user.firm'],
    });

    if (!share) {
      throw new NotFoundException('Share not found or not available for acceptance');
    }

    if (share.isExpired()) {
      throw new ForbiddenException('Share invitation has expired');
    }

    // Update share status to accepted
    share.status = ShareStatus.ACCEPTED;
    share.accepted_at = new Date();
    share.accepted_by_user_id = user.id;
    
    // Save the updated share
    await this.shareRepository.save(share);

    // Log the acceptance
    await this.auditRepository.save({
      resource_type: 'matter_share',
      resource_id: share.id,
      action: 'accept_share',
      user_id: user.id,
      firm_id: user.firm_id,
      details: {
        matter_id: share.matter_id,
        shared_by_firm: share.shared_by_firm_id,
        shared_with_firm: share.shared_with_firm,
      },
      ip_address: null,
      user_agent: null,
      risk_level: 'low',
      outcome: 'success',
    });
    
    return {
      id: share.id,
      matter_id: share.matter_id,
      matter_title: share.matter.title,
      matter_number: share.matter.id.slice(-8), // Use last 8 chars of ID as matter number
      client_name: share.matter.client?.name || '',
      shared_by_firm: share.shared_by_user?.firm_id || '',
      shared_by_firm_name: share.shared_by_user?.firm?.name || '',
      shared_by_user: share.shared_by_user?.display_name || '',
      role: share.role,
      permissions: share.permissions || [],
      status: share.status,
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      message: share.invitation_message,
    };
  }

  async declineShare(shareId: string, user: User): Promise<void> {
    const share = await this.shareRepository.findOne({
      where: { 
        id: shareId,
        shared_with_firm: user.firm_id,
        status: Not(ShareStatus.REVOKED)
      },
    });

    if (!share) {
      throw new NotFoundException('Share not found or not available for declining');
    }

    // Set status to declined
    share.status = ShareStatus.DECLINED;
    await this.shareRepository.save(share);

    // Log the decline
    await this.auditRepository.save({
      resource_type: 'matter_share',
      resource_id: share.id,
      action: 'decline_share',
      user_id: user.id,
      firm_id: user.firm_id,
      details: {
        matter_id: share.matter_id,
        shared_by_firm: share.shared_by_firm_id,
        shared_with_firm: share.shared_with_firm,
      },
      ip_address: null,
      user_agent: null,
      risk_level: 'low',
      outcome: 'success',
    });
  }

  async revokeShare(shareId: string, user: User) {
    const share = await this.shareRepository.findOne({
      where: { 
        id: shareId,
        shared_by_user_id: user.id
      },
      relations: ['matter', 'matter.client', 'shared_with_firm_entity', 'shared_by_user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found or you do not have permission to revoke it');
    }

    if (share.status === ShareStatus.REVOKED) {
      throw new ForbiddenException('Share is already revoked');
    }

    share.status = ShareStatus.REVOKED;
    await this.shareRepository.save(share);

    return {
      id: share.id,
      matter_id: share.matter_id,
      matter: {
        title: share.matter.title,
        matter_number: share.matter.id.slice(-8), // Use last 8 chars of ID as matter number
        client: {
          name: share.matter.client?.name || '',
        },
      },
      shared_with_firm: share.shared_with_firm,
      shared_with_firm_name: share.shared_with_firm_entity?.name || '',
      shared_by: {
        display_name: share.shared_by_user?.display_name || '',
      },
      role: share.role,
      permissions: share.permissions || [],
      status: 'revoked',
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      access_count: 0,
      last_accessed: null,
      message: null,
    };
  }

  async getShareDetails(shareId: string, user: User) {
    const share = await this.shareRepository.findOne({
      where: { id: shareId },
      relations: [
        'matter', 
        'matter.client', 
        'matter.documents', 
        'matter.documents.metadata',
        'shared_by_user', 
        'shared_by_user.firm',
        'shared_with_firm_entity'
      ],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if user has access to this share
    const userFirmId = user.firm_id;
    const isOwner = share.shared_by_user.firm_id === userFirmId;
    const isRecipient = share.shared_with_firm === userFirmId;
    
    if (!isOwner && !isRecipient) {
      throw new ForbiddenException('Access denied to this share');
    }

    // Check if share is still valid
    if (share.status === ShareStatus.REVOKED) {
      throw new ForbiddenException('Share has been revoked');
    }

    if (share.isExpired()) {
      throw new ForbiddenException('Share has expired');
    }

    // Track access to this share
    await this.trackShareAccess(shareId, user, 'share_view');

    // Get access statistics and logs
    const accessCount = await this.getShareAccessCount(shareId);
    const lastAccessTime = await this.getLastAccessTime(shareId);
    const accessLog = await this.getShareAccessLog(shareId, 20);

    return {
      id: share.id,
      matter: {
        id: share.matter.id,
        title: share.matter.title,
        matter_number: share.matter.id.slice(-8),
        client: {
          name: share.matter.client?.name || '',
        },
      },
      shared_by_firm_name: share.shared_by_user?.firm?.name || '',
      shared_with_firm_name: share.shared_with_firm_entity?.name || '',
      shared_by: {
        display_name: share.shared_by_user?.display_name || '',
      },
      role: share.role,
      permissions: share.permissions || {},
      restrictions: share.restrictions || {},
      invitation_message: share.invitation_message,
      status: share.isExpired() ? 'expired' : share.status,
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      updated_at: share.updated_at?.toISOString(),
      access_count: accessCount,
      last_accessed: lastAccessTime?.toISOString(),
      documents: (() => {
        // If document_id is specified, only return that specific document
        if (share.document_id) {
          const specificDoc = share.matter.documents?.find(doc => doc.id === share.document_id);
          return specificDoc ? [{
            id: specificDoc.id,
            title: specificDoc.original_filename,
            file_name: specificDoc.original_filename,
            file_size: Number(specificDoc.size_bytes),
            mime_type: specificDoc.mime_type,
            uploaded_at: specificDoc.created_at.toISOString(),
            confidential: specificDoc.metadata?.confidential || false,
            privileged: specificDoc.metadata?.privileged || false,
            work_product: specificDoc.metadata?.work_product || false,
          }] : [];
        }
        
        // Otherwise, return all documents (legacy matter-level sharing)
        return share.matter.documents?.map(doc => ({
          id: doc.id,
          title: doc.original_filename,
          file_name: doc.original_filename,
          file_size: Number(doc.size_bytes),
          mime_type: doc.mime_type,
          uploaded_at: doc.created_at.toISOString(),
          confidential: doc.metadata?.confidential || false,
          privileged: doc.metadata?.privileged || false,
          work_product: doc.metadata?.work_product || false,
        })) || [];
      })(),
      access_log: accessLog,
      is_external: !isOwner && isRecipient,
    };
  }

  async createShare(matterId: string, targetFirmId: string, role: ShareRole, user: User, options: {
    document_id?: string;
    expires_at?: Date;
    permissions?: Record<string, any>;
    restrictions?: Record<string, any>;
    invitation_message?: string;
  } = {}) {
    // Verify matter exists and user has access
    const matter = await this.matterRepository.findOne({
      where: { id: matterId, firm_id: user.firm_id },
      relations: ['client'],
    });

    if (!matter) {
      throw new NotFoundException('Matter not found or access denied');
    }

    // Verify target firm exists
    const targetFirm = await this.firmRepository.findOne({
      where: { id: targetFirmId },
    });

    if (!targetFirm) {
      throw new NotFoundException('Target firm not found');
    }

    // If document_id is provided, verify the document exists and belongs to the matter
    if (options.document_id) {
      const document = await this.matterRepository.manager.findOne('Document', {
        where: { 
          id: options.document_id, 
          matter_id: matterId 
        }
      });
      
      if (!document) {
        throw new NotFoundException('Document not found or does not belong to this matter');
      }
    }

    // Check if share already exists (for same matter/document combination)
    const whereCondition: any = {
      matter_id: matterId,
      shared_with_firm: targetFirmId,
      status: Not(ShareStatus.REVOKED),
    };
    
    // For document-level shares, check document_id specifically
    if (options.document_id) {
      whereCondition.document_id = options.document_id;
    } else {
      // For matter-level shares, ensure no document_id is set
      whereCondition.document_id = null;
    }
    
    const existingShare = await this.shareRepository.findOne({
      where: whereCondition,
    });

    if (existingShare) {
      const shareType = options.document_id ? 'document' : 'matter';
      throw new ConflictException(`Share already exists for this ${shareType} with this firm`);
    }

    // Create the share using direct INSERT
    const userId = user.id || (user as any).sub;
    const shareData = {
      matter_id: matterId,
      document_id: options.document_id || null,
      shared_by_firm_id: user.firm_id,
      shared_with_firm: targetFirmId,
      shared_by_user_id: userId,
      role: role,
      status: ShareStatus.PENDING,
      expires_at: options.expires_at,
      permissions: options.permissions || {},
      restrictions: options.restrictions,
      invitation_message: options.invitation_message,
    };

    const result = await this.shareRepository
      .createQueryBuilder()
      .insert()
      .into(MatterShare)
      .values(shareData)
      .returning(['id', 'role', 'status', 'permissions', 'created_at', 'updated_at'])
      .execute();

    const savedShare = result.generatedMaps[0] as any;

    return {
      id: savedShare.id,
      matter_title: matter.title,
      matter_number: matter.id.slice(-8),
      client_name: matter.client?.name || '',
      shared_with_firm_name: targetFirm.name,
      role: savedShare.role,
      status: savedShare.status,
      expires_at: savedShare.expires_at?.toISOString(),
      created_at: savedShare.created_at.toISOString(),
    };
  }

  async updateSharePermissions(shareId: string, updateData: {
    permissions?: Record<string, any>;
    restrictions?: Record<string, any>;
    role?: ShareRole;
    expires_at?: string | null;
  }, user: User) {
    const share = await this.shareRepository.findOne({
      where: { 
        id: shareId,
        shared_by_user_id: user.id,
      },
      relations: ['matter', 'shared_with_firm_entity', 'shared_by_user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found or you do not have permission to modify it');
    }

    if (share.status === ShareStatus.REVOKED) {
      throw new ForbiddenException('Cannot modify revoked share');
    }

    // Update permissions if provided
    if (updateData.permissions !== undefined) {
      share.permissions = updateData.permissions;
    }

    // Update restrictions if provided
    if (updateData.restrictions !== undefined) {
      share.restrictions = updateData.restrictions;
    }

    // Update role if provided
    if (updateData.role !== undefined) {
      share.role = updateData.role;
    }

    // Update expiration if provided
    if (updateData.expires_at !== undefined) {
      share.expires_at = updateData.expires_at ? new Date(updateData.expires_at) : null;
    }

    // Update the updated_at timestamp
    share.updated_at = new Date();

    await this.shareRepository.save(share);

    // Track the permission update
    await this.trackShareAccess(shareId, user, 'share_permissions_updated');

    return {
      id: share.id,
      matter: {
        id: share.matter.id,
        title: share.matter.title,
        matter_number: share.matter.id.slice(-8),
        client: {
          name: share.matter.client?.name || '',
        },
      },
      shared_with_firm_name: share.shared_with_firm_entity?.name || '',
      shared_by: {
        display_name: share.shared_by_user?.display_name || '',
      },
      role: share.role,
      permissions: share.permissions,
      restrictions: share.restrictions,
      status: share.isExpired() ? 'expired' : share.status,
      expires_at: share.expires_at?.toISOString(),
      updated_at: share.updated_at.toISOString(),
    };
  }

  async getShareAnalytics(firmId: string, timeRange: 'week' | 'month' | 'quarter' = 'month') {
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Get outgoing shares statistics
    const outgoingStats = await this.shareRepository
      .createQueryBuilder('share')
      .innerJoin('share.shared_by_user', 'user')
      .where('user.firm_id = :firmId', { firmId })
      .andWhere('share.created_at >= :startDate', { startDate })
      .select([
        'COUNT(*) as total_shares',
        'COUNT(CASE WHEN share.status = :pending THEN 1 END) as pending_shares',
        'COUNT(CASE WHEN share.status = :accepted THEN 1 END) as accepted_shares',
        'COUNT(CASE WHEN share.status = :declined THEN 1 END) as declined_shares',
        'COUNT(CASE WHEN share.status = :revoked THEN 1 END) as revoked_shares',
        'COUNT(CASE WHEN share.expires_at < NOW() THEN 1 END) as expired_shares',
      ])
      .setParameters({
        pending: ShareStatus.PENDING,
        accepted: ShareStatus.ACCEPTED,
        declined: ShareStatus.DECLINED,
        revoked: ShareStatus.REVOKED,
      })
      .getRawOne();

    // Get incoming shares statistics
    const incomingStats = await this.shareRepository
      .createQueryBuilder('share')
      .where('share.shared_with_firm = :firmId', { firmId })
      .andWhere('share.created_at >= :startDate', { startDate })
      .select([
        'COUNT(*) as total_incoming',
        'COUNT(CASE WHEN share.status = :pending THEN 1 END) as pending_incoming',
        'COUNT(CASE WHEN share.status = :accepted THEN 1 END) as accepted_incoming',
      ])
      .setParameters({
        pending: ShareStatus.PENDING,
        accepted: ShareStatus.ACCEPTED,
      })
      .getRawOne();

    // Get top shared matters
    const topSharedMatters = await this.shareRepository
      .createQueryBuilder('share')
      .innerJoin('share.matter', 'matter')
      .innerJoin('share.shared_by_user', 'user')
      .where('user.firm_id = :firmId', { firmId })
      .andWhere('share.created_at >= :startDate', { startDate })
      .groupBy('matter.id, matter.title')
      .select([
        'matter.id as matter_id',
        'matter.title as matter_title',
        'COUNT(*) as share_count',
      ])
      .orderBy('share_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Get sharing partners (firms we share with most)
    const topPartners = await this.shareRepository
      .createQueryBuilder('share')
      .innerJoin('share.shared_with_firm_entity', 'firm')
      .innerJoin('share.shared_by_user', 'user')
      .where('user.firm_id = :firmId', { firmId })
      .andWhere('share.created_at >= :startDate', { startDate })
      .groupBy('firm.id, firm.name')
      .select([
        'firm.id as firm_id',
        'firm.name as firm_name',
        'COUNT(*) as share_count',
      ])
      .orderBy('share_count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      period: timeRange,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      outgoing: {
        total: parseInt(outgoingStats.total_shares) || 0,
        pending: parseInt(outgoingStats.pending_shares) || 0,
        accepted: parseInt(outgoingStats.accepted_shares) || 0,
        declined: parseInt(outgoingStats.declined_shares) || 0,
        revoked: parseInt(outgoingStats.revoked_shares) || 0,
        expired: parseInt(outgoingStats.expired_shares) || 0,
      },
      incoming: {
        total: parseInt(incomingStats.total_incoming) || 0,
        pending: parseInt(incomingStats.pending_incoming) || 0,
        accepted: parseInt(incomingStats.accepted_incoming) || 0,
      },
      top_shared_matters: topSharedMatters.map(matter => ({
        matter_id: matter.matter_id,
        matter_title: matter.matter_title,
        share_count: parseInt(matter.share_count),
      })),
      top_partners: topPartners.map(partner => ({
        firm_id: partner.firm_id,
        firm_name: partner.firm_name,
        share_count: parseInt(partner.share_count),
      })),
    };
  }

  async searchFirms(query: string, user: User) {
    const firms = await this.firmRepository
      .createQueryBuilder('firm')
      .where('LOWER(firm.name) ILIKE LOWER(:query)', { query: `%${query}%` })
      .andWhere('firm.id != :currentFirmId', { currentFirmId: user.firm_id })
      .andWhere('firm.deleted_at IS NULL')
      .select(['firm.id', 'firm.name'])
      .limit(10)
      .getMany();

    return firms.map(firm => ({
      id: firm.id,
      name: firm.name,
    }));
  }

  async getShareHistory(matterId: string, user: User) {
    const matter = await this.matterRepository.findOne({
      where: { id: matterId, firm_id: user.firm_id },
    });

    if (!matter) {
      throw new NotFoundException('Matter not found or access denied');
    }

    const shares = await this.shareRepository.find({
      where: { matter_id: matterId },
      relations: ['shared_with_firm_entity', 'shared_by_user'],
      order: { created_at: 'DESC' },
    });

    return shares.map(share => ({
      id: share.id,
      shared_with_firm: share.shared_with_firm_entity?.name || '',
      shared_by: share.shared_by_user?.display_name || '',
      role: share.role,
      status: share.status,
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      updated_at: share.updated_at?.toISOString(),
    }));
  }

  async getShareAccessCount(shareId: string): Promise<number> {
    const count = await this.auditRepository.count({
      where: {
        resource_type: 'shares',
        resource_id: shareId,
        action: 'shares_access',
      },
    });
    return count;
  }

  async getLastAccessTime(shareId: string): Promise<Date | null> {
    const lastAccess = await this.auditRepository.findOne({
      where: {
        resource_type: 'shares',
        resource_id: shareId,
        action: 'shares_access',
      },
      order: { timestamp: 'DESC' },
    });
    return lastAccess?.timestamp || null;
  }

  async trackShareAccess(shareId: string, user: User, action: string = 'shares_access', documentId?: string): Promise<void> {
    await this.auditRepository.save({
      user_id: user.id,
      firm_id: user.firm_id,
      action,
      resource_type: 'shares',
      resource_id: shareId,
      outcome: 'success',
      details: {
        action,
        share_id: shareId,
        document_id: documentId,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async getShareAccessLog(shareId: string, limit: number = 50): Promise<any[]> {
    const accessLogs = await this.auditRepository.find({
      where: {
        resource_type: 'shares',
        resource_id: shareId,
      },
      relations: ['user'],
      order: { timestamp: 'DESC' },
      take: limit,
    });

    return accessLogs.map(log => ({
      accessed_at: log.timestamp,
      user_email: log.user?.email || 'Unknown',
      action: log.action,
      document_id: log.details?.document_id,
      document_title: log.details?.document_title,
    }));
  }
}