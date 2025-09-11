import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';
import { DocumentsModule } from '../documents/documents.module';
import { MattersModule } from '../matters/matters.module';
import { Client, Matter, Document } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Matter, Document]),
    DocumentsModule,
    MattersModule,
  ],
  controllers: [ClientPortalController],
  providers: [ClientPortalService],
  exports: [ClientPortalService],
})
export class ClientPortalModule {}