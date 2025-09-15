# Private Legal DMS

A private, on-premise legal document management system with secure storage, matter-centric workflows, client access, and controlled cross-firm collaboration.

## Features

- 🔐 **Security & Compliance**: WORM-capable storage, strong authentication, fine-grained authorization, full audit trails
- 📁 **Document Management**: Versioning, OCR, full-text search, legal holds, retention policies
- 👥 **Collaboration**: Client portal, cross-firm sharing, role-based access control
- 🏢 **Multi-tenant**: Firm isolation with controlled sharing
- 📊 **Observability**: Complete audit trails, metrics, and monitoring

## Role-Based Access Control (RBAC)

The system implements comprehensive role-based access control with the following roles:

### User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | System-wide administrator | **Full access to everything** |
| `firm_admin` | Firm administrator | Manage users, teams, and firm settings |
| `legal_manager` | Legal team manager | Supervise teams, manage matters |
| `legal_professional` | Lawyer/attorney | Create/edit matters, upload documents |
| `client_user` | Client portal user | View assigned matters and documents only |
| `external_partner` | External firm partner | Time-boxed access to shared matters |
| `support_staff` | Support staff | Limited upload/edit access |

### Access Matrix

| Feature | super_admin | firm_admin | legal_manager | legal_professional | client_user |
|---------|-------------|------------|---------------|-------------------|-------------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Matters Management** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Client Management** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Document Management** | ✅ | ✅ | ✅ | ✅ | ✅ (limited) |
| **Search** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Admin Panel** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Client Portal** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Cross-Firm Sharing** | ✅ | ✅ | ✅ | ✅ | ❌ |

### Frontend Components

The system provides reusable React components for role-based UI control:

```jsx
// Generic role guard
<RoleGuard roles={['super_admin', 'firm_admin']}>
  <AdminContent />
</RoleGuard>

// Convenience components
<AdminOnly>
  <AdminPanel />
</AdminOnly>

<LegalStaffOnly>
  <MatterManagement />
</LegalStaffOnly>

<ClientOnly>
  <ClientPortal />
</ClientOnly>

// Permission-based access
<RequirePermission permission="user_management">
  <UserSettings />
</RequirePermission>
```

### Implementation Details

- **Authentication**: Keycloak OIDC with JWT tokens
- **Role Storage**: Simple string arrays in `user.roles` field
- **Frontend Guards**: React components with role-based conditional rendering
- **Route Protection**: Page-level access control with fallback messages
- **API Security**: Backend decorators and guards for endpoint protection
- **Client Isolation**: Documents filtered by client accessibility and matter assignment

For detailed RBAC specifications, see [RBAC_SPECIFICATION.md](./RBAC_SPECIFICATION.md).

## Quick Start

1. **Prerequisites**: Docker and Docker Compose
2. **Start the stack**:
   ```bash
   make up
   ```
3. **Access the application**: http://localhost
4. **Default admin**: admin/admin via Keycloak at http://localhost:8081

## Architecture

- **Frontend**: React + TypeScript (Vite)
- **Backend**: NestJS (Node.js)
- **Auth**: Keycloak (OIDC + MFA)
- **Authorization**: Open Policy Agent (OPA)
- **Database**: PostgreSQL
- **Storage**: MinIO (S3-compatible with Object Lock)
- **Search**: OpenSearch
- **Processing**: Apache Tika + Tesseract OCR
- **Monitoring**: Prometheus + Grafana + Loki

## Development

```bash
# Start all services
make up

# View logs
make logs

# Seed development data
make seed

# Run database migrations
make migrate

# Stop all services
make down
```

## Services URLs (Development)

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost | Main application |
| API | http://localhost/api | Backend API |
| Keycloak | http://localhost:8081 | Authentication |
| MinIO Console | http://localhost:9001 | Storage admin |
| OpenSearch | http://localhost:9200 | Search engine |
| Grafana | http://localhost:3001 | Monitoring dashboards |
| Prometheus | http://localhost:9090 | Metrics |
| Mailpit | http://localhost:8025 | Email testing |

## Project Structure

```
├── services/
│   ├── app/          # NestJS BFF API
│   ├── frontend/     # React TypeScript SPA
│   └── worker/       # Background job processing
├── infra/
│   ├── keycloak/     # Realm configuration
│   ├── opa/          # Authorization policies
│   ├── prometheus/   # Metrics configuration
│   ├── grafana/      # Dashboard configs
│   └── loki/         # Log aggregation
├── scripts/          # Database migrations, seeds
└── docs/            # Additional documentation
```

## License

Private/Proprietary