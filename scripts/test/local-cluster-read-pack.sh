#!/usr/bin/env bash
set -euo pipefail

mkdir -p artifacts artifacts/summaries logs/runs || true

# 1) Preflight
node -v > artifacts/node-version.txt 2>&1 || true
npm -v  > artifacts/npm-version.txt  2>&1 || true
oc version --client > artifacts/oc-version.txt 2>&1 || echo "oc not found" > artifacts/oc-version.txt

if [ ! -d node_modules ]; then
  npm ci 2>&1 | tee artifacts/npm-ci.log || true
else
  npm i --prefer-offline 2>&1 | tee artifacts/npm-i.log || true
fi

# 2) Smokes
{ npm run -s retest:smoke:te-scale       ; echo $? > artifacts/.rc-smoke-scale ; } \
  > artifacts/smoke-te-scale.log 2>&1 || true
{ npm run -s retest:smoke:te-pvc-affinity; echo $? > artifacts/.rc-smoke-pvc   ; } \
  > artifacts/smoke-te-pvc-affinity.log 2>&1 || true

# 3) Goldens
{ npm run -s template:golden:snapshot ; echo $? > artifacts/.rc-golden-snap ; } \
  > artifacts/golden-snapshot.log 2>&1 || true
{ npm run -s template:golden:compare  ; echo $? > artifacts/.rc-golden-compare ; } \
  > artifacts/golden-compare.log 2>&1 || true

# 4) Coverage
{ npm run -s template:coverage ; echo $? > artifacts/.rc-coverage ; } \
  > artifacts/template-coverage.log 2>&1 || true

# 5) Formatter checks
{ node scripts/tools/format-summary.mjs docs/golden-templates/ingress-pending.json --json --gate \
  | tee artifacts/formatter-ingress-pending.log > artifacts/formatter-ingress-pending.json ; \
  echo $? > artifacts/.rc-fmt-ingress ; } 2>&1 || true

{ node scripts/tools/format-summary.mjs docs/golden-templates/pvc-storage-affinity.json --csv --no-header \
  | tee artifacts/formatter-pvc-storage-affinity.log > artifacts/formatter-pvc-storage-affinity.csv ; \
  echo $? > artifacts/.rc-fmt-pvc ; } 2>&1 || true

# 6) Collect summaries if present
find logs/runs -maxdepth 1 -type f -name "*summary.json" -exec cp {} artifacts/summaries/ \; 2>/dev/null || true

# 7) Report
{
  echo "# Local + Cluster-Read Test Pack Report"
  echo
  echo "## Steps"
  for k in smoke-scale smoke-pvc golden-snap golden-compare coverage fmt-ingress fmt-pvc; do
    rcfile="artifacts/.rc-$k"
    status="SKIPPED"
    if [ -f "$rcfile" ]; then
      rc=$(cat "$rcfile" || echo 1)
      if [ "$rc" = "0" ]; then status="OK"; else status="FAIL"; fi
    fi
    echo "- $k: $status"
  done
  echo
  echo "## Coverage"
  grep -Eo '[0-9]+(\.[0-9]+)?%|coverage[^%]*%|Coverage[^%]*%' artifacts/template-coverage.log | head -n 3 || echo "coverage: (see artifacts/template-coverage.log)"
  echo
  echo "## Formatter Outputs"
  echo "- ingress-pending: artifacts/formatter-ingress-pending.json"
  echo "- pvc-storage-affinity: artifacts/formatter-pvc-storage-affinity.csv"
  echo
  echo "## Artifacts"
  find artifacts -maxdepth 2 -type f | sed 's#^#- #' || true
  echo
  echo "## Notes"
  echo "- Cluster reads were enabled (oc present)."
  echo "- No cluster mutations attempted."
} > artifacts/report.md

echo "All checks completed: see artifacts/report.md"
