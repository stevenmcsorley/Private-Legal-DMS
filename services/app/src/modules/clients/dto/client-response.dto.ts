import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class ClientResponseDto {
  @ApiProperty({ description: 'Client ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Client name' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Client contact email', required: false })
  @Expose()
  contact_email?: string;

  @ApiProperty({ description: 'Client contact phone', required: false })
  @Expose()
  contact_phone?: string;

  @ApiProperty({ description: 'Client address information', required: false })
  @Expose()
  address?: any;

  @ApiProperty({ description: 'Additional client metadata', required: false })
  @Expose()
  metadata?: any;

  @ApiProperty({ description: 'External reference', required: false })
  @Expose()
  external_ref?: string;

  @ApiProperty({ description: 'Firm ID' })
  @Expose()
  firm_id: string;

  @ApiProperty({ description: 'Creation date' })
  @Expose()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  @Type(() => Date)
  updated_at: Date;

  @ApiProperty({ description: 'Number of matters', required: false })
  @Expose()
  matter_count?: number;

  @ApiProperty({ description: 'Number of documents', required: false })
  @Expose()
  document_count?: number;

  @ApiProperty({ description: 'Last activity date', required: false })
  @Expose()
  @Type(() => Date)
  last_activity?: Date;

  // Exclude sensitive data
  @Exclude()
  firm: any;

  @Exclude()
  matters: any;

  @Exclude()
  documents: any;

  constructor(partial: Partial<ClientResponseDto>) {
    Object.assign(this, partial);
  }
}