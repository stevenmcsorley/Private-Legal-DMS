# 🚀 Release Security Checklist — Private Legal DMS

Use this checklist before tagging a release or deploying to production.

## ✅ Pre-Release Security Tasks

- [ ] **CI Security Scan Passed**  
  - Link to GitHub Actions run: [paste link here]
  - ZAP report: no HIGH/CRITICAL findings
  - Trivy: no HIGH/CRITICAL CVEs (or mitigations documented)

- [ ] **Audit Log Integrity Verified**  
  - Chain verification job run and passed
  - Ledger verification report stored under `/audit/YYYY-MM/ledger-verification.json`

- [ ] **Policy Tests Passing**  
  - `rego test` coverage at 100% for allow/deny decisions
  - Coverage report archived in `/audit/YYYY-MM/`

- [ ] **Backups Validated**  
  - Latest restore drill successful
  - SHA-256 hash match confirmed for restored documents

- [ ] **Key Rotation Reviewed**  
  - MinIO keys, DB creds, and Vault secrets rotated or within validity window

- [ ] **Open CVEs Reviewed**  
  - All open Medium/Low issues triaged, tracked in Jira

- [ ] **Change Management Approved**  
  - Release signed off by Security Lead & Product Owner

---

Store this file in the release artifacts folder alongside other evidence.
