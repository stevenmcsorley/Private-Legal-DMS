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
# Optional (authenticated checks):
#   COOKIE="session=<value>" ./red-team-sim.sh https://staging.example.com
#   AUTH_HEADER="Authorization: Bearer <token>" ./red-team-sim.sh https://staging.example.com
#   COOKIE_FILE=./cookie.jar ./red-team-sim.sh https://staging.example.com
#
# Exit codes:
#   0 = all tests behaved as expected (blocked/logged)
#   1 = a test was unexpectedly permissive or a fatal error occurred

set -euo pipefail

TARGET="${1:-http://localhost}"
STAMP="$(date +%Y-%m)"
OUTDIR="audit/${STAMP}/red-team"
LOG="${OUTDIR}/http.log"

# Auth options (use COOKIE for BFF/session patterns)
AUTH_HEADER="${AUTH_HEADER:-}"      # e.g., "Authorization: Bearer <token>"
COOKIE="${COOKIE:-}"                # e.g., "session=s%3Axxxxx.yyyyy"
COOKIE_FILE="${COOKIE_FILE:-}"      # path to Netscape cookie jar (curl -c)

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

# --- curl helpers (supporting header + cookie or cookie jar) ---
curl_with_headers() {
  local url="$1"; shift || true
  if [[ -n "$AUTH_HEADER" ]]; then
    if [[ -n "$COOKIE_FILE" ]]; then
      curl -iskS -b "$COOKIE_FILE" -H "$AUTH_HEADER" "$url" "$@"
    elif [[ -n "$COOKIE" ]]; then
      curl -iskS --cookie "$COOKIE" -H "$AUTH_HEADER" "$url" "$@"
    else
      curl -iskS -H "$AUTH_HEADER" "$url" "$@"
    fi
  else
    if [[ -n "$COOKIE_FILE" ]]; then
      curl -iskS -b "$COOKIE_FILE" "$url" "$@"
    elif [[ -n "$COOKIE" ]]; then
      curl -iskS --cookie "$COOKIE" "$url" "$@"
    else
      curl -iskS "$url" "$@"
    fi
  fi
}

curl_code() {
  local url="$1"; shift || true
  curl_with_headers "$url" "$@" -w "HTTP:%{http_code}\n" | tee -a "${LOG}" | sed -n 's/.*HTTP://p' | tail -n1
}

# --- assert helpers ---
assert_http() {
  # UNAUTH assertion (forces no auth header/cookie)
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
  # AUTH assertion (uses provided header/cookie if any)
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
[[ -n "$AUTH_HEADER" || -n "$COOKIE" || -n "$COOKIE_FILE" ]] && say "Authenticated run: YES" || say "Authenticated run: NO"

# 1) Unauthenticated API access should be denied
say "Test: unauthenticated API access (expect 401/403)"
assert_http '^(401|403)$' "${TARGET}${API_PREFIX}/matters"

# 2) Broken access control probe (cross-firm resource)
say "Test: cross-firm access denial"
if [[ -n "$AUTH_HEADER" || -n "$COOKIE" || -n "$COOKIE_FILE" ]]; then
  # With valid auth, expect OPA/resource layer to deny/hide
  assert_http_auth '^(403|404)$' "${TARGET}${API_PREFIX}/documents/uuid-not-owned"
else
  # Without auth, authN may block first (401), also accept 403/404
  assert_http '^(401|403|404)$' "${TARGET}${API_PREFIX}/documents/uuid-not-owned"
fi

# 3) SQLi probe (URL-encoded) — try common search routes; skip 404
say "Test: SQLi probe (accept 401 when unauth; else expect 400/403/422/200; skip if route 404)"
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
  if [[ -n "$AUTH_HEADER" || -n "$COOKIE" || -n "$COOKIE_FILE" ]]; then
    assert_http_auth '^(400|403|422|200)$' "${TARGET}${API_PREFIX}${found_route}"
  else
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
# Prefetch unauth (adjust if your endpoint requires auth; if so, run with COOKIE)
curl_with_headers "${TARGET}${API_PREFIX}/uploads/prefetch" \
  -X POST -H "Content-Type: application/json" \
  -d '{"filename":"eicar.txt","size":68,"mime":"text/plain"}' -o "${OUTDIR}/prefetch.json" || true

# 7) Basic rate behavior (should log and remain stable)
say "Test: rate behavior (10 fast GET /health)"
for i in $(seq 1 10); do
  curl_with_headers "${TARGET}${API_PREFIX}/health" -o /dev/null
done

say "Done. Review ${OUTDIR} and correlate with detections (Loki)."
