import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsObject, IsArray, MinLength, MaxLength } from 'class-validator';

export class FirmOnboardingDto {
  // Firm Information
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

  // Admin User Information
  @ApiProperty({
    description: 'Admin user email address',
    example: 'admin@smithlaw.com',
  })
  @IsEmail()
  admin_email: string;

  @ApiProperty({
    description: 'Admin user display name',
    example: 'John Smith',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  admin_display_name: string;

  @ApiProperty({
    description: 'Admin user first name',
    example: 'John',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  admin_first_name: string;

  @ApiProperty({
    description: 'Admin user last name',
    example: 'Smith',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  admin_last_name: string;

  @ApiProperty({
    description: 'Admin user job title',
    example: 'Managing Partner',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  admin_job_title?: string;

  // Initial Settings
  @ApiProperty({
    description: 'Initial firm settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Initial retention classes to create',
    required: false,
  })
  @IsOptional()
  @IsArray()
  initial_retention_classes?: string[];
}

export class FirmOnboardingResultDto {
  @ApiProperty({
    description: 'Created firm information',
  })
  firm: {
    id: string;
    name: string;
    external_ref?: string;
    settings: Record<string, any>;
  };

  @ApiProperty({
    description: 'Created admin user information',
  })
  admin_user: {
    id: string;
    email: string;
    display_name: string;
    keycloak_id?: string;
  };

  @ApiProperty({
    description: 'Setup status and next steps',
  })
  setup_status: {
    firm_created: boolean;
    admin_created: boolean;
    retention_classes_created: boolean;
    keycloak_sync: boolean;
    // TODO: Add email_sent when email system is implemented
    next_steps: string[];
  };
}