import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatterShare, ShareStatus, Matter, Firm, User } from '../../../common/entities';
import { CreateMatterShareDto, UpdateMatterShareDto, MatterShareResponseDto } from '../dto';

@Injectable()
export class MatterShareService {
  constructor(
    @InjectRepository(MatterShare)
    private readonly matterShareRepository: Repository<MatterShare>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(Firm)
    private readonly firmRepository: Repository<Firm>,
  ) {}

  async createShare(
    createDto: CreateMatterShareDto,
    sharedByUserId: string,
    sharedByFirmId: string,
  ): Promise<MatterShareResponseDto> {
    // Verify the matter exists and belongs to the sharing firm
    const matter = await this.matterRepository.findOne({
      where: { id: createDto.matter_id, firm_id: sharedByFirmId },
    });

    if (!matter) {
      throw new NotFoundException('Matter not found or access denied');
    }

    // Verify the target firm exists
    const targetFirm = await this.firmRepository.findOne({
      where: { id: createDto.shared_with_firm_id },
    });

    if (!targetFirm) {
      throw new NotFoundException('Target firm not found');
    }

    // Check if share already exists
    const existingShare = await this.matterShareRepository.findOne({
      where: {
        matter_id: createDto.matter_id,
        shared_with_firm_id: createDto.shared_with_firm_id,
      },
    });

    if (existingShare) {
      throw new BadRequestException('Matter is already shared with this firm');
    }

    // Set default permissions based on role
    const defaultPermissions = this.getDefaultPermissions(createDto.role);
    const permissions = { ...defaultPermissions, ...createDto.permissions };

    // Create the share
    const share = this.matterShareRepository.create({
      ...createDto,
      shared_by_firm_id: sharedByFirmId,
      shared_by_user_id: sharedByUserId,
      permissions,
      expires_at: createDto.expires_at ? new Date(createDto.expires_at) : null,
    });

    const savedShare = await this.matterShareRepository.save(share);

    return this.transformToResponseDto(savedShare);
  }

  async getSharesByMatter(matterId: string, firmId: string): Promise<MatterShareResponseDto[]> {
    // Verify access to matter
    const matter = await this.matterRepository.findOne({
      where: { id: matterId, firm_id: firmId },
    });

    if (!matter) {
      throw new NotFoundException('Matter not found or access denied');
    }

    const shares = await this.matterShareRepository.find({
      where: { matter_id: matterId },
      relations: ['shared_with_firm', 'shared_by_user'],
      order: { created_at: 'DESC' },
    });

    return shares.map(share => this.transformToResponseDto(share));
  }

  async getSharesForFirm(firmId: string, status?: ShareStatus): Promise<MatterShareResponseDto[]> {
    const whereClause: any = { shared_with_firm_id: firmId };
    if (status) {
      whereClause.status = status;
    }

    const shares = await this.matterShareRepository.find({
      where: whereClause,
      relations: ['matter', 'shared_by_firm', 'shared_by_user'],
      order: { created_at: 'DESC' },
    });

    return shares.map(share => this.transformToResponseDto(share));
  }

  async updateShare(
    shareId: string,
    updateDto: UpdateMatterShareDto,
    userId: string,
    firmId: string,
  ): Promise<MatterShareResponseDto> {
    const share = await this.matterShareRepository.findOne({
      where: { id: shareId },
      relations: ['matter'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if user has permission to update (either sharing firm or receiving firm)
    const canUpdate = 
      share.shared_by_firm_id === firmId || 
      share.shared_with_firm_id === firmId;

    if (!canUpdate) {
      throw new ForbiddenException('Access denied');
    }

    // Handle status changes
    if (updateDto.status) {
      if (updateDto.status === ShareStatus.ACCEPTED) {
        share.accepted_at = new Date();
        share.accepted_by_user_id = userId;
      } else if (updateDto.status === ShareStatus.DECLINED || updateDto.status === ShareStatus.REVOKED) {
        share.accepted_at = null;
        share.accepted_by_user_id = null;
      }
    }

    // Update fields
    Object.assign(share, {
      ...updateDto,
      expires_at: updateDto.expires_at ? new Date(updateDto.expires_at) : share.expires_at,
      permissions: updateDto.permissions ? { ...share.permissions, ...updateDto.permissions } : share.permissions,
      restrictions: updateDto.restrictions ? { ...share.restrictions, ...updateDto.restrictions } : share.restrictions,
    });

    const updatedShare = await this.matterShareRepository.save(share);

    return this.transformToResponseDto(updatedShare);
  }

  async deleteShare(shareId: string, firmId: string): Promise<void> {
    const share = await this.matterShareRepository.findOne({
      where: { id: shareId },
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Only the sharing firm can delete the share
    if (share.shared_by_firm_id !== firmId) {
      throw new ForbiddenException('Only the sharing firm can delete this share');
    }

    await this.matterShareRepository.remove(share);
  }

  async getShareById(shareId: string, firmId: string): Promise<MatterShareResponseDto> {
    const share = await this.matterShareRepository.findOne({
      where: { id: shareId },
      relations: ['matter', 'shared_by_firm', 'shared_with_firm', 'shared_by_user', 'accepted_by_user'],
    });

    if (!share) {
      throw new NotFoundException('Share not found');
    }

    // Check if user's firm has access to this share
    const hasAccess = 
      share.shared_by_firm_id === firmId || 
      share.shared_with_firm_id === firmId;

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    return this.transformToResponseDto(share);
  }

  async expireOldShares(): Promise<number> {
    const result = await this.matterShareRepository.update(
      {
        expires_at: { $lt: new Date() } as any,
        status: ShareStatus.ACCEPTED,
      },
      { status: ShareStatus.EXPIRED }
    );

    return result.affected || 0;
  }

  private getDefaultPermissions(role: string): Record<string, any> {
    const defaults = {
      viewer: {
        can_download: false,
        can_upload: false,
        can_comment: true,
        can_view_audit: false,
        watermark_required: true,
      },
      editor: {
        can_download: true,
        can_upload: true,
        can_comment: true,
        can_view_audit: false,
        watermark_required: false,
      },
      collaborator: {
        can_download: true,
        can_upload: true,
        can_comment: true,
        can_view_audit: true,
        watermark_required: false,
      },
      partner_lead: {
        can_download: true,
        can_upload: true,
        can_comment: true,
        can_view_audit: true,
        watermark_required: false,
      },
    };

    return defaults[role] || defaults.viewer;
  }

  private transformToResponseDto(share: MatterShare): MatterShareResponseDto {
    return {
      id: share.id,
      matter_id: share.matter_id,
      shared_by_firm_id: share.shared_by_firm_id,
      shared_with_firm_id: share.shared_with_firm_id,
      shared_by_user_id: share.shared_by_user_id,
      role: share.role,
      status: share.status,
      expires_at: share.expires_at,
      accepted_at: share.accepted_at,
      accepted_by_user_id: share.accepted_by_user_id,
      invitation_message: share.invitation_message,
      permissions: share.permissions,
      restrictions: share.restrictions,
      created_at: share.created_at,
      updated_at: share.updated_at,
      is_expired: share.isExpired(),
      is_active: share.isActive(),
      // Include related entities if loaded
      matter: share.matter ? {
        id: share.matter.id,
        title: share.matter.title,
        status: share.matter.status,
      } : undefined,
      shared_by_firm: share.shared_by_firm ? {
        id: share.shared_by_firm.id,
        name: share.shared_by_firm.name,
      } : undefined,
      shared_with_firm: share.shared_with_firm ? {
        id: share.shared_with_firm.id,
        name: share.shared_with_firm.name,
      } : undefined,
      shared_by_user: share.shared_by_user ? {
        id: share.shared_by_user.id,
        display_name: share.shared_by_user.display_name,
        email: share.shared_by_user.email,
      } : undefined,
    };
  }
}