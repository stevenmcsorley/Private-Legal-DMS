import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FirmsService } from './firms.service';
import { CreateFirmDto } from './dto/create-firm.dto';
import { UpdateFirmDto } from './dto/update-firm.dto';
import { FirmOnboardingDto, FirmOnboardingResultDto } from './dto/firm-onboarding.dto';
import { FirmStatsDto } from './dto/firm-stats.dto';
import { FirmSettingsDto } from './dto/firm-settings.dto';
import { Firm } from '../../common/entities/firm.entity';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AuthzGuard } from '../../auth/guards/authz.guard';
import { CanWrite, CanRead } from '../../auth/decorators/permission.decorator';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { UserInfo } from '../../auth/auth.service';

@ApiTags('Firm Management')
@Controller('admin/firms')
@UseGuards(AuthGuard, AuthzGuard)
@ApiBearerAuth()
export class FirmsController {
  constructor(private readonly firmsService: FirmsService) {}

  @Post()
  @CanWrite('firm')
  @ApiOperation({ summary: 'Create a new firm' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Firm created successfully',
    type: Firm,
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Firm name already exists' 
  })
  async create(
    @Body() createFirmDto: CreateFirmDto,
    @CurrentUser() user: UserInfo,
  ): Promise<Firm> {
    return this.firmsService.create(createFirmDto);
  }

  @Get()
  @CanRead('firm')
  @ApiOperation({ summary: 'Get all firms' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firms retrieved successfully',
    type: [Firm],
  })
  async findAll(
    @CurrentUser() user: UserInfo,
  ): Promise<Firm[]> {
    return this.firmsService.findAll();
  }

  @Get(':id')
  @CanRead('firm')
  @ApiOperation({ summary: 'Get firm by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firm retrieved successfully',
    type: Firm,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<Firm> {
    return this.firmsService.findById(id);
  }

  @Put(':id')
  @CanWrite('firm')
  @ApiOperation({ summary: 'Update firm' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firm updated successfully',
    type: Firm,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Firm name already exists' 
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFirmDto: UpdateFirmDto,
    @CurrentUser() user: UserInfo,
  ): Promise<Firm> {
    return this.firmsService.update(id, updateFirmDto);
  }

  @Delete(':id')
  @CanWrite('firm')
  @ApiOperation({ summary: 'Delete firm' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Firm deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.firmsService.remove(id);
  }

  @Post('onboard')
  @CanWrite('firm')
  @ApiOperation({ 
    summary: 'Complete firm onboarding',
    description: 'Creates a new firm with admin user and default settings'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Firm onboarding completed successfully',
    type: FirmOnboardingResultDto,
  })
  async onboardFirm(
    @Body() onboardingData: FirmOnboardingDto,
    @CurrentUser() user: UserInfo,
  ): Promise<FirmOnboardingResultDto> {
    return this.firmsService.onboardFirm(onboardingData);
  }

  @Get(':id/settings')
  @CanRead('firm')
  @ApiOperation({ summary: 'Get firm settings' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firm settings retrieved successfully',
    type: FirmSettingsDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  async getFirmSettings(
    @Param('id', ParseUUIDPipe) firmId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<FirmSettingsDto> {
    return this.firmsService.getFirmSettings(firmId);
  }

  @Put(':id/settings')
  @CanWrite('firm')
  @ApiOperation({ summary: 'Update firm settings' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firm settings updated successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  async updateFirmSettings(
    @Param('id', ParseUUIDPipe) firmId: string,
    @Body() settings: FirmSettingsDto,
    @CurrentUser() user: UserInfo,
  ): Promise<void> {
    return this.firmsService.updateFirmSettings(firmId, settings);
  }

  @Get(':id/stats')
  @CanRead('firm')
  @ApiOperation({ 
    summary: 'Get firm statistics',
    description: 'Returns comprehensive statistics about the firm including users, clients, matters, and documents'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Firm statistics retrieved successfully',
    type: FirmStatsDto,
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Firm not found' 
  })
  async getFirmStats(
    @Param('id', ParseUUIDPipe) firmId: string,
    @CurrentUser() user: UserInfo,
  ): Promise<FirmStatsDto> {
    return this.firmsService.getFirmStats(firmId);
  }
}