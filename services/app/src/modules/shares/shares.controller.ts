import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanWrite } from '../../auth/decorators/permission.decorator';
import { User } from '../../common/entities';
// Removed ShareStatus enum import

interface OutgoingShareResponse {
  id: string;
  matter_id: string;
  matter: {
    title: string;
    matter_number: string;
    client: {
      name: string;
    };
  };
  shared_with_firm: string;
  shared_with_firm_name: string;
  shared_by: {
    display_name: string;
  };
  role: string;
  permissions: Record<string, any>;
  status: string;
  expires_at?: string;
  created_at: string;
  access_count: number;
  last_accessed?: string;
  message?: string;
}

interface IncomingShareResponse {
  id: string;
  matter_id: string;
  matter_title: string;
  matter_number: string;
  client_name: string;
  shared_by_firm: string;
  shared_by_firm_name: string;
  shared_by_user: string;
  role: string;
  permissions: Record<string, any>;
  status: string;
  expires_at?: string;
  created_at: string;
  message?: string;
}

@ApiTags('Cross-Firm Sharing API')
@Controller('shares')
@ApiBearerAuth()
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get('outgoing')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get outgoing shares',
    description: 'Retrieve all matters shared by the current firm with other firms'
  })
  @ApiQuery({ 
    name: 'role', 
    required: false,
    description: 'Filter by share role'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of outgoing shares retrieved successfully',
  })
  async getOutgoingShares(
    @CurrentUser() user: User,
    @Query('role') role?: string,
  ): Promise<OutgoingShareResponse[]> {
    return this.sharesService.getOutgoingShares(user.firm_id, role);
  }

  @Get('incoming')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get incoming shares',
    description: 'Retrieve all matters shared with the current firm by other firms'
  })
  @ApiQuery({ 
    name: 'role', 
    required: false,
    description: 'Filter by share role'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of incoming shares retrieved successfully',
  })
  async getIncomingShares(
    @CurrentUser() user: User,
    @Query('role') role?: string,
  ): Promise<IncomingShareResponse[]> {
    return this.sharesService.getIncomingShares(user.firm_id, role);
  }

  @Post(':shareId/accept')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Accept share invitation',
    description: 'Accept an incoming cross-firm collaboration invitation'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to accept',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share invitation accepted successfully',
  })
  async acceptShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<IncomingShareResponse> {
    return this.sharesService.acceptShare(shareId, user);
  }

  @Post(':shareId/decline')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Decline share invitation',
    description: 'Decline an incoming cross-firm collaboration invitation'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to decline',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share invitation declined successfully',
  })
  async declineShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.sharesService.declineShare(shareId, user);
  }

  @Post(':shareId/revoke')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Revoke share',
    description: 'Revoke access to a previously shared matter'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to revoke',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share revoked successfully',
  })
  async revokeShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<OutgoingShareResponse> {
    return this.sharesService.revokeShare(shareId, user);
  }

  @Get(':shareId')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get share details',
    description: 'Retrieve detailed information about a specific share including documents and metadata'
  })
  @ApiParam({ name: 'shareId', type: 'string', description: 'Share ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Share details retrieved successfully'
  })
  async getShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ) {
    return this.sharesService.getShareDetails(shareId, user);
  }

  @Post()
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Create new matter share',
    description: 'Share a matter with another firm with specified permissions and role'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['matter_id', 'target_firm_id', 'role'],
      properties: {
        matter_id: { type: 'string', format: 'uuid' },
        target_firm_id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: ['viewer', 'editor', 'collaborator', 'partner_lead'] },
        expires_at: { type: 'string', format: 'date-time' },
        permissions: { type: 'object' },
        restrictions: { type: 'object' },
        invitation_message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Share created successfully'
  })
  async createShare(
    @Body() createShareDto: {
      matter_id: string;
      target_firm_id: string;
      role: string;
      expires_at?: string;
      permissions?: Record<string, any>;
      restrictions?: Record<string, any>;
      invitation_message?: string;
    },
    @CurrentUser() user: User,
  ) {
    const expiresAt = createShareDto.expires_at ? new Date(createShareDto.expires_at) : undefined;
    
    return this.sharesService.createShare(
      createShareDto.matter_id,
      createShareDto.target_firm_id,
      createShareDto.role as any,
      user,
      {
        expires_at: expiresAt,
        permissions: createShareDto.permissions,
        restrictions: createShareDto.restrictions,
        invitation_message: createShareDto.invitation_message,
      }
    );
  }

  @Post(':shareId/permissions')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Update share permissions',
    description: 'Modify the permissions for an existing share'
  })
  @ApiParam({ name: 'shareId', type: 'string', description: 'Share ID' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['permissions'],
      properties: {
        permissions: { type: 'object' },
      },
    },
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Permissions updated successfully'
  })
  async updateSharePermissions(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Body() updateDto: { permissions: Record<string, any> },
    @CurrentUser() user: User,
  ) {
    return this.sharesService.updateSharePermissions(shareId, updateDto.permissions, user);
  }

  @Get('analytics/dashboard')
  @CanWrite('admin')
  @ApiOperation({
    summary: 'Get share analytics',
    description: 'Retrieve comprehensive sharing analytics and statistics for the firm'
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    enum: ['week', 'month', 'quarter'],
    description: 'Time range for analytics'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Analytics retrieved successfully'
  })
  async getShareAnalytics(
    @Query('timeRange') timeRange: 'week' | 'month' | 'quarter' = 'month',
    @CurrentUser() user: User,
  ) {
    return this.sharesService.getShareAnalytics(user.firm_id, timeRange);
  }

  @Get('firms/search')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Search firms',
    description: 'Search for firms to share matters with'
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: 'string',
    description: 'Search query'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firms found successfully'
  })
  async searchFirms(
    @Query('q') query: string,
    @CurrentUser() user: User,
  ) {
    return this.sharesService.searchFirms(query, user);
  }

  @Get('matters/:matterId/history')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get matter share history',
    description: 'Retrieve the complete sharing history for a specific matter'
  })
  @ApiParam({ name: 'matterId', type: 'string', description: 'Matter ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Share history retrieved successfully'
  })
  async getMatterShareHistory(
    @Param('matterId', ParseUUIDPipe) matterId: string,
    @CurrentUser() user: User,
  ) {
    return this.sharesService.getShareHistory(matterId, user);
  }
}