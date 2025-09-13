# Security Testing & Evidence Collection

This document describes how we run security scans and collect audit-ready evidence for ISO 27001/9001 and OWASP Top 10 coverage.

## CI/CD Scans

- **OWASP ZAP Baseline**: Dynamic scan of the frontend/API.
- **Trivy**: Container image CVE scan (HIGH/CRITICAL focus).
- **npm audit / pip-audit**: Dependency vulnerabilities in JS/Python projects.

Artifacts are uploaded per build under the `security-audit-artifacts` bundle.

## Local Reproduction

```bash
# ZAP baseline (Dockerized)
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost/ -r zap-report.html

# Trivy image scan
trivy image private-legal-dms-app:latest --severity HIGH,CRITICAL

# Dependency scans
npm audit --production
pip-audit -r requirements.txt
```

## Evidence Registry Layout

```
/audit/
  YYYY-MM/
    zap-report.html
    zap-stdout.txt
    trivy-report.txt
    npm-audit.txt
    pip-audit.txt
    screenshots/
    audit-logs.json
```

Store the `/audit` folder in the repo (or artifact bucket) for traceability.
