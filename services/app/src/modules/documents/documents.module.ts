import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsExtractionController } from './documents-extraction.controller';
import { WatermarkService } from './services/watermark.service';
import { MinioService } from '../../common/services/minio.service';
import { MinioConfig } from '../../config/minio.config';
import { Document, DocumentMeta, Matter, Client, RetentionClass, AuditLog } from '../../common/entities';
import { AuditService } from '../../common/services/audit.service';
import { SearchModule } from '../search/search.module';
import { TextExtractionService } from '../../common/services/text-extraction.service';
import { QueueModule } from '../../common/queues/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentMeta, Matter, Client, RetentionClass, AuditLog]),
    SearchModule,
    QueueModule,
  ],
  controllers: [DocumentsController, DocumentsExtractionController],
  providers: [DocumentsService, WatermarkService, MinioService, MinioConfig, AuditService, TextExtractionService],
  exports: [DocumentsService, WatermarkService, MinioService],
})
export class DocumentsModule {}