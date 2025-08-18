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

# Parse CLI flags
while [[ $# -gt 0 ]]; do
  case "$1" in
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

MODELS=("qwen/qwen3-coder-30b" "ministral-8b-instruct-2410" "mistralai/devstral-small-2507")
export LM_SEEDS="7,13,23" LM_TEMPERATURE=0 LM_TOP_P=1

log() { echo "[parity-suite] $*"; }

log "Cleaning prior logs/artifacts"
rm -rf logs/robustness logs/transcripts artifacts/dual-mode-robustness.md artifacts/oov-summary.csv || true

run_llm(){ tsx scripts/e2e/run-matrix.mjs "$1"; }
run_eng(){ tsx scripts/e2e/run-engine.mjs "$1"; }

start_ts=$(date)
log "Starting at: $start_ts"

for M in "${MODELS[@]}"; do
  export LMS_MODEL="$M"
  # ingress-pending
  unset E2E_NS E2E_ROUTE E2E_PVC E2E_SC E2E_POD
  run_llm ingress-pending-demo || true
  run_eng ingress-pending-demo || true
  # route-5xx
  export E2E_NS="$ROUTE_NS" E2E_ROUTE="$ROUTE_NAME"
  run_llm route-5xx-demo || true
  run_eng route-5xx-demo || true
  # pvc-binding
  export E2E_NS="$PVC_NS" E2E_PVC="$PVC_NAME" E2E_SC="$PVC_SC"
  run_llm pvc-binding-demo || true
  run_eng pvc-binding-demo || true
  # scheduling-failures
  export E2E_NS="$SCHED_NS" E2E_POD="$SCHED_POD"
  run_llm scheduling-failures-demo || true
  run_eng scheduling-failures-demo || true
  # cluster-health
  unset E2E_NS E2E_ROUTE E2E_PVC E2E_SC E2E_POD
  run_llm cluster-health-demo || true
  run_eng cluster-health-demo || true
done

end_ts=$(date)
log "Finished at: $end_ts"

node scripts/e2e/consolidate-report.mjs || true

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
