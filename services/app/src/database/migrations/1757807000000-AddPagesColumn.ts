import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPagesColumn1757807000000 implements MigrationInterface {
  name = 'AddPagesColumn1757807000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add pages column to document_meta table
    await queryRunner.query(`
      ALTER TABLE "document_meta" 
      ADD COLUMN "pages" INTEGER
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop pages column from document_meta table
    await queryRunner.query(`
      ALTER TABLE "document_meta" 
      DROP COLUMN "pages"
    `);
  }
}