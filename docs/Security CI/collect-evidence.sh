#!/usr/bin/env bash
set -euo pipefail

OUTDIR=${1:-"./audit/$(date +%Y-%m)"} 
mkdir -p "$OUTDIR"

echo "[*] Collecting ZAP report (if present)..."
[ -f zap-report.html ] && mv zap-report.html "$OUTDIR/zap-report.html" || true
[ -f zap.out ] && mv zap.out "$OUTDIR/zap-stdout.txt" || true

echo "[*] Running dependency scans..."
npm audit --production > "$OUTDIR/npm-audit.txt" || true
if [ -f requirements.txt ]; then
  pip-audit -r requirements.txt > "$OUTDIR/pip-audit.txt" || true
fi

echo "[*] Trivy scan..."
trivy image private-legal-dms-app:latest --severity HIGH,CRITICAL > "$OUTDIR/trivy-report.txt" || true

echo "[*] Remember to export Loki audit logs to $OUTDIR/audit-logs.json"
echo "[*] Done. Artifacts in $OUTDIR"
