#!/usr/bin/env bash
set -euo pipefail

# Dual-mode parity sweep runner with simple guardrails and env/CLI overrides
# Usage:
#   scripts/e2e/run-parity-suite.sh \
#     [--route-ns <ns>] [--route <name>] \
#     [--pvc-ns <ns>] [--pvc <name>] [--pvc-sc <sc>] \
#     [--sched-ns <ns>] [--sched-pod <podName>]
#
# Environment file support (loaded first if present):
#   .env.parity (preferred) or .env
# Supported env vars: ROUTE_NS, ROUTE_NAME, PVC_NS, PVC_NAME, PVC_SC, SCHED_NS, SCHED_POD
# Models config: LM_MODELS (comma-separated) or --models "m1,m2,m3"
# LM Studio waits: LM_MODEL_READY_TIMEOUT (sec, default 120), LM_MODEL_READY_POLL_SEC (default 5), LM_MODEL_SETTLE_SEC (default 10)

# Load env file if present
set +u
if [[ -f .env.parity ]]; then
  set -a; source ./.env.parity; set +a
elif [[ -f .env ]]; then
  set -a; source ./.env; set +a
fi
set -u

# Defaults (can be overridden by env or CLI)
ROUTE_NS=${ROUTE_NS:-shop}
ROUTE_NAME=${ROUTE_NAME:-checkout}
PVC_NS=${PVC_NS:-student35}
PVC_NAME=${PVC_NAME:-shared-pvc}
PVC_SC=${PVC_SC:-gp3-csi}
SCHED_NS=${SCHED_NS:-openshift-gitops}
SCHED_POD=${SCHED_POD:-openshift-gitops-repo-server-5cddfbc756-gdcd4}
LM_PAUSE_BETWEEN_CASES_SEC=${LM_PAUSE_BETWEEN_CASES_SEC:-0}
LM_PAUSE_BETWEEN_MODELS_SEC=${LM_PAUSE_BETWEEN_MODELS_SEC:-0}

# Parse CLI flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --models) LM_MODELS="$2"; shift 2;;
    --route-ns) ROUTE_NS="$2"; shift 2;;
    --route) ROUTE_NAME="$2"; shift 2;;
    --pvc-ns) PVC_NS="$2"; shift 2;;
    --pvc) PVC_NAME="$2"; shift 2;;
    --pvc-sc) PVC_SC="$2"; shift 2;;
    --sched-ns) SCHED_NS="$2"; shift 2;;
    --sched-pod) SCHED_POD="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

# Models (use env LM_MODELS if provided)
if [[ -n "${LM_MODELS:-}" ]]; then
  IFS=',' read -r -a MODELS <<< "$LM_MODELS"
else
  MODELS=("qwen/qwen3-coder-30b" "ministral-8b-instruct-2410" "mistralai/devstral-small-2507")
fi
export LM_SEEDS="7,13,23" LM_TEMPERATURE=0 LM_TOP_P=1

log() { echo "[parity-suite] $*"; }

log "Cleaning prior logs/artifacts"
rm -rf logs/robustness logs/transcripts artifacts/dual-mode-robustness.md artifacts/oov-summary.csv || true

run_llm(){ tsx scripts/e2e/run-matrix.mjs "$1"; }
run_eng(){ tsx scripts/e2e/run-engine.mjs "$1"; }

start_ts=$(date)
log "Starting at: $start_ts"

# Fail-fast readiness (oc + LM Studio + optional models)
if ! scripts/e2e/check-readiness.sh --models "${LM_MODELS:-}"; then
  log "Readiness check failed. Aborting."
  exit 4
fi


# Auth check to avoid long failing runs (with graceful fallback)
if oc whoami >/dev/null 2>&1; then
  log "oc auth ok"
else
  CTX=$(oc config current-context 2>/dev/null || true)
  SRV=$(oc whoami --show-server 2>/dev/null || true)
  if [[ -n "$CTX" && -n "$SRV" ]]; then
    log "oc auth warn: whoami failed, but context/server present ($CTX / $SRV) — proceeding"
  else
    log "ERROR: oc is not logged in. Run 'oc login' and retry."
    exit 3
  fi
fi

# LM Studio model readiness helper
wait_for_model(){
  local model="$1"
  local timeout="${LM_MODEL_READY_TIMEOUT:-120}"
  local poll="${LM_MODEL_READY_POLL_SEC:-5}"
  local elapsed=0
  log "Waiting for LM Studio to report model: $model (timeout=${timeout}s)"
  while true; do
    if node scripts/e2e/lmstudio-list-models.mjs 2>/dev/null | grep -F "$model" >/dev/null; then
      log "Model available: $model"
      break
    fi
    if [[ "$elapsed" -ge "$timeout" ]]; then
      log "Timeout waiting for model: $model — proceeding anyway"
      break
    fi
    sleep "$poll" || true
    elapsed=$((elapsed+poll))
  done
  # give LM Studio a short settle period after (un)loading
  sleep "${LM_MODEL_SETTLE_SEC:-10}" || true
}

pause_between_cases(){
  if [[ "$LM_PAUSE_BETWEEN_CASES_SEC" -gt 0 ]]; then
    log "Pausing ${LM_PAUSE_BETWEEN_CASES_SEC}s between cases for LM Studio stability"
    sleep "$LM_PAUSE_BETWEEN_CASES_SEC" || true
  fi
}

for M in "${MODELS[@]}"; do
  export LMS_MODEL="$M"
  wait_for_model "$LMS_MODEL"
  # ingress-pending
  unset E2E_NS E2E_ROUTE E2E_PVC E2E_SC E2E_POD
  run_llm ingress-pending-demo || true
  run_eng ingress-pending-demo || true
  pause_between_cases
  # route-5xx
  export E2E_NS="$ROUTE_NS" E2E_ROUTE="$ROUTE_NAME"
  run_llm route-5xx-demo || true
  run_eng route-5xx-demo || true
  pause_between_cases
  # pvc-binding
  export E2E_NS="$PVC_NS" E2E_PVC="$PVC_NAME" E2E_SC="$PVC_SC"
  run_llm pvc-binding-demo || true
  run_eng pvc-binding-demo || true
  pause_between_cases
  # scheduling-failures
  export E2E_NS="$SCHED_NS" E2E_POD="$SCHED_POD"
  run_llm scheduling-failures-demo || true
  run_eng scheduling-failures-demo || true
  pause_between_cases
  # cluster-health
  unset E2E_NS E2E_ROUTE E2E_PVC E2E_SC E2E_POD
  run_llm cluster-health-demo || true
  run_eng cluster-health-demo || true
  if [[ "$LM_PAUSE_BETWEEN_MODELS_SEC" -gt 0 ]]; then
    log "Pausing ${LM_PAUSE_BETWEEN_MODELS_SEC}s before switching model"
    sleep "$LM_PAUSE_BETWEEN_MODELS_SEC" || true
  fi
done

end_ts=$(date)
log "Finished at: $end_ts"

node scripts/e2e/consolidate-report.mjs || true
node scripts/e2e/report-parity-summary.mjs || true

# Guardrails
expected_transcripts=45
expected_engine=15
actual_transcripts=$(find logs/transcripts -type f -name '*__t0_p1_s*.json' 2>/dev/null | wc -l | awk '{print $1}')
actual_engine=$(find logs/robustness -type f -name '*__engine.json' 2>/dev/null | wc -l | awk '{print $1}')

log "Transcripts: $actual_transcripts (expected $expected_transcripts)"
log "Engine JSONs: $actual_engine (expected $expected_engine)"

if [[ "$actual_transcripts" -ne "$expected_transcripts" || "$actual_engine" -ne "$expected_engine" ]]; then
  log "Guardrail mismatch — review artifacts/dual-mode-robustness.md"
  exit 2
fi

log "Parity suite completed with expected counts."
