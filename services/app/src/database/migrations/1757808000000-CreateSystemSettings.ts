import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemSettings1757808000000 implements MigrationInterface {
  name = 'CreateSystemSettings1757808000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create system_settings table
    await queryRunner.query(`
      CREATE TABLE "system_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "firm_name" character varying(255) NOT NULL,
        "default_retention_years" integer NOT NULL DEFAULT 7,
        "max_file_size_mb" integer NOT NULL DEFAULT 100,
        "enable_ocr" boolean NOT NULL DEFAULT true,
        "enable_legal_holds" boolean NOT NULL DEFAULT true,
        "enable_cross_firm_sharing" boolean NOT NULL DEFAULT false,
        "backup_config" jsonb,
        "smtp_config" jsonb,
        "watermark_config" jsonb,
        "security_policy" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_settings" PRIMARY KEY ("id")
      )
    `);

    // Insert default system settings
    await queryRunner.query(`
      INSERT INTO "system_settings" (
        "firm_name",
        "default_retention_years",
        "max_file_size_mb",
        "enable_ocr",
        "enable_legal_holds",
        "enable_cross_firm_sharing",
        "backup_config",
        "smtp_config",
        "watermark_config",
        "security_policy"
      ) VALUES (
        'Legal Document Management System',
        7,
        100,
        true,
        true,
        false,
        '{"frequency": "daily", "retention_days": 30, "enabled": true}',
        '{"host": "smtp.example.com", "port": 587, "secure": false, "enabled": false}',
        '{"enabled": true, "text": "CONFIDENTIAL - {firm_name}", "opacity": 0.3}',
        '{"session_timeout_minutes": 60, "max_login_attempts": 5, "password_expiry_days": 90, "require_mfa_for_admins": true}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop system_settings table
    await queryRunner.query(`DROP TABLE "system_settings"`);
  }
}