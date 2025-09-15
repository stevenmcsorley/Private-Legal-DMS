import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatterRole, AccessLevel } from '../../../common/entities';

export class AddTeamMemberDto {
  @ApiProperty({
    description: 'User ID to add to the matter team',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Role of the team member on this matter',
    enum: MatterRole,
    example: MatterRole.ASSOCIATE,
  })
  @IsEnum(MatterRole)
  role: MatterRole;

  @ApiProperty({
    description: 'Access level for the team member',
    enum: AccessLevel,
    example: AccessLevel.READ_WRITE,
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  access_level?: AccessLevel;
}