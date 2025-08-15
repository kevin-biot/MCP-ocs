#!/usr/bin/env bash
set -euo pipefail

MODE=${1:-}
shift || true

OUTDIR="docs/real-examples"
mkdir -p "$OUTDIR"

timestamp() { date +%Y%m%d-%H%M%S; }

case "$MODE" in
  cluster|clusters|cluster-health)
    outfile="$OUTDIR/cluster-health-$(timestamp).json"
    rawfile="$outfile.raw"
    logfile="$outfile.log"
    echo "[capture] Writing cluster health to $outfile" >&2
    CAPTURE_MODE=1 tsx tests/integration/real/cluster-health-real.ts "$@" >"$rawfile" 2>"$logfile" || true
    if jq -e . "$rawfile" > "$outfile" 2>>"$logfile"; then
      rm -f "$rawfile"
    else
      echo "[capture] Non-JSON output detected; keeping raw at $rawfile (see $logfile)" >&2
    fi
    ;;
  ns|namespace)
    # require --ns <namespace>
    ns=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --ns)
          ns="$2"; shift 2;;
        *) shift;;
      esac
    done
    if [[ -z "$ns" ]]; then
      echo "Usage: $0 ns --ns <namespace> [--deep true] [--ingress true]" >&2
      exit 2
    fi
    outfile="$OUTDIR/ns-${ns}-$(timestamp).json"
    rawfile="$outfile.raw"
    logfile="$outfile.log"
    echo "[capture] Writing namespace health for $ns to $outfile" >&2
    CAPTURE_MODE=1 tsx tests/integration/real/namespace-health-real.ts --ns "$ns" "$@" >"$rawfile" 2>"$logfile" || true
    if jq -e . "$rawfile" > "$outfile" 2>>"$logfile"; then
      rm -f "$rawfile"
    else
      echo "[capture] Non-JSON output detected; keeping raw at $rawfile (see $logfile)" >&2
    fi
    ;;
  rca)
    # require --ns <namespace>
    ns=""
    while [[ $# -gt 0 ]]; do
      case $1 in
        --ns)
          ns="$2"; shift 2;;
        *) shift;;
      esac
    done
    if [[ -z "$ns" ]]; then
      echo "Usage: $0 rca --ns <namespace> [--deep true]" >&2
      exit 2
    fi
    outfile="$OUTDIR/rca-${ns}-$(timestamp).json"
    rawfile="$outfile.raw"
    logfile="$outfile.log"
    echo "[capture] Writing RCA result for $ns to $outfile" >&2
    CAPTURE_MODE=1 tsx tests/integration/real/rca-real.ts --ns "$ns" "$@" >"$rawfile" 2>"$logfile" || true
    if jq -e . "$rawfile" > "$outfile" 2>>"$logfile"; then
      rm -f "$rawfile"
    else
      echo "[capture] Non-JSON output detected; keeping raw at $rawfile (see $logfile)" >&2
    fi
    ;;
  *)
    echo "Usage: $0 {cluster|ns|rca} [args...]" >&2
    exit 2
    ;;
esac

echo "[capture] Done: $outfile" >&2
