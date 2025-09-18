import { ApiProperty } from '@nestjs/swagger';

export class FirmStatsDto {
  @ApiProperty({
    description: 'Firm basic information',
  })
  firm: {
    id: string;
    name: string;
    created_at: Date;
    external_ref?: string;
  };

  @ApiProperty({
    description: 'User statistics',
  })
  users: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };

  @ApiProperty({
    description: 'Client statistics',
  })
  clients: {
    total: number;
    active: number;
  };

  @ApiProperty({
    description: 'Matter statistics',
  })
  matters: {
    total: number;
    by_status: Record<string, number>;
  };

  @ApiProperty({
    description: 'Document statistics',
  })
  documents: {
    total: number;
    total_size_gb: number;
    by_status: Record<string, number>;
  };

  @ApiProperty({
    description: 'Recent activity summary',
  })
  activity: {
    documents_uploaded_last_30_days: number;
    matters_created_last_30_days: number;
    users_created_last_30_days: number;
  };
}