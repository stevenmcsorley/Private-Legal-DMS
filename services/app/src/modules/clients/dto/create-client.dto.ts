import { IsString, IsOptional, IsNotEmpty, Length, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'Client name',
    example: 'Acme Corporation',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({
    description: 'Client contact email address',
    example: 'contact@acme.com',
  })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({
    description: 'Client contact phone number',
    example: '+1-555-123-4567',
  })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({
    description: 'Client address information',
    example: { street: '123 Main St', city: 'City', state: 'State', zip: '12345' },
  })
  @IsOptional()
  address?: any;

  @ApiPropertyOptional({
    description: 'Additional client metadata',
    example: { client_type: 'corporation', status: 'active', notes: 'Important client' },
  })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({
    description: 'External reference or client ID',
    example: 'ACME-2025',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  external_ref?: string;
}