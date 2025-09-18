import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, In } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { LegalHold, LegalHoldStatus } from '../../common/entities/legal-hold.entity';
import { Document } from '../../common/entities/document.entity';
import { Matter } from '../../common/entities/matter.entity';
import { User } from '../../common/entities/user.entity';
import { LegalHoldCustodian, CustodianStatus } from '../../common/entities/legal-hold-custodian.entity';
import { CreateLegalHoldDto } from './dto/create-legal-hold.dto';
import { UpdateLegalHoldDto } from './dto/update-legal-hold.dto';
import { LegalHoldResponseDto } from './dto/legal-hold-response.dto';
import { AssignCustodiansDto } from './dto/assign-custodians.dto';
import { CustodianResponseDto } from './dto/custodian-response.dto';
import { AcknowledgeHoldDto } from './dto/acknowledge-hold.dto';
import { UserInfo } from '../../auth/auth.service';
import { AuditService } from '../../common/services/audit.service';
import { NotificationService } from '../../common/services/notification.service';

export interface LegalHoldQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: LegalHoldStatus;
  type?: string;
  matter_id?: string;
  firm_id?: string;
  created_by?: string;
}

@Injectable()
export class LegalHoldsService {
  constructor(
    @InjectRepository(LegalHold)
    private readonly legalHoldRepository: Repository<LegalHold>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LegalHoldCustodian)
    private readonly custodianRepository: Repository<LegalHoldCustodian>,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(
    createLegalHoldDto: CreateLegalHoldDto,
    user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    const { matter_id, ...holdData } = createLegalHoldDto;

    // Validate matter exists and user has access
    if (matter_id) {
      const matter = await this.matterRepository.findOne({
        where: { 
          id: matter_id,
          ...(user.firm_id ? { firm_id: user.firm_id } : {}),
        },
      });

      if (!matter) {
        throw new NotFoundException('Matter not found or access denied');
      }
    }

    // Create the legal hold
    const legalHold = this.legalHoldRepository.create({
      ...holdData,
      matter_id,
      firm_id: user.firm_id,
      created_by: user.sub,
      status: 'active',
      documents_count: 0,
      custodians_count: 0,
    });

    const savedHold = await this.legalHoldRepository.save(legalHold);

    // Apply hold to existing documents if auto-apply is enabled
    if (savedHold.auto_apply_to_new_documents && savedHold.search_criteria) {
      await this.applyHoldToExistingDocuments(savedHold.id, user);
    }

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_created',
      resource_type: 'legal_hold',
      resource_id: savedHold.id,
      details: {
        hold_name: savedHold.name,
        hold_type: savedHold.type,
        matter_id: savedHold.matter_id,
        auto_apply: savedHold.auto_apply_to_new_documents,
      },
      ip_address: '0.0.0.0', // TODO: Get from request
    });

    return this.findOne(savedHold.id, user);
  }

  async findAll(
    query: LegalHoldQuery,
    user: UserInfo,
  ): Promise<{
    data: LegalHoldResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      type,
      matter_id,
      firm_id,
      created_by,
    } = query;

    const queryBuilder = this.legalHoldRepository
      .createQueryBuilder('hold')
      .leftJoinAndSelect('hold.firm', 'firm')
      .leftJoinAndSelect('hold.matter', 'matter')
      .leftJoinAndSelect('hold.created_by_user', 'created_by_user')
      .leftJoinAndSelect('hold.released_by_user', 'released_by_user');

    // Apply firm-based filtering
    if (user.firm_id && !user.roles.includes('super_admin')) {
      queryBuilder.andWhere('hold.firm_id = :firm_id', { firm_id: user.firm_id });
    } else if (firm_id) {
      queryBuilder.andWhere('hold.firm_id = :firm_id', { firm_id });
    }

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(hold.name ILIKE :search OR hold.description ILIKE :search OR hold.reason ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('hold.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('hold.type = :type', { type });
    }

    if (matter_id) {
      queryBuilder.andWhere('hold.matter_id = :matter_id', { matter_id });
    }

    if (created_by) {
      queryBuilder.andWhere('hold.created_by = :created_by', { created_by });
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('hold.created_at', 'DESC');

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [holds, total] = await queryBuilder.getManyAndCount();

    const data = holds.map(hold => 
      plainToClass(LegalHoldResponseDto, hold, { excludeExtraneousValues: true })
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: UserInfo): Promise<LegalHoldResponseDto> {
    const queryBuilder = this.legalHoldRepository
      .createQueryBuilder('hold')
      .leftJoinAndSelect('hold.firm', 'firm')
      .leftJoinAndSelect('hold.matter', 'matter')
      .leftJoinAndSelect('hold.created_by_user', 'created_by_user')
      .leftJoinAndSelect('hold.released_by_user', 'released_by_user')
      .leftJoinAndSelect('hold.documents', 'documents')
      .where('hold.id = :id', { id });

    // Apply firm-based filtering
    if (user.firm_id && !user.roles.includes('super_admin')) {
      queryBuilder.andWhere('hold.firm_id = :firm_id', { firm_id: user.firm_id });
    }

    const hold = await queryBuilder.getOne();

    if (!hold) {
      throw new NotFoundException('Legal hold not found or access denied');
    }

    return plainToClass(LegalHoldResponseDto, hold, { excludeExtraneousValues: true });
  }

  async update(
    id: string,
    updateLegalHoldDto: UpdateLegalHoldDto,
    user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    const existingHold = await this.findOne(id, user);

    // Validate matter if being updated
    if (updateLegalHoldDto.matter_id) {
      const matter = await this.matterRepository.findOne({
        where: { 
          id: updateLegalHoldDto.matter_id,
          ...(user.firm_id ? { firm_id: user.firm_id } : {}),
        },
      });

      if (!matter) {
        throw new NotFoundException('Matter not found or access denied');
      }
    }

    // Update the hold
    await this.legalHoldRepository.update(id, updateLegalHoldDto);

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_updated',
      resource_type: 'legal_hold',
      resource_id: id,
      details: {
        changes: updateLegalHoldDto,
        previous_values: existingHold,
      },
      ip_address: '0.0.0.0', // TODO: Get from request
    });

    return this.findOne(id, user);
  }

  async release(
    id: string,
    releaseReason: string,
    user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    const hold = await this.findOne(id, user);

    if (hold.status !== 'active') {
      throw new BadRequestException('Legal hold is not active');
    }

    // Release the hold
    await this.legalHoldRepository.update(id, {
      status: 'released',
      released_by: user.sub,
      released_at: new Date(),
      release_reason: releaseReason,
    });

    // Remove hold from all documents
    await this.documentRepository.update(
      { legal_hold_ref: id },
      {
        legal_hold: false,
        legal_hold_reason: null,
        legal_hold_set_by: null,
        legal_hold_set_at: null,
        legal_hold_ref: null,
      },
    );

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_released',
      resource_type: 'legal_hold',
      resource_id: id,
      details: {
        release_reason: releaseReason,
        documents_released: hold.documents_count,
      },
      ip_address: '0.0.0.0', // TODO: Get from request
    });

    return this.findOne(id, user);
  }

  async remove(id: string, user: UserInfo): Promise<void> {
    const hold = await this.findOne(id, user);

    if (hold.status === 'active') {
      throw new BadRequestException('Cannot delete active legal hold. Release it first.');
    }

    await this.legalHoldRepository.delete(id);

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_deleted',
      resource_type: 'legal_hold',
      resource_id: id,
      details: {
        hold_name: hold.name,
        hold_type: hold.type,
        final_status: hold.status,
      },
      ip_address: '0.0.0.0', // TODO: Get from request
    });
  }

  async applyHoldToDocuments(
    holdId: string,
    documentIds: string[],
    user: UserInfo,
  ): Promise<{ applied: number; skipped: number }> {
    const hold = await this.findOne(holdId, user);

    if (hold.status !== 'active') {
      throw new BadRequestException('Legal hold is not active');
    }

    // Get documents that aren't already on hold
    const documents = await this.documentRepository.find({
      where: {
        id: In(documentIds),
        legal_hold: false,
        ...(user.firm_id ? { firm_id: user.firm_id } : {}),
      },
    });

    const applied = documents.length;
    const skipped = documentIds.length - applied;

    // Apply hold to documents
    if (documents.length > 0) {
      await this.documentRepository.update(
        { id: In(documents.map(d => d.id)) },
        {
          legal_hold: true,
          legal_hold_reason: hold.reason,
          legal_hold_set_by: user.sub,
          legal_hold_set_at: new Date(),
          legal_hold_ref: holdId,
        },
      );

      // Update documents count
      await this.legalHoldRepository.update(holdId, {
        documents_count: hold.documents_count + applied,
      });
    }

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_applied_to_documents',
      resource_type: 'legal_hold',
      resource_id: holdId,
      details: {
        document_ids: documentIds,
        applied_count: applied,
        skipped_count: skipped,
      },
      ip_address: '0.0.0.0', // TODO: Get from request
    });

    return { applied, skipped };
  }

  private async applyHoldToExistingDocuments(
    holdId: string,
    user: UserInfo,
  ): Promise<void> {
    const hold = await this.legalHoldRepository.findOne({
      where: { id: holdId },
    });

    if (!hold?.search_criteria) {
      return;
    }

    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.legal_hold = false')
      .andWhere('doc.firm_id = :firm_id', { firm_id: hold.firm_id });

    // Apply search criteria
    const { keywords, date_range, document_types, matters } = hold.search_criteria;

    if (keywords && keywords.length > 0) {
      queryBuilder.andWhere(
        '(doc.title ILIKE ANY(:keywords) OR doc.filename ILIKE ANY(:keywords))',
        { keywords: keywords.map(k => `%${k}%`) },
      );
    }

    if (date_range?.start || date_range?.end) {
      if (date_range.start) {
        queryBuilder.andWhere('doc.created_at >= :start_date', {
          start_date: date_range.start,
        });
      }
      if (date_range.end) {
        queryBuilder.andWhere('doc.created_at <= :end_date', {
          end_date: date_range.end,
        });
      }
    }

    if (document_types && document_types.length > 0) {
      queryBuilder.andWhere('doc.document_type = ANY(:types)', {
        types: document_types,
      });
    }

    if (matters && matters.length > 0) {
      queryBuilder.andWhere('doc.matter_id = ANY(:matters)', {
        matters,
      });
    }

    const documents = await queryBuilder.getMany();

    if (documents.length > 0) {
      await this.applyHoldToDocuments(
        holdId,
        documents.map(d => d.id),
        user,
      );
    }
  }

  async getHoldStatistics(user: UserInfo): Promise<{
    total_holds: number;
    active_holds: number;
    released_holds: number;
    expired_holds: number;
    total_documents_on_hold: number;
    holds_by_type: Record<string, number>;
  }> {
    const queryBuilder = this.legalHoldRepository
      .createQueryBuilder('hold');

    // Apply firm-based filtering
    if (user.firm_id && !user.roles.includes('super_admin')) {
      queryBuilder.where('hold.firm_id = :firm_id', { firm_id: user.firm_id });
    }

    const [
      totalHolds,
      activeHolds,
      releasedHolds,
      expiredHolds,
      holdsByType,
    ] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('hold.status = :status', { status: 'active' }).getCount(),
      queryBuilder.clone().andWhere('hold.status = :status', { status: 'released' }).getCount(),
      queryBuilder.clone().andWhere('hold.status = :status', { status: 'expired' }).getCount(),
      queryBuilder
        .clone()
        .select('hold.type', 'type')
        .addSelect('COUNT(*)', 'count')
        .groupBy('hold.type')
        .getRawMany(),
    ]);

    // Get total documents on hold
    const documentsQueryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.legal_hold = true');

    if (user.firm_id && !user.roles.includes('super_admin')) {
      documentsQueryBuilder.andWhere('doc.firm_id = :firm_id', { firm_id: user.firm_id });
    }

    const totalDocumentsOnHold = await documentsQueryBuilder.getCount();

    const holdsByTypeMap = holdsByType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      total_holds: totalHolds,
      active_holds: activeHolds,
      released_holds: releasedHolds,
      expired_holds: expiredHolds,
      total_documents_on_hold: totalDocumentsOnHold,
      holds_by_type: holdsByTypeMap,
    };
  }

  // Custodian Management Methods

  async assignCustodians(
    holdId: string,
    assignCustodiansDto: AssignCustodiansDto,
    user: UserInfo,
  ): Promise<{ assigned: number; already_assigned: number; custodians: CustodianResponseDto[] }> {
    const hold = await this.findOne(holdId, user);

    if (hold.status !== 'active') {
      throw new BadRequestException('Cannot assign custodians to inactive legal hold');
    }

    const { custodian_ids, instructions, send_notification = true } = assignCustodiansDto;

    // Check which custodians are already assigned
    const existingCustodians = await this.custodianRepository.find({
      where: {
        legal_hold_id: holdId,
        custodian_id: In(custodian_ids),
      },
    });

    const existingCustodianIds = existingCustodians.map(c => c.custodian_id);
    const newCustodianIds = custodian_ids.filter(id => !existingCustodianIds.includes(id));

    // Validate that all users exist and have access
    const users = await this.userRepository.find({
      where: {
        id: In(newCustodianIds),
        ...(user.firm_id ? { firm_id: user.firm_id } : {}),
        is_active: true,
      },
    });

    if (users.length !== newCustodianIds.length) {
      throw new BadRequestException('Some custodians were not found or are inactive');
    }

    // Create custodian assignments
    const custodianAssignments = newCustodianIds.map(custodian_id => 
      this.custodianRepository.create({
        legal_hold_id: holdId,
        custodian_id,
        status: CustodianStatus.PENDING,
        assigned_by: user.sub,
        custodian_metadata: { instructions },
      })
    );

    const savedCustodians = await this.custodianRepository.save(custodianAssignments);

    // Update custodians count
    await this.legalHoldRepository.update(holdId, {
      custodians_count: hold.custodians_count + savedCustodians.length,
    });

    // Send notifications if requested
    if (send_notification && savedCustodians.length > 0) {
      const custodiansWithRelations = await this.custodianRepository.find({
        where: { id: In(savedCustodians.map(c => c.id)) },
        relations: ['custodian', 'legal_hold'],
      });

      const notificationResults = await this.notificationService.sendBulkLegalHoldNotices(
        custodiansWithRelations as any,
      );

      // Update notice_sent_at for successful notifications
      const successfulCustodians = custodiansWithRelations.filter((_, index) => 
        notificationResults.results[index]?.success
      );

      if (successfulCustodians.length > 0) {
        await this.custodianRepository.update(
          { id: In(successfulCustodians.map(c => c.id)) },
          { notice_sent_at: new Date() }
        );
      }
    }

    // Get all custodians for this hold to return
    const allCustodians = await this.custodianRepository.find({
      where: { legal_hold_id: holdId },
      relations: ['custodian'],
    });

    const custodianDtos = allCustodians.map(custodian =>
      plainToClass(CustodianResponseDto, custodian, { excludeExtraneousValues: true })
    );

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_custodians_assigned',
      resource_type: 'legal_hold',
      resource_id: holdId,
      details: {
        assigned_custodians: newCustodianIds,
        notification_sent: send_notification,
        total_custodians: allCustodians.length,
      },
      ip_address: '0.0.0.0',
    });

    return {
      assigned: savedCustodians.length,
      already_assigned: existingCustodians.length,
      custodians: custodianDtos,
    };
  }

  async getCustodians(holdId: string, user: UserInfo): Promise<CustodianResponseDto[]> {
    await this.findOne(holdId, user); // Verify access

    const custodians = await this.custodianRepository.find({
      where: { legal_hold_id: holdId },
      relations: ['custodian'],
      order: { created_at: 'DESC' },
    });

    return custodians.map(custodian =>
      plainToClass(CustodianResponseDto, custodian, { excludeExtraneousValues: true })
    );
  }

  async acknowledgeLegalHold(
    holdId: string,
    acknowledgeDto: AcknowledgeHoldDto,
    user: UserInfo,
  ): Promise<CustodianResponseDto> {
    const custodian = await this.custodianRepository.findOne({
      where: {
        legal_hold_id: holdId,
        custodian_id: user.sub,
      },
      relations: ['custodian', 'legal_hold'],
    });

    if (!custodian) {
      throw new NotFoundException('Custodian assignment not found');
    }

    if (custodian.status === CustodianStatus.ACKNOWLEDGED) {
      throw new BadRequestException('Legal hold already acknowledged');
    }

    // Update custodian status
    const updateData: any = {
      status: CustodianStatus.ACKNOWLEDGED,
      acknowledged_at: new Date(),
      acknowledgment_method: acknowledgeDto.acknowledgment_method,
    };

    if (acknowledgeDto.notes) {
      updateData.custodian_metadata = {
        ...(custodian.custodian_metadata || {}),
        acknowledgment_notes: acknowledgeDto.notes,
      };
    }

    await this.custodianRepository.update(custodian.id, updateData);

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_acknowledged',
      resource_type: 'legal_hold',
      resource_id: holdId,
      details: {
        custodian_id: user.sub,
        acknowledgment_method: acknowledgeDto.acknowledgment_method,
        notes: acknowledgeDto.notes,
      },
      ip_address: '0.0.0.0',
    });

    const updatedCustodian = await this.custodianRepository.findOne({
      where: { id: custodian.id },
      relations: ['custodian'],
    });

    return plainToClass(CustodianResponseDto, updatedCustodian, { excludeExtraneousValues: true });
  }

  async removeCustodian(
    holdId: string,
    custodianId: string,
    user: UserInfo,
  ): Promise<void> {
    const hold = await this.findOne(holdId, user);

    const custodian = await this.custodianRepository.findOne({
      where: {
        legal_hold_id: holdId,
        custodian_id: custodianId,
      },
    });

    if (!custodian) {
      throw new NotFoundException('Custodian assignment not found');
    }

    await this.custodianRepository.delete(custodian.id);

    // Update custodians count
    await this.legalHoldRepository.update(holdId, {
      custodians_count: Math.max(0, hold.custodians_count - 1),
    });

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_custodian_removed',
      resource_type: 'legal_hold',
      resource_id: holdId,
      details: {
        removed_custodian: custodianId,
        custodian_status: custodian.status,
      },
      ip_address: '0.0.0.0',
    });
  }

  async sendComplianceReminders(
    holdId: string,
    user: UserInfo,
  ): Promise<{ sent: number; failed: number }> {
    await this.findOne(holdId, user); // Verify access

    const pendingCustodians = await this.custodianRepository.find({
      where: {
        legal_hold_id: holdId,
        status: In([CustodianStatus.PENDING, CustodianStatus.NON_COMPLIANT]),
      },
      relations: ['custodian', 'legal_hold'],
    });

    if (pendingCustodians.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const custodian of pendingCustodians) {
      const result = await this.notificationService.sendComplianceReminder(custodian as any);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    // Update last notification sent time for the hold
    await this.legalHoldRepository.update(holdId, {
      last_notification_sent: new Date(),
    });

    // Audit log
    await this.auditService.log({
      user,
      action: 'legal_hold_compliance_reminders_sent',
      resource_type: 'legal_hold',
      resource_id: holdId,
      details: {
        custodians_contacted: pendingCustodians.length,
        successful_notifications: sent,
        failed_notifications: failed,
      },
      ip_address: '0.0.0.0',
    });

    return { sent, failed };
  }

  async getCustodianComplianceStatus(user: UserInfo): Promise<{
    total_assignments: number;
    pending: number;
    acknowledged: number;
    compliant: number;
    non_compliant: number;
    assignments: CustodianResponseDto[];
  }> {
    const custodianAssignments = await this.custodianRepository.find({
      where: {
        custodian_id: user.sub,
      },
      relations: ['custodian', 'legal_hold'],
      order: { created_at: 'DESC' },
    });

    const statusCounts = custodianAssignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assignmentDtos = custodianAssignments.map(assignment =>
      plainToClass(CustodianResponseDto, assignment, { excludeExtraneousValues: true })
    );

    return {
      total_assignments: custodianAssignments.length,
      pending: statusCounts[CustodianStatus.PENDING] || 0,
      acknowledged: statusCounts[CustodianStatus.ACKNOWLEDGED] || 0,
      compliant: statusCounts[CustodianStatus.COMPLIANT] || 0,
      non_compliant: statusCounts[CustodianStatus.NON_COMPLIANT] || 0,
      assignments: assignmentDtos,
    };
  }
}