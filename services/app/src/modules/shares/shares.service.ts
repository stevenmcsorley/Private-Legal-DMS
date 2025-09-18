import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { MatterShare, ShareStatus } from '../../common/entities/matter-share.entity';
import { User, Firm } from '../../common/entities';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(MatterShare)
    private readonly shareRepository: Repository<MatterShare>,
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

    return shares.map(share => ({
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
      status: (share.status === ShareStatus.REVOKED) ? 'revoked' : (share.isExpired() ? 'expired' : 'active'),
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      access_count: 0, // TODO: implement access tracking
      last_accessed: null,
      message: null, // No message field in current schema
    }));
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
      status: (share.status === ShareStatus.REVOKED) ? 'revoked' : (share.isExpired() ? 'expired' : 'active'),
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      message: null, // No message field in current schema
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

    // For the current schema, we don't have accept/decline states
    // The share exists and is active by default if not revoked/expired
    
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
      status: 'active',
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      message: null,
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
      shared_by_user: {
        display_name: share.shared_by_user?.display_name || '',
      },
      role: share.role,
      permissions: share.permissions || [],
      status: (share.status === ShareStatus.REVOKED) ? 'revoked' : (share.isExpired() ? 'expired' : 'active'),
      expires_at: share.expires_at?.toISOString(),
      created_at: share.created_at.toISOString(),
      documents: share.matter.documents?.map(doc => ({
        id: doc.id,
        filename: doc.original_filename,
        original_filename: doc.original_filename,
        file_size: Number(doc.size_bytes),
        mime_type: doc.mime_type,
        uploaded_at: doc.created_at.toISOString(),
        confidential: doc.metadata?.confidential || false,
        privileged: doc.metadata?.privileged || false,
        work_product: doc.metadata?.work_product || false,
      })) || [],
      is_external: !isOwner && isRecipient,
    };
  }
}