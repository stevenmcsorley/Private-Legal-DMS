import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsUUID } from 'class-validator';
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
  @IsUUID(undefined, { each: true })
  member_ids?: string[];
}