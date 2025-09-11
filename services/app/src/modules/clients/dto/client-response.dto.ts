import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

export class ClientResponseDto {
  @ApiProperty({ description: 'Client ID' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Client name' })
  @Expose()
  name: string;

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
  matters_count?: number;

  // Exclude sensitive data
  @Exclude()
  firm: any;

  constructor(partial: Partial<ClientResponseDto>) {
    Object.assign(this, partial);
  }
}