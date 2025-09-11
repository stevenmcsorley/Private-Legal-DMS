import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matter, MatterStatus, Client } from '../../common/entities';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { MatterResponseDto } from './dto/matter-response.dto';
import { UserInfo } from '../../auth/auth.service';

export interface MatterQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: MatterStatus;
  client_id?: string;
  firm_id?: string;
}

@Injectable()
export class MattersService {
  private readonly logger = new Logger(MattersService.name);

  constructor(
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createMatterDto: CreateMatterDto, user: UserInfo): Promise<MatterResponseDto> {
    if (!user.firm_id) {
      throw new ForbiddenException('User must belong to a firm to create matters');
    }

    // Verify the client exists and belongs to the same firm
    const client = await this.clientRepository.findOne({
      where: { id: createMatterDto.client_id },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${createMatterDto.client_id} not found`);
    }

    if (client.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Cannot create matter for client from different firm');
    }

    const matter = this.matterRepository.create({
      ...createMatterDto,
      firm_id: user.firm_id,
      created_by: user.sub,
      status: createMatterDto.status || MatterStatus.ACTIVE,
      security_class: createMatterDto.security_class || 1,
    });

    const savedMatter = await this.matterRepository.save(matter);
    
    this.logger.log(`Matter created: ${savedMatter.id} by user ${user.sub}`);
    
    return new MatterResponseDto(savedMatter);
  }

  async findAll(query: MatterQuery, user: UserInfo): Promise<{
    matters: MatterResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, search, status, client_id } = query;
    const firm_id = query.firm_id || user.firm_id;

    if (!firm_id) {
      throw new ForbiddenException('Firm ID is required');
    }

    const queryBuilder = this.matterRepository
      .createQueryBuilder('matter')
      .leftJoinAndSelect('matter.client', 'client')
      .leftJoinAndSelect('matter.created_by_user', 'user')
      .where('matter.firm_id = :firm_id', { firm_id });

    if (search) {
      queryBuilder.andWhere(
        '(matter.title ILIKE :search OR matter.description ILIKE :search OR client.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('matter.status = :status', { status });
    }

    if (client_id) {
      queryBuilder.andWhere('matter.client_id = :client_id', { client_id });
    }

    queryBuilder
      .orderBy('matter.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [matters, total] = await queryBuilder.getManyAndCount();

    return {
      matters: matters.map(matter => new MatterResponseDto({
        ...matter,
        client: matter.client ? {
          id: matter.client.id,
          name: matter.client.name,
          external_ref: matter.client.external_ref,
        } : undefined,
        created_by_user: matter.created_by_user ? {
          id: matter.created_by_user.id,
          display_name: matter.created_by_user.display_name,
          email: matter.created_by_user.email,
        } : undefined,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: UserInfo): Promise<MatterResponseDto> {
    const matter = await this.matterRepository.findOne({
      where: { id },
      relations: ['client', 'created_by_user', 'documents'],
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    // Check firm access
    if (matter.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this matter');
    }

    return new MatterResponseDto({
      ...matter,
      client: matter.client ? {
        id: matter.client.id,
        name: matter.client.name,
        external_ref: matter.client.external_ref,
      } : undefined,
      created_by_user: matter.created_by_user ? {
        id: matter.created_by_user.id,
        display_name: matter.created_by_user.display_name,
        email: matter.created_by_user.email,
      } : undefined,
      documents_count: matter.documents?.length || 0,
    });
  }

  async update(id: string, updateMatterDto: UpdateMatterDto, user: UserInfo): Promise<MatterResponseDto> {
    const matter = await this.findOne(id, user);

    // If changing client, verify the new client exists and belongs to the same firm
    if (updateMatterDto.client_id && updateMatterDto.client_id !== matter.client_id) {
      const client = await this.clientRepository.findOne({
        where: { id: updateMatterDto.client_id },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${updateMatterDto.client_id} not found`);
      }

      if (client.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
        throw new ForbiddenException('Cannot assign matter to client from different firm');
      }
    }

    await this.matterRepository.update(id, updateMatterDto);
    const updatedMatter = await this.matterRepository.findOne({
      where: { id },
      relations: ['client', 'created_by_user'],
    });

    this.logger.log(`Matter updated: ${id} by user ${user.sub}`);

    return new MatterResponseDto({
      ...updatedMatter,
      client: updatedMatter.client ? {
        id: updatedMatter.client.id,
        name: updatedMatter.client.name,
        external_ref: updatedMatter.client.external_ref,
      } : undefined,
      created_by_user: updatedMatter.created_by_user ? {
        id: updatedMatter.created_by_user.id,
        display_name: updatedMatter.created_by_user.display_name,
        email: updatedMatter.created_by_user.email,
      } : undefined,
    });
  }

  async remove(id: string, user: UserInfo): Promise<void> {
    const matter = await this.findOne(id, user);

    // Check if matter has any documents - you might want to prevent deletion in this case
    const documentCount = await this.matterRepository
      .createQueryBuilder('matter')
      .leftJoin('matter.documents', 'document')
      .where('matter.id = :id', { id })
      .andWhere('document.is_deleted = false')
      .getCount();

    if (documentCount > 0) {
      throw new BadRequestException(
        'Cannot delete matter with associated documents. Please archive documents first.',
      );
    }

    await this.matterRepository.remove(matter as any);
    
    this.logger.log(`Matter deleted: ${id} by user ${user.sub}`);
  }

  async findByClient(clientId: string, user: UserInfo): Promise<MatterResponseDto[]> {
    // Verify user has access to the client
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (client.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this client');
    }

    const matters = await this.matterRepository.find({
      where: { client_id: clientId },
      relations: ['client', 'created_by_user'],
      order: { created_at: 'DESC' },
    });

    return matters.map(matter => new MatterResponseDto({
      ...matter,
      client: {
        id: matter.client.id,
        name: matter.client.name,
        external_ref: matter.client.external_ref,
      },
      created_by_user: matter.created_by_user ? {
        id: matter.created_by_user.id,
        display_name: matter.created_by_user.display_name,
        email: matter.created_by_user.email,
      } : undefined,
    }));
  }

  async updateStatus(id: string, status: MatterStatus, user: UserInfo): Promise<MatterResponseDto> {
    const matter = await this.findOne(id, user);

    await this.matterRepository.update(id, { status });
    
    this.logger.log(`Matter status updated: ${id} to ${status} by user ${user.sub}`);
    
    return this.findOne(id, user);
  }
}