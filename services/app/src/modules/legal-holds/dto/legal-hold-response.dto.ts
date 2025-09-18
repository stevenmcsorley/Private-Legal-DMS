import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { LegalHoldStatus, LegalHoldType } from '../../../common/entities/legal-hold.entity';

export class LegalHoldResponseDto {
  @ApiProperty({ description: 'Legal hold ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Legal hold name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Legal hold description' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Reason for the legal hold' })
  @Expose()
  reason: string;

  @ApiProperty({
    description: 'Type of legal hold',
    enum: ['litigation', 'investigation', 'audit', 'regulatory', 'other'],
  })
  @Expose()
  type: LegalHoldType;

  @ApiProperty({
    description: 'Current status of the legal hold',
    enum: ['active', 'released', 'expired'],
  })
  @Expose()
  status: LegalHoldStatus;

  @ApiPropertyOptional({ description: 'Associated matter ID' })
  @Expose()
  matter_id?: string;

  @ApiPropertyOptional({ description: 'Associated matter information' })
  @Expose()
  @Transform(({ obj }) => obj.matter ? {
    id: obj.matter.id,
    title: obj.matter.title,
    matter_number: obj.matter.matter_number,
    status: obj.matter.status,
  } : null)
  matter?: {
    id: string;
    title: string;
    matter_number: string;
    status: string;
  };

  @ApiProperty({ description: 'Firm ID' })
  @Expose()
  firm_id: string;

  @ApiPropertyOptional({ description: 'Firm information' })
  @Expose()
  @Transform(({ obj }) => obj.firm ? {
    id: obj.firm.id,
    name: obj.firm.name,
  } : null)
  firm?: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'User who created the hold' })
  @Expose()
  created_by: string;

  @ApiPropertyOptional({ description: 'Creator information' })
  @Expose()
  @Transform(({ obj }) => obj.created_by_user ? {
    id: obj.created_by_user.id,
    display_name: obj.created_by_user.display_name,
    email: obj.created_by_user.email,
  } : null)
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'User who released the hold' })
  @Expose()
  released_by?: string;

  @ApiPropertyOptional({ description: 'Release timestamp' })
  @Expose()
  released_at?: Date;

  @ApiPropertyOptional({ description: 'Reason for releasing the hold' })
  @Expose()
  release_reason?: string;

  @ApiPropertyOptional({ description: 'Expiry date for the hold' })
  @Expose()
  expiry_date?: Date;

  @ApiProperty({ description: 'Auto-apply to new documents' })
  @Expose()
  auto_apply_to_new_documents: boolean;

  @ApiPropertyOptional({ description: 'Instructions for custodians' })
  @Expose()
  custodian_instructions?: string;

  @ApiPropertyOptional({ description: 'Notification settings' })
  @Expose()
  notification_settings?: {
    email_custodians?: boolean;
    email_legal_team?: boolean;
    reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
    escalation_days?: number;
  };

  @ApiPropertyOptional({ description: 'Search criteria for automatic application' })
  @Expose()
  search_criteria?: {
    keywords?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    document_types?: string[];
    custodians?: string[];
    matters?: string[];
  };

  @ApiProperty({ description: 'Number of documents under this hold' })
  @Expose()
  documents_count: number;

  @ApiProperty({ description: 'Number of custodians notified' })
  @Expose()
  custodians_count: number;

  @ApiPropertyOptional({ description: 'Last notification sent timestamp' })
  @Expose()
  last_notification_sent?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updated_at: Date;

  @ApiPropertyOptional({ description: 'Documents under this hold' })
  @Expose()
  @Type(() => Object)
  @Transform(({ obj }) => obj.documents ? obj.documents.map((doc: any) => ({
    id: doc.id,
    filename: doc.filename,
    title: doc.title,
    created_at: doc.created_at,
    legal_hold_set_at: doc.legal_hold_set_at,
  })) : [])
  documents?: Array<{
    id: string;
    filename: string;
    title: string;
    created_at: Date;
    legal_hold_set_at: Date;
  }>;
}