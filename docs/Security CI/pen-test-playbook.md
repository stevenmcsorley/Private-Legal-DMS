# Pen-Test Playbook — Private Legal DMS

This document provides a step-by-step methodology for performing penetration tests against the Private Legal DMS to validate security posture and ensure compliance with **OWASP Top 10** guidelines.

## Objectives

- Identify and remediate OWASP Top 10 vulnerabilities before each audit.
- Produce consistent, versioned evidence reports (ZAP scans, Trivy outputs, etc.).
- Integrate basic scans into CI/CD for continuous security testing.

## Test Scope

| Target | Included |
|-------|-----------|
| Frontend SPA | Yes |
| App API (BFF) | Yes (`/api/**`) |
| Keycloak | Yes (login/logout flows, MFA enforcement) |
| Object Storage (MinIO) | Yes (signed URL tests, unauthorized attempts) |
| Workers | Yes (upload/processing pipeline, ClamAV) |
| Network | Yes (TLS/mTLS config, Traefik headers) |
| Exclusions | No destructive testing on live data |

## Tools & Setup

- OWASP ZAP (DAST)
- Burp Suite Community (manual auth/session tests)
- Nikto (basic checks)
- Nuclei (template scans)
- curl + jq (header inspection)
- npm audit / pip-audit (deps)
- Trivy (container CVEs)

> Run tests in staging or pre-production with representative data.

## Test Workflow

1. **ZAP baseline**  
   ```bash
   zap-baseline.py -t http://localhost/ -r zap-report.html
   ```
2. **Auth & sessions (manual)** — invalid creds, session fixation, MFA verified.
3. **Injection** — SQLi (API params), command injection on upload filenames.
4. **XSS/CSRF** — input escape, CSRF token presence, CSP header set.
5. **Access control** — expired/invalid tokens, cross-firm access denied.
6. **Security headers**  
   ```bash
   curl -I http://localhost | grep -E "Content-Security-Policy|Strict-Transport-Security|X-Frame-Options"
   ```
7. **Dependency & image scans**  
   ```bash
   npm audit --production > npm-audit.txt
   pip-audit -r requirements.txt > pip-audit.txt
   trivy image private-legal-dms-app:latest --severity HIGH,CRITICAL > trivy-report.txt
   ```
8. **Logs & data exposure** — search for secrets in logs.
9. **Business logic** — illegal share, delete under hold, bypass retention via MinIO.

## Evidence

- ZAP: `zap-report.html`, `zap-stdout.txt`
- Trivy: `trivy-report.txt`
- Dependencies: `npm-audit.txt`, `pip-audit.txt`
- Logs: `audit-logs.json` (Loki export)
- Screenshots: `screenshots/`

## Pass/Fail

- **Fail:** Any High/Critical without compensating control or fix.
- **Pass:** No High/Critical; Medium has mitigation plan.

## Continuous Improvement

- Automate ZAP + Trivy in CI (see workflow).
- Quarterly manual pen-tests.
- Trend reports across audits.
