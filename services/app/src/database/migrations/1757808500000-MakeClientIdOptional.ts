import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeClientIdOptional1757808500000 implements MigrationInterface {
  name = 'MakeClientIdOptional1757808500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make client_id nullable in matters table
    await queryRunner.query(`
      ALTER TABLE "matters" 
      ALTER COLUMN "client_id" DROP NOT NULL
    `);

    // Add a comment to explain the business logic
    await queryRunner.query(`
      COMMENT ON COLUMN "matters"."client_id" IS 
      'Optional client assignment - matters can be created without a client and assigned later'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: This migration may fail if there are matters with null client_id
    // In production, you'd want to handle this more carefully
    await queryRunner.query(`
      COMMENT ON COLUMN "matters"."client_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "matters" 
      ALTER COLUMN "client_id" SET NOT NULL
    `);
  }
}