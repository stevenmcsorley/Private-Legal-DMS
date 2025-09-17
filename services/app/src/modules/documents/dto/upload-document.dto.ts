import { IsString, IsOptional, IsUUID, IsInt, Min, Max, IsBoolean, IsDateString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Matter ID this document belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: 'matter_id must be a UUID' })
  matter_id: string;

  @ApiPropertyOptional({
    description: 'Document title (if not provided, will use filename)',
    example: 'Contract Amendment - Final Draft',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Final draft of the contract amendment with updated terms',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Document type',
    example: 'contract',
  })
  @IsOptional()
  @IsString()
  document_type?: string;

  @ApiPropertyOptional({
    description: 'Document tags',
    example: ['contract', 'amendment', 'final'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Parties involved in the document',
    example: ['Acme Corporation', 'Legal Firm LLC'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  parties?: string[];

  @ApiPropertyOptional({
    description: 'Jurisdiction',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'Document date',
    example: '2025-09-11',
  })
  @IsOptional()
  @IsDateString()
  document_date?: string;

  @ApiPropertyOptional({
    description: 'Effective date',
    example: '2025-10-01',
  })
  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2026-10-01',
  })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiPropertyOptional({
    description: 'Whether document is confidential',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  confidential?: boolean;

  @ApiPropertyOptional({
    description: 'Whether document is privileged',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  privileged?: boolean;

  @ApiPropertyOptional({
    description: 'Whether document is work product',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  work_product?: boolean;

  @ApiPropertyOptional({
    description: 'Retention class ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: 'retention_class_id must be a UUID' })
  retention_class_id?: string;

  @ApiPropertyOptional({
    description: 'Custom fields as key-value pairs',
    example: { category: 'legal', priority: 'high' },
  })
  @IsOptional()
  custom_fields?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Type of user who uploaded the document',
    enum: ['client', 'legal_staff'],
    default: 'legal_staff',
  })
  @IsOptional()
  @IsString()
  uploaded_by_type?: 'client' | 'legal_staff';

  @ApiPropertyOptional({
    description: 'User ID who uploaded the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: 'uploaded_by_user_id must be a UUID' })
  uploaded_by_user_id?: string;
}
