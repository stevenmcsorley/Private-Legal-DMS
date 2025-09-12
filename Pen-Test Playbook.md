# 🛡️ Pen-Test Playbook — Private Legal DMS

This document provides a step-by-step methodology for performing penetration tests against the Private Legal DMS to validate security posture and ensure compliance with **OWASP Top 10** guidelines.

---

## 🎯 Objectives

- Identify and remediate **OWASP Top 10** vulnerabilities before each audit.
- Produce consistent, versioned **evidence reports** (ZAP scans, Trivy outputs, etc.).
- Integrate basic scans into CI/CD for continuous security testing.

---

## 🧪 Test Scope

| Target | Included |
|-------|-----------|
| **Frontend SPA** | :white_check_mark: (all authenticated/unauthenticated pages) |
| **App API (BFF)** | :white_check_mark: (`/api/**` endpoints) |
| **Keycloak** | :white_check_mark: (login/logout flows, MFA enforcement) |
| **Object Storage (MinIO)** | :white_check_mark: (signed URL tests, unauthorized access attempts) |
| **Workers** | :white_check_mark: (upload/processing pipeline, ClamAV) |
| **Network** | :white_check_mark: (TLS/mTLS configuration, Traefik headers) |
| **Exclusions** | :x: Production data, destructive testing on live matters |

---

## 🛠 Tools & Setup

| Tool | Purpose |
|------|---------|
| **OWASP ZAP** | Automated DAST scanning |
| **Burp Suite Community** | Manual authentication / session tests |
| **Nikto** | Basic web server checks |
| **Nuclei** | Template-based vulnerability scanning |
| **curl + jq** | Header and API response inspection |
| **npm audit / pip-audit** | Dependency vulnerability checks |
| **Trivy** | Container image scanning |

> **Note:** Run tests in a staging or pre-production environment with representative data.

---

## 🔄 Test Workflow

### 1. Automated DAST Scan (OWASP ZAP)

```
zap-baseline.py -t http://localhost/ -r zap-report.html
```

- Include auth context: export session cookie from browser or use ZAP context file.
- Review findings in `zap-report.html` → store in `/audit/artifacts/yyyy-mm/`.

### 2. Authentication & Session Testing (Manual/Burp)

- Test login with invalid credentials, weak passwords.
- Attempt session fixation: reuse old cookies after logout.
- Validate MFA enforcement for admin roles.

### 3. Injection & Input Validation

- Use ZAP active scan or sqlmap against API endpoints with parameters.
- Verify errors are sanitized (no stack traces).
- Check for command injection on file upload → attempt malicious filename.

### 4. XSS & CSRF

- Inject `<script>alert(1)</script>` in metadata fields → confirm blocked/escaped.
- Check presence of CSRF tokens in sensitive POST requests.
- Validate `Content-Security-Policy` header is set.

### 5. Access Control (Broken Access Control)

- Call API endpoints directly with invalid/expired token.
- Attempt cross-firm access by modifying `firm_id` or `matter_id` in request payloads.
- Confirm `403` or `OPA deny` in logs.

### 6. Security Headers

```
curl -I http://localhost | grep -E "Content-Security-Policy|Strict-Transport-Security|X-Frame-Options"
```

Expected headers:
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`

### 7. Dependency & Image Scan

```
npm audit --production > npm-audit.txt
pip-audit -r requirements.txt > pip-audit.txt
trivy image private-legal-dms-app:latest --severity HIGH,CRITICAL > trivy-report.txt
```

### 8. Log & Data Exposure

- Query Loki logs for `password`, `token`, `Authorization`, `secret`.
- Verify no sensitive data is logged.

### 9. Business Logic Flaws

- Attempt to:
  - Share a matter with unauthorized firm.
  - Delete a document under legal hold.
  - Bypass retention policy by direct S3/MinIO call.

---

## 📑 Evidence Collection

| Artifact | Location |
|---------|----------|
| ZAP Report | `/audit/artifacts/yyyy-mm/zap-report.html` |
| Nuclei Output | `/audit/artifacts/yyyy-mm/nuclei-output.txt` |
| Dependency Reports | `/audit/artifacts/yyyy-mm/npm-audit.txt`, `/audit/artifacts/yyyy-mm/pip-audit.txt` |
| Trivy Scan | `/audit/artifacts/yyyy-mm/trivy-report.txt` |
| Screenshots | `/audit/artifacts/yyyy-mm/screenshots/` (failed attempts, 403 pages) |
| Loki Log Export | `/audit/artifacts/yyyy-mm/audit-logs.json` |

---

## ✅ Pass/Fail Criteria

| Severity | Criteria |
|---------|----------|
| **Critical / High** | Must be remediated before go-live or audit sign-off |
| **Medium** | Document mitigation plan; track in Jira |
| **Low / Info** | Acceptable if documented; review in next audit |

---

## 🔁 Continuous Improvement

- Integrate ZAP baseline scan into CI/CD (GitHub Actions, GitLab CI).
- Schedule quarterly manual pen-tests & update this playbook.
- Maintain history of reports for trend analysis and evidence during ISO audits.

---

## Example Result (Audit Row)

| Control Area | Audit Question | Evidence | Compliant / Non-Compliant | Notes |
|-------------|----------------|----------|---------------------------|------|
| Security Controls | Pen-test for common vulnerabilities (OWASP Top 10) | ZAP report: 0 critical, 1 medium (CSP header fix applied). Trivy: no HIGH+ CVEs. | :white_check_mark: Compliant | Quarterly scan automated via CI; manual pen-test scheduled pre-audit. |
