import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientUploadFields1757806000000 implements MigrationInterface {
  name = 'AddClientUploadFields1757806000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add uploaded_by_type column with default 'legal_staff'
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD COLUMN "uploaded_by_type" VARCHAR(20) NOT NULL DEFAULT 'legal_staff'
    `);

    // Add uploaded_by_user_id column (nullable)
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD COLUMN "uploaded_by_user_id" UUID
    `);

    // Add constraint to ensure uploaded_by_type is either 'client' or 'legal_staff'
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD CONSTRAINT "CHK_uploaded_by_type" 
      CHECK ("uploaded_by_type" IN ('client', 'legal_staff'))
    `);

    // Add foreign key constraint for uploaded_by_user_id
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD CONSTRAINT "FK_documents_uploaded_by_user" 
      FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    // Update existing records to have uploaded_by_user_id = created_by for legal staff uploads
    await queryRunner.query(`
      UPDATE "documents" 
      SET "uploaded_by_user_id" = "created_by" 
      WHERE "uploaded_by_type" = 'legal_staff'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "documents" 
      DROP CONSTRAINT "FK_documents_uploaded_by_user"
    `);

    // Drop check constraint
    await queryRunner.query(`
      ALTER TABLE "documents" 
      DROP CONSTRAINT "CHK_uploaded_by_type"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "documents" 
      DROP COLUMN "uploaded_by_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "documents" 
      DROP COLUMN "uploaded_by_type"
    `);
  }
}