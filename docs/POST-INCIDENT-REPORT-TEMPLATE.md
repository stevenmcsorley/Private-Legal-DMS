# 📝 Post-Incident Report Template — Private Legal DMS

**Incident ID:** [YYYYMMDD-SEQ]  
**Date Detected:** [YYYY-MM-DD HH:MM UTC]  
**Reported By:** [Name / System Alert]  
**Severity:** [Critical / High / Medium / Low]

---

## 1. Summary

Provide a 2-3 sentence executive summary of what happened.

---

## 2. Timeline

| Time (UTC) | Event |
|-----------|-------|
| YYYY-MM-DD HH:MM | Incident detected |
| YYYY-MM-DD HH:MM | Containment steps executed |
| YYYY-MM-DD HH:MM | Root cause identified |
| YYYY-MM-DD HH:MM | Services restored |
| YYYY-MM-DD HH:MM | Post-mortem completed |

---

## 3. Root Cause Analysis

Describe the underlying cause (vulnerability, misconfiguration, human error).  
Reference Jira ticket(s) for permanent fixes.

---

## 4. Impact Assessment

| Aspect | Impact |
|-------|--------|
| **Confidentiality** | [What data was accessed/exposed?] |
| **Integrity** | [Was any data altered or corrupted?] |
| **Availability** | [Was there downtime? How long?] |

---

## 5. Containment & Eradication

List all containment steps (isolation, key rotation, account disables) and eradication steps (patches, config changes).

---

## 6. Recovery

Describe how systems were restored and validated (hash verification, backup restore, regression tests).

---

## 7. Communication

- Internal notifications sent to: [list roles]
- Client communications (if applicable): [summary / link to message]

---

## 8. Corrective & Preventive Actions

| Action | Owner | Due Date | Status |
|-------|-------|----------|-------|
| Patch vulnerable component | [Owner] | [Date] | Open |
| Add regression test for exploit | [Owner] | [Date] | Open |

---

## 9. Evidence

Attach or link to:

- Logs (`/audit/YYYY-MM/incidents/<incident-id>/logs.json`)
- Screenshots or forensic artifacts
- ZAP/Trivy scan after remediation

---

## 10. Sign-Off

- **Security Lead:** _________________________ Date: __________
- **Product Owner:** _________________________ Date: __________

---

Store this completed report under `/audit/YYYY-MM/incidents/<incident-id>/post-mortem.md`.
