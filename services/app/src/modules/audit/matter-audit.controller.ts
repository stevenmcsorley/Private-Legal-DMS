import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditService } from '../../common/services/audit.service';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { CanRead } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class MatterAuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('matter/:matterId')
  @CanRead('matter')
  @ApiOperation({ summary: 'Get audit logs for a specific matter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 50 })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action' })
  @ApiQuery({ name: 'riskLevel', required: false, description: 'Filter by risk level' })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Filter from date (ISO string)' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Filter to date (ISO string)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matter audit logs retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Matter not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this matter',
  })
  async getMatterAuditLogs(
    @Param('matterId', ParseUUIDPipe) matterId: string,
    @Query() query: {
      page?: string;
      limit?: string;
      action?: string;
      riskLevel?: string;
      fromDate?: string;
      toDate?: string;
    },
    @CurrentUser() user: UserInfo,
  ) {
    const filters = {
      firmId: user.firm_id,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? Math.min(parseInt(query.limit), 1000) : 50,
      action: query.action,
      riskLevel: query.riskLevel,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    };

    return this.auditService.queryMatterAuditLogs(matterId, filters);
  }
}