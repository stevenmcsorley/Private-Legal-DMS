import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SuperAdminService, SystemHealthMetrics, FirmOnboardingStats, GlobalSettingDto } from './super-admin.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthzGuard } from '../../auth/guards/authz.guard';
import { CanWrite, CanRead } from '../../auth/decorators/permission.decorator';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('super-admin')
@ApiBearerAuth()
@Controller('super-admin')
@UseGuards(AuthGuard, AuthzGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('system-health')
  @CanRead('system')
  @ApiOperation({ summary: 'Get system health metrics' })
  @ApiResponse({ status: 200, description: 'System health metrics retrieved successfully' })
  async getSystemHealth(@CurrentUser() user: UserInfo): Promise<SystemHealthMetrics> {
    return this.superAdminService.getSystemHealth();
  }

  @Get('firm-stats')
  @CanRead('system')
  @ApiOperation({ summary: 'Get firm onboarding statistics' })
  @ApiResponse({ status: 200, description: 'Firm statistics retrieved successfully' })
  async getFirmStats(@CurrentUser() user: UserInfo): Promise<FirmOnboardingStats> {
    return this.superAdminService.getFirmStats();
  }

  @Get('users')
  @CanRead('system')
  @ApiOperation({ summary: 'Get all system users' })
  @ApiResponse({ status: 200, description: 'System users retrieved successfully' })
  async getSystemUsers(@CurrentUser() user: UserInfo) {
    return this.superAdminService.getSystemUsers();
  }

  @Get('firms')
  @CanRead('system')
  @ApiOperation({ summary: 'Get all firms with counts' })
  @ApiResponse({ status: 200, description: 'All firms with statistics retrieved successfully' })
  async getAllFirms(@CurrentUser() user: UserInfo) {
    return this.superAdminService.getFirmsWithCounts();
  }

  @Get('firms/:id')
  @CanRead('system')
  @ApiOperation({ summary: 'Get firm details by ID' })
  @ApiResponse({ status: 200, description: 'Firm details retrieved successfully' })
  async getFirmDetails(
    @Param('id') id: string,
    @CurrentUser() user: UserInfo
  ) {
    return this.superAdminService.getFirmDetails(id);
  }

  @Post('firms')
  @CanWrite('system')
  @ApiOperation({ summary: 'Create new firm with admin user' })
  @ApiResponse({ status: 201, description: 'Firm and admin user created successfully' })
  async createFirmWithAdmin(
    @Body() createData: {
      name: string;
      external_ref?: string;
      admin_email: string;
      admin_name: string;
    },
    @CurrentUser() user: UserInfo
  ) {
    return this.superAdminService.createFirmWithAdmin(createData);
  }

  // Global Settings Management
  @Get('settings')
  @CanRead('system')
  @ApiOperation({ summary: 'Get all global settings' })
  @ApiResponse({ status: 200, description: 'Global settings retrieved successfully' })
  async getGlobalSettings(@CurrentUser() user: UserInfo) {
    return this.superAdminService.getGlobalSettings();
  }

  @Get('settings/category/:category')
  @CanRead('system')
  @ApiOperation({ summary: 'Get global settings by category' })
  @ApiResponse({ status: 200, description: 'Global settings by category retrieved successfully' })
  async getGlobalSettingsByCategory(
    @Param('category') category: string,
    @CurrentUser() user: UserInfo
  ) {
    return this.superAdminService.getGlobalSettingsByCategory(category);
  }

  @Put('settings/:key')
  @CanWrite('system')
  @ApiOperation({ summary: 'Update a global setting' })
  @ApiResponse({ status: 200, description: 'Global setting updated successfully' })
  async updateGlobalSetting(
    @Param('key') key: string,
    @Body('value') value: string,
    @CurrentUser() user: UserInfo
  ) {
    return this.superAdminService.updateGlobalSetting(key, value);
  }

  @Post('settings')
  @CanWrite('system')
  @ApiOperation({ summary: 'Create a new global setting' })
  @ApiResponse({ status: 201, description: 'Global setting created successfully' })
  async createGlobalSetting(
    @Body() settingDto: GlobalSettingDto,
    @CurrentUser() user: UserInfo
  ) {
    return this.superAdminService.createGlobalSetting(settingDto);
  }

  @Delete('settings/:key')
  @CanWrite('system')
  @ApiOperation({ summary: 'Delete a global setting' })
  @ApiResponse({ status: 200, description: 'Global setting deleted successfully' })
  async deleteGlobalSetting(
    @Param('key') key: string,
    @CurrentUser() user: UserInfo
  ) {
    await this.superAdminService.deleteGlobalSetting(key);
    return { message: 'Setting deleted successfully' };
  }

  @Post('settings/initialize')
  @CanWrite('system')
  @ApiOperation({ summary: 'Initialize default global settings' })
  @ApiResponse({ status: 200, description: 'Default settings initialized successfully' })
  async initializeDefaultSettings(@CurrentUser() user: UserInfo) {
    await this.superAdminService.initializeDefaultSettings();
    return { message: 'Default settings initialized' };
  }
}