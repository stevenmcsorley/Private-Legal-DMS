import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsUUID, IsOptional, IsIn, IsBoolean } from 'class-validator';

export enum BulkOperationType {
  ENABLE_USERS = 'enable_users',
  DISABLE_USERS = 'disable_users',
  ADD_ROLE = 'add_role',
  REMOVE_ROLE = 'remove_role',
  ASSIGN_TEAM = 'assign_team',
  REMOVE_TEAM = 'remove_team',
  DELETE_USERS = 'delete_users',
}

export class BulkUserOperationDto {
  @ApiProperty({
    description: 'Type of bulk operation to perform',
    enum: BulkOperationType,
    example: BulkOperationType.ENABLE_USERS,
  })
  @IsString()
  @IsIn(Object.values(BulkOperationType))
  operation: BulkOperationType;

  @ApiProperty({
    description: 'Array of user IDs to perform operation on',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    isArray: true,
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  user_ids: string[];

  @ApiProperty({
    description: 'Role name for add_role/remove_role operations',
    example: 'legal_professional',
    required: false,
  })
  @IsOptional()
  @IsString()
  role_name?: string;

  @ApiProperty({
    description: 'Team ID for assign_team/remove_team operations',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  team_id?: string;

  @ApiProperty({
    description: 'Whether to confirm destructive operations',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  confirm_destructive?: boolean = false;

  @ApiProperty({
    description: 'Reason for the bulk operation (for audit trail)',
    example: 'Quarterly role review - removing inactive permissions',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}