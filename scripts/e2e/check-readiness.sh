#!/usr/bin/env bash
set -euo pipefail

# Quick readiness probe for oc + LM Studio
# Usage: scripts/e2e/check-readiness.sh [--models "m1,m2,..."]

LM_MODELS_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --models) LM_MODELS_ARG="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

log(){ echo "[readiness] $*"; }

# 1) oc auth check (with graceful fallback)
if oc whoami >/dev/null 2>&1; then
  log "oc auth: OK ($(oc whoami 2>/dev/null))"
else
  CTX=$(oc config current-context 2>/dev/null || true)
  SRV=$(oc whoami --show-server 2>/dev/null || true)
  if [[ -n "$CTX" && -n "$SRV" ]]; then
    log "oc auth: WARN (whoami failed), but context/server present: $CTX / $SRV — proceeding"
  else
    log "ERROR: oc is not logged in (no context/server). Run 'oc login' and retry."
    exit 2
  fi
fi

# 2) LM Studio reachability + optional model presence
BASE="${LMSTUDIO_BASE_URL:-http://localhost:1234/v1}"
if ! node scripts/e2e/lmstudio-list-models.mjs >/dev/null 2>&1; then
  log "ERROR: LM Studio not reachable at ${BASE}. Start LM Studio or adjust LMSTUDIO_BASE_URL."
  exit 3
fi
MODELS_LIST=$(node scripts/e2e/lmstudio-list-models.mjs 2>/dev/null || true)
COUNT=$(echo "$MODELS_LIST" | wc -l | awk '{print $1}')
log "LM Studio models listed: ${COUNT}"

LM_MODELS_CHECK="${LM_MODELS_ARG:-${LM_MODELS:-}}"
if [[ -n "$LM_MODELS_CHECK" ]]; then
  IFS=',' read -r -a NEED <<< "$LM_MODELS_CHECK"
  MISSING=()
  for m in "${NEED[@]}"; do
    if ! echo "$MODELS_LIST" | grep -F "$m" >/dev/null; then
      MISSING+=("$m")
    fi
  done
  if [[ ${#MISSING[@]} -gt 0 ]]; then
    log "ERROR: LM Studio missing models: ${MISSING[*]}"
    exit 4
  fi
  log "LM Studio required models present: ${NEED[*]}"
fi

log "Readiness: OK"
exit 0
