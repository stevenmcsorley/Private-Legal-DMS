import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingColumns1726164000000 implements MigrationInterface {
  name = 'AddMissingColumns1726164000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing columns that were added manually during development
    
    // Add auto_delete column to retention_classes table
    await queryRunner.query(`
      ALTER TABLE "retention_classes" 
      ADD COLUMN IF NOT EXISTS "auto_delete" BOOLEAN DEFAULT false
    `);

    // Add is_deleted column to documents table (if not exists)
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false
    `);

    // Add missing audit columns
    await queryRunner.query(`
      ALTER TABLE "audits" 
      ADD COLUMN IF NOT EXISTS "details" jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE "audits" 
      ADD COLUMN IF NOT EXISTS "risk_level" varchar(20) DEFAULT 'low'
    `);

    await queryRunner.query(`
      ALTER TABLE "audits" 
      ADD COLUMN IF NOT EXISTS "outcome" varchar(20) DEFAULT 'success'
    `);

    await queryRunner.query(`
      ALTER TABLE "audits" 
      ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);

    // Add search_vector column to document_meta table  
    await queryRunner.query(`
      ALTER TABLE "document_meta" 
      ADD COLUMN IF NOT EXISTS "search_vector" tsvector
    `);

    // Create index on search_vector for full-text search performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_document_meta_search_vector" 
      ON "document_meta" USING GIN ("search_vector")
    `);

    // Update search_vector for existing records
    await queryRunner.query(`
      UPDATE "document_meta" 
      SET "search_vector" = to_tsvector('english', 
        COALESCE(title, '') || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(array_to_string(tags, ' '), '') || ' ' ||
        COALESCE(extracted_text, '')
      )
      WHERE "search_vector" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_document_meta_search_vector"`);
    await queryRunner.query(`ALTER TABLE "document_meta" DROP COLUMN IF EXISTS "search_vector"`);
    await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN IF EXISTS "timestamp"`);
    await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN IF EXISTS "outcome"`);
    await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN IF EXISTS "risk_level"`);
    await queryRunner.query(`ALTER TABLE "audits" DROP COLUMN IF EXISTS "details"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "is_deleted"`);
    await queryRunner.query(`ALTER TABLE "retention_classes" DROP COLUMN IF EXISTS "auto_delete"`);
  }
}