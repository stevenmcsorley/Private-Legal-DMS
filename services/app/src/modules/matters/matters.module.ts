import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
// import { MatterShareService } from './services/matter-share.service'; // Temporarily disabled
// import { MatterShareExpiryService } from './services/matter-share-expiry.service'; // Temporarily disabled
// import { MatterShareController } from './controllers/matter-share.controller'; // Temporarily disabled
import { Matter, Client, MatterShare, Firm } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matter, Client, MatterShare, Firm]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MattersController], // Removed MatterShareController
  providers: [MattersService], // Removed MatterShareService and MatterShareExpiryService
  exports: [MattersService], // Removed MatterShareService
})
export class MattersModule {}