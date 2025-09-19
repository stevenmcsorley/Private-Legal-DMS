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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LegalHoldsService, LegalHoldQuery } from './legal-holds.service';
import { CreateLegalHoldDto } from './dto/create-legal-hold.dto';
import { UpdateLegalHoldDto } from './dto/update-legal-hold.dto';
import { LegalHoldResponseDto } from './dto/legal-hold-response.dto';
import { AssignCustodiansDto } from './dto/assign-custodians.dto';
import { CustodianResponseDto } from './dto/custodian-response.dto';
import { AcknowledgeHoldDto } from './dto/acknowledge-hold.dto';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead, CanWrite, CanDelete } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';
import { ComplianceTrackingService } from '../../common/services/compliance-tracking.service';
import { HoldEnforcementService } from '../../common/services/hold-enforcement.service';

@ApiTags('Legal Holds')
@ApiBearerAuth()
@Controller('legal-holds')
export class LegalHoldsController {
  constructor(
    private readonly legalHoldsService: LegalHoldsService,
    private readonly complianceTrackingService: ComplianceTrackingService,
    private readonly holdEnforcementService: HoldEnforcementService,
  ) {}

  @Post()
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Create a new legal hold' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Legal hold created successfully',
    type: LegalHoldResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to create legal holds',
  })
  async create(
    @Body() createLegalHoldDto: CreateLegalHoldDto,
    @CurrentUser() user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    return this.legalHoldsService.create(createLegalHoldDto, user);
  }

  @Get()
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get all legal holds with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 20 })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, description, or reason' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status', enum: ['active', 'released', 'expired'] })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by type', enum: ['litigation', 'investigation', 'audit', 'regulatory', 'other'] })
  @ApiQuery({ name: 'matter_id', required: false, description: 'Filter by matter ID' })
  @ApiQuery({ name: 'firm_id', required: false, description: 'Filter by firm ID (super admin only)' })
  @ApiQuery({ name: 'created_by', required: false, description: 'Filter by creator user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal holds retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/LegalHoldResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query() query: LegalHoldQuery,
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.findAll(query, user);
  }

  @Get('statistics')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get legal hold statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total_holds: { type: 'number' },
        active_holds: { type: 'number' },
        released_holds: { type: 'number' },
        expired_holds: { type: 'number' },
        total_documents_on_hold: { type: 'number' },
        holds_by_type: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
      },
    },
  })
  async getStatistics(@CurrentUser() user: UserInfo) {
    return this.legalHoldsService.getHoldStatistics(user);
  }

  @Get(':id/documents')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get documents associated with a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for documents' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documents retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              file_path: { type: 'string' },
              file_size: { type: 'number' },
              file_type: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
              metadata: { type: 'object' },
              matter: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  matter_number: { type: 'string' },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getHoldDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.legalHoldsService.getHoldDocuments(id, { search, page, limit }, user);
  }

  @Get(':id/custodians')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get custodians associated with a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Custodians retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              department: { type: 'string' },
              notified_at: { type: 'string' },
              acknowledged_at: { type: 'string' },
              status: { type: 'string', enum: ['notified', 'acknowledged', 'pending'] },
            },
          },
        },
      },
    },
  })
  async getHoldCustodians(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.getHoldCustodians(id, user);
  }

  @Get(':id/audit')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get audit log for a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Audit log retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              action: { type: 'string' },
              details: { type: 'string' },
              user_name: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getHoldAuditLog(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.getHoldAuditLog(id, user);
  }

  @Get(':id')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get a legal hold by ID' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold retrieved successfully',
    type: LegalHoldResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this legal hold',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    return this.legalHoldsService.findOne(id, user);
  }

  @Patch(':id')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Update a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold updated successfully',
    type: LegalHoldResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this legal hold',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLegalHoldDto: UpdateLegalHoldDto,
    @CurrentUser() user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    return this.legalHoldsService.update(id, updateLegalHoldDto, user);
  }

  @Post(':id/release')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Release a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold released successfully',
    type: LegalHoldResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Legal hold is not active',
  })
  async release(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: UserInfo,
  ): Promise<LegalHoldResponseDto> {
    return this.legalHoldsService.release(id, reason, user);
  }

  @Post(':id/apply-to-documents')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Apply legal hold to specific documents' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold applied to documents',
    schema: {
      type: 'object',
      properties: {
        applied: { type: 'number', description: 'Number of documents hold was applied to' },
        skipped: { type: 'number', description: 'Number of documents that were skipped (already on hold)' },
      },
    },
  })
  async applyToDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('document_ids') documentIds: string[],
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.applyHoldToDocuments(id, documentIds, user);
  }

  @Delete(':id')
  @CanDelete('legal_hold')
  @ApiOperation({ summary: 'Delete a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Legal hold deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete active legal hold',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.legalHoldsService.remove(id, user);
  }

  // Custodian Management Endpoints

  @Post(':id/custodians')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Assign custodians to a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Custodians assigned successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot assign custodians to inactive legal hold',
  })
  async assignCustodians(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignCustodiansDto: AssignCustodiansDto,
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.assignCustodians(id, assignCustodiansDto, user);
  }

  @Get(':id/custodians')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get custodians for a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Custodians retrieved successfully',
    type: [CustodianResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  async getCustodians(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<CustodianResponseDto[]> {
    return this.legalHoldsService.getCustodians(id, user);
  }

  @Post(':id/acknowledge')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Acknowledge a legal hold (for custodians)' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Legal hold acknowledged successfully',
    type: CustodianResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Custodian assignment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Legal hold already acknowledged',
  })
  async acknowledgeLegalHold(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() acknowledgeDto: AcknowledgeHoldDto,
    @CurrentUser() user: UserInfo,
  ): Promise<CustodianResponseDto> {
    return this.legalHoldsService.acknowledgeLegalHold(id, acknowledgeDto, user);
  }

  @Delete(':id/custodians/:custodianId')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Remove a custodian from a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiParam({ name: 'custodianId', description: 'Custodian user ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Custodian removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold or custodian assignment not found',
  })
  async removeCustodian(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('custodianId', ParseUUIDPipe) custodianId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.legalHoldsService.removeCustodian(id, custodianId, user);
  }

  @Post(':id/send-reminders')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Send compliance reminders to custodians' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance reminders sent',
    schema: {
      type: 'object',
      properties: {
        sent: { type: 'number' },
        failed: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  async sendComplianceReminders(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.legalHoldsService.sendComplianceReminders(id, user);
  }

  @Get('my-assignments')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get legal hold assignments for current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Custodian compliance status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total_assignments: { type: 'number' },
        pending: { type: 'number' },
        acknowledged: { type: 'number' },
        compliant: { type: 'number' },
        non_compliant: { type: 'number' },
        assignments: {
          type: 'array',
          items: { $ref: '#/components/schemas/CustodianResponseDto' },
        },
      },
    },
  })
  async getCustodianComplianceStatus(@CurrentUser() user: UserInfo) {
    return this.legalHoldsService.getCustodianComplianceStatus(user);
  }

  // Compliance Tracking Endpoints

  @Get(':id/compliance-report')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get compliance report for a legal hold' })
  @ApiParam({ name: 'id', description: 'Legal hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Compliance report generated successfully',
    schema: {
      type: 'object',
      properties: {
        legal_hold_id: { type: 'string' },
        legal_hold_name: { type: 'string' },
        compliance_status: { 
          type: 'string', 
          enum: ['compliant', 'non_compliant', 'at_risk'] 
        },
        custodian_compliance: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            acknowledged: { type: 'number' },
            pending: { type: 'number' },
            non_compliant: { type: 'number' },
            compliance_rate: { type: 'number' },
          },
        },
        document_compliance: {
          type: 'object',
          properties: {
            total_documents: { type: 'number' },
            preserved_documents: { type: 'number' },
            deleted_documents: { type: 'number' },
            at_risk_documents: { type: 'number' },
          },
        },
        last_checked: { type: 'string', format: 'date-time' },
        violations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              severity: { type: 'string' },
              description: { type: 'string' },
              detected_at: { type: 'string', format: 'date-time' },
              affected_entity_id: { type: 'string' },
              affected_entity_type: { type: 'string' },
            },
          },
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Legal hold not found',
  })
  async getComplianceReport(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ) {
    // Verify access to the legal hold first
    await this.legalHoldsService.findOne(id, user);
    return this.complianceTrackingService.generateComplianceReport(id);
  }

  @Get('compliance/system-metrics')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Get system-wide compliance metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System compliance metrics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total_active_holds: { type: 'number' },
        compliant_holds: { type: 'number' },
        non_compliant_holds: { type: 'number' },
        at_risk_holds: { type: 'number' },
        overall_compliance_rate: { type: 'number' },
        total_custodians: { type: 'number' },
        acknowledged_custodians: { type: 'number' },
        pending_custodians: { type: 'number' },
        overdue_acknowledgments: { type: 'number' },
        recent_violations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              severity: { type: 'string' },
              description: { type: 'string' },
              detected_at: { type: 'string', format: 'date-time' },
              affected_entity_id: { type: 'string' },
              affected_entity_type: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getSystemComplianceMetrics(@CurrentUser() user: UserInfo) {
    // For non-super admins, filter by their firm
    const firmId = user.roles.includes('super_admin') ? undefined : user.firm_id;
    return this.complianceTrackingService.getSystemComplianceMetrics(firmId);
  }

  // Enforcement Endpoints

  @Post('enforcement/check-document/:documentId')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Check and enforce legal holds on a document' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document enforcement check completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        actions_taken: {
          type: 'array',
          items: { type: 'string' },
        },
        documents_affected: { type: 'number' },
        custodians_notified: { type: 'number' },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async enforceHoldsOnDocument(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.holdEnforcementService.enforceHoldsOnDocument(documentId);
  }

  @Post('enforcement/check-modification/:documentId')
  @CanWrite('legal_hold')
  @ApiOperation({ summary: 'Check document modification compliance' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document modification compliance check completed',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        actions_taken: {
          type: 'array',
          items: { type: 'string' },
        },
        documents_affected: { type: 'number' },
        custodians_notified: { type: 'number' },
        errors: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async checkDocumentModificationCompliance(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.holdEnforcementService.checkDocumentModificationCompliance(documentId);
  }

  @Get('enforcement/deletion-check/:documentId')
  @CanRead('legal_hold')
  @ApiOperation({ summary: 'Check if document deletion is allowed' })
  @ApiParam({ name: 'documentId', description: 'Document ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Document deletion check completed',
    schema: {
      type: 'object',
      properties: {
        allowed: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
  })
  async checkDocumentDeletion(
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @CurrentUser() user: UserInfo,
  ) {
    return this.holdEnforcementService.preventDocumentDeletion(documentId);
  }
}