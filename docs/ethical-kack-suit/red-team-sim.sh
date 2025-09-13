#!/usr/bin/env bash
# Red Team Simulator (SAFE) — Private Legal DMS
# Purpose: Run benign, authorized tests against a local/staging deployment.
# Expectation: Actions are BLOCKED and LOGGED (401/403/4xx), not successful.
# Output: Writes logs and artifacts under audit/YYYY-MM/red-team
#
# Usage:
#   chmod +x ./red-team-sim.sh
#   ./red-team-sim.sh http://localhost
#
# Optional:
#   Provide an auth header to exercise authorization (OPA) paths:
#     AUTH_HEADER="Authorization: Bearer <token>" ./red-team-sim.sh https://staging.example.com
#     # or
#     AUTH_HEADER="Cookie: session=<cookie>" ./red-team-sim.sh https://staging.example.com
#
# Exit codes:
#   0 = all tests behaved as expected (blocked/logged)
#   1 = a test was unexpectedly permissive or a fatal error occurred

set -euo pipefail

TARGET="${1:-http://localhost}"
STAMP="$(date +%Y-%m)"
OUTDIR="audit/${STAMP}/red-team"
LOG="${OUTDIR}/http.log"
AUTH_HEADER="${AUTH_HEADER:-}"  # e.g., "Authorization: Bearer <token>" or "Cookie: session=<cookie>"

mkdir -p "${OUTDIR}"
: > "${LOG}"

say(){ echo "[*] $*" | tee -a "${LOG}"; }
line(){ echo -e "\n----> $*" | tee -a "${LOG}"; }

# --- discover API prefix by probing /health on common base paths ---
discover_prefix() {
  local cand=(/api /api/v1 /bff /v1 /)
  for p in "${cand[@]}"; do
    local code
    code=$(curl -isk "${TARGET}${p}/health" -w "HTTP:%{http_code}" -o /dev/null | sed -n 's/.*HTTP://p')
    if [[ "$code" =~ ^(200|401|403)$ ]]; then
      echo "$p"; return 0
    fi
  done
  echo "/"
}

API_PREFIX="$(discover_prefix)"

# --- curl wrappers ---
curl_with_headers() {
  # usage: curl_with_headers <url> [extra curl args...]
  local url="$1"; shift || true
  if [[ -n "$AUTH_HEADER" ]]; then
    curl -iskS -H "$AUTH_HEADER" "$url" "$@"
  else
    curl -iskS "$url" "$@"
  fi
}

curl_code() {
  # prints only final HTTP status code to stdout
  local url="$1"; shift || true
  curl_with_headers "$url" "$@" -w "HTTP:%{http_code}\n" | tee -a "${LOG}" | sed -n 's/.*HTTP://p' | tail -n1
}

# --- assert helpers ---
assert_http() {
  # unauthenticated assertion (ignores AUTH_HEADER)
  local expect_re="$1"; shift
  local url="$1"; shift || true
  line "$url"
  local code
  code=$(curl -iskS "$url" -w "HTTP:%{http_code}\n" | tee -a "${LOG}" | sed -n 's/.*HTTP://p' | tail -n1)
  if [[ ! "$code" =~ $expect_re ]]; then
    echo "ERROR: expected ${expect_re}, got ${code} for ${url}" | tee -a "${LOG}"
    exit 1
  fi
}

assert_http_auth() {
  # authenticated assertion (uses AUTH_HEADER if set; falls back to unauth)
  local expect_re="$1"; shift
  local url="$1"; shift || true
  line "$url"
  local code
  code=$(curl_with_headers "$url" -w "HTTP:%{http_code}\n" | tee -a "${LOG}" | sed -n 's/.*HTTP://p' | tail -n1)
  if [[ ! "$code" =~ $expect_re ]]; then
    echo "ERROR: expected ${expect_re}, got ${code} for ${url}" | tee -a "${LOG}"
    exit 1
  fi
}

say "Target: ${TARGET}"
say "API prefix discovered: ${API_PREFIX}"
say "Output: ${OUTDIR}"
[[ -n "$AUTH_HEADER" ]] && say "Auth header supplied: YES" || say "Auth header supplied: NO"

# 1) Unauthenticated API access should be denied
say "Test: unauthenticated API access (expect 401/403)"
assert_http '^(401|403)$' "${TARGET}${API_PREFIX}/matters"

# 2) Broken access control probe (cross-firm resource)
say "Test: cross-firm access denial"
if [[ -n "$AUTH_HEADER" ]]; then
  # With auth, we expect authZ to deny (403) or resource layer to hide (404)
  assert_http_auth '^(403|404)$' "${TARGET}${API_PREFIX}/documents/uuid-not-owned"
else
  # Without auth, authN may block first (401), also accept 403/404
  assert_http '^(401|403|404)$' "${TARGET}${API_PREFIX}/documents/uuid-not-owned"
fi

# 3) SQLi probe (URL-encoded) — try common search routes; skip 404
say "Test: SQLi probe (expect 400/403/422 or safe 200; accept 401 when unauth; skip if route 404)"
SQLI="%27%20OR%20%271%27=%271"
search_candidates=(
  "/search?q=${SQLI}"
  "/documents/search?q=${SQLI}"
  "/documents?q=${SQLI}"
)
found_route=""
for path in "${search_candidates[@]}"; do
  code=$(curl_code "${TARGET}${API_PREFIX}${path}" -o /dev/null)
  if [[ "$code" != "404" ]]; then
    found_route="${path}"
    break
  fi
done
if [[ -n "$found_route" ]]; then
  if [[ -n "$AUTH_HEADER" ]]; then
    # authenticated: do NOT expect 401
    assert_http_auth '^(400|403|422|200)$' "${TARGET}${API_PREFIX}${found_route}"
  else
    # unauthenticated: allow 401 (authN wall)
    assert_http '^(401|400|403|422|200)$' "${TARGET}${API_PREFIX}${found_route}"
  fi
else
  say "Search route not found; skipping SQLi probe."
fi

# 4) XSS probe — unauth POST should be blocked (401/403/422). We run it UNAUTH to validate the gate.
say "Test: XSS probe (unauth POST expect 401/403/422, payload must not be stored)"
line "${TARGET}${API_PREFIX}/documents"
code=$(curl -iskS -X POST "${TARGET}${API_PREFIX}/documents" -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","matter_id":"m-1","object_key":"test","mime_type":"text/plain"}' \
  -w "HTTP:%{http_code}\n" | tee -a "${LOG}" | sed -n 's/.*HTTP://p' | tail -n1 || true)
if [[ ! "$code" =~ ^(401|403|422)$ ]]; then
  echo "ERROR: expected 401/403/422 for unauth XSS probe, got ${code}" | tee -a "${LOG}"
  exit 1
fi

# 5) Security headers present at root (CSP, HSTS, XFO, XCTO)
say "Test: security headers"
curl -Iks "${TARGET}" | grep -E "Content-Security-Policy|Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options" \
  | tee "${OUTDIR}/headers.txt" || true

# 6) EICAR preflight (AV should later block actual ingest)
say "Test: EICAR preflight (AV should block later in pipeline)"
printf 'X5O!P%%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > "${OUTDIR}/eicar.txt"
# Prefetch unauth (adjust to your flow if this endpoint requires auth)
curl -iskS -X POST "${TARGET}${API_PREFIX}/uploads/prefetch" -H "Content-Type: application/json" \
  -d '{"filename":"eicar.txt","size":68,"mime":"text/plain"}' -o "${OUTDIR}/prefetch.json" | tee -a "${LOG}" >/dev/null || true

# 7) Basic rate behavior (should log and remain stable)
say "Test: rate behavior (10 fast GET /health)"
for i in $(seq 1 10); do
  if [[ -n "$AUTH_HEADER" ]]; then
    curl_with_headers "${TARGET}${API_PREFIX}/health" -o /dev/null
  else
    curl -iskS "${TARGET}${API_PREFIX}/health" -o /dev/null
  fi
done

say "Done. Review ${OUTDIR} and correlate with detections (Loki)."
