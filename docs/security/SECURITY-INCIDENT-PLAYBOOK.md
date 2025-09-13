# 🚨 Security Incident Response Playbook — Private Legal DMS

This document defines how to handle security incidents in a structured, auditable way.

## 🎯 Goals

- Contain the incident quickly
- Minimize impact on confidentiality, integrity, availability
- Preserve forensic evidence
- Communicate transparently to stakeholders

## 🧩 Incident Classification

| Severity | Example |
|---------|---------|
| **Critical** | Data breach, unauthorized document access, ransomware |
| **High** | Privilege escalation exploit, major service outage |
| **Medium** | Repeated failed logins, minor misconfigurations |
| **Low** | Single user error, non-sensitive log exposure |

## 🛠 Response Steps

1. **Detection** — identify incident (alert, report, log anomaly)
2. **Containment** — isolate affected services, disable compromised accounts
3. **Eradication** — patch vulnerability, remove malicious files
4. **Recovery** — restore from backups, verify system integrity
5. **Communication** — notify stakeholders, legal, clients (as needed)
6. **Lessons Learned** — run post-mortem, create Jira tasks for prevention

## 📑 Evidence Collection

- Save logs from Loki (`audit-logs.json`)
- Hash & timestamp all forensic artifacts
- Store in `/audit/YYYY-MM/incidents/<incident-id>/`

## 📢 Notification Matrix

| Role | When to Notify |
|------|----------------|
| Security Lead | Immediate on Critical/High |
| Product Owner | When client-facing impact confirmed |
| Legal/Compliance | For any data breach |
| All Users | Post-incident summary if client data was involved |

## 📝 Post-Incident Report

Each incident should have a report including:

- Summary & timeline
- Root cause analysis
- Impact assessment (C/I/A)
- Corrective & preventive actions
- Sign-off by Security Lead

Store reports under `/audit/YYYY-MM/incidents/`.
