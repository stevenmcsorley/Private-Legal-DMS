--
-- PostgreSQL database dump
--

\restrict ee2NvrfRzyWK4yaAZRfgCjG603VlFtrgplYCUPr97NCwVgg1UQSMMnTsIk4lsku

-- Dumped from database version 16.10 (Debian 16.10-1.pgdg13+1)
-- Dumped by pg_dump version 16.10 (Debian 16.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.acls (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid NOT NULL,
    principal_type character varying(20) NOT NULL,
    principal_id uuid NOT NULL,
    permissions text[] NOT NULL,
    granted_by uuid NOT NULL,
    granted_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    revoked_by uuid
);


--
-- Name: audits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audits (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid,
    user_id uuid,
    session_id character varying(255),
    action character varying(100) NOT NULL,
    resource_type character varying(50) NOT NULL,
    resource_id uuid,
    resource_title character varying(500),
    outcome character varying(20) NOT NULL,
    deny_reason character varying(500),
    ip_address inet,
    user_agent text,
    request_id character varying(255),
    additional_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    details jsonb,
    risk_level character varying(20),
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    external_ref character varying(100),
    contact_email character varying(255),
    contact_phone character varying(50),
    address jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: document_meta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_meta (
    document_id uuid NOT NULL,
    title character varying(500),
    description text,
    tags jsonb DEFAULT '[]'::jsonb,
    parties text[] DEFAULT '{}'::text[],
    jurisdiction character varying(100),
    document_type character varying(100),
    document_date date,
    effective_date date,
    expiry_date date,
    confidential boolean DEFAULT false,
    privileged boolean DEFAULT false,
    work_product boolean DEFAULT false,
    custom_fields jsonb DEFAULT '{}'::jsonb,
    extracted_text text,
    ocr_confidence numeric(3,2),
    language_detected character varying(10),
    updated_at timestamp with time zone DEFAULT now(),
    search_vector tsvector,
    pages integer
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    matter_id uuid NOT NULL,
    firm_id uuid NOT NULL,
    client_id uuid,
    object_key character varying(500) NOT NULL,
    content_sha256 character varying(64) NOT NULL,
    original_filename character varying(500),
    size_bytes bigint NOT NULL,
    mime_type character varying(100),
    version integer DEFAULT 1,
    parent_document_id uuid,
    retention_class_id uuid,
    legal_hold boolean DEFAULT false,
    legal_hold_reason text,
    legal_hold_set_by uuid,
    legal_hold_set_at timestamp with time zone,
    is_client_upload boolean DEFAULT false,
    extraction_status character varying(50) DEFAULT 'pending'::character varying,
    extraction_error text,
    indexed_at timestamp with time zone,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    purged_at timestamp with time zone,
    is_deleted boolean DEFAULT false,
    uploaded_by_type character varying(20) DEFAULT 'legal_staff'::character varying NOT NULL,
    uploaded_by_user_id uuid,
    CONSTRAINT chk_uploaded_by_type CHECK (((uploaded_by_type)::text = ANY ((ARRAY['client'::character varying, 'legal_staff'::character varying])::text[])))
);


--
-- Name: firms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.firms (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    external_ref character varying(100),
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: matter_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matter_participants (
    matter_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) DEFAULT 'viewer'::character varying,
    permissions text[] DEFAULT '{}'::text[],
    added_by uuid NOT NULL,
    added_at timestamp with time zone DEFAULT now(),
    removed_at timestamp with time zone
);


--
-- Name: matter_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matter_shares (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    matter_id uuid NOT NULL,
    shared_with_firm uuid NOT NULL,
    shared_by uuid NOT NULL,
    role character varying(50) DEFAULT 'viewer'::character varying,
    permissions text[] DEFAULT '{}'::text[],
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone,
    revoked_by uuid
);


--
-- Name: matter_teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matter_teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matter_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying DEFAULT 'observer'::character varying,
    access_level character varying DEFAULT 'read_only'::character varying,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    added_by uuid NOT NULL,
    CONSTRAINT matter_teams_access_level_check CHECK (((access_level)::text = ANY ((ARRAY['full'::character varying, 'read_write'::character varying, 'read_only'::character varying, 'limited'::character varying])::text[]))),
    CONSTRAINT matter_teams_role_check CHECK (((role)::text = ANY ((ARRAY['lead_lawyer'::character varying, 'associate'::character varying, 'paralegal'::character varying, 'legal_assistant'::character varying, 'observer'::character varying])::text[])))
);


--
-- Name: matters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.matters (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid NOT NULL,
    client_id uuid NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    matter_number character varying(100),
    status character varying(50) DEFAULT 'active'::character varying,
    security_class integer DEFAULT 1,
    jurisdiction character varying(100),
    practice_area character varying(100),
    responsible_attorney uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    closed_at timestamp with time zone,
    deleted_at timestamp with time zone
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: retention_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retention_classes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    retention_years integer NOT NULL,
    legal_hold_override boolean DEFAULT false,
    minio_policy jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    auto_delete boolean DEFAULT false
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    permissions text[] DEFAULT '{}'::text[],
    hierarchy_level integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_system_role boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: search_queries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.search_queries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    firm_id uuid,
    query_text text NOT NULL,
    filters jsonb DEFAULT '{}'::jsonb,
    results_count integer,
    response_time_ms integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    key character varying(100) NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_by uuid,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.team_members (
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50) DEFAULT 'member'::character varying,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firm_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    keycloak_id character varying(255),
    roles text[] DEFAULT '{}'::text[],
    attributes jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    clearance_level integer DEFAULT 5
);


--
-- Name: user_matters_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.user_matters_view AS
 SELECT DISTINCT u.id AS user_id,
    u.display_name AS user_name,
    m.id AS matter_id,
    m.title AS matter_title,
    m.status AS matter_status,
    c.name AS client_name,
    mp.role AS user_role,
        CASE
            WHEN (mp.user_id IS NOT NULL) THEN 'participant'::text
            WHEN (ms.shared_with_firm = u.firm_id) THEN 'shared'::text
            WHEN (m.firm_id = u.firm_id) THEN 'firm_member'::text
            ELSE 'no_access'::text
        END AS access_type
   FROM ((((public.users u
     CROSS JOIN public.matters m)
     LEFT JOIN public.matter_participants mp ON (((mp.matter_id = m.id) AND (mp.user_id = u.id) AND (mp.removed_at IS NULL))))
     LEFT JOIN public.matter_shares ms ON (((ms.matter_id = m.id) AND (ms.shared_with_firm = u.firm_id) AND ((ms.expires_at IS NULL) OR (ms.expires_at > now())) AND (ms.revoked_at IS NULL))))
     LEFT JOIN public.clients c ON ((c.id = m.client_id)))
  WHERE (m.deleted_at IS NULL);


--
-- Name: VIEW user_matters_view; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.user_matters_view IS 'Shows which matters each user can access and their role/access type';


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: acls acls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acls
    ADD CONSTRAINT acls_pkey PRIMARY KEY (id);


--
-- Name: audits audits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: document_meta document_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_meta
    ADD CONSTRAINT document_meta_pkey PRIMARY KEY (document_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: firms firms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.firms
    ADD CONSTRAINT firms_pkey PRIMARY KEY (id);


--
-- Name: matter_participants matter_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_participants
    ADD CONSTRAINT matter_participants_pkey PRIMARY KEY (matter_id, user_id);


--
-- Name: matter_shares matter_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_shares
    ADD CONSTRAINT matter_shares_pkey PRIMARY KEY (id);


--
-- Name: matter_teams matter_teams_matter_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_teams
    ADD CONSTRAINT matter_teams_matter_id_user_id_key UNIQUE (matter_id, user_id);


--
-- Name: matter_teams matter_teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_teams
    ADD CONSTRAINT matter_teams_pkey PRIMARY KEY (id);


--
-- Name: matters matters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matters
    ADD CONSTRAINT matters_pkey PRIMARY KEY (id);


--
-- Name: retention_classes retention_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retention_classes
    ADD CONSTRAINT retention_classes_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: search_queries search_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT search_queries_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (key);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_keycloak_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_keycloak_id_key UNIQUE (keycloak_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_acls_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_acls_expires ON public.acls USING btree (expires_at) WHERE (expires_at IS NOT NULL);


--
-- Name: idx_acls_principal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_acls_principal ON public.acls USING btree (principal_type, principal_id);


--
-- Name: idx_acls_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_acls_resource ON public.acls USING btree (resource_type, resource_id);


--
-- Name: idx_audits_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audits_action ON public.audits USING btree (action);


--
-- Name: idx_audits_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audits_created_at ON public.audits USING btree (created_at DESC);


--
-- Name: idx_audits_firm_resource; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audits_firm_resource ON public.audits USING btree (firm_id, resource_type, resource_id, created_at DESC);


--
-- Name: idx_audits_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audits_user ON public.audits USING btree (user_id, created_at DESC);


--
-- Name: idx_clients_firm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_firm_id ON public.clients USING btree (firm_id);


--
-- Name: idx_clients_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_name_trgm ON public.clients USING gin (name public.gin_trgm_ops);


--
-- Name: idx_document_meta_extracted_text; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_meta_extracted_text ON public.document_meta USING gin (to_tsvector('english'::regconfig, extracted_text));


--
-- Name: idx_document_meta_parties; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_meta_parties ON public.document_meta USING gin (parties);


--
-- Name: idx_document_meta_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_meta_tags ON public.document_meta USING gin (tags);


--
-- Name: idx_documents_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_client_id ON public.documents USING btree (client_id);


--
-- Name: idx_documents_content_sha256; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_content_sha256 ON public.documents USING btree (content_sha256);


--
-- Name: idx_documents_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_created_at ON public.documents USING btree (created_at DESC);


--
-- Name: idx_documents_firm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_firm_id ON public.documents USING btree (firm_id);


--
-- Name: idx_documents_legal_hold; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_legal_hold ON public.documents USING btree (legal_hold) WHERE (legal_hold = true);


--
-- Name: idx_documents_matter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_matter_id ON public.documents USING btree (matter_id);


--
-- Name: idx_matter_teams_matter_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matter_teams_matter_id ON public.matter_teams USING btree (matter_id);


--
-- Name: idx_matter_teams_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matter_teams_user_id ON public.matter_teams USING btree (user_id);


--
-- Name: idx_matters_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matters_client_id ON public.matters USING btree (client_id);


--
-- Name: idx_matters_firm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matters_firm_id ON public.matters USING btree (firm_id);


--
-- Name: idx_matters_responsible_attorney; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matters_responsible_attorney ON public.matters USING btree (responsible_attorney);


--
-- Name: idx_matters_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_matters_status ON public.matters USING btree (status);


--
-- Name: idx_teams_firm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_teams_firm_id ON public.teams USING btree (firm_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_firm_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_firm_id ON public.users USING btree (firm_id);


--
-- Name: idx_users_keycloak_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_keycloak_id ON public.users USING btree (keycloak_id);


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: document_meta update_document_meta_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_document_meta_updated_at BEFORE UPDATE ON public.document_meta FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: firms update_firms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_firms_updated_at BEFORE UPDATE ON public.firms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: matters update_matters_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_matters_updated_at BEFORE UPDATE ON public.matters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: retention_classes update_retention_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_retention_classes_updated_at BEFORE UPDATE ON public.retention_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: teams update_teams_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: acls acls_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acls
    ADD CONSTRAINT acls_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id);


--
-- Name: acls acls_revoked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acls
    ADD CONSTRAINT acls_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id);


--
-- Name: audits audits_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id);


--
-- Name: audits audits_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audits
    ADD CONSTRAINT audits_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: clients clients_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: document_meta document_meta_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_meta
    ADD CONSTRAINT document_meta_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: documents documents_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: documents documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: documents documents_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: documents documents_legal_hold_set_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_legal_hold_set_by_fkey FOREIGN KEY (legal_hold_set_by) REFERENCES public.users(id);


--
-- Name: documents documents_matter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_matter_id_fkey FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;


--
-- Name: documents documents_parent_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_parent_document_id_fkey FOREIGN KEY (parent_document_id) REFERENCES public.documents(id);


--
-- Name: documents documents_retention_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_retention_class_id_fkey FOREIGN KEY (retention_class_id) REFERENCES public.retention_classes(id);


--
-- Name: documents fk_documents_uploaded_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT fk_documents_uploaded_by_user FOREIGN KEY (uploaded_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: matter_participants matter_participants_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_participants
    ADD CONSTRAINT matter_participants_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id);


--
-- Name: matter_participants matter_participants_matter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_participants
    ADD CONSTRAINT matter_participants_matter_id_fkey FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;


--
-- Name: matter_participants matter_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_participants
    ADD CONSTRAINT matter_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: matter_shares matter_shares_matter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_shares
    ADD CONSTRAINT matter_shares_matter_id_fkey FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;


--
-- Name: matter_shares matter_shares_revoked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_shares
    ADD CONSTRAINT matter_shares_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.users(id);


--
-- Name: matter_shares matter_shares_shared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_shares
    ADD CONSTRAINT matter_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES public.users(id);


--
-- Name: matter_shares matter_shares_shared_with_firm_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_shares
    ADD CONSTRAINT matter_shares_shared_with_firm_fkey FOREIGN KEY (shared_with_firm) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: matter_teams matter_teams_added_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_teams
    ADD CONSTRAINT matter_teams_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: matter_teams matter_teams_matter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_teams
    ADD CONSTRAINT matter_teams_matter_id_fkey FOREIGN KEY (matter_id) REFERENCES public.matters(id) ON DELETE CASCADE;


--
-- Name: matter_teams matter_teams_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matter_teams
    ADD CONSTRAINT matter_teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: matters matters_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matters
    ADD CONSTRAINT matters_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: matters matters_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matters
    ADD CONSTRAINT matters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: matters matters_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matters
    ADD CONSTRAINT matters_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: matters matters_responsible_attorney_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.matters
    ADD CONSTRAINT matters_responsible_attorney_fkey FOREIGN KEY (responsible_attorney) REFERENCES public.users(id);


--
-- Name: retention_classes retention_classes_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retention_classes
    ADD CONSTRAINT retention_classes_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: search_queries search_queries_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT search_queries_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id);


--
-- Name: search_queries search_queries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.search_queries
    ADD CONSTRAINT search_queries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_firm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firm_id_fkey FOREIGN KEY (firm_id) REFERENCES public.firms(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ee2NvrfRzyWK4yaAZRfgCjG603VlFtrgplYCUPr97NCwVgg1UQSMMnTsIk4lsku

