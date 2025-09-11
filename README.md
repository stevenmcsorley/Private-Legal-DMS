# Private Legal DMS

A private, on-premise legal document management system with secure storage, matter-centric workflows, client access, and controlled cross-firm collaboration.

## Features

- 🔐 **Security & Compliance**: WORM-capable storage, strong authentication, fine-grained authorization, full audit trails
- 📁 **Document Management**: Versioning, OCR, full-text search, legal holds, retention policies
- 👥 **Collaboration**: Client portal, cross-firm sharing, role-based access control
- 🏢 **Multi-tenant**: Firm isolation with controlled sharing
- 📊 **Observability**: Complete audit trails, metrics, and monitoring

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