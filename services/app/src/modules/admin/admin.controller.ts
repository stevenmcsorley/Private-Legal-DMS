import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { BulkUserOperationDto } from './dto/bulk-user-operation.dto';
import { SystemSettingsDto } from './dto/system-settings.dto';
import { CreateRetentionClassDto } from './dto/create-retention-class.dto';
import { UpdateRetentionClassDto } from './dto/update-retention-class.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanWrite, CanRead } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Administration')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // User Management
  @Get('users')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm' })
  @ApiQuery({ name: 'active_only', required: false, description: 'Show only active users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async getUsers(
    @Query() query: any,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.getUsers(query, user);
  }

  @Get('users/:id')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.getUser(userId, user);
  }

  @Post('users')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user data',
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.createUser(createUserDto, user);
  }

  @Put('users/:id')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Update user details' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.updateUser(userId, updateUserDto, user);
  }

  @Delete('users/:id')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async deactivateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.deactivateUser(userId, user);
  }

  @Post('users/:id/activate')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Reactivate a user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User reactivated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async activateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.activateUser(userId, user);
  }

  // Role Management
  @Get('roles')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          permissions: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  async getRoles() {
    return this.adminService.getRoles();
  }

  @Put('users/:id/roles')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Update user roles' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        roles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of role names',
        },
      },
      required: ['roles'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User roles updated successfully',
  })
  async updateUserRoles(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('roles') roles: string[],
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.updateUserRoles(userId, roles, user);
  }

  // Retention Class Management
  @Get('retention-classes')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get retention classes' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retention classes retrieved successfully',
  })
  async getRetentionClasses(
    @Query('firm_id') firmId?: string,
    @CurrentUser() user?: UserInfo,
  ) {
    const effectiveFirmId = firmId || user?.firm_id;
    return this.adminService.getRetentionClasses(effectiveFirmId, user);
  }

  // Alias for frontend compatibility
  @Get('retention-policies')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get retention policies (alias for retention-classes)' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retention policies retrieved successfully',
  })
  async getRetentionPolicies(
    @Query('firm_id') firmId?: string,
    @CurrentUser() user?: UserInfo,
  ) {
    const effectiveFirmId = firmId || user?.firm_id;
    return this.adminService.getRetentionClasses(effectiveFirmId, user);
  }

  @Get('retention-classes/:id')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get retention class details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retention class details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retention class not found',
  })
  async getRetentionClass(
    @Param('id', ParseUUIDPipe) retentionClassId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.getRetentionClass(retentionClassId, user);
  }

  @Post('retention-classes')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Create a retention class' })
  @ApiBody({ type: CreateRetentionClassDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Retention class created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid retention class data',
  })
  async createRetentionClass(
    @Body() createRetentionClassDto: CreateRetentionClassDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.createRetentionClass(createRetentionClassDto, user);
  }

  @Put('retention-classes/:id')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Update retention class' })
  @ApiBody({ type: UpdateRetentionClassDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retention class updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retention class not found',
  })
  async updateRetentionClass(
    @Param('id', ParseUUIDPipe) retentionClassId: string,
    @Body() updateRetentionClassDto: UpdateRetentionClassDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.updateRetentionClass(retentionClassId, updateRetentionClassDto, user);
  }

  @Delete('retention-classes/:id')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Delete retention class' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Retention class deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Retention class not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete retention class - documents are using it',
  })
  async deleteRetentionClass(
    @Param('id', ParseUUIDPipe) retentionClassId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.deleteRetentionClass(retentionClassId, user);
  }

  // System Stats
  @Get('system-stats')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            by_role: { type: 'object' },
          },
        },
        documents: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            confidential: { type: 'number' },
            under_legal_hold: { type: 'number' },
            soft_deleted: { type: 'number' },
          },
        },
        matters: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            by_status: { type: 'object' },
          },
        },
        storage: {
          type: 'object',
          properties: {
            total_size_bytes: { type: 'number' },
            average_document_size: { type: 'number' },
          },
        },
      },
    },
  })
  async getSystemStats(@CurrentUser() user: UserInfo): Promise<any> {
    return this.adminService.getSystemStats(user);
  }

  // Team Management
  @Get('teams')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get teams' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Teams retrieved successfully',
  })
  async getTeams(
    @Query('firm_id') firmId?: string,
    @CurrentUser() user?: UserInfo,
  ) {
    return this.adminService.getTeams(firmId, user);
  }

  @Post('teams')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Create a new team' })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Team created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid team data',
  })
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.createTeam(createTeamDto, user);
  }

  // Bulk Operations
  @Post('bulk-operations/users')
  @CanWrite('admin')
  @ApiOperation({ summary: 'Perform bulk operations on users' })
  @ApiBody({ type: BulkUserOperationDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bulk operation completed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid bulk operation data',
  })
  async performBulkUserOperation(
    @Body() bulkOperation: BulkUserOperationDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.performBulkUserOperation(bulkOperation, user);
  }

  // Audit Logs
  @Get('audit-logs')
  @CanRead('admin')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'user_id', required: false, description: 'Filter by user' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'resource_type', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'from_date', required: false, description: 'Start date filter (ISO 8601)' })
  @ApiQuery({ name: 'to_date', required: false, description: 'End date filter (ISO 8601)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit logs retrieved successfully',
  })
  async getAuditLogs(
    @Query() query: any,
    @CurrentUser() user: UserInfo,
  ) {
    return this.adminService.getAuditLogs(query, user);
  }
}
