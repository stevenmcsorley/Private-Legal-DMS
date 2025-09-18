import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';

export class CreateFirmDto {
  @ApiProperty({
    description: 'Firm name',
    example: 'Smith & Associates Law Firm',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'External reference or code',
    example: 'SA-LAW-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  external_ref?: string;

  @ApiProperty({
    description: 'Firm settings and configuration',
    example: {
      default_retention_years: 7,
      auto_classification: true,
      client_portal_enabled: true
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}