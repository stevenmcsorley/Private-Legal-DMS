#!/usr/bin/env bash
# Red Team Simulator (SAFE) — Private Legal DMS
# Runs benign, authorized tests against a local/staging instance.
# This script EXPECTS defenses to trigger (403s, 400s, AV blocks) and logs to record attempts.
#
# Usage:
#   ./scripts/red-team-sim.sh http://localhost
#
set -euo pipefail
TARGET="${1:-http://localhost}"
OUTDIR="audit/$(date +%Y-%m)/red-team"
mkdir -p "$OUTDIR"

echo "[*] Target: $TARGET"
echo "[*] Output: $OUTDIR"

# Helper for curl
http() {
  url="$1"; shift || true
  echo -e "\n----> $url" | tee -a "$OUTDIR/http.log"
  curl -iskS "$url" "$@" | tee -a "$OUTDIR/http.log" > /dev/null
}

# 1) Unauthenticated access to protected API
echo "[*] Test: unauthenticated API access (should be 401/403)"
http "$TARGET/api/matters" -o "$OUTDIR/unauth_m.mat" -w "\nHTTP:%{http_code}\n"

# 2) Broken Access Control: cross-firm resource ID tampering (expects 403)
echo "[*] Test: cross-firm access denial (expects 403)"
curl -iskS -X GET "$TARGET/api/documents/uuid-not-owned" -H "Cookie: session=TEST" -w "\nHTTP:%{http_code}\n" | tee -a "$OUTDIR/http.log" > /dev/null

# 3) SQLi probe (low risk) — should be blocked/validated by API
echo "[*] Test: SQLi probe (expects 400)"
curl -iskS "$TARGET/api/search?q=' OR '1'='1" -w "\nHTTP:%{http_code}\n" | tee -a "$OUTDIR/http.log" > /dev/null

# 4) XSS probe — metadata field (should be escaped/blocked)
echo "[*] Test: XSS probe"
curl -iskS -X POST "$TARGET/api/documents"   -H "Content-Type: application/json"   -d '{"title":"<script>alert(1)</script>","matter_id":"m-1","object_key":"test","mime_type":"text/plain"}'   -w "\nHTTP:%{http_code}\n" | tee -a "$OUTDIR/http.log" > /dev/null

# 5) Security headers on main page
echo "[*] Test: security headers"
curl -Iks "$TARGET" | grep -E "Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options" | tee "$OUTDIR/headers.txt" || true

# 6) Upload EICAR (virus) — should be blocked by ClamAV
echo "[*] Test: EICAR upload (should be blocked)"
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > "$OUTDIR/eicar.txt"
curl -iskS -X POST "$TARGET/api/uploads/prefetch" -H "Content-Type: application/json" -d '{"filename":"eicar.txt","size":68,"mime":"text/plain"}' -o "$OUTDIR/prefetch.json" || true

# 7) Rate limiting — burst small requests (should remain stable / logs show rate patterns)
echo "[*] Test: basic rate behavior"
for i in $(seq 1 10); do curl -iskS "$TARGET/api/health" -o /dev/null; done

echo "[*] Done. Review $OUTDIR for outputs and correlate with logs in Loki."
