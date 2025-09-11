import { IsString, IsOptional, IsNotEmpty, Length, IsEnum, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatterStatus } from '../../../common/entities';

export class CreateMatterDto {
  @ApiProperty({
    description: 'Client ID this matter belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({
    description: 'Matter title',
    example: 'Contract Negotiation - Q4 2025',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  title: string;

  @ApiPropertyOptional({
    description: 'Matter description',
    example: 'Annual service contract negotiation with key client',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Matter status',
    enum: MatterStatus,
    default: MatterStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(MatterStatus)
  status?: MatterStatus;

  @ApiPropertyOptional({
    description: 'Security classification level (1-5)',
    example: 2,
    minimum: 1,
    maximum: 5,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  security_class?: number;
}