# 🧠 Security Awareness & Developer Training — Private Legal DMS

This document provides a lightweight security training checklist for developers, ops, and legal users.

## 👩‍💻 Developer Guidelines

- Validate all input (use Zod/class-validator)
- Escape/encode output in templates
- Avoid inline scripts/styles — enforce CSP
- Use prepared statements for DB access
- Handle secrets via Vault or Docker secrets (never hardcode)
- Add tests for access control edge cases (negative tests)

## 🔐 Ops Guidelines

- Rotate keys and secrets every 90 days
- Apply security patches to containers monthly
- Monitor logs for repeated access denials
- Run `scripts/collect-evidence.sh` weekly in staging

## 🧑‍⚖️ Legal/User Awareness

- Always use MFA for login (Keycloak supports WebAuthn)
- Share matters only with authorized firms/clients
- Respect retention & legal hold flags — do not attempt deletion manually
- Report suspicious activity immediately

## 📅 Training Cadence

- New hires: run through this doc + demo in first week
- All staff: annual security refresher
- Developers: OWASP Top 10 workshop every 12 months
