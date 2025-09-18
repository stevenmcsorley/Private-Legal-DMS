--
-- Seed Data for Legal DMS
-- Essential records for fresh installations
--

-- Insert default firm
INSERT INTO firms (id, name, contact_email, contact_phone, address, domain, subscription_tier, subscription_status, max_users, max_storage_gb, features, billing_settings, created_at, updated_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Demo Law Firm',
    'admin@demolawfirm.com',
    '+1-555-0123',
    '{"street": "123 Legal Street", "city": "Law City", "state": "CA", "zipCode": "90210", "country": "USA"}',
    'demolawfirm.com',
    'enterprise',
    'active',
    100,
    1000,
    '["document_management", "client_portal", "advanced_search", "audit_trails", "matter_export", "cross_firm_sharing", "ocr_processing", "virus_scanning"]',
    '{"currency": "USD", "billing_cycle": "annual", "auto_renewal": true}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert default admin user
INSERT INTO users (id, firm_id, email, display_name, keycloak_id, roles, attributes, is_active, created_at, updated_at)
VALUES (
    '38db5dcd-a99e-4a41-a3d8-bbfae6466ab6',
    '22222222-2222-2222-2222-222222222222',
    'admin@demolawfirm.com',
    'Demo Admin',
    'demo-admin-keycloak-id',
    '["super_admin", "firm_admin"]',
    '{"department": "Administration", "phone": "+1-555-0123", "office_location": "Main Office"}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert default retention classes
INSERT INTO retention_classes (id, firm_id, name, description, retention_years, legal_hold_override, auto_delete, minio_policy, created_at, updated_at)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222',
        'Standard Legal Documents',
        'Standard retention for general legal documents - 7 years',
        7,
        true,
        false,
        'READ_WRITE',
        NOW(),
        NOW()
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '22222222-2222-2222-2222-222222222222',
        'Client Communications',
        'Client correspondence and communication records - 5 years',
        5,
        true,
        false,
        'READ_WRITE',
        NOW(),
        NOW()
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '22222222-2222-2222-2222-222222222222',
        'Contract Documents',
        'Contracts and agreements - 10 years',
        10,
        true,
        false,
        'READ_WRITE',
        NOW(),
        NOW()
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '22222222-2222-2222-2222-222222222222',
        'Litigation Files',
        'Litigation and court documents - Permanent retention',
        999,
        true,
        false,
        'READ_WRITE',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample client
INSERT INTO clients (id, firm_id, name, contact_email, contact_phone, address, metadata, external_ref, created_at, updated_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'Demo Client Corp',
    'contact@democlient.com',
    '+1-555-0456',
    '{"street": "456 Business Ave", "city": "Commerce City", "state": "CA", "zipCode": "90211", "country": "USA"}',
    '{"industry": "Technology", "company_size": "500-1000", "primary_contact": "John Smith", "billing_contact": "jane.doe@democlient.com"}',
    'CLIENT-001',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample matter
INSERT INTO matters (id, firm_id, client_id, title, description, status, security_class, retention_class_id, created_by, created_at, updated_at)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Demo Corporate Contract Review',
    'Review and analysis of corporate service agreements for Demo Client Corp. Includes contract terms, liability clauses, and regulatory compliance review.',
    'active',
    'internal',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '38db5dcd-a99e-4a41-a3d8-bbfae6466ab6',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Note: Document seed data is not included as documents should be uploaded through the application
-- This ensures proper processing pipeline (virus scanning, OCR, text extraction) is tested

-- Display completion message
SELECT 'Seed data inserted successfully!' as message;
SELECT 'Default firm: Demo Law Firm' as firm_info;
SELECT 'Default admin: admin@demolawfirm.com' as admin_info;
SELECT 'Retention classes: 4 default classes created' as retention_info;
SELECT 'Sample client and matter created for testing' as test_data_info;