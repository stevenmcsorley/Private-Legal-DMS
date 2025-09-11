import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Client } from '../../common/entities';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { UserInfo } from '../../auth/auth.service';

export interface ClientQuery {
  page?: number;
  limit?: number;
  search?: string;
  firm_id?: string;
}

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) {}

  async create(createClientDto: CreateClientDto, user: UserInfo): Promise<ClientResponseDto> {
    // Ensure user has firm_id
    if (!user.firm_id) {
      throw new ForbiddenException('User must belong to a firm to create clients');
    }

    // Check for duplicate external_ref within the firm if provided
    if (createClientDto.external_ref) {
      const existingClient = await this.clientRepository.findOne({
        where: {
          firm_id: user.firm_id,
          external_ref: createClientDto.external_ref,
        },
      });

      if (existingClient) {
        throw new ConflictException(
          `Client with external reference '${createClientDto.external_ref}' already exists`,
        );
      }
    }

    const client = this.clientRepository.create({
      ...createClientDto,
      firm_id: user.firm_id,
    });

    const savedClient = await this.clientRepository.save(client);
    
    this.logger.log(`Client created: ${savedClient.id} by user ${user.sub}`);
    
    return new ClientResponseDto(savedClient);
  }

  async findAll(query: ClientQuery, user: UserInfo): Promise<{
    clients: ClientResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, search } = query;
    const firm_id = query.firm_id || user.firm_id;

    if (!firm_id) {
      throw new ForbiddenException('Firm ID is required');
    }

    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .where('client.firm_id = :firm_id', { firm_id });

    if (search) {
      queryBuilder.andWhere(
        '(client.name ILIKE :search OR client.external_ref ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('client.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [clients, total] = await queryBuilder.getManyAndCount();

    return {
      clients: clients.map(client => new ClientResponseDto(client)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: UserInfo): Promise<ClientResponseDto> {
    const client = await this.clientRepository.findOne({
      where: { id },
      relations: ['matters'],
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check firm access
    if (client.firm_id !== user.firm_id && !user.roles.includes('super_admin')) {
      throw new ForbiddenException('Access denied to this client');
    }

    return new ClientResponseDto({
      ...client,
      matters_count: client.matters?.length || 0,
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto, user: UserInfo): Promise<ClientResponseDto> {
    const client = await this.findOne(id, user);

    // Check for duplicate external_ref within the firm if changing it
    if (updateClientDto.external_ref && updateClientDto.external_ref !== client.external_ref) {
      const existingClient = await this.clientRepository.findOne({
        where: {
          firm_id: user.firm_id,
          external_ref: updateClientDto.external_ref,
        },
      });

      if (existingClient && existingClient.id !== id) {
        throw new ConflictException(
          `Client with external reference '${updateClientDto.external_ref}' already exists`,
        );
      }
    }

    await this.clientRepository.update(id, updateClientDto);
    const updatedClient = await this.clientRepository.findOne({ where: { id } });

    this.logger.log(`Client updated: ${id} by user ${user.sub}`);

    return new ClientResponseDto(updatedClient);
  }

  async remove(id: string, user: UserInfo): Promise<void> {
    const client = await this.findOne(id, user);

    // Check if client has any matters - you might want to prevent deletion in this case
    const matterCount = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.matters', 'matter')
      .where('client.id = :id', { id })
      .getCount();

    if (matterCount > 0) {
      throw new ConflictException(
        'Cannot delete client with associated matters. Please close or transfer matters first.',
      );
    }

    await this.clientRepository.remove(client as any);
    
    this.logger.log(`Client deleted: ${id} by user ${user.sub}`);
  }

  async findByFirm(firmId: string): Promise<ClientResponseDto[]> {
    const clients = await this.clientRepository.find({
      where: { firm_id: firmId },
      order: { name: 'ASC' },
    });

    return clients.map(client => new ClientResponseDto(client));
  }
}