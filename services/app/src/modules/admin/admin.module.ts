import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, Firm, Team, RetentionClass, Document, Matter, Client, AuditLog } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Firm, Team, RetentionClass, Document, Matter, Client, AuditLog]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}