import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateLegalHoldSystem1757809000000 implements MigrationInterface {
  name = 'CreateLegalHoldSystem1757809000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create legal_holds table
    await queryRunner.createTable(
      new Table({
        name: 'legal_holds',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['litigation', 'investigation', 'audit', 'regulatory', 'other'],
            default: "'litigation'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'released', 'expired'],
            default: "'active'",
          },
          {
            name: 'firm_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'matter_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'released_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'released_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'release_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'expiry_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'auto_apply_to_new_documents',
            type: 'boolean',
            default: true,
          },
          {
            name: 'custodian_instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notification_settings',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'search_criteria',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'documents_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'custodians_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_notification_sent',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['firm_id'],
            referencedTableName: 'firms',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['matter_id'],
            referencedTableName: 'matters',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
          {
            columnNames: ['created_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
          {
            columnNames: ['released_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        indices: [
          {
            name: 'IDX_legal_holds_firm_id',
            columnNames: ['firm_id'],
          },
          {
            name: 'IDX_legal_holds_matter_id',
            columnNames: ['matter_id'],
          },
          {
            name: 'IDX_legal_holds_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_legal_holds_created_at',
            columnNames: ['created_at'],
          },
        ],
      }),
    );

    // Create legal_hold_custodians table
    await queryRunner.createTable(
      new Table({
        name: 'legal_hold_custodians',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'legal_hold_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'custodian_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'acknowledged', 'compliant', 'non_compliant', 'released'],
            default: "'pending'",
          },
          {
            name: 'notice_sent_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'acknowledged_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'compliance_checked_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'released_at',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'acknowledgment_method',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'non_compliance_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'custodian_metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'assigned_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['legal_hold_id'],
            referencedTableName: 'legal_holds',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['custodian_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['assigned_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
        indices: [
          {
            name: 'IDX_legal_hold_custodians_legal_hold_id',
            columnNames: ['legal_hold_id'],
          },
          {
            name: 'IDX_legal_hold_custodians_custodian_id',
            columnNames: ['custodian_id'],
          },
          {
            name: 'IDX_legal_hold_custodians_status',
            columnNames: ['status'],
          },
          {
            name: 'IDX_legal_hold_custodians_unique',
            columnNames: ['legal_hold_id', 'custodian_id'],
            isUnique: true,
          },
        ],
      }),
    );

    // Add legal hold columns to documents table
    await queryRunner.query(`
      ALTER TABLE documents 
      ADD COLUMN legal_hold_ref uuid,
      ADD CONSTRAINT FK_documents_legal_hold_ref 
      FOREIGN KEY (legal_hold_ref) REFERENCES legal_holds(id) 
      ON DELETE SET NULL
    `);

    // Create index on legal_hold_ref
    await queryRunner.createIndex('documents', new TableIndex({
      name: 'IDX_documents_legal_hold_ref',
      columnNames: ['legal_hold_ref'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop legal hold reference from documents
    await queryRunner.dropIndex('documents', 'IDX_documents_legal_hold_ref');
    await queryRunner.query(`
      ALTER TABLE documents 
      DROP CONSTRAINT FK_documents_legal_hold_ref,
      DROP COLUMN legal_hold_ref
    `);

    // Drop legal_hold_custodians table
    await queryRunner.dropTable('legal_hold_custodians');

    // Drop legal_holds table
    await queryRunner.dropTable('legal_holds');
  }
}