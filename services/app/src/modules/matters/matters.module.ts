import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MattersService } from './matters.service';
import { MattersController } from './matters.controller';
import { Matter, Client } from '../../common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Matter, Client])],
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}