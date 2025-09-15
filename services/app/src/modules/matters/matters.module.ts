import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { MatterExportService } from './services/matter-export.service';
// import { MatterShareService } from './services/matter-share.service'; // Temporarily disabled
// import { MatterShareExpiryService } from './services/matter-share-expiry.service'; // Temporarily disabled
// import { MatterShareController } from './controllers/matter-share.controller'; // Temporarily disabled
import { Matter, Client, MatterShare, Firm, Document, MatterTeam, User } from '../../common/entities';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matter, Client, MatterShare, Firm, Document, MatterTeam, User]),
    DocumentsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [MattersController], // Removed MatterShareController
  providers: [MattersService, MatterExportService], // Added MatterExportService
  exports: [MattersService, MatterExportService], // Added MatterExportService
})
export class MattersModule {}