import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController, AuditController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditService } from '../../common/services/audit.service';
import { User, Firm, Team, RetentionClass, Document, Matter, Client, AuditLog, SystemSettings } from '../../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Firm, Team, RetentionClass, Document, Matter, Client, AuditLog, SystemSettings]),
  ],
  controllers: [AdminController, AuditController],
  providers: [AdminService, AuditService],
  exports: [AdminService, AuditService],
})
export class AdminModule {}