import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcknowledgeHoldDto {
  @ApiProperty({
    description: 'Method of acknowledgment',
    enum: ['email', 'portal', 'phone', 'in_person'],
    default: 'portal',
  })
  @IsString()
  @IsIn(['email', 'portal', 'phone', 'in_person'])
  acknowledgment_method: string = 'portal';

  @ApiProperty({
    description: 'Optional notes from custodian',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}