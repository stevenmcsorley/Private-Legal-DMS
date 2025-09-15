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
    description: 'Firm ID the user belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
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
    description: 'Additional user attributes (first_name, last_name, job_title, etc.)',
    example: { first_name: 'John', last_name: 'Doe', job_title: 'Senior Associate' },
    required: false,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiProperty({
    description: 'Whether user account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  is_active?: boolean = true;
}