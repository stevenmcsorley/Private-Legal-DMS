--
-- PostgreSQL database dump
--

\restrict aoVkbUIIfsRhmHgdzo2kpUaCjRngFLQb2RGrjP62lAMWDoc4ZJwKUpgRJDp1HON

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_event_entity; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.admin_event_entity (
    id character varying(36) NOT NULL,
    admin_event_time bigint,
    realm_id character varying(255),
    operation_type character varying(255),
    auth_realm_id character varying(255),
    auth_client_id character varying(255),
    auth_user_id character varying(255),
    ip_address character varying(255),
    resource_path character varying(2550),
    representation text,
    error character varying(255),
    resource_type character varying(64),
    details_json text
);


ALTER TABLE public.admin_event_entity OWNER TO keycloak;

--
-- Name: associated_policy; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.associated_policy (
    policy_id character varying(36) NOT NULL,
    associated_policy_id character varying(36) NOT NULL
);


ALTER TABLE public.associated_policy OWNER TO keycloak;

--
-- Name: authentication_execution; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.authentication_execution (
    id character varying(36) NOT NULL,
    alias character varying(255),
    authenticator character varying(36),
    realm_id character varying(36),
    flow_id character varying(36),
    requirement integer,
    priority integer,
    authenticator_flow boolean DEFAULT false NOT NULL,
    auth_flow_id character varying(36),
    auth_config character varying(36)
);


ALTER TABLE public.authentication_execution OWNER TO keycloak;

--
-- Name: authentication_flow; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.authentication_flow (
    id character varying(36) NOT NULL,
    alias character varying(255),
    description character varying(255),
    realm_id character varying(36),
    provider_id character varying(36) DEFAULT 'basic-flow'::character varying NOT NULL,
    top_level boolean DEFAULT false NOT NULL,
    built_in boolean DEFAULT false NOT NULL
);


ALTER TABLE public.authentication_flow OWNER TO keycloak;

--
-- Name: authenticator_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.authenticator_config (
    id character varying(36) NOT NULL,
    alias character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.authenticator_config OWNER TO keycloak;

--
-- Name: authenticator_config_entry; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.authenticator_config_entry (
    authenticator_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.authenticator_config_entry OWNER TO keycloak;

--
-- Name: broker_link; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.broker_link (
    identity_provider character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL,
    broker_user_id character varying(255),
    broker_username character varying(255),
    token text,
    user_id character varying(255) NOT NULL
);


ALTER TABLE public.broker_link OWNER TO keycloak;

--
-- Name: client; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client (
    id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    full_scope_allowed boolean DEFAULT false NOT NULL,
    client_id character varying(255),
    not_before integer,
    public_client boolean DEFAULT false NOT NULL,
    secret character varying(255),
    base_url character varying(255),
    bearer_only boolean DEFAULT false NOT NULL,
    management_url character varying(255),
    surrogate_auth_required boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    protocol character varying(255),
    node_rereg_timeout integer DEFAULT 0,
    frontchannel_logout boolean DEFAULT false NOT NULL,
    consent_required boolean DEFAULT false NOT NULL,
    name character varying(255),
    service_accounts_enabled boolean DEFAULT false NOT NULL,
    client_authenticator_type character varying(255),
    root_url character varying(255),
    description character varying(255),
    registration_token character varying(255),
    standard_flow_enabled boolean DEFAULT true NOT NULL,
    implicit_flow_enabled boolean DEFAULT false NOT NULL,
    direct_access_grants_enabled boolean DEFAULT false NOT NULL,
    always_display_in_console boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client OWNER TO keycloak;

--
-- Name: client_attributes; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_attributes (
    client_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.client_attributes OWNER TO keycloak;

--
-- Name: client_auth_flow_bindings; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_auth_flow_bindings (
    client_id character varying(36) NOT NULL,
    flow_id character varying(36),
    binding_name character varying(255) NOT NULL
);


ALTER TABLE public.client_auth_flow_bindings OWNER TO keycloak;

--
-- Name: client_initial_access; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_initial_access (
    id character varying(36) NOT NULL,
    realm_id character varying(36) NOT NULL,
    "timestamp" integer,
    expiration integer,
    count integer,
    remaining_count integer
);


ALTER TABLE public.client_initial_access OWNER TO keycloak;

--
-- Name: client_node_registrations; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_node_registrations (
    client_id character varying(36) NOT NULL,
    value integer,
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_node_registrations OWNER TO keycloak;

--
-- Name: client_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_scope (
    id character varying(36) NOT NULL,
    name character varying(255),
    realm_id character varying(36),
    description character varying(255),
    protocol character varying(255)
);


ALTER TABLE public.client_scope OWNER TO keycloak;

--
-- Name: client_scope_attributes; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_scope_attributes (
    scope_id character varying(36) NOT NULL,
    value character varying(2048),
    name character varying(255) NOT NULL
);


ALTER TABLE public.client_scope_attributes OWNER TO keycloak;

--
-- Name: client_scope_client; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_scope_client (
    client_id character varying(255) NOT NULL,
    scope_id character varying(255) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.client_scope_client OWNER TO keycloak;

--
-- Name: client_scope_role_mapping; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.client_scope_role_mapping (
    scope_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.client_scope_role_mapping OWNER TO keycloak;

--
-- Name: component; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.component (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_id character varying(36),
    provider_id character varying(36),
    provider_type character varying(255),
    realm_id character varying(36),
    sub_type character varying(255)
);


ALTER TABLE public.component OWNER TO keycloak;

--
-- Name: component_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.component_config (
    id character varying(36) NOT NULL,
    component_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.component_config OWNER TO keycloak;

--
-- Name: composite_role; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.composite_role (
    composite character varying(36) NOT NULL,
    child_role character varying(36) NOT NULL
);


ALTER TABLE public.composite_role OWNER TO keycloak;

--
-- Name: credential; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    user_id character varying(36),
    created_date bigint,
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.credential OWNER TO keycloak;

--
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO keycloak;

--
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO keycloak;

--
-- Name: default_client_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.default_client_scope (
    realm_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL,
    default_scope boolean DEFAULT false NOT NULL
);


ALTER TABLE public.default_client_scope OWNER TO keycloak;

--
-- Name: event_entity; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.event_entity (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    details_json character varying(2550),
    error character varying(255),
    ip_address character varying(255),
    realm_id character varying(255),
    session_id character varying(255),
    event_time bigint,
    type character varying(255),
    user_id character varying(255),
    details_json_long_value text
);


ALTER TABLE public.event_entity OWNER TO keycloak;

--
-- Name: fed_user_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_attribute (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    value character varying(2024),
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.fed_user_attribute OWNER TO keycloak;

--
-- Name: fed_user_consent; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.fed_user_consent OWNER TO keycloak;

--
-- Name: fed_user_consent_cl_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_consent_cl_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.fed_user_consent_cl_scope OWNER TO keycloak;

--
-- Name: fed_user_credential; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_credential (
    id character varying(36) NOT NULL,
    salt bytea,
    type character varying(255),
    created_date bigint,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36),
    user_label character varying(255),
    secret_data text,
    credential_data text,
    priority integer
);


ALTER TABLE public.fed_user_credential OWNER TO keycloak;

--
-- Name: fed_user_group_membership; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_group_membership OWNER TO keycloak;

--
-- Name: fed_user_required_action; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_required_action (
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_required_action OWNER TO keycloak;

--
-- Name: fed_user_role_mapping; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.fed_user_role_mapping (
    role_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    storage_provider_id character varying(36)
);


ALTER TABLE public.fed_user_role_mapping OWNER TO keycloak;

--
-- Name: federated_identity; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.federated_identity (
    identity_provider character varying(255) NOT NULL,
    realm_id character varying(36),
    federated_user_id character varying(255),
    federated_username character varying(255),
    token text,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_identity OWNER TO keycloak;

--
-- Name: federated_user; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.federated_user (
    id character varying(255) NOT NULL,
    storage_provider_id character varying(255),
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.federated_user OWNER TO keycloak;

--
-- Name: group_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.group_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_attribute OWNER TO keycloak;

--
-- Name: group_role_mapping; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.group_role_mapping (
    role_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.group_role_mapping OWNER TO keycloak;

--
-- Name: identity_provider; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.identity_provider (
    internal_id character varying(36) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    provider_alias character varying(255),
    provider_id character varying(255),
    store_token boolean DEFAULT false NOT NULL,
    authenticate_by_default boolean DEFAULT false NOT NULL,
    realm_id character varying(36),
    add_token_role boolean DEFAULT true NOT NULL,
    trust_email boolean DEFAULT false NOT NULL,
    first_broker_login_flow_id character varying(36),
    post_broker_login_flow_id character varying(36),
    provider_display_name character varying(255),
    link_only boolean DEFAULT false NOT NULL,
    organization_id character varying(255),
    hide_on_login boolean DEFAULT false
);


ALTER TABLE public.identity_provider OWNER TO keycloak;

--
-- Name: identity_provider_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.identity_provider_config (
    identity_provider_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.identity_provider_config OWNER TO keycloak;

--
-- Name: identity_provider_mapper; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.identity_provider_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    idp_alias character varying(255) NOT NULL,
    idp_mapper_name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.identity_provider_mapper OWNER TO keycloak;

--
-- Name: idp_mapper_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.idp_mapper_config (
    idp_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.idp_mapper_config OWNER TO keycloak;

--
-- Name: keycloak_group; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.keycloak_group (
    id character varying(36) NOT NULL,
    name character varying(255),
    parent_group character varying(36) NOT NULL,
    realm_id character varying(36),
    type integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.keycloak_group OWNER TO keycloak;

--
-- Name: keycloak_role; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.keycloak_role (
    id character varying(36) NOT NULL,
    client_realm_constraint character varying(255),
    client_role boolean DEFAULT false NOT NULL,
    description character varying(255),
    name character varying(255),
    realm_id character varying(255),
    client character varying(36),
    realm character varying(36)
);


ALTER TABLE public.keycloak_role OWNER TO keycloak;

--
-- Name: migration_model; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.migration_model (
    id character varying(36) NOT NULL,
    version character varying(36),
    update_time bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.migration_model OWNER TO keycloak;

--
-- Name: offline_client_session; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.offline_client_session (
    user_session_id character varying(36) NOT NULL,
    client_id character varying(255) NOT NULL,
    offline_flag character varying(4) NOT NULL,
    "timestamp" integer,
    data text,
    client_storage_provider character varying(36) DEFAULT 'local'::character varying NOT NULL,
    external_client_id character varying(255) DEFAULT 'local'::character varying NOT NULL,
    version integer DEFAULT 0
);


ALTER TABLE public.offline_client_session OWNER TO keycloak;

--
-- Name: offline_user_session; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.offline_user_session (
    user_session_id character varying(36) NOT NULL,
    user_id character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    created_on integer NOT NULL,
    offline_flag character varying(4) NOT NULL,
    data text,
    last_session_refresh integer DEFAULT 0 NOT NULL,
    broker_session_id character varying(1024),
    version integer DEFAULT 0
);


ALTER TABLE public.offline_user_session OWNER TO keycloak;

--
-- Name: org; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.org (
    id character varying(255) NOT NULL,
    enabled boolean NOT NULL,
    realm_id character varying(255) NOT NULL,
    group_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(4000),
    alias character varying(255) NOT NULL,
    redirect_url character varying(2048)
);


ALTER TABLE public.org OWNER TO keycloak;

--
-- Name: org_domain; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.org_domain (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    verified boolean NOT NULL,
    org_id character varying(255) NOT NULL
);


ALTER TABLE public.org_domain OWNER TO keycloak;

--
-- Name: policy_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.policy_config (
    policy_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value text
);


ALTER TABLE public.policy_config OWNER TO keycloak;

--
-- Name: protocol_mapper; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.protocol_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    protocol character varying(255) NOT NULL,
    protocol_mapper_name character varying(255) NOT NULL,
    client_id character varying(36),
    client_scope_id character varying(36)
);


ALTER TABLE public.protocol_mapper OWNER TO keycloak;

--
-- Name: protocol_mapper_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.protocol_mapper_config (
    protocol_mapper_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.protocol_mapper_config OWNER TO keycloak;

--
-- Name: realm; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm (
    id character varying(36) NOT NULL,
    access_code_lifespan integer,
    user_action_lifespan integer,
    access_token_lifespan integer,
    account_theme character varying(255),
    admin_theme character varying(255),
    email_theme character varying(255),
    enabled boolean DEFAULT false NOT NULL,
    events_enabled boolean DEFAULT false NOT NULL,
    events_expiration bigint,
    login_theme character varying(255),
    name character varying(255),
    not_before integer,
    password_policy character varying(2550),
    registration_allowed boolean DEFAULT false NOT NULL,
    remember_me boolean DEFAULT false NOT NULL,
    reset_password_allowed boolean DEFAULT false NOT NULL,
    social boolean DEFAULT false NOT NULL,
    ssl_required character varying(255),
    sso_idle_timeout integer,
    sso_max_lifespan integer,
    update_profile_on_soc_login boolean DEFAULT false NOT NULL,
    verify_email boolean DEFAULT false NOT NULL,
    master_admin_client character varying(36),
    login_lifespan integer,
    internationalization_enabled boolean DEFAULT false NOT NULL,
    default_locale character varying(255),
    reg_email_as_username boolean DEFAULT false NOT NULL,
    admin_events_enabled boolean DEFAULT false NOT NULL,
    admin_events_details_enabled boolean DEFAULT false NOT NULL,
    edit_username_allowed boolean DEFAULT false NOT NULL,
    otp_policy_counter integer DEFAULT 0,
    otp_policy_window integer DEFAULT 1,
    otp_policy_period integer DEFAULT 30,
    otp_policy_digits integer DEFAULT 6,
    otp_policy_alg character varying(36) DEFAULT 'HmacSHA1'::character varying,
    otp_policy_type character varying(36) DEFAULT 'totp'::character varying,
    browser_flow character varying(36),
    registration_flow character varying(36),
    direct_grant_flow character varying(36),
    reset_credentials_flow character varying(36),
    client_auth_flow character varying(36),
    offline_session_idle_timeout integer DEFAULT 0,
    revoke_refresh_token boolean DEFAULT false NOT NULL,
    access_token_life_implicit integer DEFAULT 0,
    login_with_email_allowed boolean DEFAULT true NOT NULL,
    duplicate_emails_allowed boolean DEFAULT false NOT NULL,
    docker_auth_flow character varying(36),
    refresh_token_max_reuse integer DEFAULT 0,
    allow_user_managed_access boolean DEFAULT false NOT NULL,
    sso_max_lifespan_remember_me integer DEFAULT 0 NOT NULL,
    sso_idle_timeout_remember_me integer DEFAULT 0 NOT NULL,
    default_role character varying(255)
);


ALTER TABLE public.realm OWNER TO keycloak;

--
-- Name: realm_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_attribute (
    name character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL,
    value text
);


ALTER TABLE public.realm_attribute OWNER TO keycloak;

--
-- Name: realm_default_groups; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_default_groups (
    realm_id character varying(36) NOT NULL,
    group_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_default_groups OWNER TO keycloak;

--
-- Name: realm_enabled_event_types; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_enabled_event_types (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_enabled_event_types OWNER TO keycloak;

--
-- Name: realm_events_listeners; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_events_listeners (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_events_listeners OWNER TO keycloak;

--
-- Name: realm_localizations; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_localizations (
    realm_id character varying(255) NOT NULL,
    locale character varying(255) NOT NULL,
    texts text NOT NULL
);


ALTER TABLE public.realm_localizations OWNER TO keycloak;

--
-- Name: realm_required_credential; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_required_credential (
    type character varying(255) NOT NULL,
    form_label character varying(255),
    input boolean DEFAULT false NOT NULL,
    secret boolean DEFAULT false NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.realm_required_credential OWNER TO keycloak;

--
-- Name: realm_smtp_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_smtp_config (
    realm_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.realm_smtp_config OWNER TO keycloak;

--
-- Name: realm_supported_locales; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.realm_supported_locales (
    realm_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.realm_supported_locales OWNER TO keycloak;

--
-- Name: redirect_uris; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.redirect_uris (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.redirect_uris OWNER TO keycloak;

--
-- Name: required_action_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.required_action_config (
    required_action_id character varying(36) NOT NULL,
    value text,
    name character varying(255) NOT NULL
);


ALTER TABLE public.required_action_config OWNER TO keycloak;

--
-- Name: required_action_provider; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.required_action_provider (
    id character varying(36) NOT NULL,
    alias character varying(255),
    name character varying(255),
    realm_id character varying(36),
    enabled boolean DEFAULT false NOT NULL,
    default_action boolean DEFAULT false NOT NULL,
    provider_id character varying(255),
    priority integer
);


ALTER TABLE public.required_action_provider OWNER TO keycloak;

--
-- Name: resource_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_attribute (
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255),
    resource_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_attribute OWNER TO keycloak;

--
-- Name: resource_policy; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_policy (
    resource_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_policy OWNER TO keycloak;

--
-- Name: resource_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_scope (
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.resource_scope OWNER TO keycloak;

--
-- Name: resource_server; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_server (
    id character varying(36) NOT NULL,
    allow_rs_remote_mgmt boolean DEFAULT false NOT NULL,
    policy_enforce_mode smallint NOT NULL,
    decision_strategy smallint DEFAULT 1 NOT NULL
);


ALTER TABLE public.resource_server OWNER TO keycloak;

--
-- Name: resource_server_perm_ticket; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_server_perm_ticket (
    id character varying(36) NOT NULL,
    owner character varying(255) NOT NULL,
    requester character varying(255) NOT NULL,
    created_timestamp bigint NOT NULL,
    granted_timestamp bigint,
    resource_id character varying(36) NOT NULL,
    scope_id character varying(36),
    resource_server_id character varying(36) NOT NULL,
    policy_id character varying(36)
);


ALTER TABLE public.resource_server_perm_ticket OWNER TO keycloak;

--
-- Name: resource_server_policy; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_server_policy (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    type character varying(255) NOT NULL,
    decision_strategy smallint,
    logic smallint,
    resource_server_id character varying(36) NOT NULL,
    owner character varying(255)
);


ALTER TABLE public.resource_server_policy OWNER TO keycloak;

--
-- Name: resource_server_resource; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_server_resource (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255),
    icon_uri character varying(255),
    owner character varying(255) NOT NULL,
    resource_server_id character varying(36) NOT NULL,
    owner_managed_access boolean DEFAULT false NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_resource OWNER TO keycloak;

--
-- Name: resource_server_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_server_scope (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    icon_uri character varying(255),
    resource_server_id character varying(36) NOT NULL,
    display_name character varying(255)
);


ALTER TABLE public.resource_server_scope OWNER TO keycloak;

--
-- Name: resource_uris; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.resource_uris (
    resource_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.resource_uris OWNER TO keycloak;

--
-- Name: revoked_token; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.revoked_token (
    id character varying(255) NOT NULL,
    expire bigint NOT NULL
);


ALTER TABLE public.revoked_token OWNER TO keycloak;

--
-- Name: role_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.role_attribute (
    id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    value character varying(255)
);


ALTER TABLE public.role_attribute OWNER TO keycloak;

--
-- Name: scope_mapping; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.scope_mapping (
    client_id character varying(36) NOT NULL,
    role_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_mapping OWNER TO keycloak;

--
-- Name: scope_policy; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.scope_policy (
    scope_id character varying(36) NOT NULL,
    policy_id character varying(36) NOT NULL
);


ALTER TABLE public.scope_policy OWNER TO keycloak;

--
-- Name: user_attribute; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_attribute (
    name character varying(255) NOT NULL,
    value character varying(255),
    user_id character varying(36) NOT NULL,
    id character varying(36) DEFAULT 'sybase-needs-something-here'::character varying NOT NULL,
    long_value_hash bytea,
    long_value_hash_lower_case bytea,
    long_value text
);


ALTER TABLE public.user_attribute OWNER TO keycloak;

--
-- Name: user_consent; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_consent (
    id character varying(36) NOT NULL,
    client_id character varying(255),
    user_id character varying(36) NOT NULL,
    created_date bigint,
    last_updated_date bigint,
    client_storage_provider character varying(36),
    external_client_id character varying(255)
);


ALTER TABLE public.user_consent OWNER TO keycloak;

--
-- Name: user_consent_client_scope; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_consent_client_scope (
    user_consent_id character varying(36) NOT NULL,
    scope_id character varying(36) NOT NULL
);


ALTER TABLE public.user_consent_client_scope OWNER TO keycloak;

--
-- Name: user_entity; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_entity (
    id character varying(36) NOT NULL,
    email character varying(255),
    email_constraint character varying(255),
    email_verified boolean DEFAULT false NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    federation_link character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    realm_id character varying(255),
    username character varying(255),
    created_timestamp bigint,
    service_account_client_link character varying(255),
    not_before integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_entity OWNER TO keycloak;

--
-- Name: user_federation_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_federation_config (
    user_federation_provider_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_config OWNER TO keycloak;

--
-- Name: user_federation_mapper; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_federation_mapper (
    id character varying(36) NOT NULL,
    name character varying(255) NOT NULL,
    federation_provider_id character varying(36) NOT NULL,
    federation_mapper_type character varying(255) NOT NULL,
    realm_id character varying(36) NOT NULL
);


ALTER TABLE public.user_federation_mapper OWNER TO keycloak;

--
-- Name: user_federation_mapper_config; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_federation_mapper_config (
    user_federation_mapper_id character varying(36) NOT NULL,
    value character varying(255),
    name character varying(255) NOT NULL
);


ALTER TABLE public.user_federation_mapper_config OWNER TO keycloak;

--
-- Name: user_federation_provider; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_federation_provider (
    id character varying(36) NOT NULL,
    changed_sync_period integer,
    display_name character varying(255),
    full_sync_period integer,
    last_sync integer,
    priority integer,
    provider_name character varying(255),
    realm_id character varying(36)
);


ALTER TABLE public.user_federation_provider OWNER TO keycloak;

--
-- Name: user_group_membership; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_group_membership (
    group_id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    membership_type character varying(255) NOT NULL
);


ALTER TABLE public.user_group_membership OWNER TO keycloak;

--
-- Name: user_required_action; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_required_action (
    user_id character varying(36) NOT NULL,
    required_action character varying(255) DEFAULT ' '::character varying NOT NULL
);


ALTER TABLE public.user_required_action OWNER TO keycloak;

--
-- Name: user_role_mapping; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.user_role_mapping (
    role_id character varying(255) NOT NULL,
    user_id character varying(36) NOT NULL
);


ALTER TABLE public.user_role_mapping OWNER TO keycloak;

--
-- Name: username_login_failure; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.username_login_failure (
    realm_id character varying(36) NOT NULL,
    username character varying(255) NOT NULL,
    failed_login_not_before integer,
    last_failure bigint,
    last_ip_failure character varying(255),
    num_failures integer
);


ALTER TABLE public.username_login_failure OWNER TO keycloak;

--
-- Name: web_origins; Type: TABLE; Schema: public; Owner: keycloak
--

CREATE TABLE public.web_origins (
    client_id character varying(36) NOT NULL,
    value character varying(255) NOT NULL
);


ALTER TABLE public.web_origins OWNER TO keycloak;

--
-- Data for Name: admin_event_entity; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.admin_event_entity (id, admin_event_time, realm_id, operation_type, auth_realm_id, auth_client_id, auth_user_id, ip_address, resource_path, representation, error, resource_type, details_json) FROM stdin;
\.


--
-- Data for Name: associated_policy; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.associated_policy (policy_id, associated_policy_id) FROM stdin;
\.


--
-- Data for Name: authentication_execution; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.authentication_execution (id, alias, authenticator, realm_id, flow_id, requirement, priority, authenticator_flow, auth_flow_id, auth_config) FROM stdin;
18fff9d0-1dfa-4415-9af3-3f13b88ae101	\N	auth-cookie	79df126b-a967-4d6d-a704-427910aca988	9068944e-9c25-4442-a908-14e7cf9bb08c	2	10	f	\N	\N
d3946527-d4e7-41bd-b8c4-a6bc1ffe5368	\N	auth-spnego	79df126b-a967-4d6d-a704-427910aca988	9068944e-9c25-4442-a908-14e7cf9bb08c	3	20	f	\N	\N
06d0ce54-c3e7-44c3-b037-b5e2958f0328	\N	identity-provider-redirector	79df126b-a967-4d6d-a704-427910aca988	9068944e-9c25-4442-a908-14e7cf9bb08c	2	25	f	\N	\N
79c6d761-cac4-4570-8448-3292b6541c04	\N	\N	79df126b-a967-4d6d-a704-427910aca988	9068944e-9c25-4442-a908-14e7cf9bb08c	2	30	t	0c999b49-51eb-4d1b-940d-66a3dfc35057	\N
f786ecfc-28eb-4dc0-ba94-a7925c4cdc15	\N	auth-username-password-form	79df126b-a967-4d6d-a704-427910aca988	0c999b49-51eb-4d1b-940d-66a3dfc35057	0	10	f	\N	\N
4c9ac333-cac6-48ab-8d6c-3aa3b8945103	\N	\N	79df126b-a967-4d6d-a704-427910aca988	0c999b49-51eb-4d1b-940d-66a3dfc35057	1	20	t	3f057cc5-4ce5-40cc-8b8e-be948f85d54f	\N
c046b035-e985-4334-acc5-1bcaf6d8afab	\N	conditional-user-configured	79df126b-a967-4d6d-a704-427910aca988	3f057cc5-4ce5-40cc-8b8e-be948f85d54f	0	10	f	\N	\N
75c0cdc0-d62c-46f5-bf0a-912d521d8717	\N	auth-otp-form	79df126b-a967-4d6d-a704-427910aca988	3f057cc5-4ce5-40cc-8b8e-be948f85d54f	0	20	f	\N	\N
12c6ccf6-35ef-4341-961e-5f39b57d5566	\N	direct-grant-validate-username	79df126b-a967-4d6d-a704-427910aca988	dc2d33b2-0311-4a65-b5be-afac0fc7a406	0	10	f	\N	\N
fb06a185-69ea-4fb6-8bef-294be95cf302	\N	direct-grant-validate-password	79df126b-a967-4d6d-a704-427910aca988	dc2d33b2-0311-4a65-b5be-afac0fc7a406	0	20	f	\N	\N
66657a10-b81c-40e7-87d5-ef82f14d6f28	\N	\N	79df126b-a967-4d6d-a704-427910aca988	dc2d33b2-0311-4a65-b5be-afac0fc7a406	1	30	t	e9bb3306-42e9-4813-874f-596e8207c4e6	\N
daa9b5e3-f0e2-4ed8-8721-f73c04933409	\N	conditional-user-configured	79df126b-a967-4d6d-a704-427910aca988	e9bb3306-42e9-4813-874f-596e8207c4e6	0	10	f	\N	\N
8de0a1a8-6ba6-4aed-aa19-79e407377e63	\N	direct-grant-validate-otp	79df126b-a967-4d6d-a704-427910aca988	e9bb3306-42e9-4813-874f-596e8207c4e6	0	20	f	\N	\N
042ebdfa-8b9b-4442-b76e-182cf0c052c5	\N	registration-page-form	79df126b-a967-4d6d-a704-427910aca988	18cc8c75-e50e-4f9b-b55f-427ff18b8bf7	0	10	t	25cd6c4b-602e-4b8e-8f01-79a1f768db63	\N
b4e0cc5c-5416-45ae-9a42-36a10395df91	\N	registration-user-creation	79df126b-a967-4d6d-a704-427910aca988	25cd6c4b-602e-4b8e-8f01-79a1f768db63	0	20	f	\N	\N
795fe17f-1837-4421-a432-f3bfca421079	\N	registration-password-action	79df126b-a967-4d6d-a704-427910aca988	25cd6c4b-602e-4b8e-8f01-79a1f768db63	0	50	f	\N	\N
bc9e3b12-fdb9-4404-b30c-436f4f025c1e	\N	registration-recaptcha-action	79df126b-a967-4d6d-a704-427910aca988	25cd6c4b-602e-4b8e-8f01-79a1f768db63	3	60	f	\N	\N
8f43e430-2a9b-4d66-ae61-0a3fbd411188	\N	registration-terms-and-conditions	79df126b-a967-4d6d-a704-427910aca988	25cd6c4b-602e-4b8e-8f01-79a1f768db63	3	70	f	\N	\N
d18a0cae-148b-469f-aa49-3777931723b0	\N	reset-credentials-choose-user	79df126b-a967-4d6d-a704-427910aca988	aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	0	10	f	\N	\N
3476d88c-b533-49d0-972c-4e38730af191	\N	reset-credential-email	79df126b-a967-4d6d-a704-427910aca988	aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	0	20	f	\N	\N
b39d1051-9a2f-4df1-abba-b81b8a91d786	\N	reset-password	79df126b-a967-4d6d-a704-427910aca988	aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	0	30	f	\N	\N
b7ef3373-3e35-4358-a111-573ac4d9ed6d	\N	\N	79df126b-a967-4d6d-a704-427910aca988	aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	1	40	t	8c668945-4826-48d5-8096-78c0e14a6c5d	\N
5c4144b8-596a-4537-8446-6a852a52c1da	\N	conditional-user-configured	79df126b-a967-4d6d-a704-427910aca988	8c668945-4826-48d5-8096-78c0e14a6c5d	0	10	f	\N	\N
81d117b5-3304-4546-bd08-54623331355d	\N	reset-otp	79df126b-a967-4d6d-a704-427910aca988	8c668945-4826-48d5-8096-78c0e14a6c5d	0	20	f	\N	\N
09fdaa14-f2a9-46ef-a0b0-044e63491eb3	\N	client-secret	79df126b-a967-4d6d-a704-427910aca988	0cdbf224-6ded-4ba5-8db2-df4e4df557dc	2	10	f	\N	\N
756c329b-67a1-4380-9fe7-ae122b38740b	\N	client-jwt	79df126b-a967-4d6d-a704-427910aca988	0cdbf224-6ded-4ba5-8db2-df4e4df557dc	2	20	f	\N	\N
6f2b68a8-d639-4f66-9c6a-1682b99867e0	\N	client-secret-jwt	79df126b-a967-4d6d-a704-427910aca988	0cdbf224-6ded-4ba5-8db2-df4e4df557dc	2	30	f	\N	\N
591a8681-c959-4d3a-a047-7f22f5e43fba	\N	client-x509	79df126b-a967-4d6d-a704-427910aca988	0cdbf224-6ded-4ba5-8db2-df4e4df557dc	2	40	f	\N	\N
2977d267-023d-4968-92bf-2ac38e5360d4	\N	idp-review-profile	79df126b-a967-4d6d-a704-427910aca988	ac87d905-8c48-4919-b310-6f1c36b8cf80	0	10	f	\N	c9ba18c4-ad43-4fb5-91a6-806333f5b877
28b6be6f-c11e-463b-8117-e98231fb1d13	\N	\N	79df126b-a967-4d6d-a704-427910aca988	ac87d905-8c48-4919-b310-6f1c36b8cf80	0	20	t	4c23aaa3-54c3-4344-93da-ac72b80c8d00	\N
9845a1c1-b79e-429c-a237-3a6bc511a105	\N	idp-create-user-if-unique	79df126b-a967-4d6d-a704-427910aca988	4c23aaa3-54c3-4344-93da-ac72b80c8d00	2	10	f	\N	d691d91f-8ae6-4841-925e-50ee65c1b048
15a7c26b-8661-4fb8-b431-2f98fb6d6426	\N	\N	79df126b-a967-4d6d-a704-427910aca988	4c23aaa3-54c3-4344-93da-ac72b80c8d00	2	20	t	72d76c2e-959c-4da7-9214-d290ac4c0f49	\N
f8770b70-7a69-447f-a29a-f48177f645fa	\N	idp-confirm-link	79df126b-a967-4d6d-a704-427910aca988	72d76c2e-959c-4da7-9214-d290ac4c0f49	0	10	f	\N	\N
0f49dd37-d65c-4588-9e12-4d4eaac47324	\N	\N	79df126b-a967-4d6d-a704-427910aca988	72d76c2e-959c-4da7-9214-d290ac4c0f49	0	20	t	bae5c77e-4f6d-4ec1-a534-d3b9a4fe779c	\N
2c136ba4-2bff-474f-a102-cd56292bf2ac	\N	idp-email-verification	79df126b-a967-4d6d-a704-427910aca988	bae5c77e-4f6d-4ec1-a534-d3b9a4fe779c	2	10	f	\N	\N
4cf3e501-fb58-4523-bbd8-523b0c75b331	\N	\N	79df126b-a967-4d6d-a704-427910aca988	bae5c77e-4f6d-4ec1-a534-d3b9a4fe779c	2	20	t	417d395e-881e-4906-84ab-59ed9b836b88	\N
b2f7698d-1d7e-4103-b759-9a73a5a59878	\N	idp-username-password-form	79df126b-a967-4d6d-a704-427910aca988	417d395e-881e-4906-84ab-59ed9b836b88	0	10	f	\N	\N
dbd330fe-9d38-4695-bb70-5cd8eea0d2d6	\N	\N	79df126b-a967-4d6d-a704-427910aca988	417d395e-881e-4906-84ab-59ed9b836b88	1	20	t	d0c03aa1-a194-478e-97e7-6f7f2afb3600	\N
c04e427b-3702-4a89-aab3-7fa21a27ad3f	\N	conditional-user-configured	79df126b-a967-4d6d-a704-427910aca988	d0c03aa1-a194-478e-97e7-6f7f2afb3600	0	10	f	\N	\N
9d528a4a-435c-46f8-a97f-acceddb8c8f1	\N	auth-otp-form	79df126b-a967-4d6d-a704-427910aca988	d0c03aa1-a194-478e-97e7-6f7f2afb3600	0	20	f	\N	\N
7632f3cf-c746-48e0-83c7-248b28c29b65	\N	http-basic-authenticator	79df126b-a967-4d6d-a704-427910aca988	44b99a80-17f2-4cc7-8357-a9f8d6c09257	0	10	f	\N	\N
aec3fb7b-bd68-4b0a-9e9c-e5a7c6d15b4f	\N	docker-http-basic-authenticator	79df126b-a967-4d6d-a704-427910aca988	ba7d6049-57e6-4023-84f8-2da1390acd38	0	10	f	\N	\N
5971deeb-a649-4700-964b-d86194aeb54a	\N	auth-cookie	dms	0bc165ee-a1af-48ae-affe-857f31686698	2	10	f	\N	\N
a530a461-facc-4693-837f-6b8020fddffe	\N	auth-spnego	dms	0bc165ee-a1af-48ae-affe-857f31686698	3	20	f	\N	\N
bf787728-4d08-41a8-964f-33f0d0334c00	\N	identity-provider-redirector	dms	0bc165ee-a1af-48ae-affe-857f31686698	2	25	f	\N	\N
fa2618f4-34dc-4440-a710-742c0eaf8bb8	\N	\N	dms	0bc165ee-a1af-48ae-affe-857f31686698	2	30	t	4803943a-3b89-4d94-b98f-b3e5db1cb6db	\N
3ff31f01-3f93-4963-a3ec-60c26d81a991	\N	auth-username-password-form	dms	4803943a-3b89-4d94-b98f-b3e5db1cb6db	0	10	f	\N	\N
cfd1fb8e-3f0a-4859-9134-68b1450ab1b8	\N	\N	dms	4803943a-3b89-4d94-b98f-b3e5db1cb6db	1	20	t	0b745d5b-b4e8-4787-8573-9bb60690a216	\N
8065dc1d-75dc-4e80-9b12-8317cd00f74b	\N	conditional-user-configured	dms	0b745d5b-b4e8-4787-8573-9bb60690a216	0	10	f	\N	\N
ef5f3f32-8994-45cc-90a4-3d3e6e313b33	\N	auth-otp-form	dms	0b745d5b-b4e8-4787-8573-9bb60690a216	0	20	f	\N	\N
c0b36240-2188-4d0e-8fcd-d7ea4aa22f90	\N	\N	dms	0bc165ee-a1af-48ae-affe-857f31686698	2	26	t	3835d15b-fdb3-4a2a-b3de-b3690645fbc1	\N
3eb63289-7bae-4550-8c59-312cb1675560	\N	\N	dms	3835d15b-fdb3-4a2a-b3de-b3690645fbc1	1	10	t	c9c4e5e2-89e2-461e-a1b5-b6afac735802	\N
0f55ce32-cb00-49aa-b949-9be5d001c23b	\N	conditional-user-configured	dms	c9c4e5e2-89e2-461e-a1b5-b6afac735802	0	10	f	\N	\N
4d0d8717-91ef-46a5-987e-e1f13289ef18	\N	organization	dms	c9c4e5e2-89e2-461e-a1b5-b6afac735802	2	20	f	\N	\N
9d72146b-1505-4790-a5ce-481a8d72a575	\N	direct-grant-validate-username	dms	c9a4f003-c89b-42a0-bcd1-e38ae86bbdf1	0	10	f	\N	\N
c181da82-0084-4d6f-815f-1d2235128276	\N	direct-grant-validate-password	dms	c9a4f003-c89b-42a0-bcd1-e38ae86bbdf1	0	20	f	\N	\N
075a99fe-f31e-4ac5-93f2-9566a84803ee	\N	\N	dms	c9a4f003-c89b-42a0-bcd1-e38ae86bbdf1	1	30	t	0b632f68-09bd-45ca-bcb1-ef52d00f2bbf	\N
e48b6598-e304-4979-acbe-9368ec196106	\N	conditional-user-configured	dms	0b632f68-09bd-45ca-bcb1-ef52d00f2bbf	0	10	f	\N	\N
5af0fa9c-5b89-4c17-b1c4-0803f2e8c80d	\N	direct-grant-validate-otp	dms	0b632f68-09bd-45ca-bcb1-ef52d00f2bbf	0	20	f	\N	\N
0e38ac26-596b-4d85-a944-6a5797424b50	\N	registration-page-form	dms	f4c90da6-d727-4594-b46b-9098af0403a8	0	10	t	d504fda0-e21a-42ef-af61-c940dd431400	\N
620801a8-9128-427f-a779-c4751345245a	\N	registration-user-creation	dms	d504fda0-e21a-42ef-af61-c940dd431400	0	20	f	\N	\N
fcc46be7-7f51-4e38-93b0-33123684c1e0	\N	registration-password-action	dms	d504fda0-e21a-42ef-af61-c940dd431400	0	50	f	\N	\N
9b71a17c-70c5-45b6-a00e-6a12f753e26a	\N	registration-recaptcha-action	dms	d504fda0-e21a-42ef-af61-c940dd431400	3	60	f	\N	\N
8b10bc06-e338-47f2-931a-6ba247291bbd	\N	registration-terms-and-conditions	dms	d504fda0-e21a-42ef-af61-c940dd431400	3	70	f	\N	\N
1d6fe6cc-001f-41ab-a94a-ddf00f0f3cbc	\N	reset-credentials-choose-user	dms	4008b58d-bb53-44b7-a0f0-2b65ddc77447	0	10	f	\N	\N
a1333779-e0a9-4886-a154-b5b61027a3c4	\N	reset-credential-email	dms	4008b58d-bb53-44b7-a0f0-2b65ddc77447	0	20	f	\N	\N
b017d095-ec58-4fad-82df-a3b52b7237e3	\N	reset-password	dms	4008b58d-bb53-44b7-a0f0-2b65ddc77447	0	30	f	\N	\N
78aed63a-13a4-49d0-b481-af5ed01b637b	\N	\N	dms	4008b58d-bb53-44b7-a0f0-2b65ddc77447	1	40	t	9752fa45-c0ec-4928-ae34-d743f93ef72e	\N
6feb068e-3aaa-4ffb-90dc-6f7aaf862bbb	\N	conditional-user-configured	dms	9752fa45-c0ec-4928-ae34-d743f93ef72e	0	10	f	\N	\N
c24c2cb3-7b40-4ef2-8fde-1be2a934bc7f	\N	reset-otp	dms	9752fa45-c0ec-4928-ae34-d743f93ef72e	0	20	f	\N	\N
32b613df-43d5-4db2-b9cc-e2ccc7cf61d5	\N	client-secret	dms	341dd4f3-fcfe-441e-92a5-546204b26050	2	10	f	\N	\N
1db271fe-bec8-46fa-861e-a643821e9c8e	\N	client-jwt	dms	341dd4f3-fcfe-441e-92a5-546204b26050	2	20	f	\N	\N
a697b351-4703-4e67-92ee-eea0f8cb8a99	\N	client-secret-jwt	dms	341dd4f3-fcfe-441e-92a5-546204b26050	2	30	f	\N	\N
b32766bf-1c98-4eb8-8928-619e2e5995b8	\N	client-x509	dms	341dd4f3-fcfe-441e-92a5-546204b26050	2	40	f	\N	\N
8afbbb60-8c52-4f96-86e6-fa9c2becabe3	\N	idp-review-profile	dms	b4093874-65bc-43ce-9c83-0ef4e28923d3	0	10	f	\N	68907654-834b-4428-b300-08f1f8284898
a27fb2ee-5f63-420f-851d-5217f5c65209	\N	\N	dms	b4093874-65bc-43ce-9c83-0ef4e28923d3	0	20	t	91fb1412-d28b-4103-955b-e31eea01e2cc	\N
54460c9c-c9a2-457f-a670-ab72fe989517	\N	idp-create-user-if-unique	dms	91fb1412-d28b-4103-955b-e31eea01e2cc	2	10	f	\N	20901bb1-6862-46e7-8b61-f9feb2af9cdb
7209cdcc-0fb5-4460-99ab-8b6a6bd19b8b	\N	\N	dms	91fb1412-d28b-4103-955b-e31eea01e2cc	2	20	t	e801312e-3c24-4c11-8557-d2f151af36c9	\N
f993e969-a09d-4651-b257-53bb5b0b5e7e	\N	idp-confirm-link	dms	e801312e-3c24-4c11-8557-d2f151af36c9	0	10	f	\N	\N
6acb8fa8-c62f-4fdf-aa2c-b27784f79083	\N	\N	dms	e801312e-3c24-4c11-8557-d2f151af36c9	0	20	t	22e88552-1b96-475b-be9b-4a0870faf34d	\N
e7810fdb-6087-4058-9d5d-ecdb901019a4	\N	idp-email-verification	dms	22e88552-1b96-475b-be9b-4a0870faf34d	2	10	f	\N	\N
b5cd14e8-e139-464a-8673-d61a29ce1e97	\N	\N	dms	22e88552-1b96-475b-be9b-4a0870faf34d	2	20	t	05ad16ae-be80-4e5e-b4c8-82809eaeb0d9	\N
025e61cc-e997-4b23-b03f-83208f8ac113	\N	idp-username-password-form	dms	05ad16ae-be80-4e5e-b4c8-82809eaeb0d9	0	10	f	\N	\N
0758bc17-c5de-4534-b8be-a1b06d5f03e9	\N	\N	dms	05ad16ae-be80-4e5e-b4c8-82809eaeb0d9	1	20	t	ccb75321-e09a-49e6-b4a0-9f6056ed10c6	\N
5542c4c9-cf60-43e4-ac56-c3619547f0ed	\N	conditional-user-configured	dms	ccb75321-e09a-49e6-b4a0-9f6056ed10c6	0	10	f	\N	\N
d894ce26-61ed-4aca-aeae-3c1f8f09dbe4	\N	auth-otp-form	dms	ccb75321-e09a-49e6-b4a0-9f6056ed10c6	0	20	f	\N	\N
b91c6936-a25c-4b3a-b570-431e0861a40e	\N	\N	dms	b4093874-65bc-43ce-9c83-0ef4e28923d3	1	50	t	1fcb07fc-7ebc-4dc5-98ba-7a00352e2af7	\N
3a175a64-1aff-4757-b2cb-d1ed3b2dd8ae	\N	conditional-user-configured	dms	1fcb07fc-7ebc-4dc5-98ba-7a00352e2af7	0	10	f	\N	\N
e8e5fe95-7380-46d0-90e8-9a5c37f1a20b	\N	idp-add-organization-member	dms	1fcb07fc-7ebc-4dc5-98ba-7a00352e2af7	0	20	f	\N	\N
83ca2ac4-18ef-4356-946f-bf0f1d0ba35d	\N	http-basic-authenticator	dms	9b55cf9c-f906-4ff5-be96-ecd3ce5a349f	0	10	f	\N	\N
e0fa676f-4581-4667-8f45-44776b31ca8e	\N	docker-http-basic-authenticator	dms	4392e859-5c95-4e24-96d6-964eaeb87fea	0	10	f	\N	\N
\.


--
-- Data for Name: authentication_flow; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.authentication_flow (id, alias, description, realm_id, provider_id, top_level, built_in) FROM stdin;
9068944e-9c25-4442-a908-14e7cf9bb08c	browser	Browser based authentication	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
0c999b49-51eb-4d1b-940d-66a3dfc35057	forms	Username, password, otp and other auth forms.	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
3f057cc5-4ce5-40cc-8b8e-be948f85d54f	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
dc2d33b2-0311-4a65-b5be-afac0fc7a406	direct grant	OpenID Connect Resource Owner Grant	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
e9bb3306-42e9-4813-874f-596e8207c4e6	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
18cc8c75-e50e-4f9b-b55f-427ff18b8bf7	registration	Registration flow	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
25cd6c4b-602e-4b8e-8f01-79a1f768db63	registration form	Registration form	79df126b-a967-4d6d-a704-427910aca988	form-flow	f	t
aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	reset credentials	Reset credentials for a user if they forgot their password or something	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
8c668945-4826-48d5-8096-78c0e14a6c5d	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
0cdbf224-6ded-4ba5-8db2-df4e4df557dc	clients	Base authentication for clients	79df126b-a967-4d6d-a704-427910aca988	client-flow	t	t
ac87d905-8c48-4919-b310-6f1c36b8cf80	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
4c23aaa3-54c3-4344-93da-ac72b80c8d00	User creation or linking	Flow for the existing/non-existing user alternatives	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
72d76c2e-959c-4da7-9214-d290ac4c0f49	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
bae5c77e-4f6d-4ec1-a534-d3b9a4fe779c	Account verification options	Method with which to verity the existing account	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
417d395e-881e-4906-84ab-59ed9b836b88	Verify Existing Account by Re-authentication	Reauthentication of existing account	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
d0c03aa1-a194-478e-97e7-6f7f2afb3600	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	79df126b-a967-4d6d-a704-427910aca988	basic-flow	f	t
44b99a80-17f2-4cc7-8357-a9f8d6c09257	saml ecp	SAML ECP Profile Authentication Flow	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
ba7d6049-57e6-4023-84f8-2da1390acd38	docker auth	Used by Docker clients to authenticate against the IDP	79df126b-a967-4d6d-a704-427910aca988	basic-flow	t	t
0bc165ee-a1af-48ae-affe-857f31686698	browser	Browser based authentication	dms	basic-flow	t	t
4803943a-3b89-4d94-b98f-b3e5db1cb6db	forms	Username, password, otp and other auth forms.	dms	basic-flow	f	t
0b745d5b-b4e8-4787-8573-9bb60690a216	Browser - Conditional OTP	Flow to determine if the OTP is required for the authentication	dms	basic-flow	f	t
3835d15b-fdb3-4a2a-b3de-b3690645fbc1	Organization	\N	dms	basic-flow	f	t
c9c4e5e2-89e2-461e-a1b5-b6afac735802	Browser - Conditional Organization	Flow to determine if the organization identity-first login is to be used	dms	basic-flow	f	t
c9a4f003-c89b-42a0-bcd1-e38ae86bbdf1	direct grant	OpenID Connect Resource Owner Grant	dms	basic-flow	t	t
0b632f68-09bd-45ca-bcb1-ef52d00f2bbf	Direct Grant - Conditional OTP	Flow to determine if the OTP is required for the authentication	dms	basic-flow	f	t
f4c90da6-d727-4594-b46b-9098af0403a8	registration	Registration flow	dms	basic-flow	t	t
d504fda0-e21a-42ef-af61-c940dd431400	registration form	Registration form	dms	form-flow	f	t
4008b58d-bb53-44b7-a0f0-2b65ddc77447	reset credentials	Reset credentials for a user if they forgot their password or something	dms	basic-flow	t	t
9752fa45-c0ec-4928-ae34-d743f93ef72e	Reset - Conditional OTP	Flow to determine if the OTP should be reset or not. Set to REQUIRED to force.	dms	basic-flow	f	t
341dd4f3-fcfe-441e-92a5-546204b26050	clients	Base authentication for clients	dms	client-flow	t	t
b4093874-65bc-43ce-9c83-0ef4e28923d3	first broker login	Actions taken after first broker login with identity provider account, which is not yet linked to any Keycloak account	dms	basic-flow	t	t
91fb1412-d28b-4103-955b-e31eea01e2cc	User creation or linking	Flow for the existing/non-existing user alternatives	dms	basic-flow	f	t
e801312e-3c24-4c11-8557-d2f151af36c9	Handle Existing Account	Handle what to do if there is existing account with same email/username like authenticated identity provider	dms	basic-flow	f	t
22e88552-1b96-475b-be9b-4a0870faf34d	Account verification options	Method with which to verity the existing account	dms	basic-flow	f	t
05ad16ae-be80-4e5e-b4c8-82809eaeb0d9	Verify Existing Account by Re-authentication	Reauthentication of existing account	dms	basic-flow	f	t
ccb75321-e09a-49e6-b4a0-9f6056ed10c6	First broker login - Conditional OTP	Flow to determine if the OTP is required for the authentication	dms	basic-flow	f	t
1fcb07fc-7ebc-4dc5-98ba-7a00352e2af7	First Broker Login - Conditional Organization	Flow to determine if the authenticator that adds organization members is to be used	dms	basic-flow	f	t
9b55cf9c-f906-4ff5-be96-ecd3ce5a349f	saml ecp	SAML ECP Profile Authentication Flow	dms	basic-flow	t	t
4392e859-5c95-4e24-96d6-964eaeb87fea	docker auth	Used by Docker clients to authenticate against the IDP	dms	basic-flow	t	t
\.


--
-- Data for Name: authenticator_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.authenticator_config (id, alias, realm_id) FROM stdin;
c9ba18c4-ad43-4fb5-91a6-806333f5b877	review profile config	79df126b-a967-4d6d-a704-427910aca988
d691d91f-8ae6-4841-925e-50ee65c1b048	create unique user config	79df126b-a967-4d6d-a704-427910aca988
68907654-834b-4428-b300-08f1f8284898	review profile config	dms
20901bb1-6862-46e7-8b61-f9feb2af9cdb	create unique user config	dms
\.


--
-- Data for Name: authenticator_config_entry; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.authenticator_config_entry (authenticator_id, value, name) FROM stdin;
c9ba18c4-ad43-4fb5-91a6-806333f5b877	missing	update.profile.on.first.login
d691d91f-8ae6-4841-925e-50ee65c1b048	false	require.password.update.after.registration
20901bb1-6862-46e7-8b61-f9feb2af9cdb	false	require.password.update.after.registration
68907654-834b-4428-b300-08f1f8284898	missing	update.profile.on.first.login
\.


--
-- Data for Name: broker_link; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.broker_link (identity_provider, storage_provider_id, realm_id, broker_user_id, broker_username, token, user_id) FROM stdin;
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client (id, enabled, full_scope_allowed, client_id, not_before, public_client, secret, base_url, bearer_only, management_url, surrogate_auth_required, realm_id, protocol, node_rereg_timeout, frontchannel_logout, consent_required, name, service_accounts_enabled, client_authenticator_type, root_url, description, registration_token, standard_flow_enabled, implicit_flow_enabled, direct_access_grants_enabled, always_display_in_console) FROM stdin;
53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	f	realm-management	0	f	\N	\N	t	\N	f	dms	openid-connect	0	f	f	${client_realm-management}	f	client-secret	\N	\N	\N	t	f	f	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	t	f	account	0	t	\N	/realms/dms/account/	f	\N	f	dms	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	t	f	account-console	0	t	\N	/realms/dms/account/	f	\N	f	dms	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	t	f	broker	0	f	\N	\N	t	\N	f	dms	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	f	master-realm	0	f	\N	\N	t	\N	f	79df126b-a967-4d6d-a704-427910aca988	\N	0	f	f	master Realm	f	client-secret	\N	\N	\N	t	f	f	f
e21a0b08-0675-4768-8044-b427263a416c	t	t	security-admin-console	0	t	\N	/admin/dms/console/	f	\N	f	dms	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
d61e802f-227d-42c4-910f-9ca217aa521d	t	t	admin-cli	0	t	\N	\N	f	\N	f	dms	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	t	t	dms-app	0	f	dev-secret	\N	f	\N	f	dms	openid-connect	-1	f	f	\N	t	client-secret	\N	\N	\N	t	f	t	f
bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	f	account	0	t	\N	/realms/master/account/	f	\N	f	79df126b-a967-4d6d-a704-427910aca988	openid-connect	0	f	f	${client_account}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
3775a915-293b-43f7-909d-bbf62865c526	t	f	account-console	0	t	\N	/realms/master/account/	f	\N	f	79df126b-a967-4d6d-a704-427910aca988	openid-connect	0	f	f	${client_account-console}	f	client-secret	${authBaseUrl}	\N	\N	t	f	f	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	t	f	broker	0	f	\N	\N	t	\N	f	79df126b-a967-4d6d-a704-427910aca988	openid-connect	0	f	f	${client_broker}	f	client-secret	\N	\N	\N	t	f	f	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	t	t	security-admin-console	0	t	\N	/admin/master/console/	f	\N	f	79df126b-a967-4d6d-a704-427910aca988	openid-connect	0	f	f	${client_security-admin-console}	f	client-secret	${authAdminUrl}	\N	\N	t	f	f	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	t	t	admin-cli	0	t	\N	\N	f	\N	f	79df126b-a967-4d6d-a704-427910aca988	openid-connect	0	f	f	${client_admin-cli}	f	client-secret	\N	\N	\N	f	f	t	f
a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	f	dms-realm	0	f	\N	\N	t	\N	f	79df126b-a967-4d6d-a704-427910aca988	\N	0	f	f	dms Realm	f	client-secret	\N	\N	\N	t	f	f	f
\.


--
-- Data for Name: client_attributes; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_attributes (client_id, name, value) FROM stdin;
bcb5640c-7302-48b6-a899-e78b2fd9cba2	post.logout.redirect.uris	+
3775a915-293b-43f7-909d-bbf62865c526	post.logout.redirect.uris	+
3775a915-293b-43f7-909d-bbf62865c526	pkce.code.challenge.method	S256
8f02f084-4f1d-41c9-bce2-2d6470b93af6	post.logout.redirect.uris	+
8f02f084-4f1d-41c9-bce2-2d6470b93af6	pkce.code.challenge.method	S256
8f02f084-4f1d-41c9-bce2-2d6470b93af6	client.use.lightweight.access.token.enabled	true
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	client.use.lightweight.access.token.enabled	true
ea76b321-1c97-48c9-8358-ba0939c4cc24	post.logout.redirect.uris	+
458c2c0d-26e8-465c-97c4-1631dcf3d008	post.logout.redirect.uris	+
458c2c0d-26e8-465c-97c4-1631dcf3d008	pkce.code.challenge.method	S256
e21a0b08-0675-4768-8044-b427263a416c	post.logout.redirect.uris	+
e21a0b08-0675-4768-8044-b427263a416c	pkce.code.challenge.method	S256
e21a0b08-0675-4768-8044-b427263a416c	client.use.lightweight.access.token.enabled	true
d61e802f-227d-42c4-910f-9ca217aa521d	client.use.lightweight.access.token.enabled	true
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	oidc.ciba.grant.enabled	false
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	oauth2.device.authorization.grant.enabled	false
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	backchannel.logout.session.required	true
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	backchannel.logout.revoke.offline.tokens	false
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	post.logout.redirect.uris	+
\.


--
-- Data for Name: client_auth_flow_bindings; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_auth_flow_bindings (client_id, flow_id, binding_name) FROM stdin;
\.


--
-- Data for Name: client_initial_access; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_initial_access (id, realm_id, "timestamp", expiration, count, remaining_count) FROM stdin;
\.


--
-- Data for Name: client_node_registrations; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_node_registrations (client_id, value, name) FROM stdin;
\.


--
-- Data for Name: client_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_scope (id, name, realm_id, description, protocol) FROM stdin;
17f11354-ab3e-4637-a044-b0d3a7cb96f0	offline_access	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect built-in scope: offline_access	openid-connect
b5ffbb59-df30-417d-9ea5-1be2a50f4549	role_list	79df126b-a967-4d6d-a704-427910aca988	SAML role list	saml
0273a67c-24f3-405f-b65e-0cdfd9543c1c	saml_organization	79df126b-a967-4d6d-a704-427910aca988	Organization Membership	saml
8e35db53-eba5-48b7-a523-4236034089c7	profile	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect built-in scope: profile	openid-connect
24c516bc-17ec-445f-a5b6-2d5fa7d0b439	email	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect built-in scope: email	openid-connect
61d85499-a4f6-4014-9ce6-6eaa3e953109	address	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect built-in scope: address	openid-connect
a6cfe879-b0e0-4efa-a3a8-bd35e278903e	phone	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect built-in scope: phone	openid-connect
2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	roles	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect scope for add user roles to the access token	openid-connect
3084e8de-8dd8-4dd6-a225-7e325a445f0d	web-origins	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect scope for add allowed web origins to the access token	openid-connect
f49b4e26-fd18-4864-93fe-5473ae7ede2f	microprofile-jwt	79df126b-a967-4d6d-a704-427910aca988	Microprofile - JWT built-in scope	openid-connect
e8febfda-03a8-4e16-a0e0-931f47c69f23	acr	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
8b0f1e66-7460-4795-9698-a130e3dd2ab3	basic	79df126b-a967-4d6d-a704-427910aca988	OpenID Connect scope for add all basic claims to the token	openid-connect
b54ccd53-5965-4171-b968-45e7190555f9	organization	79df126b-a967-4d6d-a704-427910aca988	Additional claims about the organization a subject belongs to	openid-connect
5078f77d-e406-46dd-ba9a-5b44a7da61a7	offline_access	dms	OpenID Connect built-in scope: offline_access	openid-connect
d3535c8e-2c6e-413c-a959-537bfb74f457	role_list	dms	SAML role list	saml
829dea79-aaec-4aab-9644-5e1eb3ab9ef0	saml_organization	dms	Organization Membership	saml
1d3f166b-cea0-4e42-9371-e70ba0bbf758	profile	dms	OpenID Connect built-in scope: profile	openid-connect
7ef4abe0-e149-4778-8028-8e0670fd53e1	email	dms	OpenID Connect built-in scope: email	openid-connect
a4d3a386-873f-4a5a-9aad-cd0393ad427e	address	dms	OpenID Connect built-in scope: address	openid-connect
89b76033-1e88-4d04-a353-82c236ee9cdf	phone	dms	OpenID Connect built-in scope: phone	openid-connect
622e8197-6eeb-4caa-b47d-a3043cddd085	roles	dms	OpenID Connect scope for add user roles to the access token	openid-connect
9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	web-origins	dms	OpenID Connect scope for add allowed web origins to the access token	openid-connect
d32726cb-eec1-4b40-83e3-a215c72e2c90	microprofile-jwt	dms	Microprofile - JWT built-in scope	openid-connect
85feda3f-9880-4c64-97b4-f5960523e73c	acr	dms	OpenID Connect scope for add acr (authentication context class reference) to the token	openid-connect
2833783f-e469-4d0e-9b28-9290c7021119	basic	dms	OpenID Connect scope for add all basic claims to the token	openid-connect
5e137d25-516d-4744-9da6-b9796b55439a	organization	dms	Additional claims about the organization a subject belongs to	openid-connect
\.


--
-- Data for Name: client_scope_attributes; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_scope_attributes (scope_id, value, name) FROM stdin;
17f11354-ab3e-4637-a044-b0d3a7cb96f0	true	display.on.consent.screen
17f11354-ab3e-4637-a044-b0d3a7cb96f0	${offlineAccessScopeConsentText}	consent.screen.text
b5ffbb59-df30-417d-9ea5-1be2a50f4549	true	display.on.consent.screen
b5ffbb59-df30-417d-9ea5-1be2a50f4549	${samlRoleListScopeConsentText}	consent.screen.text
0273a67c-24f3-405f-b65e-0cdfd9543c1c	false	display.on.consent.screen
8e35db53-eba5-48b7-a523-4236034089c7	true	display.on.consent.screen
8e35db53-eba5-48b7-a523-4236034089c7	${profileScopeConsentText}	consent.screen.text
8e35db53-eba5-48b7-a523-4236034089c7	true	include.in.token.scope
24c516bc-17ec-445f-a5b6-2d5fa7d0b439	true	display.on.consent.screen
24c516bc-17ec-445f-a5b6-2d5fa7d0b439	${emailScopeConsentText}	consent.screen.text
24c516bc-17ec-445f-a5b6-2d5fa7d0b439	true	include.in.token.scope
61d85499-a4f6-4014-9ce6-6eaa3e953109	true	display.on.consent.screen
61d85499-a4f6-4014-9ce6-6eaa3e953109	${addressScopeConsentText}	consent.screen.text
61d85499-a4f6-4014-9ce6-6eaa3e953109	true	include.in.token.scope
a6cfe879-b0e0-4efa-a3a8-bd35e278903e	true	display.on.consent.screen
a6cfe879-b0e0-4efa-a3a8-bd35e278903e	${phoneScopeConsentText}	consent.screen.text
a6cfe879-b0e0-4efa-a3a8-bd35e278903e	true	include.in.token.scope
2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	true	display.on.consent.screen
2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	${rolesScopeConsentText}	consent.screen.text
2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	false	include.in.token.scope
3084e8de-8dd8-4dd6-a225-7e325a445f0d	false	display.on.consent.screen
3084e8de-8dd8-4dd6-a225-7e325a445f0d		consent.screen.text
3084e8de-8dd8-4dd6-a225-7e325a445f0d	false	include.in.token.scope
f49b4e26-fd18-4864-93fe-5473ae7ede2f	false	display.on.consent.screen
f49b4e26-fd18-4864-93fe-5473ae7ede2f	true	include.in.token.scope
e8febfda-03a8-4e16-a0e0-931f47c69f23	false	display.on.consent.screen
e8febfda-03a8-4e16-a0e0-931f47c69f23	false	include.in.token.scope
8b0f1e66-7460-4795-9698-a130e3dd2ab3	false	display.on.consent.screen
8b0f1e66-7460-4795-9698-a130e3dd2ab3	false	include.in.token.scope
b54ccd53-5965-4171-b968-45e7190555f9	true	display.on.consent.screen
b54ccd53-5965-4171-b968-45e7190555f9	${organizationScopeConsentText}	consent.screen.text
b54ccd53-5965-4171-b968-45e7190555f9	true	include.in.token.scope
5078f77d-e406-46dd-ba9a-5b44a7da61a7	true	display.on.consent.screen
5078f77d-e406-46dd-ba9a-5b44a7da61a7	${offlineAccessScopeConsentText}	consent.screen.text
d3535c8e-2c6e-413c-a959-537bfb74f457	true	display.on.consent.screen
d3535c8e-2c6e-413c-a959-537bfb74f457	${samlRoleListScopeConsentText}	consent.screen.text
829dea79-aaec-4aab-9644-5e1eb3ab9ef0	false	display.on.consent.screen
1d3f166b-cea0-4e42-9371-e70ba0bbf758	true	display.on.consent.screen
1d3f166b-cea0-4e42-9371-e70ba0bbf758	${profileScopeConsentText}	consent.screen.text
1d3f166b-cea0-4e42-9371-e70ba0bbf758	true	include.in.token.scope
7ef4abe0-e149-4778-8028-8e0670fd53e1	true	display.on.consent.screen
7ef4abe0-e149-4778-8028-8e0670fd53e1	${emailScopeConsentText}	consent.screen.text
7ef4abe0-e149-4778-8028-8e0670fd53e1	true	include.in.token.scope
a4d3a386-873f-4a5a-9aad-cd0393ad427e	true	display.on.consent.screen
a4d3a386-873f-4a5a-9aad-cd0393ad427e	${addressScopeConsentText}	consent.screen.text
a4d3a386-873f-4a5a-9aad-cd0393ad427e	true	include.in.token.scope
89b76033-1e88-4d04-a353-82c236ee9cdf	true	display.on.consent.screen
89b76033-1e88-4d04-a353-82c236ee9cdf	${phoneScopeConsentText}	consent.screen.text
89b76033-1e88-4d04-a353-82c236ee9cdf	true	include.in.token.scope
622e8197-6eeb-4caa-b47d-a3043cddd085	true	display.on.consent.screen
622e8197-6eeb-4caa-b47d-a3043cddd085	${rolesScopeConsentText}	consent.screen.text
622e8197-6eeb-4caa-b47d-a3043cddd085	false	include.in.token.scope
9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	false	display.on.consent.screen
9b3a075e-789a-43c7-b3cd-a9d4b2dd830c		consent.screen.text
9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	false	include.in.token.scope
d32726cb-eec1-4b40-83e3-a215c72e2c90	false	display.on.consent.screen
d32726cb-eec1-4b40-83e3-a215c72e2c90	true	include.in.token.scope
85feda3f-9880-4c64-97b4-f5960523e73c	false	display.on.consent.screen
85feda3f-9880-4c64-97b4-f5960523e73c	false	include.in.token.scope
2833783f-e469-4d0e-9b28-9290c7021119	false	display.on.consent.screen
2833783f-e469-4d0e-9b28-9290c7021119	false	include.in.token.scope
5e137d25-516d-4744-9da6-b9796b55439a	true	display.on.consent.screen
5e137d25-516d-4744-9da6-b9796b55439a	${organizationScopeConsentText}	consent.screen.text
5e137d25-516d-4744-9da6-b9796b55439a	true	include.in.token.scope
\.


--
-- Data for Name: client_scope_client; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_scope_client (client_id, scope_id, default_scope) FROM stdin;
bcb5640c-7302-48b6-a899-e78b2fd9cba2	8e35db53-eba5-48b7-a523-4236034089c7	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
bcb5640c-7302-48b6-a899-e78b2fd9cba2	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
bcb5640c-7302-48b6-a899-e78b2fd9cba2	b54ccd53-5965-4171-b968-45e7190555f9	f
bcb5640c-7302-48b6-a899-e78b2fd9cba2	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
bcb5640c-7302-48b6-a899-e78b2fd9cba2	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
bcb5640c-7302-48b6-a899-e78b2fd9cba2	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
3775a915-293b-43f7-909d-bbf62865c526	8e35db53-eba5-48b7-a523-4236034089c7	t
3775a915-293b-43f7-909d-bbf62865c526	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
3775a915-293b-43f7-909d-bbf62865c526	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
3775a915-293b-43f7-909d-bbf62865c526	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
3775a915-293b-43f7-909d-bbf62865c526	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
3775a915-293b-43f7-909d-bbf62865c526	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
3775a915-293b-43f7-909d-bbf62865c526	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
3775a915-293b-43f7-909d-bbf62865c526	b54ccd53-5965-4171-b968-45e7190555f9	f
3775a915-293b-43f7-909d-bbf62865c526	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
3775a915-293b-43f7-909d-bbf62865c526	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
3775a915-293b-43f7-909d-bbf62865c526	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	8e35db53-eba5-48b7-a523-4236034089c7	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	b54ccd53-5965-4171-b968-45e7190555f9	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
6eb27e56-6cc3-4b19-97bd-8037be57cbc7	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	8e35db53-eba5-48b7-a523-4236034089c7	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	b54ccd53-5965-4171-b968-45e7190555f9	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	8e35db53-eba5-48b7-a523-4236034089c7	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
3935d8e7-9eaf-4b16-b997-71a7e53bef30	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	b54ccd53-5965-4171-b968-45e7190555f9	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
3935d8e7-9eaf-4b16-b997-71a7e53bef30	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	8e35db53-eba5-48b7-a523-4236034089c7	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
8f02f084-4f1d-41c9-bce2-2d6470b93af6	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	b54ccd53-5965-4171-b968-45e7190555f9	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
8f02f084-4f1d-41c9-bce2-2d6470b93af6	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	622e8197-6eeb-4caa-b47d-a3043cddd085	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	2833783f-e469-4d0e-9b28-9290c7021119	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	85feda3f-9880-4c64-97b4-f5960523e73c	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
ea76b321-1c97-48c9-8358-ba0939c4cc24	89b76033-1e88-4d04-a353-82c236ee9cdf	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	5e137d25-516d-4744-9da6-b9796b55439a	f
ea76b321-1c97-48c9-8358-ba0939c4cc24	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	622e8197-6eeb-4caa-b47d-a3043cddd085	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	2833783f-e469-4d0e-9b28-9290c7021119	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	85feda3f-9880-4c64-97b4-f5960523e73c	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
458c2c0d-26e8-465c-97c4-1631dcf3d008	89b76033-1e88-4d04-a353-82c236ee9cdf	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	5e137d25-516d-4744-9da6-b9796b55439a	f
458c2c0d-26e8-465c-97c4-1631dcf3d008	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
d61e802f-227d-42c4-910f-9ca217aa521d	622e8197-6eeb-4caa-b47d-a3043cddd085	t
d61e802f-227d-42c4-910f-9ca217aa521d	2833783f-e469-4d0e-9b28-9290c7021119	t
d61e802f-227d-42c4-910f-9ca217aa521d	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
d61e802f-227d-42c4-910f-9ca217aa521d	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
d61e802f-227d-42c4-910f-9ca217aa521d	85feda3f-9880-4c64-97b4-f5960523e73c	t
d61e802f-227d-42c4-910f-9ca217aa521d	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
d61e802f-227d-42c4-910f-9ca217aa521d	89b76033-1e88-4d04-a353-82c236ee9cdf	f
d61e802f-227d-42c4-910f-9ca217aa521d	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
d61e802f-227d-42c4-910f-9ca217aa521d	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
d61e802f-227d-42c4-910f-9ca217aa521d	5e137d25-516d-4744-9da6-b9796b55439a	f
d61e802f-227d-42c4-910f-9ca217aa521d	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	622e8197-6eeb-4caa-b47d-a3043cddd085	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	2833783f-e469-4d0e-9b28-9290c7021119	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	85feda3f-9880-4c64-97b4-f5960523e73c	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
90b333ad-f2b2-433c-9aff-1309216ef8bd	89b76033-1e88-4d04-a353-82c236ee9cdf	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	5e137d25-516d-4744-9da6-b9796b55439a	f
90b333ad-f2b2-433c-9aff-1309216ef8bd	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
53ab9258-60ae-44cf-b9c9-8f2991311ce0	622e8197-6eeb-4caa-b47d-a3043cddd085	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	2833783f-e469-4d0e-9b28-9290c7021119	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	85feda3f-9880-4c64-97b4-f5960523e73c	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
53ab9258-60ae-44cf-b9c9-8f2991311ce0	89b76033-1e88-4d04-a353-82c236ee9cdf	f
53ab9258-60ae-44cf-b9c9-8f2991311ce0	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
53ab9258-60ae-44cf-b9c9-8f2991311ce0	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
53ab9258-60ae-44cf-b9c9-8f2991311ce0	5e137d25-516d-4744-9da6-b9796b55439a	f
53ab9258-60ae-44cf-b9c9-8f2991311ce0	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
e21a0b08-0675-4768-8044-b427263a416c	622e8197-6eeb-4caa-b47d-a3043cddd085	t
e21a0b08-0675-4768-8044-b427263a416c	2833783f-e469-4d0e-9b28-9290c7021119	t
e21a0b08-0675-4768-8044-b427263a416c	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
e21a0b08-0675-4768-8044-b427263a416c	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
e21a0b08-0675-4768-8044-b427263a416c	85feda3f-9880-4c64-97b4-f5960523e73c	t
e21a0b08-0675-4768-8044-b427263a416c	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
e21a0b08-0675-4768-8044-b427263a416c	89b76033-1e88-4d04-a353-82c236ee9cdf	f
e21a0b08-0675-4768-8044-b427263a416c	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
e21a0b08-0675-4768-8044-b427263a416c	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
e21a0b08-0675-4768-8044-b427263a416c	5e137d25-516d-4744-9da6-b9796b55439a	f
e21a0b08-0675-4768-8044-b427263a416c	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	622e8197-6eeb-4caa-b47d-a3043cddd085	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	2833783f-e469-4d0e-9b28-9290c7021119	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	85feda3f-9880-4c64-97b4-f5960523e73c	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	89b76033-1e88-4d04-a353-82c236ee9cdf	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	5e137d25-516d-4744-9da6-b9796b55439a	f
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
\.


--
-- Data for Name: client_scope_role_mapping; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.client_scope_role_mapping (scope_id, role_id) FROM stdin;
17f11354-ab3e-4637-a044-b0d3a7cb96f0	aa426c38-9fa9-4b62-b30e-e97659a0123b
5078f77d-e406-46dd-ba9a-5b44a7da61a7	0cc23704-3099-4481-af93-2afe9e9fa6fc
\.


--
-- Data for Name: component; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.component (id, name, parent_id, provider_id, provider_type, realm_id, sub_type) FROM stdin;
27f26c25-832b-4c8a-83c8-7ab08d406de5	Trusted Hosts	79df126b-a967-4d6d-a704-427910aca988	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
1c7d2ac7-2cda-4e3c-9bb1-156d381dce02	Consent Required	79df126b-a967-4d6d-a704-427910aca988	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
ee8caba2-cb2c-4bef-a80c-48f02602992f	Full Scope Disabled	79df126b-a967-4d6d-a704-427910aca988	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
910b1774-c6e0-412e-88b6-ebea9c733d58	Max Clients Limit	79df126b-a967-4d6d-a704-427910aca988	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
76cb8e55-3a74-4897-a738-66464d5b77ce	Allowed Protocol Mapper Types	79df126b-a967-4d6d-a704-427910aca988	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
b5d01f44-0212-4a4e-b8f1-8151cb2d4813	Allowed Client Scopes	79df126b-a967-4d6d-a704-427910aca988	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	anonymous
0071c70a-4ac7-438e-954f-8fa73ea3463a	Allowed Protocol Mapper Types	79df126b-a967-4d6d-a704-427910aca988	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	authenticated
e54c18a7-8d67-4d39-a34c-e40e6158335d	Allowed Client Scopes	79df126b-a967-4d6d-a704-427910aca988	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	79df126b-a967-4d6d-a704-427910aca988	authenticated
67a3706a-0469-424c-83a3-c07df7acbfa7	rsa-generated	79df126b-a967-4d6d-a704-427910aca988	rsa-generated	org.keycloak.keys.KeyProvider	79df126b-a967-4d6d-a704-427910aca988	\N
5e8ef9f2-a973-4523-bddf-8a876cbfa682	rsa-enc-generated	79df126b-a967-4d6d-a704-427910aca988	rsa-enc-generated	org.keycloak.keys.KeyProvider	79df126b-a967-4d6d-a704-427910aca988	\N
af67cebd-ae81-45e5-9b64-a6ae34811071	hmac-generated-hs512	79df126b-a967-4d6d-a704-427910aca988	hmac-generated	org.keycloak.keys.KeyProvider	79df126b-a967-4d6d-a704-427910aca988	\N
ad870b7d-e23c-4d1b-9934-186f7339f097	aes-generated	79df126b-a967-4d6d-a704-427910aca988	aes-generated	org.keycloak.keys.KeyProvider	79df126b-a967-4d6d-a704-427910aca988	\N
8bc74395-ba3b-4825-b075-e5913d756a6e	\N	79df126b-a967-4d6d-a704-427910aca988	declarative-user-profile	org.keycloak.userprofile.UserProfileProvider	79df126b-a967-4d6d-a704-427910aca988	\N
496d9375-61e9-44bb-a98f-2b0731da9043	rsa-generated	dms	rsa-generated	org.keycloak.keys.KeyProvider	dms	\N
8a3efcf6-3321-4571-8714-f3a3fc77fa25	rsa-enc-generated	dms	rsa-enc-generated	org.keycloak.keys.KeyProvider	dms	\N
434fa5a9-6254-4358-a8ea-ef6b0e78f6eb	hmac-generated-hs512	dms	hmac-generated	org.keycloak.keys.KeyProvider	dms	\N
a5a2af5f-df83-491f-9b38-ce63dc89f1d7	aes-generated	dms	aes-generated	org.keycloak.keys.KeyProvider	dms	\N
71afab88-f77c-4804-a799-f84032d894ed	Trusted Hosts	dms	trusted-hosts	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
3ec2e0ba-1ad8-4dac-a3b6-09d45dbaa0c3	Consent Required	dms	consent-required	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
81525a31-cd8d-48ca-a14c-82be30362508	Full Scope Disabled	dms	scope	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
b7db451c-bb0d-4b3c-9fa5-5d8d693a32a8	Max Clients Limit	dms	max-clients	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	Allowed Protocol Mapper Types	dms	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
b371cb95-1113-4730-ab38-653b503b51be	Allowed Client Scopes	dms	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	anonymous
704f8996-9974-4785-98a8-d8a9359b0f28	Allowed Protocol Mapper Types	dms	allowed-protocol-mappers	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	authenticated
fb7dd853-ac80-420d-ad98-94a97d28b78e	Allowed Client Scopes	dms	allowed-client-templates	org.keycloak.services.clientregistration.policy.ClientRegistrationPolicy	dms	authenticated
\.


--
-- Data for Name: component_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.component_config (id, component_id, name, value) FROM stdin;
f5538b37-7fbe-4e7d-b89e-b9c11daa6a4b	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
d9d05d0d-5a62-4c54-97cd-7e9bffed4423	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	saml-user-attribute-mapper
9a0c38be-6d3d-4942-aa1c-7a5457a527ed	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
621963cf-d574-43f1-ac14-0982f7160dfc	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
8262cb97-eb4b-4c2e-bc52-18b0f76c374c	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	saml-role-list-mapper
c851a564-fa20-41cf-a9e4-afe3299f888e	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	oidc-address-mapper
edc90722-0290-4aca-821c-bb0eee6aa0ee	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	saml-user-property-mapper
4160d66f-799c-4db7-bde8-8d256d53b8b6	76cb8e55-3a74-4897-a738-66464d5b77ce	allowed-protocol-mapper-types	oidc-full-name-mapper
0e1ec8eb-77e1-438c-ba4c-5beb17b90488	27f26c25-832b-4c8a-83c8-7ab08d406de5	host-sending-registration-request-must-match	true
e2cacc05-36f8-4aed-9416-24334ab74698	27f26c25-832b-4c8a-83c8-7ab08d406de5	client-uris-must-match	true
1d642db1-2e6c-454f-99d6-4a8b4a5055e5	e54c18a7-8d67-4d39-a34c-e40e6158335d	allow-default-scopes	true
53d2e101-a5b1-46a2-a590-b40440681436	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	oidc-address-mapper
b1fc408d-d268-4cda-aa0e-3b65bb4f1a2d	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	saml-role-list-mapper
34d41b96-d61a-459e-99b1-2900d662338f	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
8b9ccdf5-2d93-4952-a21e-96e56bda3e4e	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	saml-user-property-mapper
654a0ab9-8108-4291-9ec8-c2c43a5895b9	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	oidc-full-name-mapper
971d7f8f-f0fb-4897-8fc3-eb9952c3243e	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	saml-user-attribute-mapper
49ea7d82-8fd4-4147-b74f-23cf8b854a19	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
d0c0c382-71db-4242-9bc8-c8a59d5349e1	0071c70a-4ac7-438e-954f-8fa73ea3463a	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
002fbb3c-d25a-45b9-ad3e-add2eb1aee8f	b5d01f44-0212-4a4e-b8f1-8151cb2d4813	allow-default-scopes	true
a09b4ae1-9b8f-422e-9065-96ea70e9accb	910b1774-c6e0-412e-88b6-ebea9c733d58	max-clients	200
265d4341-79da-4121-b77a-2acbd0b7a4d3	8bc74395-ba3b-4825-b075-e5913d756a6e	kc.user.profile.config	{"attributes":[{"name":"username","displayName":"${username}","validations":{"length":{"min":3,"max":255},"username-prohibited-characters":{},"up-username-not-idn-homograph":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"email","displayName":"${email}","validations":{"email":{},"length":{"max":255}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"firstName","displayName":"${firstName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false},{"name":"lastName","displayName":"${lastName}","validations":{"length":{"max":255},"person-name-prohibited-characters":{}},"permissions":{"view":["admin","user"],"edit":["admin","user"]},"multivalued":false}],"groups":[{"name":"user-metadata","displayHeader":"User metadata","displayDescription":"Attributes, which refer to user metadata"}]}
0dfe4ecc-6bc5-4cbe-b5f6-c07ceca85058	af67cebd-ae81-45e5-9b64-a6ae34811071	priority	100
8940184d-64f2-431e-9a8d-4326a347d3f9	af67cebd-ae81-45e5-9b64-a6ae34811071	algorithm	HS512
53fb13aa-5eef-477e-8fd4-e661302c9ce8	af67cebd-ae81-45e5-9b64-a6ae34811071	secret	_NkVe2Cg0-241eOs7d8EKlRPdRTs0vA7V3C4zLTuzMw156gkaqyMQSLM_YSWqw1V4bU2f6GqF1ch27x56woX6PtIzQA3WybyeNF8jbaBiKLed3QbjARQbEfJDstXANSNZvg50rwIk_uKHLWgunGUOXmr9ipFEWgSb90EWyB78IE
93fc7d62-0007-47aa-9246-29a167f26efa	af67cebd-ae81-45e5-9b64-a6ae34811071	kid	c67b6a55-df03-4e32-bcaa-ce74691d87ef
5fec09e2-776c-44f6-bb23-fed1170ac38e	5e8ef9f2-a973-4523-bddf-8a876cbfa682	privateKey	MIIEpAIBAAKCAQEAt3y6I1npWNQTvkDp993JjDh/TEuV2tZ8uhwRnsC+19u4d+KxTGNLX10kEryvfZsAg63/0wMyLEJSyi+f3n2zUJb2wI8yk52SduW8LByaa3wfztvo+Pzfm5CJcBum28FC0BfC1duOf0RtP2YBEbEdRf4i3MNtzaisit+DpG4JYwn0RKn5rULpYCVYVL5TKr2kqpcoZJbO9eNJfgN8SCJ3SAIsTXJfvWwvg9QT5OvssmS2Djvdr8GiAFkIEpvKPE4/NDMPx5wl67wgBQSjkgG8M3Ws+LsyG7vb/0pOcqlhdqk2sj8ZZqRC1OtZArP8rTmAnUO4CADXG7ZDgQBKc79xrwIDAQABAoIBAAYdtbSk9Ba+ZvQSBNp6vZObdH7ODC4xtRGdCudQRGw8ii8Q0tkZfDMvDxtCx9S3fHJnM95MPnlkMo9DvB/176qxhYMQot5xw6aL7NRJlcocZpEGGoNmJmvwiuw+N7cef4QhLqDjQyIx3TReSY3V6gRhvra+GuReiXXNkn1CH7T52vyu0jRsQSH3rfRsQ5X5kiy+unvyz5b3YdJz6hP11y709eHq3UM35E1hIOmf6kfPyCNITs3Os8V2mP1F3OoeJfvsWqCG6y/f8I9kkqu35hGRNxvAP4AmjYCWfv3YXPSzK/k+ylF1PE/bOBq6iNgpgaUP9fjQB7Z/tey0wnAvswUCgYEA5v8tUG1jK7FD99jsoX9C/HKd2cLSpCEBqjwPkf2e/oB5dda3Ke0K/YprU1/5vdbpjgo8+1z/c1Z9Evy7Q7K+qj97zz4h4vKQ9348ULYvVGch1XcmtBRH5Hr1lBgksyCOYUgauj0OicFwXkZXq0FzTKMXq/PwhyeunYf9zgA6DYUCgYEAy1kUfjZi7Ydo21g5/dCcGNvu2bcAZevLjoTXFUFw4WUFAsSxHF/NH8czoY06Yfvgae1TbQ/XvGJynBhp93OUm+uYEufeQfFcU6v5eiQ8mpqMIXThv8jAHzpEfOgKl9QgfztLRWkJW25bZspZNDfCecFhqEJ4bphHlYRxgY4qXqMCgYBr0srVEupKl8jxJNl3nM6oxdt2rSDjqeB8FOLzs14Gz/NiFOKUeGg75uOoHFGX0nxcZ90FO+ilbsadGUlUFVg4Yb+qAgeRRsZyMAN5bUD0ddtuJ9ryDdFtDhQZl5dx4Y10TVLkgeGKXbfU2aLMdpWaPTqscgZhIB26vKK1CJgQfQKBgQC2PvAO7c9b8rAXZcsTn5NG9FXs6gaBUgLtiED729q/JzqGcKILPBErGe08LMbWaleGmBzc8gX34IO3Qmo2THA0DcINr6GSmC6XDtpYjYGDTl+o3Ig2ykTlt+MJzy0vRf6aCRo86xZny1A/n7qzAgZZ+Ob9VhV5iSEe78SKyE9Q4QKBgQCIPXCZU3Ty5Tixq7f9RrXfwhQti7lqf7Jr5aQdup2CV/J8ukeRsQFQaha4Zl08aQBFzf4+6wYoJqIoBYDSe5wNba0YBudmozJuSWB+xBu+fkkqUYT0b4KAdeHdyspRmakR67H0ZEoOZ2/HXyoYB3Ml5yA5rk6lK19AEzW5QEt6RA==
192885cc-7dd8-4532-804a-0c815097caa3	5e8ef9f2-a973-4523-bddf-8a876cbfa682	keyUse	ENC
ac8afacb-f6e0-42d5-b0b0-3e60840fb133	5e8ef9f2-a973-4523-bddf-8a876cbfa682	certificate	MIICmzCCAYMCBgGZOlr1dTANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUwOTExMTk1NjAzWhcNMzUwOTExMTk1NzQzWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC3fLojWelY1BO+QOn33cmMOH9MS5Xa1ny6HBGewL7X27h34rFMY0tfXSQSvK99mwCDrf/TAzIsQlLKL5/efbNQlvbAjzKTnZJ25bwsHJprfB/O2+j4/N+bkIlwG6bbwULQF8LV245/RG0/ZgERsR1F/iLcw23NqKyK34OkbgljCfREqfmtQulgJVhUvlMqvaSqlyhkls7140l+A3xIIndIAixNcl+9bC+D1BPk6+yyZLYOO92vwaIAWQgSm8o8Tj80Mw/HnCXrvCAFBKOSAbwzdaz4uzIbu9v/Sk5yqWF2qTayPxlmpELU61kCs/ytOYCdQ7gIANcbtkOBAEpzv3GvAgMBAAEwDQYJKoZIhvcNAQELBQADggEBALUueDx+PrQiNE3XgydMECGrQBXwNEyFIeog5B/Q9GtTlK99IFMWZ5fuCUKjvQcGzGdWhn0TzJ3wyyFpPMzAFcqZ88FFo7pUgdFtpEQ0Tr5Yyi0OzGsDj77qZ3z7h/eqcPFPPYfVf0fBpeSXCRX12x2O6kBSBiNgpp3pVHbW2QcaxoMSNwhPoM+g6+ytbwoPguO2fv+nmkhPM+EtXSHWbspxrI9rUoSiJB6nb94lJYKq60Bs4XJ/KkNGFim9YgGWyhxa4qM7hfWl5dgoyQNnIo01PXrv+aMiPmZJ6P42tML5cOZWmMpMV15mF+OqCH6Hg0ApXXhR4uGLfNm3jbhqkbk=
a2b8ce8b-73c4-48bc-a63a-d7a1ea87a174	5e8ef9f2-a973-4523-bddf-8a876cbfa682	algorithm	RSA-OAEP
ec7806e8-2e1c-459d-9fd3-beadaf90cf2e	5e8ef9f2-a973-4523-bddf-8a876cbfa682	priority	100
351aa64d-74a7-429f-8d22-55d3be965227	ad870b7d-e23c-4d1b-9934-186f7339f097	priority	100
9f714509-5f0e-402c-8266-2f5d434e0289	ad870b7d-e23c-4d1b-9934-186f7339f097	kid	d225b404-aa21-42ab-a4f3-178c3b249a0b
43041b8a-2a0e-4b67-a199-6b2e5d953983	ad870b7d-e23c-4d1b-9934-186f7339f097	secret	FSmqf2UsN2wg4iHFmUmIQg
1d975a0f-8329-42ad-982d-969e3220c2cf	67a3706a-0469-424c-83a3-c07df7acbfa7	priority	100
75c93e96-4e5f-43a8-a1ce-405dd3ed8720	67a3706a-0469-424c-83a3-c07df7acbfa7	privateKey	MIIEpAIBAAKCAQEAls3hM0G8tR4oGIlD4FvYpA23nl2tuprtte9T+i3SEVHFAxRUb5eo+zCOY8dXpjs9e/uykfolXCgQW46nRSqDcYkX8rAJ4v5aRzXs4BUuAU/PZI+cvKLzhnzalYdHU1m926Z6jb3a5iZNjGBtAYRqWTDD1GeABp6dcUc2DZmTe5QHYdveGUUKd+um/SjqRwS8wNJcgn5y4QucezgoZtACiuflNEr5xOE/w5pb2Weoxz94flfxJFhArVkOpL+PdxK0NGhb163orMvBHo1WRq6sLYH/YWNSgAuSMO5qcgmuq4sNIBVEFiYdex94QTJl/7/aiZ1qyKt8wMmhtYD3X0caQwIDAQABAoIBAAI7Vsde6pXvNdGzI/PrxNq2SnVHo3AQP4KPSBNheGsbZjDqLQIfx128TyDCTPvftl4hqffHsQp0Aokp8c2WWC6m3dnDtpaLUOoeR3yp45RPMMPaU9jMCPjNdTpJFiQK8nV2bJIXcRtlDewmnl/4Es8+52iha+W5+2nqdcehJVHq9GS2NQIyTjTj9zzrUbi/Zqp4WbI4bdbFFMVPHalDHuTwmBeyCL3IymvWhd+WNqKR/+gnN95USTWNaRjNGIbSFgu0MRzoLcN3+hPFIfwsYZ5FYYE6aO0xwRtSXj3cA/Y2so4F8ap7XtMfdx6rY8sfcxXn8ZJKc9xjhKsRR8iB0wECgYEAzW8aIehCkCMHucSCTTE3o5/kpp4rRWFUwGuz97K9zksDl5oeYvbwIwpJaGvrnyK8mkoZqjH+jQJ+6z6J3M/al/JtbwcSZqc/Oe9WIoFtsO9mf7+OWarSrtMiEg8KeM8pQz9GzjmYbLK198ue+yxha5ZE7HIVpJWsgRfMdBGBdQECgYEAu+xsBuMJZHOe7In7xx0owzjj9BXBTmL95x9bSWNVz9Q7V/OeNSPY7vLD7BZi4MMKW1pMJ6gdYVv67wDN2st7WJJeKfHd3xN5fEwq8M5eadkYkz2pOM/eg2BCcZzP5+kJI0wS7janlPA+d6/ntGI7FsdCWr/XE/DkoNFYpZEue0MCgYA3hgzJF05OSLmA0wTouiGwnrmc8uj9EoZmj3WPwAae6BVrdyM5WkajIdefWnPPigLxrI9tOZ/0GrWU/U0jmiYZpVNAi+fESPXEwdRE9ThhdwL8Chj+UTYqPDRcLyaEanFblJGdkWGKF28pLyaj+mXGP1IXmeoRlsaOCZGf2U9lAQKBgQCOsUeZtx0zpEOBcoi2uWJxUips9XPxtGL88ydaw02uYIWrE/YGfbDER5wTETCFYDPmB9uZpSKiAbi5cE/fGfEP4RwVF22UbHIrup5EeT7hepIZg5GR7O0VrqrlH+ASRTXGEoaxUNjQ09drBCuZIZmigyzUQaTrpFfF8RAxr9quhwKBgQC7PSXeOmV+JlqibFpcmR/K4Sg41B91sboclgAKVfKjkkSUDn4U34NuUuLcceaQUTqiNfvvc3Xf1CI1Vd6P2AXqgKhvoUTsRbbYazxdu3ac5fwI8hWg6HP/0bFsvHqspt6cK7k+VU+W66B179tVDL51p9n5a59qDMATbSL8gl0toA==
fadd6682-ffef-46cb-bdc1-8312fe2a57f8	67a3706a-0469-424c-83a3-c07df7acbfa7	keyUse	SIG
76cc4121-25ab-45b5-8ec9-2d4d929a3648	67a3706a-0469-424c-83a3-c07df7acbfa7	certificate	MIICmzCCAYMCBgGZOlrzTjANBgkqhkiG9w0BAQsFADARMQ8wDQYDVQQDDAZtYXN0ZXIwHhcNMjUwOTExMTk1NjAzWhcNMzUwOTExMTk1NzQzWjARMQ8wDQYDVQQDDAZtYXN0ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCWzeEzQby1HigYiUPgW9ikDbeeXa26mu2171P6LdIRUcUDFFRvl6j7MI5jx1emOz17+7KR+iVcKBBbjqdFKoNxiRfysAni/lpHNezgFS4BT89kj5y8ovOGfNqVh0dTWb3bpnqNvdrmJk2MYG0BhGpZMMPUZ4AGnp1xRzYNmZN7lAdh294ZRQp366b9KOpHBLzA0lyCfnLhC5x7OChm0AKK5+U0SvnE4T/DmlvZZ6jHP3h+V/EkWECtWQ6kv493ErQ0aFvXreisy8EejVZGrqwtgf9hY1KAC5Iw7mpyCa6riw0gFUQWJh17H3hBMmX/v9qJnWrIq3zAyaG1gPdfRxpDAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAJRf7wrTwxx5qioZZcRWEgMvkxqh2p2ibyo72UNcD3QHF7q/BV1rGE04FggQiHApHLWMw6ZBCihabDFQlcnMFrhmdkJJqo1gQeAsdGm1OlGtJbMQHfGpG56uhUrQFFJjwU6jV2gb4vP5krWL7yq49fpCZs9XfgJj+Ihmt7Zoq85vL6e2ozOZguuKsohVTabNIVJ4yDEQeUOMwmCfuxHqbMLZb9wcWZ/dJiDEv8QDli+i6KmGKfXLhh239hpuNx7Cg7QOKfM2VxkLzElSsXTrO2Aiqa2+aM8BGMHGyWB9I7VvmlAACXQUlCzJAnrmas3afbTmFHrUgmpS/jFIPXT+ZMA=
61b7f4e6-3c08-413a-a6e4-5d84344e8bea	8a3efcf6-3321-4571-8714-f3a3fc77fa25	algorithm	RSA-OAEP
f33ed4ba-d48e-48bb-8042-4ac8567eb23e	8a3efcf6-3321-4571-8714-f3a3fc77fa25	privateKey	MIIEowIBAAKCAQEAhOhFGYwkRBdsi00r79sUZHM2qS80B3Z0CPA5Z7HNY7odReUFGYEi7R7Ro5FbMSn31Cvdoc1HKmYN/g0G7wHM7ryD3diUFgoaOBUuiH3jnVlO/VETSa9mkokfW1PNtSBwzmc/D0nUULP5txPASJo5TzCVO0OoSCLuv+8UBjCI0vMlYHAdmuJoRDRtF+nfM7ITuVgZ7qRx7bUvOQARD8Sp+VTg2VBMQyINq3rYlolvCgqopSEXMF+dU40N9N/klQO/JZstfixRE/ABdjfxFA3WFnaG1eatorshrLZvwCyQiX/3mHs7M1xY4XQX+enq/c4SHdUsO1w4evtukucOgTykfwIDAQABAoIBAC7yUrI2//pzYbqE/G+hrb7buaOiUlkOfOdJX6Witx+ydrOhNZ9wL5OdrsR9zD3+CpYOFqAYQDqYSPoDxP643pg3y8aZwZlVYTSNOt4oxbVnfhDZyhvdkrhRKlvaqs9/kYk/DBXM6OvG3v7Nwb6Dh5nS2evQtskgWcA/ZY3YKASHL0u3zGSAnl8cw+K5KxExnmhUvMzcqGNWY3bCb6MEVwg9zOWHlfka5S6oJjBeKeowM8tJw/igy7rETzQ/8AHD3NSyp2pA7J1awQuM5R8W7umknebu1JcdMIbD21XqM27JVgOqf8lUHjN2MsZbfBZC2j3qD4nFXAetgKnHwutPOFUCgYEAujT7RD8bepUBs7ONgFtHWJxunY3TtufruD8tttfL19js0HVkb6ZTkyVgPgOsvxD8k+iuosMT6zCIbMSAYWauN2PuZGAXr5PhIWT9Fg/W0TXpMriwzxLjnyYNYqyP27rw79RaQXTv1MsEAbEnuGI9R57h8RGLorqxNirB42r7da0CgYEAtrkN/gI9yYU1EZFKh6Lp4CHK9Q8gU8et17m7oj5XiWpq8A6WlALRUUZdQWLhcH+Xknuo7pB25zeXk3byfSQKP4V6VdJxHXEA2qgDkmllAYrK6y845MWZkytttx2PFAsURu1SX+kC7bZpeK6/rrcRolmzmcg9orSwa3MximZbEFsCgYEAs4TGxfoNdPXZKTWu8xONSkmufykv9sPLRttqKEAOHy/cx/CVfuqc4l0DV2ZVkfM/fx2x1+s49eLZc/tSRhUnWvF18MGPtE9emcJyGWX11cci5yqWE12Do3idKQdyvgWRqbZRuY+SdNWxLCxuPd5AdB8idzZSJ/XTSYSZXrZSbhUCgYBMclHrUs688DFKv0m6Q6urrRe3vXNd+e2+kqNw9roy8MX612+iTyd55IGBqLf/FDK7A2ejH+fPRs/wz1QWjSyIdPTA0UGn+q5LzP1plRTAN2w8R057UDy3ePT3JrPEw/ngzsum+trRz36DEkF5/HexP+xHS6KV3xjsa45vg/FXfwKBgGGknJYIVBr7s/CH3afKYdLfacyap++afCy9Ol18PINO5hlFTz3r2wsOmchtCtgozjp+9lR6mSkkjLXgx1Vf3/LKzKXQGrfnaIBDyL5ZWwiyREDsyG+MmFhS888pcBW8gCIeG1vykNiauDi2BthzPTerrqANYsI9QUSjm5raokyO
12610ef3-bc08-4b61-b8ac-c9dd006313d4	8a3efcf6-3321-4571-8714-f3a3fc77fa25	keyUse	ENC
3e88e0a9-84cb-4963-9e11-8d1fb15fcf71	8a3efcf6-3321-4571-8714-f3a3fc77fa25	certificate	MIIClTCCAX0CBgGZOlsHXDANBgkqhkiG9w0BAQsFADAOMQwwCgYDVQQDDANkbXMwHhcNMjUwOTExMTk1NjA4WhcNMzUwOTExMTk1NzQ4WjAOMQwwCgYDVQQDDANkbXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCE6EUZjCREF2yLTSvv2xRkczapLzQHdnQI8Dlnsc1juh1F5QUZgSLtHtGjkVsxKffUK92hzUcqZg3+DQbvAczuvIPd2JQWCho4FS6IfeOdWU79URNJr2aSiR9bU821IHDOZz8PSdRQs/m3E8BImjlPMJU7Q6hIIu6/7xQGMIjS8yVgcB2a4mhENG0X6d8zshO5WBnupHHttS85ABEPxKn5VODZUExDIg2retiWiW8KCqilIRcwX51TjQ303+SVA78lmy1+LFET8AF2N/EUDdYWdobV5q2iuyGstm/ALJCJf/eYezszXFjhdBf56er9zhId1Sw7XDh6+26S5w6BPKR/AgMBAAEwDQYJKoZIhvcNAQELBQADggEBADM5sIig8loLWxfzRvcLCLu1LIiosxORUyCmyjfyEI2jizHN5eIWdRqPFJS3sdH0DFq6no+SsqGP1G/6NNiXuMDcny9SqeHX1wop/6AsXlrMlfMGpU+5MEqv1AvrOIm6okMJJFxWR9Q0GKZW0MHbUUdajM8ElaOGzy5iTspP2G1BfOzDSMKDtqLedbxU5YR3BvpNtBQSkKOFmp88eVp83Q+mJo0hvlWd3Ap3M8EKYrcn+6WXLU4FOzFv2oVJp0yyF+xipZVssRthitwFApHkg70gmMOBDYa6iu5iOkfFOKvdVsAHMnnFpgK/5wpQpDJQwaUKrEicVBs0pDFtqAwDuGA=
bf5d863b-aba6-4a53-a980-0f19928d52af	8a3efcf6-3321-4571-8714-f3a3fc77fa25	priority	100
a5653c38-9f14-45df-a788-897dde5f25bc	496d9375-61e9-44bb-a98f-2b0731da9043	priority	100
465b7d41-4b67-4d36-a26a-77d1b7c9f0bc	496d9375-61e9-44bb-a98f-2b0731da9043	keyUse	SIG
2e4b890f-a6fb-4b4b-a006-80e3677eafc5	496d9375-61e9-44bb-a98f-2b0731da9043	certificate	MIIClTCCAX0CBgGZOlsGMTANBgkqhkiG9w0BAQsFADAOMQwwCgYDVQQDDANkbXMwHhcNMjUwOTExMTk1NjA3WhcNMzUwOTExMTk1NzQ3WjAOMQwwCgYDVQQDDANkbXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCiwjPBFvv4hy8g+v5EtX6qZvTIjtWSW+MKShl2uw0KEtW8TPefpGdcmsa89+LlT17R54knQq9F8S8Kc/r7aO4ChCKdGddtdB8y3hOJQsyRx9L28sEZlaz2zCdGyut1NzUTlj5ph9ZkndSvmQGj4hPnkly/JxDUxqP/PBfzeVw2gUyZWQWGYCirWtlWFpUXPLcN2kXMdrtYzB9iuC8wIzLXSNgEhW7uwf65Bdqxyxj1h2QV6tOLKRdKKgJmV8dRqS4/zY7wXO//P5JMOb9qZAL6cKQjisD3yjUURRCit1LUoSrDYD2Kic+R0FnY14KFTwupMEiTXOP+aq+xc+O8ub0FAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAFMVG+mkXMo0GySQXmwN1slZWaC24sdZzEhms26bEpPRaxIgrYylO/zFZVGAcM4YmvNQNxInzJxt32SobFsEuqFyJX23NN6rAWWHBOab2Tr58Hq8e8/NAPUsP4hyioju4XY9od0bwKpv8O595/3TbnPoDS/zfTnWNcNUxBD52/3ByvaP3X0xT8dzk6EfXcMkmBRVT/wzFQ8y0bemFq5dE5kRReN8C8gYlKK+lzf9IwOJGeegQmzWY2W4obZfRlohk84WTBLA97iBQ3RPEG4tmk0GJQa364SSbnZBLtOr93hBxuVl8EZ7ONqmjCPWKkcsUxIEQdsGPz11j40HkdbGzJ8=
bed08f27-fbff-42ab-8161-99cec45fa397	496d9375-61e9-44bb-a98f-2b0731da9043	privateKey	MIIEowIBAAKCAQEAosIzwRb7+IcvIPr+RLV+qmb0yI7VklvjCkoZdrsNChLVvEz3n6RnXJrGvPfi5U9e0eeJJ0KvRfEvCnP6+2juAoQinRnXbXQfMt4TiULMkcfS9vLBGZWs9swnRsrrdTc1E5Y+aYfWZJ3Ur5kBo+IT55JcvycQ1Maj/zwX83lcNoFMmVkFhmAoq1rZVhaVFzy3DdpFzHa7WMwfYrgvMCMy10jYBIVu7sH+uQXascsY9YdkFerTiykXSioCZlfHUakuP82O8Fzv/z+STDm/amQC+nCkI4rA98o1FEUQordS1KEqw2A9ionPkdBZ2NeChU8LqTBIk1zj/mqvsXPjvLm9BQIDAQABAoIBAA9Viae7ASFQpzWNwC/8A4ONcKmGn4OLCbB5+70ucVOOI7n6bGgLhrt4T5oVJrjhCfdvv4HF7BqEVyC+fZp7L9Vn2pT/jsbepmPV/XQ0qW5gq7UdeOjuq52S7W5jhtyDx4nhYV7y79WJ8zRaD4f/sE1kgj12MkVBs8jDwiPrvq7ZyCqu5ks/OR8D3WheESKMBIty8mIKFtTGnvcH3NzYcdeeEg9fNIFSHPJjSAjz1GDebPPnC0YUHk+kjticI+mLwDHUJseueAiSROLSWwxwASuOPHz+zLdRfFbrNmzdoGpVc0yX15olWcWiRhox4JMmPd8zlKV0UdTfZQZt0BxkTj8CgYEA287GA5bwcrektld7wO0C3egWT2FdkYQmniZpytzpKyTke3rIFySpcUciaV76T0D+zpb39GlLpq8A3ldWsh1/gb7OQ07FTVMVUfzyKRcI2sZHyzWXE5eL41g0P3RVskX3/s10KE54QaLotlCOUjG4CyeNGdIYTbSzc2N3UQEY8aMCgYEAvY65BzHbHtvZ8Puu0BOKYdMXyFsdxVsbI9a2q5u/64rXjZavZX29qMR9XogzuHMDRiWfF7ikT7eBLvSyqKF9AAtRJ8ZGXP7zJslpzDu4oEWZBJQC58THEkMUre+rb8JuJY2Z0Qgz+GfC5Qqzq3bRhei2CGxGS7u+lBBXTv+GETcCgYEAup7R69ZJC3zzsYSRI3mXR4R2/Kpz4MpMZ1XB2GS66tCF1HioTU3pNq3of4IODx/ltszidHa5rilDGYMZrlvxF91CDk9goIf7wAJ8L3rJH8XcyqETRaUTNdB7e6xv3c4eAg25o0cMPt3rqm62hv6DfaT03YlM7RyQh1VZxkKiRPUCgYBNCpDRB8ZTCG/Prbsi/o4jrDPiToYPDDQ/oKilnqumA8wP08p9qVlIGnQJ07mRoc0W2XuLnJPLgn2SpAlo2BmBxxe43rECYuxYO0wwoaUsHp1OawmzQRrXpUPmXZ6D0bYKtT5q4racoy9m/65+ZdBKaIZzbe40IZ4Xd3zEsr2+iQKBgBEHSWYhb6h9iiHwYsABTsPPhmtbG1WphEm7DwVCU+GqKSOuDz40CnmiQz6GC+o7OwVDejzmCG08n7Hs476HxQ8k739/KdxmBMuAIgZCG4/X1bVWYJgIhMgnNiq+WsOo9S05ad62K8Hb2PuzBZi+zrxSoEipkpiO1b2LMal8BW+3
93e0f94c-ee64-4eac-bdf9-3812222e7fdb	434fa5a9-6254-4358-a8ea-ef6b0e78f6eb	kid	a0b61548-1cdf-490e-bab5-eee4096d9ebc
ad0863f7-33ff-4664-b596-564c92682f8c	434fa5a9-6254-4358-a8ea-ef6b0e78f6eb	secret	ZlC2h4CEZ9K1s2VIamraqqKu1bllCz7t33ntmFedOnkyNyQfiYp1KjuVSkterK-V9pkpl2r_t1D0CxLT8hd8ZQ1OLQsF_Z5ibncOafKhGOkJajHxu-dyBe_23472SuyOUxXlsJuw7cb3uClCOzNolXaojJX1k17-_NHJ-qKh5Ec
57a64d0f-c799-45bc-b5c5-f54ddee06e96	434fa5a9-6254-4358-a8ea-ef6b0e78f6eb	priority	100
01c571c3-4d71-4754-b272-d7020a78716a	434fa5a9-6254-4358-a8ea-ef6b0e78f6eb	algorithm	HS512
1c1286d5-6b2f-45dd-a7da-4187500b51d2	a5a2af5f-df83-491f-9b38-ce63dc89f1d7	kid	b65fe001-2676-4bc7-a32d-04f178b6bda1
049d53bb-83ef-427e-9b6e-ed55a878bd41	a5a2af5f-df83-491f-9b38-ce63dc89f1d7	secret	pp4ezezECuOnMq1A0-Buiw
be5b8a50-d863-4782-a26a-af67696ccf9b	a5a2af5f-df83-491f-9b38-ce63dc89f1d7	priority	100
0ae058e6-2ed9-4f96-89e5-40d94172bffe	b7db451c-bb0d-4b3c-9fa5-5d8d693a32a8	max-clients	200
b8290bac-cf3e-4248-8ddb-330dfd234985	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	oidc-address-mapper
457d61a8-bbd9-42c8-bb4f-c38ed86bee2a	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	saml-user-attribute-mapper
37991a33-e0e2-4fe3-bf91-d0e5f34058e2	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
5c50169f-d8c3-40d9-a70c-08b7daefd6ec	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
79409a9c-b81f-43f8-92bb-e35f3ab0f5fa	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	oidc-full-name-mapper
005bfc35-8948-4584-8cfb-f1df18616239	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	saml-role-list-mapper
4d36b16d-6fb2-4103-92b0-dacb9f0204a7	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
7229d0ad-9dc0-4df3-847c-95a16ef74ed1	704f8996-9974-4785-98a8-d8a9359b0f28	allowed-protocol-mapper-types	saml-user-property-mapper
e65cd516-eda1-4384-a950-c9daf5d42ee6	fb7dd853-ac80-420d-ad98-94a97d28b78e	allow-default-scopes	true
ebc826e4-7807-4c43-85c8-ad9d589953da	71afab88-f77c-4804-a799-f84032d894ed	host-sending-registration-request-must-match	true
35e775e4-990a-4266-ad07-c7c58bbf0378	71afab88-f77c-4804-a799-f84032d894ed	client-uris-must-match	true
86ad6914-d0b4-4b16-ae42-28528261effa	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	oidc-sha256-pairwise-sub-mapper
85ebc412-a205-4bff-b2c9-464705451536	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	saml-role-list-mapper
4d00ff08-79d3-40fa-b53d-065cbdc3c3e0	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	saml-user-attribute-mapper
814fe5cf-9b62-473d-a52b-0ed9845f5a22	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	oidc-usermodel-attribute-mapper
305a1800-4090-4f5b-a97c-d89dcc7a77b4	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	oidc-usermodel-property-mapper
b5c3c27c-4125-4f84-87e2-2d65a7600e83	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	saml-user-property-mapper
387fcc81-649b-4ac4-9216-1e0ac129a759	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	oidc-address-mapper
010c1e34-b06b-4c3e-862b-54de7cf579e5	8ea9d43f-2dd2-48fd-bdbc-18b1ac9d25a3	allowed-protocol-mapper-types	oidc-full-name-mapper
a4bd89a5-a522-42ef-9f70-531bc26e9106	b371cb95-1113-4730-ab38-653b503b51be	allow-default-scopes	true
\.


--
-- Data for Name: composite_role; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.composite_role (composite, child_role) FROM stdin;
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	cc03c3d0-d44e-478e-b8fa-0b1bc0cd738c
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	f91d0c5f-dec2-401d-aa1c-90ade8559f15
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	d16bf32a-6cb8-4635-b10d-2bfeec791b93
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	eca0f5d2-9766-49da-8c43-5a89e4ad5e40
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	61808f76-54c2-4163-9e41-e3345dfdf02b
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	72dc379a-b581-4726-b12a-582612e5236a
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	97a647ac-12c7-4a26-9ced-8aee721dc7da
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	e6d844e2-8617-4a8f-bdcd-f69c8d67e8ac
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	508ff20e-83af-41e0-9a2b-2c6542092407
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	23c78dfb-ddfd-45cb-af48-358d906f0e92
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	7418ec5e-22bd-48f9-9246-48d78b15ebc7
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	0f988b2e-7061-4099-a8bb-85629640e712
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	fa7bfc9b-e29c-44ae-b08b-7ec3354efff0
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	8cff8610-247f-484c-ab92-8072881fb47d
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	87768505-9c26-4698-972a-8dcd9777008c
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	deec2e33-229f-47e5-9265-77d16aec3681
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	56d5bd8d-6a2f-4032-a307-a66088e58c61
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	d8fa7ebb-3ae7-4500-945b-0e24e36c39fa
23014211-f23b-49fb-9a40-f3d051e9bfc4	5c42e1e7-bc5f-4ef3-b6d5-4a10c1183366
61808f76-54c2-4163-9e41-e3345dfdf02b	deec2e33-229f-47e5-9265-77d16aec3681
eca0f5d2-9766-49da-8c43-5a89e4ad5e40	d8fa7ebb-3ae7-4500-945b-0e24e36c39fa
eca0f5d2-9766-49da-8c43-5a89e4ad5e40	87768505-9c26-4698-972a-8dcd9777008c
23014211-f23b-49fb-9a40-f3d051e9bfc4	61887019-be21-42e7-b934-8967f0f0644a
61887019-be21-42e7-b934-8967f0f0644a	b5b49e6c-96fd-4eb8-a852-7c5e0451ed28
ba78e9ee-d4ee-4972-bf75-2566103d3983	ac72b046-cd39-44aa-96b6-3e21c3ec6c43
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	1e47b0d8-936a-447e-817f-d032e406b17a
23014211-f23b-49fb-9a40-f3d051e9bfc4	aa426c38-9fa9-4b62-b30e-e97659a0123b
23014211-f23b-49fb-9a40-f3d051e9bfc4	b1a8211b-f12d-4e8d-83b4-348c4ddd46ec
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	671da319-92a8-46e9-a232-6954db3c1845
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	8cb8a83d-84f6-405a-9a23-2346efa19288
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	33ab4524-5a22-48e3-8891-d32e84624e5d
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	3f1280b8-7f3b-4e43-801d-41f7aa9107cd
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	48dd59cb-dc8c-4a77-8c95-d5ecd0ffcaef
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	02e27940-7798-43a0-a5c8-14d130591190
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	b1af9242-b0d8-4688-b776-f10768ae1eb6
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	c9d90454-2810-4ddd-b6b7-a3267abfe03c
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	ca071bf8-880e-4520-8bcc-71df14e5303c
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	1e38e9b1-9f36-4544-a938-01f4133fb48f
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	f563e78d-4426-4110-93a0-e4e1c8259e3c
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	f389c48a-7abd-4f59-92b8-84fdbd41c70e
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	38994d60-0847-4d05-bef6-26dd33cbe1cc
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	6e6234ed-314f-4d67-a5ee-f317404538b5
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	d9bd0b69-710c-4503-a0a6-5981ca13472e
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	1413c700-3d30-45ed-961f-724b1bea5f02
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	c8d71e1a-28cc-4bbe-90e2-ac3f9808f337
33ab4524-5a22-48e3-8891-d32e84624e5d	6e6234ed-314f-4d67-a5ee-f317404538b5
33ab4524-5a22-48e3-8891-d32e84624e5d	c8d71e1a-28cc-4bbe-90e2-ac3f9808f337
3f1280b8-7f3b-4e43-801d-41f7aa9107cd	d9bd0b69-710c-4503-a0a6-5981ca13472e
e6cd60f2-1123-4e96-be63-c454420fed55	80d84ac3-657f-4ae8-b018-34c859d6a2b4
e6cd60f2-1123-4e96-be63-c454420fed55	d4b52669-57d4-4c7b-bc06-65a966054f5e
e6cd60f2-1123-4e96-be63-c454420fed55	93907302-505a-4816-ab0c-a8b2fc4913dd
e6cd60f2-1123-4e96-be63-c454420fed55	db29765c-49cb-4b1e-9292-ca13669f65fe
e6cd60f2-1123-4e96-be63-c454420fed55	f03fb90c-6a82-4363-b6d3-44a5ef4b9dea
e6cd60f2-1123-4e96-be63-c454420fed55	e7cd2174-a122-4554-b41b-5b20ce15f066
e6cd60f2-1123-4e96-be63-c454420fed55	abc110b5-8c53-40c6-9246-edf89811a776
e6cd60f2-1123-4e96-be63-c454420fed55	71a66010-89f2-4a91-a25d-d2dc1d1868c5
e6cd60f2-1123-4e96-be63-c454420fed55	50b999d8-6a76-4302-8036-c0c37ac6f5bd
e6cd60f2-1123-4e96-be63-c454420fed55	63feff10-b29e-47c1-a062-3c1192e54112
e6cd60f2-1123-4e96-be63-c454420fed55	252a614c-7055-4f48-8b97-d4ad65dbb410
e6cd60f2-1123-4e96-be63-c454420fed55	f4449489-7d69-499a-b978-a4136b5736ed
e6cd60f2-1123-4e96-be63-c454420fed55	cdff266b-3066-4660-a3b3-03070f0474b6
e6cd60f2-1123-4e96-be63-c454420fed55	b647e849-7197-4da1-83bf-79ea56bbe012
e6cd60f2-1123-4e96-be63-c454420fed55	05e85317-d745-4fbb-8b24-6b57dd7305e6
e6cd60f2-1123-4e96-be63-c454420fed55	85bd92ce-2046-4468-8d7d-1b472c3e74fa
e6cd60f2-1123-4e96-be63-c454420fed55	e1d396f2-2323-48cb-9b83-2dd1ab8496b9
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	1c00d0ee-2a55-4503-803b-449daf4a0e80
93907302-505a-4816-ab0c-a8b2fc4913dd	b647e849-7197-4da1-83bf-79ea56bbe012
93907302-505a-4816-ab0c-a8b2fc4913dd	e1d396f2-2323-48cb-9b83-2dd1ab8496b9
db29765c-49cb-4b1e-9292-ca13669f65fe	05e85317-d745-4fbb-8b24-6b57dd7305e6
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	a04202f4-273b-4c98-91ee-df86070ee45d
a04202f4-273b-4c98-91ee-df86070ee45d	de4a665c-bfb0-4f67-8621-72cecfe6bb8f
c857678b-98a0-460d-9a36-b97b4a0d2e75	d8e93245-50fc-4fca-b21b-8ad25fcdfae0
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	d348e466-335d-40d2-b46b-9aae1dcad06f
e6cd60f2-1123-4e96-be63-c454420fed55	39140e2d-6e6f-45ba-a166-67e15fa8d52d
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	0cc23704-3099-4481-af93-2afe9e9fa6fc
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	bd0b968e-3618-446f-b318-e1fa36ec38c6
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	ab3a42f2-9a18-4c69-ba53-d6971dc333f2
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	bd0b968e-3618-446f-b318-e1fa36ec38c6
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	0cc23704-3099-4481-af93-2afe9e9fa6fc
\.


--
-- Data for Name: credential; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.credential (id, salt, type, user_id, created_date, user_label, secret_data, credential_data, priority) FROM stdin;
e6da6581-ae63-43ef-bf7d-135194f6984b	\N	password	e5fcd2a3-597c-438a-ba74-66ba70b13a1e	1757620667226	\N	{"value":"MlmfRfoMeaFCZXjygNddjKyVSb1FI7BqnvgEnp3GLRk=","salt":"g9Mx7s648EtoC0X8M6cxEw==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
8078aba0-1eda-4c2b-97fa-14cb7600923e	\N	password	852d8fd1-a1e2-4d40-a375-c2900b7d9c03	1757620667356	\N	{"value":"/xXocQs2/rSF4YQ8Y6xg8/qMXyMobI0VLxLsdJzokO8=","salt":"jT4ZwQCarC66+nioAvIt+g==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
e478182d-09d0-4021-bf95-63935739c619	\N	password	8e5753e6-cbdf-4219-89d3-3c5108678cd7	1757620668747	\N	{"value":"+aLCMQki69pCIk4KXqC9efM9obaqLzEzvoXOxVTfQFI=","salt":"1kP+sQvSZnnIXtxF4OEong==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
d2362142-9252-4c5b-b6ed-b6263c16cec5	\N	password	cb1337a2-5f7a-4324-817e-6a84b1330fd3	1757728027110	\N	{"value":"HFQ5hRaHVMGjCr2N7mea4Zf1A4kgJI4aVkClBOnIL6Y=","salt":"Dbl2uYaZlYKJhQP5gDdT0g==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
a49fbd1d-f04c-454e-9d3c-2430a786fcbb	\N	password	311dc854-b518-4dd9-b59e-fdb48c762bc2	1757728091833	\N	{"value":"5yv5TDaj1YMxPAnAWsH5jz/Rzuvc9WNkEsDwiqarIIM=","salt":"PzjQ/GeC4oBgIQrdI2ewTQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
95850524-4583-45e8-a730-51c7be0e8a20	\N	password	da57798b-8b15-437b-8007-a657ba40d782	1757864371234	My password	{"value":"/sREhU4UACHVNEDtvwcmAoVutgo9gg80gmkjHYUOQzY=","salt":"q2mM/UitWhCq8RDfj5krhw==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
d708b373-72b9-47c1-b82a-6936656b69e3	\N	password	f922afa3-824a-4ba6-9db7-211230451b1b	1757943077611	My password	{"value":"s1fIiklOZlURF721BETCiFf/Z/xxGsiLPDSt7lrLbfQ=","salt":"hqEdhlAlfIopj7m4VfDr4A==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
2e73fd2a-41ba-4fce-a03f-c62f40fc4eda	\N	password	6cad6b70-1a00-435c-bae3-86078903a491	1757899105527	\N	{"value":"ZPwRzV0X2UniiWMmzJZlVIcsvl13oJ+8rz66pltlOb8=","salt":"tudk6qlFIZfe1xk3evrmdA==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
3443f64d-fa52-4f91-9971-b26161fbb184	\N	password	853d7973-acfd-42ba-9e48-899a7f759b96	1757966425004	My password	{"value":"5uA23QqcyX1oSfsN40xW2ZE+Kjc/F0GGudysC9aAfUI=","salt":"EP5EjfTqIRXMTmLMZMGNdg==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
63c5f712-315b-4acd-b968-9eed437b4a79	\N	password	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	1757899381466	\N	{"value":"68WZeY5KLSMzEWk7mNoey8jHP8qfvlLvJbP8RH95uiU=","salt":"OX4/vtzqZWg5lIgnpDcJ6Q==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
7b959c5e-77ff-404e-b097-6560e67895cd	\N	password	db3c1a36-e081-4712-bd15-459cc902695a	1757982134899	My password	{"value":"JCKE7ZYIzmyBo6VHWfeX+sBre51KaWcXwEwDPxLcsnc=","salt":"bqbzrtpQpwFRsSygJMLHxw==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
9845e05f-8f7f-4998-83c2-a45dbb2e326c	\N	password	cc56a011-3af1-4c05-95e2-91f5a38fbb29	1757968434154	My password	{"value":"G/hwOsTSkvSvHeTQKzbT9VnypYAuwMrPnHWA9PBZtWg=","salt":"yGVOaX2M0rgSn6aSmi2k6Q==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
d760fc15-b6ad-4cd8-b003-827c99f73c01	\N	password	d0909c2e-0ab0-4219-a6c0-45b68e3f1e18	1757969502476	My password	{"value":"LbBfDZ4OCrpUh/9MpiFjQRYIYIOrFZGvLSA1rf6rq1k=","salt":"8w42xRd8+NB3flbI9WNcQw==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
305d1e7a-5507-42b8-8e11-0fc5da0a10f1	\N	password	f67ae4d7-31a6-4727-8404-650ee3ff9874	1758186985888	My password	{"value":"ZMjoOmCeteTu4xr1HXMxf/bpkLjszwRNm/+phR/GCq4=","salt":"DA88lnsR5fG0egimPXwJ8Q==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
5cf111e5-4892-43b1-8577-ebcb62873883	\N	password	021627ec-a61d-496a-8b7a-0c6755f8e916	1758194409224	My password	{"value":"3Rgd8vcOlXAo/9Wg096frSMzB3X0UmAgC2BX83qe8So=","salt":"AEoQhKQZVFpAc1tdbuBfJw==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
e4356ffe-2ee8-432a-bb0a-162e56ff574f	\N	password	0d28997f-5453-49f4-af0c-e6fcbaf19650	1758221371763	My password	{"value":"pZM8LZFRdgcJNVTZNJiiha4b+Tmykr9uv0D7VxEWJaw=","salt":"FUEs2aV9u24bsTDmrzJ3wQ==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
d19cb213-4e8d-4dbc-bea1-9b40c7e12e05	\N	password	981a3974-7052-44dc-a99c-04d43bbb346b	1758303790784	My password	{"value":"N7n3/iZS8YEZJhPxOGyEvyepY8fXYioKBiSAA18LEGg=","salt":"CA/SQOf0KCxgwf3vzpKj6w==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
2db48ca6-029c-472f-bde2-f084989bed5e	\N	password	21a08902-ac63-4c69-85d2-0101af397d5b	1758314525004	My password	{"value":"uSSm8X3/jHAaKEJaNdaPeAuFzdrgCH7UUPQ0AS4CiC0=","salt":"FUU8MQp9SSSpcQy66P2oCA==","additionalParameters":{}}	{"hashIterations":5,"algorithm":"argon2","additionalParameters":{"hashLength":["32"],"memory":["7168"],"type":["id"],"version":["1.3"],"parallelism":["1"]}}	10
\.


--
-- Data for Name: databasechangelog; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.databasechangelog (id, author, filename, dateexecuted, orderexecuted, exectype, md5sum, description, comments, tag, liquibase, contexts, labels, deployment_id) FROM stdin;
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/jpa-changelog-1.0.0.Final.xml	2025-09-11 19:41:47.059694	1	EXECUTED	9:6f1016664e21e16d26517a4418f5e3df	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	7619705969
1.0.0.Final-KEYCLOAK-5461	sthorger@redhat.com	META-INF/db2-jpa-changelog-1.0.0.Final.xml	2025-09-11 19:41:47.115557	2	MARK_RAN	9:828775b1596a07d1200ba1d49e5e3941	createTable tableName=APPLICATION_DEFAULT_ROLES; createTable tableName=CLIENT; createTable tableName=CLIENT_SESSION; createTable tableName=CLIENT_SESSION_ROLE; createTable tableName=COMPOSITE_ROLE; createTable tableName=CREDENTIAL; createTable tab...		\N	4.29.1	\N	\N	7619705969
1.1.0.Beta1	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Beta1.xml	2025-09-11 19:41:47.193971	3	EXECUTED	9:5f090e44a7d595883c1fb61f4b41fd38	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=CLIENT_ATTRIBUTES; createTable tableName=CLIENT_SESSION_NOTE; createTable tableName=APP_NODE_REGISTRATIONS; addColumn table...		\N	4.29.1	\N	\N	7619705969
1.1.0.Final	sthorger@redhat.com	META-INF/jpa-changelog-1.1.0.Final.xml	2025-09-11 19:41:47.204457	4	EXECUTED	9:c07e577387a3d2c04d1adc9aaad8730e	renameColumn newColumnName=EVENT_TIME, oldColumnName=TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	7619705969
1.2.0.Beta1	psilva@redhat.com	META-INF/jpa-changelog-1.2.0.Beta1.xml	2025-09-11 19:41:47.433482	5	EXECUTED	9:b68ce996c655922dbcd2fe6b6ae72686	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	7619705969
1.2.0.Beta1	psilva@redhat.com	META-INF/db2-jpa-changelog-1.2.0.Beta1.xml	2025-09-11 19:41:47.450151	6	MARK_RAN	9:543b5c9989f024fe35c6f6c5a97de88e	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION; createTable tableName=PROTOCOL_MAPPER; createTable tableName=PROTOCOL_MAPPER_CONFIG; createTable tableName=...		\N	4.29.1	\N	\N	7619705969
1.2.0.RC1	bburke@redhat.com	META-INF/jpa-changelog-1.2.0.CR1.xml	2025-09-11 19:41:47.688234	7	EXECUTED	9:765afebbe21cf5bbca048e632df38336	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	7619705969
1.2.0.RC1	bburke@redhat.com	META-INF/db2-jpa-changelog-1.2.0.CR1.xml	2025-09-11 19:41:47.700909	8	MARK_RAN	9:db4a145ba11a6fdaefb397f6dbf829a1	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=MIGRATION_MODEL; createTable tableName=IDENTITY_P...		\N	4.29.1	\N	\N	7619705969
1.2.0.Final	keycloak	META-INF/jpa-changelog-1.2.0.Final.xml	2025-09-11 19:41:47.724945	9	EXECUTED	9:9d05c7be10cdb873f8bcb41bc3a8ab23	update tableName=CLIENT; update tableName=CLIENT; update tableName=CLIENT		\N	4.29.1	\N	\N	7619705969
1.3.0	bburke@redhat.com	META-INF/jpa-changelog-1.3.0.xml	2025-09-11 19:41:48.019325	10	EXECUTED	9:18593702353128d53111f9b1ff0b82b8	delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete tableName=USER_SESSION; createTable tableName=ADMI...		\N	4.29.1	\N	\N	7619705969
1.4.0	bburke@redhat.com	META-INF/jpa-changelog-1.4.0.xml	2025-09-11 19:41:48.124993	11	EXECUTED	9:6122efe5f090e41a85c0f1c9e52cbb62	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	7619705969
1.4.0	bburke@redhat.com	META-INF/db2-jpa-changelog-1.4.0.xml	2025-09-11 19:41:48.140308	12	MARK_RAN	9:e1ff28bf7568451453f844c5d54bb0b5	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	7619705969
1.5.0	bburke@redhat.com	META-INF/jpa-changelog-1.5.0.xml	2025-09-11 19:41:48.186128	13	EXECUTED	9:7af32cd8957fbc069f796b61217483fd	delete tableName=CLIENT_SESSION_AUTH_STATUS; delete tableName=CLIENT_SESSION_ROLE; delete tableName=CLIENT_SESSION_PROT_MAPPER; delete tableName=CLIENT_SESSION_NOTE; delete tableName=CLIENT_SESSION; delete tableName=USER_SESSION_NOTE; delete table...		\N	4.29.1	\N	\N	7619705969
1.6.1_from15	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-09-11 19:41:48.223199	14	EXECUTED	9:6005e15e84714cd83226bf7879f54190	addColumn tableName=REALM; addColumn tableName=KEYCLOAK_ROLE; addColumn tableName=CLIENT; createTable tableName=OFFLINE_USER_SESSION; createTable tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_US_SES_PK2, tableName=...		\N	4.29.1	\N	\N	7619705969
1.6.1_from16-pre	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-09-11 19:41:48.226376	15	MARK_RAN	9:bf656f5a2b055d07f314431cae76f06c	delete tableName=OFFLINE_CLIENT_SESSION; delete tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
1.6.1_from16	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-09-11 19:41:48.231376	16	MARK_RAN	9:f8dadc9284440469dcf71e25ca6ab99b	dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_US_SES_PK, tableName=OFFLINE_USER_SESSION; dropPrimaryKey constraintName=CONSTRAINT_OFFLINE_CL_SES_PK, tableName=OFFLINE_CLIENT_SESSION; addColumn tableName=OFFLINE_USER_SESSION; update tableName=OF...		\N	4.29.1	\N	\N	7619705969
1.6.1	mposolda@redhat.com	META-INF/jpa-changelog-1.6.1.xml	2025-09-11 19:41:48.23674	17	EXECUTED	9:d41d8cd98f00b204e9800998ecf8427e	empty		\N	4.29.1	\N	\N	7619705969
1.7.0	bburke@redhat.com	META-INF/jpa-changelog-1.7.0.xml	2025-09-11 19:41:48.321833	18	EXECUTED	9:3368ff0be4c2855ee2dd9ca813b38d8e	createTable tableName=KEYCLOAK_GROUP; createTable tableName=GROUP_ROLE_MAPPING; createTable tableName=GROUP_ATTRIBUTE; createTable tableName=USER_GROUP_MEMBERSHIP; createTable tableName=REALM_DEFAULT_GROUPS; addColumn tableName=IDENTITY_PROVIDER; ...		\N	4.29.1	\N	\N	7619705969
1.8.0	mposolda@redhat.com	META-INF/jpa-changelog-1.8.0.xml	2025-09-11 19:41:48.38969	19	EXECUTED	9:8ac2fb5dd030b24c0570a763ed75ed20	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	7619705969
1.8.0-2	keycloak	META-INF/jpa-changelog-1.8.0.xml	2025-09-11 19:41:48.397295	20	EXECUTED	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	7619705969
1.8.0	mposolda@redhat.com	META-INF/db2-jpa-changelog-1.8.0.xml	2025-09-11 19:41:48.403047	21	MARK_RAN	9:831e82914316dc8a57dc09d755f23c51	addColumn tableName=IDENTITY_PROVIDER; createTable tableName=CLIENT_TEMPLATE; createTable tableName=CLIENT_TEMPLATE_ATTRIBUTES; createTable tableName=TEMPLATE_SCOPE_MAPPING; dropNotNullConstraint columnName=CLIENT_ID, tableName=PROTOCOL_MAPPER; ad...		\N	4.29.1	\N	\N	7619705969
1.8.0-2	keycloak	META-INF/db2-jpa-changelog-1.8.0.xml	2025-09-11 19:41:48.407413	22	MARK_RAN	9:f91ddca9b19743db60e3057679810e6c	dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; update tableName=CREDENTIAL		\N	4.29.1	\N	\N	7619705969
1.9.0	mposolda@redhat.com	META-INF/jpa-changelog-1.9.0.xml	2025-09-11 19:41:48.573636	23	EXECUTED	9:bc3d0f9e823a69dc21e23e94c7a94bb1	update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=REALM; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=REALM; update tableName=REALM; customChange; dr...		\N	4.29.1	\N	\N	7619705969
1.9.1	keycloak	META-INF/jpa-changelog-1.9.1.xml	2025-09-11 19:41:48.580602	24	EXECUTED	9:c9999da42f543575ab790e76439a2679	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=PUBLIC_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	7619705969
1.9.1	keycloak	META-INF/db2-jpa-changelog-1.9.1.xml	2025-09-11 19:41:48.582561	25	MARK_RAN	9:0d6c65c6f58732d81569e77b10ba301d	modifyDataType columnName=PRIVATE_KEY, tableName=REALM; modifyDataType columnName=CERTIFICATE, tableName=REALM		\N	4.29.1	\N	\N	7619705969
1.9.2	keycloak	META-INF/jpa-changelog-1.9.2.xml	2025-09-11 19:41:49.668196	26	EXECUTED	9:fc576660fc016ae53d2d4778d84d86d0	createIndex indexName=IDX_USER_EMAIL, tableName=USER_ENTITY; createIndex indexName=IDX_USER_ROLE_MAPPING, tableName=USER_ROLE_MAPPING; createIndex indexName=IDX_USER_GROUP_MAPPING, tableName=USER_GROUP_MEMBERSHIP; createIndex indexName=IDX_USER_CO...		\N	4.29.1	\N	\N	7619705969
authz-2.0.0	psilva@redhat.com	META-INF/jpa-changelog-authz-2.0.0.xml	2025-09-11 19:41:49.840818	27	EXECUTED	9:43ed6b0da89ff77206289e87eaa9c024	createTable tableName=RESOURCE_SERVER; addPrimaryKey constraintName=CONSTRAINT_FARS, tableName=RESOURCE_SERVER; addUniqueConstraint constraintName=UK_AU8TT6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER; createTable tableName=RESOURCE_SERVER_RESOU...		\N	4.29.1	\N	\N	7619705969
authz-2.5.1	psilva@redhat.com	META-INF/jpa-changelog-authz-2.5.1.xml	2025-09-11 19:41:49.849223	28	EXECUTED	9:44bae577f551b3738740281eceb4ea70	update tableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	7619705969
2.1.0-KEYCLOAK-5461	bburke@redhat.com	META-INF/jpa-changelog-2.1.0.xml	2025-09-11 19:41:49.991288	29	EXECUTED	9:bd88e1f833df0420b01e114533aee5e8	createTable tableName=BROKER_LINK; createTable tableName=FED_USER_ATTRIBUTE; createTable tableName=FED_USER_CONSENT; createTable tableName=FED_USER_CONSENT_ROLE; createTable tableName=FED_USER_CONSENT_PROT_MAPPER; createTable tableName=FED_USER_CR...		\N	4.29.1	\N	\N	7619705969
2.2.0	bburke@redhat.com	META-INF/jpa-changelog-2.2.0.xml	2025-09-11 19:41:50.017946	30	EXECUTED	9:a7022af5267f019d020edfe316ef4371	addColumn tableName=ADMIN_EVENT_ENTITY; createTable tableName=CREDENTIAL_ATTRIBUTE; createTable tableName=FED_CREDENTIAL_ATTRIBUTE; modifyDataType columnName=VALUE, tableName=CREDENTIAL; addForeignKeyConstraint baseTableName=FED_CREDENTIAL_ATTRIBU...		\N	4.29.1	\N	\N	7619705969
2.3.0	bburke@redhat.com	META-INF/jpa-changelog-2.3.0.xml	2025-09-11 19:41:50.081124	31	EXECUTED	9:fc155c394040654d6a79227e56f5e25a	createTable tableName=FEDERATED_USER; addPrimaryKey constraintName=CONSTR_FEDERATED_USER, tableName=FEDERATED_USER; dropDefaultValue columnName=TOTP, tableName=USER_ENTITY; dropColumn columnName=TOTP, tableName=USER_ENTITY; addColumn tableName=IDE...		\N	4.29.1	\N	\N	7619705969
2.4.0	bburke@redhat.com	META-INF/jpa-changelog-2.4.0.xml	2025-09-11 19:41:50.089106	32	EXECUTED	9:eac4ffb2a14795e5dc7b426063e54d88	customChange		\N	4.29.1	\N	\N	7619705969
2.5.0	bburke@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-09-11 19:41:50.097014	33	EXECUTED	9:54937c05672568c4c64fc9524c1e9462	customChange; modifyDataType columnName=USER_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
2.5.0-unicode-oracle	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-09-11 19:41:50.101405	34	MARK_RAN	9:3a32bace77c84d7678d035a7f5a8084e	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	7619705969
2.5.0-unicode-other-dbs	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-09-11 19:41:50.149797	35	EXECUTED	9:33d72168746f81f98ae3a1e8e0ca3554	modifyDataType columnName=DESCRIPTION, tableName=AUTHENTICATION_FLOW; modifyDataType columnName=DESCRIPTION, tableName=CLIENT_TEMPLATE; modifyDataType columnName=DESCRIPTION, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=DESCRIPTION,...		\N	4.29.1	\N	\N	7619705969
2.5.0-duplicate-email-support	slawomir@dabek.name	META-INF/jpa-changelog-2.5.0.xml	2025-09-11 19:41:50.157581	36	EXECUTED	9:61b6d3d7a4c0e0024b0c839da283da0c	addColumn tableName=REALM		\N	4.29.1	\N	\N	7619705969
2.5.0-unique-group-names	hmlnarik@redhat.com	META-INF/jpa-changelog-2.5.0.xml	2025-09-11 19:41:50.165451	37	EXECUTED	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	7619705969
2.5.1	bburke@redhat.com	META-INF/jpa-changelog-2.5.1.xml	2025-09-11 19:41:50.171081	38	EXECUTED	9:a2b870802540cb3faa72098db5388af3	addColumn tableName=FED_USER_CONSENT		\N	4.29.1	\N	\N	7619705969
3.0.0	bburke@redhat.com	META-INF/jpa-changelog-3.0.0.xml	2025-09-11 19:41:50.177552	39	EXECUTED	9:132a67499ba24bcc54fb5cbdcfe7e4c0	addColumn tableName=IDENTITY_PROVIDER		\N	4.29.1	\N	\N	7619705969
3.2.0-fix	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-09-11 19:41:50.180067	40	MARK_RAN	9:938f894c032f5430f2b0fafb1a243462	addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	7619705969
3.2.0-fix-with-keycloak-5416	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-09-11 19:41:50.18474	41	MARK_RAN	9:845c332ff1874dc5d35974b0babf3006	dropIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS; addNotNullConstraint columnName=REALM_ID, tableName=CLIENT_INITIAL_ACCESS; createIndex indexName=IDX_CLIENT_INIT_ACC_REALM, tableName=CLIENT_INITIAL_ACCESS		\N	4.29.1	\N	\N	7619705969
3.2.0-fix-offline-sessions	hmlnarik	META-INF/jpa-changelog-3.2.0.xml	2025-09-11 19:41:50.1928	42	EXECUTED	9:fc86359c079781adc577c5a217e4d04c	customChange		\N	4.29.1	\N	\N	7619705969
3.2.0-fixed	keycloak	META-INF/jpa-changelog-3.2.0.xml	2025-09-11 19:41:53.504834	43	EXECUTED	9:59a64800e3c0d09b825f8a3b444fa8f4	addColumn tableName=REALM; dropPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_PK2, tableName=OFFLINE_CLIENT_SESSION; dropColumn columnName=CLIENT_SESSION_ID, tableName=OFFLINE_CLIENT_SESSION; addPrimaryKey constraintName=CONSTRAINT_OFFL_CL_SES_P...		\N	4.29.1	\N	\N	7619705969
3.3.0	keycloak	META-INF/jpa-changelog-3.3.0.xml	2025-09-11 19:41:53.516255	44	EXECUTED	9:d48d6da5c6ccf667807f633fe489ce88	addColumn tableName=USER_ENTITY		\N	4.29.1	\N	\N	7619705969
authz-3.4.0.CR1-resource-server-pk-change-part1	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-09-11 19:41:53.526263	45	EXECUTED	9:dde36f7973e80d71fceee683bc5d2951	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_RESOURCE; addColumn tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	7619705969
authz-3.4.0.CR1-resource-server-pk-change-part2-KEYCLOAK-6095	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-09-11 19:41:53.537273	46	EXECUTED	9:b855e9b0a406b34fa323235a0cf4f640	customChange		\N	4.29.1	\N	\N	7619705969
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-09-11 19:41:53.539703	47	MARK_RAN	9:51abbacd7b416c50c4421a8cabf7927e	dropIndex indexName=IDX_RES_SERV_POL_RES_SERV, tableName=RESOURCE_SERVER_POLICY; dropIndex indexName=IDX_RES_SRV_RES_RES_SRV, tableName=RESOURCE_SERVER_RESOURCE; dropIndex indexName=IDX_RES_SRV_SCOPE_RES_SRV, tableName=RESOURCE_SERVER_SCOPE		\N	4.29.1	\N	\N	7619705969
authz-3.4.0.CR1-resource-server-pk-change-part3-fixed-nodropindex	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-09-11 19:41:53.845143	48	EXECUTED	9:bdc99e567b3398bac83263d375aad143	addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_POLICY; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, tableName=RESOURCE_SERVER_RESOURCE; addNotNullConstraint columnName=RESOURCE_SERVER_CLIENT_ID, ...		\N	4.29.1	\N	\N	7619705969
authn-3.4.0.CR1-refresh-token-max-reuse	glavoie@gmail.com	META-INF/jpa-changelog-authz-3.4.0.CR1.xml	2025-09-11 19:41:53.855469	49	EXECUTED	9:d198654156881c46bfba39abd7769e69	addColumn tableName=REALM		\N	4.29.1	\N	\N	7619705969
3.4.0	keycloak	META-INF/jpa-changelog-3.4.0.xml	2025-09-11 19:41:53.930386	50	EXECUTED	9:cfdd8736332ccdd72c5256ccb42335db	addPrimaryKey constraintName=CONSTRAINT_REALM_DEFAULT_ROLES, tableName=REALM_DEFAULT_ROLES; addPrimaryKey constraintName=CONSTRAINT_COMPOSITE_ROLE, tableName=COMPOSITE_ROLE; addPrimaryKey constraintName=CONSTR_REALM_DEFAULT_GROUPS, tableName=REALM...		\N	4.29.1	\N	\N	7619705969
3.4.0-KEYCLOAK-5230	hmlnarik@redhat.com	META-INF/jpa-changelog-3.4.0.xml	2025-09-11 19:41:54.463547	51	EXECUTED	9:7c84de3d9bd84d7f077607c1a4dcb714	createIndex indexName=IDX_FU_ATTRIBUTE, tableName=FED_USER_ATTRIBUTE; createIndex indexName=IDX_FU_CONSENT, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CONSENT_RU, tableName=FED_USER_CONSENT; createIndex indexName=IDX_FU_CREDENTIAL, t...		\N	4.29.1	\N	\N	7619705969
3.4.1	psilva@redhat.com	META-INF/jpa-changelog-3.4.1.xml	2025-09-11 19:41:54.470148	52	EXECUTED	9:5a6bb36cbefb6a9d6928452c0852af2d	modifyDataType columnName=VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
3.4.2	keycloak	META-INF/jpa-changelog-3.4.2.xml	2025-09-11 19:41:54.474089	53	EXECUTED	9:8f23e334dbc59f82e0a328373ca6ced0	update tableName=REALM		\N	4.29.1	\N	\N	7619705969
3.4.2-KEYCLOAK-5172	mkanis@redhat.com	META-INF/jpa-changelog-3.4.2.xml	2025-09-11 19:41:54.477758	54	EXECUTED	9:9156214268f09d970cdf0e1564d866af	update tableName=CLIENT		\N	4.29.1	\N	\N	7619705969
4.0.0-KEYCLOAK-6335	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-09-11 19:41:54.505915	55	EXECUTED	9:db806613b1ed154826c02610b7dbdf74	createTable tableName=CLIENT_AUTH_FLOW_BINDINGS; addPrimaryKey constraintName=C_CLI_FLOW_BIND, tableName=CLIENT_AUTH_FLOW_BINDINGS		\N	4.29.1	\N	\N	7619705969
4.0.0-CLEANUP-UNUSED-TABLE	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-09-11 19:41:54.51495	56	EXECUTED	9:229a041fb72d5beac76bb94a5fa709de	dropTable tableName=CLIENT_IDENTITY_PROV_MAPPING		\N	4.29.1	\N	\N	7619705969
4.0.0-KEYCLOAK-6228	bburke@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-09-11 19:41:54.588385	57	EXECUTED	9:079899dade9c1e683f26b2aa9ca6ff04	dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; dropNotNullConstraint columnName=CLIENT_ID, tableName=USER_CONSENT; addColumn tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHO...		\N	4.29.1	\N	\N	7619705969
4.0.0-KEYCLOAK-5579-fixed	mposolda@redhat.com	META-INF/jpa-changelog-4.0.0.xml	2025-09-11 19:41:55.270298	58	EXECUTED	9:139b79bcbbfe903bb1c2d2a4dbf001d9	dropForeignKeyConstraint baseTableName=CLIENT_TEMPLATE_ATTRIBUTES, constraintName=FK_CL_TEMPL_ATTR_TEMPL; renameTable newTableName=CLIENT_SCOPE_ATTRIBUTES, oldTableName=CLIENT_TEMPLATE_ATTRIBUTES; renameColumn newColumnName=SCOPE_ID, oldColumnName...		\N	4.29.1	\N	\N	7619705969
authz-4.0.0.CR1	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.CR1.xml	2025-09-11 19:41:55.315444	59	EXECUTED	9:b55738ad889860c625ba2bf483495a04	createTable tableName=RESOURCE_SERVER_PERM_TICKET; addPrimaryKey constraintName=CONSTRAINT_FAPMT, tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRHO213XCX4WNKOG82SSPMT...		\N	4.29.1	\N	\N	7619705969
authz-4.0.0.Beta3	psilva@redhat.com	META-INF/jpa-changelog-authz-4.0.0.Beta3.xml	2025-09-11 19:41:55.324835	60	EXECUTED	9:e0057eac39aa8fc8e09ac6cfa4ae15fe	addColumn tableName=RESOURCE_SERVER_POLICY; addColumn tableName=RESOURCE_SERVER_PERM_TICKET; addForeignKeyConstraint baseTableName=RESOURCE_SERVER_PERM_TICKET, constraintName=FK_FRSRPO2128CX4WNKOG82SSRFY, referencedTableName=RESOURCE_SERVER_POLICY		\N	4.29.1	\N	\N	7619705969
authz-4.2.0.Final	mhajas@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-09-11 19:41:55.336638	61	EXECUTED	9:42a33806f3a0443fe0e7feeec821326c	createTable tableName=RESOURCE_URIS; addForeignKeyConstraint baseTableName=RESOURCE_URIS, constraintName=FK_RESOURCE_SERVER_URIS, referencedTableName=RESOURCE_SERVER_RESOURCE; customChange; dropColumn columnName=URI, tableName=RESOURCE_SERVER_RESO...		\N	4.29.1	\N	\N	7619705969
authz-4.2.0.Final-KEYCLOAK-9944	hmlnarik@redhat.com	META-INF/jpa-changelog-authz-4.2.0.Final.xml	2025-09-11 19:41:55.34456	62	EXECUTED	9:9968206fca46eecc1f51db9c024bfe56	addPrimaryKey constraintName=CONSTRAINT_RESOUR_URIS_PK, tableName=RESOURCE_URIS		\N	4.29.1	\N	\N	7619705969
4.2.0-KEYCLOAK-6313	wadahiro@gmail.com	META-INF/jpa-changelog-4.2.0.xml	2025-09-11 19:41:55.349957	63	EXECUTED	9:92143a6daea0a3f3b8f598c97ce55c3d	addColumn tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	7619705969
4.3.0-KEYCLOAK-7984	wadahiro@gmail.com	META-INF/jpa-changelog-4.3.0.xml	2025-09-11 19:41:55.354273	64	EXECUTED	9:82bab26a27195d889fb0429003b18f40	update tableName=REQUIRED_ACTION_PROVIDER		\N	4.29.1	\N	\N	7619705969
4.6.0-KEYCLOAK-7950	psilva@redhat.com	META-INF/jpa-changelog-4.6.0.xml	2025-09-11 19:41:55.358498	65	EXECUTED	9:e590c88ddc0b38b0ae4249bbfcb5abc3	update tableName=RESOURCE_SERVER_RESOURCE		\N	4.29.1	\N	\N	7619705969
4.6.0-KEYCLOAK-8377	keycloak	META-INF/jpa-changelog-4.6.0.xml	2025-09-11 19:41:55.447595	66	EXECUTED	9:5c1f475536118dbdc38d5d7977950cc0	createTable tableName=ROLE_ATTRIBUTE; addPrimaryKey constraintName=CONSTRAINT_ROLE_ATTRIBUTE_PK, tableName=ROLE_ATTRIBUTE; addForeignKeyConstraint baseTableName=ROLE_ATTRIBUTE, constraintName=FK_ROLE_ATTRIBUTE_ID, referencedTableName=KEYCLOAK_ROLE...		\N	4.29.1	\N	\N	7619705969
4.6.0-KEYCLOAK-8555	gideonray@gmail.com	META-INF/jpa-changelog-4.6.0.xml	2025-09-11 19:41:55.518887	67	EXECUTED	9:e7c9f5f9c4d67ccbbcc215440c718a17	createIndex indexName=IDX_COMPONENT_PROVIDER_TYPE, tableName=COMPONENT		\N	4.29.1	\N	\N	7619705969
4.7.0-KEYCLOAK-1267	sguilhen@redhat.com	META-INF/jpa-changelog-4.7.0.xml	2025-09-11 19:41:55.526276	68	EXECUTED	9:88e0bfdda924690d6f4e430c53447dd5	addColumn tableName=REALM		\N	4.29.1	\N	\N	7619705969
4.7.0-KEYCLOAK-7275	keycloak	META-INF/jpa-changelog-4.7.0.xml	2025-09-11 19:41:55.600407	69	EXECUTED	9:f53177f137e1c46b6a88c59ec1cb5218	renameColumn newColumnName=CREATED_ON, oldColumnName=LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION; addNotNullConstraint columnName=CREATED_ON, tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_USER_SESSION; customChange; createIn...		\N	4.29.1	\N	\N	7619705969
4.8.0-KEYCLOAK-8835	sguilhen@redhat.com	META-INF/jpa-changelog-4.8.0.xml	2025-09-11 19:41:55.608505	70	EXECUTED	9:a74d33da4dc42a37ec27121580d1459f	addNotNullConstraint columnName=SSO_MAX_LIFESPAN_REMEMBER_ME, tableName=REALM; addNotNullConstraint columnName=SSO_IDLE_TIMEOUT_REMEMBER_ME, tableName=REALM		\N	4.29.1	\N	\N	7619705969
authz-7.0.0-KEYCLOAK-10443	psilva@redhat.com	META-INF/jpa-changelog-authz-7.0.0.xml	2025-09-11 19:41:55.615073	71	EXECUTED	9:fd4ade7b90c3b67fae0bfcfcb42dfb5f	addColumn tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	7619705969
8.0.0-adding-credential-columns	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-09-11 19:41:55.624941	72	EXECUTED	9:aa072ad090bbba210d8f18781b8cebf4	addColumn tableName=CREDENTIAL; addColumn tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	7619705969
8.0.0-updating-credential-data-not-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-09-11 19:41:55.640768	73	EXECUTED	9:1ae6be29bab7c2aa376f6983b932be37	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	7619705969
8.0.0-updating-credential-data-oracle-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-09-11 19:41:55.647017	74	MARK_RAN	9:14706f286953fc9a25286dbd8fb30d97	update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL; update tableName=FED_USER_CREDENTIAL		\N	4.29.1	\N	\N	7619705969
8.0.0-credential-cleanup-fixed	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-09-11 19:41:55.684491	75	EXECUTED	9:2b9cc12779be32c5b40e2e67711a218b	dropDefaultValue columnName=COUNTER, tableName=CREDENTIAL; dropDefaultValue columnName=DIGITS, tableName=CREDENTIAL; dropDefaultValue columnName=PERIOD, tableName=CREDENTIAL; dropDefaultValue columnName=ALGORITHM, tableName=CREDENTIAL; dropColumn ...		\N	4.29.1	\N	\N	7619705969
8.0.0-resource-tag-support	keycloak	META-INF/jpa-changelog-8.0.0.xml	2025-09-11 19:41:55.795453	76	EXECUTED	9:91fa186ce7a5af127a2d7a91ee083cc5	addColumn tableName=MIGRATION_MODEL; createIndex indexName=IDX_UPDATE_TIME, tableName=MIGRATION_MODEL		\N	4.29.1	\N	\N	7619705969
9.0.0-always-display-client	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-09-11 19:41:55.803519	77	EXECUTED	9:6335e5c94e83a2639ccd68dd24e2e5ad	addColumn tableName=CLIENT		\N	4.29.1	\N	\N	7619705969
9.0.0-drop-constraints-for-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-09-11 19:41:55.80591	78	MARK_RAN	9:6bdb5658951e028bfe16fa0a8228b530	dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5PMT, tableName=RESOURCE_SERVER_PERM_TICKET; dropUniqueConstraint constraintName=UK_FRSR6T700S9V50BU18WS5HA6, tableName=RESOURCE_SERVER_RESOURCE; dropPrimaryKey constraintName=CONSTRAINT_O...		\N	4.29.1	\N	\N	7619705969
9.0.0-increase-column-size-federated-fk	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-09-11 19:41:55.84267	79	EXECUTED	9:d5bc15a64117ccad481ce8792d4c608f	modifyDataType columnName=CLIENT_ID, tableName=FED_USER_CONSENT; modifyDataType columnName=CLIENT_REALM_CONSTRAINT, tableName=KEYCLOAK_ROLE; modifyDataType columnName=OWNER, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=CLIENT_ID, ta...		\N	4.29.1	\N	\N	7619705969
9.0.0-recreate-constraints-after-column-increase	keycloak	META-INF/jpa-changelog-9.0.0.xml	2025-09-11 19:41:55.845778	80	MARK_RAN	9:077cba51999515f4d3e7ad5619ab592c	addNotNullConstraint columnName=CLIENT_ID, tableName=OFFLINE_CLIENT_SESSION; addNotNullConstraint columnName=OWNER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNullConstraint columnName=REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; addNotNull...		\N	4.29.1	\N	\N	7619705969
9.0.1-add-index-to-client.client_id	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-09-11 19:41:55.919664	81	EXECUTED	9:be969f08a163bf47c6b9e9ead8ac2afb	createIndex indexName=IDX_CLIENT_ID, tableName=CLIENT		\N	4.29.1	\N	\N	7619705969
9.0.1-KEYCLOAK-12579-drop-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-09-11 19:41:55.921913	82	MARK_RAN	9:6d3bb4408ba5a72f39bd8a0b301ec6e3	dropUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	7619705969
9.0.1-KEYCLOAK-12579-add-not-null-constraint	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-09-11 19:41:55.9288	83	EXECUTED	9:966bda61e46bebf3cc39518fbed52fa7	addNotNullConstraint columnName=PARENT_GROUP, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	7619705969
9.0.1-KEYCLOAK-12579-recreate-constraints	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-09-11 19:41:55.93103	84	MARK_RAN	9:8dcac7bdf7378e7d823cdfddebf72fda	addUniqueConstraint constraintName=SIBLING_NAMES, tableName=KEYCLOAK_GROUP		\N	4.29.1	\N	\N	7619705969
9.0.1-add-index-to-events	keycloak	META-INF/jpa-changelog-9.0.1.xml	2025-09-11 19:41:56.015029	85	EXECUTED	9:7d93d602352a30c0c317e6a609b56599	createIndex indexName=IDX_EVENT_TIME, tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	7619705969
map-remove-ri	keycloak	META-INF/jpa-changelog-11.0.0.xml	2025-09-11 19:41:56.023817	86	EXECUTED	9:71c5969e6cdd8d7b6f47cebc86d37627	dropForeignKeyConstraint baseTableName=REALM, constraintName=FK_TRAF444KK6QRKMS7N56AIWQ5Y; dropForeignKeyConstraint baseTableName=KEYCLOAK_ROLE, constraintName=FK_KJHO5LE2C0RAL09FL8CM9WFW9		\N	4.29.1	\N	\N	7619705969
map-remove-ri	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-09-11 19:41:56.035626	87	EXECUTED	9:a9ba7d47f065f041b7da856a81762021	dropForeignKeyConstraint baseTableName=REALM_DEFAULT_GROUPS, constraintName=FK_DEF_GROUPS_GROUP; dropForeignKeyConstraint baseTableName=REALM_DEFAULT_ROLES, constraintName=FK_H4WPD7W4HSOOLNI3H0SW7BTJE; dropForeignKeyConstraint baseTableName=CLIENT...		\N	4.29.1	\N	\N	7619705969
12.1.0-add-realm-localization-table	keycloak	META-INF/jpa-changelog-12.0.0.xml	2025-09-11 19:41:56.04891	88	EXECUTED	9:fffabce2bc01e1a8f5110d5278500065	createTable tableName=REALM_LOCALIZATIONS; addPrimaryKey tableName=REALM_LOCALIZATIONS		\N	4.29.1	\N	\N	7619705969
default-roles	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.061212	89	EXECUTED	9:fa8a5b5445e3857f4b010bafb5009957	addColumn tableName=REALM; customChange		\N	4.29.1	\N	\N	7619705969
default-roles-cleanup	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.073879	90	EXECUTED	9:67ac3241df9a8582d591c5ed87125f39	dropTable tableName=REALM_DEFAULT_ROLES; dropTable tableName=CLIENT_DEFAULT_ROLES		\N	4.29.1	\N	\N	7619705969
13.0.0-KEYCLOAK-16844	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.177235	91	EXECUTED	9:ad1194d66c937e3ffc82386c050ba089	createIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
map-remove-ri-13.0.0	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.194687	92	EXECUTED	9:d9be619d94af5a2f5d07b9f003543b91	dropForeignKeyConstraint baseTableName=DEFAULT_CLIENT_SCOPE, constraintName=FK_R_DEF_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SCOPE_CLIENT, constraintName=FK_C_CLI_SCOPE_SCOPE; dropForeignKeyConstraint baseTableName=CLIENT_SC...		\N	4.29.1	\N	\N	7619705969
13.0.0-KEYCLOAK-17992-drop-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.196994	93	MARK_RAN	9:544d201116a0fcc5a5da0925fbbc3bde	dropPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CLSCOPE_CL, tableName=CLIENT_SCOPE_CLIENT; dropIndex indexName=IDX_CL_CLSCOPE, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	7619705969
13.0.0-increase-column-size-federated	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.209629	94	EXECUTED	9:43c0c1055b6761b4b3e89de76d612ccf	modifyDataType columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; modifyDataType columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT		\N	4.29.1	\N	\N	7619705969
13.0.0-KEYCLOAK-17992-recreate-constraints	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.213916	95	MARK_RAN	9:8bd711fd0330f4fe980494ca43ab1139	addNotNullConstraint columnName=CLIENT_ID, tableName=CLIENT_SCOPE_CLIENT; addNotNullConstraint columnName=SCOPE_ID, tableName=CLIENT_SCOPE_CLIENT; addPrimaryKey constraintName=C_CLI_SCOPE_BIND, tableName=CLIENT_SCOPE_CLIENT; createIndex indexName=...		\N	4.29.1	\N	\N	7619705969
json-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-13.0.0.xml	2025-09-11 19:41:56.222843	96	EXECUTED	9:e07d2bc0970c348bb06fb63b1f82ddbf	addColumn tableName=REALM_ATTRIBUTE; update tableName=REALM_ATTRIBUTE; dropColumn columnName=VALUE, tableName=REALM_ATTRIBUTE; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=REALM_ATTRIBUTE		\N	4.29.1	\N	\N	7619705969
14.0.0-KEYCLOAK-11019	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.419795	97	EXECUTED	9:24fb8611e97f29989bea412aa38d12b7	createIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USER, tableName=OFFLINE_USER_SESSION; createIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
14.0.0-KEYCLOAK-18286	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.422464	98	MARK_RAN	9:259f89014ce2506ee84740cbf7163aa7	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
14.0.0-KEYCLOAK-18286-revert	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.449454	99	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
14.0.0-KEYCLOAK-18286-supported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.546891	100	EXECUTED	9:60ca84a0f8c94ec8c3504a5a3bc88ee8	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
14.0.0-KEYCLOAK-18286-unsupported-dbs	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.55057	101	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
KEYCLOAK-17267-add-index-to-user-attributes	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.61968	102	EXECUTED	9:0b305d8d1277f3a89a0a53a659ad274c	createIndex indexName=IDX_USER_ATTRIBUTE_NAME, tableName=USER_ATTRIBUTE		\N	4.29.1	\N	\N	7619705969
KEYCLOAK-18146-add-saml-art-binding-identifier	keycloak	META-INF/jpa-changelog-14.0.0.xml	2025-09-11 19:41:56.625894	103	EXECUTED	9:2c374ad2cdfe20e2905a84c8fac48460	customChange		\N	4.29.1	\N	\N	7619705969
15.0.0-KEYCLOAK-18467	keycloak	META-INF/jpa-changelog-15.0.0.xml	2025-09-11 19:41:56.641847	104	EXECUTED	9:47a760639ac597360a8219f5b768b4de	addColumn tableName=REALM_LOCALIZATIONS; update tableName=REALM_LOCALIZATIONS; dropColumn columnName=TEXTS, tableName=REALM_LOCALIZATIONS; renameColumn newColumnName=TEXTS, oldColumnName=TEXTS_NEW, tableName=REALM_LOCALIZATIONS; addNotNullConstrai...		\N	4.29.1	\N	\N	7619705969
17.0.0-9562	keycloak	META-INF/jpa-changelog-17.0.0.xml	2025-09-11 19:41:56.702197	105	EXECUTED	9:a6272f0576727dd8cad2522335f5d99e	createIndex indexName=IDX_USER_SERVICE_ACCOUNT, tableName=USER_ENTITY		\N	4.29.1	\N	\N	7619705969
18.0.0-10625-IDX_ADMIN_EVENT_TIME	keycloak	META-INF/jpa-changelog-18.0.0.xml	2025-09-11 19:41:56.76491	106	EXECUTED	9:015479dbd691d9cc8669282f4828c41d	createIndex indexName=IDX_ADMIN_EVENT_TIME, tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	7619705969
18.0.15-30992-index-consent	keycloak	META-INF/jpa-changelog-18.0.15.xml	2025-09-11 19:41:56.833747	107	EXECUTED	9:80071ede7a05604b1f4906f3bf3b00f0	createIndex indexName=IDX_USCONSENT_SCOPE_ID, tableName=USER_CONSENT_CLIENT_SCOPE		\N	4.29.1	\N	\N	7619705969
19.0.0-10135	keycloak	META-INF/jpa-changelog-19.0.0.xml	2025-09-11 19:41:56.838988	108	EXECUTED	9:9518e495fdd22f78ad6425cc30630221	customChange		\N	4.29.1	\N	\N	7619705969
20.0.0-12964-supported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-09-11 19:41:56.899968	109	EXECUTED	9:e5f243877199fd96bcc842f27a1656ac	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	7619705969
20.0.0-12964-unsupported-dbs	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-09-11 19:41:56.90224	110	MARK_RAN	9:1a6fcaa85e20bdeae0a9ce49b41946a5	createIndex indexName=IDX_GROUP_ATT_BY_NAME_VALUE, tableName=GROUP_ATTRIBUTE		\N	4.29.1	\N	\N	7619705969
client-attributes-string-accomodation-fixed	keycloak	META-INF/jpa-changelog-20.0.0.xml	2025-09-11 19:41:56.919087	111	EXECUTED	9:3f332e13e90739ed0c35b0b25b7822ca	addColumn tableName=CLIENT_ATTRIBUTES; update tableName=CLIENT_ATTRIBUTES; dropColumn columnName=VALUE, tableName=CLIENT_ATTRIBUTES; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
21.0.2-17277	keycloak	META-INF/jpa-changelog-21.0.2.xml	2025-09-11 19:41:56.932455	112	EXECUTED	9:7ee1f7a3fb8f5588f171fb9a6ab623c0	customChange		\N	4.29.1	\N	\N	7619705969
21.1.0-19404	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-09-11 19:41:56.96881	113	EXECUTED	9:3d7e830b52f33676b9d64f7f2b2ea634	modifyDataType columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=LOGIC, tableName=RESOURCE_SERVER_POLICY; modifyDataType columnName=POLICY_ENFORCE_MODE, tableName=RESOURCE_SERVER		\N	4.29.1	\N	\N	7619705969
21.1.0-19404-2	keycloak	META-INF/jpa-changelog-21.1.0.xml	2025-09-11 19:41:56.973836	114	MARK_RAN	9:627d032e3ef2c06c0e1f73d2ae25c26c	addColumn tableName=RESOURCE_SERVER_POLICY; update tableName=RESOURCE_SERVER_POLICY; dropColumn columnName=DECISION_STRATEGY, tableName=RESOURCE_SERVER_POLICY; renameColumn newColumnName=DECISION_STRATEGY, oldColumnName=DECISION_STRATEGY_NEW, tabl...		\N	4.29.1	\N	\N	7619705969
22.0.0-17484-updated	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-09-11 19:41:56.980913	115	EXECUTED	9:90af0bfd30cafc17b9f4d6eccd92b8b3	customChange		\N	4.29.1	\N	\N	7619705969
22.0.5-24031	keycloak	META-INF/jpa-changelog-22.0.0.xml	2025-09-11 19:41:56.984143	116	MARK_RAN	9:a60d2d7b315ec2d3eba9e2f145f9df28	customChange		\N	4.29.1	\N	\N	7619705969
23.0.0-12062	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-09-11 19:41:56.994672	117	EXECUTED	9:2168fbe728fec46ae9baf15bf80927b8	addColumn tableName=COMPONENT_CONFIG; update tableName=COMPONENT_CONFIG; dropColumn columnName=VALUE, tableName=COMPONENT_CONFIG; renameColumn newColumnName=VALUE, oldColumnName=VALUE_NEW, tableName=COMPONENT_CONFIG		\N	4.29.1	\N	\N	7619705969
23.0.0-17258	keycloak	META-INF/jpa-changelog-23.0.0.xml	2025-09-11 19:41:57.000153	118	EXECUTED	9:36506d679a83bbfda85a27ea1864dca8	addColumn tableName=EVENT_ENTITY		\N	4.29.1	\N	\N	7619705969
24.0.0-9758	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-09-11 19:41:57.233865	119	EXECUTED	9:502c557a5189f600f0f445a9b49ebbce	addColumn tableName=USER_ATTRIBUTE; addColumn tableName=FED_USER_ATTRIBUTE; createIndex indexName=USER_ATTR_LONG_VALUES, tableName=USER_ATTRIBUTE; createIndex indexName=FED_USER_ATTR_LONG_VALUES, tableName=FED_USER_ATTRIBUTE; createIndex indexName...		\N	4.29.1	\N	\N	7619705969
24.0.0-9758-2	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-09-11 19:41:57.241542	120	EXECUTED	9:bf0fdee10afdf597a987adbf291db7b2	customChange		\N	4.29.1	\N	\N	7619705969
24.0.0-26618-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-09-11 19:41:57.249345	121	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
24.0.0-26618-reindex	keycloak	META-INF/jpa-changelog-24.0.0.xml	2025-09-11 19:41:57.32461	122	EXECUTED	9:08707c0f0db1cef6b352db03a60edc7f	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
24.0.2-27228	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-09-11 19:41:57.330639	123	EXECUTED	9:eaee11f6b8aa25d2cc6a84fb86fc6238	customChange		\N	4.29.1	\N	\N	7619705969
24.0.2-27967-drop-index-if-present	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-09-11 19:41:57.332937	124	MARK_RAN	9:04baaf56c116ed19951cbc2cca584022	dropIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
24.0.2-27967-reindex	keycloak	META-INF/jpa-changelog-24.0.2.xml	2025-09-11 19:41:57.336182	125	MARK_RAN	9:d3d977031d431db16e2c181ce49d73e9	createIndex indexName=IDX_CLIENT_ATT_BY_NAME_VALUE, tableName=CLIENT_ATTRIBUTES		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-tables	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.344727	126	EXECUTED	9:deda2df035df23388af95bbd36c17cef	addColumn tableName=OFFLINE_USER_SESSION; addColumn tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.408569	127	EXECUTED	9:3e96709818458ae49f3c679ae58d263a	createIndex indexName=IDX_OFFLINE_USS_BY_LAST_SESSION_REFRESH, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-cleanup-uss-createdon	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.523268	128	EXECUTED	9:78ab4fc129ed5e8265dbcc3485fba92f	dropIndex indexName=IDX_OFFLINE_USS_CREATEDON, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-cleanup-uss-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.64632	129	EXECUTED	9:de5f7c1f7e10994ed8b62e621d20eaab	dropIndex indexName=IDX_OFFLINE_USS_PRELOAD, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-cleanup-uss-by-usersess	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.734629	130	EXECUTED	9:6eee220d024e38e89c799417ec33667f	dropIndex indexName=IDX_OFFLINE_USS_BY_USERSESS, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-cleanup-css-preload	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.824107	131	EXECUTED	9:5411d2fb2891d3e8d63ddb55dfa3c0c9	dropIndex indexName=IDX_OFFLINE_CSS_PRELOAD, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-2-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.827487	132	MARK_RAN	9:b7ef76036d3126bb83c2423bf4d449d6	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-28265-index-2-not-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.897824	133	EXECUTED	9:23396cf51ab8bc1ae6f0cac7f9f6fcf7	createIndex indexName=IDX_OFFLINE_USS_BY_BROKER_SESSION_ID, tableName=OFFLINE_USER_SESSION		\N	4.29.1	\N	\N	7619705969
25.0.0-org	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.923728	134	EXECUTED	9:5c859965c2c9b9c72136c360649af157	createTable tableName=ORG; addUniqueConstraint constraintName=UK_ORG_NAME, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_GROUP, tableName=ORG; createTable tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	7619705969
unique-consentuser	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.938984	135	EXECUTED	9:5857626a2ea8767e9a6c66bf3a2cb32f	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	7619705969
unique-consentuser-mysql	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:57.941059	136	MARK_RAN	9:b79478aad5adaa1bc428e31563f55e8e	customChange; dropUniqueConstraint constraintName=UK_JKUWUVD56ONTGSUHOGM8UEWRT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_LOCAL_CONSENT, tableName=USER_CONSENT; addUniqueConstraint constraintName=UK_EXTERNAL_CONSENT, tableName=...		\N	4.29.1	\N	\N	7619705969
25.0.0-28861-index-creation	keycloak	META-INF/jpa-changelog-25.0.0.xml	2025-09-11 19:41:58.044313	137	EXECUTED	9:b9acb58ac958d9ada0fe12a5d4794ab1	createIndex indexName=IDX_PERM_TICKET_REQUESTER, tableName=RESOURCE_SERVER_PERM_TICKET; createIndex indexName=IDX_PERM_TICKET_OWNER, tableName=RESOURCE_SERVER_PERM_TICKET		\N	4.29.1	\N	\N	7619705969
26.0.0-org-alias	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.0553	138	EXECUTED	9:6ef7d63e4412b3c2d66ed179159886a4	addColumn tableName=ORG; update tableName=ORG; addNotNullConstraint columnName=ALIAS, tableName=ORG; addUniqueConstraint constraintName=UK_ORG_ALIAS, tableName=ORG		\N	4.29.1	\N	\N	7619705969
26.0.0-org-group	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.064364	139	EXECUTED	9:da8e8087d80ef2ace4f89d8c5b9ca223	addColumn tableName=KEYCLOAK_GROUP; update tableName=KEYCLOAK_GROUP; addNotNullConstraint columnName=TYPE, tableName=KEYCLOAK_GROUP; customChange		\N	4.29.1	\N	\N	7619705969
26.0.0-org-indexes	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.133881	140	EXECUTED	9:79b05dcd610a8c7f25ec05135eec0857	createIndex indexName=IDX_ORG_DOMAIN_ORG_ID, tableName=ORG_DOMAIN		\N	4.29.1	\N	\N	7619705969
26.0.0-org-group-membership	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.14409	141	EXECUTED	9:a6ace2ce583a421d89b01ba2a28dc2d4	addColumn tableName=USER_GROUP_MEMBERSHIP; update tableName=USER_GROUP_MEMBERSHIP; addNotNullConstraint columnName=MEMBERSHIP_TYPE, tableName=USER_GROUP_MEMBERSHIP		\N	4.29.1	\N	\N	7619705969
31296-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.156421	142	EXECUTED	9:64ef94489d42a358e8304b0e245f0ed4	createTable tableName=REVOKED_TOKEN; addPrimaryKey constraintName=CONSTRAINT_RT, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	7619705969
31725-index-persist-revoked-access-tokens	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.223292	143	EXECUTED	9:b994246ec2bf7c94da881e1d28782c7b	createIndex indexName=IDX_REV_TOKEN_ON_EXPIRE, tableName=REVOKED_TOKEN		\N	4.29.1	\N	\N	7619705969
26.0.0-idps-for-login	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.379843	144	EXECUTED	9:51f5fffadf986983d4bd59582c6c1604	addColumn tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_REALM_ORG, tableName=IDENTITY_PROVIDER; createIndex indexName=IDX_IDP_FOR_LOGIN, tableName=IDENTITY_PROVIDER; customChange		\N	4.29.1	\N	\N	7619705969
26.0.0-32583-drop-redundant-index-on-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.489527	145	EXECUTED	9:24972d83bf27317a055d234187bb4af9	dropIndex indexName=IDX_US_SESS_ID_ON_CL_SESS, tableName=OFFLINE_CLIENT_SESSION		\N	4.29.1	\N	\N	7619705969
26.0.0.32582-remove-tables-user-session-user-session-note-and-client-session	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.511828	146	EXECUTED	9:febdc0f47f2ed241c59e60f58c3ceea5	dropTable tableName=CLIENT_SESSION_ROLE; dropTable tableName=CLIENT_SESSION_NOTE; dropTable tableName=CLIENT_SESSION_PROT_MAPPER; dropTable tableName=CLIENT_SESSION_AUTH_STATUS; dropTable tableName=CLIENT_USER_SESSION_NOTE; dropTable tableName=CLI...		\N	4.29.1	\N	\N	7619705969
26.0.0-33201-org-redirect-url	keycloak	META-INF/jpa-changelog-26.0.0.xml	2025-09-11 19:41:58.517515	147	EXECUTED	9:4d0e22b0ac68ebe9794fa9cb752ea660	addColumn tableName=ORG		\N	4.29.1	\N	\N	7619705969
26.0.6-34013	keycloak	META-INF/jpa-changelog-26.0.6.xml	2025-09-11 19:41:58.533038	148	EXECUTED	9:e6b686a15759aef99a6d758a5c4c6a26	addColumn tableName=ADMIN_EVENT_ENTITY		\N	4.29.1	\N	\N	7619705969
\.


--
-- Data for Name: databasechangeloglock; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.databasechangeloglock (id, locked, lockgranted, lockedby) FROM stdin;
1	f	\N	\N
1000	f	\N	\N
\.


--
-- Data for Name: default_client_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.default_client_scope (realm_id, scope_id, default_scope) FROM stdin;
79df126b-a967-4d6d-a704-427910aca988	17f11354-ab3e-4637-a044-b0d3a7cb96f0	f
79df126b-a967-4d6d-a704-427910aca988	b5ffbb59-df30-417d-9ea5-1be2a50f4549	t
79df126b-a967-4d6d-a704-427910aca988	0273a67c-24f3-405f-b65e-0cdfd9543c1c	t
79df126b-a967-4d6d-a704-427910aca988	8e35db53-eba5-48b7-a523-4236034089c7	t
79df126b-a967-4d6d-a704-427910aca988	24c516bc-17ec-445f-a5b6-2d5fa7d0b439	t
79df126b-a967-4d6d-a704-427910aca988	61d85499-a4f6-4014-9ce6-6eaa3e953109	f
79df126b-a967-4d6d-a704-427910aca988	a6cfe879-b0e0-4efa-a3a8-bd35e278903e	f
79df126b-a967-4d6d-a704-427910aca988	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0	t
79df126b-a967-4d6d-a704-427910aca988	3084e8de-8dd8-4dd6-a225-7e325a445f0d	t
79df126b-a967-4d6d-a704-427910aca988	f49b4e26-fd18-4864-93fe-5473ae7ede2f	f
79df126b-a967-4d6d-a704-427910aca988	e8febfda-03a8-4e16-a0e0-931f47c69f23	t
79df126b-a967-4d6d-a704-427910aca988	8b0f1e66-7460-4795-9698-a130e3dd2ab3	t
79df126b-a967-4d6d-a704-427910aca988	b54ccd53-5965-4171-b968-45e7190555f9	f
dms	5078f77d-e406-46dd-ba9a-5b44a7da61a7	f
dms	d3535c8e-2c6e-413c-a959-537bfb74f457	t
dms	829dea79-aaec-4aab-9644-5e1eb3ab9ef0	t
dms	1d3f166b-cea0-4e42-9371-e70ba0bbf758	t
dms	7ef4abe0-e149-4778-8028-8e0670fd53e1	t
dms	a4d3a386-873f-4a5a-9aad-cd0393ad427e	f
dms	89b76033-1e88-4d04-a353-82c236ee9cdf	f
dms	622e8197-6eeb-4caa-b47d-a3043cddd085	t
dms	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c	t
dms	d32726cb-eec1-4b40-83e3-a215c72e2c90	f
dms	85feda3f-9880-4c64-97b4-f5960523e73c	t
dms	2833783f-e469-4d0e-9b28-9290c7021119	t
dms	5e137d25-516d-4744-9da6-b9796b55439a	f
\.


--
-- Data for Name: event_entity; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.event_entity (id, client_id, details_json, error, ip_address, realm_id, session_id, event_time, type, user_id, details_json_long_value) FROM stdin;
\.


--
-- Data for Name: fed_user_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_attribute (id, name, user_id, realm_id, storage_provider_id, value, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
\.


--
-- Data for Name: fed_user_consent; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_consent (id, client_id, user_id, realm_id, storage_provider_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- Data for Name: fed_user_consent_cl_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_consent_cl_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- Data for Name: fed_user_credential; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_credential (id, salt, type, created_date, user_id, realm_id, storage_provider_id, user_label, secret_data, credential_data, priority) FROM stdin;
\.


--
-- Data for Name: fed_user_group_membership; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_group_membership (group_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: fed_user_required_action; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_required_action (required_action, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: fed_user_role_mapping; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.fed_user_role_mapping (role_id, user_id, realm_id, storage_provider_id) FROM stdin;
\.


--
-- Data for Name: federated_identity; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.federated_identity (identity_provider, realm_id, federated_user_id, federated_username, token, user_id) FROM stdin;
\.


--
-- Data for Name: federated_user; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.federated_user (id, storage_provider_id, realm_id) FROM stdin;
\.


--
-- Data for Name: group_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.group_attribute (id, name, value, group_id) FROM stdin;
\.


--
-- Data for Name: group_role_mapping; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.group_role_mapping (role_id, group_id) FROM stdin;
1f00fdf8-454e-4b28-b20c-1ea9e1533926	773aa68b-07c1-4414-b6ff-a1c7268c5a33
07804c47-a195-4401-b572-071ea8244b0f	fabe74b3-604e-4dac-9e4e-c0f812240e57
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	110c482d-e4b1-496a-bab8-5a5d13775157
bdfe503f-043c-48f5-b0ea-ed036440adef	176298ef-3f17-4ed4-8481-3635f4191812
\.


--
-- Data for Name: identity_provider; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.identity_provider (internal_id, enabled, provider_alias, provider_id, store_token, authenticate_by_default, realm_id, add_token_role, trust_email, first_broker_login_flow_id, post_broker_login_flow_id, provider_display_name, link_only, organization_id, hide_on_login) FROM stdin;
\.


--
-- Data for Name: identity_provider_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.identity_provider_config (identity_provider_id, value, name) FROM stdin;
\.


--
-- Data for Name: identity_provider_mapper; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.identity_provider_mapper (id, name, idp_alias, idp_mapper_name, realm_id) FROM stdin;
\.


--
-- Data for Name: idp_mapper_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.idp_mapper_config (idp_mapper_id, value, name) FROM stdin;
\.


--
-- Data for Name: keycloak_group; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.keycloak_group (id, name, parent_group, realm_id, type) FROM stdin;
773aa68b-07c1-4414-b6ff-a1c7268c5a33	System Administrators	 	dms	0
fabe74b3-604e-4dac-9e4e-c0f812240e57	Firm Administrators	 	dms	0
110c482d-e4b1-496a-bab8-5a5d13775157	Legal Professionals	 	dms	0
176298ef-3f17-4ed4-8481-3635f4191812	Clients	 	dms	0
\.


--
-- Data for Name: keycloak_role; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.keycloak_role (id, client_realm_constraint, client_role, description, name, realm_id, client, realm) FROM stdin;
23014211-f23b-49fb-9a40-f3d051e9bfc4	79df126b-a967-4d6d-a704-427910aca988	f	${role_default-roles}	default-roles-master	79df126b-a967-4d6d-a704-427910aca988	\N	\N
cc03c3d0-d44e-478e-b8fa-0b1bc0cd738c	79df126b-a967-4d6d-a704-427910aca988	f	${role_create-realm}	create-realm	79df126b-a967-4d6d-a704-427910aca988	\N	\N
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	79df126b-a967-4d6d-a704-427910aca988	f	${role_admin}	admin	79df126b-a967-4d6d-a704-427910aca988	\N	\N
f91d0c5f-dec2-401d-aa1c-90ade8559f15	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_create-client}	create-client	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
d16bf32a-6cb8-4635-b10d-2bfeec791b93	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-realm}	view-realm	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
eca0f5d2-9766-49da-8c43-5a89e4ad5e40	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-users}	view-users	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
61808f76-54c2-4163-9e41-e3345dfdf02b	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-clients}	view-clients	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
72dc379a-b581-4726-b12a-582612e5236a	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-events}	view-events	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
97a647ac-12c7-4a26-9ced-8aee721dc7da	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-identity-providers}	view-identity-providers	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
e6d844e2-8617-4a8f-bdcd-f69c8d67e8ac	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_view-authorization}	view-authorization	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
508ff20e-83af-41e0-9a2b-2c6542092407	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-realm}	manage-realm	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
23c78dfb-ddfd-45cb-af48-358d906f0e92	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-users}	manage-users	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
7418ec5e-22bd-48f9-9246-48d78b15ebc7	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-clients}	manage-clients	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
0f988b2e-7061-4099-a8bb-85629640e712	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-events}	manage-events	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
fa7bfc9b-e29c-44ae-b08b-7ec3354efff0	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-identity-providers}	manage-identity-providers	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
8cff8610-247f-484c-ab92-8072881fb47d	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_manage-authorization}	manage-authorization	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
87768505-9c26-4698-972a-8dcd9777008c	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_query-users}	query-users	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
deec2e33-229f-47e5-9265-77d16aec3681	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_query-clients}	query-clients	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
56d5bd8d-6a2f-4032-a307-a66088e58c61	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_query-realms}	query-realms	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
d8fa7ebb-3ae7-4500-945b-0e24e36c39fa	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_query-groups}	query-groups	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
5c42e1e7-bc5f-4ef3-b6d5-4a10c1183366	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_view-profile}	view-profile	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
61887019-be21-42e7-b934-8967f0f0644a	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_manage-account}	manage-account	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
b5b49e6c-96fd-4eb8-a852-7c5e0451ed28	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_manage-account-links}	manage-account-links	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
ada71bc6-17c5-4cd5-8063-d969b142da52	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_view-applications}	view-applications	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
ac72b046-cd39-44aa-96b6-3e21c3ec6c43	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_view-consent}	view-consent	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
ba78e9ee-d4ee-4972-bf75-2566103d3983	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_manage-consent}	manage-consent	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
cb7d892d-4359-4bdc-8739-784a1686399b	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_view-groups}	view-groups	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
4418a336-8d74-43ad-bbb7-76d1a822179e	bcb5640c-7302-48b6-a899-e78b2fd9cba2	t	${role_delete-account}	delete-account	79df126b-a967-4d6d-a704-427910aca988	bcb5640c-7302-48b6-a899-e78b2fd9cba2	\N
61a01959-380b-453a-b29e-332e86ee4253	c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	t	${role_read-token}	read-token	79df126b-a967-4d6d-a704-427910aca988	c81e1e19-bf01-40a5-98c2-ad0cca7dde7f	\N
1e47b0d8-936a-447e-817f-d032e406b17a	3935d8e7-9eaf-4b16-b997-71a7e53bef30	t	${role_impersonation}	impersonation	79df126b-a967-4d6d-a704-427910aca988	3935d8e7-9eaf-4b16-b997-71a7e53bef30	\N
aa426c38-9fa9-4b62-b30e-e97659a0123b	79df126b-a967-4d6d-a704-427910aca988	f	${role_offline-access}	offline_access	79df126b-a967-4d6d-a704-427910aca988	\N	\N
b1a8211b-f12d-4e8d-83b4-348c4ddd46ec	79df126b-a967-4d6d-a704-427910aca988	f	${role_uma_authorization}	uma_authorization	79df126b-a967-4d6d-a704-427910aca988	\N	\N
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	dms	f	${role_default-roles}	default-roles-dms-1	dms	\N	\N
671da319-92a8-46e9-a232-6954db3c1845	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_create-client}	create-client	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
8cb8a83d-84f6-405a-9a23-2346efa19288	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-realm}	view-realm	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
33ab4524-5a22-48e3-8891-d32e84624e5d	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-users}	view-users	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
3f1280b8-7f3b-4e43-801d-41f7aa9107cd	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-clients}	view-clients	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
48dd59cb-dc8c-4a77-8c95-d5ecd0ffcaef	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-events}	view-events	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
02e27940-7798-43a0-a5c8-14d130591190	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-identity-providers}	view-identity-providers	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
b1af9242-b0d8-4688-b776-f10768ae1eb6	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_view-authorization}	view-authorization	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
c9d90454-2810-4ddd-b6b7-a3267abfe03c	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-realm}	manage-realm	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
ca071bf8-880e-4520-8bcc-71df14e5303c	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-users}	manage-users	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
1e38e9b1-9f36-4544-a938-01f4133fb48f	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-clients}	manage-clients	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
f563e78d-4426-4110-93a0-e4e1c8259e3c	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-events}	manage-events	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
f389c48a-7abd-4f59-92b8-84fdbd41c70e	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-identity-providers}	manage-identity-providers	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
38994d60-0847-4d05-bef6-26dd33cbe1cc	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_manage-authorization}	manage-authorization	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
6e6234ed-314f-4d67-a5ee-f317404538b5	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_query-users}	query-users	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
d9bd0b69-710c-4503-a0a6-5981ca13472e	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_query-clients}	query-clients	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
1413c700-3d30-45ed-961f-724b1bea5f02	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_query-realms}	query-realms	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
c8d71e1a-28cc-4bbe-90e2-ac3f9808f337	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_query-groups}	query-groups	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
e6cd60f2-1123-4e96-be63-c454420fed55	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_realm-admin}	realm-admin	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
80d84ac3-657f-4ae8-b018-34c859d6a2b4	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_create-client}	create-client	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
d4b52669-57d4-4c7b-bc06-65a966054f5e	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-realm}	view-realm	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
93907302-505a-4816-ab0c-a8b2fc4913dd	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-users}	view-users	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
db29765c-49cb-4b1e-9292-ca13669f65fe	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-clients}	view-clients	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
f03fb90c-6a82-4363-b6d3-44a5ef4b9dea	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-events}	view-events	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
e7cd2174-a122-4554-b41b-5b20ce15f066	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-identity-providers}	view-identity-providers	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
abc110b5-8c53-40c6-9246-edf89811a776	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_view-authorization}	view-authorization	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
71a66010-89f2-4a91-a25d-d2dc1d1868c5	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-realm}	manage-realm	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
07804c47-a195-4401-b572-071ea8244b0f	dms	f	Firm administrator	firm_admin	dms	\N	\N
50b999d8-6a76-4302-8036-c0c37ac6f5bd	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-users}	manage-users	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
63feff10-b29e-47c1-a062-3c1192e54112	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-clients}	manage-clients	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
252a614c-7055-4f48-8b97-d4ad65dbb410	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-events}	manage-events	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
f4449489-7d69-499a-b978-a4136b5736ed	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-identity-providers}	manage-identity-providers	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
cdff266b-3066-4660-a3b3-03070f0474b6	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_manage-authorization}	manage-authorization	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
b647e849-7197-4da1-83bf-79ea56bbe012	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_query-users}	query-users	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
05e85317-d745-4fbb-8b24-6b57dd7305e6	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_query-clients}	query-clients	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
85bd92ce-2046-4468-8d7d-1b472c3e74fa	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_query-realms}	query-realms	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
e1d396f2-2323-48cb-9b83-2dd1ab8496b9	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_query-groups}	query-groups	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
1c00d0ee-2a55-4503-803b-449daf4a0e80	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_view-profile}	view-profile	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
a04202f4-273b-4c98-91ee-df86070ee45d	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_manage-account}	manage-account	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
de4a665c-bfb0-4f67-8621-72cecfe6bb8f	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_manage-account-links}	manage-account-links	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
e9759665-f7e9-4210-a750-8429ee9dfa65	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_view-applications}	view-applications	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
d8e93245-50fc-4fca-b21b-8ad25fcdfae0	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_view-consent}	view-consent	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
c857678b-98a0-460d-9a36-b97b4a0d2e75	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_manage-consent}	manage-consent	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
26675337-57a3-48db-b41e-a0bf3c9b12a3	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_view-groups}	view-groups	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
bf00d2fd-bcd9-4efa-a657-32aca2805680	ea76b321-1c97-48c9-8358-ba0939c4cc24	t	${role_delete-account}	delete-account	dms	ea76b321-1c97-48c9-8358-ba0939c4cc24	\N
d348e466-335d-40d2-b46b-9aae1dcad06f	a4d1502e-aa58-4c2f-8b18-2c088d018aad	t	${role_impersonation}	impersonation	79df126b-a967-4d6d-a704-427910aca988	a4d1502e-aa58-4c2f-8b18-2c088d018aad	\N
39140e2d-6e6f-45ba-a166-67e15fa8d52d	53ab9258-60ae-44cf-b9c9-8f2991311ce0	t	${role_impersonation}	impersonation	dms	53ab9258-60ae-44cf-b9c9-8f2991311ce0	\N
f21f0eba-d232-4436-997f-4be1a4b91522	90b333ad-f2b2-433c-9aff-1309216ef8bd	t	${role_read-token}	read-token	dms	90b333ad-f2b2-433c-9aff-1309216ef8bd	\N
0cc23704-3099-4481-af93-2afe9e9fa6fc	dms	f	${role_offline-access}	offline_access	dms	\N	\N
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	dms	f	${role_default-roles}	default-roles-dms	dms	\N	\N
1f00fdf8-454e-4b28-b20c-1ea9e1533926	dms	f	System-wide super administrator	super_admin	dms	\N	\N
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	dms	f	Legal professional	legal_professional	dms	\N	\N
d647e752-e492-47d3-a276-826d6fa6bd19	dms	f	Legal manager	legal_manager	dms	\N	\N
9262eca9-5741-4184-95a1-8f18608801ef	dms	f	Support staff	support_staff	dms	\N	\N
bdfe503f-043c-48f5-b0ea-ed036440adef	dms	f	Client user	client_user	dms	\N	\N
399d5f2b-6f6d-460d-b0ed-9bcc1e0be1fc	dms	f	External partner from another firm	external_partner	dms	\N	\N
bd0b968e-3618-446f-b318-e1fa36ec38c6	dms	f	UMA authorization role	uma_authorization	dms	\N	\N
bde9ac3b-1cd0-4787-92e3-79e3577c56d1	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	t	\N	uma_protection	dms	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
\.


--
-- Data for Name: migration_model; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.migration_model (id, version, update_time) FROM stdin;
cv666	26.0.8	1757619719
\.


--
-- Data for Name: offline_client_session; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.offline_client_session (user_session_id, client_id, offline_flag, "timestamp", data, client_storage_provider, external_client_id, version) FROM stdin;
0b23ab16-005d-4c71-b24a-bab06d6229ec	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	0	1758399615	{"authMethod":"openid-connect","redirectUri":"http://localhost:3000/api/auth/callback","notes":{"clientId":"37717b25-4fa4-4114-a1a5-df0d9ecb35ad","scope":"openid profile email","userSessionStartedAt":"1758398871","iss":"http://localhost:8081/realms/dms","startedAt":"1758398871","response_type":"code","level-of-authentication":"-1","redirect_uri":"http://localhost:3000/api/auth/callback","state":"aHR0cDovL2xvY2FsaG9zdDo1MTczL2FkbWlu","SSO_AUTH":"true"}}	local	local	2
\.


--
-- Data for Name: offline_user_session; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.offline_user_session (user_session_id, user_id, realm_id, created_on, offline_flag, data, last_session_refresh, broker_session_id, version) FROM stdin;
0b23ab16-005d-4c71-b24a-bab06d6229ec	cb1337a2-5f7a-4324-817e-6a84b1330fd3	dms	1758398871	0	{"ipAddress":"172.18.0.1","authMethod":"openid-connect","rememberMe":false,"started":0,"notes":{"KC_DEVICE_NOTE":"eyJpcEFkZHJlc3MiOiIxNzIuMTguMC4xIiwib3MiOiJMaW51eCIsIm9zVmVyc2lvbiI6IlVua25vd24iLCJicm93c2VyIjoiQ2hyb21lLzEzNi4wLjAiLCJkZXZpY2UiOiJPdGhlciIsImxhc3RBY2Nlc3MiOjAsIm1vYmlsZSI6ZmFsc2V9","AUTH_TIME":"1758398871","authenticators-completed":"{\\"3ff31f01-3f93-4963-a3ec-60c26d81a991\\":1758398871,\\"5971deeb-a649-4700-964b-d86194aeb54a\\":1758399614}"},"state":"LOGGED_IN"}	1758399615	\N	2
\.


--
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.org (id, enabled, realm_id, group_id, name, description, alias, redirect_url) FROM stdin;
\.


--
-- Data for Name: org_domain; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.org_domain (id, name, verified, org_id) FROM stdin;
\.


--
-- Data for Name: policy_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.policy_config (policy_id, name, value) FROM stdin;
\.


--
-- Data for Name: protocol_mapper; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.protocol_mapper (id, name, protocol, protocol_mapper_name, client_id, client_scope_id) FROM stdin;
a5144f90-b9ab-42dc-bd44-5f7cdd570a7f	audience resolve	openid-connect	oidc-audience-resolve-mapper	3775a915-293b-43f7-909d-bbf62865c526	\N
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	locale	openid-connect	oidc-usermodel-attribute-mapper	8f02f084-4f1d-41c9-bce2-2d6470b93af6	\N
18910298-80b4-4fbc-9a4b-8739c9b3f2aa	role list	saml	saml-role-list-mapper	\N	b5ffbb59-df30-417d-9ea5-1be2a50f4549
f4df4d32-a20b-4210-8c50-eb169ad74167	organization	saml	saml-organization-membership-mapper	\N	0273a67c-24f3-405f-b65e-0cdfd9543c1c
9ac9fa3b-e174-4e99-81ac-d11d7f154323	full name	openid-connect	oidc-full-name-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
ef035041-e878-408e-bb5b-67c30ad3b730	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
337b9056-68a3-48f6-b8fc-a78198bbc5f6	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
cb1ff9dc-9d34-4848-8775-07080a24ae3e	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	username	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
33491cae-8d70-468d-af9c-0e339574c71b	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
5149b505-df84-4835-b3e7-f1ce704cbb96	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
78e712f2-3d64-489e-a15e-ffda4f8a0660	website	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
fb37192f-84c9-455c-b185-901181144e38	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
14641bcf-7964-48d9-ab5d-61aa6b73d858	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
01593ff9-2950-45a2-86a7-ad49fe0e0426	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
b4090071-2bcf-438f-b513-ea19e93feda6	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	8e35db53-eba5-48b7-a523-4236034089c7
f2c7715d-1ae0-41dd-baa3-7909682389be	email	openid-connect	oidc-usermodel-attribute-mapper	\N	24c516bc-17ec-445f-a5b6-2d5fa7d0b439
e6d86f66-7234-4133-8bab-d4012aa91115	email verified	openid-connect	oidc-usermodel-property-mapper	\N	24c516bc-17ec-445f-a5b6-2d5fa7d0b439
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	address	openid-connect	oidc-address-mapper	\N	61d85499-a4f6-4014-9ce6-6eaa3e953109
649f6b44-473a-42d8-81f0-fcc73280073b	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	a6cfe879-b0e0-4efa-a3a8-bd35e278903e
040e1194-8e71-4527-a630-4e8e70427b82	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	a6cfe879-b0e0-4efa-a3a8-bd35e278903e
39ecea7d-f2ce-4139-815d-7fac9ed1da99	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0
a074905c-8ed3-4c6c-9265-30fa1e7da931	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0
e58d39e4-8c2b-48d6-99f1-78dd4ebe7e5e	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	2d5fbb32-7d3c-4f14-80e8-a5c8316f74e0
6a21cb90-2cdd-4450-908e-0bed457e2658	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	3084e8de-8dd8-4dd6-a225-7e325a445f0d
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	f49b4e26-fd18-4864-93fe-5473ae7ede2f
0de5d10e-b653-46dc-bec4-955003f8d75c	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	f49b4e26-fd18-4864-93fe-5473ae7ede2f
2fd64d6d-46c9-4bc7-b454-dc95158ebcf3	acr loa level	openid-connect	oidc-acr-mapper	\N	e8febfda-03a8-4e16-a0e0-931f47c69f23
f05d187b-c66d-4c70-a4db-301157f326a0	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	8b0f1e66-7460-4795-9698-a130e3dd2ab3
bed14704-7fe3-4e29-94bf-d6d44ed0aa66	sub	openid-connect	oidc-sub-mapper	\N	8b0f1e66-7460-4795-9698-a130e3dd2ab3
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	organization	openid-connect	oidc-organization-membership-mapper	\N	b54ccd53-5965-4171-b968-45e7190555f9
bd66810e-eb07-4f5c-b92f-a48fa6b92912	audience resolve	openid-connect	oidc-audience-resolve-mapper	458c2c0d-26e8-465c-97c4-1631dcf3d008	\N
8dd3f304-773f-4b72-9dd8-e53c482ea608	role list	saml	saml-role-list-mapper	\N	d3535c8e-2c6e-413c-a959-537bfb74f457
fbcce7ee-305d-4020-8a0d-10b5188b1da2	organization	saml	saml-organization-membership-mapper	\N	829dea79-aaec-4aab-9644-5e1eb3ab9ef0
33417e41-3cdf-46eb-824a-e01dc83ad430	full name	openid-connect	oidc-full-name-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
fd2b9fc4-0643-4182-9082-1139e46ef88b	family name	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
925aec18-957a-4ae8-8aba-983f480f2a22	given name	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	middle name	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
da498673-f7b1-4d66-afad-d5c5f1c5bb28	nickname	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
827c419b-6c88-4c47-89d9-358d48b7a2bf	username	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
43e6580d-6221-42b2-ac34-cc70712dd730	profile	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
e5639d3b-8d26-4aa5-990f-91db73f30163	picture	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
fb8282d9-39a3-4456-b758-cdbde53e3747	website	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	gender	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
9eda199c-2c2e-4850-b593-996564dc8407	birthdate	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
e7c843e5-b87b-45af-9642-c1247f78742a	zoneinfo	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
2819dc81-62cf-433a-8f90-a10ceb036df9	locale	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
c75b8782-08ff-41d1-9ab5-864444486397	updated at	openid-connect	oidc-usermodel-attribute-mapper	\N	1d3f166b-cea0-4e42-9371-e70ba0bbf758
4db1e0f2-1ffc-441f-870a-162293d47bf8	email	openid-connect	oidc-usermodel-attribute-mapper	\N	7ef4abe0-e149-4778-8028-8e0670fd53e1
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	email verified	openid-connect	oidc-usermodel-property-mapper	\N	7ef4abe0-e149-4778-8028-8e0670fd53e1
e7467f66-9038-4c3f-8501-38eb715f12a7	address	openid-connect	oidc-address-mapper	\N	a4d3a386-873f-4a5a-9aad-cd0393ad427e
090b09df-d6e7-4245-b2a5-51a1e8c04db8	phone number	openid-connect	oidc-usermodel-attribute-mapper	\N	89b76033-1e88-4d04-a353-82c236ee9cdf
22e1faeb-5c49-4251-b1d2-58f232e8d95e	phone number verified	openid-connect	oidc-usermodel-attribute-mapper	\N	89b76033-1e88-4d04-a353-82c236ee9cdf
2ba5069f-28dc-4c62-a42a-e150abf9e71e	realm roles	openid-connect	oidc-usermodel-realm-role-mapper	\N	622e8197-6eeb-4caa-b47d-a3043cddd085
de7423c3-c211-488f-8080-77a5371f42db	client roles	openid-connect	oidc-usermodel-client-role-mapper	\N	622e8197-6eeb-4caa-b47d-a3043cddd085
0ab73517-75ae-4850-aaf8-73a5aef89c8d	audience resolve	openid-connect	oidc-audience-resolve-mapper	\N	622e8197-6eeb-4caa-b47d-a3043cddd085
2516329b-2200-4178-be10-de510f539567	allowed web origins	openid-connect	oidc-allowed-origins-mapper	\N	9b3a075e-789a-43c7-b3cd-a9d4b2dd830c
e4fc8842-0230-42a6-9ad8-7e23d322376e	upn	openid-connect	oidc-usermodel-attribute-mapper	\N	d32726cb-eec1-4b40-83e3-a215c72e2c90
578a194a-9bbb-4e54-834e-4b7f52b3c844	groups	openid-connect	oidc-usermodel-realm-role-mapper	\N	d32726cb-eec1-4b40-83e3-a215c72e2c90
fc9f1821-6eda-46dc-93bd-88805f2c6f43	acr loa level	openid-connect	oidc-acr-mapper	\N	85feda3f-9880-4c64-97b4-f5960523e73c
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	auth_time	openid-connect	oidc-usersessionmodel-note-mapper	\N	2833783f-e469-4d0e-9b28-9290c7021119
edb89016-d57f-4f06-8153-cef2c24040de	sub	openid-connect	oidc-sub-mapper	\N	2833783f-e469-4d0e-9b28-9290c7021119
65beb7d6-c322-4943-abca-2123dc2046dc	organization	openid-connect	oidc-organization-membership-mapper	\N	5e137d25-516d-4744-9da6-b9796b55439a
fb744de0-b5c5-47d5-a4ff-e153e5198975	firm_id	openid-connect	oidc-usermodel-attribute-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
c31fedbc-84b5-40f0-8259-18dde7971b1a	teams	openid-connect	oidc-usermodel-attribute-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
c753418a-b0da-46c9-8d03-9e384cdc610c	clearance_level	openid-connect	oidc-usermodel-attribute-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
ee04b185-d74c-4e24-bfa8-ce324070d34c	is_partner	openid-connect	oidc-usermodel-attribute-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	locale	openid-connect	oidc-usermodel-attribute-mapper	e21a0b08-0675-4768-8044-b427263a416c	\N
cee044e5-7917-40c8-92a1-3877635af21e	Client ID	openid-connect	oidc-usersessionmodel-note-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	Client Host	openid-connect	oidc-usersessionmodel-note-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
f971e047-ef85-4cc7-8f1b-1035815b5677	Client IP Address	openid-connect	oidc-usersessionmodel-note-mapper	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	\N
\.


--
-- Data for Name: protocol_mapper_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.protocol_mapper_config (protocol_mapper_id, value, name) FROM stdin;
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	true	introspection.token.claim
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	true	userinfo.token.claim
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	locale	user.attribute
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	true	id.token.claim
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	true	access.token.claim
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	locale	claim.name
c757ab55-525e-4e98-ae4b-4f78dc16b5e9	String	jsonType.label
18910298-80b4-4fbc-9a4b-8739c9b3f2aa	false	single
18910298-80b4-4fbc-9a4b-8739c9b3f2aa	Basic	attribute.nameformat
18910298-80b4-4fbc-9a4b-8739c9b3f2aa	Role	attribute.name
01593ff9-2950-45a2-86a7-ad49fe0e0426	true	introspection.token.claim
01593ff9-2950-45a2-86a7-ad49fe0e0426	true	userinfo.token.claim
01593ff9-2950-45a2-86a7-ad49fe0e0426	zoneinfo	user.attribute
01593ff9-2950-45a2-86a7-ad49fe0e0426	true	id.token.claim
01593ff9-2950-45a2-86a7-ad49fe0e0426	true	access.token.claim
01593ff9-2950-45a2-86a7-ad49fe0e0426	zoneinfo	claim.name
01593ff9-2950-45a2-86a7-ad49fe0e0426	String	jsonType.label
14641bcf-7964-48d9-ab5d-61aa6b73d858	true	introspection.token.claim
14641bcf-7964-48d9-ab5d-61aa6b73d858	true	userinfo.token.claim
14641bcf-7964-48d9-ab5d-61aa6b73d858	birthdate	user.attribute
14641bcf-7964-48d9-ab5d-61aa6b73d858	true	id.token.claim
14641bcf-7964-48d9-ab5d-61aa6b73d858	true	access.token.claim
14641bcf-7964-48d9-ab5d-61aa6b73d858	birthdate	claim.name
14641bcf-7964-48d9-ab5d-61aa6b73d858	String	jsonType.label
33491cae-8d70-468d-af9c-0e339574c71b	true	introspection.token.claim
33491cae-8d70-468d-af9c-0e339574c71b	true	userinfo.token.claim
33491cae-8d70-468d-af9c-0e339574c71b	profile	user.attribute
33491cae-8d70-468d-af9c-0e339574c71b	true	id.token.claim
33491cae-8d70-468d-af9c-0e339574c71b	true	access.token.claim
33491cae-8d70-468d-af9c-0e339574c71b	profile	claim.name
33491cae-8d70-468d-af9c-0e339574c71b	String	jsonType.label
337b9056-68a3-48f6-b8fc-a78198bbc5f6	true	introspection.token.claim
337b9056-68a3-48f6-b8fc-a78198bbc5f6	true	userinfo.token.claim
337b9056-68a3-48f6-b8fc-a78198bbc5f6	firstName	user.attribute
337b9056-68a3-48f6-b8fc-a78198bbc5f6	true	id.token.claim
337b9056-68a3-48f6-b8fc-a78198bbc5f6	true	access.token.claim
337b9056-68a3-48f6-b8fc-a78198bbc5f6	given_name	claim.name
337b9056-68a3-48f6-b8fc-a78198bbc5f6	String	jsonType.label
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	true	introspection.token.claim
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	true	userinfo.token.claim
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	username	user.attribute
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	true	id.token.claim
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	true	access.token.claim
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	preferred_username	claim.name
4a06f56b-88a8-4203-b7f9-9ca5639f10b7	String	jsonType.label
5149b505-df84-4835-b3e7-f1ce704cbb96	true	introspection.token.claim
5149b505-df84-4835-b3e7-f1ce704cbb96	true	userinfo.token.claim
5149b505-df84-4835-b3e7-f1ce704cbb96	picture	user.attribute
5149b505-df84-4835-b3e7-f1ce704cbb96	true	id.token.claim
5149b505-df84-4835-b3e7-f1ce704cbb96	true	access.token.claim
5149b505-df84-4835-b3e7-f1ce704cbb96	picture	claim.name
5149b505-df84-4835-b3e7-f1ce704cbb96	String	jsonType.label
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	true	introspection.token.claim
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	true	userinfo.token.claim
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	updatedAt	user.attribute
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	true	id.token.claim
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	true	access.token.claim
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	updated_at	claim.name
6d97103c-0cc4-44bf-9787-68c6ad6bd8a1	long	jsonType.label
78e712f2-3d64-489e-a15e-ffda4f8a0660	true	introspection.token.claim
78e712f2-3d64-489e-a15e-ffda4f8a0660	true	userinfo.token.claim
78e712f2-3d64-489e-a15e-ffda4f8a0660	website	user.attribute
78e712f2-3d64-489e-a15e-ffda4f8a0660	true	id.token.claim
78e712f2-3d64-489e-a15e-ffda4f8a0660	true	access.token.claim
78e712f2-3d64-489e-a15e-ffda4f8a0660	website	claim.name
78e712f2-3d64-489e-a15e-ffda4f8a0660	String	jsonType.label
9ac9fa3b-e174-4e99-81ac-d11d7f154323	true	introspection.token.claim
9ac9fa3b-e174-4e99-81ac-d11d7f154323	true	userinfo.token.claim
9ac9fa3b-e174-4e99-81ac-d11d7f154323	true	id.token.claim
9ac9fa3b-e174-4e99-81ac-d11d7f154323	true	access.token.claim
b4090071-2bcf-438f-b513-ea19e93feda6	true	introspection.token.claim
b4090071-2bcf-438f-b513-ea19e93feda6	true	userinfo.token.claim
b4090071-2bcf-438f-b513-ea19e93feda6	locale	user.attribute
b4090071-2bcf-438f-b513-ea19e93feda6	true	id.token.claim
b4090071-2bcf-438f-b513-ea19e93feda6	true	access.token.claim
b4090071-2bcf-438f-b513-ea19e93feda6	locale	claim.name
b4090071-2bcf-438f-b513-ea19e93feda6	String	jsonType.label
cb1ff9dc-9d34-4848-8775-07080a24ae3e	true	introspection.token.claim
cb1ff9dc-9d34-4848-8775-07080a24ae3e	true	userinfo.token.claim
cb1ff9dc-9d34-4848-8775-07080a24ae3e	nickname	user.attribute
cb1ff9dc-9d34-4848-8775-07080a24ae3e	true	id.token.claim
cb1ff9dc-9d34-4848-8775-07080a24ae3e	true	access.token.claim
cb1ff9dc-9d34-4848-8775-07080a24ae3e	nickname	claim.name
cb1ff9dc-9d34-4848-8775-07080a24ae3e	String	jsonType.label
ef035041-e878-408e-bb5b-67c30ad3b730	true	introspection.token.claim
ef035041-e878-408e-bb5b-67c30ad3b730	true	userinfo.token.claim
ef035041-e878-408e-bb5b-67c30ad3b730	lastName	user.attribute
ef035041-e878-408e-bb5b-67c30ad3b730	true	id.token.claim
ef035041-e878-408e-bb5b-67c30ad3b730	true	access.token.claim
ef035041-e878-408e-bb5b-67c30ad3b730	family_name	claim.name
ef035041-e878-408e-bb5b-67c30ad3b730	String	jsonType.label
fb37192f-84c9-455c-b185-901181144e38	true	introspection.token.claim
fb37192f-84c9-455c-b185-901181144e38	true	userinfo.token.claim
fb37192f-84c9-455c-b185-901181144e38	gender	user.attribute
fb37192f-84c9-455c-b185-901181144e38	true	id.token.claim
fb37192f-84c9-455c-b185-901181144e38	true	access.token.claim
fb37192f-84c9-455c-b185-901181144e38	gender	claim.name
fb37192f-84c9-455c-b185-901181144e38	String	jsonType.label
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	true	introspection.token.claim
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	true	userinfo.token.claim
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	middleName	user.attribute
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	true	id.token.claim
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	true	access.token.claim
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	middle_name	claim.name
fc28fafc-5e2e-4440-be07-8ff67e61c2ca	String	jsonType.label
e6d86f66-7234-4133-8bab-d4012aa91115	true	introspection.token.claim
e6d86f66-7234-4133-8bab-d4012aa91115	true	userinfo.token.claim
e6d86f66-7234-4133-8bab-d4012aa91115	emailVerified	user.attribute
e6d86f66-7234-4133-8bab-d4012aa91115	true	id.token.claim
e6d86f66-7234-4133-8bab-d4012aa91115	true	access.token.claim
e6d86f66-7234-4133-8bab-d4012aa91115	email_verified	claim.name
e6d86f66-7234-4133-8bab-d4012aa91115	boolean	jsonType.label
f2c7715d-1ae0-41dd-baa3-7909682389be	true	introspection.token.claim
f2c7715d-1ae0-41dd-baa3-7909682389be	true	userinfo.token.claim
f2c7715d-1ae0-41dd-baa3-7909682389be	email	user.attribute
f2c7715d-1ae0-41dd-baa3-7909682389be	true	id.token.claim
f2c7715d-1ae0-41dd-baa3-7909682389be	true	access.token.claim
f2c7715d-1ae0-41dd-baa3-7909682389be	email	claim.name
f2c7715d-1ae0-41dd-baa3-7909682389be	String	jsonType.label
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	formatted	user.attribute.formatted
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	country	user.attribute.country
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	true	introspection.token.claim
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	postal_code	user.attribute.postal_code
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	true	userinfo.token.claim
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	street	user.attribute.street
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	true	id.token.claim
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	region	user.attribute.region
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	true	access.token.claim
75d6edb8-d0a3-447c-9a69-edd1a27e9aed	locality	user.attribute.locality
040e1194-8e71-4527-a630-4e8e70427b82	true	introspection.token.claim
040e1194-8e71-4527-a630-4e8e70427b82	true	userinfo.token.claim
040e1194-8e71-4527-a630-4e8e70427b82	phoneNumberVerified	user.attribute
040e1194-8e71-4527-a630-4e8e70427b82	true	id.token.claim
040e1194-8e71-4527-a630-4e8e70427b82	true	access.token.claim
040e1194-8e71-4527-a630-4e8e70427b82	phone_number_verified	claim.name
040e1194-8e71-4527-a630-4e8e70427b82	boolean	jsonType.label
649f6b44-473a-42d8-81f0-fcc73280073b	true	introspection.token.claim
649f6b44-473a-42d8-81f0-fcc73280073b	true	userinfo.token.claim
649f6b44-473a-42d8-81f0-fcc73280073b	phoneNumber	user.attribute
649f6b44-473a-42d8-81f0-fcc73280073b	true	id.token.claim
649f6b44-473a-42d8-81f0-fcc73280073b	true	access.token.claim
649f6b44-473a-42d8-81f0-fcc73280073b	phone_number	claim.name
649f6b44-473a-42d8-81f0-fcc73280073b	String	jsonType.label
39ecea7d-f2ce-4139-815d-7fac9ed1da99	true	introspection.token.claim
39ecea7d-f2ce-4139-815d-7fac9ed1da99	true	multivalued
39ecea7d-f2ce-4139-815d-7fac9ed1da99	foo	user.attribute
39ecea7d-f2ce-4139-815d-7fac9ed1da99	true	access.token.claim
39ecea7d-f2ce-4139-815d-7fac9ed1da99	realm_access.roles	claim.name
39ecea7d-f2ce-4139-815d-7fac9ed1da99	String	jsonType.label
a074905c-8ed3-4c6c-9265-30fa1e7da931	true	introspection.token.claim
a074905c-8ed3-4c6c-9265-30fa1e7da931	true	multivalued
a074905c-8ed3-4c6c-9265-30fa1e7da931	foo	user.attribute
a074905c-8ed3-4c6c-9265-30fa1e7da931	true	access.token.claim
a074905c-8ed3-4c6c-9265-30fa1e7da931	resource_access.${client_id}.roles	claim.name
a074905c-8ed3-4c6c-9265-30fa1e7da931	String	jsonType.label
e58d39e4-8c2b-48d6-99f1-78dd4ebe7e5e	true	introspection.token.claim
e58d39e4-8c2b-48d6-99f1-78dd4ebe7e5e	true	access.token.claim
6a21cb90-2cdd-4450-908e-0bed457e2658	true	introspection.token.claim
6a21cb90-2cdd-4450-908e-0bed457e2658	true	access.token.claim
0de5d10e-b653-46dc-bec4-955003f8d75c	true	introspection.token.claim
0de5d10e-b653-46dc-bec4-955003f8d75c	true	multivalued
0de5d10e-b653-46dc-bec4-955003f8d75c	foo	user.attribute
0de5d10e-b653-46dc-bec4-955003f8d75c	true	id.token.claim
0de5d10e-b653-46dc-bec4-955003f8d75c	true	access.token.claim
0de5d10e-b653-46dc-bec4-955003f8d75c	groups	claim.name
0de5d10e-b653-46dc-bec4-955003f8d75c	String	jsonType.label
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	true	introspection.token.claim
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	true	userinfo.token.claim
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	username	user.attribute
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	true	id.token.claim
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	true	access.token.claim
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	upn	claim.name
b9e1a0a5-40ef-4dc7-8e1f-08e1a7ee2fd2	String	jsonType.label
2fd64d6d-46c9-4bc7-b454-dc95158ebcf3	true	introspection.token.claim
2fd64d6d-46c9-4bc7-b454-dc95158ebcf3	true	id.token.claim
2fd64d6d-46c9-4bc7-b454-dc95158ebcf3	true	access.token.claim
bed14704-7fe3-4e29-94bf-d6d44ed0aa66	true	introspection.token.claim
bed14704-7fe3-4e29-94bf-d6d44ed0aa66	true	access.token.claim
f05d187b-c66d-4c70-a4db-301157f326a0	AUTH_TIME	user.session.note
f05d187b-c66d-4c70-a4db-301157f326a0	true	introspection.token.claim
f05d187b-c66d-4c70-a4db-301157f326a0	true	id.token.claim
f05d187b-c66d-4c70-a4db-301157f326a0	true	access.token.claim
f05d187b-c66d-4c70-a4db-301157f326a0	auth_time	claim.name
f05d187b-c66d-4c70-a4db-301157f326a0	long	jsonType.label
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	true	introspection.token.claim
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	true	multivalued
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	true	id.token.claim
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	true	access.token.claim
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	organization	claim.name
1af8f4f7-8d5e-4b29-a2f6-39236ea70afb	String	jsonType.label
8dd3f304-773f-4b72-9dd8-e53c482ea608	false	single
8dd3f304-773f-4b72-9dd8-e53c482ea608	Basic	attribute.nameformat
8dd3f304-773f-4b72-9dd8-e53c482ea608	Role	attribute.name
2819dc81-62cf-433a-8f90-a10ceb036df9	true	introspection.token.claim
2819dc81-62cf-433a-8f90-a10ceb036df9	true	userinfo.token.claim
2819dc81-62cf-433a-8f90-a10ceb036df9	locale	user.attribute
2819dc81-62cf-433a-8f90-a10ceb036df9	true	id.token.claim
2819dc81-62cf-433a-8f90-a10ceb036df9	true	access.token.claim
2819dc81-62cf-433a-8f90-a10ceb036df9	locale	claim.name
2819dc81-62cf-433a-8f90-a10ceb036df9	String	jsonType.label
33417e41-3cdf-46eb-824a-e01dc83ad430	true	introspection.token.claim
33417e41-3cdf-46eb-824a-e01dc83ad430	true	userinfo.token.claim
33417e41-3cdf-46eb-824a-e01dc83ad430	true	id.token.claim
33417e41-3cdf-46eb-824a-e01dc83ad430	true	access.token.claim
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	true	introspection.token.claim
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	true	userinfo.token.claim
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	middleName	user.attribute
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	true	id.token.claim
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	true	access.token.claim
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	middle_name	claim.name
3a84ac73-d4c0-4f29-900d-5c73a08db9fb	String	jsonType.label
43e6580d-6221-42b2-ac34-cc70712dd730	true	introspection.token.claim
43e6580d-6221-42b2-ac34-cc70712dd730	true	userinfo.token.claim
43e6580d-6221-42b2-ac34-cc70712dd730	profile	user.attribute
43e6580d-6221-42b2-ac34-cc70712dd730	true	id.token.claim
43e6580d-6221-42b2-ac34-cc70712dd730	true	access.token.claim
43e6580d-6221-42b2-ac34-cc70712dd730	profile	claim.name
43e6580d-6221-42b2-ac34-cc70712dd730	String	jsonType.label
827c419b-6c88-4c47-89d9-358d48b7a2bf	true	introspection.token.claim
827c419b-6c88-4c47-89d9-358d48b7a2bf	true	userinfo.token.claim
827c419b-6c88-4c47-89d9-358d48b7a2bf	username	user.attribute
827c419b-6c88-4c47-89d9-358d48b7a2bf	true	id.token.claim
827c419b-6c88-4c47-89d9-358d48b7a2bf	true	access.token.claim
827c419b-6c88-4c47-89d9-358d48b7a2bf	preferred_username	claim.name
827c419b-6c88-4c47-89d9-358d48b7a2bf	String	jsonType.label
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	true	introspection.token.claim
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	true	userinfo.token.claim
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	gender	user.attribute
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	true	id.token.claim
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	true	access.token.claim
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	gender	claim.name
8f92d47e-6f86-46c7-81b2-3d7972bbd1dc	String	jsonType.label
925aec18-957a-4ae8-8aba-983f480f2a22	true	introspection.token.claim
925aec18-957a-4ae8-8aba-983f480f2a22	true	userinfo.token.claim
925aec18-957a-4ae8-8aba-983f480f2a22	firstName	user.attribute
925aec18-957a-4ae8-8aba-983f480f2a22	true	id.token.claim
925aec18-957a-4ae8-8aba-983f480f2a22	true	access.token.claim
925aec18-957a-4ae8-8aba-983f480f2a22	given_name	claim.name
925aec18-957a-4ae8-8aba-983f480f2a22	String	jsonType.label
9eda199c-2c2e-4850-b593-996564dc8407	true	introspection.token.claim
9eda199c-2c2e-4850-b593-996564dc8407	true	userinfo.token.claim
9eda199c-2c2e-4850-b593-996564dc8407	birthdate	user.attribute
9eda199c-2c2e-4850-b593-996564dc8407	true	id.token.claim
9eda199c-2c2e-4850-b593-996564dc8407	true	access.token.claim
9eda199c-2c2e-4850-b593-996564dc8407	birthdate	claim.name
9eda199c-2c2e-4850-b593-996564dc8407	String	jsonType.label
c75b8782-08ff-41d1-9ab5-864444486397	true	introspection.token.claim
c75b8782-08ff-41d1-9ab5-864444486397	true	userinfo.token.claim
c75b8782-08ff-41d1-9ab5-864444486397	updatedAt	user.attribute
c75b8782-08ff-41d1-9ab5-864444486397	true	id.token.claim
c75b8782-08ff-41d1-9ab5-864444486397	true	access.token.claim
c75b8782-08ff-41d1-9ab5-864444486397	updated_at	claim.name
c75b8782-08ff-41d1-9ab5-864444486397	long	jsonType.label
da498673-f7b1-4d66-afad-d5c5f1c5bb28	true	introspection.token.claim
da498673-f7b1-4d66-afad-d5c5f1c5bb28	true	userinfo.token.claim
da498673-f7b1-4d66-afad-d5c5f1c5bb28	nickname	user.attribute
da498673-f7b1-4d66-afad-d5c5f1c5bb28	true	id.token.claim
da498673-f7b1-4d66-afad-d5c5f1c5bb28	true	access.token.claim
da498673-f7b1-4d66-afad-d5c5f1c5bb28	nickname	claim.name
da498673-f7b1-4d66-afad-d5c5f1c5bb28	String	jsonType.label
e5639d3b-8d26-4aa5-990f-91db73f30163	true	introspection.token.claim
e5639d3b-8d26-4aa5-990f-91db73f30163	true	userinfo.token.claim
e5639d3b-8d26-4aa5-990f-91db73f30163	picture	user.attribute
e5639d3b-8d26-4aa5-990f-91db73f30163	true	id.token.claim
e5639d3b-8d26-4aa5-990f-91db73f30163	true	access.token.claim
e5639d3b-8d26-4aa5-990f-91db73f30163	picture	claim.name
e5639d3b-8d26-4aa5-990f-91db73f30163	String	jsonType.label
e7c843e5-b87b-45af-9642-c1247f78742a	true	introspection.token.claim
e7c843e5-b87b-45af-9642-c1247f78742a	true	userinfo.token.claim
e7c843e5-b87b-45af-9642-c1247f78742a	zoneinfo	user.attribute
e7c843e5-b87b-45af-9642-c1247f78742a	true	id.token.claim
e7c843e5-b87b-45af-9642-c1247f78742a	true	access.token.claim
e7c843e5-b87b-45af-9642-c1247f78742a	zoneinfo	claim.name
e7c843e5-b87b-45af-9642-c1247f78742a	String	jsonType.label
fb8282d9-39a3-4456-b758-cdbde53e3747	true	introspection.token.claim
fb8282d9-39a3-4456-b758-cdbde53e3747	true	userinfo.token.claim
fb8282d9-39a3-4456-b758-cdbde53e3747	website	user.attribute
fb8282d9-39a3-4456-b758-cdbde53e3747	true	id.token.claim
fb8282d9-39a3-4456-b758-cdbde53e3747	true	access.token.claim
fb8282d9-39a3-4456-b758-cdbde53e3747	website	claim.name
fb8282d9-39a3-4456-b758-cdbde53e3747	String	jsonType.label
fd2b9fc4-0643-4182-9082-1139e46ef88b	true	introspection.token.claim
fd2b9fc4-0643-4182-9082-1139e46ef88b	true	userinfo.token.claim
fd2b9fc4-0643-4182-9082-1139e46ef88b	lastName	user.attribute
fd2b9fc4-0643-4182-9082-1139e46ef88b	true	id.token.claim
fd2b9fc4-0643-4182-9082-1139e46ef88b	true	access.token.claim
fd2b9fc4-0643-4182-9082-1139e46ef88b	family_name	claim.name
fd2b9fc4-0643-4182-9082-1139e46ef88b	String	jsonType.label
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	true	introspection.token.claim
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	true	userinfo.token.claim
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	emailVerified	user.attribute
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	true	id.token.claim
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	true	access.token.claim
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	email_verified	claim.name
4d1f2679-6b91-4f37-80c9-56e5d4634f4e	boolean	jsonType.label
4db1e0f2-1ffc-441f-870a-162293d47bf8	true	introspection.token.claim
4db1e0f2-1ffc-441f-870a-162293d47bf8	true	userinfo.token.claim
4db1e0f2-1ffc-441f-870a-162293d47bf8	email	user.attribute
4db1e0f2-1ffc-441f-870a-162293d47bf8	true	id.token.claim
4db1e0f2-1ffc-441f-870a-162293d47bf8	true	access.token.claim
4db1e0f2-1ffc-441f-870a-162293d47bf8	email	claim.name
4db1e0f2-1ffc-441f-870a-162293d47bf8	String	jsonType.label
e7467f66-9038-4c3f-8501-38eb715f12a7	formatted	user.attribute.formatted
e7467f66-9038-4c3f-8501-38eb715f12a7	country	user.attribute.country
e7467f66-9038-4c3f-8501-38eb715f12a7	true	introspection.token.claim
e7467f66-9038-4c3f-8501-38eb715f12a7	postal_code	user.attribute.postal_code
e7467f66-9038-4c3f-8501-38eb715f12a7	true	userinfo.token.claim
e7467f66-9038-4c3f-8501-38eb715f12a7	street	user.attribute.street
e7467f66-9038-4c3f-8501-38eb715f12a7	true	id.token.claim
e7467f66-9038-4c3f-8501-38eb715f12a7	region	user.attribute.region
e7467f66-9038-4c3f-8501-38eb715f12a7	true	access.token.claim
e7467f66-9038-4c3f-8501-38eb715f12a7	locality	user.attribute.locality
090b09df-d6e7-4245-b2a5-51a1e8c04db8	true	introspection.token.claim
090b09df-d6e7-4245-b2a5-51a1e8c04db8	true	userinfo.token.claim
090b09df-d6e7-4245-b2a5-51a1e8c04db8	phoneNumber	user.attribute
090b09df-d6e7-4245-b2a5-51a1e8c04db8	true	id.token.claim
090b09df-d6e7-4245-b2a5-51a1e8c04db8	true	access.token.claim
090b09df-d6e7-4245-b2a5-51a1e8c04db8	phone_number	claim.name
090b09df-d6e7-4245-b2a5-51a1e8c04db8	String	jsonType.label
22e1faeb-5c49-4251-b1d2-58f232e8d95e	true	introspection.token.claim
22e1faeb-5c49-4251-b1d2-58f232e8d95e	true	userinfo.token.claim
22e1faeb-5c49-4251-b1d2-58f232e8d95e	phoneNumberVerified	user.attribute
22e1faeb-5c49-4251-b1d2-58f232e8d95e	true	id.token.claim
22e1faeb-5c49-4251-b1d2-58f232e8d95e	true	access.token.claim
22e1faeb-5c49-4251-b1d2-58f232e8d95e	phone_number_verified	claim.name
22e1faeb-5c49-4251-b1d2-58f232e8d95e	boolean	jsonType.label
0ab73517-75ae-4850-aaf8-73a5aef89c8d	true	introspection.token.claim
0ab73517-75ae-4850-aaf8-73a5aef89c8d	true	access.token.claim
2ba5069f-28dc-4c62-a42a-e150abf9e71e	true	introspection.token.claim
2ba5069f-28dc-4c62-a42a-e150abf9e71e	true	multivalued
2ba5069f-28dc-4c62-a42a-e150abf9e71e	foo	user.attribute
2ba5069f-28dc-4c62-a42a-e150abf9e71e	true	access.token.claim
2ba5069f-28dc-4c62-a42a-e150abf9e71e	realm_access.roles	claim.name
2ba5069f-28dc-4c62-a42a-e150abf9e71e	String	jsonType.label
de7423c3-c211-488f-8080-77a5371f42db	true	introspection.token.claim
de7423c3-c211-488f-8080-77a5371f42db	true	multivalued
de7423c3-c211-488f-8080-77a5371f42db	foo	user.attribute
de7423c3-c211-488f-8080-77a5371f42db	true	access.token.claim
de7423c3-c211-488f-8080-77a5371f42db	resource_access.${client_id}.roles	claim.name
de7423c3-c211-488f-8080-77a5371f42db	String	jsonType.label
2516329b-2200-4178-be10-de510f539567	true	introspection.token.claim
2516329b-2200-4178-be10-de510f539567	true	access.token.claim
578a194a-9bbb-4e54-834e-4b7f52b3c844	true	introspection.token.claim
578a194a-9bbb-4e54-834e-4b7f52b3c844	true	multivalued
578a194a-9bbb-4e54-834e-4b7f52b3c844	foo	user.attribute
578a194a-9bbb-4e54-834e-4b7f52b3c844	true	id.token.claim
578a194a-9bbb-4e54-834e-4b7f52b3c844	true	access.token.claim
578a194a-9bbb-4e54-834e-4b7f52b3c844	groups	claim.name
578a194a-9bbb-4e54-834e-4b7f52b3c844	String	jsonType.label
e4fc8842-0230-42a6-9ad8-7e23d322376e	true	introspection.token.claim
e4fc8842-0230-42a6-9ad8-7e23d322376e	true	userinfo.token.claim
e4fc8842-0230-42a6-9ad8-7e23d322376e	username	user.attribute
e4fc8842-0230-42a6-9ad8-7e23d322376e	true	id.token.claim
e4fc8842-0230-42a6-9ad8-7e23d322376e	true	access.token.claim
e4fc8842-0230-42a6-9ad8-7e23d322376e	upn	claim.name
e4fc8842-0230-42a6-9ad8-7e23d322376e	String	jsonType.label
fc9f1821-6eda-46dc-93bd-88805f2c6f43	true	introspection.token.claim
fc9f1821-6eda-46dc-93bd-88805f2c6f43	true	id.token.claim
fc9f1821-6eda-46dc-93bd-88805f2c6f43	true	access.token.claim
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	AUTH_TIME	user.session.note
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	true	introspection.token.claim
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	true	id.token.claim
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	true	access.token.claim
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	auth_time	claim.name
e2b3ef0a-89b5-45c3-aa0f-04c6f2d84177	long	jsonType.label
edb89016-d57f-4f06-8153-cef2c24040de	true	introspection.token.claim
edb89016-d57f-4f06-8153-cef2c24040de	true	access.token.claim
65beb7d6-c322-4943-abca-2123dc2046dc	true	introspection.token.claim
65beb7d6-c322-4943-abca-2123dc2046dc	true	multivalued
65beb7d6-c322-4943-abca-2123dc2046dc	true	id.token.claim
65beb7d6-c322-4943-abca-2123dc2046dc	true	access.token.claim
65beb7d6-c322-4943-abca-2123dc2046dc	organization	claim.name
65beb7d6-c322-4943-abca-2123dc2046dc	String	jsonType.label
c31fedbc-84b5-40f0-8259-18dde7971b1a	teams	user.attribute
c31fedbc-84b5-40f0-8259-18dde7971b1a	true	id.token.claim
c31fedbc-84b5-40f0-8259-18dde7971b1a	true	access.token.claim
c31fedbc-84b5-40f0-8259-18dde7971b1a	teams	claim.name
c31fedbc-84b5-40f0-8259-18dde7971b1a	JSON	jsonType.label
c31fedbc-84b5-40f0-8259-18dde7971b1a	true	userinfo.token.claim
c753418a-b0da-46c9-8d03-9e384cdc610c	clearance_level	user.attribute
c753418a-b0da-46c9-8d03-9e384cdc610c	true	id.token.claim
c753418a-b0da-46c9-8d03-9e384cdc610c	true	access.token.claim
c753418a-b0da-46c9-8d03-9e384cdc610c	clearance_level	claim.name
c753418a-b0da-46c9-8d03-9e384cdc610c	int	jsonType.label
c753418a-b0da-46c9-8d03-9e384cdc610c	true	userinfo.token.claim
ee04b185-d74c-4e24-bfa8-ce324070d34c	is_partner	user.attribute
ee04b185-d74c-4e24-bfa8-ce324070d34c	true	id.token.claim
ee04b185-d74c-4e24-bfa8-ce324070d34c	true	access.token.claim
ee04b185-d74c-4e24-bfa8-ce324070d34c	is_partner	claim.name
ee04b185-d74c-4e24-bfa8-ce324070d34c	boolean	jsonType.label
ee04b185-d74c-4e24-bfa8-ce324070d34c	true	userinfo.token.claim
fb744de0-b5c5-47d5-a4ff-e153e5198975	firm_id	user.attribute
fb744de0-b5c5-47d5-a4ff-e153e5198975	true	id.token.claim
fb744de0-b5c5-47d5-a4ff-e153e5198975	true	access.token.claim
fb744de0-b5c5-47d5-a4ff-e153e5198975	firm_id	claim.name
fb744de0-b5c5-47d5-a4ff-e153e5198975	String	jsonType.label
fb744de0-b5c5-47d5-a4ff-e153e5198975	true	userinfo.token.claim
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	true	introspection.token.claim
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	true	userinfo.token.claim
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	locale	user.attribute
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	true	id.token.claim
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	true	access.token.claim
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	locale	claim.name
5c088c34-7ef2-4d39-8b97-3e03d7bed8f1	String	jsonType.label
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	clientHost	user.session.note
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	true	introspection.token.claim
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	true	id.token.claim
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	true	access.token.claim
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	clientHost	claim.name
0e5c1ec0-01a4-4068-aa57-1e4abcc8f577	String	jsonType.label
cee044e5-7917-40c8-92a1-3877635af21e	client_id	user.session.note
cee044e5-7917-40c8-92a1-3877635af21e	true	introspection.token.claim
cee044e5-7917-40c8-92a1-3877635af21e	true	id.token.claim
cee044e5-7917-40c8-92a1-3877635af21e	true	access.token.claim
cee044e5-7917-40c8-92a1-3877635af21e	client_id	claim.name
cee044e5-7917-40c8-92a1-3877635af21e	String	jsonType.label
f971e047-ef85-4cc7-8f1b-1035815b5677	clientAddress	user.session.note
f971e047-ef85-4cc7-8f1b-1035815b5677	true	introspection.token.claim
f971e047-ef85-4cc7-8f1b-1035815b5677	true	id.token.claim
f971e047-ef85-4cc7-8f1b-1035815b5677	true	access.token.claim
f971e047-ef85-4cc7-8f1b-1035815b5677	clientAddress	claim.name
f971e047-ef85-4cc7-8f1b-1035815b5677	String	jsonType.label
\.


--
-- Data for Name: realm; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm (id, access_code_lifespan, user_action_lifespan, access_token_lifespan, account_theme, admin_theme, email_theme, enabled, events_enabled, events_expiration, login_theme, name, not_before, password_policy, registration_allowed, remember_me, reset_password_allowed, social, ssl_required, sso_idle_timeout, sso_max_lifespan, update_profile_on_soc_login, verify_email, master_admin_client, login_lifespan, internationalization_enabled, default_locale, reg_email_as_username, admin_events_enabled, admin_events_details_enabled, edit_username_allowed, otp_policy_counter, otp_policy_window, otp_policy_period, otp_policy_digits, otp_policy_alg, otp_policy_type, browser_flow, registration_flow, direct_grant_flow, reset_credentials_flow, client_auth_flow, offline_session_idle_timeout, revoke_refresh_token, access_token_life_implicit, login_with_email_allowed, duplicate_emails_allowed, docker_auth_flow, refresh_token_max_reuse, allow_user_managed_access, sso_max_lifespan_remember_me, sso_idle_timeout_remember_me, default_role) FROM stdin;
dms	60	300	3600	keycloak.v3	keycloak.v2	keycloak	t	f	0	keycloak.v2	dms	0	\N	f	f	t	f	EXTERNAL	3600	36000	f	f	a4d1502e-aa58-4c2f-8b18-2c088d018aad	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	0bc165ee-a1af-48ae-affe-857f31686698	f4c90da6-d727-4594-b46b-9098af0403a8	c9a4f003-c89b-42a0-bcd1-e38ae86bbdf1	4008b58d-bb53-44b7-a0f0-2b65ddc77447	341dd4f3-fcfe-441e-92a5-546204b26050	2592000	f	3600	t	f	4392e859-5c95-4e24-96d6-964eaeb87fea	0	f	0	0	5cc175e5-95e4-4a6d-9c35-b3ddea86d46c
79df126b-a967-4d6d-a704-427910aca988	60	300	60	\N	\N	\N	t	f	0	\N	master	0	\N	f	f	f	f	EXTERNAL	1800	36000	f	f	3935d8e7-9eaf-4b16-b997-71a7e53bef30	1800	f	\N	f	f	f	f	0	1	30	6	HmacSHA1	totp	9068944e-9c25-4442-a908-14e7cf9bb08c	18cc8c75-e50e-4f9b-b55f-427ff18b8bf7	dc2d33b2-0311-4a65-b5be-afac0fc7a406	aef5ddfe-0de9-442d-bbdd-a3c3c23f0f62	0cdbf224-6ded-4ba5-8db2-df4e4df557dc	2592000	f	900	t	f	ba7d6049-57e6-4023-84f8-2da1390acd38	0	f	0	0	23014211-f23b-49fb-9a40-f3d051e9bfc4
\.


--
-- Data for Name: realm_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_attribute (name, realm_id, value) FROM stdin;
_browser_header.contentSecurityPolicyReportOnly	79df126b-a967-4d6d-a704-427910aca988	
_browser_header.xContentTypeOptions	79df126b-a967-4d6d-a704-427910aca988	nosniff
_browser_header.referrerPolicy	79df126b-a967-4d6d-a704-427910aca988	no-referrer
_browser_header.xRobotsTag	79df126b-a967-4d6d-a704-427910aca988	none
_browser_header.xFrameOptions	79df126b-a967-4d6d-a704-427910aca988	SAMEORIGIN
_browser_header.contentSecurityPolicy	79df126b-a967-4d6d-a704-427910aca988	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.xXSSProtection	79df126b-a967-4d6d-a704-427910aca988	1; mode=block
_browser_header.strictTransportSecurity	79df126b-a967-4d6d-a704-427910aca988	max-age=31536000; includeSubDomains
bruteForceProtected	79df126b-a967-4d6d-a704-427910aca988	false
permanentLockout	79df126b-a967-4d6d-a704-427910aca988	false
maxTemporaryLockouts	79df126b-a967-4d6d-a704-427910aca988	0
bruteForceStrategy	79df126b-a967-4d6d-a704-427910aca988	MULTIPLE
maxFailureWaitSeconds	79df126b-a967-4d6d-a704-427910aca988	900
minimumQuickLoginWaitSeconds	79df126b-a967-4d6d-a704-427910aca988	60
waitIncrementSeconds	79df126b-a967-4d6d-a704-427910aca988	60
quickLoginCheckMilliSeconds	79df126b-a967-4d6d-a704-427910aca988	1000
maxDeltaTimeSeconds	79df126b-a967-4d6d-a704-427910aca988	43200
failureFactor	79df126b-a967-4d6d-a704-427910aca988	30
realmReusableOtpCode	79df126b-a967-4d6d-a704-427910aca988	false
firstBrokerLoginFlowId	79df126b-a967-4d6d-a704-427910aca988	ac87d905-8c48-4919-b310-6f1c36b8cf80
displayName	79df126b-a967-4d6d-a704-427910aca988	Keycloak
displayNameHtml	79df126b-a967-4d6d-a704-427910aca988	<div class="kc-logo-text"><span>Keycloak</span></div>
defaultSignatureAlgorithm	79df126b-a967-4d6d-a704-427910aca988	RS256
offlineSessionMaxLifespanEnabled	79df126b-a967-4d6d-a704-427910aca988	false
offlineSessionMaxLifespan	79df126b-a967-4d6d-a704-427910aca988	5184000
permanentLockout	dms	false
maxTemporaryLockouts	dms	0
bruteForceStrategy	dms	MULTIPLE
maxFailureWaitSeconds	dms	900
minimumQuickLoginWaitSeconds	dms	60
waitIncrementSeconds	dms	60
quickLoginCheckMilliSeconds	dms	1000
maxDeltaTimeSeconds	dms	43200
realmReusableOtpCode	dms	false
displayName	dms	Legal DMS
displayNameHtml	dms	<div class="kc-logo-text"><span>Legal DMS</span></div>
defaultSignatureAlgorithm	dms	RS256
bruteForceProtected	dms	true
failureFactor	dms	5
offlineSessionMaxLifespanEnabled	dms	false
offlineSessionMaxLifespan	dms	5184000
actionTokenGeneratedByAdminLifespan	dms	43200
oauth2DeviceCodeLifespan	dms	600
oauth2DevicePollingInterval	dms	5
webAuthnPolicyRpEntityName	dms	Legal DMS
webAuthnPolicySignatureAlgorithms	dms	ES256,RS256
webAuthnPolicyRpId	dms	localhost
webAuthnPolicyAttestationConveyancePreference	dms	not specified
webAuthnPolicyAuthenticatorAttachment	dms	not specified
webAuthnPolicyRequireResidentKey	dms	not specified
webAuthnPolicyUserVerificationRequirement	dms	not specified
webAuthnPolicyCreateTimeout	dms	0
webAuthnPolicyAvoidSameAuthenticatorRegister	dms	false
webAuthnPolicyRpEntityNamePasswordless	dms	keycloak
webAuthnPolicySignatureAlgorithmsPasswordless	dms	ES256,RS256
webAuthnPolicyRpIdPasswordless	dms	
webAuthnPolicyAttestationConveyancePreferencePasswordless	dms	not specified
webAuthnPolicyAuthenticatorAttachmentPasswordless	dms	not specified
webAuthnPolicyRequireResidentKeyPasswordless	dms	not specified
webAuthnPolicyUserVerificationRequirementPasswordless	dms	not specified
webAuthnPolicyCreateTimeoutPasswordless	dms	0
webAuthnPolicyAvoidSameAuthenticatorRegisterPasswordless	dms	false
cibaBackchannelTokenDeliveryMode	dms	poll
cibaExpiresIn	dms	120
cibaInterval	dms	5
cibaAuthRequestedUserHint	dms	login_hint
parRequestUriLifespan	dms	60
firstBrokerLoginFlowId	dms	b4093874-65bc-43ce-9c83-0ef4e28923d3
clientSessionIdleTimeout	dms	0
clientSessionMaxLifespan	dms	0
clientOfflineSessionIdleTimeout	dms	0
clientOfflineSessionMaxLifespan	dms	0
organizationsEnabled	dms	false
client-policies.profiles	dms	{"profiles":[]}
client-policies.policies	dms	{"policies":[]}
shortVerificationUri	dms	
actionTokenGeneratedByUserLifespan.verify-email	dms	
actionTokenGeneratedByUserLifespan.idp-verify-account-via-email	dms	
actionTokenGeneratedByUserLifespan.reset-credentials	dms	
actionTokenGeneratedByUserLifespan.execute-actions	dms	
actionTokenGeneratedByUserLifespan	dms	3600
_browser_header.contentSecurityPolicyReportOnly	dms	
_browser_header.xContentTypeOptions	dms	nosniff
_browser_header.referrerPolicy	dms	no-referrer
_browser_header.xRobotsTag	dms	none
_browser_header.xFrameOptions	dms	SAMEORIGIN
_browser_header.contentSecurityPolicy	dms	frame-src 'self'; frame-ancestors 'self'; object-src 'none';
_browser_header.xXSSProtection	dms	1; mode=block
_browser_header.strictTransportSecurity	dms	max-age=31536000; includeSubDomains
\.


--
-- Data for Name: realm_default_groups; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_default_groups (realm_id, group_id) FROM stdin;
\.


--
-- Data for Name: realm_enabled_event_types; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_enabled_event_types (realm_id, value) FROM stdin;
\.


--
-- Data for Name: realm_events_listeners; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_events_listeners (realm_id, value) FROM stdin;
79df126b-a967-4d6d-a704-427910aca988	jboss-logging
dms	jboss-logging
\.


--
-- Data for Name: realm_localizations; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_localizations (realm_id, locale, texts) FROM stdin;
\.


--
-- Data for Name: realm_required_credential; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_required_credential (type, form_label, input, secret, realm_id) FROM stdin;
password	password	t	t	79df126b-a967-4d6d-a704-427910aca988
password	password	t	t	dms
\.


--
-- Data for Name: realm_smtp_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_smtp_config (realm_id, value, name) FROM stdin;
\.


--
-- Data for Name: realm_supported_locales; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.realm_supported_locales (realm_id, value) FROM stdin;
\.


--
-- Data for Name: redirect_uris; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.redirect_uris (client_id, value) FROM stdin;
bcb5640c-7302-48b6-a899-e78b2fd9cba2	/realms/master/account/*
3775a915-293b-43f7-909d-bbf62865c526	/realms/master/account/*
8f02f084-4f1d-41c9-bce2-2d6470b93af6	/admin/master/console/*
ea76b321-1c97-48c9-8358-ba0939c4cc24	/realms/dms/account/*
458c2c0d-26e8-465c-97c4-1631dcf3d008	/realms/dms/account/*
e21a0b08-0675-4768-8044-b427263a416c	/admin/dms/console/*
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost:3000/*
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost:5173/*
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost/*
\.


--
-- Data for Name: required_action_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.required_action_config (required_action_id, value, name) FROM stdin;
\.


--
-- Data for Name: required_action_provider; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.required_action_provider (id, alias, name, realm_id, enabled, default_action, provider_id, priority) FROM stdin;
9f13fd50-f473-43c4-a3e8-7dc54f6290ea	VERIFY_EMAIL	Verify Email	79df126b-a967-4d6d-a704-427910aca988	t	f	VERIFY_EMAIL	50
c5844504-6dfb-4fec-94e1-cd523a8a146a	UPDATE_PROFILE	Update Profile	79df126b-a967-4d6d-a704-427910aca988	t	f	UPDATE_PROFILE	40
f474ce1a-e553-41d9-a491-4d3482d3b0cc	CONFIGURE_TOTP	Configure OTP	79df126b-a967-4d6d-a704-427910aca988	t	f	CONFIGURE_TOTP	10
11132407-ef80-45a3-9fee-9fc4b3b64775	UPDATE_PASSWORD	Update Password	79df126b-a967-4d6d-a704-427910aca988	t	f	UPDATE_PASSWORD	30
0b9fb066-14ff-4d6d-9eef-57fb8d0fd25b	TERMS_AND_CONDITIONS	Terms and Conditions	79df126b-a967-4d6d-a704-427910aca988	f	f	TERMS_AND_CONDITIONS	20
39ecf6da-96ab-4496-9efb-cdf1a06684a4	delete_account	Delete Account	79df126b-a967-4d6d-a704-427910aca988	f	f	delete_account	60
17cba6ab-46c0-4035-8500-e34e17cbb099	delete_credential	Delete Credential	79df126b-a967-4d6d-a704-427910aca988	t	f	delete_credential	100
cbc9d234-f4e9-4c6e-8487-a6bbccd18d51	update_user_locale	Update User Locale	79df126b-a967-4d6d-a704-427910aca988	t	f	update_user_locale	1000
ba24a379-1922-4d53-9d19-6f2fbdc2a503	webauthn-register	Webauthn Register	79df126b-a967-4d6d-a704-427910aca988	t	f	webauthn-register	70
9301e530-3104-401a-b3bd-bc84abfcd36c	webauthn-register-passwordless	Webauthn Register Passwordless	79df126b-a967-4d6d-a704-427910aca988	t	f	webauthn-register-passwordless	80
0a3e5724-2828-4c79-b7ec-b611c94ed29f	VERIFY_PROFILE	Verify Profile	79df126b-a967-4d6d-a704-427910aca988	t	f	VERIFY_PROFILE	90
559a9589-713a-4e98-80d9-8252f46def85	VERIFY_EMAIL	Verify Email	dms	t	f	VERIFY_EMAIL	50
c2650295-8067-4a3d-a2b1-1ed4369150ab	UPDATE_PROFILE	Update Profile	dms	t	f	UPDATE_PROFILE	40
b4f3359f-56a5-4e9f-b472-84c36e649381	CONFIGURE_TOTP	Configure OTP	dms	t	f	CONFIGURE_TOTP	10
90620fa3-860c-44c5-8f3a-19f1a318d597	UPDATE_PASSWORD	Update Password	dms	t	f	UPDATE_PASSWORD	30
b7fc5276-e791-4e20-83f3-79f7120a14ca	TERMS_AND_CONDITIONS	Terms and Conditions	dms	f	f	TERMS_AND_CONDITIONS	20
9e5c31eb-c520-4cb3-b814-69a68707e6bb	delete_account	Delete Account	dms	f	f	delete_account	60
1228bb3b-3ecb-4733-a001-edcc845555a9	delete_credential	Delete Credential	dms	t	f	delete_credential	100
d2b8f06a-5b51-4055-ab3f-bb88f68bece4	update_user_locale	Update User Locale	dms	t	f	update_user_locale	1000
4dfc9914-d0e9-4b02-ad93-e269fe6922b3	webauthn-register	Webauthn Register	dms	t	f	webauthn-register	70
41a95419-ae61-4a62-b9bf-33ef11496966	webauthn-register-passwordless	Webauthn Register Passwordless	dms	t	f	webauthn-register-passwordless	80
a86356bc-5f34-446d-a956-9f3bda220e60	VERIFY_PROFILE	Verify Profile	dms	t	f	VERIFY_PROFILE	90
\.


--
-- Data for Name: resource_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_attribute (id, name, value, resource_id) FROM stdin;
\.


--
-- Data for Name: resource_policy; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_policy (resource_id, policy_id) FROM stdin;
\.


--
-- Data for Name: resource_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_scope (resource_id, scope_id) FROM stdin;
\.


--
-- Data for Name: resource_server; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_server (id, allow_rs_remote_mgmt, policy_enforce_mode, decision_strategy) FROM stdin;
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	t	0	1
\.


--
-- Data for Name: resource_server_perm_ticket; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_server_perm_ticket (id, owner, requester, created_timestamp, granted_timestamp, resource_id, scope_id, resource_server_id, policy_id) FROM stdin;
\.


--
-- Data for Name: resource_server_policy; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_server_policy (id, name, description, type, decision_strategy, logic, resource_server_id, owner) FROM stdin;
\.


--
-- Data for Name: resource_server_resource; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_server_resource (id, name, type, icon_uri, owner, resource_server_id, owner_managed_access, display_name) FROM stdin;
\.


--
-- Data for Name: resource_server_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_server_scope (id, name, icon_uri, resource_server_id, display_name) FROM stdin;
\.


--
-- Data for Name: resource_uris; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.resource_uris (resource_id, value) FROM stdin;
\.


--
-- Data for Name: revoked_token; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.revoked_token (id, expire) FROM stdin;
\.


--
-- Data for Name: role_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.role_attribute (id, role_id, name, value) FROM stdin;
\.


--
-- Data for Name: scope_mapping; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.scope_mapping (client_id, role_id) FROM stdin;
3775a915-293b-43f7-909d-bbf62865c526	cb7d892d-4359-4bdc-8739-784a1686399b
3775a915-293b-43f7-909d-bbf62865c526	61887019-be21-42e7-b934-8967f0f0644a
458c2c0d-26e8-465c-97c4-1631dcf3d008	a04202f4-273b-4c98-91ee-df86070ee45d
458c2c0d-26e8-465c-97c4-1631dcf3d008	26675337-57a3-48db-b41e-a0bf3c9b12a3
\.


--
-- Data for Name: scope_policy; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.scope_policy (scope_id, policy_id) FROM stdin;
\.


--
-- Data for Name: user_attribute; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_attribute (name, value, user_id, id, long_value_hash, long_value_hash_lower_case, long_value) FROM stdin;
clearance_level	10	e5fcd2a3-597c-438a-ba74-66ba70b13a1e	8e91ecb9-867e-4b15-b326-bfb4b2ddc63a	\N	\N	\N
firm_id	system	e5fcd2a3-597c-438a-ba74-66ba70b13a1e	9d050dfe-a13d-4792-af97-a5bc4332e53e	\N	\N	\N
is_partner	false	e5fcd2a3-597c-438a-ba74-66ba70b13a1e	a94d2c6f-e2a5-4076-8d1a-4bce81dd0301	\N	\N	\N
teams	["system"]	e5fcd2a3-597c-438a-ba74-66ba70b13a1e	71fc6ed7-060e-4cac-b9b5-0bb0f8d127ba	\N	\N	\N
clearance_level	5	852d8fd1-a1e2-4d40-a375-c2900b7d9c03	1652d1d0-b7c4-4647-a449-a2491fff20cf	\N	\N	\N
firm_id	f-1	852d8fd1-a1e2-4d40-a375-c2900b7d9c03	1ec5d0e8-a3e4-4ea0-85d7-8ba6b156eb0d	\N	\N	\N
is_partner	false	852d8fd1-a1e2-4d40-a375-c2900b7d9c03	512e4c69-bef5-453b-9d7c-e98919abda47	\N	\N	\N
teams	["admin"]	852d8fd1-a1e2-4d40-a375-c2900b7d9c03	dad69272-8858-4b67-9fef-94b11727fa63	\N	\N	\N
clearance_level	3	cc56a011-3af1-4c05-95e2-91f5a38fbb29	24ecc9bf-7e92-44d7-bfaa-1fadea00265c	\N	\N	\N
firm_id	f-1	cc56a011-3af1-4c05-95e2-91f5a38fbb29	ad1c153d-5b0b-4976-bd59-9c607875ca01	\N	\N	\N
is_partner	false	cc56a011-3af1-4c05-95e2-91f5a38fbb29	510de2b8-dedb-4862-94c8-9279f873009d	\N	\N	\N
teams	["litigation", "corporate"]	cc56a011-3af1-4c05-95e2-91f5a38fbb29	4839855c-0f52-4d0f-aff6-292bcae9b856	\N	\N	\N
clearance_level	1	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	3a245747-acca-420b-8c7b-3b44701251d5	\N	\N	\N
firm_id	external	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	58969301-cdbb-43e1-a4b7-e27a1538cd98	\N	\N	\N
is_partner	false	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	b38353a8-d5f0-4f42-8f4f-0006331eb77c	\N	\N	\N
teams	[]	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	c1a06f08-053c-4fb6-bb1e-f1c918285ee5	\N	\N	\N
is_temporary_admin	true	8e5753e6-cbdf-4219-89d3-3c5108678cd7	495d9234-d67b-4dc9-a972-d37cecda06f9	\N	\N	\N
\.


--
-- Data for Name: user_consent; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_consent (id, client_id, user_id, created_date, last_updated_date, client_storage_provider, external_client_id) FROM stdin;
\.


--
-- Data for Name: user_consent_client_scope; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_consent_client_scope (user_consent_id, scope_id) FROM stdin;
\.


--
-- Data for Name: user_entity; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_entity (id, email, email_constraint, email_verified, enabled, federation_link, first_name, last_name, realm_id, username, created_timestamp, service_account_client_link, not_before) FROM stdin;
852d8fd1-a1e2-4d40-a375-c2900b7d9c03	admin@firm1.com	admin@firm1.com	f	t	\N	Firm	Admin	dms	firm1-admin	\N	\N	0
c95f24c3-38a6-4ac3-b856-1f953e4885d9	\N	bdb1cefc-c1db-43df-81fd-ccda1418593c	f	t	\N	\N	\N	dms	service-account-dms-app	1757620668532	37717b25-4fa4-4114-a1a5-df0d9ecb35ad	0
8e5753e6-cbdf-4219-89d3-3c5108678cd7	\N	30e8de10-da1c-4fba-a167-0efc97592c47	f	t	\N	\N	\N	79df126b-a967-4d6d-a704-427910aca988	admin	1757620668636	\N	0
cb1337a2-5f7a-4324-817e-6a84b1330fd3	superadmin@example.com	superadmin@example.com	t	t	\N	Super	Admin	dms	superadmin	1757728027056	\N	0
311dc854-b518-4dd9-b59e-fdb48c762bc2	firmadmin@example.com	firmadmin@example.com	t	t	\N	Firm	Admin	dms	firmadmin	1757728091777	\N	0
da57798b-8b15-437b-8007-a657ba40d782	smcsorl@gmail.com	smcsorl@gmail.com	t	t	\N	Steven	Mcsorley	dms	supersteven	1757864235393	\N	0
e5fcd2a3-597c-438a-ba74-66ba70b13a1e	admin@example.com	admin@example.com	t	t	\N	System	Administrator	dms	admin	\N	\N	0
6cad6b70-1a00-435c-bae3-86078903a491	testuser@testuser.com	testuser@testuser.com	t	t	\N	test	user	dms	testuser	1757725861701	\N	0
7dcc1aa7-6fc0-4530-985c-c64a9f065ef7	contact@client1.com	contact@client1.com	t	t	\N	Jane	Client	dms	client1	\N	\N	0
f922afa3-824a-4ba6-9db7-211230451b1b	demo@client.com	demo@client.com	t	t	\N	Jason	Bourne	dms	democlient	1757942859144	\N	0
853d7973-acfd-42ba-9e48-899a7f759b96	micky@mouse.com	micky@mouse.com	t	t	\N	micky	mouse	dms	micky	1757966344537	\N	0
cc56a011-3af1-4c05-95e2-91f5a38fbb29	lawyer1@firm1.com	lawyer1@firm1.com	t	t	\N	John	Lawyer	dms	lawyer1	\N	\N	0
d0909c2e-0ab0-4219-a6c0-45b68e3f1e18	saul@goodman.com	saul@goodman.com	t	t	\N	Saul	Goodman	dms	saul	1757969481458	\N	0
db3c1a36-e081-4712-bd15-459cc902695a	kim@wexler.com	kim@wexler.com	t	t	\N	kim	wexler	dms	kim	1757982115655	\N	0
f67ae4d7-31a6-4727-8404-650ee3ff9874	partner@partnerlaw.com	partner@partnerlaw.com	t	t	\N	Partner	Attorney	dms	partner	1758186958080	\N	0
021627ec-a61d-496a-8b7a-0c6755f8e916	admin@partner.com	admin@partner.com	t	t	\N	admin	partner	dms	adminpartner	1758194394317	\N	0
0d28997f-5453-49f4-af0c-e6fcbaf19650	saul@bettercallsaul.com	saul@bettercallsaul.com	t	t	\N	Jimmy	McGill	dms	saulgoodman	1758221358223	\N	0
981a3974-7052-44dc-a99c-04d43bbb346b	chuck.mcgill@hhm-law.com	chuck.mcgill@hhm-law.com	t	t	\N	chuck	mcgill	dms	chuck	1758303743182	\N	0
21a08902-ac63-4c69-85d2-0101af397d5b	ben.matlock@matlocklaw.com	ben.matlock@matlocklaw.com	t	t	\N	ben	matlock	dms	ben	1758314509396	\N	0
\.


--
-- Data for Name: user_federation_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_federation_config (user_federation_provider_id, value, name) FROM stdin;
\.


--
-- Data for Name: user_federation_mapper; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_federation_mapper (id, name, federation_provider_id, federation_mapper_type, realm_id) FROM stdin;
\.


--
-- Data for Name: user_federation_mapper_config; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_federation_mapper_config (user_federation_mapper_id, value, name) FROM stdin;
\.


--
-- Data for Name: user_federation_provider; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_federation_provider (id, changed_sync_period, display_name, full_sync_period, last_sync, priority, provider_name, realm_id) FROM stdin;
\.


--
-- Data for Name: user_group_membership; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_group_membership (group_id, user_id, membership_type) FROM stdin;
fabe74b3-604e-4dac-9e4e-c0f812240e57	db3c1a36-e081-4712-bd15-459cc902695a	UNMANAGED
110c482d-e4b1-496a-bab8-5a5d13775157	db3c1a36-e081-4712-bd15-459cc902695a	UNMANAGED
\.


--
-- Data for Name: user_required_action; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_required_action (user_id, required_action) FROM stdin;
\.


--
-- Data for Name: user_role_mapping; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.user_role_mapping (role_id, user_id) FROM stdin;
1f00fdf8-454e-4b28-b20c-1ea9e1533926	e5fcd2a3-597c-438a-ba74-66ba70b13a1e
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	e5fcd2a3-597c-438a-ba74-66ba70b13a1e
07804c47-a195-4401-b572-071ea8244b0f	852d8fd1-a1e2-4d40-a375-c2900b7d9c03
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	852d8fd1-a1e2-4d40-a375-c2900b7d9c03
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	cc56a011-3af1-4c05-95e2-91f5a38fbb29
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	cc56a011-3af1-4c05-95e2-91f5a38fbb29
bdfe503f-043c-48f5-b0ea-ed036440adef	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7
ab3a42f2-9a18-4c69-ba53-d6971dc333f2	7dcc1aa7-6fc0-4530-985c-c64a9f065ef7
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	c95f24c3-38a6-4ac3-b856-1f953e4885d9
bde9ac3b-1cd0-4787-92e3-79e3577c56d1	c95f24c3-38a6-4ac3-b856-1f953e4885d9
23014211-f23b-49fb-9a40-f3d051e9bfc4	8e5753e6-cbdf-4219-89d3-3c5108678cd7
f33a9ee9-dfd2-4ef0-9360-0a1d4cf45c9d	8e5753e6-cbdf-4219-89d3-3c5108678cd7
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	6cad6b70-1a00-435c-bae3-86078903a491
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	6cad6b70-1a00-435c-bae3-86078903a491
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	cb1337a2-5f7a-4324-817e-6a84b1330fd3
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	311dc854-b518-4dd9-b59e-fdb48c762bc2
1f00fdf8-454e-4b28-b20c-1ea9e1533926	cb1337a2-5f7a-4324-817e-6a84b1330fd3
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	da57798b-8b15-437b-8007-a657ba40d782
e1d396f2-2323-48cb-9b83-2dd1ab8496b9	da57798b-8b15-437b-8007-a657ba40d782
85bd92ce-2046-4468-8d7d-1b472c3e74fa	da57798b-8b15-437b-8007-a657ba40d782
05e85317-d745-4fbb-8b24-6b57dd7305e6	da57798b-8b15-437b-8007-a657ba40d782
252a614c-7055-4f48-8b97-d4ad65dbb410	da57798b-8b15-437b-8007-a657ba40d782
63feff10-b29e-47c1-a062-3c1192e54112	da57798b-8b15-437b-8007-a657ba40d782
71a66010-89f2-4a91-a25d-d2dc1d1868c5	da57798b-8b15-437b-8007-a657ba40d782
50b999d8-6a76-4302-8036-c0c37ac6f5bd	da57798b-8b15-437b-8007-a657ba40d782
80d84ac3-657f-4ae8-b018-34c859d6a2b4	da57798b-8b15-437b-8007-a657ba40d782
39140e2d-6e6f-45ba-a166-67e15fa8d52d	da57798b-8b15-437b-8007-a657ba40d782
cdff266b-3066-4660-a3b3-03070f0474b6	da57798b-8b15-437b-8007-a657ba40d782
f4449489-7d69-499a-b978-a4136b5736ed	da57798b-8b15-437b-8007-a657ba40d782
f21f0eba-d232-4436-997f-4be1a4b91522	da57798b-8b15-437b-8007-a657ba40d782
bde9ac3b-1cd0-4787-92e3-79e3577c56d1	da57798b-8b15-437b-8007-a657ba40d782
1c00d0ee-2a55-4503-803b-449daf4a0e80	da57798b-8b15-437b-8007-a657ba40d782
26675337-57a3-48db-b41e-a0bf3c9b12a3	da57798b-8b15-437b-8007-a657ba40d782
d8e93245-50fc-4fca-b21b-8ad25fcdfae0	da57798b-8b15-437b-8007-a657ba40d782
de4a665c-bfb0-4f67-8621-72cecfe6bb8f	da57798b-8b15-437b-8007-a657ba40d782
c857678b-98a0-460d-9a36-b97b4a0d2e75	da57798b-8b15-437b-8007-a657ba40d782
e9759665-f7e9-4210-a750-8429ee9dfa65	da57798b-8b15-437b-8007-a657ba40d782
a04202f4-273b-4c98-91ee-df86070ee45d	da57798b-8b15-437b-8007-a657ba40d782
bf00d2fd-bcd9-4efa-a657-32aca2805680	da57798b-8b15-437b-8007-a657ba40d782
1f00fdf8-454e-4b28-b20c-1ea9e1533926	da57798b-8b15-437b-8007-a657ba40d782
bdfe503f-043c-48f5-b0ea-ed036440adef	f922afa3-824a-4ba6-9db7-211230451b1b
bdfe503f-043c-48f5-b0ea-ed036440adef	853d7973-acfd-42ba-9e48-899a7f759b96
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	d0909c2e-0ab0-4219-a6c0-45b68e3f1e18
07804c47-a195-4401-b572-071ea8244b0f	d0909c2e-0ab0-4219-a6c0-45b68e3f1e18
d647e752-e492-47d3-a276-826d6fa6bd19	d0909c2e-0ab0-4219-a6c0-45b68e3f1e18
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	d0909c2e-0ab0-4219-a6c0-45b68e3f1e18
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	db3c1a36-e081-4712-bd15-459cc902695a
07804c47-a195-4401-b572-071ea8244b0f	db3c1a36-e081-4712-bd15-459cc902695a
d647e752-e492-47d3-a276-826d6fa6bd19	db3c1a36-e081-4712-bd15-459cc902695a
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	db3c1a36-e081-4712-bd15-459cc902695a
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	f67ae4d7-31a6-4727-8404-650ee3ff9874
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	021627ec-a61d-496a-8b7a-0c6755f8e916
07804c47-a195-4401-b572-071ea8244b0f	021627ec-a61d-496a-8b7a-0c6755f8e916
d647e752-e492-47d3-a276-826d6fa6bd19	021627ec-a61d-496a-8b7a-0c6755f8e916
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	021627ec-a61d-496a-8b7a-0c6755f8e916
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	0d28997f-5453-49f4-af0c-e6fcbaf19650
07804c47-a195-4401-b572-071ea8244b0f	0d28997f-5453-49f4-af0c-e6fcbaf19650
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	0d28997f-5453-49f4-af0c-e6fcbaf19650
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	981a3974-7052-44dc-a99c-04d43bbb346b
07804c47-a195-4401-b572-071ea8244b0f	981a3974-7052-44dc-a99c-04d43bbb346b
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	981a3974-7052-44dc-a99c-04d43bbb346b
5cc175e5-95e4-4a6d-9c35-b3ddea86d46c	21a08902-ac63-4c69-85d2-0101af397d5b
07804c47-a195-4401-b572-071ea8244b0f	21a08902-ac63-4c69-85d2-0101af397d5b
e66cdf42-0f7f-4aae-af6a-3ca520a0255f	21a08902-ac63-4c69-85d2-0101af397d5b
\.


--
-- Data for Name: username_login_failure; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.username_login_failure (realm_id, username, failed_login_not_before, last_failure, last_ip_failure, num_failures) FROM stdin;
\.


--
-- Data for Name: web_origins; Type: TABLE DATA; Schema: public; Owner: keycloak
--

COPY public.web_origins (client_id, value) FROM stdin;
8f02f084-4f1d-41c9-bce2-2d6470b93af6	+
e21a0b08-0675-4768-8044-b427263a416c	+
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost:3000
37717b25-4fa4-4114-a1a5-df0d9ecb35ad	http://localhost:5173
\.


--
-- Name: username_login_failure CONSTRAINT_17-2; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.username_login_failure
    ADD CONSTRAINT "CONSTRAINT_17-2" PRIMARY KEY (realm_id, username);


--
-- Name: org_domain ORG_DOMAIN_pkey; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.org_domain
    ADD CONSTRAINT "ORG_DOMAIN_pkey" PRIMARY KEY (id, name);


--
-- Name: org ORG_pkey; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT "ORG_pkey" PRIMARY KEY (id);


--
-- Name: keycloak_role UK_J3RWUVD56ONTGSUHOGM184WW2-2; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT "UK_J3RWUVD56ONTGSUHOGM184WW2-2" UNIQUE (name, client_realm_constraint);


--
-- Name: client_auth_flow_bindings c_cli_flow_bind; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_auth_flow_bindings
    ADD CONSTRAINT c_cli_flow_bind PRIMARY KEY (client_id, binding_name);


--
-- Name: client_scope_client c_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope_client
    ADD CONSTRAINT c_cli_scope_bind PRIMARY KEY (client_id, scope_id);


--
-- Name: client_initial_access cnstr_client_init_acc_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT cnstr_client_init_acc_pk PRIMARY KEY (id);


--
-- Name: realm_default_groups con_group_id_def_groups; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT con_group_id_def_groups UNIQUE (group_id);


--
-- Name: broker_link constr_broker_link_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.broker_link
    ADD CONSTRAINT constr_broker_link_pk PRIMARY KEY (identity_provider, user_id);


--
-- Name: component_config constr_component_config_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT constr_component_config_pk PRIMARY KEY (id);


--
-- Name: component constr_component_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT constr_component_pk PRIMARY KEY (id);


--
-- Name: fed_user_required_action constr_fed_required_action; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_required_action
    ADD CONSTRAINT constr_fed_required_action PRIMARY KEY (required_action, user_id);


--
-- Name: fed_user_attribute constr_fed_user_attr_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_attribute
    ADD CONSTRAINT constr_fed_user_attr_pk PRIMARY KEY (id);


--
-- Name: fed_user_consent constr_fed_user_consent_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_consent
    ADD CONSTRAINT constr_fed_user_consent_pk PRIMARY KEY (id);


--
-- Name: fed_user_credential constr_fed_user_cred_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_credential
    ADD CONSTRAINT constr_fed_user_cred_pk PRIMARY KEY (id);


--
-- Name: fed_user_group_membership constr_fed_user_group; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_group_membership
    ADD CONSTRAINT constr_fed_user_group PRIMARY KEY (group_id, user_id);


--
-- Name: fed_user_role_mapping constr_fed_user_role; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_role_mapping
    ADD CONSTRAINT constr_fed_user_role PRIMARY KEY (role_id, user_id);


--
-- Name: federated_user constr_federated_user; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.federated_user
    ADD CONSTRAINT constr_federated_user PRIMARY KEY (id);


--
-- Name: realm_default_groups constr_realm_default_groups; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT constr_realm_default_groups PRIMARY KEY (realm_id, group_id);


--
-- Name: realm_enabled_event_types constr_realm_enabl_event_types; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT constr_realm_enabl_event_types PRIMARY KEY (realm_id, value);


--
-- Name: realm_events_listeners constr_realm_events_listeners; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT constr_realm_events_listeners PRIMARY KEY (realm_id, value);


--
-- Name: realm_supported_locales constr_realm_supported_locales; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT constr_realm_supported_locales PRIMARY KEY (realm_id, value);


--
-- Name: identity_provider constraint_2b; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT constraint_2b PRIMARY KEY (internal_id);


--
-- Name: client_attributes constraint_3c; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT constraint_3c PRIMARY KEY (client_id, name);


--
-- Name: event_entity constraint_4; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.event_entity
    ADD CONSTRAINT constraint_4 PRIMARY KEY (id);


--
-- Name: federated_identity constraint_40; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT constraint_40 PRIMARY KEY (identity_provider, user_id);


--
-- Name: realm constraint_4a; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT constraint_4a PRIMARY KEY (id);


--
-- Name: user_federation_provider constraint_5c; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT constraint_5c PRIMARY KEY (id);


--
-- Name: client constraint_7; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT constraint_7 PRIMARY KEY (id);


--
-- Name: scope_mapping constraint_81; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT constraint_81 PRIMARY KEY (client_id, role_id);


--
-- Name: client_node_registrations constraint_84; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT constraint_84 PRIMARY KEY (client_id, name);


--
-- Name: realm_attribute constraint_9; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT constraint_9 PRIMARY KEY (name, realm_id);


--
-- Name: realm_required_credential constraint_92; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT constraint_92 PRIMARY KEY (realm_id, type);


--
-- Name: keycloak_role constraint_a; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT constraint_a PRIMARY KEY (id);


--
-- Name: admin_event_entity constraint_admin_event_entity; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.admin_event_entity
    ADD CONSTRAINT constraint_admin_event_entity PRIMARY KEY (id);


--
-- Name: authenticator_config_entry constraint_auth_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authenticator_config_entry
    ADD CONSTRAINT constraint_auth_cfg_pk PRIMARY KEY (authenticator_id, name);


--
-- Name: authentication_execution constraint_auth_exec_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT constraint_auth_exec_pk PRIMARY KEY (id);


--
-- Name: authentication_flow constraint_auth_flow_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT constraint_auth_flow_pk PRIMARY KEY (id);


--
-- Name: authenticator_config constraint_auth_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT constraint_auth_pk PRIMARY KEY (id);


--
-- Name: user_role_mapping constraint_c; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT constraint_c PRIMARY KEY (role_id, user_id);


--
-- Name: composite_role constraint_composite_role; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT constraint_composite_role PRIMARY KEY (composite, child_role);


--
-- Name: identity_provider_config constraint_d; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT constraint_d PRIMARY KEY (identity_provider_id, name);


--
-- Name: policy_config constraint_dpc; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT constraint_dpc PRIMARY KEY (policy_id, name);


--
-- Name: realm_smtp_config constraint_e; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT constraint_e PRIMARY KEY (realm_id, name);


--
-- Name: credential constraint_f; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT constraint_f PRIMARY KEY (id);


--
-- Name: user_federation_config constraint_f9; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT constraint_f9 PRIMARY KEY (user_federation_provider_id, name);


--
-- Name: resource_server_perm_ticket constraint_fapmt; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT constraint_fapmt PRIMARY KEY (id);


--
-- Name: resource_server_resource constraint_farsr; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT constraint_farsr PRIMARY KEY (id);


--
-- Name: resource_server_policy constraint_farsrp; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT constraint_farsrp PRIMARY KEY (id);


--
-- Name: associated_policy constraint_farsrpap; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT constraint_farsrpap PRIMARY KEY (policy_id, associated_policy_id);


--
-- Name: resource_policy constraint_farsrpp; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT constraint_farsrpp PRIMARY KEY (resource_id, policy_id);


--
-- Name: resource_server_scope constraint_farsrs; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT constraint_farsrs PRIMARY KEY (id);


--
-- Name: resource_scope constraint_farsrsp; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT constraint_farsrsp PRIMARY KEY (resource_id, scope_id);


--
-- Name: scope_policy constraint_farsrsps; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT constraint_farsrsps PRIMARY KEY (scope_id, policy_id);


--
-- Name: user_entity constraint_fb; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT constraint_fb PRIMARY KEY (id);


--
-- Name: user_federation_mapper_config constraint_fedmapper_cfg_pm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT constraint_fedmapper_cfg_pm PRIMARY KEY (user_federation_mapper_id, name);


--
-- Name: user_federation_mapper constraint_fedmapperpm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT constraint_fedmapperpm PRIMARY KEY (id);


--
-- Name: fed_user_consent_cl_scope constraint_fgrntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.fed_user_consent_cl_scope
    ADD CONSTRAINT constraint_fgrntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- Name: user_consent_client_scope constraint_grntcsnt_clsc_pm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT constraint_grntcsnt_clsc_pm PRIMARY KEY (user_consent_id, scope_id);


--
-- Name: user_consent constraint_grntcsnt_pm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT constraint_grntcsnt_pm PRIMARY KEY (id);


--
-- Name: keycloak_group constraint_group; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT constraint_group PRIMARY KEY (id);


--
-- Name: group_attribute constraint_group_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT constraint_group_attribute_pk PRIMARY KEY (id);


--
-- Name: group_role_mapping constraint_group_role; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT constraint_group_role PRIMARY KEY (role_id, group_id);


--
-- Name: identity_provider_mapper constraint_idpm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT constraint_idpm PRIMARY KEY (id);


--
-- Name: idp_mapper_config constraint_idpmconfig; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT constraint_idpmconfig PRIMARY KEY (idp_mapper_id, name);


--
-- Name: migration_model constraint_migmod; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.migration_model
    ADD CONSTRAINT constraint_migmod PRIMARY KEY (id);


--
-- Name: offline_client_session constraint_offl_cl_ses_pk3; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.offline_client_session
    ADD CONSTRAINT constraint_offl_cl_ses_pk3 PRIMARY KEY (user_session_id, client_id, client_storage_provider, external_client_id, offline_flag);


--
-- Name: offline_user_session constraint_offl_us_ses_pk2; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.offline_user_session
    ADD CONSTRAINT constraint_offl_us_ses_pk2 PRIMARY KEY (user_session_id, offline_flag);


--
-- Name: protocol_mapper constraint_pcm; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT constraint_pcm PRIMARY KEY (id);


--
-- Name: protocol_mapper_config constraint_pmconfig; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT constraint_pmconfig PRIMARY KEY (protocol_mapper_id, name);


--
-- Name: redirect_uris constraint_redirect_uris; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT constraint_redirect_uris PRIMARY KEY (client_id, value);


--
-- Name: required_action_config constraint_req_act_cfg_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.required_action_config
    ADD CONSTRAINT constraint_req_act_cfg_pk PRIMARY KEY (required_action_id, name);


--
-- Name: required_action_provider constraint_req_act_prv_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT constraint_req_act_prv_pk PRIMARY KEY (id);


--
-- Name: user_required_action constraint_required_action; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT constraint_required_action PRIMARY KEY (required_action, user_id);


--
-- Name: resource_uris constraint_resour_uris_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT constraint_resour_uris_pk PRIMARY KEY (resource_id, value);


--
-- Name: role_attribute constraint_role_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT constraint_role_attribute_pk PRIMARY KEY (id);


--
-- Name: revoked_token constraint_rt; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.revoked_token
    ADD CONSTRAINT constraint_rt PRIMARY KEY (id);


--
-- Name: user_attribute constraint_user_attribute_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT constraint_user_attribute_pk PRIMARY KEY (id);


--
-- Name: user_group_membership constraint_user_group; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT constraint_user_group PRIMARY KEY (group_id, user_id);


--
-- Name: web_origins constraint_web_origins; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT constraint_web_origins PRIMARY KEY (client_id, value);


--
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- Name: client_scope_attributes pk_cl_tmpl_attr; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT pk_cl_tmpl_attr PRIMARY KEY (scope_id, name);


--
-- Name: client_scope pk_cli_template; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT pk_cli_template PRIMARY KEY (id);


--
-- Name: resource_server pk_resource_server; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server
    ADD CONSTRAINT pk_resource_server PRIMARY KEY (id);


--
-- Name: client_scope_role_mapping pk_template_scope; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT pk_template_scope PRIMARY KEY (scope_id, role_id);


--
-- Name: default_client_scope r_def_cli_scope_bind; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT r_def_cli_scope_bind PRIMARY KEY (realm_id, scope_id);


--
-- Name: realm_localizations realm_localizations_pkey; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_localizations
    ADD CONSTRAINT realm_localizations_pkey PRIMARY KEY (realm_id, locale);


--
-- Name: resource_attribute res_attr_pk; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT res_attr_pk PRIMARY KEY (id);


--
-- Name: keycloak_group sibling_names; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.keycloak_group
    ADD CONSTRAINT sibling_names UNIQUE (realm_id, parent_group, name);


--
-- Name: identity_provider uk_2daelwnibji49avxsrtuf6xj33; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT uk_2daelwnibji49avxsrtuf6xj33 UNIQUE (provider_alias, realm_id);


--
-- Name: client uk_b71cjlbenv945rb6gcon438at; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT uk_b71cjlbenv945rb6gcon438at UNIQUE (realm_id, client_id);


--
-- Name: client_scope uk_cli_scope; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope
    ADD CONSTRAINT uk_cli_scope UNIQUE (realm_id, name);


--
-- Name: user_entity uk_dykn684sl8up1crfei6eckhd7; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_dykn684sl8up1crfei6eckhd7 UNIQUE (realm_id, email_constraint);


--
-- Name: user_consent uk_external_consent; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_external_consent UNIQUE (client_storage_provider, external_client_id, user_id);


--
-- Name: resource_server_resource uk_frsr6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5ha6 UNIQUE (name, owner, resource_server_id);


--
-- Name: resource_server_perm_ticket uk_frsr6t700s9v50bu18ws5pmt; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT uk_frsr6t700s9v50bu18ws5pmt UNIQUE (owner, requester, resource_server_id, resource_id, scope_id);


--
-- Name: resource_server_policy uk_frsrpt700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT uk_frsrpt700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- Name: resource_server_scope uk_frsrst700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT uk_frsrst700s9v50bu18ws5ha6 UNIQUE (name, resource_server_id);


--
-- Name: user_consent uk_local_consent; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT uk_local_consent UNIQUE (client_id, user_id);


--
-- Name: org uk_org_alias; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_alias UNIQUE (realm_id, alias);


--
-- Name: org uk_org_group; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_group UNIQUE (group_id);


--
-- Name: org uk_org_name; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT uk_org_name UNIQUE (realm_id, name);


--
-- Name: realm uk_orvsdmla56612eaefiq6wl5oi; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm
    ADD CONSTRAINT uk_orvsdmla56612eaefiq6wl5oi UNIQUE (name);


--
-- Name: user_entity uk_ru8tt6t700s9v50bu18ws5ha6; Type: CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_entity
    ADD CONSTRAINT uk_ru8tt6t700s9v50bu18ws5ha6 UNIQUE (realm_id, username);


--
-- Name: fed_user_attr_long_values; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX fed_user_attr_long_values ON public.fed_user_attribute USING btree (long_value_hash, name);


--
-- Name: fed_user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX fed_user_attr_long_values_lower_case ON public.fed_user_attribute USING btree (long_value_hash_lower_case, name);


--
-- Name: idx_admin_event_time; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_admin_event_time ON public.admin_event_entity USING btree (realm_id, admin_event_time);


--
-- Name: idx_assoc_pol_assoc_pol_id; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_assoc_pol_assoc_pol_id ON public.associated_policy USING btree (associated_policy_id);


--
-- Name: idx_auth_config_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_auth_config_realm ON public.authenticator_config USING btree (realm_id);


--
-- Name: idx_auth_exec_flow; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_auth_exec_flow ON public.authentication_execution USING btree (flow_id);


--
-- Name: idx_auth_exec_realm_flow; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_auth_exec_realm_flow ON public.authentication_execution USING btree (realm_id, flow_id);


--
-- Name: idx_auth_flow_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_auth_flow_realm ON public.authentication_flow USING btree (realm_id);


--
-- Name: idx_cl_clscope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_cl_clscope ON public.client_scope_client USING btree (scope_id);


--
-- Name: idx_client_att_by_name_value; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_client_att_by_name_value ON public.client_attributes USING btree (name, substr(value, 1, 255));


--
-- Name: idx_client_id; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_client_id ON public.client USING btree (client_id);


--
-- Name: idx_client_init_acc_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_client_init_acc_realm ON public.client_initial_access USING btree (realm_id);


--
-- Name: idx_clscope_attrs; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_clscope_attrs ON public.client_scope_attributes USING btree (scope_id);


--
-- Name: idx_clscope_cl; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_clscope_cl ON public.client_scope_client USING btree (client_id);


--
-- Name: idx_clscope_protmap; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_clscope_protmap ON public.protocol_mapper USING btree (client_scope_id);


--
-- Name: idx_clscope_role; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_clscope_role ON public.client_scope_role_mapping USING btree (scope_id);


--
-- Name: idx_compo_config_compo; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_compo_config_compo ON public.component_config USING btree (component_id);


--
-- Name: idx_component_provider_type; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_component_provider_type ON public.component USING btree (provider_type);


--
-- Name: idx_component_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_component_realm ON public.component USING btree (realm_id);


--
-- Name: idx_composite; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_composite ON public.composite_role USING btree (composite);


--
-- Name: idx_composite_child; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_composite_child ON public.composite_role USING btree (child_role);


--
-- Name: idx_defcls_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_defcls_realm ON public.default_client_scope USING btree (realm_id);


--
-- Name: idx_defcls_scope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_defcls_scope ON public.default_client_scope USING btree (scope_id);


--
-- Name: idx_event_time; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_event_time ON public.event_entity USING btree (realm_id, event_time);


--
-- Name: idx_fedidentity_feduser; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fedidentity_feduser ON public.federated_identity USING btree (federated_user_id);


--
-- Name: idx_fedidentity_user; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fedidentity_user ON public.federated_identity USING btree (user_id);


--
-- Name: idx_fu_attribute; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_attribute ON public.fed_user_attribute USING btree (user_id, realm_id, name);


--
-- Name: idx_fu_cnsnt_ext; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_cnsnt_ext ON public.fed_user_consent USING btree (user_id, client_storage_provider, external_client_id);


--
-- Name: idx_fu_consent; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_consent ON public.fed_user_consent USING btree (user_id, client_id);


--
-- Name: idx_fu_consent_ru; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_consent_ru ON public.fed_user_consent USING btree (realm_id, user_id);


--
-- Name: idx_fu_credential; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_credential ON public.fed_user_credential USING btree (user_id, type);


--
-- Name: idx_fu_credential_ru; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_credential_ru ON public.fed_user_credential USING btree (realm_id, user_id);


--
-- Name: idx_fu_group_membership; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_group_membership ON public.fed_user_group_membership USING btree (user_id, group_id);


--
-- Name: idx_fu_group_membership_ru; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_group_membership_ru ON public.fed_user_group_membership USING btree (realm_id, user_id);


--
-- Name: idx_fu_required_action; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_required_action ON public.fed_user_required_action USING btree (user_id, required_action);


--
-- Name: idx_fu_required_action_ru; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_required_action_ru ON public.fed_user_required_action USING btree (realm_id, user_id);


--
-- Name: idx_fu_role_mapping; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_role_mapping ON public.fed_user_role_mapping USING btree (user_id, role_id);


--
-- Name: idx_fu_role_mapping_ru; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_fu_role_mapping_ru ON public.fed_user_role_mapping USING btree (realm_id, user_id);


--
-- Name: idx_group_att_by_name_value; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_group_att_by_name_value ON public.group_attribute USING btree (name, ((value)::character varying(250)));


--
-- Name: idx_group_attr_group; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_group_attr_group ON public.group_attribute USING btree (group_id);


--
-- Name: idx_group_role_mapp_group; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_group_role_mapp_group ON public.group_role_mapping USING btree (group_id);


--
-- Name: idx_id_prov_mapp_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_id_prov_mapp_realm ON public.identity_provider_mapper USING btree (realm_id);


--
-- Name: idx_ident_prov_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_ident_prov_realm ON public.identity_provider USING btree (realm_id);


--
-- Name: idx_idp_for_login; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_idp_for_login ON public.identity_provider USING btree (realm_id, enabled, link_only, hide_on_login, organization_id);


--
-- Name: idx_idp_realm_org; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_idp_realm_org ON public.identity_provider USING btree (realm_id, organization_id);


--
-- Name: idx_keycloak_role_client; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_keycloak_role_client ON public.keycloak_role USING btree (client);


--
-- Name: idx_keycloak_role_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_keycloak_role_realm ON public.keycloak_role USING btree (realm);


--
-- Name: idx_offline_uss_by_broker_session_id; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_offline_uss_by_broker_session_id ON public.offline_user_session USING btree (broker_session_id, realm_id);


--
-- Name: idx_offline_uss_by_last_session_refresh; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_offline_uss_by_last_session_refresh ON public.offline_user_session USING btree (realm_id, offline_flag, last_session_refresh);


--
-- Name: idx_offline_uss_by_user; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_offline_uss_by_user ON public.offline_user_session USING btree (user_id, realm_id, offline_flag);


--
-- Name: idx_org_domain_org_id; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_org_domain_org_id ON public.org_domain USING btree (org_id);


--
-- Name: idx_perm_ticket_owner; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_perm_ticket_owner ON public.resource_server_perm_ticket USING btree (owner);


--
-- Name: idx_perm_ticket_requester; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_perm_ticket_requester ON public.resource_server_perm_ticket USING btree (requester);


--
-- Name: idx_protocol_mapper_client; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_protocol_mapper_client ON public.protocol_mapper USING btree (client_id);


--
-- Name: idx_realm_attr_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_attr_realm ON public.realm_attribute USING btree (realm_id);


--
-- Name: idx_realm_clscope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_clscope ON public.client_scope USING btree (realm_id);


--
-- Name: idx_realm_def_grp_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_def_grp_realm ON public.realm_default_groups USING btree (realm_id);


--
-- Name: idx_realm_evt_list_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_evt_list_realm ON public.realm_events_listeners USING btree (realm_id);


--
-- Name: idx_realm_evt_types_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_evt_types_realm ON public.realm_enabled_event_types USING btree (realm_id);


--
-- Name: idx_realm_master_adm_cli; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_master_adm_cli ON public.realm USING btree (master_admin_client);


--
-- Name: idx_realm_supp_local_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_realm_supp_local_realm ON public.realm_supported_locales USING btree (realm_id);


--
-- Name: idx_redir_uri_client; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_redir_uri_client ON public.redirect_uris USING btree (client_id);


--
-- Name: idx_req_act_prov_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_req_act_prov_realm ON public.required_action_provider USING btree (realm_id);


--
-- Name: idx_res_policy_policy; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_res_policy_policy ON public.resource_policy USING btree (policy_id);


--
-- Name: idx_res_scope_scope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_res_scope_scope ON public.resource_scope USING btree (scope_id);


--
-- Name: idx_res_serv_pol_res_serv; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_res_serv_pol_res_serv ON public.resource_server_policy USING btree (resource_server_id);


--
-- Name: idx_res_srv_res_res_srv; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_res_srv_res_res_srv ON public.resource_server_resource USING btree (resource_server_id);


--
-- Name: idx_res_srv_scope_res_srv; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_res_srv_scope_res_srv ON public.resource_server_scope USING btree (resource_server_id);


--
-- Name: idx_rev_token_on_expire; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_rev_token_on_expire ON public.revoked_token USING btree (expire);


--
-- Name: idx_role_attribute; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_role_attribute ON public.role_attribute USING btree (role_id);


--
-- Name: idx_role_clscope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_role_clscope ON public.client_scope_role_mapping USING btree (role_id);


--
-- Name: idx_scope_mapping_role; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_scope_mapping_role ON public.scope_mapping USING btree (role_id);


--
-- Name: idx_scope_policy_policy; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_scope_policy_policy ON public.scope_policy USING btree (policy_id);


--
-- Name: idx_update_time; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_update_time ON public.migration_model USING btree (update_time);


--
-- Name: idx_usconsent_clscope; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_usconsent_clscope ON public.user_consent_client_scope USING btree (user_consent_id);


--
-- Name: idx_usconsent_scope_id; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_usconsent_scope_id ON public.user_consent_client_scope USING btree (scope_id);


--
-- Name: idx_user_attribute; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_attribute ON public.user_attribute USING btree (user_id);


--
-- Name: idx_user_attribute_name; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_attribute_name ON public.user_attribute USING btree (name, value);


--
-- Name: idx_user_consent; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_consent ON public.user_consent USING btree (user_id);


--
-- Name: idx_user_credential; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_credential ON public.credential USING btree (user_id);


--
-- Name: idx_user_email; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_email ON public.user_entity USING btree (email);


--
-- Name: idx_user_group_mapping; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_group_mapping ON public.user_group_membership USING btree (user_id);


--
-- Name: idx_user_reqactions; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_reqactions ON public.user_required_action USING btree (user_id);


--
-- Name: idx_user_role_mapping; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_role_mapping ON public.user_role_mapping USING btree (user_id);


--
-- Name: idx_user_service_account; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_user_service_account ON public.user_entity USING btree (realm_id, service_account_client_link);


--
-- Name: idx_usr_fed_map_fed_prv; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_usr_fed_map_fed_prv ON public.user_federation_mapper USING btree (federation_provider_id);


--
-- Name: idx_usr_fed_map_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_usr_fed_map_realm ON public.user_federation_mapper USING btree (realm_id);


--
-- Name: idx_usr_fed_prv_realm; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_usr_fed_prv_realm ON public.user_federation_provider USING btree (realm_id);


--
-- Name: idx_web_orig_client; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX idx_web_orig_client ON public.web_origins USING btree (client_id);


--
-- Name: user_attr_long_values; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX user_attr_long_values ON public.user_attribute USING btree (long_value_hash, name);


--
-- Name: user_attr_long_values_lower_case; Type: INDEX; Schema: public; Owner: keycloak
--

CREATE INDEX user_attr_long_values_lower_case ON public.user_attribute USING btree (long_value_hash_lower_case, name);


--
-- Name: identity_provider fk2b4ebc52ae5c3b34; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider
    ADD CONSTRAINT fk2b4ebc52ae5c3b34 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: client_attributes fk3c47c64beacca966; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_attributes
    ADD CONSTRAINT fk3c47c64beacca966 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: federated_identity fk404288b92ef007a6; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.federated_identity
    ADD CONSTRAINT fk404288b92ef007a6 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: client_node_registrations fk4129723ba992f594; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_node_registrations
    ADD CONSTRAINT fk4129723ba992f594 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: redirect_uris fk_1burs8pb4ouj97h5wuppahv9f; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.redirect_uris
    ADD CONSTRAINT fk_1burs8pb4ouj97h5wuppahv9f FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: user_federation_provider fk_1fj32f6ptolw2qy60cd8n01e8; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_provider
    ADD CONSTRAINT fk_1fj32f6ptolw2qy60cd8n01e8 FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_required_credential fk_5hg65lybevavkqfki3kponh9v; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_required_credential
    ADD CONSTRAINT fk_5hg65lybevavkqfki3kponh9v FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: resource_attribute fk_5hrm2vlf9ql5fu022kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu022kqepovbr FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: user_attribute fk_5hrm2vlf9ql5fu043kqepovbr; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_attribute
    ADD CONSTRAINT fk_5hrm2vlf9ql5fu043kqepovbr FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: user_required_action fk_6qj3w1jw9cvafhe19bwsiuvmd; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_required_action
    ADD CONSTRAINT fk_6qj3w1jw9cvafhe19bwsiuvmd FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: keycloak_role fk_6vyqfe4cn4wlq8r6kt5vdsj5c; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.keycloak_role
    ADD CONSTRAINT fk_6vyqfe4cn4wlq8r6kt5vdsj5c FOREIGN KEY (realm) REFERENCES public.realm(id);


--
-- Name: realm_smtp_config fk_70ej8xdxgxd0b9hh6180irr0o; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_smtp_config
    ADD CONSTRAINT fk_70ej8xdxgxd0b9hh6180irr0o FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_attribute fk_8shxd6l3e9atqukacxgpffptw; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_attribute
    ADD CONSTRAINT fk_8shxd6l3e9atqukacxgpffptw FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: composite_role fk_a63wvekftu8jo1pnj81e7mce2; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_a63wvekftu8jo1pnj81e7mce2 FOREIGN KEY (composite) REFERENCES public.keycloak_role(id);


--
-- Name: authentication_execution fk_auth_exec_flow; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_flow FOREIGN KEY (flow_id) REFERENCES public.authentication_flow(id);


--
-- Name: authentication_execution fk_auth_exec_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authentication_execution
    ADD CONSTRAINT fk_auth_exec_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: authentication_flow fk_auth_flow_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authentication_flow
    ADD CONSTRAINT fk_auth_flow_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: authenticator_config fk_auth_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.authenticator_config
    ADD CONSTRAINT fk_auth_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_role_mapping fk_c4fqv34p1mbylloxang7b1q3l; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_role_mapping
    ADD CONSTRAINT fk_c4fqv34p1mbylloxang7b1q3l FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: client_scope_attributes fk_cl_scope_attr_scope; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope_attributes
    ADD CONSTRAINT fk_cl_scope_attr_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- Name: client_scope_role_mapping fk_cl_scope_rm_scope; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_scope_role_mapping
    ADD CONSTRAINT fk_cl_scope_rm_scope FOREIGN KEY (scope_id) REFERENCES public.client_scope(id);


--
-- Name: protocol_mapper fk_cli_scope_mapper; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_cli_scope_mapper FOREIGN KEY (client_scope_id) REFERENCES public.client_scope(id);


--
-- Name: client_initial_access fk_client_init_acc_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.client_initial_access
    ADD CONSTRAINT fk_client_init_acc_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: component_config fk_component_config; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.component_config
    ADD CONSTRAINT fk_component_config FOREIGN KEY (component_id) REFERENCES public.component(id);


--
-- Name: component fk_component_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.component
    ADD CONSTRAINT fk_component_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_default_groups fk_def_groups_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_default_groups
    ADD CONSTRAINT fk_def_groups_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_federation_mapper_config fk_fedmapper_cfg; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_mapper_config
    ADD CONSTRAINT fk_fedmapper_cfg FOREIGN KEY (user_federation_mapper_id) REFERENCES public.user_federation_mapper(id);


--
-- Name: user_federation_mapper fk_fedmapperpm_fedprv; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_fedprv FOREIGN KEY (federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- Name: user_federation_mapper fk_fedmapperpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_mapper
    ADD CONSTRAINT fk_fedmapperpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: associated_policy fk_frsr5s213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsr5s213xcx4wnkog82ssrfy FOREIGN KEY (associated_policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: scope_policy fk_frsrasp13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrasp13xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog82sspmt; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82sspmt FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_server_resource fk_frsrho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_resource
    ADD CONSTRAINT fk_frsrho213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog83sspmt; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog83sspmt FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_server_perm_ticket fk_frsrho213xcx4wnkog84sspmt; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrho213xcx4wnkog84sspmt FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: associated_policy fk_frsrpas14xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.associated_policy
    ADD CONSTRAINT fk_frsrpas14xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: scope_policy fk_frsrpass3xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.scope_policy
    ADD CONSTRAINT fk_frsrpass3xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: resource_server_perm_ticket fk_frsrpo2128cx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_perm_ticket
    ADD CONSTRAINT fk_frsrpo2128cx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_server_policy fk_frsrpo213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_policy
    ADD CONSTRAINT fk_frsrpo213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: resource_scope fk_frsrpos13xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrpos13xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_policy fk_frsrpos53xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpos53xcx4wnkog82ssrfy FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: resource_policy fk_frsrpp213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_policy
    ADD CONSTRAINT fk_frsrpp213xcx4wnkog82ssrfy FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: resource_scope fk_frsrps213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_scope
    ADD CONSTRAINT fk_frsrps213xcx4wnkog82ssrfy FOREIGN KEY (scope_id) REFERENCES public.resource_server_scope(id);


--
-- Name: resource_server_scope fk_frsrso213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_server_scope
    ADD CONSTRAINT fk_frsrso213xcx4wnkog82ssrfy FOREIGN KEY (resource_server_id) REFERENCES public.resource_server(id);


--
-- Name: composite_role fk_gr7thllb9lu8q4vqa4524jjy8; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.composite_role
    ADD CONSTRAINT fk_gr7thllb9lu8q4vqa4524jjy8 FOREIGN KEY (child_role) REFERENCES public.keycloak_role(id);


--
-- Name: user_consent_client_scope fk_grntcsnt_clsc_usc; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent_client_scope
    ADD CONSTRAINT fk_grntcsnt_clsc_usc FOREIGN KEY (user_consent_id) REFERENCES public.user_consent(id);


--
-- Name: user_consent fk_grntcsnt_user; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_consent
    ADD CONSTRAINT fk_grntcsnt_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: group_attribute fk_group_attribute_group; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.group_attribute
    ADD CONSTRAINT fk_group_attribute_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- Name: group_role_mapping fk_group_role_group; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.group_role_mapping
    ADD CONSTRAINT fk_group_role_group FOREIGN KEY (group_id) REFERENCES public.keycloak_group(id);


--
-- Name: realm_enabled_event_types fk_h846o4h0w8epx5nwedrf5y69j; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_enabled_event_types
    ADD CONSTRAINT fk_h846o4h0w8epx5nwedrf5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: realm_events_listeners fk_h846o4h0w8epx5nxev9f5y69j; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_events_listeners
    ADD CONSTRAINT fk_h846o4h0w8epx5nxev9f5y69j FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: identity_provider_mapper fk_idpm_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider_mapper
    ADD CONSTRAINT fk_idpm_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: idp_mapper_config fk_idpmconfig; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.idp_mapper_config
    ADD CONSTRAINT fk_idpmconfig FOREIGN KEY (idp_mapper_id) REFERENCES public.identity_provider_mapper(id);


--
-- Name: web_origins fk_lojpho213xcx4wnkog82ssrfy; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.web_origins
    ADD CONSTRAINT fk_lojpho213xcx4wnkog82ssrfy FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: scope_mapping fk_ouse064plmlr732lxjcn1q5f1; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.scope_mapping
    ADD CONSTRAINT fk_ouse064plmlr732lxjcn1q5f1 FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: protocol_mapper fk_pcm_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.protocol_mapper
    ADD CONSTRAINT fk_pcm_realm FOREIGN KEY (client_id) REFERENCES public.client(id);


--
-- Name: credential fk_pfyr0glasqyl0dei3kl69r6v0; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.credential
    ADD CONSTRAINT fk_pfyr0glasqyl0dei3kl69r6v0 FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: protocol_mapper_config fk_pmconfig; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.protocol_mapper_config
    ADD CONSTRAINT fk_pmconfig FOREIGN KEY (protocol_mapper_id) REFERENCES public.protocol_mapper(id);


--
-- Name: default_client_scope fk_r_def_cli_scope_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.default_client_scope
    ADD CONSTRAINT fk_r_def_cli_scope_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: required_action_provider fk_req_act_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.required_action_provider
    ADD CONSTRAINT fk_req_act_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: resource_uris fk_resource_server_uris; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.resource_uris
    ADD CONSTRAINT fk_resource_server_uris FOREIGN KEY (resource_id) REFERENCES public.resource_server_resource(id);


--
-- Name: role_attribute fk_role_attribute_id; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.role_attribute
    ADD CONSTRAINT fk_role_attribute_id FOREIGN KEY (role_id) REFERENCES public.keycloak_role(id);


--
-- Name: realm_supported_locales fk_supported_locales_realm; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.realm_supported_locales
    ADD CONSTRAINT fk_supported_locales_realm FOREIGN KEY (realm_id) REFERENCES public.realm(id);


--
-- Name: user_federation_config fk_t13hpu1j94r2ebpekr39x5eu5; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_federation_config
    ADD CONSTRAINT fk_t13hpu1j94r2ebpekr39x5eu5 FOREIGN KEY (user_federation_provider_id) REFERENCES public.user_federation_provider(id);


--
-- Name: user_group_membership fk_user_group_user; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.user_group_membership
    ADD CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES public.user_entity(id);


--
-- Name: policy_config fkdc34197cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.policy_config
    ADD CONSTRAINT fkdc34197cf864c4e43 FOREIGN KEY (policy_id) REFERENCES public.resource_server_policy(id);


--
-- Name: identity_provider_config fkdc4897cf864c4e43; Type: FK CONSTRAINT; Schema: public; Owner: keycloak
--

ALTER TABLE ONLY public.identity_provider_config
    ADD CONSTRAINT fkdc4897cf864c4e43 FOREIGN KEY (identity_provider_id) REFERENCES public.identity_provider(internal_id);


--
-- PostgreSQL database dump complete
--

\unrestrict aoVkbUIIfsRhmHgdzo2kpUaCjRngFLQb2RGrjP62lAMWDoc4ZJwKUpgRJDp1HON

