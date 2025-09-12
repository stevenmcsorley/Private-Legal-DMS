import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMatterShares1725672000000 implements MigrationInterface {
  name = 'CreateMatterShares1725672000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the matter_shares table
    await queryRunner.createTable(
      new Table({
        name: 'matter_shares',
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
            name: 'shared_by_firm_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'shared_with_firm_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'shared_by_user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['viewer', 'editor', 'collaborator', 'partner_lead'],
            default: "'viewer'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'accepted', 'declined', 'expired', 'revoked'],
            default: "'pending'",
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'accepted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'accepted_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'invitation_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'permissions',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'restrictions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create unique index for matter_id + shared_with_firm_id
    await queryRunner.createIndex(
      'matter_shares',
      new TableIndex({
        name: 'IDX_matter_shares_matter_firm_unique',
        columnNames: ['matter_id', 'shared_with_firm_id'],
        isUnique: true,
      }),
    );

    // Create index for matter_id + expires_at for expiry queries
    await queryRunner.createIndex(
      'matter_shares',
      new TableIndex({
        name: 'IDX_matter_shares_matter_expires',
        columnNames: ['matter_id', 'expires_at'],
      }),
    );

    // Create index for shared_with_firm_id + status
    await queryRunner.createIndex(
      'matter_shares',
      new TableIndex({
        name: 'IDX_matter_shares_firm_status',
        columnNames: ['shared_with_firm_id', 'status'],
      }),
    );

    // Add foreign key constraints
    await queryRunner.createForeignKey(
      'matter_shares',
      new TableForeignKey({
        name: 'FK_matter_shares_matter',
        columnNames: ['matter_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'matters',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matter_shares',
      new TableForeignKey({
        name: 'FK_matter_shares_shared_by_firm',
        columnNames: ['shared_by_firm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'firms',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matter_shares',
      new TableForeignKey({
        name: 'FK_matter_shares_shared_with_firm',
        columnNames: ['shared_with_firm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'firms',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matter_shares',
      new TableForeignKey({
        name: 'FK_matter_shares_shared_by_user',
        columnNames: ['shared_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'matter_shares',
      new TableForeignKey({
        name: 'FK_matter_shares_accepted_by_user',
        columnNames: ['accepted_by_user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );

    // Create trigger to automatically update updated_at
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_matter_shares_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER trigger_update_matter_shares_updated_at
        BEFORE UPDATE ON matter_shares
        FOR EACH ROW
        EXECUTE FUNCTION update_matter_shares_updated_at();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop trigger and function
    await queryRunner.query('DROP TRIGGER IF EXISTS trigger_update_matter_shares_updated_at ON matter_shares');
    await queryRunner.query('DROP FUNCTION IF EXISTS update_matter_shares_updated_at()');

    // Drop foreign key constraints
    await queryRunner.dropForeignKey('matter_shares', 'FK_matter_shares_accepted_by_user');
    await queryRunner.dropForeignKey('matter_shares', 'FK_matter_shares_shared_by_user');
    await queryRunner.dropForeignKey('matter_shares', 'FK_matter_shares_shared_with_firm');
    await queryRunner.dropForeignKey('matter_shares', 'FK_matter_shares_shared_by_firm');
    await queryRunner.dropForeignKey('matter_shares', 'FK_matter_shares_matter');

    // Drop indexes
    await queryRunner.dropIndex('matter_shares', 'IDX_matter_shares_firm_status');
    await queryRunner.dropIndex('matter_shares', 'IDX_matter_shares_matter_expires');
    await queryRunner.dropIndex('matter_shares', 'IDX_matter_shares_matter_firm_unique');

    // Drop the table
    await queryRunner.dropTable('matter_shares');
  }
}
