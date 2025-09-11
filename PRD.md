# Product Requirements Document — Private Legal DMS

## 1. Vision & Objectives

### Vision
A private, on-prem/self-hosted legal DMS that securely stores documents (PDFs, Office, images), supports matter-centric workflows, enables client access, and allows controlled cross-firm collaboration—while providing tamper-evident audits, legal holds, retention controls, and fast search.

### Primary Objectives

- **Security & Compliance**: WORM-capable storage, strong authentication, fine-grained authorization, full audit trails.
- **Productivity**: Fast upload, OCR + search; clear matter organization; simple client sharing & collaboration.
- **Operability**: Everything runs in Docker; one-command local setup; observable; easy backup & restore.
- **Extensibility**: Clean APIs, modular workers, pluggable OCR/PII/preview services.

### Non-Goals (for MVP)

- Native e-sign (we'll integrate external tools or add later).
- Complex DLP with inline redaction (phase 2+).
- Dedicated mobile apps (responsive web only initially).

## 2. Users & Roles

### User Types

- **Super Admin (System)**: Manages global settings, firms, quotas, keys, cross-firm federation.
- **Firm Admin**: Manages their firm's users/teams, default ACLs, retention classes, legal holds, exports.
- **Legal Professional**: Owns matters, invites clients, uploads/manages documents, sets sharing & holds.
- **Legal Manager (optional)**: Supervises teams; can manage matters across a team/department.
- **Support Staff (optional)**: Scoped uploader/editor; no policy changes.
- **Client User**: Read/download (if permitted) + upload to designated inbox; comment/respond.
- **External Partner**: Member of a different firm with time-boxed access granted per matter.

### Authorization Model

- **RBAC**: Role categories above.
- **ABAC**: Attributes on user (`firm_id`, `teams`, `clearance_level`, `is_partner`) and resource (`matter_id`, `client_id`, `firm_id`, `security_class`, `legal_hold`, `retention_class`).
- **OPA/Rego** enforces policy centrally; app gates UI accordingly but backend is the source of truth.

## 3. Functional Requirements

### 3.1 Authentication & Sessions

- OIDC via Keycloak (MFA/WebAuthn support).
- BFF session pattern (HTTP-only cookies) to keep tokens out of browser.
- Bruteforce protection, password/OTP policies, device/session lifetime controls.

### 3.2 Firm & User Admin

- CRUD for Firms, Teams, Users.
- Role assignment and attribute management (clearance, default scopes).
- Global settings (Super Admin) and firm-level defaults (Firm Admin).

### 3.3 Clients, Matters, Collaboration

- CRUD Clients and Matters (matter = case/project).
- Assign participants (internal teams, external partners, clients).
- Cross-firm sharing: grant partner firm viewer/editor with expiry.
- Client Portal: lists assigned matters/docs; secure upload inbox ("Client Uploads").

### 3.4 Documents & Versions

- Chunked/resumable upload; server-side checksum; dedupe by SHA-256.
- Store binaries in MinIO with versioning and Object Lock by retention class.
- Document metadata: title, tags, parties, jurisdiction, dates, custom JSON.
- Version history and immutable audit logs (view/download/update/delete attempts).

### 3.5 Search & OCR

- Pipeline: ClamAV → Tika → OCRmyPDF/Tesseract → index to OpenSearch.
- Search UI: full-text + facets (firm, matter, client, party, tag, type, date, jurisdiction, security class).
- Saved searches & quick filters.

### 3.6 Legal Holds & Retention

- Retention classes map to bucket object lock policies; legal hold blocks deletion.
- Disposition review UI; purge only when permitted (and not on hold).

### 3.7 Previews & Editing

- PDF.js for PDFs; native image view; OnlyOffice/Collabora iframe for Office docs.
- Watermarked viewer for read-only roles; configurable download policy.

### 3.8 Audits & Exports

- Append-only audits: who/what/when/where(IP), action details.
- Export matter bundle: ZIP of docs + manifest JSON (hashes, versions, ACL snapshot, audit subset).

## 4. Non-Functional Requirements

- **Self-hosted**: All services in Docker; compatible with single host & k8s later.
- **Performance**:
  - Upload: 50 concurrent files per user (chunked).
  - Search latency (P50): < 300ms for typical queries on 100k docs.
- **Scalability**: Horizontally scale app and workers; OpenSearch as separate cluster when needed.
- **Durability**: MinIO erasure coding; cross-site replication (optional in dev).
- **Security**: mTLS between services; Vault-managed secrets; CSP/headers; zero trust inbound.
- **Observability**: Prometheus + Grafana; Loki for logs.

## 5. Architecture Overview

### 5.1 High-Level Components

- **Gateway**: Traefik/NGINX (TLS termination, routing, rate-limit).
- **Auth**: Keycloak (OIDC, MFA, WebAuthn); Keycloak-side Postgres.
- **App API (BFF)**: Node (NestJS/Express) or Python (FastAPI). BFF holds tokens, sets session cookies, enforces OPA.
- **Frontend**: React + TypeScript SPA (Vite), Tailwind + shadcn. Uses BFF endpoints (`/api/**`).
- **Policy Engine**: OPA sidecar (Rego policies; decision logs).
- **DB**: Postgres (control plane + metadata + audits).
- **Object Store**: MinIO (versioning, object lock).
- **Search**: OpenSearch.
- **Workers**: Tika/OCR/Indexing; ClamAV; PII tagging (optional).
- **Cache/Queue**: Redis (BullMQ/Celery); optional RabbitMQ/Kafka for scale.
- **Secrets/KMS**: Vault (wrap MinIO keys; store DB creds; app secrets).
- **Previews**: OnlyOffice/Collabora.

### 5.2 Key Data Flows

- **Upload** → BFF preflight (OPA authorize) → ClamAV → MinIO (pre-signed/tus proxy) → Postgres metadata txn → enqueue extract → Tika/OCR → OpenSearch index → audit entries.
- **Download/View** → OPA authorize → stream from MinIO → audit.
- **Share** → write ACLs/matter_shares → OPA decisions include partner firm; optional email invite link.

## 6. Technology Choices

### Backend (BFF & Workers)

- **Language**: Node.js (NestJS) or Python (FastAPI).
- **Auth**: Keycloak OIDC; sessions via HTTP-only cookies.
- **Policy**: OPA (Rego) with decision logs → Loki.
- **DB**: Postgres + Prisma/TypeORM (Node) or SQLAlchemy (Python).
- **Search**: OpenSearch client.
- **Storage**: MinIO SDK (S3 compatible), Object Lock configured per retention class.
- **Queues**: BullMQ (Redis).
- **Security**: Helmet, strict CSP, mTLS between internal services, input validation (Zod/class-validator).

### Frontend

- React + TypeScript, Vite, React Router.
- **State**: TanStack Query (server), Zustand (UI).
- **Forms**: React Hook Form + Zod.
- **UI**: Tailwind + shadcn/ui; Lucide icons.
- **Uploads**: Uppy + tus.
- **Previews**: PDF.js, SheetJS; OnlyOffice iframe for Office docs.
- **Tests**: Vitest + RTL; Playwright E2E.

## 7. Data Model (Postgres)

```sql
-- Core entities
firms(id, name, created_at)
users(id, firm_id, email, display_name, roles[], attributes jsonb)
teams(id, firm_id, name)
team_members(team_id, user_id)
clients(id, firm_id, name, external_ref, created_at)
matters(id, firm_id, client_id, title, status, security_class, created_by, created_at)

-- Collaboration
matter_shares(matter_id, shared_with_firm, role, expires_at)

-- Documents
documents(id, matter_id, firm_id, client_id, object_key, content_sha256, size_bytes, mime_type, version, retention_class, legal_hold, created_by, created_at, is_deleted)
document_meta(document_id, title, tags jsonb, parties text[], jurisdiction, effective_date, expiry_date, extra jsonb)

-- Authorization & Auditing
acls(resource_type, resource_id, principal_type, principal_id, role, expires_at)
audits(id, firm_id, user_id, action, resource_type, resource_id, ts, ip, user_agent, details jsonb)
```

### Key Indexes

- `documents(matter_id)`
- `documents(content_sha256)`
- `document_meta using gin(tags)`
- `audits(firm_id, resource_type, resource_id, ts desc)`

## 8. API Surface (Illustrative)

### Auth/Session
- `GET /auth/login` → redirect OIDC
- `GET /auth/callback` → set HTTP-only session cookie
- `POST /auth/logout`

### Firms/Users
- `GET/POST /firms` (super_admin)
- `GET/POST /users` (firm_admin)
- `POST /users/:id/roles` (firm_admin)

### Clients/Matters
- `POST /clients` (legal_professional/firm_admin)
- `POST /matters` (legal_professional/firm_admin)
- `POST /matters/:id/share` (owner/firm_admin) `{ partner_firm_id, role, expires_at }`

### Documents
- `POST /uploads/prefetch` → presigned/tus endpoint + virus scan token
- `POST /documents` → finalize metadata → index job
- `GET /documents/:id` (stream or signed URL)
- `POST /documents/:id/hold` / `/hold/release`
- `DELETE /documents/:id` (blocked if hold)

### Search & Audit
- `GET /search?q=...&filters=...`
- `GET /audits?resource_id=...`

All endpoints: OPA authorization per request + audit log on success/failure (including deny reasons).

## 9. Frontend Structure (SPA)

```
src/
  components/
    forms/
    ui/
    layout/
    upload/          # Uploader, Dropzone
    docs/            # PdfViewer, OfficeFrame
    search/          # FilterBar, ResultList
    acl/
    auth/            # RoleGate, SessionProvider
  services/
    api/             # FirmService, UserService, MatterService, DocService, SearchService
    adapters/        # API <-> domain mapping (camel/snake)
  types/
    api.types.ts
    ui.types.ts
    domain.types.ts
  hooks/
  utils/
  constants/
```

### Component Conventions
- Named exports, arrow functions, separate `*.types.ts`
- Parameter defaults, specific event types, className merging
- Generics syntax, forwardRef where needed
- Test-ids convention, Storybook for shared components

### Key Screens
Dashboard, Clients, Matters (tabs: Overview, Documents, People, Audit), Search, Admin (Users/Teams/Retention/Holds/Shares), Client Portal.

## 10. Security Model

- **AuthN**: Keycloak OIDC, enforced MFA for admins.
- **AuthZ**: OPA policies; ABAC attributes; decision logs shipped to Loki.
- **Storage**: MinIO with per-firm buckets or firm-prefixed keys; versioning + Object Lock; SSE-KMS (Vault).
- **Network**: All internal calls over mTLS; strict firewalling; Traefik as only public ingress.
- **Headers/CSP**: No inline scripts; frame-ancestors restricted to your domain + OnlyOffice host.
- **PII Tagging (optional)**: Presidio worker → elevates `security_class`; affects OPA decisions.

### Backups
- Postgres WAL + nightly dumps.
- MinIO replication or periodic snapshots.
- OpenSearch snapshots to MinIO bucket.
- Restore drills documented.

## 11. Development Environment

### Docker Compose Structure

```yaml
version: "3.9"
services:
  traefik:          # Gateway & routing
  keycloak:         # Authentication
  keycloak-db:      # Keycloak database
  app:              # BFF API server
  app-db:           # Main application database
  frontend:         # React SPA
  minio:            # Object storage
  opensearch:       # Search engine
  tika:             # Document text extraction
  ocr:              # OCR processing
  clamav:           # Virus scanning
  worker:           # Background job processing
  redis:            # Queue & cache
  opa:              # Policy engine
  onlyoffice:       # Document preview
  grafana:          # Observability dashboards
  loki:             # Log aggregation
```

### Environment Variables (Dev)
```env
SESSION_SECRET=dev_session_secret
DATABASE_URL=postgres://app:app@app-db:5432/app
OPENSEARCH_URL=http://opensearch:9200
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
KEYCLOAK_ISSUER=http://keycloak:8080/realms/dms
OPA_URL=http://opa:8181/v1/data/dms/authz
```

### Makefile Targets
```makefile
up:        ## start all services
down:      ## stop all services
logs:      ## tail app logs
seed:      ## seed dev data
migrate:   ## run DB migrations
```

## 12. Testing Strategy

### Unit & Component (Vitest + RTL)
- Components under `components/**` (shared) have stories, tests, a11y checks.
- Services and adapters tested with API fixtures.

### Integration/E2E (Playwright)
- Flows: login, upload, search, share, legal hold, permission denial, client portal upload + review.

### Policy Testing
- OPA Rego unit tests (`rego test` files) for major authorization scenarios.

### Security Tests
- Zod/class-validator schema tests; basic SSRF/path traversal checks (BFF).
- HTTP header assertions (CSP, HSTS off in dev, on in prod).

## 13. Observability & Auditing

- **Audit Trail**: Every sensitive action; exportable CSV/JSON.
- **Metrics**: Prometheus exporters (app, worker, Postgres, MinIO, OpenSearch).
- **Logs**: Loki stack; include OPA decision logs & audit writes.
- **Dashboards**: Upload throughput, OCR queue lag, search latency, error rates.

## 14. Delivery Plan (Phases)

### Phase 0 — Bootstrap (1–2 weeks)
- Compose stack skeleton running on localhost
- Keycloak realm import (roles, groups, basic users)
- DB migrations, seed script (sample firm, users, matter, docs)

### Phase 1 — Core DMS (3–4 weeks)
- Auth (BFF sessions), OPA middleware, audit logger
- Clients & Matters CRUD, ACL basics
- Upload → MinIO → Postgres metadata → extract job → index → searchable
- Document viewer (PDF.js), list & filters, saved searches
- Legal hold flag + deletion rules
- Client Portal (read + upload inbox)
- Minimal admin screens (users, roles, retention classes)

**Exit Criteria:**
- Upload/search 5–10k docs locally without timeouts
- RBAC/ABAC policies pass unit tests
- Audit entries for all key actions

### Phase 2 — Collaboration & Compliance (3–4 weeks)
- Cross-firm sharing with expiry; partner role variants
- Watermarked viewer; download policy per role
- Retention policies → bucket object lock mapping; disposition UI
- Matter export bundles (ZIP + manifest)
- Observability dashboards; OpenSearch snapshots

### Phase 3 — Hardening & Nice-to-Haves (2–3 weeks)
- PII tagging worker (optional); elevate `security_class` automatically
- OnlyOffice/Collabora integration with allowlist & JWT (prod mode)
- Advanced search (synonyms, proximity); user saved searches & sharing
- Admin UX polish; policy editor previews
- Backup/restore scripts + drill docs

## 15. Acceptance Criteria (MVP)

- ✅ Users in distinct roles experience only allowed actions (OPA denies tested)
- ✅ Documents uploaded are virus-scanned, stored in MinIO with versioning, and text-searchable after OCR
- ✅ Client Portal allows secure uploads into review inbox; clients see only assigned matters/docs
- ✅ Legal hold blocks deletion; attempt is audited
- ✅ Full audit trail visible and exportable
- ✅ Entire system runs with `docker compose up -d` on localhost

## 16. Risks & Mitigations

- **Complex authz rules** → centralize in OPA; keep unit tests; log decisions
- **OCR resource usage** → queue + concurrency caps; progressive indexing; show status in UI
- **Object Lock misconfig** → preflight checks, policy templates, and admin UI warnings
- **Cross-firm federation** → start with invite-based sharing; add mTLS + org claims later

## FAQ — 100% Local Self-Hosted Solution

### Q: Do I need AWS, cloud services, or any third-party SaaS?

**A: Absolutely not.** This entire stack runs 100% locally on your machine(s) with Docker. No AWS, no hosted services, no external APIs required.

### What's Included (All Self-Hosted)

- **Identity & MFA**: Keycloak (WebAuthn/TOTP works offline)
- **Authorization**: OPA (Rego) sidecar
- **App API (BFF)**: Node (NestJS/Express) or Python (FastAPI) — your choice
- **Frontend**: React + TypeScript (Vite), Tailwind + shadcn/ui
- **Database**: PostgreSQL
- **Object Storage**: MinIO (versioning + Object Lock/WORM)
- **Search**: OpenSearch
- **Extraction/OCR**: Apache Tika + OCRmyPDF/Tesseract
- **Antivirus**: ClamAV (freshclam can be offline)
- **Jobs/Queues**: Redis + BullMQ/Celery workers
- **Docs Preview/Edit**: OnlyOffice or Collabora (both self-host)
- **Policy/Secrets**: OPA (required), Vault (optional)
- **Gateway/Ingress**: Traefik or NGINX
- **Observability**: Prometheus + Grafana + Loki (all self-host)
- **Mail (dev/test)**: Mailpit or MailHog (no external SMTP)

### Additional Local Services (Extended docker-compose.yml)

```yaml
  mailpit:
    image: axllent/mailpit:latest
    ports: ["8025:8025"]      # Web UI
    environment:
      MP_MAX_MESSAGES: 10000

  prometheus:
    image: prom/prometheus:v2.55.1
    command:
      - --config.file=/etc/prometheus/prometheus.yml
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    ports: ["9090:9090"]

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    ports: ["8082:8080"]
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro

  registry:
    image: registry:2
    ports: ["5000:5000"]
    volumes: [ "registry:/var/lib/registry" ]
```

### Offline/Air-Gapped Considerations

**For completely disconnected environments:**

1. **Container Images**
   - Pre-pull all images on a connected machine
   - Push to your local registry (`localhost:5000`)
   - Update docker-compose.yml to use `localhost:5000/<name>:<tag>`

2. **ClamAV Virus Definitions**
   - Online mode: `freshclam` fetches signatures automatically
   - Fully offline: Download `.cvd/.cld` packs once, copy to ClamAV volume (`/var/lib/clamav`), disable freshclam

3. **OnlyOffice/Collabora Fonts**
   - Bundle required fonts in the image or mount local fonts volume

4. **OCR Language Packs**
   - Tesseract language packs: bake into OCR image (`tesseract-ocr-eng`, `-deu`, etc.)

5. **Time Synchronization**
   - Ensure host time is correct for token expiries and SSO

### Where "Third-Party" is Optional

- **Vault**: Nice for prod secrets/KMS, but you can use Docker secrets/env in dev
- **Kafka/RabbitMQ**: Not required; Redis queues sufficient for MVP
- **External SMTP**: Not needed; use Mailpit/MailHog locally

### Default Localhost URLs

- **Frontend**: `http://localhost/`
- **API (behind Traefik)**: `http://localhost/api/*`
- **Keycloak**: `http://localhost:8081/` (dev admin: admin/admin)
- **MinIO Console**: `http://localhost:9001/`
- **OpenSearch**: `http://localhost:9200/`
- **Tika**: `http://localhost:9998/`
- **OPA**: `http://localhost:8181/`
- **Grafana**: `http://localhost:3001/`
- **Prometheus**: `http://localhost:9090/`
- **Loki**: `http://localhost:3100/`
- **Mailpit**: `http://localhost:8025/`
- **Traefik Dashboard (dev)**: `http://localhost:8080/`

### Security Without Cloud Dependencies

- **MFA/WebAuthn**: Keycloak supports platform authenticators (Touch ID/Windows Hello/YubiKey) without any cloud service
- **Object Lock/WORM**: MinIO does this locally; configure per retention class
- **OPA**: Runs in container; decisions never leave your system
- **Backups**: Use local volumes/snapshots; mirror MinIO buckets to another disk via `mc mirror` (still offline)

### Dev Workflow on Localhost

```bash
docker compose up -d --build
```

1. Visit Keycloak → create initial realm users/roles (or import realm JSON)
2. Run app DB migrations + seed script
3. Log in via the SPA → upload docs → see OCR/indexing status → search

### Q: What about compliance and legal requirements?

**A: Fully supported locally.**
- **WORM compliance**: MinIO Object Lock (same technology as AWS S3 Object Lock)
- **Audit trails**: PostgreSQL with append-only audit table
- **Legal holds**: Metadata flags prevent deletion, fully audited
- **Retention policies**: Configurable Object Lock duration per document class
- **Access controls**: OPA-based RBAC/ABAC with full decision logging

### Q: Can this scale beyond a single machine?

**A: Yes, designed for growth.**
- Start with single-host Docker Compose for development
- Scale to multi-host with Docker Swarm or Kubernetes
- Each component (app, workers, search, storage) can scale independently
- Database replication and MinIO distributed mode for high availability

### Q: How do I backup everything?

**A: Standard local backup practices.**
- **PostgreSQL**: WAL archiving + nightly dumps to local storage
- **MinIO**: Built-in replication or periodic snapshots to external drives
- **OpenSearch**: Snapshot repository pointing to MinIO bucket
- **Application**: All configuration in git-tracked files
- **Restore**: Documented step-by-step procedures with periodic drills

## Appendix — Example OPA Input Envelope

```json
{
  "user": {
    "id": "u-123",
    "firm_id": "f-1",
    "roles": ["legal_professional"],
    "attrs": { 
      "teams": ["litigation"], 
      "clearance": 3, 
      "is_partner": false 
    }
  },
  "action": "read",
  "resource": {
    "type": "document",
    "id": "d-999",
    "firm_id": "f-1",
    "matter_id": "m-22",
    "security_class": 2,
    "legal_hold": false,
    "shared_with": []
  }
}
```