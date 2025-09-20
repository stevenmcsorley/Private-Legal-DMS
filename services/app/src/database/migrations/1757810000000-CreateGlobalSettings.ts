import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlobalSettings1757810000000 implements MigrationInterface {
  name = 'CreateGlobalSettings1757810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create global_settings table
    await queryRunner.query(`
      CREATE TABLE "global_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" character varying(255) NOT NULL,
        "value" text NOT NULL,
        "description" character varying(500),
        "type" character varying(20) NOT NULL DEFAULT 'string',
        "requires_restart" boolean NOT NULL DEFAULT false,
        "category" character varying(50) NOT NULL DEFAULT 'system',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_global_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_global_settings_key" UNIQUE ("key")
      )
    `);

    // Add check constraints for type and category
    await queryRunner.query(`
      ALTER TABLE "global_settings" 
      ADD CONSTRAINT "CHK_global_settings_type" 
      CHECK ("type" IN ('string', 'number', 'boolean', 'json'))
    `);

    await queryRunner.query(`
      ALTER TABLE "global_settings" 
      ADD CONSTRAINT "CHK_global_settings_category" 
      CHECK ("category" IN ('system', 'security', 'storage', 'email', 'backup', 'performance'))
    `);

    // Insert default global settings
    await queryRunner.query(`
      INSERT INTO "global_settings" 
      ("key", "value", "description", "type", "requires_restart", "category") 
      VALUES
      ('system.maintenance_mode', 'false', 'Enable maintenance mode to restrict access during updates', 'boolean', false, 'system'),
      ('system.max_file_size_mb', '100', 'Maximum file size for document uploads in MB', 'number', true, 'system'),
      ('security.session_timeout_minutes', '480', 'User session timeout in minutes', 'number', false, 'security'),
      ('security.force_mfa', 'false', 'Force multi-factor authentication for all users', 'boolean', false, 'security'),
      ('storage.retention_policy_days', '2555', 'Default document retention period in days (7 years)', 'number', false, 'storage'),
      ('email.smtp_host', 'localhost', 'SMTP server hostname for email notifications', 'string', true, 'email'),
      ('backup.auto_backup_enabled', 'true', 'Enable automatic daily database backups', 'boolean', false, 'backup'),
      ('performance.api_rate_limit', '1000', 'API requests per minute per user', 'number', true, 'performance')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop global_settings table
    await queryRunner.query(`DROP TABLE "global_settings"`);
  }
}