#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SearchService } from '../modules/search/search.service';
import { DocumentsService } from '../modules/documents/documents.service';
import { MattersService } from '../modules/matters/matters.service';
import { ClientsService } from '../modules/clients/clients.service';

async function reindexSearch() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    const searchService = app.get(SearchService);
    
    console.log('🔍 Starting search reindexing...');
    
    // Reindex all documents, matters, and clients
    await Promise.all([
      searchService.reindexAllDocuments(),
      searchService.reindexAllMatters(), 
      searchService.reindexAllClients(),
    ]);
    
    console.log('✅ Search reindexing completed successfully!');
    
    // Check index status
    const isHealthy = await searchService.healthCheck();
    console.log(`🏥 Search service health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
    
  } catch (error) {
    console.error('❌ Error during reindexing:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

reindexSearch();