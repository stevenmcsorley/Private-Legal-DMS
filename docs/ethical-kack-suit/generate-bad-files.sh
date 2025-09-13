#!/usr/bin/env bash
# Generate benign "bad" files for testing AV/Tika pipelines.
set -euo pipefail
OUTDIR="${1:-./bad-files}"
mkdir -p "$OUTDIR"

# EICAR test string
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > "$OUTDIR/eicar.txt"

# Double-extension file
echo "hello" > "$OUTDIR/invoice.pdf.exe"

# Oversized metadata JSON (to test limits)
python3 - <<'PY' > "$OUTDIR/huge-meta.json"
import json
print(json.dumps({"title":"A"*50000,"tags":["x"]*1000}))
PY

echo "[*] Created files in $OUTDIR"
