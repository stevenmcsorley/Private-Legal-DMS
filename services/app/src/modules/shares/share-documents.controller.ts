import {
  Controller,
  Get,
  Param,
  Res,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ShareDocumentsService } from './share-documents.service';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead } from '../../auth/decorators/permission.decorator';
import { User } from '../../common/entities';

@ApiTags('Cross-Firm Document Sharing')
@Controller('shares')
@ApiBearerAuth()
export class ShareDocumentsController {
  constructor(private readonly shareDocumentsService: ShareDocumentsService) {}

  @Get(':shareId/documents/:documentId/stream')
  @CanRead('document')
  @ApiOperation({
    summary: 'Stream shared document with watermark',
    description: 'Stream a document shared via cross-firm collaboration with appropriate watermarking'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share',
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'UUID of the document',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watermarked document content streamed successfully',
    headers: {
      'Content-Type': {
        description: 'MIME type of the document',
        schema: { type: 'string' },
      },
      'Content-Length': {
        description: 'Size of the document in bytes',
        schema: { type: 'string' },
      },
      'X-Watermarked': {
        description: 'Indicates if document was watermarked',
        schema: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Share or document not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this shared document',
  })
  async streamSharedDocument(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: User,
    @Res() response: Response,
  ): Promise<void> {
    return this.shareDocumentsService.streamSharedDocument(
      shareId,
      documentId,
      user,
      response,
    );
  }

  @Get(':shareId/documents/:documentId/download')
  @CanRead('document')
  @ApiOperation({
    summary: 'Download shared document with watermark',
    description: 'Download a document shared via cross-firm collaboration with appropriate watermarking'
  })
  @ApiParam({ 
    name: 'shareId', 
    description: 'UUID of the share',
  })
  @ApiParam({ 
    name: 'documentId', 
    description: 'UUID of the document',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Watermarked document downloaded successfully',
    headers: {
      'Content-Disposition': {
        description: 'Attachment header with filename',
        schema: { type: 'string' },
      },
      'X-Watermarked': {
        description: 'Indicates if document was watermarked',
        schema: { type: 'string' },
      },
    },
  })
  async downloadSharedDocument(
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: User,
    @Res() response: Response,
  ): Promise<void> {
    return this.shareDocumentsService.downloadSharedDocument(
      shareId,
      documentId,
      user,
      response,
    );
  }
}