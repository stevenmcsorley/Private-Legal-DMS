import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client, Matter, Document, MatterStatus } from '../../common/entities';
import { UserInfo } from '../../auth/auth.service';
import { DocumentResponseDto } from '../documents/dto/document-response.dto';

interface ClientDashboard {
  client: {
    id: string;
    name: string;
    type: string;
    status: string;
    email?: string;
    assigned_user_email?: string;
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
        status: MatterStatus.ACTIVE,
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

    // Get recent documents (only non-confidential, non-privileged for client users)
    const recentDocumentsQuery = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.metadata', 'meta')
      .leftJoinAndSelect('document.matter', 'matter')
      .where('document.client_id = :clientId', { clientId: client.id })
      .andWhere('document.is_deleted = false')
      .andWhere('(meta.confidential IS NULL OR meta.confidential = false)')
      .andWhere('(meta.privileged IS NULL OR meta.privileged = false)')
      .andWhere('(meta.work_product IS NULL OR meta.work_product = false)')
      .orderBy('document.created_at', 'DESC')
      .take(10);

    const recentDocuments = await recentDocumentsQuery.getMany();

    return {
      client: {
        id: client.id,
        name: client.name,
        type: 'client',
        status: 'active',
        email: client.contact_email,
        assigned_user_email: user.email,
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

    // Calculate client-accessible document count for each matter
    const mattersWithAccessibleDocCount = await Promise.all(
      matters.map(async (matter) => {
        // Count only non-confidential, non-privileged, non-work-product documents
        const accessibleDocCount = await this.documentRepository
          .createQueryBuilder('document')
          .leftJoin('document.metadata', 'meta')
          .where('document.matter_id = :matterId', { matterId: matter.id })
          .andWhere('document.is_deleted = false')
          .andWhere('(meta.confidential IS NULL OR meta.confidential = false)')
          .andWhere('(meta.privileged IS NULL OR meta.privileged = false)')
          .andWhere('(meta.work_product IS NULL OR meta.work_product = false)')
          .getCount();

        return {
          ...matter,
          document_count: accessibleDocCount,
        };
      })
    );

    return {
      matters: mattersWithAccessibleDocCount,
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
        this.logger.warn(`Client ${client.id} trying to access document ${document.id} belonging to client ${document.client_id}`);
        return false;
      }

      // Check if document is confidential (client users can never see confidential docs)
      if (document.metadata?.confidential) {
        this.logger.debug(`Document ${document.id} is confidential, denying client access`);
        return false;
      }

      // Check if document is privileged (client users can never see privileged docs)
      if (document.metadata?.privileged) {
        this.logger.debug(`Document ${document.id} is privileged, denying client access`);
        return false;
      }

      // Check if document is work product (client users can never see work product)
      if (document.metadata?.work_product) {
        this.logger.debug(`Document ${document.id} is work product, denying client access`);
        return false;
      }

      // Additional validation: document must belong to a matter that the client has access to
      if (document.matter_id) {
        const canAccessMatter = await this.canClientAccessMatter(user, document.matter_id);
        if (!canAccessMatter) {
          this.logger.warn(`Client ${client.id} trying to access document ${document.id} from inaccessible matter ${document.matter_id}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error checking client document access: ${error.message}`);
      return false;
    }
  }

  async getUploadSettings(user: UserInfo): Promise<UploadSettings> {
    const client = await this.getClientForUser(user);

    // Get matters the client can upload to
    const accessibleMatters = await this.matterRepository.find({
      where: { 
        client_id: client.id,
        status: MatterStatus.ACTIVE, // Only allow uploads to active matters
      },
      select: ['id', 'title', 'status'],
    });

    return {
      max_file_size: 100 * 1024 * 1024, // 100MB for client uploads
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

  async getClientForUser(user: UserInfo): Promise<Client> {
    // For client portal access, user should have client_ids
    if (!user.client_ids || user.client_ids.length === 0) {
      this.logger.warn(`Client portal access denied for user ${user.email}: No client assignments found`);
      throw new ForbiddenException('Your account is not assigned to any clients. Please contact your administrator to set up client access.');
    }

    // Use the first client ID - in practice, client users typically have access to one client
    const clientId = user.client_ids[0];

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });

    if (!client) {
      this.logger.error(`Client not found for user ${user.email}: client_id ${clientId}`);
      throw new NotFoundException('Your assigned client could not be found. Please contact your administrator.');
    }

    return client;
  }
}
