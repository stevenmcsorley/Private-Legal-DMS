import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';
import { User, Firm, Team, RetentionClass, Document, Matter, Client, AuditLog, SystemSettings } from '../../common/entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { BulkUserOperationDto, BulkOperationType } from './dto/bulk-user-operation.dto';
import { SystemSettingsDto } from './dto/system-settings.dto';
import { CreateRetentionClassDto } from './dto/create-retention-class.dto';
import { UpdateRetentionClassDto } from './dto/update-retention-class.dto';
import { UserInfo } from '../../auth/auth.service';
import { WatermarkService } from '../documents/services/watermark.service';

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

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Firm)
    private firmRepository: Repository<Firm>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
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
    @InjectRepository(SystemSettings)
    private systemSettingsRepository: Repository<SystemSettings>,
    private watermarkService: WatermarkService,
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
        '(user.display_name ILIKE :search OR user.email ILIKE :search)',
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
        roles: user.roles,
        attributes: user.attributes,
        firm: user.firm ? { id: user.firm.id, name: user.firm.name } : null,
        is_active: user.is_active,
        clearance_level: user.clearance_level || 5,
        created_at: user.created_at,
        client_count: user.attributes?.client_ids?.length || 0,
        has_client_access: !!(user.attributes?.client_ids && user.attributes.client_ids.length > 0),
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

    // Get detailed client information if user has client_ids
    let assignedClients = null;
    if (user.attributes?.client_ids && Array.isArray(user.attributes.client_ids)) {
      const clients = await this.clientRepository.find({
        where: { id: In(user.attributes.client_ids) },
        select: ['id', 'name', 'contact_email', 'firm_id'],
      });
      assignedClients = clients.map(client => ({
        id: client.id,
        name: client.name,
        contact_email: client.contact_email,
        firm_match: client.firm_id === user.firm_id,
      }));
    }

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      roles: user.roles,
      attributes: user.attributes,
      clearance_level: user.clearance_level,
      firm: user.firm ? { id: user.firm.id, name: user.firm.name } : null,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      client_assignments: {
        client_ids: user.attributes?.client_ids || [],
        assigned_clients: assignedClients,
        total_assignments: assignedClients?.length || 0,
      },
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
    await this.validateRoles(createUserDto.roles);

    // Create user
    const { client_ids, ...userWithoutClientIds } = createUserDto;
    const user = this.userRepository.create({
      ...userWithoutClientIds,
      keycloak_id: null, // Will be set when user first logs in
      attributes: {
        ...createUserDto.attributes,
        ...(client_ids && client_ids.length > 0 ? { client_ids } : {}),
      },
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
      await this.validateRoles(updateUserDto.roles);
    }

    // Update user
    const { client_ids, ...userUpdateWithoutClientIds } = updateUserDto;
    const updateData = {
      ...userUpdateWithoutClientIds,
      attributes: {
        ...user.attributes,
        ...updateUserDto.attributes,
        ...(client_ids !== undefined ? { client_ids } : {}),
      },
    };
    await this.userRepository.update(userId, updateData);

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
  async getRoles(): Promise<{name: string; description: string}[]> {
    // Return hardcoded roles that match Keycloak configuration
    return [
      { name: 'super_admin', description: 'System-wide super administrator' },
      { name: 'firm_admin', description: 'Firm administrator' },
      { name: 'legal_manager', description: 'Legal manager' },
      { name: 'legal_professional', description: 'Legal professional (lawyer)' },
      { name: 'client_user', description: 'Client portal user' },
      { name: 'external_partner', description: 'External partner from another firm' },
      { name: 'support_staff', description: 'Support staff' },
    ];
  }

  async validateRoles(roleNames: string[]): Promise<void> {
    const validRoles = await this.getRoles();
    const validRoleNames = validRoles.map(r => r.name);
    const invalidRoles = roleNames.filter(role => !validRoleNames.includes(role));
    
    if (invalidRoles.length > 0) {
      throw new BadRequestException(`Invalid roles: ${invalidRoles.join(', ')}`);
    }
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
    await this.validateRoles(roles);

    await this.userRepository.update(userId, { roles });

    this.logger.log(`User roles updated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
      newRoles: roles,
      oldRoles: user.roles,
    });

    return this.getUser(userId, currentUser);
  }

  async updateUserClients(userId: string, clientIds: string[], currentUser: UserInfo): Promise<any> {
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

    // Validate that all client IDs exist and belong to the same firm
    if (clientIds.length > 0) {
      const clients = await this.clientRepository.find({
        where: { id: In(clientIds) },
      });

      if (clients.length !== clientIds.length) {
        throw new BadRequestException('One or more client IDs are invalid');
      }

      // Check firm access for each client
      const effectiveFirmId = currentUser.roles.includes('super_admin') ? user.firm_id : currentUser.firm_id;
      const invalidClients = clients.filter(client => client.firm_id !== effectiveFirmId);
      if (invalidClients.length > 0) {
        throw new ForbiddenException('Cannot assign clients from different firm');
      }
    }

    // Update user attributes with client_ids
    const updatedAttributes = {
      ...user.attributes,
      client_ids: clientIds,
    };

    await this.userRepository.update(userId, { attributes: updatedAttributes });

    this.logger.log(`User client assignments updated: ${user.email} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
      newClientIds: clientIds,
      oldClientIds: user.attributes?.client_ids || [],
    });

    return this.getUser(userId, currentUser);
  }

  async updateUserClearance(userId: string, clearanceLevel: number, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    // Validate clearance level
    if (clearanceLevel < 1 || clearanceLevel > 10) {
      throw new BadRequestException('Clearance level must be between 1 and 10');
    }

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

    // Prevent setting clearance higher than current user's clearance (unless super admin)
    if (!currentUser.roles.includes('super_admin')) {
      const currentUserLevel = currentUser.attributes?.clearance_level || 5;
      if (clearanceLevel > currentUserLevel) {
        throw new ForbiddenException('Cannot set clearance level higher than your own');
      }
    }

    const oldClearanceLevel = user.clearance_level;
    user.clearance_level = clearanceLevel;

    await this.userRepository.save(user);

    this.logger.log(`User clearance updated: ${user.email} from ${oldClearanceLevel} to ${clearanceLevel} by ${currentUser.email}`, {
      userId,
      adminId: currentUser.sub,
      oldClearanceLevel,
      newClearanceLevel: clearanceLevel,
    });

    return this.getUser(userId, currentUser);
  }

  async updateBatchUserClearance(
    updates: Array<{ user_id: string; clearance_level: number }>,
    currentUser: UserInfo
  ): Promise<any> {
    this.validateAdminAccess(currentUser);

    // Validate all clearance levels
    for (const update of updates) {
      if (update.clearance_level < 1 || update.clearance_level > 10) {
        throw new BadRequestException(`Clearance level must be between 1 and 10 for user ${update.user_id}`);
      }
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const result = await this.updateUserClearance(update.user_id, update.clearance_level, currentUser);
        results.push({
          user_id: update.user_id,
          status: 'success',
          clearance_level: update.clearance_level,
        });
      } catch (error) {
        errors.push({
          user_id: update.user_id,
          status: 'error',
          message: error.message,
        });
      }
    }

    this.logger.log(`Batch clearance update completed: ${results.length} successful, ${errors.length} errors by ${currentUser.email}`, {
      adminId: currentUser.sub,
      successCount: results.length,
      errorCount: errors.length,
    });

    return {
      success: results,
      errors,
      summary: {
        total: updates.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  async getClientPortalIssues(currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const effectiveFirmId = currentUser.roles.includes('super_admin') ? undefined : currentUser.firm_id;

    // Find users with client_user role
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.firm', 'firm')
      .where(':role = ANY(user.roles)', { role: 'client_user' });

    if (effectiveFirmId) {
      queryBuilder.andWhere('user.firm_id = :firmId', { firmId: effectiveFirmId });
    }

    const clientUsers = await queryBuilder.getMany();

    const issues = [];

    for (const user of clientUsers) {
      const userIssues = [];
      
      // Check if user has client_ids assigned
      if (!user.attributes?.client_ids || !Array.isArray(user.attributes.client_ids) || user.attributes.client_ids.length === 0) {
        userIssues.push({
          type: 'no_client_assignment',
          severity: 'high',
          message: 'User has client_user role but no client assignments',
        });
      } else {
        // Check if assigned clients exist and belong to correct firm
        const assignedClientIds = user.attributes.client_ids;
        const existingClients = await this.clientRepository.find({
          where: { id: In(assignedClientIds) },
        });

        if (existingClients.length !== assignedClientIds.length) {
          const missingIds = assignedClientIds.filter(id => !existingClients.find(c => c.id === id));
          userIssues.push({
            type: 'invalid_client_ids',
            severity: 'high',
            message: `User assigned to non-existent clients: ${missingIds.join(', ')}`,
          });
        }

        // Check firm mismatch
        const wrongFirmClients = existingClients.filter(client => client.firm_id !== user.firm_id);
        if (wrongFirmClients.length > 0) {
          userIssues.push({
            type: 'firm_mismatch',
            severity: 'medium',
            message: `User assigned to clients from different firm: ${wrongFirmClients.map(c => c.name).join(', ')}`,
          });
        }
      }

      // Check if user has Keycloak ID (can log in)
      if (!user.keycloak_id) {
        userIssues.push({
          type: 'no_keycloak_id',
          severity: 'medium',
          message: 'User has no Keycloak ID - may not be able to log in',
        });
      }

      if (userIssues.length > 0) {
        issues.push({
          user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            firm: user.firm ? { id: user.firm.id, name: user.firm.name } : null,
            client_ids: user.attributes?.client_ids || [],
          },
          issues: userIssues,
        });
      }
    }

    // General statistics
    const stats = {
      total_client_users: clientUsers.length,
      users_with_issues: issues.length,
      users_without_client_assignment: issues.filter(i => i.issues.some(issue => issue.type === 'no_client_assignment')).length,
      users_with_invalid_clients: issues.filter(i => i.issues.some(issue => issue.type === 'invalid_client_ids')).length,
    };

    return {
      stats,
      issues,
      recommendations: [
        'Users with client_user role should have at least one client assignment',
        'All assigned client IDs should exist and belong to the same firm',
        'Users should have Keycloak IDs to enable login',
      ],
    };
  }

  // Team Management
  async getTeams(firmId?: string, currentUser?: UserInfo): Promise<Team[]> {
    const effectiveFirmId = firmId || currentUser?.firm_id;
    
    if (!currentUser?.roles.includes('super_admin') && effectiveFirmId !== currentUser?.firm_id) {
      throw new ForbiddenException('Cannot access teams from different firm');
    }

    return await this.teamRepository.find({
      where: effectiveFirmId ? { firm_id: effectiveFirmId } : {},
      relations: ['firm', 'members'],
      order: { name: 'ASC' },
    });
  }

  async createTeam(createTeamDto: CreateTeamDto, currentUser: UserInfo): Promise<Team> {
    this.validateAdminAccess(currentUser);

    if (!currentUser.roles.includes('super_admin') && createTeamDto.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot create team in different firm');
    }

    // Verify firm exists
    const firm = await this.firmRepository.findOne({ where: { id: createTeamDto.firm_id } });
    if (!firm) {
      throw new BadRequestException('Firm not found');
    }

    // Create team
    const teamData = {
      name: createTeamDto.name,
      description: createTeamDto.description,
      firm_id: createTeamDto.firm_id,
    };
    
    const team = this.teamRepository.create(teamData);
    const savedTeam = await this.teamRepository.save(team);

    this.logger.log(`Team created: ${team.name} by ${currentUser.email}`, {
      teamId: savedTeam.id,
      firmId: createTeamDto.firm_id,
    });

    return await this.teamRepository.findOne({
      where: { id: savedTeam.id },
      relations: ['firm', 'members'],
    });
  }

  async getTeam(teamId: string, currentUser: UserInfo): Promise<Team> {
    this.validateAdminAccess(currentUser);

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['firm', 'members'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!currentUser.roles.includes('super_admin') && team.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot access team from different firm');
    }

    return team;
  }

  async updateTeam(teamId: string, updateTeamDto: UpdateTeamDto, currentUser: UserInfo): Promise<Team> {
    this.validateAdminAccess(currentUser);

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['firm', 'members'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!currentUser.roles.includes('super_admin') && team.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot update team from different firm');
    }

    // Update basic team data
    if (updateTeamDto.name !== undefined) {
      team.name = updateTeamDto.name;
    }
    if (updateTeamDto.description !== undefined) {
      team.description = updateTeamDto.description;
    }

    // Handle member updates if provided
    if (updateTeamDto.member_ids !== undefined) {
      // Get members by IDs
      const members = await this.userRepository.find({
        where: { id: In(updateTeamDto.member_ids) },
      });

      if (members.length !== updateTeamDto.member_ids.length) {
        throw new BadRequestException('Some members not found');
      }

      // Verify all members belong to the same firm
      const invalidMembers = members.filter(member => member.firm_id !== team.firm_id);
      if (invalidMembers.length > 0) {
        throw new BadRequestException('All team members must belong to the same firm');
      }

      team.members = members;
    }

    const updatedTeam = await this.teamRepository.save(team);

    this.logger.log(`Team updated: ${team.name} by ${currentUser.email}`, {
      teamId: team.id,
      changes: updateTeamDto,
    });

    return await this.teamRepository.findOne({
      where: { id: updatedTeam.id },
      relations: ['firm', 'members'],
    });
  }

  async deleteTeam(teamId: string, currentUser: UserInfo): Promise<void> {
    this.validateAdminAccess(currentUser);

    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['firm'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!currentUser.roles.includes('super_admin') && team.firm_id !== currentUser.firm_id) {
      throw new ForbiddenException('Cannot delete team from different firm');
    }

    await this.teamRepository.remove(team);

    this.logger.log(`Team deleted: ${team.name} by ${currentUser.email}`, {
      teamId: team.id,
      firmId: team.firm_id,
    });
  }

  // Bulk Operations
  async performBulkUserOperation(bulkOperation: BulkUserOperationDto, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const { operation, user_ids, role_name, confirm_destructive, reason } = bulkOperation;

    // Get users to operate on
    const users = await this.userRepository.find({
      where: { id: In(user_ids) },
      relations: ['firm'],
    });

    if (users.length !== user_ids.length) {
      throw new BadRequestException('Some users not found');
    }

    // Verify firm access
    if (!currentUser.roles.includes('super_admin')) {
      const wrongFirmUsers = users.filter(user => user.firm_id !== currentUser.firm_id);
      if (wrongFirmUsers.length > 0) {
        throw new ForbiddenException('Cannot perform bulk operations on users from different firm');
      }
    }

    let results = [];

    switch (operation) {
      case BulkOperationType.ENABLE_USERS:
        await this.userRepository.update({ id: In(user_ids) }, { is_active: true });
        results = users.map(user => ({ userId: user.id, email: user.email, action: 'enabled' }));
        break;

      case BulkOperationType.DISABLE_USERS:
        await this.userRepository.update({ id: In(user_ids) }, { is_active: false });
        results = users.map(user => ({ userId: user.id, email: user.email, action: 'disabled' }));
        break;

      case BulkOperationType.ADD_ROLE:
        if (!role_name) {
          throw new BadRequestException('Role name is required for add_role operation');
        }
        await this.validateRoles([role_name]);
        
        for (const user of users) {
          if (!user.roles.includes(role_name)) {
            const newRoles = [...user.roles, role_name];
            await this.userRepository.update(user.id, { roles: newRoles });
            results.push({ userId: user.id, email: user.email, action: `added role: ${role_name}` });
          }
        }
        break;

      case BulkOperationType.REMOVE_ROLE:
        if (!role_name) {
          throw new BadRequestException('Role name is required for remove_role operation');
        }
        
        for (const user of users) {
          if (user.roles.includes(role_name)) {
            const newRoles = user.roles.filter(role => role !== role_name);
            await this.userRepository.update(user.id, { roles: newRoles });
            results.push({ userId: user.id, email: user.email, action: `removed role: ${role_name}` });
          }
        }
        break;

      case BulkOperationType.DELETE_USERS:
        if (!confirm_destructive) {
          throw new BadRequestException('Destructive operation requires confirmation');
        }
        
        await this.userRepository.remove(users);
        results = users.map(user => ({ userId: user.id, email: user.email, action: 'deleted' }));
        break;

      default:
        throw new BadRequestException(`Unsupported bulk operation: ${operation}`);
    }

    // Log bulk operation
    this.logger.log(`Bulk operation performed: ${operation} on ${user_ids.length} users by ${currentUser.email}`, {
      operation,
      userCount: user_ids.length,
      reason,
      results,
    });

    return {
      operation,
      processed_count: results.length,
      results,
    };
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

    // Get retention classes with document counts
    const retentionClasses = await this.retentionClassRepository
      .createQueryBuilder('rc')
      .leftJoin('rc.documents', 'doc')
      .addSelect('COUNT(doc.id)', 'document_count')
      .where('rc.firm_id = :firmId', { firmId: effectiveFirmId })
      .andWhere('(doc.is_deleted IS NULL OR doc.is_deleted = false)')
      .groupBy('rc.id')
      .orderBy('rc.name', 'ASC')
      .getRawAndEntities();

    // Map the document counts to the entities
    const result = retentionClasses.entities.map((entity, index) => {
      return {
        ...entity,
        document_count: parseInt(retentionClasses.raw[index].document_count) || 0,
      };
    });

    return result;
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
        ? { where: { firm_id: firmId, status: 'active' as any } }
        : { where: { status: 'active' as any } },
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

  async exportAuditLogs(query: any, currentUser: UserInfo): Promise<any> {
    this.validateAdminAccess(currentUser);

    const { format = 'csv', user_id, action, resource_type, from_date, to_date } = query;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.timestamp', 'DESC');

    // Firm admins can only export audit logs from their firm
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

    const auditLogs = await queryBuilder.getMany();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['Timestamp', 'User Email', 'User Name', 'Action', 'Resource Type', 'Resource ID', 'Outcome', 'Risk Level', 'IP Address', 'Details'];
      const csvRows = auditLogs.map(log => [
        log.timestamp.toISOString(),
        log.user?.email || 'Unknown',
        log.user?.display_name || 'Unknown',
        log.action,
        log.resource_type,
        log.resource_id,
        log.outcome,
        log.risk_level,
        log.ip_address,
        JSON.stringify(log.details)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        content: csvContent,
        contentType: 'text/csv',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      };
    } else if (format === 'json') {
      // Return JSON format
      return {
        content: JSON.stringify(auditLogs, null, 2),
        contentType: 'application/json',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.json`
      };
    } else {
      throw new BadRequestException('Invalid export format. Supported formats: csv, json');
    }
  }

  // System Settings Management
  async getSystemSettings(currentUser: UserInfo): Promise<SystemSettingsDto> {
    this.validateAdminAccess(currentUser);

    // Get settings from key-value database
    const allSettings = await this.systemSettingsRepository.find();
    const settingsMap = new Map(allSettings.map(s => [s.key, s.value]));

    // Build settings object from key-value pairs
    const settings: SystemSettingsDto = {
      firm_name: 'Legal Document Management System',
      default_retention_years: parseInt(settingsMap.get('default_retention_years') || '7', 10),
      max_file_size_mb: parseInt(settingsMap.get('max_upload_size_mb') || '100', 10),
      enable_ocr: settingsMap.get('enable_ocr') !== false,
      enable_legal_holds: settingsMap.get('enable_legal_holds') !== false,
      enable_cross_firm_sharing: settingsMap.get('enable_cross_firm_sharing') === true,
      backup_config: settingsMap.get('backup_config') || {
        frequency: 'daily',
        retention_days: 30,
        enabled: true,
      },
      smtp_config: settingsMap.get('smtp_config') || {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        enabled: false,
      },
      watermark_config: settingsMap.get('watermark_config') || {
        enabled: true,
        text: 'CONFIDENTIAL - {firm_name}',
        opacity: 0.3,
        fontSize: 48,
        position: 'diagonal',
        color: 'gray',
        rotation: 45,
      },
      security_policy: {
        session_timeout_minutes: parseInt(settingsMap.get('session_timeout_minutes') || '60', 10),
        max_login_attempts: parseInt(settingsMap.get('max_login_attempts') || '5', 10),
        password_expiry_days: parseInt(settingsMap.get('password_expiry_days') || '90', 10),
        require_mfa_for_admins: settingsMap.get('require_mfa_for_admins') === 'true' || settingsMap.get('require_mfa_for_admins') === true,
      },
    };

    // If not super admin, get firm-specific settings
    if (!currentUser.roles.includes('super_admin')) {
      const firm = await this.firmRepository.findOne({
        where: { id: currentUser.firm_id },
      });
      if (firm) {
        settings.firm_name = firm.name;
      }
    }

    return settings;
  }

  async getSessionTimeoutMinutes(): Promise<number> {
    // Get session timeout from key-value settings
    const setting = await this.systemSettingsRepository.findOne({
      where: { key: 'session_timeout_minutes' }
    });

    if (setting?.value) {
      const timeoutValue = typeof setting.value === 'string' ? parseInt(setting.value, 10) : setting.value;
      return isNaN(timeoutValue) ? 60 : timeoutValue;
    }

    return 60; // Default to 60 minutes
  }

  async updateSystemSettings(
    systemSettingsDto: SystemSettingsDto,
    currentUser: UserInfo,
  ): Promise<SystemSettingsDto> {
    this.validateAdminAccess(currentUser);

    // Save each setting as a key-value pair in the database
    const settingsToSave: Array<{ key: string; value: any }> = [
      { key: 'firm_name', value: systemSettingsDto.firm_name },
      { key: 'default_retention_years', value: systemSettingsDto.default_retention_years },
      { key: 'max_upload_size_mb', value: systemSettingsDto.max_file_size_mb },
      { key: 'enable_ocr', value: systemSettingsDto.enable_ocr },
      { key: 'enable_legal_holds', value: systemSettingsDto.enable_legal_holds },
      { key: 'enable_cross_firm_sharing', value: systemSettingsDto.enable_cross_firm_sharing },
    ];

    // Add optional configs if they exist
    if (systemSettingsDto.backup_config) {
      settingsToSave.push({ key: 'backup_config', value: systemSettingsDto.backup_config });
    }
    if (systemSettingsDto.smtp_config) {
      settingsToSave.push({ key: 'smtp_config', value: systemSettingsDto.smtp_config });
    }
    if (systemSettingsDto.watermark_config) {
      settingsToSave.push({ key: 'watermark_config', value: systemSettingsDto.watermark_config });
    }
    if (systemSettingsDto.security_policy) {
      settingsToSave.push({ key: 'security_policy', value: systemSettingsDto.security_policy });
    }

    // Save or update each setting
    for (const setting of settingsToSave) {
      await this.systemSettingsRepository.save({
        key: setting.key,
        value: setting.value,
        updated_by: currentUser.sub,
      });
    }
    
    this.logger.log(`System settings updated by ${currentUser.email}`, {
      settings: systemSettingsDto,
      userId: currentUser.sub,
      firmId: currentUser.firm_id,
    });

    // Return the updated settings
    return systemSettingsDto;
  }

  async generateWatermarkPreview(
    watermarkConfig: any,
    currentUser: UserInfo,
  ): Promise<Buffer> {
    this.validateAdminAccess(currentUser);

    this.logger.log(`Generating watermark preview for ${currentUser.email}`, {
      config: watermarkConfig,
      userId: currentUser.sub,
      firmId: currentUser.firm_id,
    });

    return this.watermarkService.generatePreviewPDF(watermarkConfig);
  }

  private validateAdminAccess(user: UserInfo): void {
    if (!user.roles.some(role => ['super_admin', 'firm_admin'].includes(role))) {
      throw new ForbiddenException('Admin access required');
    }
  }
}
