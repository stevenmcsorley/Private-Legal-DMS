import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAdminService, SystemHealthMetrics, FirmOnboardingStats } from './super-admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('system-health')
  async getSystemHealth(): Promise<SystemHealthMetrics> {
    return this.superAdminService.getSystemHealth();
  }

  @Get('firm-stats')
  async getFirmStats(): Promise<FirmOnboardingStats> {
    return this.superAdminService.getFirmStats();
  }

  @Get('users')
  async getSystemUsers() {
    return this.superAdminService.getSystemUsers();
  }

  @Get('firms')
  async getAllFirms() {
    return this.superAdminService.getAllFirms();
  }
}