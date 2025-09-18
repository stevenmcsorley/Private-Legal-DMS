import { IsArray, IsUUID, ArrayNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCustodiansDto {
  @ApiProperty({
    description: 'Array of user IDs to assign as custodians',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  custodian_ids: string[];

  @ApiProperty({
    description: 'Optional instructions for custodians',
    required: false,
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    description: 'Send notification email to custodians',
    default: true,
    required: false,
  })
  @IsOptional()
  send_notification?: boolean = true;
}