import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, MinLength, MaxLength, Min, Max } from 'class-validator';

export class CreateRetentionClassDto {
  @ApiProperty({
    description: 'Retention class name',
    example: 'Corporate Documents - 7 Years',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Retention class description',
    example: 'Standard retention for corporate legal documents',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Retention period in years',
    example: 7,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  retention_years: number;

  @ApiProperty({
    description: 'Whether legal hold can override this retention class',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  legal_hold_override?: boolean = false;

  @ApiProperty({
    description: 'Whether documents should be automatically deleted when retention period expires',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  auto_delete?: boolean = false;

  @ApiProperty({
    description: 'MinIO policy configuration for this retention class',
    example: {
      lifecycle: {
        expiration_days: 2555, // 7 years
        transition_rules: []
      }
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  minio_policy?: Record<string, any>;
}