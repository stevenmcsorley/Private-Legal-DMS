import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MattersService, MatterQuery } from './matters.service';
import { MatterExportService, MatterExportOptions } from './services/matter-export.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { MatterResponseDto } from './dto/matter-response.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamMemberResponseDto } from './dto/team-member-response.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead, CanWrite, CanDelete } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';
import { MatterStatus } from '../../common/entities';

@ApiTags('Matters')
@ApiBearerAuth()
@Controller('matters')
export class MattersController {
  constructor(
    private readonly mattersService: MattersService,
    private readonly matterExportService: MatterExportService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  @CanWrite('matter')
  @ApiOperation({ summary: 'Create a new matter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Matter created successfully',
    type: MatterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to create matters',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Client not found',
  })
  async create(
    @Body() createMatterDto: CreateMatterDto,
    @CurrentUser() user: UserInfo,
  ): Promise<MatterResponseDto> {
    return this.mattersService.create(createMatterDto, user);
  }

  @Get()
  @CanRead('matter')
  @ApiOperation({ summary: 'Get all matters' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: MatterStatus })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter by client ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matters retrieved successfully',
  })
  async findAll(
    @Query() query: MatterQuery,
    @CurrentUser() user: UserInfo,
  ) {
    return this.mattersService.findAll(query, user);
  }

  @Get(':id')
  @CanRead('matter')
  @ApiOperation({ summary: 'Get a matter by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter retrieved successfully',
    type: MatterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<MatterResponseDto> {
    return this.mattersService.findOne(id, user);
  }

  @Patch(':id')
  @CanWrite('matter')
  @ApiOperation({ summary: 'Update a matter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter updated successfully',
    type: MatterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMatterDto: UpdateMatterDto,
    @CurrentUser() user: UserInfo,
  ): Promise<MatterResponseDto> {
    return this.mattersService.update(id, updateMatterDto, user);
  }

  @Delete(':id')
  @CanDelete('matter')
  @ApiOperation({ summary: 'Delete a matter' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Matter deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete matter with associated documents',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.mattersService.remove(id, user);
  }

  @Patch(':id/status')
  @CanWrite('matter')
  @ApiOperation({ summary: 'Update matter status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter status updated successfully',
    type: MatterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: MatterStatus,
    @CurrentUser() user: UserInfo,
  ): Promise<MatterResponseDto> {
    return this.mattersService.updateStatus(id, status, user);
  }

  @Get(':id/documents')
  @CanRead('document')
  @ApiOperation({ summary: 'Get all documents for a matter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async getMatterDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.documentsService.findAll({ matter_id: id }, user);
  }

  @Get(':id/team')
  @CanRead('matter')
  @ApiOperation({ summary: 'Get team members for a matter' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team members retrieved successfully',
    type: [TeamMemberResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async getMatterTeam(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<TeamMemberResponseDto[]> {
    return this.mattersService.getMatterTeam(id, user);
  }

  @Post(':id/team')
  @CanWrite('matter')
  @ApiOperation({ summary: 'Add a team member to a matter' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Team member added successfully',
    type: TeamMemberResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter or user not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User is already a team member',
  })
  async addTeamMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
    @CurrentUser() user: UserInfo,
  ): Promise<TeamMemberResponseDto> {
    return this.mattersService.addTeamMember(id, addTeamMemberDto, user);
  }

  @Delete(':id/team/:teamMemberId')
  @CanWrite('matter')
  @ApiOperation({ summary: 'Remove a team member from a matter' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Team member removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter or team member not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async removeTeamMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('teamMemberId', ParseUUIDPipe) teamMemberId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.mattersService.removeTeamMember(id, teamMemberId, user);
  }

  @Post(':id/export')
  @CanRead('matter')
  @ApiOperation({ 
    summary: 'Export complete matter with documents',
    description: 'Export a complete matter as ZIP archive with documents and metadata'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter exported successfully',
    headers: {
      'Content-Type': {
        description: 'Archive MIME type',
        schema: { type: 'string', example: 'application/zip' },
      },
      'Content-Disposition': {
        description: 'Attachment header with filename',
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async exportMatter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() exportOptions: Partial<MatterExportOptions>,
    @CurrentUser() user: UserInfo,
    @Res() response: Response,
  ): Promise<void> {
    const options: MatterExportOptions = {
      includeDocuments: true,
      includeMetadata: true,
      includeAuditTrail: false,
      ...exportOptions,
    };

    const { stream, filename, manifest } = await this.matterExportService.exportMatter(
      id,
      user as any, // TODO: Fix type mismatch
      options,
    );

    // Set response headers
    response.set({
      'Content-Type': 'application/json', // TODO: Change to application/zip when archiver is implemented
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Export-Documents': manifest.export.total_documents.toString(),
      'X-Export-Size': manifest.export.total_size_bytes.toString(),
    });

    // Stream the export
    stream.pipe(response);
  }
}