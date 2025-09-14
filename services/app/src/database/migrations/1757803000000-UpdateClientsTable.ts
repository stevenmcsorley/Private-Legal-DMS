import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateClientsTable1757803000000 implements MigrationInterface {
  name = 'UpdateClientsTable1757803000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to clients table to match frontend requirements
    
    // Add email column (required)
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "email" varchar(255) NOT NULL DEFAULT ''
    `);

    // Add phone column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "phone" varchar(50)
    `);

    // Add address column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "address" text
    `);

    // Add contact_person column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "contact_person" varchar(255)
    `);

    // Add client_type column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "client_type" varchar(20) NOT NULL DEFAULT 'individual'
    `);

    // Add status column  
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'active'
    `);

    // Add notes column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "notes" text
    `);

    // Add tax_id column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "tax_id" varchar(50)
    `);

    // Add billing_address column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "billing_address" text
    `);

    // Add preferred_communication column
    await queryRunner.query(`
      ALTER TABLE "clients" 
      ADD COLUMN IF NOT EXISTS "preferred_communication" varchar(20) NOT NULL DEFAULT 'email'
    `);

    // Create index on email for search performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_clients_email" ON "clients" ("email")
    `);

    // Create index on status for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_clients_status" ON "clients" ("status")
    `);

    // Create index on client_type for filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_clients_client_type" ON "clients" ("client_type")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clients_client_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clients_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_clients_email"`);

    // Remove columns
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "preferred_communication"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "billing_address"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "tax_id"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "notes"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "client_type"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "contact_person"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "address"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "phone"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN IF EXISTS "email"`);
  }
}