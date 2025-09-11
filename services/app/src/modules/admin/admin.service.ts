import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User, Firm, RetentionClass, Document, Matter, Client, AuditLog } from '../../common/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateRetentionClassDto } from './dto/create-retention-class.dto';
import { UpdateRetentionClassDto } from './dto/update-retention-class.dto';
import { UserInfo } from '../../auth/auth.service';

interface SystemStats {
  users: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };
  documents: {
    total: number;
    confidential: number;
    under_legal_hold: number;
    soft_deleted: number;
  };
  matters: {
    total: number;
    active: number;
    by_status: Record<string, number>;
  };
  storage: {
    total_size_bytes: number;
    average_document_size: number;
  };
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  // Define available roles with their descriptions and permissions
  private readonly roles = [
    {
      name: 'super_admin',
      description: 'System-wide administrator with full access',
      permissions: ['admin', 'user_management', 'firm_management', 'system_config'],
    },
    {
      name: 'firm_admin',
      description: 'Firm administrator with firm-wide access',
      permissions: ['admin', 'user_management', 'client_management', 'matter_management', 'document_management', 'retention', 'legal_hold'],
    },
    {
      name: 'legal_manager',
      description: 'Legal manager with elevated permissions',
      permissions: ['document_management', 'matter_management', 'client_management', 'legal_hold', 'retention'],
    },
    {
      name: 'legal_professional',
      description: 'Lawyer or legal professional',
      permissions: ['document', 'matter', 'client', 'document_upload', 'legal_review'],
    },
    {
      name: 'paralegal',
      description: 'Paralegal with document and case management access',
      permissions: ['document', 'matter', 'client', 'document_upload'],
    },
    {
      name: 'client_user',
      description: 'Client portal user with limited access',
      permissions: ['client_portal', 'document_view'],
    },
  ];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Firm)
    private firmRepository: Repository<Firm>,
    @InjectRepository(RetentionClass)
    private retentionClassRepository: Repository<RetentionClass>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  // User Management
  async getUsers(query: any, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const { page = 1, limit = 20, search, role, firm_id, active_only } = query;
    const effectiveFirmId = firm_id || (currentUser.roles.includes('super_admin') ? undefined : currentUser.firm_id);

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.firm', 'firm')
      .orderBy('user.created_at', 'DESC');

    if (effectiveFirmId) {
      queryBuilder.andWhere('user.firm_id = :firmId', { firmId: effectiveFirmId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.display_name ILIKE :search OR user.email ILIKE :search OR user.first_name ILIKE :search OR user.last_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere(':role = ANY(user.roles)', { role });
    }

    if (active_only === 'true') {
      queryBuilder.andWhere('user.is_active = true');
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles,
        firm: user.firm ? { id: user.firm.id, name: user.firm.name } : null,
        is_active: user.is_active,
        last_login_at: user.last_login_at,
        created_at: user.created_at,
      })),
      total,
      page,
      limit,
    };
  }

  async getUser(userId: string, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['firm'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Firm admins can only see users from their firm
    if (!currentUser.roles.includes('super_admin') && user.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot access user from different firm');
    }

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      client_ids: user.client_ids,
      firm: user.firm ? { id: user.firm.id, name: user.firm.name } : null,
      job_title: user.job_title,
      department: user.department,
      phone: user.phone,
      is_active: user.is_active,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async createUser(createUserDto: CreateUserDto, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    // Validate firm access
    if (!currentUser.roles.includes('super_admin') && createUserDto.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot create user for different firm');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Validate firm exists
    const firm = await this.firmRepository.findOne({
      where: { id: createUserDto.firm_id },
    });

    if (!firm) {
      throw new BadRequestException('Firm not found');
    }

    // Validate roles
    const validRoles = this.roles.map(r => r.name);
    const invalidRoles = createUserDto.roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      keycloak_id: null, // Will be set when user first logs in
    });

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User created: ${savedUser.email} by ${currentUser.email}`, {
      userId: savedUser.id,
      adminId: currentUser.sub,
    });

    return this.getUser(savedUser.id, currentUser);
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Firm admins can only update users from their firm
    if (!currentUser.roles.includes('super_admin') && user.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot update user from different firm');
    }

    // Validate roles if provided
    if (updateUserDto.roles) {
      const validRoles = this.roles.map(r => r.name);
      const invalidRoles = updateUserDto.roles.filter(role => !validRoles.includes(role));
      if (invalidRoles.length > 0) {
        throw new BadRequestException(`Invalid roles: ${invalidRoles.join(', ')}`);
      }
    }

    // Update user
    await this.userRepository.update(userId, updateUserDto);

    this.logger.log(`User updated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
      changes: updateUserDto,
    });

    return this.getUser(userId, currentUser);
  }

  async deactivateUser(userId: string, currentUser: UserInfo): Promise<void> {
    this.validateAdminAccess(currentUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Firm admins can only deactivate users from their firm
    if (!currentUser.roles.includes('super_admin') && user.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot deactivate user from different firm');
    }

    // Prevent self-deactivation
    if (userId === currentUser.sub) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    await this.userRepository.update(userId, { is_active: false });

    this.logger.log(`User deactivated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
    });
  }

  async activateUser(userId: string, currentUser: UserInfo): Promise<void> {
    this.validateAdminAccess(currentUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Firm admins can only activate users from their firm
    if (!currentUser.roles.includes('super_admin') && user.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot activate user from different firm');
    }

    await this.userRepository.update(userId, { is_active: true });

    this.logger.log(`User activated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
    });
  }

  // Role Management
  async getRoles(): Promise<any[]> {
    return this.roles;
  }

  async updateUserRoles(userId: string, roles: string[], currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Firm admins can only update users from their firm
    if (!currentUser.roles.includes('super_admin') && user.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot update user from different firm');
    }

    // Validate roles
    const validRoles = this.roles.map(r => r.name);
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalidRoles.join(', ')}`);
    }

    await this.userRepository.update(userId, { roles });

    this.logger.log(`User roles updated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
      newRoles: roles,
      oldRoles: user.roles,
    });

    return this.getUser(userId, currentUser);
  }

  // Retention Class Management
  async getRetentionClasses(firmId: string | undefined, currentUser: UserInfo): Promise<RetentionClass[]> {
    this.validateAdminAccess(currentUser);

    const effectiveFirmId = firmId || currentUser.firm_id;

    if (!effectiveFirmId) {
      throw new BadRequestException('Firm ID is required');
    }

    // Firm admins can only see retention classes from their firm
    if (!currentUser.roles.includes('super_admin') && effectiveFirmId !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot access retention classes from different firm');
    }

    return this.retentionClassRepository.find({
      where: { firm_id: effectiveFirmId },
      order: { name: 'ASC' },
    });
  }

  async getRetentionClass(retentionClassId: string, currentUser: UserInfo): Promise<RetentionClass> {
    this.validateAdminAccess(currentUser);

    const retentionClass = await this.retentionClassRepository.findOne({
      where: { id: retentionClassId },
      relations: ['firm'],
    });

    if (!retentionClass) {
      throw new NotFoundException('Retention class not found');
    }

    // Firm admins can only see retention classes from their firm
    if (!currentUser.roles.includes('super_admin') && retentionClass.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot access retention class from different firm');
    }

    return retentionClass;
  }

  async createRetentionClass(createRetentionClassDto: CreateRetentionClassDto, currentUser: UserInfo): Promise<RetentionClass> {
    this.validateAdminAccess(currentUser);

    if (!currentUser.firm_id) {
      throw new BadRequestException('User must belong to a firm to create retention classes');
    }

    const retentionClass = this.retentionClassRepository.create({
      ...createRetentionClassDto,
      firm_id: currentUser.firm_id,
    });

    const savedRetentionClass = await this.retentionClassRepository.save(retentionClass);

    this.logger.log(`Retention class created: ${savedRetentionClass.name} by ${currentUser.email}`, {
      retentionClassId: savedRetentionClass.id,
      adminId: currentUser.sub,
    });

    return savedRetentionClass;
  }

  async updateRetentionClass(
    retentionClassId: string,
    updateRetentionClassDto: UpdateRetentionClassDto,
    currentUser: UserInfo,
  ): Promise<RetentionClass> {
    this.validateAdminAccess(currentUser);

    const retentionClass = await this.getRetentionClass(retentionClassId, currentUser);

    await this.retentionClassRepository.update(retentionClassId, updateRetentionClassDto);

    this.logger.log(`Retention class updated: ${retentionClass.name} by ${currentUser.email}`, {
      retentionClassId,
      adminId: currentUser.sub,
      changes: updateRetentionClassDto,
    });

    return this.getRetentionClass(retentionClassId, currentUser);
  }

  async deleteRetentionClass(retentionClassId: string, currentUser: UserInfo): Promise<void> {
    this.validateAdminAccess(currentUser);

    const retentionClass = await this.getRetentionClass(retentionClassId, currentUser);

    // Check if any documents are using this retention class
    const documentsUsingClass = await this.documentRepository.count({
      where: { retention_class_id: retentionClassId },
    });

    if (documentsUsingClass > 0) {
      throw new BadRequestException(
        `Cannot delete retention class: ${documentsUsingClass} documents are using it`,
      );
    }

    await this.retentionClassRepository.delete(retentionClassId);

    this.logger.log(`Retention class deleted: ${retentionClass.name} by ${currentUser.email}`, {
      retentionClassId,
      adminId: currentUser.sub,
    });
  }

  // System Statistics
  async getSystemStats(currentUser: UserInfo): Promise<SystemStats> {
    this.validateAdminAccess(currentUser);

    const firmId = currentUser.roles.includes('super_admin') ? undefined : currentUser.firm_id;

    // User stats
    const totalUsers = await this.userRepository.count(
      firmId ? { where: { firm_id: firmId } } : undefined,
    );
    const activeUsers = await this.userRepository.count(
      firmId
        ? { where: { firm_id: firmId, is_active: true } }
        : { where: { is_active: true } },
    );

    // User role distribution
    const users = await this.userRepository.find(
      firmId
        ? { where: { firm_id: firmId }, select: ['roles'] }
        : { select: ['roles'] },
    );
    const roleStats: Record<string, number> = {};
    users.forEach(user => {
      user.roles.forEach(role => {
        roleStats[role] = (roleStats[role] || 0) + 1;
      });
    });

    // Document stats
    const documentQuery = firmId ? { firm_id: firmId } : {};
    const totalDocuments = await this.documentRepository.count({ where: { ...documentQuery, is_deleted: false } });
    const confidentialDocuments = await this.documentRepository
      .createQueryBuilder('document')
      .leftJoin('document.metadata', 'meta')
      .where('document.is_deleted = false')
      .andWhere('meta.confidential = true')
      .andWhere(firmId ? 'document.firm_id = :firmId' : '1=1', firmId ? { firmId } : {})
      .getCount();
    const legalHoldDocuments = await this.documentRepository.count({
      where: { ...documentQuery, legal_hold: true, is_deleted: false },
    });
    const softDeletedDocuments = await this.documentRepository.count({
      where: { ...documentQuery, is_deleted: true },
    });

    // Storage stats
    const storageResult = await this.documentRepository
      .createQueryBuilder('document')
      .select('SUM(document.size_bytes)', 'total_size')
      .addSelect('AVG(document.size_bytes)', 'avg_size')
      .where('document.is_deleted = false')
      .andWhere(firmId ? 'document.firm_id = :firmId' : '1=1', firmId ? { firmId } : {})
      .getRawOne();

    // Matter stats
    const totalMatters = await this.matterRepository.count(
      firmId ? { where: { firm_id: firmId } } : undefined,
    );
    const activeMatters = await this.matterRepository.count(
      firmId
        ? { where: { firm_id: firmId, status: 'active' } }
        : { where: { status: 'active' } },
    );

    const matters = await this.matterRepository.find(
      firmId
        ? { where: { firm_id: firmId }, select: ['status'] }
        : { select: ['status'] },
    );
    const statusStats: Record<string, number> = {};
    matters.forEach(matter => {
      statusStats[matter.status] = (statusStats[matter.status] || 0) + 1;
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        by_role: roleStats,
      },
      documents: {
        total: totalDocuments,
        confidential: confidentialDocuments,
        under_legal_hold: legalHoldDocuments,
        soft_deleted: softDeletedDocuments,
      },
      matters: {
        total: totalMatters,
        active: activeMatters,
        by_status: statusStats,
      },
      storage: {
        total_size_bytes: parseInt(storageResult?.total_size || '0'),
        average_document_size: parseFloat(storageResult?.avg_size || '0'),
      },
    };
  }

  // Audit Logs
  async getAuditLogs(query: any, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const { page = 1, limit = 50, user_id, action, resource_type, from_date, to_date } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC');

    // Firm admins can only see audit logs from their firm
    if (!currentUser.roles.includes('super_admin')) {
      queryBuilder.andWhere('audit.firm_id = :firmId', { firmId: currentUser.firm_id });
    }

    if (user_id) {
      queryBuilder.andWhere('audit.user_id = :userId', { userId: user_id });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (resource_type) {
      queryBuilder.andWhere('audit.resource_type = :resourceType', { resourceType: resource_type });
    }

    if (from_date) {
      queryBuilder.andWhere('audit.timestamp >= :fromDate', { fromDate: new Date(from_date) });
    }

    if (to_date) {
      queryBuilder.andWhere('audit.timestamp <= :toDate', { toDate: new Date(to_date) });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [auditLogs, total] = await queryBuilder.getManyAndCount();

    return {
      audit_logs: auditLogs,
      total,
      page,
      limit,
    };
  }

  private validateAdminAccess(user: UserInfo): void {
    if (!user.roles.some(role => ['super_admin', 'firm_admin'].includes(role))) {
      throw new ForbiddenException('Admin access required');
    }
  }
}