import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateMatterTeamTable1757805000000 implements MigrationInterface {
  name = 'CreateMatterTeamTable1757805000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'matter_teams',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'matter_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['lead_lawyer', 'associate', 'paralegal', 'legal_assistant', 'observer'],
            default: "'observer'",
          },
          {
            name: 'access_level',
            type: 'enum',
            enum: ['full', 'read_write', 'read_only', 'limited'],
            default: "'read_only'",
          },
          {
            name: 'added_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'added_by',
            type: 'uuid',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['matter_id'],
            referencedTableName: 'matters',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['added_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
        indices: [
          {
            name: 'IDX_matter_teams_matter_id',
            columnNames: ['matter_id'],
          },
          {
            name: 'IDX_matter_teams_user_id',
            columnNames: ['user_id'],
          },
        ],
        uniques: [
          {
            name: 'UQ_matter_teams_matter_user',
            columnNames: ['matter_id', 'user_id'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('matter_teams');
  }
}