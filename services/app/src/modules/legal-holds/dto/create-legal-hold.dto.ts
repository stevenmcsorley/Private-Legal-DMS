import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsDateString,
  IsArray,
  IsObject,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LegalHoldType } from '../../../common/entities/legal-hold.entity';

class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Email custodians when hold is created/updated' })
  @IsOptional()
  @IsBoolean()
  email_custodians?: boolean;

  @ApiPropertyOptional({ description: 'Email legal team when hold is created/updated' })
  @IsOptional()
  @IsBoolean()
  email_legal_team?: boolean;

  @ApiPropertyOptional({
    description: 'Frequency of reminder notifications',
    enum: ['weekly', 'monthly', 'quarterly'],
  })
  @IsOptional()
  @IsEnum(['weekly', 'monthly', 'quarterly'])
  reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';

  @ApiPropertyOptional({
    description: 'Number of days before escalating compliance issues',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  escalation_days?: number;
}

class SearchCriteriaDto {
  @ApiPropertyOptional({
    description: 'Keywords to search for in documents',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'Date range for document creation/modification',
    type: 'object',
    properties: {
      start: { type: 'string', format: 'date' },
      end: { type: 'string', format: 'date' },
    },
  })
  @IsOptional()
  @IsObject()
  date_range?: {
    start?: string;
    end?: string;
  };

  @ApiPropertyOptional({
    description: 'Document types to include in hold',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  document_types?: string[];

  @ApiPropertyOptional({
    description: 'Custodian names or IDs',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  custodians?: string[];

  @ApiPropertyOptional({
    description: 'Matter IDs to include in hold',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  matters?: string[];
}

export class CreateLegalHoldDto {
  @ApiProperty({
    description: 'Name of the legal hold',
    example: 'Smith v. Corporation - Document Preservation',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Detailed description of the legal hold',
    example: 'Preserve all documents related to the Smith litigation matter including emails, contracts, and financial records from 2023-2024.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Reason for placing the legal hold',
    example: 'Anticipated litigation regarding product liability claims filed by John Smith.',
  })
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Type of legal hold',
    enum: ['litigation', 'investigation', 'audit', 'regulatory', 'other'],
    example: 'litigation',
  })
  @IsEnum(['litigation', 'investigation', 'audit', 'regulatory', 'other'])
  type: LegalHoldType;

  @ApiPropertyOptional({
    description: 'Specific matter ID this hold relates to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  matter_id?: string;

  @ApiPropertyOptional({
    description: 'Expiry date for the legal hold (if applicable)',
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiPropertyOptional({
    description: 'Whether to automatically apply this hold to new documents matching criteria',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_apply_to_new_documents?: boolean;

  @ApiPropertyOptional({
    description: 'Instructions for custodians regarding this hold',
    example: 'Preserve all emails, documents, and electronic files related to Product X. Do not delete any files from 2023-2024.',
  })
  @IsOptional()
  @IsString()
  custodian_instructions?: string;

  @ApiPropertyOptional({
    description: 'Notification settings for this legal hold',
    type: NotificationSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notification_settings?: NotificationSettingsDto;

  @ApiPropertyOptional({
    description: 'Search criteria for automatically applying the hold',
    type: SearchCriteriaDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SearchCriteriaDto)
  search_criteria?: SearchCriteriaDto;
}