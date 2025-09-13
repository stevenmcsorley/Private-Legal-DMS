# 🔐 Security CI/CD Guide — Private Legal DMS

This document explains the security-related files, workflows, and scripts included in the repository, and how to use them to maintain **continuous security assurance** and **audit-ready evidence**.

---

## 📂 Files & Purpose

| File | Purpose |
|------|---------|
| `.github/workflows/security-scan.yml` | GitHub Actions workflow that runs OWASP ZAP baseline, Trivy container image scans, and dependency audits (`npm audit`, `pip-audit`). Produces artifacts for each PR or push. |
| `docs/security/SECURITY-TESTING.md` | Short guide on running security scans locally, collecting evidence, and maintaining the `/audit/` directory structure. |
| `docs/security/SOP-PEN-TEST.md` | Standard Operating Procedure (SOP) for quarterly pen-testing. Defines roles, cadence, steps, and acceptance criteria. |
| `docs/security/pen-test-playbook.md` | Full penetration testing playbook (manual + automated steps, tools, expected outputs, pass/fail criteria). |
| `.zap/rules.tsv` | Optional tuning file for OWASP ZAP baseline scan (to ignore or lower severity of specific rules). |
| `.zap/README.md` | Documentation for maintaining ZAP rules. |
| `scripts/collect-evidence.sh` | Helper script to collect reports (ZAP, Trivy, dependency scans) and save them under `/audit/YYYY-MM/` for versioned evidence. |

---

## 🚦 Workflow Overview

### Triggered Events

- **Pull Requests** — Runs full security scan before merge  
- **Push to `main`** — Produces audit artifacts for mainline builds  
- **Weekly Schedule** — Runs every Monday 03:00 UTC (catches dependency drift)

### What It Runs

- **ZAP Baseline** — Scans `http://localhost` (configurable with `ZAP_TARGET` secret)  
- **Trivy** — Scans `private-legal-dms-app:ci` Docker image for HIGH/CRITICAL CVEs  
- **npm audit / pip-audit** — Captures JS and Python dependency issues  
- **Artifact Upload** — Stores all reports in one downloadable bundle per run

---

## 🖥️ Local Usage

You can run the same tests locally before pushing:

```
# Run ZAP baseline against your dev environment
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost/ -r zap-report.html

# Scan Docker image with Trivy
trivy image private-legal-dms-app:latest --severity HIGH,CRITICAL > trivy-report.txt

# Dependency scans
npm audit --production > npm-audit.txt
pip-audit -r requirements.txt > pip-audit.txt

# Collect evidence into /audit/YYYY-MM/
./scripts/collect-evidence.sh
```

---

## 📑 Evidence Registry

All reports should be stored under `/audit/` in a YYYY-MM folder:

```
/audit/
  2025-09/
    zap-report.html
    zap-stdout.txt
    trivy-report.txt
    npm-audit.txt
    pip-audit.txt
    screenshots/
    audit-logs.json
```

These are committed or archived as artifacts for ISO audits and quarterly reviews.

---

## 🔑 Configuration

- **Target URL:** Change in workflow (`target:`) or set `ZAP_TARGET` as a repository secret.  
- **Auth Context:** If ZAP needs authentication, create a ZAP context file and add it to `.zap/` (referenced in workflow).  
- **Severity Enforcement:** By default, workflow does **not fail** builds on HIGH/CRITICAL CVEs — review reports and enforce manually, or edit workflow to exit non-zero.

---

## 🧾 SOP Quick View

- **Owner:** Security Lead  
- **Cadence:** Quarterly + pre-release  
- **Deliverables:** Reports saved under `/audit/YYYY-MM/`  
- **Exit Criteria:** No HIGH/CRITICAL issues open, Medium issues mitigated and tracked.

---

## 📈 Continuous Improvement

- Automate OPA policy tests (`rego test`) in CI  
- Add Loki log export step to CI to capture `audit-logs.json`  
- Dashboard CVE count + ZAP findings trend in Grafana  
- Schedule restore drill automation to verify backup integrity

---

## ✅ Key Benefits

- **Repeatable**: Every PR automatically scanned, producing evidence  
- **Auditable**: `/audit/` folders serve as living ISO audit record  
- **Preventive**: Early detection of vulnerabilities before they reach production
