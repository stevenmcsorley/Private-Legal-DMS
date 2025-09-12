import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
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
import { MatterShareService } from '../services/matter-share.service';
import { CreateMatterShareDto, UpdateMatterShareDto, MatterShareResponseDto } from '../dto';
import { ShareStatus } from '../../../common/entities';
import { CurrentUser } from '../../../auth/decorators/user.decorator';
import { CanWrite } from '../../../auth/decorators/permission.decorator';
import { User } from '../../../common/entities';

@ApiTags('Cross-Firm Sharing')
@Controller('matters/shares')
@ApiBearerAuth()
export class MatterShareController {
  constructor(private readonly matterShareService: MatterShareService) {}

  @Post()
  @CanWrite('matter')
  @ApiOperation({ 
    summary: 'Create cross-firm matter share',
    description: 'Share a matter with another firm, creating a collaboration invitation'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Matter share created successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Matter already shared with this firm or invalid data' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Matter or target firm not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions to share this matter' 
  })
  @ApiBody({ type: CreateMatterShareDto })
  async createShare(
    @Body() createDto: CreateMatterShareDto,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.createShare(
      createDto,
      user.id,
      user.firm_id,
    );
  }

  @Get('matter/:matterId')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get all shares for a specific matter',
    description: 'Retrieve all cross-firm shares for a matter owned by the current user\'s firm'
  })
  @ApiParam({ 
    name: 'matterId', 
    description: 'UUID of the matter',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of matter shares retrieved successfully',
    type: [MatterShareResponseDto],
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Matter not found or access denied' 
  })
  async getSharesByMatter(
    @Param('matterId', ParseUUIDPipe) matterId: string,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto[]> {
    return this.matterShareService.getSharesByMatter(matterId, user.firm_id);
  }

  @Get('firm')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get shares for current firm',
    description: 'Retrieve all matters shared with the current user\'s firm'
  })
  @ApiQuery({ 
    name: 'status', 
    enum: ShareStatus, 
    required: false,
    description: 'Filter by share status'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of firm shares retrieved successfully',
    type: [MatterShareResponseDto],
  })
  async getSharesForFirm(
    @Query('status') status: ShareStatus,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto[]> {
    return this.matterShareService.getSharesForFirm(user.firm_id, status);
  }

  @Get(':shareId')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Get specific matter share',
    description: 'Retrieve details of a specific cross-firm share'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share details retrieved successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Access denied to this share' 
  })
  async getShareById(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.getShareById(shareId, user.firm_id);
  }

  @Put(':shareId')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Update matter share',
    description: 'Update permissions, status, or other properties of a cross-firm share'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share updated successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Insufficient permissions to update this share' 
  })
  @ApiBody({ type: UpdateMatterShareDto })
  async updateShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Body() updateDto: UpdateMatterShareDto,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.updateShare(
      shareId,
      updateDto,
      user.id,
      user.firm_id,
    );
  }

  @Put(':shareId/accept')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Accept matter share invitation',
    description: 'Accept a cross-firm collaboration invitation'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to accept',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share invitation accepted successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot accept this share invitation' 
  })
  async acceptShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.updateShare(
      shareId,
      { status: ShareStatus.ACCEPTED },
      user.id,
      user.firm_id,
    );
  }

  @Put(':shareId/decline')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Decline matter share invitation',
    description: 'Decline a cross-firm collaboration invitation'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to decline',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share invitation declined successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot decline this share invitation' 
  })
  async declineShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.updateShare(
      shareId,
      { status: ShareStatus.DECLINED },
      user.id,
      user.firm_id,
    );
  }

  @Put(':shareId/revoke')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Revoke matter share',
    description: 'Revoke access to a previously shared matter'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to revoke',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Share revoked successfully',
    type: MatterShareResponseDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Cannot revoke this share' 
  })
  async revokeShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<MatterShareResponseDto> {
    return this.matterShareService.updateShare(
      shareId,
      { status: ShareStatus.REVOKED },
      user.id,
      user.firm_id,
    );
  }

  @Delete(':shareId')
  @CanWrite('matter')
  @ApiOperation({
    summary: 'Delete matter share',
    description: 'Permanently delete a cross-firm share (firm admin only)'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Share deleted successfully',
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Share not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.FORBIDDEN, 
    description: 'Only the sharing firm can delete this share' 
  })
  async deleteShare(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.matterShareService.deleteShare(shareId, user.firm_id);
  }
}
