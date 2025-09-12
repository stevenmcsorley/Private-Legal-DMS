import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { Matter, Client, Document, User } from '../../common/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Matter, Client, Document, User])],
  controllers: [DashboardController],
})
export class DashboardModule {}