#!/usr/bin/env bash
set -euo pipefail

echo "== LLM Retest Setup =="
echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

KUBECONFIG_PATH=${KUBECONFIG:-}
if [[ -z "${KUBECONFIG_PATH}" ]]; then
  echo "WARN: KUBECONFIG not set. Set it if you plan to use real cluster tools."
else
  echo "KUBECONFIG: ${KUBECONFIG_PATH}"
fi

echo "-- Checking oc auth (ignore if not installed) --"
if command -v oc >/dev/null 2>&1; then
  set +e
  oc whoami
  OC_RC=$?
  set -e
  if [[ $OC_RC -ne 0 ]]; then
    echo "Run 'oc login ...' in this shell before starting the server."
  fi
else
  echo "oc not found; skipping."
fi

echo "-- Clean build --"
npm run -s clean || true
npm run -s build

echo "-- Sequential smoke tests (no cluster required) --"
if command -v npx >/dev/null 2>&1; then
  npx -y tsx scripts/smoke/smoke-sequential-ingress.ts || true
  npx -y tsx scripts/smoke/smoke-sequential-rca.ts || true
else
  echo "npx not available; skipping smoke tests."
fi

cat <<EOF

Next steps:
1) Start MCP server (sequential recommended):
   ENABLE_SEQUENTIAL_THINKING=true OC_TIMEOUT_MS=
   120000 npx tsx src/index-sequential.ts

2) In LM Studio:
   - Enable tool calling (strict mode if available)
   - Use the validation prompts from docs/LLM_RETEST_CHECKLIST.md

3) If tool-calling fails, try direct calls listed in the checklist.

EOF
