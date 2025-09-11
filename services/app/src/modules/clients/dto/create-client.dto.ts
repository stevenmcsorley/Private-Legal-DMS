import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';
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
    description: 'External reference or client ID',
    example: 'ACME-2025',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  external_ref?: string;
}