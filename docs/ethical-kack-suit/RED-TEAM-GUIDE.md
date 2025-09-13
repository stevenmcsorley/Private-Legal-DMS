# 🛡️ Red Team Simulation & Detection Guide — Private Legal DMS

This document explains the purpose and usage of the red-team simulator, test file generator, detection queries, and rules of engagement. These are **safe, authorized tools** designed to validate security controls, logging, and detections. They are not stealth hacking tools — all tests are expected to be blocked and logged.

---

## 📂 Files & Purpose

| File | Purpose |
|------|---------|
| `scripts/red-team-sim.sh` | Runs a series of safe penetration-style tests against a target (local/staging). Verifies that 401/403, CSP, ClamAV, and OPA blocks are working. |
| `scripts/generate-bad-files.sh` | Creates benign “malicious” test files (EICAR, double-extension, oversized metadata) for upload/AV pipeline validation. |
| `detections/LOKI-DETECTIONS.md` | Ready-to-use Loki/LogQL queries for Grafana to detect access denials, OPA denies, suspicious tokens, MinIO misuse, ClamAV detections. |
| `docs/security/RED-TEAM-RULES-OF-ENGAGEMENT.md` | Defines the rules for when, where, and how these simulations should be run (scope, safety, logging, evidence). |

---

## ▶️ Running the Simulator

1. Start your local/staging stack.  
2. Run the simulator (default target = `http://localhost`):

```bash
./scripts/red-team-sim.sh http://localhost
```

### What it Tests

- **Unauthenticated API access** → expect `401/403`  
- **Cross-firm ID tampering** → expect `403 (OPA deny)`  
- **SQLi probe** (`' OR '1'='1`) → expect `400`  
- **XSS probe** (`<script>alert(1)</script>`) → expect blocked/escaped  
- **Security headers** → outputs CSP, HSTS, XFO, X-Content-Type-Options  
- **EICAR test file** → expect ClamAV block  
- **Rate-limiting burst** → expect stable responses and log entries  

Outputs are saved to:  
```
audit/YYYY-MM/red-team/
```

---

## 🧪 Generating Test Files

Run:

```bash
./scripts/generate-bad-files.sh ./tmp/bad-files
```

Creates:

- `eicar.txt` — antivirus test string  
- `invoice.pdf.exe` — double-extension test file  
- `huge-meta.json` — oversized metadata JSON  

These files can be uploaded in staging to confirm AV, ClamAV, and metadata validators.

---

## 🔎 Detection Validation

See `detections/LOKI-DETECTIONS.md` for Grafana queries.

Examples:

- **Repeated Access Denials**
  ```
  {app="api"} |= "HTTP" |~ " 401 | 403 "
  ```
- **OPA Denies**
  ```
  {app="opa"} |= "decision"
  ```
- **ClamAV Findings**
  ```
  {app="clamav"} |= "FOUND"
  ```

Use these queries to confirm your logs reflect the red-team simulator’s actions.

---

## 📜 Rules of Engagement

- Scope: **Local/staging only**, never production.  
- Payloads: **Benign test strings only** (EICAR, dummy SQL/XSS).  
- Logs: Do **not** tamper with logs; detections must trigger.  
- Evidence: Store all results under `/audit/YYYY-MM/red-team/`.  
- Exit: Stop immediately if system stability is at risk.  

See: `docs/security/RED-TEAM-RULES-OF-ENGAGEMENT.md`

---

## 📑 Audit Evidence

When running a red-team exercise:

1. Run the simulator and/or upload generated test files.  
2. Collect outputs in `/audit/YYYY-MM/red-team/`.  
3. Run Loki queries to validate detections.  
4. Link results in the **Release Security Checklist**.  

---

## ✅ Benefits

- Validates **OPA policy enforcement** (403 denies).  
- Confirms **CSP & headers** are set.  
- Verifies **ClamAV antivirus** pipeline works.  
- Ensures **logs & detections** trigger correctly.  
- Provides **audit evidence** of proactive testing.  
