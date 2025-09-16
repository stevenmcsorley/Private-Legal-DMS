import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ClientPortalService } from './client-portal.service';
import { DocumentsService, DocumentQuery, UploadedFile as ServiceUploadedFile } from '../documents/documents.service';
import { MattersService } from '../matters/matters.service';
import { UploadDocumentDto } from '../documents/dto/upload-document.dto';
import { DocumentResponseDto } from '../documents/dto/document-response.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead, CanWrite } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Client Portal')
@ApiBearerAuth()
@Controller('client-portal')
export class ClientPortalController {
  constructor(
    private readonly clientPortalService: ClientPortalService,
    private readonly documentsService: DocumentsService,
    private readonly mattersService: MattersService,
  ) {}

  @Get('dashboard')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get client dashboard overview' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Client dashboard data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        client: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
          },
        },
        stats: {
          type: 'object',
          properties: {
            active_matters: { type: 'number' },
            total_documents: { type: 'number' },
            recent_documents: { type: 'number' },
            confidential_documents: { type: 'number' },
          },
        },
        recent_matters: { type: 'array' },
        recent_documents: { type: 'array' },
      },
    },
  })
  async getDashboard(@CurrentUser() user: UserInfo): Promise<any> {
    return this.clientPortalService.getClientDashboard(user);
  }

  @Get('matters')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get matters accessible to the client' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matters retrieved successfully',
  })
  async getClientMatters(
    @Query() query: any,
    @CurrentUser() user: UserInfo,
  ) {
    return this.clientPortalService.getClientMatters(user, query);
  }

  @Get('matters/:id')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get matter details accessible to the client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter details retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found or not accessible',
  })
  async getMatter(
    @Param('id', ParseUUIDPipe) matterId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.clientPortalService.getClientMatter(user, matterId);
  }

  @Get('documents')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get documents accessible to the client' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'matter_id', required: false, description: 'Filter by matter ID' })
  @ApiQuery({ name: 'document_type', required: false, description: 'Filter by document type' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
  })
  async getClientDocuments(
    @Query() query: DocumentQuery & { tags?: string },
    @CurrentUser() user: UserInfo,
  ) {
    // Get the client for this user to ensure they have access
    const client = await this.clientPortalService.getClientForUser(user);
    
    // Filter to only show documents for this specific client
    const clientQuery = {
      ...query,
      client_id: client.id, // Force client_id to be the user's assigned client
      confidential: false,  // Always hide confidential docs from client users
      privileged: false,    // Always hide privileged docs from client users
    };

    // Parse tags from comma-separated string
    if (clientQuery.tags) {
      (clientQuery as any).tags = clientQuery.tags.split(',').map(tag => tag.trim());
    }

    // Get documents using the documents service
    const result = await this.documentsService.findAll(clientQuery, user);
    
    // Additional client access validation for each document
    const accessibleDocuments = [];
    for (const doc of result.documents) {
      if (await this.clientPortalService.canClientAccessDocument(user, doc)) {
        accessibleDocuments.push(doc);
      }
    }

    // Provide helpful message if no documents are accessible
    if (accessibleDocuments.length === 0 && result.documents.length > 0) {
      // There were documents but none were accessible due to permission restrictions
      return {
        ...result,
        documents: [],
        total: 0,
        message: 'No documents are currently available for your review. Documents may be confidential, privileged, or under attorney work product.',
      };
    }

    return {
      ...result,
      documents: accessibleDocuments,
      total: accessibleDocuments.length,
    };
  }

  @Get('documents/:id')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get document details accessible to the client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document details retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found or not accessible',
  })
  async getDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.findOne(documentId, user);
    
    // Additional client access validation
    if (!await this.clientPortalService.canClientAccessDocument(user, document)) {
      throw new ForbiddenException('Access denied to this document');
    }

    return document;
  }

  @Get('documents/:id/preview')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Stream document preview accessible to the client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document preview streamed successfully',
    headers: {
      'Content-Type': {
        description: 'Document MIME type',
        schema: { type: 'string' }
      },
      'Content-Length': {
        description: 'Document size',
        schema: { type: 'string' }
      }
    }
  })
  async getDocumentPreview(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
    @Res() response: any,
  ) {
    const document = await this.documentsService.findOne(documentId, user);
    
    // Additional client access validation
    if (!await this.clientPortalService.canClientAccessDocument(user, document)) {
      throw new ForbiddenException('Access denied to this document');
    }

    // Stream the document directly
    return this.documentsService.streamDocument(documentId, user, response);
  }

  @Get('documents/:id/download')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Download document accessible to the client' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document downloaded successfully',
    headers: {
      'Content-Type': {
        description: 'Document MIME type',
        schema: { type: 'string' }
      },
      'Content-Disposition': {
        description: 'Attachment filename',
        schema: { type: 'string' }
      }
    }
  })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ) {
    const document = await this.documentsService.findOne(documentId, user);
    
    // Additional client access validation
    if (!await this.clientPortalService.canClientAccessDocument(user, document)) {
      throw new ForbiddenException('Access denied to this document');
    }

    return this.documentsService.downloadDocument(documentId, user);
  }

  @Post('documents/upload')
  @CanWrite('client_portal')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document through client portal' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file and metadata for client upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload',
        },
        matter_id: {
          type: 'string',
          format: 'uuid',
          description: 'Matter ID (must be accessible to client)',
        },
        title: {
          type: 'string',
          description: 'Document title',
        },
        description: {
          type: 'string',
          description: 'Document description',
        },
        document_type: {
          type: 'string',
          description: 'Document type',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Document tags',
        },
      },
      required: ['file', 'matter_id'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Document uploaded successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or metadata',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to upload to this matter',
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    // Validate client access to the matter
    if (!await this.clientPortalService.canClientAccessMatter(user, uploadDto.matter_id)) {
      throw new ForbiddenException('Access denied to this matter');
    }

    // Convert Express file to service file format
    const serviceFile: ServiceUploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    // Client uploads should not be marked as confidential or privileged by default
    const clientUploadDto = {
      ...uploadDto,
      confidential: false,
      privileged: false,
      work_product: false,
      uploaded_by_type: 'client' as const,
      uploaded_by_user_id: user.sub,
    };

    return this.documentsService.uploadDocument(serviceFile, clientUploadDto, user);
  }

  @Get('upload-settings')
  @CanRead('client_portal')
  @ApiOperation({ summary: 'Get client upload settings and restrictions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload settings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        max_file_size: { type: 'number', description: 'Maximum file size in bytes' },
        allowed_file_types: { type: 'array', items: { type: 'string' } },
        accessible_matters: { type: 'array' },
        upload_enabled: { type: 'boolean' },
      },
    },
  })
  async getUploadSettings(@CurrentUser() user: UserInfo): Promise<any> {
    return this.clientPortalService.getUploadSettings(user);
  }
}
