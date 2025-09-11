import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class DocumentResponseDto {
  @ApiProperty({ description: 'Document ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Document title' })
  @Expose()
  title?: string;

  @ApiProperty({ description: 'Document description' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Original filename' })
  @Expose()
  original_filename: string;

  @ApiProperty({ description: 'MIME type' })
  @Expose()
  mime_type: string;

  @ApiProperty({ description: 'File size in bytes' })
  @Expose()
  size_bytes: number;

  @ApiProperty({ description: 'Document version' })
  @Expose()
  version: number;

  @ApiProperty({ description: 'SHA256 hash of content' })
  @Expose()
  content_sha256: string;

  @ApiProperty({ description: 'Matter ID' })
  @Expose()
  matter_id: string;

  @ApiProperty({ description: 'Firm ID' })
  @Expose()
  firm_id: string;

  @ApiProperty({ description: 'Client ID' })
  @Expose()
  client_id: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Expose()
  created_by: string;

  @ApiProperty({ description: 'Legal hold status' })
  @Expose()
  legal_hold: boolean;

  @ApiProperty({ description: 'Legal hold reason', required: false })
  @Expose()
  legal_hold_reason?: string;

  @ApiProperty({ description: 'Is document deleted' })
  @Expose()
  is_deleted: boolean;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  @ApiProperty({ description: 'Document metadata', required: false })
  @Expose()
  metadata?: {
    document_type?: string;
    tags?: string[];
    parties?: string[];
    jurisdiction?: string;
    document_date?: Date;
    effective_date?: Date;
    expiry_date?: Date;
    confidential?: boolean;
    privileged?: boolean;
    work_product?: boolean;
    custom_fields?: Record<string, any>;
  };

  @ApiProperty({ description: 'Matter information', required: false })
  @Expose()
  matter?: {
    id: string;
    title: string;
    status: string;
  };

  @ApiProperty({ description: 'Client information', required: false })
  @Expose()
  client?: {
    id: string;
    name: string;
  };

  @ApiProperty({ description: 'Created by user information', required: false })
  @Expose()
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };

  @ApiProperty({ description: 'Retention class information', required: false })
  @Expose()
  retention_class?: {
    id: string;
    name: string;
    retention_years: number;
  };

  @ApiProperty({ description: 'Download URL (if accessible)', required: false })
  @Expose()
  download_url?: string;

  @ApiProperty({ description: 'Preview URL (if available)', required: false })
  @Expose()
  preview_url?: string;

  // Exclude internal data
  @Exclude()
  object_key: string;

  @Exclude()
  firm: any;

  constructor(partial: Partial<DocumentResponseDto>) {
    Object.assign(this, partial);
  }
}