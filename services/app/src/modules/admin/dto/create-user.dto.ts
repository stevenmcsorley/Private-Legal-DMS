import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsArray, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  display_name: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  last_name: string;

  @ApiProperty({
    description: 'Firm ID the user belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  firm_id: string;

  @ApiProperty({
    description: 'User roles',
    example: ['legal_professional'],
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @ApiProperty({
    description: 'Client IDs the user has access to (for client users)',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  client_ids?: string[];

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Associate',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @ApiProperty({
    description: 'Department',
    example: 'Corporate Law',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1-555-123-4567',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  is_active?: boolean = true;
}