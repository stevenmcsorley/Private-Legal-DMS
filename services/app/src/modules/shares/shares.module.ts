import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharesController } from './shares.controller';
import { ShareDocumentsController } from './share-documents.controller';
import { SharesService } from './shares.service';
import { ShareDocumentsService } from './share-documents.service';
import { MatterShare } from '../../common/entities/matter-share.entity';
import { Document, Firm } from '../../common/entities';
import { DocumentsModule } from '../documents/documents.module';
import { MinioService } from '../../common/services/minio.service';
import { MinioConfig } from '../../config/minio.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatterShare, Document, Firm]),
    DocumentsModule,
  ],
  controllers: [SharesController, ShareDocumentsController],
  providers: [SharesService, ShareDocumentsService, MinioService, MinioConfig],
  exports: [SharesService, ShareDocumentsService],
})
export class SharesModule {}