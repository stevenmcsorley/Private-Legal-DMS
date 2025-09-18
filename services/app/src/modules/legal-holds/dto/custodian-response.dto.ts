import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CustodianStatus } from '../../../common/entities/legal-hold-custodian.entity';

class CustodianUserDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  display_name: string;

  @ApiProperty()
  @Expose()
  roles: string[];
}

export class CustodianResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  legal_hold_id: string;

  @ApiProperty()
  @Expose()
  custodian_id: string;

  @ApiProperty({ enum: CustodianStatus })
  @Expose()
  status: CustodianStatus;

  @ApiProperty({ required: false })
  @Expose()
  notice_sent_at?: Date;

  @ApiProperty({ required: false })
  @Expose()
  acknowledged_at?: Date;

  @ApiProperty({ required: false })
  @Expose()
  compliance_checked_at?: Date;

  @ApiProperty({ required: false })
  @Expose()
  released_at?: Date;

  @ApiProperty({ required: false })
  @Expose()
  acknowledgment_method?: string;

  @ApiProperty({ required: false })
  @Expose()
  non_compliance_reason?: string;

  @ApiProperty({ required: false })
  @Expose()
  custodian_metadata?: Record<string, any>;

  @ApiProperty({ required: false })
  @Expose()
  assigned_by?: string;

  @ApiProperty()
  @Expose()
  created_at: Date;

  @ApiProperty()
  @Expose()
  updated_at: Date;

  @ApiProperty({ type: CustodianUserDto })
  @Expose()
  @Type(() => CustodianUserDto)
  custodian: CustodianUserDto;
}