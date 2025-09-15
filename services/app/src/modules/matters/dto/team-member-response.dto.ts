import { ApiProperty } from '@nestjs/swagger';
import { MatterRole, AccessLevel } from '../../../common/entities';

export class TeamMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty({
    type: 'object',
    properties: {
      display_name: { type: 'string' },
      email: { type: 'string' },
    },
  })
  user: {
    display_name: string;
    email: string;
  };

  @ApiProperty({ enum: MatterRole })
  role: string;

  @ApiProperty({ enum: AccessLevel })
  access_level: string;

  @ApiProperty()
  added_at: string;

  constructor(matterTeam: any) {
    this.id = matterTeam.id;
    this.user_id = matterTeam.user_id;
    this.user = {
      display_name: matterTeam.user?.display_name || 'Unknown User',
      email: matterTeam.user?.email || '',
    };
    this.role = matterTeam.role;
    this.access_level = matterTeam.access_level;
    this.added_at = matterTeam.added_at?.toISOString() || new Date().toISOString();
  }
}