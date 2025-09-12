import { IsUUID, IsEnum, IsOptional, IsString, IsObject, IsBoolean, IsDateString, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ShareRole } from '../../../common/entities';

export class CreateMatterShareDto {
  @ApiProperty({
    description: 'ID of the matter to share',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  matter_id: string;

  @ApiProperty({
    description: 'ID of the firm to share with',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  shared_with_firm_id: string;

  @ApiProperty({
    description: 'Role to assign to the partner firm',
    enum: ShareRole,
    example: ShareRole.VIEWER
  })
  @IsEnum(ShareRole)
  role: ShareRole;

  @ApiProperty({
    description: 'When the share expires (ISO date string)',
    example: '2024-12-31T23:59:59.999Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({
    description: 'Optional invitation message',
    example: 'We would like to collaborate on this matter',
    required: false
  })
  @IsOptional()
  @IsString()
  invitation_message?: string;

  @ApiProperty({
    description: 'Permissions for the shared access',
    required: false,
    example: {
      can_download: true,
      can_upload: false,
      can_comment: true,
      watermark_required: true
    }
  })
  @IsOptional()
  @IsObject()
  permissions?: {
    can_download?: boolean;
    can_upload?: boolean;
    can_comment?: boolean;
    can_view_audit?: boolean;
    watermark_required?: boolean;
  };

  @ApiProperty({
    description: 'Restrictions on the shared access',
    required: false,
    example: {
      allowed_document_types: ['pdf', 'docx'],
      max_download_count: 10,
      ip_whitelist: ['192.168.1.0/24']
    }
  })
  @IsOptional()
  @IsObject()
  restrictions?: {
    allowed_document_types?: string[];
    max_download_count?: number;
    ip_whitelist?: string[];
    time_restrictions?: {
      start_time?: string;
      end_time?: string;
      timezone?: string;
    };
  };
}