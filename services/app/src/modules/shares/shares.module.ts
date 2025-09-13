import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { MatterShare } from '../../common/entities/matter-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatterShare])],
  controllers: [SharesController],
  providers: [SharesService],
  exports: [SharesService],
})
export class SharesModule {}