# ISO Audit Outline — Private Legal DMS

## 1. Audit Scope & Objectives

### Scope
- **System Boundary**: Entire Private Legal DMS stack (frontend, BFF, Keycloak, Postgres, MinIO, OpenSearch, OPA, workers, Traefik gateway).
- **Processes**: Authentication, authorization, document upload, retention/legal hold, audit logging, client portal, backups, and administrative actions.
- **Environment**: On-premise Docker Compose/K8s deployment, air-gapped or connected scenarios.
- **Data**: All documents, metadata, audit logs, user accounts, policies, configuration.

### Objectives
- Verify **confidentiality, integrity, availability** of legal documents.
- Confirm compliance with:
  - **ISO 27001** (Information Security Management)
  - **ISO 9001** (Quality Management)
  - **WORM/Retention compliance** (SEC 17a-4(f), GDPR, legal hold requirements)
- Ensure traceability of all actions (audit trail completeness).
- Validate that system meets **MVP acceptance criteria** and regulatory obligations.

---

## 2. Audit Criteria & References

- **ISO 27001:2022** — A.5–A.8 (Information Security Controls)
- **ISO 9001:2015** — Clauses 4–10 (Process-based QMS)
- **NIST SP 800-53 (optional crosswalk)** — AU (Audit), AC (Access Control), SC (System Communication)
- **Internal Policies** — RBAC/ABAC policy definitions (OPA Rego)
- **Legal/Regulatory** — GDPR Art. 5, Legal Hold requirements, WORM retention regulations

---

## 3. Audit Methodology

- **Document Review**: PRD, architecture diagrams, policies, SOPs, realm JSON, OPA policies.
- **Interviews**: System admins, developers, legal users, security officers.
- **Technical Testing**: Walk-through of upload/search/share/legal hold workflows.
- **Evidence Collection**: Screenshots, config exports, DB queries, audit trail extracts.
- **Sampling**: Select representative matters, documents, users, and audit logs.

---

## 4. Audit Checklist

### 4.1 Governance & ISMS

- [ ] Documented risk assessment & data classification mapping  
- [ ] Roles defined & OPA policies version-controlled  
- [ ] Change management process for DB migrations & realm imports  
- [ ] Training for legal staff on retention/legal hold & secure sharing  

### 4.2 Access Control (ISO 27001 A.5/A.8)

- [ ] Keycloak configuration: MFA, password policy, session lifetime  
- [ ] RBAC/ABAC decisions match documented policy (OPA test suite)  
- [ ] Unauthorized access attempts logged  
- [ ] Client portal users restricted to assigned matters  

### 4.3 Document Handling & WORM Compliance

- [ ] MinIO Object Lock applied; deletion blocked until expiry  
- [ ] Legal hold prevents deletion even after retention expiry  
- [ ] SHA-256 deduplication does not bypass retention controls  
- [ ] Matter export includes manifest with hashes & ACL snapshot  

### 4.4 Audit Trail & Logging

- [ ] All create/read/update/delete/share actions audited  
- [ ] Audits table append-only (no UPDATE/DELETE)  
- [ ] Export function produces verifiable CSV/JSON  
- [ ] OPA decision logs correlate with audit entries  

### 4.5 Security Controls

- [ ] CSP headers, mTLS, Vault secrets reviewed  
- [ ] Pen-test for OWASP Top 10 vulnerabilities  
- [ ] ClamAV enforced pre-upload; logs of quarantined files reviewed  

### 4.6 Business Continuity & Backup

- [ ] Backup process validated (Postgres WAL, MinIO mirror, OpenSearch snapshot)  
- [ ] Restore drill executed and file hashes verified  
- [ ] NTP/time sync confirmed  

### 4.7 Observability & Metrics

- [ ] Dashboards show throughput, latency, error rates  
- [ ] Alerts configured and escalation process documented  

### 4.8 Quality & Continuous Improvement

- [ ] Root cause analysis on failed uploads, search errors, policy denials  
- [ ] Process for OPA policy revisions and role updates  
- [ ] Test results stored & versioned for traceability  

---

## 5. Evidence Collection

- **Configuration**: Keycloak realm export, OPA policy bundle, docker-compose.yml
- **Database Extracts**: `documents`, `audits`, `acls` sample rows
- **Screenshots**: Client portal, legal hold warning, denied access
- **Logs**: OPA decision logs, ClamAV scan report
- **Backup Artefacts**: Postgres dump, MinIO snapshot, OpenSearch snapshot
- **Metrics**: Grafana dashboards showing uptime & latency

---

## 6. Reporting & Findings

- Classify findings as **Major**, **Minor**, or **Opportunity for Improvement**  
- Document **Corrective Actions** with owner & due date  
- Log **Residual Risk** for accepted gaps (e.g., optional PII tagging not enabled)

---

## 7. Follow-Up & Continuous Improvement

- Schedule quarterly internal audits (ISO 19011 cycle)  
- Automate sampling via API (audit queries, hash validation)  
- Feed findings into backlog for remediation & hardening

