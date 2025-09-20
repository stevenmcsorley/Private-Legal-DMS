# 🏛️ Private Legal Document Management System

> **Enterprise-grade, self-hosted legal DMS with WORM compliance, matter-centric workflows, and zero-trust security architecture**

A comprehensive legal document management system built for law firms requiring on-premise security, regulatory compliance, and sophisticated access controls. Features military-grade security, document security classifications (confidential/privileged/work product), advanced clearance-based access control, full audit trails, and enterprise-grade multi-firm management capabilities.

![Login Screen](./login-screen.png)

---

## 🌟 Key Features

### 🔐 **Security & Compliance First**
- **WORM-Capable Storage** — Immutable document retention with MinIO Object Lock
- **Zero-Trust Architecture** — mTLS between services, OPA-based authorization
- **ISO 27001/9001 Ready** — Complete audit trails, evidence collection, quarterly security scans
- **Multi-Factor Authentication** — Keycloak OIDC with WebAuthn/TOTP support
- **End-to-End Encryption** — TLS termination, encrypted storage, secure sessions

### 📁 **Advanced Document Management**
- **Intelligent Processing** — Apache Tika extraction + Tesseract OCR with smart PDF conversion
- **Background Processing** — Non-blocking document pipeline with virus scanning, text extraction, and OCR
- **Smart OCR Conversion** — Automatic conversion of text-rich images to searchable PDFs
- **Enhanced Image Viewer** — Professional image viewer with zoom, pan, rotate, and full-screen controls
- **Version Control** — Complete document history with SHA-256 integrity
- **Smart Search** — OpenSearch with OCR text indexing and faceted filtering
- **Legal Holds** — Automated deletion prevention with compliance reporting
- **Watermarked Previews** — Role-based document access with enhanced PDF.js viewer
- **Document Security Classifications** — Confidential, privileged, and work product tagging with filtering ✅ **NEW**
- **Advanced Upload Controls** — Security classification during upload with metadata validation ✅ **NEW**

### 👥 **Collaboration & Access Control**
- **Advanced User Management** — Complete user administration with security clearance system ✅ **NEW**
- **Security Clearance System** — 10-level clearance system with role-based validation ✅ **NEW**
- **Role-Based Access Control** — 7-tier permission system with intelligent clearance management
- **Matter Security Classifications** — 5-tier document security classes with granular access control
- **Clearance-Based Document Access** — Automatic access control: user clearance ≥ matter security class ✅ **NEW**
- **Bulk Clearance Operations** — Administrative tools for managing user clearances with audit trails ✅ **NEW**
- **Super Admin System Control** — Full system administration without document access (legal/ethical compliance) ✅ **NEW**
- **Intelligent Team Management** — Smart user filtering to prevent client/team member confusion ✅ **NEW**
- **Client Portal** — Secure client access to assigned matters and documents
- **Cross-Firm Sharing** — Time-boxed collaboration with external partners
- **Firm Isolation** — Complete data segregation with OPA policy enforcement
- **Matter-Centric Workflows** — Organized by cases with team assignments

### 📊 **Enterprise Observability**
- **Complete Audit Trails** — Every action logged with forensic detail
- **Clearance Change Tracking** — Full audit trail of security clearance modifications ✅ **NEW**
- **Real-Time Monitoring** — Prometheus + Grafana dashboards
- **Automated Security Scanning** — OWASP ZAP, Trivy, dependency audits
- **Backup & Recovery** — Automated snapshots with restore procedures

---

## 🖼️ Application Screenshots

### Legal Matter Management
![Matters Management](./matters.png)
*Comprehensive matter management with status tracking, security classifications, and team assignments*

### Client Relationship Management  
![Client Management](./clients.png)
*Client portal integration with matter associations and communication tracking*

### Advanced Document Viewer
![Document Viewer](./document_viewer.png)
*Professional document viewer with enhanced image controls (zoom, pan, rotate), PDF navigation, and role-based watermarking*

### Security & Audit Logs
![Audit Logs](./auditlogs.png)
*Comprehensive audit trail with advanced filtering, export capabilities, and compliance reporting*

---

## 🏗️ Architecture & Technology Stack

### **Frontend** — Modern React Application
```typescript
- React 18 + TypeScript — Component-based UI architecture
- Vite — Lightning-fast development and builds  
- Tailwind CSS + shadcn/ui — Professional design system
- TanStack Query — Intelligent server state management
- React Hook Form + Zod — Type-safe form validation
- PDF.js — Client-side document rendering
```

### **Backend** — Scalable Node.js API
```typescript
- NestJS — Enterprise application framework
- TypeORM — Type-safe database operations
- PostgreSQL — ACID-compliant primary database
- Keycloak — Identity & access management
- Open Policy Agent — Centralized authorization engine
- MinIO — S3-compatible object storage with WORM
```

### **Processing Pipeline** — Document Intelligence
```bash
- Apache Tika — Multi-format text extraction
- Tesseract OCR — Smart OCR with automatic PDF conversion
- ClamAV — Real-time virus scanning with TCP protocol
- OpenSearch — Advanced full-text search with OCR text indexing
- Redis + Bull — Background job processing with retry logic
- MinIO Integration — WORM-compliant object storage pipeline
```

### **Security & Monitoring** — Defense in Depth
```yaml
- Traefik — TLS termination and routing
- Vault — Secrets management and KMS
- Prometheus — Metrics collection and alerting  
- Grafana — Observability dashboards
- Loki — Centralized log aggregation
- OWASP ZAP — Automated security testing
```

---

## 🛡️ Security & Compliance

### **Regulatory Compliance**
- **ISO 27001** — Information security management
- **ISO 9001** — Quality management systems  
- **GDPR/CCPA** — Data privacy and protection
- **Legal Hold Compliance** — Automated litigation hold management
- **Retention Policies** — Configurable document lifecycle management

### **Security Testing & Auditing**
```bash
# Automated Security Pipeline
├── OWASP ZAP Baseline Scans
├── Trivy Container Vulnerability Scanning  
├── NPM/PIP Dependency Auditing
├── OPA Policy Unit Testing
└── Penetration Testing Playbooks
```

### **Evidence Collection**
- **Continuous Security Monitoring** — Automated evidence collection for audits
- **Quarterly Penetration Testing** — Documented security assessments
- **Audit Trail Exports** — Complete activity logs in multiple formats
- **Compliance Reporting** — Ready-made reports for regulatory requirements

---

## 🚀 Quick Start

### **Prerequisites**
- Docker & Docker Compose
- 8GB+ RAM recommended
- 50GB+ storage for document processing

### **One-Command Deployment**
```bash
# Clone and start the entire stack
git clone <repository>
cd private-legal-dms
make up

# Set up database (interactive script)
./scripts/setup-database.sh

# OR quick setup with current data
docker compose exec -T app-db psql -U app -d app < scripts/sql/03_current_full_dump.sql

# Access the application
open http://localhost
```

### **Default Access**
- **Application**: http://localhost
- **Admin Portal**: admin/admin via Keycloak
- **Default Firm**: Demo Law Firm (admin@demolawfirm.com)
- **MinIO Console**: http://localhost:9001 (minio/minio123)
- **Monitoring**: http://localhost:3001 (Grafana - admin/admin)

---

## 🏢 Enterprise Architecture

```mermaid
graph TB
    subgraph "Frontend"
        UI[React SPA<br/>TypeScript + Tailwind]
    end
    
    subgraph "API Gateway"
        GW[Traefik<br/>TLS + Routing]
    end
    
    subgraph "Application Services"
        API[NestJS API<br/>BFF Pattern]
        AUTH[Keycloak<br/>OIDC + MFA]
        OPA[Open Policy Agent<br/>Authorization]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL<br/>ACID Compliance)]
        SEARCH[(OpenSearch<br/>Full-text Search)]
        STORAGE[(MinIO<br/>WORM Storage)]
    end
    
    subgraph "Processing Pipeline"
        QUEUE[Redis + Bull<br/>Background Jobs]
        TIKA[Apache Tika<br/>Text Extraction]
        OCR[Tesseract OCR<br/>Smart PDF Conversion]
        AV[ClamAV<br/>Real-time Scanning]
    end
    
    subgraph "Observability"
        PROM[Prometheus<br/>Metrics]
        GRAF[Grafana<br/>Dashboards]
        LOKI[Loki<br/>Log Aggregation]
    end
    
    UI --> GW
    GW --> API
    API --> AUTH
    API --> OPA
    API --> DB
    API --> SEARCH
    API --> STORAGE
    API --> QUEUE
    QUEUE --> TIKA
    QUEUE --> OCR
    QUEUE --> AV
    API --> PROM
    PROM --> GRAF
    API --> LOKI
```

---

## 🔧 Development Environment

### **Project Structure**
```
├── services/
│   ├── app/          # NestJS Backend API
│   ├── frontend/     # React TypeScript SPA  
│   └── worker/       # Background Processing
├── infra/
│   ├── keycloak/     # Identity Configuration
│   ├── opa/          # Authorization Policies
│   ├── prometheus/   # Monitoring Setup
│   └── grafana/      # Dashboard Configs
├── docs/
│   ├── security/     # Security Documentation
│   └── api/          # API Documentation
└── scripts/          # Automation & Utilities
```

### **Development Commands**
```bash
# Start all services
make up

# Set up database (interactive setup)
./scripts/setup-database.sh

# View application logs  
make logs

# Export current database schema
make schema-export

# Seed development data
make seed

# Stop all services
make down

# Run security scans
make security-scan
```

### **Service URLs (Development)**
| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost | Main application interface |
| **API** | http://localhost/api | Backend REST API |
| **Keycloak** | http://localhost:8081 | Authentication management |
| **MinIO Console** | http://localhost:9001 | Storage administration |
| **OpenSearch** | http://localhost:9200 | Search engine interface |
| **Grafana** | http://localhost:3001 | Monitoring dashboards |
| **Prometheus** | http://localhost:9090 | Metrics collection |

---

## 🎯 Role-Based Access Control

### **User Hierarchy & Roles**
| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | System administrator | Complete system access across all firms |
| **Firm Admin** | Firm-level management | Full firm access, user management, settings |
| **Legal Manager** | Team supervision | Matter oversight, team management |
| **Legal Professional** | Attorney/lawyer | Matter and document management |
| **Client User** | External client access | Assigned matters and documents only |
| **External Partner** | Cross-firm collaboration | Time-limited shared matter access |
| **Support Staff** | Administrative support | Document upload, limited operations |

### **Comprehensive Permission Matrix**
| Feature | Super Admin | Firm Admin | Legal Manager | Legal Professional | Client User | Support Staff | External Partner |
|---------|-------------|------------|---------------|-------------------|-------------|---------------|------------------|
| **Dashboard** | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Limited | ❌ No | ❌ No |
| **Client Management** | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Matter Management** | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ✅ View Only | ❌ No | ❌ No |
| **Document Read** | ❌ **No Access (Legal/Ethical)** | ✅ Yes | ✅ Yes | ✅ **Clearance-based (Smart Access Control)** | ✅ Assigned Only | ❌ No | ✅ Shared Only |
| **Document Upload** | ❌ **No Access (Legal/Ethical)** | ✅ **Security Classifications** | ✅ **Security Classifications** | ✅ **Security Classifications** | ✅ Inbox Only | ✅ Yes | ❌ No |
| **Document Delete** | ❌ **No Access (Legal/Ethical)** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Advanced Search** | ❌ **No Document Search** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Cross-Firm Sharing** | ✅ Full | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ❌ No |
| **Admin Panel** | ✅ Full | ✅ **Firm + User Clearance Management** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **System Administration** | ✅ Yes | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |

### **Security Classifications & Clearance Levels**

#### **Matter Security Classes** (1-5 scale)
- **Class 1**: Public legal documents (default)
- **Class 2**: Internal confidential matters  
- **Class 3**: Sensitive client information
- **Class 4**: High-value transactions, IP matters
- **Class 5**: Highly classified litigation, executive matters

#### **User Clearance Levels** (1-10 scale) ✅ **FULLY IMPLEMENTED**
- **Level 1-2**: Public, Internal (Client Users: default L2)
- **Level 3-4**: Confidential, Restricted (Support Staff: default L3, Paralegals: default L4)
- **Level 5-6**: Secret, Top Secret (Legal Professionals: default L5)
- **Level 7-8**: Compartmented, Special Access (Legal Managers: default L7)
- **Level 9-10**: Critical, Ultra Classified (Firm Admins: default L8, Super Admins: default L10)

#### **Document Access Rules**
```typescript
// Access granted only if: user.clearance_level >= matter.security_class
{
  "user": {"clearance_level": 8, "roles": ["legal_professional"]},
  "matter": {"security_class": 5},
  "access": "✅ GRANTED" // 8 >= 5
}

{
  "user": {"clearance_level": 3, "roles": ["support_staff"]}, 
  "matter": {"security_class": 5},
  "access": "❌ DENIED" // 3 < 5
}
```

### **Document Security Classifications** ✅ **NEW**

#### **Legal Document Protection Levels**
- **Confidential**: Sensitive client information requiring restricted access
- **Privileged**: Attorney-client privileged communications and legal advice
- **Work Product**: Attorney work product protected under discovery rules

#### **Security Classification Features**
```typescript
// Upload with security classifications
{
  "document": "merger_agreement_draft.pdf",
  "classifications": {
    "confidential": true,
    "privileged": true,
    "work_product": false
  },
  "access": "Automatically filtered based on user permissions"
}
```

#### **Smart Filtering & Search**
- **Upload Controls**: Set security classifications during document upload
- **Visual Indicators**: Security badges displayed on document lists
- **Advanced Filtering**: Filter documents by confidential, privileged, or work product status
- **Search Integration**: Security-aware search respects classification levels

### **Firm Isolation & Access Boundaries**
- **Default**: Users can only access resources within their firm
- **Super Admins**: System administration only - **NO document access** for legal/ethical compliance
- **Cross-Firm Sharing**: Explicit matter sharing with time-limited access
- **Client Portal**: Clients see only their assigned matters and documents
- **External Partners**: Access limited to specifically shared matters only
- **Document Isolation**: Super admins cannot view, upload, download, or search any documents

---

## 🔒 Security Implementation

### **Authentication & Authorization**
```typescript
// Multi-layered security approach
const securityStack = {
  authentication: "Keycloak OIDC + MFA",
  authorization: "Open Policy Agent (Rego)",
  sessionManagement: "HTTP-only cookies (BFF pattern)",
  transport: "TLS 1.3 + mTLS between services",
  storage: "AES-256 encryption at rest"
};
```

### **Automated Security Testing**
```yaml
# .github/workflows/security-scan.yml
name: Security Audit Pipeline
triggers: [pull_request, push, schedule]
scans:
  - OWASP ZAP Baseline
  - Trivy Container Scanning  
  - Dependency Vulnerability Auditing
  - OPA Policy Unit Tests
artifacts: 
  - Security reports (HTML/JSON)
  - Evidence collection for audits
```

### **Compliance & Auditing**
- **Immutable Audit Logs** — PostgreSQL append-only tables
- **Legal Hold Management** — Automated deletion prevention
- **Document Integrity** — SHA-256 checksums with verification
- **Access Monitoring** — Real-time permission tracking
- **Retention Policies** — Configurable lifecycle management

---

## 📊 Monitoring & Observability

### **Real-Time Dashboards**
- **System Health** — Service uptime, resource utilization
- **Security Metrics** — Failed logins, permission denials, virus scan results
- **Document Processing** — Upload throughput, OCR queue status, PDF conversion metrics
- **Search Analytics** — OCR text indexing performance, search query patterns
- **User Activity** — Access patterns, feature usage, document viewer analytics

### **Alerting & Notifications**
- **Security Incidents** — Automated threat detection
- **System Performance** — Resource threshold monitoring  
- **Compliance Events** — Legal hold triggers, retention alerts
- **Operational Issues** — Service failures, backup status

---

## 🏆 Why This Solution?

### **For Law Firms**
- **Complete Security** — Military-grade protection with real-time virus scanning
- **Advanced User Management** — Comprehensive user administration with security clearance system ✅ **NEW**
- **Smart Access Control** — Role-based clearance levels with automatic document access enforcement ✅ **NEW**
- **Document Security Classifications** — Confidential, privileged, and work product protection with smart filtering ✅ **NEW**
- **Super Admin Capabilities** — Cross-firm visibility and management for enterprise deployments ✅ **NEW**
- **Intelligent Document Processing** — Smart OCR with automatic PDF conversion for scanned documents
- **Regulatory Compliance** — Built-in audit trails, clearance tracking, and retention management
- **Cost Effective** — Self-hosted with no per-user licensing fees
- **Professional UI** — Modern interface with enhanced document viewer and legal workflows

### **For Developers**  
- **Modern Tech Stack** — TypeScript, React, NestJS, PostgreSQL
- **Microservices Architecture** — Scalable, maintainable service design
- **Security Best Practices** — Zero-trust, defense-in-depth implementation
- **Enterprise Patterns** — BFF, CQRS, Event Sourcing where appropriate

### **For DevOps/Infrastructure**
- **Container-First** — Docker Compose to Kubernetes ready
- **Observability Built-In** — Prometheus, Grafana, Loki integration
- **Automated Testing** — Security scans, compliance checks
- **Backup & Recovery** — Documented procedures with restore drills

---

## 📚 Documentation

- **[Product Requirements Document](./PRD.md)** — Complete system specification
- **[RBAC Specification](./RBAC_SPECIFICATION.md)** — Detailed access control matrix
- **[Security CI/CD Guide](./docs/Security%20CI/SECURITY-CI-GUIDE.md)** — Automated security testing
- **[Security Testing Procedures](./docs/Security%20CI/SECURITY-TESTING.md)** — Manual security validation
- **[API Documentation](./docs/api/)** — Complete endpoint reference

---

## 📄 License

**Private/Proprietary** — Enterprise legal document management system

---

*Built with security, compliance, and scalability at its core. Perfect for law firms requiring enterprise-grade document management with complete control over their data and infrastructure.*