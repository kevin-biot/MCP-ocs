#!/usr/bin/env bash
set -euo pipefail

# NDJSON probe + session override defaults
export PROBE_NDJSON="${PROBE_NDJSON:-true}"
export FORCE_NEW_SESSION_ID="${FORCE_NEW_SESSION_ID:-true}"
# Optional: tag generated IDs for readability (set externally or uncomment)
# export SESSION_ID_SEED="${SESSION_ID_SEED:-devops}"

echo "[run-mcp-ndjson] PROBE_NDJSON=${PROBE_NDJSON} FORCE_NEW_SESSION_ID=${FORCE_NEW_SESSION_ID} SESSION_ID_SEED=${SESSION_ID_SEED:-}"

# Prefer local tsx runner; fallback to npx; otherwise use built JS if present
if [[ -x "./node_modules/.bin/tsx" ]]; then
  exec ./node_modules/.bin/tsx src/index-sequential.ts
elif command -v npx >/dev/null 2>&1; then
  exec npx tsx src/index-sequential.ts
elif [[ -f "dist/src/index-sequential.js" ]]; then
  exec node dist/src/index-sequential.js
else
  echo "[run-mcp-ndjson] ERROR: Could not find tsx runner or dist build" >&2
  exit 1
fi

