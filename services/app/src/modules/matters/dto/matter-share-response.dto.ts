import { ApiProperty } from '@nestjs/swagger';
import { ShareRole, ShareStatus } from '../../../common/entities';

export class MatterShareResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  matter_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  shared_by_firm_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  shared_with_firm_id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174004' })
  shared_by_user_id: string;

  @ApiProperty({ enum: ShareRole, example: ShareRole.VIEWER })
  role: ShareRole;

  @ApiProperty({ enum: ShareStatus, example: ShareStatus.PENDING })
  status: ShareStatus;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z', nullable: true })
  expires_at: Date | null;

  @ApiProperty({ example: '2024-09-12T10:30:00.000Z', nullable: true })
  accepted_at: Date | null;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174005', nullable: true })
  accepted_by_user_id: string | null;

  @ApiProperty({ 
    example: 'We would like to collaborate on this matter',
    nullable: true 
  })
  invitation_message: string | null;

  @ApiProperty({
    example: {
      can_download: true,
      can_upload: false,
      can_comment: true,
      watermark_required: true
    }
  })
  permissions: {
    can_download?: boolean;
    can_upload?: boolean;
    can_comment?: boolean;
    can_view_audit?: boolean;
    watermark_required?: boolean;
    [key: string]: any;
  };

  @ApiProperty({
    example: {
      allowed_document_types: ['pdf', 'docx'],
      max_download_count: 10
    },
    nullable: true
  })
  restrictions: {
    allowed_document_types?: string[];
    max_download_count?: number;
    ip_whitelist?: string[];
    time_restrictions?: {
      start_time?: string;
      end_time?: string;
      timezone?: string;
    };
    [key: string]: any;
  } | null;

  @ApiProperty({ example: '2024-09-12T08:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-09-12T08:00:00.000Z' })
  updated_at: Date;

  @ApiProperty({ example: false })
  is_expired: boolean;

  @ApiProperty({ example: false })
  is_active: boolean;

  // Optional related entities
  @ApiProperty({ required: false })
  matter?: {
    id: string;
    title: string;
    status: string;
  };

  @ApiProperty({ required: false })
  shared_by_firm?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  shared_with_firm?: {
    id: string;
    name: string;
  };

  @ApiProperty({ required: false })
  shared_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };
}