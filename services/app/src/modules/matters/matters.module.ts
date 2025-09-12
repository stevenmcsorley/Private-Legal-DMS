import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { MatterShareService } from './services/matter-share.service';
import { MatterShareExpiryService } from './services/matter-share-expiry.service';
import { MatterShareController } from './controllers/matter-share.controller';
import { Matter, Client, MatterShare, Firm } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Matter, Client, MatterShare, Firm]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MattersController, MatterShareController],
  providers: [MattersService, MatterShareService, MatterShareExpiryService],
  exports: [MattersService, MatterShareService],
})
export class MattersModule {}