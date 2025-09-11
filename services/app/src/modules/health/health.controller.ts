import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get application health status' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Get application readiness status' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  async ready() {
    return this.healthService.checkReadiness();
  }

  @Get('live')
  @ApiOperation({ summary: 'Get application liveness status' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  async live() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}