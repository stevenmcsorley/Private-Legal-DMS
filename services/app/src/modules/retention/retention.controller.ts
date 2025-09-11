import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DocumentRetentionService } from '../../common/services/document-retention.service';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanWrite, CanRead } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Document Retention')
@ApiBearerAuth()
@Controller('retention')
export class RetentionController {
  constructor(private readonly retentionService: DocumentRetentionService) {}

  @Post('enforce')
  @CanWrite('retention')
  @ApiOperation({ summary: 'Manually trigger retention policy enforcement' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retention policy enforcement completed',
    schema: {
      type: 'object',
      properties: {
        documentsEvaluated: { type: 'number' },
        documentsEligibleForDeletion: { type: 'number' },
        documentsDeleted: { type: 'number' },
        documentsSkipped: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async enforceRetentionPolicies(@CurrentUser() user: UserInfo) {
    return this.retentionService.enforceRetentionPolicies();
  }

  @Get('eligible-for-deletion')
  @CanRead('retention')
  @ApiOperation({ summary: 'Get documents eligible for deletion' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents eligible for deletion retrieved',
  })
  async getDocumentsEligibleForDeletion(
    @Query('firm_id') firmId?: string,
    @CurrentUser() user?: UserInfo,
  ) {
    const effectiveFirmId = firmId || user?.firm_id;
    return this.retentionService.getDocumentsEligibleForDeletion(effectiveFirmId);
  }

  @Post('legal-hold/bulk-apply')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Bulk apply legal hold to documents' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Document IDs to apply legal hold to',
        },
        reason: {
          type: 'string',
          description: 'Reason for legal hold',
        },
      },
      required: ['document_ids', 'reason'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold applied',
    schema: {
      type: 'object',
      properties: {
        applied: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async bulkApplyLegalHold(
    @Body('document_ids') documentIds: string[],
    @Body('reason') reason: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.retentionService.bulkApplyLegalHold(documentIds, reason, user.sub);
  }

  @Post('legal-hold/bulk-remove')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Bulk remove legal hold from documents' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document_ids: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Document IDs to remove legal hold from',
        },
      },
      required: ['document_ids'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold removed',
    schema: {
      type: 'object',
      properties: {
        removed: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async bulkRemoveLegalHold(
    @Body('document_ids') documentIds: string[],
    @CurrentUser() user: UserInfo,
  ) {
    return this.retentionService.bulkRemoveLegalHold(documentIds, user.sub);
  }

  @Delete('cleanup-soft-deleted')
  @CanWrite('retention')
  @ApiOperation({ summary: 'Clean up soft-deleted documents' })
  @ApiQuery({ name: 'days_old', required: false, description: 'Days old threshold (default 30)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cleanup completed',
    schema: {
      type: 'object',
      properties: {
        deleted_count: { type: 'number' },
      },
    },
  })
  async cleanupSoftDeletedDocuments(
    @Query('days_old') daysOld?: number,
    @CurrentUser() user?: UserInfo,
  ) {
    const deletedCount = await this.retentionService.cleanupSoftDeletedDocuments(
      daysOld ? parseInt(daysOld.toString()) : 30,
    );
    return { deleted_count: deletedCount };
  }

  @Delete('hard-delete/:id')
  @CanWrite('retention')
  @ApiOperation({ summary: 'Hard delete a specific document' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Document hard deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Document not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Document cannot be hard deleted (not soft-deleted or under legal hold)',
  })
  async hardDeleteDocument(
    @Param('id', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.retentionService.hardDeleteDocument(documentId);
  }
}