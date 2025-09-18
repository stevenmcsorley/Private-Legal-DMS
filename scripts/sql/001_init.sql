-- Legal DMS Database Schema
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Firms table
CREATE TABLE firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    external_ref VARCHAR(100),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table  
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    keycloak_id VARCHAR(255) UNIQUE,
    roles TEXT[] DEFAULT '{}',
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Team members junction table
CREATE TABLE team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    external_ref VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Matters table (cases/projects)
CREATE TABLE matters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    matter_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    security_class INTEGER DEFAULT 1,
    jurisdiction VARCHAR(100),
    practice_area VARCHAR(100),
    responsible_attorney UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Matter participants (many-to-many: matters <-> users)
CREATE TABLE matter_participants (
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer',
    permissions TEXT[] DEFAULT '{}',
    added_by UUID NOT NULL REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    removed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (matter_id, user_id)
);

-- Cross-firm matter sharing
CREATE TABLE matter_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    shared_with_firm UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'viewer',
    permissions TEXT[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id)
);

-- Retention classes for document lifecycle
CREATE TABLE retention_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    retention_years INTEGER NOT NULL,
    legal_hold_override BOOLEAN DEFAULT false,
    minio_policy JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id),
    object_key VARCHAR(500) NOT NULL,
    content_sha256 VARCHAR(64) NOT NULL,
    original_filename VARCHAR(500),
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100),
    version INTEGER DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id),
    retention_class_id UUID REFERENCES retention_classes(id),
    legal_hold BOOLEAN DEFAULT false,
    legal_hold_reason TEXT,
    legal_hold_set_by UUID REFERENCES users(id),
    legal_hold_set_at TIMESTAMP WITH TIME ZONE,
    is_client_upload BOOLEAN DEFAULT false,
    extraction_status VARCHAR(50) DEFAULT 'pending',
    extraction_error TEXT,
    indexed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    purged_at TIMESTAMP WITH TIME ZONE
);

-- Document metadata (separate table for flexibility)
CREATE TABLE document_meta (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    title VARCHAR(500),
    description TEXT,
    tags JSONB DEFAULT '[]',
    parties TEXT[] DEFAULT '{}',
    jurisdiction VARCHAR(100),
    document_type VARCHAR(100),
    document_date DATE,
    effective_date DATE,
    expiry_date DATE,
    confidential BOOLEAN DEFAULT false,
    privileged BOOLEAN DEFAULT false,
    work_product BOOLEAN DEFAULT false,
    custom_fields JSONB DEFAULT '{}',
    extracted_text TEXT,
    ocr_confidence DECIMAL(3,2),
    language_detected VARCHAR(10),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Control Lists (fine-grained permissions)
CREATE TABLE acls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID NOT NULL,
    principal_type VARCHAR(20) NOT NULL, -- 'user', 'team', 'firm'  
    principal_id UUID NOT NULL,
    permissions TEXT[] NOT NULL,
    granted_by UUID NOT NULL REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_by UUID REFERENCES users(id)
);

-- Audit trail (immutable)
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID REFERENCES firms(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    resource_title VARCHAR(500),
    outcome VARCHAR(20) NOT NULL, -- 'success', 'denied', 'error'
    deny_reason VARCHAR(500),
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    additional_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search queries (for analytics)
CREATE TABLE search_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    firm_id UUID REFERENCES firms(id),
    query_text TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_firm_id ON users(firm_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);

CREATE INDEX idx_teams_firm_id ON teams(firm_id);

CREATE INDEX idx_clients_firm_id ON clients(firm_id);
CREATE INDEX idx_clients_name_trgm ON clients USING gin(name gin_trgm_ops);

CREATE INDEX idx_matters_firm_id ON matters(firm_id);
CREATE INDEX idx_matters_client_id ON matters(client_id);
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_responsible_attorney ON matters(responsible_attorney);

CREATE INDEX idx_documents_matter_id ON documents(matter_id);
CREATE INDEX idx_documents_firm_id ON documents(firm_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_content_sha256 ON documents(content_sha256);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_legal_hold ON documents(legal_hold) WHERE legal_hold = true;

CREATE INDEX idx_document_meta_tags ON document_meta USING gin(tags);
CREATE INDEX idx_document_meta_parties ON document_meta USING gin(parties);
CREATE INDEX idx_document_meta_extracted_text ON document_meta USING gin(to_tsvector('english', extracted_text));

CREATE INDEX idx_acls_resource ON acls(resource_type, resource_id);
CREATE INDEX idx_acls_principal ON acls(principal_type, principal_id);
CREATE INDEX idx_acls_expires ON acls(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_audits_firm_resource ON audits(firm_id, resource_type, resource_id, created_at DESC);
CREATE INDEX idx_audits_user ON audits(user_id, created_at DESC);
CREATE INDEX idx_audits_action ON audits(action);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON firms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON matters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_classes_updated_at BEFORE UPDATE ON retention_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_meta_updated_at BEFORE UPDATE ON document_meta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO system_settings (key, value, description) VALUES 
('app_version', '"1.0.0"', 'Application version'),
('maintenance_mode', 'false', 'System maintenance mode'),
('max_upload_size_mb', '1024', 'Maximum upload size in MB'),
('retention_check_interval_days', '30', 'How often to check retention policies'),
('audit_retention_days', '2555', 'How long to keep audit logs (7 years)');

-- Insert default firm
INSERT INTO firms (id, name, domain, keycloak_realm, keycloak_client_id) VALUES
('22222222-2222-2222-2222-222222222222', 'Default Law Firm', 'default.law', 'dms', 'dms-app');

-- Insert default retention classes
INSERT INTO retention_classes (id, firm_id, name, description, retention_years) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Litigation Hold', 'Documents under litigation hold - indefinite retention', 999),
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Client Files', 'Standard client file retention', 7),
('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Contracts', 'Contract document retention', 10),
('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Correspondence', 'Email and letter retention', 3);

-- Comments for documentation
COMMENT ON TABLE firms IS 'Law firms or organizations using the system';
COMMENT ON TABLE users IS 'System users with Keycloak integration';
COMMENT ON TABLE teams IS 'Teams within firms for collaboration';
COMMENT ON TABLE clients IS 'Clients of law firms';
COMMENT ON TABLE matters IS 'Legal matters/cases/projects';
COMMENT ON TABLE documents IS 'Document storage metadata';
COMMENT ON TABLE document_meta IS 'Extended document metadata and extracted content';
COMMENT ON TABLE acls IS 'Fine-grained access control permissions';
COMMENT ON TABLE audits IS 'Immutable audit trail for compliance';
COMMENT ON TABLE retention_classes IS 'Document retention policy definitions';