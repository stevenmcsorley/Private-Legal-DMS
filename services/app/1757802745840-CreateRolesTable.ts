import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRolesTable1757802745840 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.createTable(
            new Table({
                name: 'roles',
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
                        length: '100',
                        isUnique: true,
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'permissions',
                        type: 'text',
                        isArray: true,
                        default: "'{}'",
                    },
                    {
                        name: 'hierarchy_level',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'is_system_role',
                        type: 'boolean',
                        default: false,
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
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Insert default roles
        await queryRunner.query(`
            INSERT INTO roles (name, description, permissions, hierarchy_level, is_active, is_system_role)
            VALUES 
                ('super_admin', 'System-wide administrator with full access', 
                 ARRAY['admin', 'user_management', 'firm_management', 'system_config'], 0, true, true),
                ('firm_admin', 'Firm administrator with firm-wide access', 
                 ARRAY['admin', 'user_management', 'client_management', 'matter_management', 'document_management', 'retention', 'legal_hold'], 1, true, true),
                ('legal_manager', 'Legal manager with elevated permissions', 
                 ARRAY['document_management', 'matter_management', 'client_management', 'legal_hold', 'retention'], 2, true, true),
                ('legal_professional', 'Lawyer or legal professional', 
                 ARRAY['document', 'matter', 'client', 'document_upload', 'legal_review'], 3, true, true),
                ('paralegal', 'Paralegal with document and case management access', 
                 ARRAY['document', 'matter', 'client', 'document_upload'], 4, true, true),
                ('client_user', 'Client portal user with limited access', 
                 ARRAY['client_portal', 'document_view'], 5, true, true)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('roles');
    }

}
