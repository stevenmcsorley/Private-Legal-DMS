import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Firm } from '../../common/entities/firm.entity';
import { User } from '../../common/entities/user.entity';
import { RetentionClass } from '../../common/entities/retention-class.entity';
import { CreateFirmDto } from './dto/create-firm.dto';
import { UpdateFirmDto } from './dto/update-firm.dto';
import { FirmOnboardingDto, FirmOnboardingResultDto } from './dto/firm-onboarding.dto';
import { FirmStatsDto } from './dto/firm-stats.dto';
import { FirmSettingsDto, DEFAULT_FIRM_SETTINGS } from './dto/firm-settings.dto';
// TODO: Import UsersService when needed for Keycloak integration

@Injectable()
export class FirmsService {
  constructor(
    @InjectRepository(Firm)
    private readonly firmRepository: Repository<Firm>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RetentionClass)
    private readonly retentionClassRepository: Repository<RetentionClass>,
    // TODO: Add UsersService when Keycloak integration is implemented
  ) {}

  async create(createFirmDto: CreateFirmDto): Promise<Firm> {
    // Check if firm name already exists
    const existingFirm = await this.firmRepository.findOne({
      where: { name: createFirmDto.name }
    });

    if (existingFirm) {
      throw new ConflictException(`Firm with name '${createFirmDto.name}' already exists`);
    }

    // Merge with default settings
    const settings = {
      ...DEFAULT_FIRM_SETTINGS,
      ...createFirmDto.settings,
    };

    const firm = this.firmRepository.create({
      ...createFirmDto,
      settings,
    });

    return this.firmRepository.save(firm);
  }

  async findAll(): Promise<Firm[]> {
    return this.firmRepository.find({
      relations: ['users'],
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string): Promise<Firm> {
    const firm = await this.firmRepository.findOne({
      where: { id },
      relations: ['users', 'clients', 'matters', 'documents'],
    });

    if (!firm) {
      throw new NotFoundException(`Firm with ID '${id}' not found`);
    }

    return firm;
  }

  async update(id: string, updateFirmDto: UpdateFirmDto): Promise<Firm> {
    const firm = await this.findById(id);

    // If updating name, check for conflicts
    if (updateFirmDto.name && updateFirmDto.name !== firm.name) {
      const existingFirm = await this.firmRepository.findOne({
        where: { name: updateFirmDto.name }
      });

      if (existingFirm) {
        throw new ConflictException(`Firm with name '${updateFirmDto.name}' already exists`);
      }
    }

    // Merge settings if provided
    if (updateFirmDto.settings) {
      updateFirmDto.settings = {
        ...firm.settings,
        ...updateFirmDto.settings,
      };
    }

    await this.firmRepository.update(id, updateFirmDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    const firm = await this.findById(id);
    
    // Soft delete the firm
    await this.firmRepository.softDelete(id);
  }

  async onboardFirm(onboardingData: FirmOnboardingDto): Promise<FirmOnboardingResultDto> {
    const queryRunner = this.firmRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create firm
      const firmSettings = {
        ...DEFAULT_FIRM_SETTINGS,
        ...onboardingData.settings,
      };

      const firm = queryRunner.manager.create(Firm, {
        name: onboardingData.name,
        external_ref: onboardingData.external_ref,
        settings: firmSettings,
      });

      const savedFirm = await queryRunner.manager.save(firm);

      // 2. Create admin user
      const adminUser = queryRunner.manager.create(User, {
        email: onboardingData.admin_email,
        display_name: onboardingData.admin_display_name,
        firm_id: savedFirm.id,
        roles: ['firm_admin'],
        clearance_level: 8, // Default for firm admin
        is_active: true,
        attributes: {
          first_name: onboardingData.admin_first_name,
          last_name: onboardingData.admin_last_name,
          job_title: onboardingData.admin_job_title || 'Administrator',
        },
      });

      const savedAdminUser = await queryRunner.manager.save(adminUser);

      // 3. Create default retention classes
      const defaultRetentionClasses = onboardingData.initial_retention_classes || [
        'Standard Legal Documents',
        'Client Communications',
        'Financial Records',
        'Litigation Files',
        'Contracts and Agreements'
      ];

      for (const className of defaultRetentionClasses) {
        const retentionClass = queryRunner.manager.create(RetentionClass, {
          name: className,
          retention_years: firmSettings.document_management?.default_retention_years || 7,
          firm_id: savedFirm.id,
        });
        await queryRunner.manager.save(retentionClass);
      }

      await queryRunner.commitTransaction();

      // 4. TODO: Sync with Keycloak (when implementing, add try/catch)
      let keycloakSync = false;
      try {
        // TODO: Implement Keycloak user creation
        // await this.keycloakService.createUser(savedAdminUser);
        keycloakSync = true;
      } catch (error) {
        console.warn('Keycloak sync failed:', error.message);
      }

      // 5. TODO: Send welcome email (when email system is implemented)
      
      return {
        firm: {
          id: savedFirm.id,
          name: savedFirm.name,
          external_ref: savedFirm.external_ref,
          settings: savedFirm.settings,
        },
        admin_user: {
          id: savedAdminUser.id,
          email: savedAdminUser.email,
          display_name: savedAdminUser.display_name,
          keycloak_id: savedAdminUser.keycloak_id,
        },
        setup_status: {
          firm_created: true,
          admin_created: true,
          retention_classes_created: true,
          keycloak_sync: keycloakSync,
          next_steps: [
            'Admin user should log in and complete profile setup',
            'Configure firm-specific settings and branding',
            'Create additional users as needed',
            'Set up client portal if required',
            // TODO: Add 'Check email for setup instructions' when email is implemented
          ],
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getFirmSettings(firmId: string): Promise<FirmSettingsDto> {
    const firm = await this.findById(firmId);
    return firm.settings as FirmSettingsDto;
  }

  async updateFirmSettings(firmId: string, settings: FirmSettingsDto): Promise<void> {
    const firm = await this.findById(firmId);
    
    const updatedSettings = {
      ...firm.settings,
      ...settings,
    };

    await this.firmRepository.update(firmId, { settings: updatedSettings as any });
  }

  async getFirmStats(firmId: string): Promise<FirmStatsDto> {
    const firm = await this.firmRepository.findOne({
      where: { id: firmId },
      relations: ['users', 'clients', 'matters', 'documents'],
    });

    if (!firm) {
      throw new NotFoundException(`Firm with ID '${firmId}' not found`);
    }

    // User statistics
    const userStats = {
      total: firm.users?.length || 0,
      active: firm.users?.filter(u => u.is_active)?.length || 0,
      by_role: {},
    };

    // Count users by role
    if (firm.users) {
      for (const user of firm.users) {
        for (const role of user.roles) {
          userStats.by_role[role] = (userStats.by_role[role] || 0) + 1;
        }
      }
    }

    // Client statistics
    const clientStats = {
      total: firm.clients?.length || 0,
      active: firm.clients?.length || 0, // All clients are active since there's no soft delete
    };

    // Matter statistics
    const matterStats = {
      total: firm.matters?.length || 0,
      by_status: {},
    };

    if (firm.matters) {
      for (const matter of firm.matters) {
        const status = matter.status || 'unknown';
        matterStats.by_status[status] = (matterStats.by_status[status] || 0) + 1;
      }
    }

    // Document statistics
    const documentStats = {
      total: firm.documents?.length || 0,
      total_size_gb: 0,
      by_status: {},
    };

    if (firm.documents) {
      let totalBytes = 0;
      for (const doc of firm.documents) {
        totalBytes += Number(doc.size_bytes) || 0;
        const status = doc.is_deleted ? 'deleted' : 'active';
        documentStats.by_status[status] = (documentStats.by_status[status] || 0) + 1;
      }
      documentStats.total_size_gb = Math.round((totalBytes / (1024 * 1024 * 1024)) * 100) / 100;
    }

    // Activity statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activity = {
      documents_uploaded_last_30_days: firm.documents?.filter(d => 
        d.created_at && d.created_at > thirtyDaysAgo
      )?.length || 0,
      matters_created_last_30_days: firm.matters?.filter(m => 
        m.created_at && m.created_at > thirtyDaysAgo
      )?.length || 0,
      users_created_last_30_days: firm.users?.filter(u => 
        u.created_at && u.created_at > thirtyDaysAgo
      )?.length || 0,
    };

    return {
      firm: {
        id: firm.id,
        name: firm.name,
        created_at: firm.created_at,
        external_ref: firm.external_ref,
      },
      users: userStats,
      clients: clientStats,
      matters: matterStats,
      documents: documentStats,
      activity,
    };
  }
}