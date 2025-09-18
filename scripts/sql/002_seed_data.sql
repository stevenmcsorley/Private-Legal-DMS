-- Development seed data for Legal DMS
-- This script populates the database with sample data for development and testing

-- Insert sample firms
INSERT INTO firms (id, name, external_ref, settings) VALUES 
('22222222-2222-2222-2222-222222222222', 'Firm One LLP', 'FIRM1', '{"timezone": "America/New_York", "theme": "default"}'),
('77777777-7777-7777-7777-777777777777', 'Partner Firm LLC', 'FIRM2', '{"timezone": "America/Chicago", "theme": "dark"}'),
('88888888-8888-8888-8888-888888888888', 'Client External Org', 'EXT1', '{}');

-- Insert sample users (these should match Keycloak users)
INSERT INTO users (id, firm_id, email, display_name, keycloak_id, roles, attributes) VALUES 
('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'admin@firm1.com', 'Firm Administrator', 'firm1-admin', ARRAY['firm_admin'], '{"firm_id": "22222222-2222-2222-2222-222222222222", "teams": ["admin"], "clearance_level": 5, "is_partner": false}'),
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'lawyer1@firm1.com', 'John Lawyer', 'lawyer1', ARRAY['legal_professional'], '{"firm_id": "22222222-2222-2222-2222-222222222222", "teams": ["litigation", "corporate"], "clearance_level": 3, "is_partner": false}'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'manager1@firm1.com', 'Sarah Manager', 'manager1', ARRAY['legal_manager'], '{"firm_id": "22222222-2222-2222-2222-222222222222", "teams": ["litigation"], "clearance_level": 4, "is_partner": true}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', 'contact@client1.com', 'Jane Client', 'client1', ARRAY['client_user'], '{"firm_id": "external", "teams": [], "clearance_level": 1, "is_partner": false}'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '77777777-7777-7777-7777-777777777777', 'partner@firm2.com', 'Partner User', 'partner1', ARRAY['legal_professional'], '{"firm_id": "77777777-7777-7777-7777-777777777777", "teams": ["corporate"], "clearance_level": 3, "is_partner": true}');

-- Insert sample teams
INSERT INTO teams (id, firm_id, name, description) VALUES 
('10000000-1000-1000-1000-100000000001', '22222222-2222-2222-2222-222222222222', 'Litigation Team', 'Handles litigation matters'),
('10000000-1000-1000-1000-100000000002', '22222222-2222-2222-2222-222222222222', 'Corporate Team', 'Handles corporate matters'),
('10000000-1000-1000-1000-100000000003', '22222222-2222-2222-2222-222222222222', 'Admin Team', 'Administrative staff'),
('10000000-1000-1000-1000-100000000004', '77777777-7777-7777-7777-777777777777', 'Partnership Team', 'Partner firm team');

-- Insert team memberships
INSERT INTO team_members (team_id, user_id, role) VALUES 
('10000000-1000-1000-1000-100000000001', '99999999-9999-9999-9999-999999999999', 'member'),
('10000000-1000-1000-1000-100000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lead'),
('10000000-1000-1000-1000-100000000002', '99999999-9999-9999-9999-999999999999', 'member'),
('10000000-1000-1000-1000-100000000003', '66666666-6666-6666-6666-666666666666', 'lead'),
('10000000-1000-1000-1000-100000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'member');

-- Insert sample clients
INSERT INTO clients (id, firm_id, name, external_ref, contact_email, contact_phone, address, metadata) VALUES 
('20000000-2000-2000-2000-200000000001', '22222222-2222-2222-2222-222222222222', 'Acme Corporation', 'ACME001', 'legal@acme.com', '555-0101', '{"street": "123 Business Ave", "city": "New York", "state": "NY", "zip": "10001", "country": "US"}', '{"industry": "Technology", "size": "Large"}'),
('20000000-2000-2000-2000-200000000002', '22222222-2222-2222-2222-222222222222', 'Small Business Inc', 'SBI001', 'owner@smallbiz.com', '555-0102', '{"street": "456 Main St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "US"}', '{"industry": "Retail", "size": "Small"}'),
('20000000-2000-2000-2000-200000000003', '77777777-7777-7777-7777-777777777777', 'Partner Client LLC', 'PC001', 'info@partnerclient.com', '555-0103', '{"street": "789 Oak Dr", "city": "Austin", "state": "TX", "zip": "73301", "country": "US"}', '{"industry": "Finance", "size": "Medium"}');

-- Insert sample matters
INSERT INTO matters (id, firm_id, client_id, title, description, matter_number, status, security_class, jurisdiction, practice_area, responsible_attorney, metadata, created_by) VALUES 
('30000000-3000-3000-3000-300000000001', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000001', 'Acme Corp Contract Dispute', 'Contract dispute regarding software licensing agreement', 'MAT-2024-001', 'active', 2, 'New York', 'Litigation', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"budget": 150000, "billing_rate": 450, "priority": "high"}', '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000002', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000002', 'Small Business Acquisition', 'Due diligence for business acquisition', 'MAT-2024-002', 'active', 1, 'Illinois', 'Corporate', '99999999-9999-9999-9999-999999999999', '{"budget": 75000, "billing_rate": 350, "priority": "medium"}', '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000003', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000001', 'Acme IP Portfolio Review', 'Comprehensive intellectual property portfolio review', 'MAT-2024-003', 'draft', 3, 'Federal', 'IP', '99999999-9999-9999-9999-999999999999', '{"budget": 200000, "billing_rate": 500, "priority": "low"}', '66666666-6666-6666-6666-666666666666');

-- Insert matter participants
INSERT INTO matter_participants (matter_id, user_id, role, permissions, added_by) VALUES 
('30000000-3000-3000-3000-300000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner', ARRAY['read', 'write', 'delete', 'share'], '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000001', '99999999-9999-9999-9999-999999999999', 'collaborator', ARRAY['read', 'write'], '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'client', ARRAY['read'], '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000002', '99999999-9999-9999-9999-999999999999', 'owner', ARRAY['read', 'write', 'delete', 'share'], '66666666-6666-6666-6666-666666666666'),
('30000000-3000-3000-3000-300000000003', '99999999-9999-9999-9999-999999999999', 'owner', ARRAY['read', 'write', 'delete', 'share'], '66666666-6666-6666-6666-666666666666');

-- Insert a cross-firm matter share (collaboration example)
INSERT INTO matter_shares (matter_id, shared_with_firm, shared_by, role, permissions, expires_at) VALUES 
('30000000-3000-3000-3000-300000000001', '77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'viewer', ARRAY['read'], NOW() + INTERVAL '90 days');

-- Insert sample documents (metadata only - no actual files yet)
INSERT INTO documents (id, matter_id, firm_id, client_id, object_key, content_sha256, original_filename, size_bytes, mime_type, version, retention_class_id, created_by) VALUES 
('40000000-4000-4000-4000-400000000001', '30000000-3000-3000-3000-300000000001', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000001', 'f-1/matters/30000000-3000-3000-3000-300000000001/docs/contract-v1.pdf', 'abc123def456789012345678901234567890123456789012345678901234567890', 'Software_License_Agreement.pdf', 2048000, 'application/pdf', 1, '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999'),
('40000000-4000-4000-4000-400000000002', '30000000-3000-3000-3000-300000000001', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000001', 'f-1/matters/30000000-3000-3000-3000-300000000001/docs/correspondence-1.pdf', 'def456abc789012345678901234567890123456789012345678901234567890123', 'Client_Email_Thread.pdf', 524288, 'application/pdf', 1, '55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999'),
('40000000-4000-4000-4000-400000000003', '30000000-3000-3000-3000-300000000002', '22222222-2222-2222-2222-222222222222', '20000000-2000-2000-2000-200000000002', 'f-1/matters/30000000-3000-3000-3000-300000000002/docs/dd-checklist.docx', 'ghi789jkl012345678901234567890123456789012345678901234567890123456', 'Due_Diligence_Checklist.docx', 98304, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1, '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999'),
('40000000-4000-4000-4000-400000000004', '30000000-3000-3000-3000-300000000001', '22222222-2222-2222-2222-222222222222', NULL, 'f-1/client-uploads/client-docs-1.pdf', 'jkl012mno345678901234567890123456789012345678901234567890123456789', 'Client_Provided_Evidence.pdf', 1572864, 'application/pdf', 1, '33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- Set one document as client upload
UPDATE documents SET is_client_upload = true WHERE id = '40000000-4000-4000-4000-400000000004';

-- Insert document metadata
INSERT INTO document_meta (document_id, title, description, tags, parties, jurisdiction, document_type, document_date, confidential, privileged) VALUES 
('40000000-4000-4000-4000-400000000001', 'Software License Agreement', 'Primary contract document for the software licensing dispute', '["contract", "software", "license", "dispute"]', ARRAY['Acme Corporation', 'TechVendor Inc'], 'New York', 'Contract', '2023-05-15', true, true),
('40000000-4000-4000-4000-400000000002', 'Client Correspondence', 'Email thread between client and opposing party', '["correspondence", "email", "negotiation"]', ARRAY['Acme Corporation', 'TechVendor Inc'], 'New York', 'Correspondence', '2024-01-10', false, true),
('40000000-4000-4000-4000-400000000003', 'Due Diligence Checklist', 'Comprehensive checklist for acquisition due diligence', '["due-diligence", "acquisition", "checklist", "corporate"]', ARRAY['Small Business Inc', 'Buyer Corp'], 'Illinois', 'Checklist', '2024-02-01', false, false),
('40000000-4000-4000-4000-400000000004', 'Client Evidence', 'Supporting documentation provided by client', '["evidence", "client-provided", "supporting"]', ARRAY['Acme Corporation'], 'New York', 'Evidence', '2024-01-15', true, false);

-- Insert some sample ACLs for fine-grained permissions
INSERT INTO acls (resource_type, resource_id, principal_type, principal_id, permissions, granted_by) VALUES 
('document', '40000000-4000-4000-4000-400000000001', 'user', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', ARRAY['read'], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('matter', '30000000-3000-3000-3000-300000000001', 'user', 'cccccccc-cccc-cccc-cccc-cccccccccccc', ARRAY['read'], 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Insert some sample audit entries (normally these would be created by the application)
INSERT INTO audits (firm_id, user_id, action, resource_type, resource_id, resource_title, outcome, ip_address, user_agent, additional_data) VALUES 
('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'document.upload', 'document', '40000000-4000-4000-4000-400000000001', 'Software License Agreement', 'success', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"file_size": 2048000, "mime_type": "application/pdf"}'),
('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'document.view', 'document', '40000000-4000-4000-4000-400000000001', 'Software License Agreement', 'success', '192.168.1.200', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"view_duration_seconds": 180}'),
('22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'document.view', 'document', '40000000-4000-4000-4000-400000000001', 'Software License Agreement', 'denied', '192.168.2.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"deny_reason": "insufficient clearance"}'),
('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'matter.create', 'matter', '30000000-3000-3000-3000-300000000002', 'Small Business Acquisition', 'success', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"client_id": "20000000-2000-2000-2000-200000000002"}');

-- Insert some sample search queries for analytics
INSERT INTO search_queries (user_id, firm_id, query_text, filters, results_count, response_time_ms) VALUES 
('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'software license contract', '{"matter_id": "30000000-3000-3000-3000-300000000001"}', 2, 145),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'acme corporation', '{"document_type": "contract"}', 1, 89),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', 'evidence', '{}', 1, 234);

-- Update some system settings for development
UPDATE system_settings SET value = '"development"' WHERE key = 'app_version';
UPDATE system_settings SET value = '"512"' WHERE key = 'max_upload_size_mb';

-- Create some view for common queries
CREATE VIEW user_matters_view AS
SELECT DISTINCT
    u.id as user_id,
    u.display_name as user_name,
    m.id as matter_id,
    m.title as matter_title,
    m.status as matter_status,
    c.name as client_name,
    mp.role as user_role,
    CASE 
        WHEN mp.user_id IS NOT NULL THEN 'participant'
        WHEN ms.shared_with_firm = u.firm_id THEN 'shared'
        WHEN m.firm_id = u.firm_id THEN 'firm_member'
        ELSE 'no_access'
    END as access_type
FROM users u
CROSS JOIN matters m
LEFT JOIN matter_participants mp ON mp.matter_id = m.id AND mp.user_id = u.id AND mp.removed_at IS NULL
LEFT JOIN matter_shares ms ON ms.matter_id = m.id AND ms.shared_with_firm = u.firm_id AND (ms.expires_at IS NULL OR ms.expires_at > NOW()) AND ms.revoked_at IS NULL
LEFT JOIN clients c ON c.id = m.client_id
WHERE m.deleted_at IS NULL;

-- Grant appropriate permissions (adjust as needed for your setup)
-- These would typically be handled by your application's database user
COMMENT ON VIEW user_matters_view IS 'Shows which matters each user can access and their role/access type';

-- Final message
SELECT 'Development seed data inserted successfully' as status;