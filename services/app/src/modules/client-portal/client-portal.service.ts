import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, Matter, Document } from '../../common/entities';
import { UserInfo } from '../../auth/auth.service';
import { DocumentResponseDto } from '../documents/dto/document-response.dto';

interface ClientDashboard {
  client: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  stats: {
    active_matters: number;
    total_documents: number;
    recent_documents: number;
    confidential_documents: number;
  };
  recent_matters: any[];
  recent_documents: any[];
}

interface UploadSettings {
  max_file_size: number;
  allowed_file_types: string[];
  accessible_matters: Matter[];
  upload_enabled: boolean;
}

@Injectable()
export class ClientPortalService {
  private readonly logger = new Logger(ClientPortalService.name);

  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(Matter)
    private matterRepository: Repository<Matter>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
  ) {}

  async getClientDashboard(user: UserInfo): Promise<ClientDashboard> {
    const client = await this.getClientForUser(user);
    
    // Get stats
    const activeMattersCount = await this.matterRepository.count({
      where: { 
        client_id: client.id,
        status: 'active',
      },
    });

    const totalDocumentsCount = await this.documentRepository.count({
      where: {
        client_id: client.id,
        is_deleted: false,
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDocumentsCount = await this.documentRepository.count({
      where: {
        client_id: client.id,
        is_deleted: false,
        created_at: thirtyDaysAgo,
      },
    });

    const confidentialDocumentsCount = await this.documentRepository
      .createQueryBuilder('document')
      .leftJoin('document.metadata', 'meta')
      .where('document.client_id = :clientId', { clientId: client.id })
      .andWhere('document.is_deleted = false')
      .andWhere('meta.confidential = true')
      .getCount();

    // Get recent matters
    const recentMatters = await this.matterRepository.find({
      where: { client_id: client.id },
      order: { updated_at: 'DESC' },
      take: 5,
      select: ['id', 'title', 'status', 'created_at', 'updated_at'],
    });

    // Get recent documents (non-confidential for client users)
    const recentDocumentsQuery = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.metadata', 'meta')
      .leftJoinAndSelect('document.matter', 'matter')
      .where('document.client_id = :clientId', { clientId: client.id })
      .andWhere('document.is_deleted = false')
      .orderBy('document.created_at', 'DESC')
      .take(10);

    // Only show non-confidential documents unless user has higher privileges
    if (!user.roles.some(role => ['legal_professional', 'firm_admin'].includes(role))) {
      recentDocumentsQuery.andWhere('(meta.confidential IS NULL OR meta.confidential = false)');
    }

    const recentDocuments = await recentDocumentsQuery.getMany();

    return {
      client: {
        id: client.id,
        name: client.name,
        type: client.type,
        status: client.status,
      },
      stats: {
        active_matters: activeMattersCount,
        total_documents: totalDocumentsCount,
        recent_documents: recentDocumentsCount,
        confidential_documents: confidentialDocumentsCount,
      },
      recent_matters: recentMatters,
      recent_documents: recentDocuments.map(doc => ({
        id: doc.id,
        title: doc.metadata?.title || doc.original_filename,
        filename: doc.original_filename,
        size: doc.size_bytes,
        created_at: doc.created_at,
        matter_title: doc.matter?.title,
        document_type: doc.metadata?.document_type,
      })),
    };
  }

  async getClientMatters(user: UserInfo, query: any): Promise<any> {
    const client = await this.getClientForUser(user);
    const { page = 1, limit = 20, search, status } = query;

    const queryBuilder = this.matterRepository
      .createQueryBuilder('matter')
      .where('matter.client_id = :clientId', { clientId: client.id })
      .orderBy('matter.updated_at', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(matter.title ILIKE :search OR matter.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('matter.status = :status', { status });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit);

    const [matters, total] = await queryBuilder.getManyAndCount();

    return {
      matters,
      total,
      page,
      limit,
    };
  }

  async getClientMatter(user: UserInfo, matterId: string): Promise<Matter> {
    const client = await this.getClientForUser(user);
    
    const matter = await this.matterRepository.findOne({
      where: { 
        id: matterId,
        client_id: client.id,
      },
      relations: ['client', 'responsible_attorney', 'team_members'],
    });

    if (!matter) {
      throw new NotFoundException('Matter not found or access denied');
    }

    return matter;
  }

  async canClientAccessMatter(user: UserInfo, matterId: string): Promise<boolean> {
    try {
      const client = await this.getClientForUser(user);
      
      const matter = await this.matterRepository.findOne({
        where: { 
          id: matterId,
          client_id: client.id,
        },
      });

      return !!matter;
    } catch (error) {
      return false;
    }
  }

  async canClientAccessDocument(user: UserInfo, document: DocumentResponseDto): Promise<boolean> {
    try {
      const client = await this.getClientForUser(user);

      // Check if document belongs to client
      if (document.client_id !== client.id) {
        return false;
      }

      // Check if document is confidential and user doesn't have permission to view
      if (document.metadata?.confidential && 
          !user.roles.some(role => ['legal_professional', 'firm_admin'].includes(role))) {
        return false;
      }

      // Check if document is privileged (only legal professionals can view)
      if (document.metadata?.privileged && 
          !user.roles.some(role => ['legal_professional', 'firm_admin'].includes(role))) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async getUploadSettings(user: UserInfo): Promise<UploadSettings> {
    const client = await this.getClientForUser(user);

    // Get matters the client can upload to
    const accessibleMatters = await this.matterRepository.find({
      where: { 
        client_id: client.id,
        status: 'active', // Only allow uploads to active matters
      },
      select: ['id', 'title', 'status'],
    });

    return {
      max_file_size: 50 * 1024 * 1024, // 50MB for client uploads
      allowed_file_types: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
      ],
      accessible_matters: accessibleMatters,
      upload_enabled: accessibleMatters.length > 0, // Only enable if they have accessible matters
    };
  }

  private async getClientForUser(user: UserInfo): Promise<Client> {
    // For client portal access, user should have client_ids
    if (!user.client_ids || user.client_ids.length === 0) {
      throw new ForbiddenException('User does not have client access');
    }

    // Use the first client ID - in practice, client users typically have access to one client
    const clientId = user.client_ids[0];

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }
}