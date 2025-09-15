import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, Matches } from 'class-validator';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiProperty({
    description: 'Team member user IDs',
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
    message: 'each value in member_ids must be a UUID'
  })
  member_ids?: string[];
}