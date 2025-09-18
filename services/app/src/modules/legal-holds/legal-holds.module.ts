import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LegalHoldsController } from './legal-holds.controller';
import { LegalHoldsService } from './legal-holds.service';
import { LegalHold } from '../../common/entities/legal-hold.entity';
import { LegalHoldCustodian } from '../../common/entities/legal-hold-custodian.entity';
import { Document } from '../../common/entities/document.entity';
import { Matter } from '../../common/entities/matter.entity';
import { User } from '../../common/entities/user.entity';
import { AuditModule } from '../audit/audit.module';
import { NotificationService } from '../../common/services/notification.service';
import { ComplianceTrackingService } from '../../common/services/compliance-tracking.service';
import { HoldEnforcementService } from '../../common/services/hold-enforcement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LegalHold, LegalHoldCustodian, Document, Matter, User]),
    ScheduleModule.forRoot(),
    AuditModule,
  ],
  controllers: [LegalHoldsController],
  providers: [LegalHoldsService, NotificationService, ComplianceTrackingService, HoldEnforcementService],
  exports: [LegalHoldsService],
})
export class LegalHoldsModule {}