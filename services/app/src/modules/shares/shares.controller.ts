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
  permissions: string[];
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
  permissions: string[];
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
}