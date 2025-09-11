import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { MatterStatus } from '../../../common/entities';

export class MatterResponseDto {
  @ApiProperty({ description: 'Matter ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Matter title' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Matter description', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Matter status', enum: MatterStatus })
  @Expose()
  status: MatterStatus;

  @ApiProperty({ description: 'Security classification level' })
  @Expose()
  security_class: number;

  @ApiProperty({ description: 'Firm ID' })
  @Expose()
  firm_id: string;

  @ApiProperty({ description: 'Client ID' })
  @Expose()
  client_id: string;

  @ApiProperty({ description: 'Created by user ID' })
  @Expose()
  created_by: string;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  // Include related entities when loaded
  @ApiProperty({ description: 'Client information', required: false })
  @Expose()
  client?: {
    id: string;
    name: string;
    external_ref?: string;
  };

  @ApiProperty({ description: 'Created by user information', required: false })
  @Expose()
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };

  @ApiProperty({ description: 'Number of documents', required: false })
  @Expose()
  documents_count?: number;

  // Exclude sensitive data
  @Exclude()
  firm: any;

  constructor(partial: Partial<MatterResponseDto>) {
    Object.assign(this, partial);
  }
}