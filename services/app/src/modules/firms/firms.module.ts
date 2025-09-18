import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmsController } from './firms.controller';
import { FirmsService } from './firms.service';
import { Firm } from '../../common/entities/firm.entity';
import { User } from '../../common/entities/user.entity';
import { RetentionClass } from '../../common/entities/retention-class.entity';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Firm, User, RetentionClass]),
    AdminModule,
  ],
  controllers: [FirmsController],
  providers: [FirmsService],
  exports: [FirmsService],
})
export class FirmsModule {}