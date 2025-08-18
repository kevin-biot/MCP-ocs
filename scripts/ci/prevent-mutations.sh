#!/usr/bin/env bash
set -euo pipefail

PATTERN='(oc\s+.*\s+(apply|delete|scale|patch|edit|replace|cordon|drain|uncordon|annotate|label|taint)|rollout\s+(restart|pause|resume|undo))'

echo "[prevent-mutations] Scanning for forbidden mutation commands..."

FAIL=0

# Scan scripts/ and tests/ (excluding tests/fixtures) and package.json scripts
if grep -R -nE "$PATTERN" scripts --exclude-dir=tests --exclude-dir=fixtures --exclude-dir=tests/fixtures || true; then
  echo "[prevent-mutations] Hit in scripts/"
  FAIL=1
fi

if grep -R -nE "$PATTERN" tests --exclude-dir=fixtures || true; then
  echo "[prevent-mutations] Hit in tests/"
  FAIL=1
fi

# Scan npm scripts in package.json (only if jq is available)
if command -v jq >/dev/null 2>&1; then
  if jq -r '.scripts | to_entries[] | "\(.key): \(.value)"' package.json 2>/dev/null | grep -nE "$PATTERN" || true; then
    echo "[prevent-mutations] Hit in package.json scripts"
    FAIL=1
  fi
else
  echo "[prevent-mutations] jq not found, skipping package.json scripts scan"
fi

if [ "$FAIL" -eq 1 ]; then
  echo "=============================================="
  echo "MUTATION COMMAND DETECTED"
  echo "Forbidden commands found: oc (apply|delete|scale|patch|edit|replace|cordon|drain|uncordon|annotate|label|taint) or rollout (restart|pause|resume|undo)"
  echo "Commit/CI is blocked. Remove mutation commands from tests/scripts."
  echo "=============================================="
  exit 1
fi

echo "[prevent-mutations] OK — no forbidden mutations found."
