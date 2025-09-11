import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RetentionController } from './retention.controller';
import { DocumentRetentionService } from '../../common/services/document-retention.service';
import { MinioService } from '../../common/services/minio.service';
import { MinioConfig } from '../../config/minio.config';
import { Document, RetentionClass } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, RetentionClass]),
    ScheduleModule.forRoot(),
  ],
  controllers: [RetentionController],
  providers: [DocumentRetentionService, MinioService, MinioConfig],
  exports: [DocumentRetentionService],
})
export class RetentionModule {}