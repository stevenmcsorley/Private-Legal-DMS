import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

export interface SearchDocument {
  id: string;
  type: 'document' | 'matter' | 'client';
  title: string;
  content?: string;
  metadata: {
    firm_id: string;
    matter_id?: string;
    client_id?: string;
    filename?: string;
    file_size?: number;
    mime_type?: string;
    tags?: string[];
    created_at: string;
    updated_at: string;
    created_by?: string;
    is_confidential?: boolean;
    legal_hold_active?: boolean;
    retention_class?: string;
    pages?: number;
  };
}

export interface SearchQuery {
  q: string;
  type?: 'document' | 'matter' | 'client' | 'all';
  sort?: 'relevance' | 'date_desc' | 'date_asc' | 'title';
  date_range?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  confidential?: 'true' | 'false' | 'all';
  matter_id?: string;
  client_id?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  results: SearchDocument[];
  total: number;
  page: number;
  limit: number;
  aggregations?: Record<string, any>;
}

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private readonly logger = new Logger(OpenSearchService.name);
  private client: Client;
  private readonly indexName = 'legal_documents';

  constructor(private configService: ConfigService) {
    const opensearchUrl = this.configService.get<string>('OPENSEARCH_URL', 'http://opensearch:9200');
    
    this.client = new Client({
      node: opensearchUrl,
      ssl: {
        rejectUnauthorized: false, // For dev environment
      },
    });
  }

  async onModuleInit() {
    try {
      await this.ensureIndexExists();
      await this.updateIndexSettings();
      this.logger.log('OpenSearch service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize OpenSearch service', error);
    }
  }

  private async ensureIndexExists() {
    try {
      const { body: exists } = await this.client.indices.exists({
        index: this.indexName,
      });

      if (!exists) {
        await this.createIndex();
        this.logger.log(`Created index: ${this.indexName}`);
      }
    } catch (error) {
      this.logger.error('Error checking/creating index', error);
      throw error;
    }
  }

  private async updateIndexSettings() {
    try {
      // Update index settings to allow larger documents for highlighting
      await this.client.indices.putSettings({
        index: this.indexName,
        body: {
          settings: {
            'index.highlight.max_analyzed_offset': 10000000, // 10MB limit
          }
        }
      });
      this.logger.log(`Updated index settings for: ${this.indexName}`);
    } catch (error) {
      this.logger.warn('Failed to update index settings (this is expected for new indices)', error.message);
    }
  }

  private async createIndex() {
    const indexBody = {
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        // Set highlighting limits for large documents
        'index.highlight.max_analyzed_offset': 10000000, // 10MB limit for highlighting
        analysis: {
          analyzer: {
            legal_analyzer: {
              tokenizer: 'standard',
              filter: ['lowercase', 'legal_synonyms', 'stemmer', 'stop'],
            },
            legal_search_analyzer: {
              tokenizer: 'standard',
              filter: ['lowercase', 'legal_synonyms'],
            },
          },
          filter: {
            legal_synonyms: {
              type: 'synonym',
              synonyms: [
                'attorney,lawyer,counsel,counselor,advocate',
                'contract,agreement,pact,deal,arrangement',
                'merger,acquisition,takeover,buyout',
                'litigation,lawsuit,case,suit,action',
                'defendant,respondent,accused',
                'plaintiff,claimant,petitioner',
                'court,tribunal,forum,bench',
                'judge,justice,magistrate',
                'evidence,proof,documentation',
                'witness,testifier,deponent',
                'settlement,resolution,accord',
                'damages,compensation,restitution',
                'liability,responsibility,accountability',
                'compliance,adherence,conformity',
                'regulation,rule,statute,law',
                'corporation,company,business,entity,firm',
                'partnership,alliance,joint venture',
                'intellectual property,IP,patents,trademarks',
                'real estate,property,realty,land',
                'employment,labor,work,job',
                'tax,taxation,levy,duty',
                'bankruptcy,insolvency,liquidation',
                'insurance,coverage,policy,protection',
                'securities,stocks,bonds,investments',
                'criminal,penal,felony,misdemeanor',
                'civil,tort,negligence,malpractice',
                'family,domestic,divorce,custody',
                'estate,probate,will,trust,inheritance',
                'immigration,visa,citizenship,naturalization',
              ],
            },
            stemmer: {
              type: 'stemmer',
              language: 'english',
            },
          },
        },
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          type: { type: 'keyword' },
          title: {
            type: 'text',
            analyzer: 'legal_analyzer',
            search_analyzer: 'legal_search_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' },
            },
          },
          content: {
            type: 'text',
            analyzer: 'legal_analyzer',
            search_analyzer: 'legal_search_analyzer',
          },
          'metadata.firm_id': { type: 'keyword' },
          'metadata.matter_id': { type: 'keyword' },
          'metadata.client_id': { type: 'keyword' },
          'metadata.filename': {
            type: 'text',
            analyzer: 'legal_analyzer',
            fields: { keyword: { type: 'keyword' } },
          },
          'metadata.file_size': { type: 'long' },
          'metadata.mime_type': { type: 'keyword' },
          'metadata.tags': { type: 'keyword' },
          'metadata.created_at': { type: 'date' },
          'metadata.updated_at': { type: 'date' },
          'metadata.created_by': { type: 'keyword' },
          'metadata.is_confidential': { type: 'boolean' },
          'metadata.legal_hold_active': { type: 'boolean' },
          'metadata.retention_class': { type: 'keyword' },
          'metadata.pages': { type: 'integer' },
        },
      },
    };

    await this.client.indices.create({
      index: this.indexName,
      body: indexBody,
    });
  }

  async indexDocument(doc: SearchDocument): Promise<void> {
    try {
      await this.client.index({
        index: this.indexName,
        id: doc.id,
        body: doc,
        refresh: 'wait_for',
      });
      this.logger.debug(`Indexed document: ${doc.id}`);
    } catch (error) {
      this.logger.error(`Failed to index document ${doc.id}`, error);
      throw error;
    }
  }

  async updateDocument(id: string, doc: Partial<SearchDocument>): Promise<void> {
    try {
      await this.client.update({
        index: this.indexName,
        id,
        body: { doc },
        refresh: 'wait_for',
      });
      this.logger.debug(`Updated document: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to update document ${id}`, error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await this.client.delete({
        index: this.indexName,
        id,
        refresh: 'wait_for',
      });
      this.logger.debug(`Deleted document: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete document ${id}`, error);
      throw error;
    }
  }

  async search(query: SearchQuery, firmId: string): Promise<SearchResponse> {
    try {
      const searchBody = this.buildSearchQuery(query, firmId);
      
      // Always try with highlighting first
      const response = await this.client.search({
        index: this.indexName,
        body: searchBody,
      });

      return this.formatSearchResponse(response.body, query);
    } catch (error) {
      this.logger.error('Search query failed', error);
      throw error;
    }
  }

  private buildSearchQuery(query: SearchQuery, firmId: string) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const from = (page - 1) * limit;

    const must: any[] = [
      { term: { 'metadata.firm_id': firmId } },
    ];

    // Type filter
    if (query.type && query.type !== 'all') {
      must.push({ term: { type: query.type } });
    }

    // Main search query with proximity and fuzzy matching
    if (query.q) {
      const searchQueries = [];

      // Exact phrase match (highest boost)
      searchQueries.push({
        multi_match: {
          query: query.q,
          type: 'phrase',
          fields: ['title^3', 'content', 'metadata.filename^2'],
          boost: 3,
        },
      });

      // Proximity search (within 5 words)
      if (query.q.includes(' ')) {
        searchQueries.push({
          multi_match: {
            query: query.q,
            type: 'phrase_prefix',
            slop: 5,
            fields: ['title^2', 'content', 'metadata.filename'],
            boost: 2,
          },
        });
      }

      // Fuzzy matching for typos
      searchQueries.push({
        multi_match: {
          query: query.q,
          type: 'best_fields',
          fields: ['title^2', 'content', 'metadata.filename'],
          fuzziness: 'AUTO',
          prefix_length: 2,
          boost: 1.5,
        },
      });

      // Wildcard search for partial matches
      searchQueries.push({
        multi_match: {
          query: `*${query.q}*`,
          type: 'phrase_prefix',
          fields: ['title', 'content', 'metadata.filename'],
          boost: 1,
        },
      });

      must.push({
        bool: {
          should: searchQueries,
          minimum_should_match: 1,
        },
      });
    }

    // Date range filter
    if (query.date_range && query.date_range !== 'all') {
      const dateRange = this.getDateRange(query.date_range);
      must.push({
        range: {
          'metadata.created_at': {
            gte: dateRange,
          },
        },
      });
    }

    // Confidential filter
    if (query.confidential && query.confidential !== 'all') {
      must.push({
        term: {
          'metadata.is_confidential': query.confidential === 'true',
        },
      });
    }

    // Matter/Client filters
    if (query.matter_id) {
      must.push({ term: { 'metadata.matter_id': query.matter_id } });
    }
    if (query.client_id) {
      must.push({ term: { 'metadata.client_id': query.client_id } });
    }

    // Tags filter
    if (query.tags && query.tags.length > 0) {
      must.push({
        terms: { 'metadata.tags': query.tags },
      });
    }

    // Sort configuration
    const sort = this.getSortConfig(query.sort || 'relevance');

    // Aggregations for faceted search
    const aggregations = {
      types: {
        terms: { field: 'type', size: 10 },
      },
      mime_types: {
        terms: { field: 'metadata.mime_type', size: 10 },
      },
      tags: {
        terms: { field: 'metadata.tags', size: 20 },
      },
      date_histogram: {
        date_histogram: {
          field: 'metadata.created_at',
          calendar_interval: 'month',
          format: 'yyyy-MM',
        },
      },
    };

    return {
      query: {
        bool: { must },
      },
      sort,
      from,
      size: limit,
      aggs: aggregations,
      highlight: {
        fields: {
          title: { 
            fragment_size: 150, 
            number_of_fragments: 1,
            max_analyzer_offset: 10000000, // 10MB for titles
          },
          content: { 
            fragment_size: 150, 
            number_of_fragments: 2,
            boundary_chars: '.,!? \t\n',
            boundary_max_scan: 20,
            max_analyzer_offset: 10000000, // 10MB for content
          },
          'metadata.filename': { 
            fragment_size: 100, 
            number_of_fragments: 1,
            max_analyzer_offset: 10000000, // 10MB for filenames
          },
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
        max_analyzer_offset: 10000000, // 10MB global limit
        // Allow partial highlighting - don't fail entire search if one doc is too large
        require_field_match: false,
      },
    };
  }

  private getDateRange(range: string): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return today.toISOString();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo.toISOString();
      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return quarterAgo.toISOString();
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return yearAgo.toISOString();
      default:
        return '1970-01-01T00:00:00.000Z';
    }
  }

  private getSortConfig(sort: string) {
    switch (sort) {
      case 'date_desc':
        return [{ 'metadata.created_at': { order: 'desc' } }];
      case 'date_asc':
        return [{ 'metadata.created_at': { order: 'asc' } }];
      case 'title':
        return [{ 'title.keyword': { order: 'asc' } }];
      case 'relevance':
      default:
        return ['_score'];
    }
  }

  private estimatePageNumber(content: string, highlightedText: string, totalPages: number): number | null {
    if (!content || !highlightedText || !totalPages) return null;
    
    // Remove HTML tags from highlighted text to find position in original content
    const cleanHighlight = highlightedText.replace(/<\/?mark>/g, '');
    const matchPosition = content.indexOf(cleanHighlight);
    
    if (matchPosition === -1) return null;
    
    // Estimate page based on position (assuming uniform text distribution)
    const contentLength = content.length;
    const relativePosition = matchPosition / contentLength;
    const estimatedPage = Math.ceil(relativePosition * totalPages);
    
    return Math.max(1, Math.min(estimatedPage, totalPages));
  }

  private formatSearchResponse(response: any, query: SearchQuery): SearchResponse {
    const results = response.hits.hits.map((hit: any) => {
      const doc = hit._source as SearchDocument;
      
      // Try to use highlighted snippets if available for this specific document
      if (hit.highlight) {
        const snippets = [];
        if (hit.highlight.title) snippets.push(...hit.highlight.title);
        if (hit.highlight.content) snippets.push(...hit.highlight.content);
        if (hit.highlight['metadata.filename']) snippets.push(...hit.highlight['metadata.filename']);
        
        // Create a snippet from highlights or fallback to content
        const snippet = snippets.length > 0 
          ? snippets[0].replace(/<\/?mark>/g, '') 
          : doc.content?.substring(0, 150) + '...' || 'No content available';
        
        // Estimate page number for documents with page info
        let estimatedPage = null;
        if (doc.metadata.pages && snippets.length > 0 && doc.content) {
          estimatedPage = this.estimatePageNumber(doc.content, snippets[0], doc.metadata.pages);
        }
        
        return {
          ...doc,
          snippet,
          score: hit._score,
          estimatedPage,
          totalPages: doc.metadata.pages,
        };
      }

      // Fallback to content snippet if no highlighting available for this document
      return {
        ...doc,
        snippet: doc.content?.substring(0, 150) + '...' || 'No content available',
        score: hit._score,
        estimatedPage: null,
        totalPages: doc.metadata.pages,
      };
    });

    return {
      results,
      total: response.hits.total?.value || response.hits.total || 0,
      page: query.page || 1,
      limit: query.limit || 50,
      aggregations: response.aggregations,
    };
  }

  async getSuggestions(prefix: string, firmId: string): Promise<string[]> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: [
                { term: { 'metadata.firm_id': firmId } },
                {
                  multi_match: {
                    query: prefix,
                    type: 'phrase_prefix',
                    fields: ['title^2', 'content', 'metadata.filename'],
                  },
                },
              ],
            },
          },
          aggs: {
            suggestions: {
              terms: {
                field: 'title.keyword',
                include: `.*${prefix}.*`,
                size: 10,
              },
            },
          },
          size: 0,
        },
      });

      return response.body.aggregations?.suggestions?.buckets?.map((bucket: any) => bucket.key) || [];
    } catch (error) {
      this.logger.error('Failed to get suggestions', error);
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.ping();
      return response.statusCode === 200;
    } catch {
      return false;
    }
  }
}