import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString, IsOptional, IsObject, Min, Max } from 'class-validator';

export class FirmSettingsDto {
  @ApiProperty({
    description: 'Document Management Settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  document_management?: {
    default_retention_years: number;
    auto_classification: boolean;
    ocr_enabled: boolean;
    virus_scanning: boolean;
  };

  @ApiProperty({
    description: 'Security and Access Settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  security?: {
    mfa_required: boolean;
    session_timeout_minutes: number;
    default_clearance_levels: Record<string, number>;
  };

  @ApiProperty({
    description: 'Branding Settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  branding?: {
    logo_url?: string;
    primary_color?: string;
    firm_letterhead?: string;
  };

  @ApiProperty({
    description: 'Feature Settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  features?: {
    client_portal_enabled: boolean;
    cross_firm_sharing: boolean;
    advanced_search: boolean;
  };

  @ApiProperty({
    description: 'Notification Settings',
    required: false,
  })
  @IsOptional()
  @IsObject()
  notifications?: {
    // TODO: Add email_notifications when email system is implemented
    slack_integration?: {
      webhook_url: string;
      enabled: boolean;
    };
    webhook_url?: string;
  };
}

// Default settings for new firms
export const DEFAULT_FIRM_SETTINGS: FirmSettingsDto = {
  document_management: {
    default_retention_years: 7,
    auto_classification: true,
    ocr_enabled: true,
    virus_scanning: true,
  },
  security: {
    mfa_required: false,
    session_timeout_minutes: 480, // 8 hours
    default_clearance_levels: {
      'super_admin': 10,
      'firm_admin': 8,
      'legal_manager': 7,
      'legal_professional': 5,
      'paralegal': 4,
      'support_staff': 3,
      'client_user': 2,
    },
  },
  branding: {},
  features: {
    client_portal_enabled: true,
    cross_firm_sharing: true,
    advanced_search: true,
  },
  notifications: {},
};