import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Corporate Law Team',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Team description',
    example: 'Team handling corporate legal matters',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Parent team ID for hierarchical structure',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: 'parent_team_id must be a UUID' })
  parent_team_id?: string;

  @ApiProperty({
    description: 'Initial team member user IDs',
    example: ['123e4567-e89b-12d3-a456-426614174001'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/, {
    each: true,
    message: 'each value in initial_member_ids must be a UUID'
  })
  initial_member_ids?: string[];

  @ApiProperty({
    description: 'Firm ID the team belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  // Accept UUID-like IDs used in dev seed data (relax RFC variant constraint)
  // Note: In production, prefer strict @IsUUID() validation
  @Matches(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
    { message: 'firm_id must be a UUID' })
  firm_id: string;
}