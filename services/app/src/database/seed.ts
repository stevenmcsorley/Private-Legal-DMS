import { Client } from 'pg';
import { config } from 'dotenv';

// Load environment variables
config();

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://app:app@localhost:5432/app'
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('🌱 Starting database seeding...');

    // Insert sample firm first (required for foreign key constraints)
    console.log('🏢 Seeding firms...');
    await client.query(`
      INSERT INTO firms (id, name, external_ref) VALUES
      ('22222222-2222-2222-2222-222222222222', 'Default Law Firm', 'FIRM-001')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample users (beyond admin which is already in Keycloak)
    console.log('📋 Seeding users...');
    await client.query(`
      INSERT INTO users (id, firm_id, email, display_name, roles, attributes) VALUES
      ('11111111-2222-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', 'lawyer@firm1.com', 'John Legal', ARRAY['legal_professional'], '{"teams": ["litigation"], "clearance_level": 3, "is_partner": false}'),
      ('11111111-2222-3333-4444-555555555002', '22222222-2222-2222-2222-222222222222', 'manager@firm1.com', 'Sarah Manager', ARRAY['legal_manager'], '{"teams": ["corporate"], "clearance_level": 4, "is_partner": true}'),
      ('11111111-2222-3333-4444-555555555003', '22222222-2222-2222-2222-222222222222', 'client@external.com', 'Jane Client', ARRAY['client_user'], '{"teams": [], "clearance_level": 1, "is_partner": false}')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample teams
    console.log('👥 Seeding teams...');
    await client.query(`
      INSERT INTO teams (id, firm_id, name) VALUES
      ('11111111-3333-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', 'Litigation Team'),
      ('11111111-3333-3333-4444-555555555002', '22222222-2222-2222-2222-222222222222', 'Corporate Team'),
      ('11111111-3333-3333-4444-555555555003', '22222222-2222-2222-2222-222222222222', 'Compliance Team')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert team members
    await client.query(`
      INSERT INTO team_members (team_id, user_id) VALUES
      ('11111111-3333-3333-4444-555555555001', '11111111-2222-3333-4444-555555555001'),
      ('11111111-3333-3333-4444-555555555002', '11111111-2222-3333-4444-555555555002')
      ON CONFLICT (team_id, user_id) DO NOTHING;
    `);

    // Insert sample clients
    console.log('🏢 Seeding clients...');
    await client.query(`
      INSERT INTO clients (id, firm_id, name, external_ref, created_at) VALUES
      ('11111111-4444-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', 'Acme Corporation', 'ACME-2025', NOW()),
      ('11111111-4444-3333-4444-555555555002', '22222222-2222-2222-2222-222222222222', 'TechStart Inc.', 'TECH-2025', NOW()),
      ('11111111-4444-3333-4444-555555555003', '22222222-2222-2222-2222-222222222222', 'Global Industries', 'GLOBAL-2025', NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample matters
    console.log('⚖️ Seeding matters...');
    await client.query(`
      INSERT INTO matters (id, firm_id, client_id, title, status, security_class, created_by, created_at) VALUES
      ('11111111-5555-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555001', 'Contract Negotiation - Q4 2025', 'active', 2, '11111111-2222-3333-4444-555555555001', NOW()),
      ('11111111-5555-3333-4444-555555555002', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555002', 'IP Patent Filing', 'active', 3, '11111111-2222-3333-4444-555555555002', NOW()),
      ('11111111-5555-3333-4444-555555555003', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555003', 'Regulatory Compliance Review', 'pending', 1, '11111111-2222-3333-4444-555555555001', NOW())
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert retention classes first
    console.log('📋 Seeding retention classes...');
    await client.query(`
      INSERT INTO retention_classes (id, firm_id, name, description, retention_years) VALUES
      ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Standard', 'Standard 7-year retention', 7),
      ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Extended', 'Extended 15-year retention', 15),
      ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Permanent', 'Permanent retention', 99)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert sample documents (metadata only - no actual files yet)
    console.log('📄 Seeding document metadata...');
    await client.query(`
      INSERT INTO documents (id, matter_id, firm_id, client_id, object_key, content_sha256, size_bytes, mime_type, version, retention_class_id, legal_hold, created_by) VALUES
      ('11111111-6666-3333-4444-555555555001', '11111111-5555-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555001', 'documents/m-001/contract-draft-v1.pdf', 'sha256-dummy-1', 245760, 'application/pdf', 1, '33333333-3333-3333-3333-333333333333', false, '11111111-2222-3333-4444-555555555001'),
      ('11111111-6666-3333-4444-555555555002', '11111111-5555-3333-4444-555555555001', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555001', 'documents/m-001/correspondence-email.pdf', 'sha256-dummy-2', 51200, 'application/pdf', 1, '55555555-5555-5555-5555-555555555555', false, '11111111-2222-3333-4444-555555555001'),
      ('11111111-6666-3333-4444-555555555003', '11111111-5555-3333-4444-555555555002', '22222222-2222-2222-2222-222222222222', '11111111-4444-3333-4444-555555555002', 'documents/m-002/patent-application.pdf', 'sha256-dummy-3', 1048576, 'application/pdf', 1, '44444444-4444-4444-4444-444444444444', false, '11111111-2222-3333-4444-555555555002')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert document metadata
    console.log('📝 Seeding document metadata...');
    await client.query(`
      INSERT INTO document_meta (document_id, title, tags, parties, jurisdiction, effective_date, expiry_date, custom_fields) VALUES
      ('11111111-6666-3333-4444-555555555001', 'Service Agreement Draft v1', '["contract", "draft", "services"]'::jsonb, ARRAY['Acme Corporation', 'Default Law Firm'], 'New York', '2025-01-01', '2026-01-01', '{"priority": "high", "confidential": true}'),
      ('11111111-6666-3333-4444-555555555002', 'Client Correspondence - Contract Terms', '["correspondence", "email", "contract"]'::jsonb, ARRAY['Acme Corporation', 'John Legal'], 'New York', '2025-09-11', null, '{"thread_id": "email-123", "reply_to": "client@acme.com"}'),
      ('11111111-6666-3333-4444-555555555003', 'Patent Application - Mobile App UI', '["patent", "application", "mobile", "ui"]'::jsonb, ARRAY['TechStart Inc.', 'US Patent Office'], 'Federal', '2025-09-11', null, '{"application_number": "US2025123456", "invention_type": "software"}')
      ON CONFLICT (document_id) DO NOTHING;
    `);

    // Insert sample ACLs
    console.log('🔐 Seeding access controls...');
    await client.query(`
      INSERT INTO acls (resource_type, resource_id, principal_type, principal_id, permissions, granted_by, expires_at) VALUES
      ('matter', '11111111-5555-3333-4444-555555555001', 'user', '11111111-2222-3333-4444-555555555001', ARRAY['read', 'write', 'delete'], '11111111-2222-3333-4444-555555555001', null),
      ('matter', '11111111-5555-3333-4444-555555555002', 'user', '11111111-2222-3333-4444-555555555002', ARRAY['read', 'write', 'delete'], '11111111-2222-3333-4444-555555555002', null),
      ('matter', '11111111-5555-3333-4444-555555555003', 'user', '11111111-2222-3333-4444-555555555001', ARRAY['read', 'write', 'delete'], '11111111-2222-3333-4444-555555555001', null),
      ('document', '11111111-6666-3333-4444-555555555001', 'user', '11111111-2222-3333-4444-555555555001', ARRAY['read', 'write'], '11111111-2222-3333-4444-555555555001', null),
      ('document', '11111111-6666-3333-4444-555555555002', 'user', '11111111-2222-3333-4444-555555555001', ARRAY['read', 'write'], '11111111-2222-3333-4444-555555555001', null),
      ('document', '11111111-6666-3333-4444-555555555003', 'user', '11111111-2222-3333-4444-555555555002', ARRAY['read', 'write'], '11111111-2222-3333-4444-555555555002', null),
      ('matter', '11111111-5555-3333-4444-555555555001', 'user', '11111111-2222-3333-4444-555555555003', ARRAY['read'], '11111111-2222-3333-4444-555555555001', '2025-12-31 23:59:59');
    `);

    // Insert initial audit entries
    console.log('📊 Seeding audit entries...');
    await client.query(`
      INSERT INTO audits (firm_id, user_id, action, resource_type, resource_id, outcome, ip_address, user_agent, additional_data) VALUES
      ('22222222-2222-2222-2222-222222222222', '11111111-2222-3333-4444-555555555001', 'create', 'matter', '11111111-5555-3333-4444-555555555001', 'success', '192.168.1.100', 'Mozilla/5.0', '{"title": "Contract Negotiation - Q4 2025"}'),
      ('22222222-2222-2222-2222-222222222222', '11111111-2222-3333-4444-555555555002', 'create', 'matter', '11111111-5555-3333-4444-555555555002', 'success', '192.168.1.101', 'Mozilla/5.0', '{"title": "IP Patent Filing"}'),
      ('22222222-2222-2222-2222-222222222222', '11111111-2222-3333-4444-555555555001', 'upload', 'document', '11111111-6666-3333-4444-555555555001', 'success', '192.168.1.100', 'Mozilla/5.0', '{"filename": "contract-draft-v1.pdf", "size": 245760}'),
      ('22222222-2222-2222-2222-222222222222', '11111111-2222-3333-4444-555555555002', 'upload', 'document', '11111111-6666-3333-4444-555555555003', 'success', '192.168.1.101', 'Mozilla/5.0', '{"filename": "patent-application.pdf", "size": 1048576}');
    `);

    console.log('✅ Database seeding completed successfully!');
    console.log('📈 Sample data created:');
    console.log('  • 3 users (lawyers and client)');
    console.log('  • 3 teams with memberships');
    console.log('  • 3 clients');
    console.log('  • 3 matters (legal cases)');
    console.log('  • 3 documents with metadata');
    console.log('  • Access controls and audit trail');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seeding
seedDatabase().catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});