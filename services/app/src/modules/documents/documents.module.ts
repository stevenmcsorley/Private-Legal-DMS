import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { MinioService } from '../../common/services/minio.service';
import { MinioConfig } from '../../config/minio.config';
import { Document, DocumentMeta, Matter, Client, RetentionClass, AuditLog } from '../../common/entities';
import { AuditService } from '../../common/services/audit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentMeta, Matter, Client, RetentionClass, AuditLog])],
  controllers: [DocumentsController],
  providers: [DocumentsService, MinioService, MinioConfig, AuditService],
  exports: [DocumentsService, MinioService],
})
export class DocumentsModule {}