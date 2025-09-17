import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { OpenSearchService } from '../../common/services/opensearch.service';
import { AuditService } from '../../common/services/audit.service';
import { Document, Matter, Client, AuditLog } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Matter, Client, AuditLog]),
  ],
  controllers: [SearchController],
  providers: [SearchService, OpenSearchService, AuditService],
  exports: [SearchService, OpenSearchService],
})
export class SearchModule {}