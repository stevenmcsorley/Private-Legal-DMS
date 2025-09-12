import { IsEnum, IsOptional, IsString, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ShareRole, ShareStatus } from '../../../common/entities';

export class UpdateMatterShareDto {
  @ApiProperty({
    description: 'Updated role for the partner firm',
    enum: ShareRole,
    required: false
  })
  @IsOptional()
  @IsEnum(ShareRole)
  role?: ShareRole;

  @ApiProperty({
    description: 'Updated status of the share',
    enum: ShareStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(ShareStatus)
  status?: ShareStatus;

  @ApiProperty({
    description: 'Updated expiration date (ISO date string)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiProperty({
    description: 'Updated invitation message',
    required: false
  })
  @IsOptional()
  @IsString()
  invitation_message?: string;

  @ApiProperty({
    description: 'Updated permissions',
    required: false
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
    description: 'Updated restrictions',
    required: false
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