import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/user.decorator';
import { RequirePermissions, CanAdmin } from '../../auth/decorators/permission.decorator';
import { UserInfo } from '../../auth/auth.service';
import { SearchService } from './search.service';
import { SearchQuery, SearchResponse } from '../../common/services/opensearch.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @RequirePermissions('query', 'search')
  @ApiOperation({ summary: 'Search documents, matters, and clients' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'type', required: false, enum: ['document', 'matter', 'client', 'all'], description: 'Type filter' })
  @ApiQuery({ name: 'sort', required: false, enum: ['relevance', 'date_desc', 'date_asc', 'title'], description: 'Sort order' })
  @ApiQuery({ name: 'date_range', required: false, enum: ['today', 'week', 'month', 'quarter', 'year', 'all'], description: 'Date range filter' })
  @ApiQuery({ name: 'confidential', required: false, enum: ['true', 'false', 'all'], description: 'Confidentiality filter' })
  @ApiQuery({ name: 'matter_id', required: false, description: 'Filter by matter ID' })
  @ApiQuery({ name: 'client_id', required: false, description: 'Filter by client ID' })
  @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page (default: 50)' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  async search(@CurrentUser() user: UserInfo, @Query() query: any): Promise<SearchResponse> {
    const searchQuery: SearchQuery = {
      q: query.q,
      type: query.type || 'all',
      sort: query.sort || 'relevance',
      date_range: query.date_range || 'all',
      confidential: query.confidential || 'all',
      matter_id: query.matter_id,
      client_id: query.client_id,
      tags: query.tags ? query.tags.split(',').map((tag: string) => tag.trim()) : undefined,
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 50,
    };

    return this.searchService.search(searchQuery, user.firm_id, user);
  }

  @Get('suggestions')
  @RequirePermissions('query', 'search')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Search prefix' })
  @ApiResponse({ status: 200, description: 'Search suggestions returned successfully' })
  async getSuggestions(@CurrentUser() user: UserInfo, @Query('q') prefix: string): Promise<string[]> {
    return this.searchService.getSuggestions(prefix, user.firm_id);
  }

  @Get('health')
  @ApiOperation({ summary: 'Check search service health' })
  @ApiResponse({ status: 200, description: 'Search service health status' })
  async healthCheck(): Promise<{ status: string; opensearch: boolean }> {
    const opensearchHealthy = await this.searchService.healthCheck();
    return {
      status: opensearchHealthy ? 'healthy' : 'unhealthy',
      opensearch: opensearchHealthy,
    };
  }

  @Get('reindex')
  @CanAdmin('search')
  @ApiOperation({ summary: 'Reindex all documents, matters, and clients' })
  @ApiResponse({ status: 200, description: 'Reindexing completed successfully' })
  async reindex(@CurrentUser() user: UserInfo): Promise<{ message: string; indexed: { documents: number; matters: number; clients: number } }> {

    await this.searchService.reindexAll();
    
    return {
      message: 'Reindexing completed successfully',
      indexed: {
        documents: 0, // This would be populated by the actual reindex counts
        matters: 0,
        clients: 0,
      }
    };
  }
}