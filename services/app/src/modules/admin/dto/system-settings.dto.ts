import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min, Max, MaxLength } from 'class-validator';

export class SystemSettingsDto {
  @ApiProperty({
    description: 'Firm name',
    example: 'Smith & Associates Law Firm',
  })
  @IsString()
  @MaxLength(255)
  firm_name: string;

  @ApiProperty({
    description: 'Default retention period in years for new documents',
    example: 7,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  default_retention_years: number;

  @ApiProperty({
    description: 'Maximum upload file size in MB',
    example: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  max_file_size_mb: number;

  @ApiProperty({
    description: 'Whether to enable automatic document OCR processing',
    example: true,
  })
  @IsBoolean()
  enable_ocr: boolean;

  @ApiProperty({
    description: 'Whether to enable legal hold workflows',
    example: true,
  })
  @IsBoolean()
  enable_legal_holds: boolean;

  @ApiProperty({
    description: 'Whether to enable cross-firm sharing',
    example: true,
  })
  @IsBoolean()
  enable_cross_firm_sharing: boolean;

  @ApiProperty({
    description: 'Backup schedule configuration',
    example: { frequency: 'daily', retention_days: 30, enabled: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  backup_config?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    retention_days: number;
    enabled: boolean;
  };

  @ApiProperty({
    description: 'SMTP configuration for email notifications',
    example: { host: 'smtp.example.com', port: 587, secure: false, enabled: false },
    required: false,
  })
  @IsOptional()
  @IsObject()
  smtp_config?: {
    host: string;
    port: number;
    secure: boolean;
    enabled: boolean;
  };

  @ApiProperty({
    description: 'Watermark configuration for document downloads',
    example: { 
      enabled: true, 
      text: 'CONFIDENTIAL - {firm_name}', 
      opacity: 0.3, 
      fontSize: 48, 
      position: 'diagonal', 
      color: 'gray', 
      rotation: 45 
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  watermark_config?: {
    enabled: boolean;
    text: string;
    opacity: number;
    fontSize: number;
    position: string;
    color: string;
    rotation: number;
  };

  @ApiProperty({
    description: 'Security policy settings',
    example: { session_timeout_minutes: 60, require_mfa_for_admins: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  security_policy?: {
    session_timeout_minutes: number;
    require_mfa_for_admins: boolean;
    max_login_attempts: number;
    password_expiry_days: number;
  };
}