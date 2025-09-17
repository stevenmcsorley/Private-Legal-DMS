import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenSearchService, SearchQuery, SearchResponse, SearchDocument } from '../../common/services/opensearch.service';
import { Document } from '../../common/entities/document.entity';
import { Matter } from '../../common/entities/matter.entity';
import { Client } from '../../common/entities/client.entity';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly openSearchService: OpenSearchService,
    private readonly auditService: AuditService,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async search(query: SearchQuery, firmId: string, user?: any): Promise<SearchResponse> {
    try {
      // Log search query for audit
      if (user) {
        await this.auditService.log({
          user,
          action: 'search_query',
          resource_type: 'search',
          resource_id: 'global',
          details: {
            query: query.q,
            type: query.type,
            filters: {
              date_range: query.date_range,
              confidential: query.confidential,
              matter_id: query.matter_id,
              client_id: query.client_id,
              tags: query.tags,
            },
          },
          risk_level: 'low',
        });
      }

      return await this.openSearchService.search(query, firmId);
    } catch (error) {
      this.logger.error('Search failed', error);
      
      // Log search failure
      if (user) {
        await this.auditService.log({
          user,
          action: 'search_error',
          resource_type: 'search',
          resource_id: 'global',
          details: {
            query: query.q,
            error: error.message,
          },
          risk_level: 'medium',
          outcome: 'failure',
        });
      }

      throw error;
    }
  }

  async getSuggestions(prefix: string, firmId: string): Promise<string[]> {
    try {
      return await this.openSearchService.getSuggestions(prefix, firmId);
    } catch (error) {
      this.logger.error('Failed to get suggestions', error);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    return await this.openSearchService.healthCheck();
  }

  // Document indexing methods
  async indexDocument(document: Document): Promise<void> {
    try {
      // Load the document with metadata
      const docWithMeta = await this.documentRepository.findOne({
        where: { id: document.id },
        relations: ['metadata', 'retention_class'],
      });

      if (!docWithMeta) {
        this.logger.warn(`Document ${document.id} not found for indexing`);
        return;
      }

      const searchDoc: SearchDocument = {
        id: docWithMeta.id,
        type: 'document',
        title: docWithMeta.metadata?.title || docWithMeta.original_filename || 'Untitled Document',
        content: docWithMeta.metadata?.extracted_text || '',
        metadata: {
          firm_id: docWithMeta.firm_id,
          matter_id: docWithMeta.matter_id,
          client_id: docWithMeta.client_id,
          filename: docWithMeta.original_filename,
          file_size: docWithMeta.size_bytes,
          mime_type: docWithMeta.mime_type,
          tags: docWithMeta.metadata?.tags || [],
          created_at: docWithMeta.created_at.toISOString(),
          updated_at: docWithMeta.updated_at.toISOString(),
          created_by: docWithMeta.created_by,
          is_confidential: docWithMeta.metadata?.confidential || false,
          legal_hold_active: docWithMeta.legal_hold || false,
          retention_class: docWithMeta.retention_class?.name || docWithMeta.retention_class_id,
          pages: docWithMeta.metadata?.pages || null,
        },
      };

      await this.openSearchService.indexDocument(searchDoc);
      this.logger.debug(`Indexed document: ${document.id}`);
    } catch (error) {
      this.logger.error(`Failed to index document: ${document.id}`, error);
      throw error;
    }
  }

  async indexMatter(matter: Matter): Promise<void> {
    try {
      const searchDoc: SearchDocument = {
        id: matter.id,
        type: 'matter',
        title: matter.title,
        content: matter.description || '',
        metadata: {
          firm_id: matter.firm_id,
          matter_id: matter.id,
          client_id: matter.client_id,
          tags: [], // Matter entity doesn't have tags field
          created_at: matter.created_at.toISOString(),
          updated_at: matter.updated_at.toISOString(),
          created_by: matter.created_by,
          is_confidential: matter.security_class > 1, // Use security_class as confidential indicator
        },
      };

      await this.openSearchService.indexDocument(searchDoc);
      this.logger.debug(`Indexed matter: ${matter.id}`);
    } catch (error) {
      this.logger.error(`Failed to index matter: ${matter.id}`, error);
      throw error;
    }
  }

  async indexClient(client: Client): Promise<void> {
    try {
      const searchDoc: SearchDocument = {
        id: client.id,
        type: 'client',
        title: client.name,
        content: client.contact_email || '', // Use contact_email instead of notes
        metadata: {
          firm_id: client.firm_id,
          client_id: client.id,
          tags: [], // Client entity doesn't have tags field
          created_at: client.created_at.toISOString(),
          updated_at: client.updated_at.toISOString(),
        },
      };

      await this.openSearchService.indexDocument(searchDoc);
      this.logger.debug(`Indexed client: ${client.id}`);
    } catch (error) {
      this.logger.error(`Failed to index client: ${client.id}`, error);
      throw error;
    }
  }

  async updateDocumentIndex(documentId: string, updates: Partial<SearchDocument>): Promise<void> {
    try {
      await this.openSearchService.updateDocument(documentId, updates);
      this.logger.debug(`Updated document index: ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to update document index: ${documentId}`, error);
      throw error;
    }
  }

  async removeFromIndex(id: string): Promise<void> {
    try {
      await this.openSearchService.deleteDocument(id);
      this.logger.debug(`Removed from index: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to remove from index: ${id}`, error);
      throw error;
    }
  }

  // Bulk indexing methods for initial setup or reindexing
  async reindexAllDocuments(firmId?: string): Promise<void> {
    this.logger.log('Starting document reindexing...');
    
    const queryBuilder = this.documentRepository.createQueryBuilder('document');
    
    if (firmId) {
      queryBuilder.where('document.firm_id = :firmId', { firmId });
    }

    const documents = await queryBuilder.getMany();
    
    for (const document of documents) {
      try {
        await this.indexDocument(document);
      } catch (error) {
        this.logger.error(`Failed to reindex document ${document.id}`, error);
      }
    }
    
    this.logger.log(`Reindexed ${documents.length} documents`);
  }

  async reindexAllMatters(firmId?: string): Promise<void> {
    this.logger.log('Starting matter reindexing...');
    
    const queryBuilder = this.matterRepository.createQueryBuilder('matter');
    
    if (firmId) {
      queryBuilder.where('matter.firm_id = :firmId', { firmId });
    }

    const matters = await queryBuilder.getMany();
    
    for (const matter of matters) {
      try {
        await this.indexMatter(matter);
      } catch (error) {
        this.logger.error(`Failed to reindex matter ${matter.id}`, error);
      }
    }
    
    this.logger.log(`Reindexed ${matters.length} matters`);
  }

  async reindexAllClients(firmId?: string): Promise<void> {
    this.logger.log('Starting client reindexing...');
    
    const queryBuilder = this.clientRepository.createQueryBuilder('client');
    
    if (firmId) {
      queryBuilder.where('client.firm_id = :firmId', { firmId });
    }

    const clients = await queryBuilder.getMany();
    
    for (const client of clients) {
      try {
        await this.indexClient(client);
      } catch (error) {
        this.logger.error(`Failed to reindex client ${client.id}`, error);
      }
    }
    
    this.logger.log(`Reindexed ${clients.length} clients`);
  }

  async reindexAll(firmId?: string): Promise<void> {
    this.logger.log('Starting full reindexing...');
    
    await Promise.all([
      this.reindexAllDocuments(firmId),
      this.reindexAllMatters(firmId),
      this.reindexAllClients(firmId),
    ]);
    
    this.logger.log('Full reindexing completed');
  }
}