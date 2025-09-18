import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentProcessingQueue } from './document-processing.queue';
import { DocumentProcessingProcessor } from '../processors/document-processing.processor';
import { Document, DocumentMeta } from '../entities';
import { TextExtractionService } from '../services/text-extraction.service';
import { SearchModule } from '../../modules/search/search.module';
import { MinioService } from '../services/minio.service';
import { MinioConfig } from '../../config/minio.config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'document-processing',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    TypeOrmModule.forFeature([Document, DocumentMeta]),
    SearchModule,
  ],
  providers: [
    DocumentProcessingQueue,
    DocumentProcessingProcessor,
    TextExtractionService,
    MinioService,
    MinioConfig,
  ],
  exports: [DocumentProcessingQueue],
})
export class QueueModule {}