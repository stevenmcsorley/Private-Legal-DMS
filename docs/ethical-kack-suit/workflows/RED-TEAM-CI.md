# 🤖 Red-Team Simulator (SAFE) — CI Integration

This workflow runs the **safe** red-team simulator against a staging URL and uploads the monthly audit evidence folder produced by the script. It’s non-destructive and intended to be **blocked and logged**.

---

## 1) Prereqs

- `red-team-sim.sh` is in your repo (default: `scripts/red-team-sim.sh`)
- The target environment is accessible from GitHub runners (public URL or via self-hosted runner)
- The app logs security events (401/403, OPA denies, AV detections, etc.)

---

## 2) Configure target

You can pass the target URL when triggering the workflow manually, or set a repo secret:

- **Manual input (recommended for multiple envs):**  
  Use *Run workflow* → `target_url = https://staging.example.com`

- **Repo secret (fixed env):**  
  Create secret `REDTEAM_TARGET` with your staging URL.  
  Then run the workflow without specifying `target_url`.

---

## 3) Triggering

- **Manual:** Actions → *Red-Team Simulator (SAFE)* → *Run workflow*  
- **Scheduled:** Runs weekly by default (Monday 03:30 UTC). Adjust `cron` as needed.

---

## 4) What it does

1. Checks out the repo  
2. Ensures `red-team-sim.sh` is executable  
3. Runs it against `REDTEAM_TARGET`  
4. Locates the evidence folder created by the script (e.g. `audit/2025-09/red-team`)  
5. Uploads that folder as artifact: `red-team-artifacts-<run_id>`

The simulator:
- Probes API prefix via `/health`  
- Attempts unauth access (expect 401/403)  
- Attempts cross-firm resource access (expect 403 or 404)  
- Sends a **URL-encoded SQLi probe** to common search routes (expect 400/403/422 or safe 200; skips if route 404)  
- Tries an **XSS probe** (unauth POST blocked)  
- Captures security headers (CSP, HSTS, XFO, XCTO)  
- Performs **EICAR preflight** (AV should block later in pipeline)  
- Sends a small request burst to `/health`  

---

## 5) Where to find results

- **Artifacts:** On the workflow run page, download `red-team-artifacts-<run_id>`  
  Contains files like:
  ```
  audit/YYYY-MM/red-team/
    http.log
    headers.txt
    eicar.txt
    prefetch.json
  ```

- **Run summary:** The job’s *Summary* tab includes the target URL and artifact name.

---

## 6) Pass/Fail semantics

The script returns **non-zero** if a test was unexpectedly permissive (e.g., 200 on unauth GET).  
CI will show the job as **failed** in that case.

---

## 7) Common adjustments

- **Different script location:** Set `script_path` input (e.g. `docs/ethical-kack-suit/red-team-sim.sh`)
- **Private env:** Use a **self-hosted runner** with network access to staging
- **Tus uploads:** Extend the script to test `OPTIONS <prefix>/uploads/tus` if you use tus/Uppy
- **Headers:** Tune CSP `frame-ancestors` and `connect-src` for your domains

---

## 8) Auditing

Move downloaded artifacts into your monthly registry:

```
/audit/
  YYYY-MM/
    red-team/
    zap-report.html
    trivy-report.txt
    npm-audit.txt
    pip-audit.txt
    audit-logs.json
```

Reference them in `RELEASE-CHECKLIST.md`.

---

## 9) Troubleshooting

- **404 on search/upload:** Your routes differ; the script tries multiple, but you can add the exact path.
- **HTTP:000 in http.log:** Network hiccup; re-run.
- **Artifacts empty:** Ensure the script created `audit/YYYY-MM/red-team/` (check job logs).
