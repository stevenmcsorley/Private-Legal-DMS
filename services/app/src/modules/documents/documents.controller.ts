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
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
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
import { Response } from 'express';
import { DocumentsService, DocumentQuery, UploadedFile as ServiceUploadedFile } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { DocumentResponseDto } from './dto/document-response.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead, CanWrite, CanDelete } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @CanWrite('document')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file and metadata',
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
          description: 'Matter ID',
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
        parties: {
          type: 'array',
          items: { type: 'string' },
          description: 'Parties involved',
        },
        jurisdiction: {
          type: 'string',
          description: 'Jurisdiction',
        },
        document_date: {
          type: 'string',
          format: 'date',
          description: 'Document date',
        },
        effective_date: {
          type: 'string',
          format: 'date',
          description: 'Effective date',
        },
        expiry_date: {
          type: 'string',
          format: 'date',
          description: 'Expiry date',
        },
        confidential: {
          type: 'boolean',
          description: 'Is confidential',
        },
        privileged: {
          type: 'boolean',
          description: 'Is privileged',
        },
        work_product: {
          type: 'boolean',
          description: 'Is work product',
        },
        retention_class_id: {
          type: 'string',
          format: 'uuid',
          description: 'Retention class ID',
        },
        custom_fields: {
          type: 'object',
          description: 'Custom fields',
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
    description: 'User does not have permission to upload documents',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadDocumentDto,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const serviceFile: ServiceUploadedFile = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
    };

    return this.documentsService.uploadDocument(serviceFile, uploadDto, user);
  }

  @Get()
  @CanRead('document')
  @ApiOperation({ summary: 'Get all documents' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'matter_id', required: false, description: 'Filter by matter ID' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter by client ID' })
  @ApiQuery({ name: 'document_type', required: false, description: 'Filter by document type' })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'confidential', required: false, description: 'Filter by confidential status' })
  @ApiQuery({ name: 'legal_hold', required: false, description: 'Filter by legal hold status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
  })
  async findAll(
    @Query() query: DocumentQuery & { tags?: string },
    @CurrentUser() user: UserInfo,
  ) {
    // Parse tags from comma-separated string
    if (query.tags) {
      (query as any).tags = query.tags.split(',').map(tag => tag.trim());
    }

    return this.documentsService.findAll(query, user);
  }

  @Get(':id')
  @CanRead('document')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this document',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findOne(id, user);
  }

  @Get(':id/download')
  @CanRead('document')
  @ApiOperation({ summary: 'Download a document' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document downloaded successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied or document under legal hold',
  })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename, mimetype } = await this.documentsService.downloadDocument(id, user);

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  @Get(':id/preview')
  @CanRead('document')
  @ApiOperation({ summary: 'Get document preview URL' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preview URL generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Presigned URL for document preview',
        },
        expires_at: {
          type: 'string',
          format: 'date-time',
          description: 'URL expiration time',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this document',
  })
  async getPreviewUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<{ url: string; expires_at: Date }> {
    return this.documentsService.getPreviewUrl(id, user);
  }

  @Delete(':id')
  @CanDelete('document')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied or document under legal hold',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.documentsService.deleteDocument(id, user);
  }

  @Patch(':id/legal-hold')
  @CanWrite('document')
  @ApiOperation({ summary: 'Set legal hold on a document' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for legal hold',
        },
      },
      required: ['reason'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold set successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this document',
  })
  async setLegalHold(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.setLegalHold(id, reason, user);
  }

  @Delete(':id/legal-hold')
  @CanWrite('document')
  @ApiOperation({ summary: 'Remove legal hold from a document' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold removed successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this document',
  })
  async removeLegalHold(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.removeLegalHold(id, user);
  }
}