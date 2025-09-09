# RCA Checklist Optimization Benchmark (2025-09-09)

## Summary
- Target: `oc_diagnostic_rca_checklist` (guided multi-step incident checklist)
- Pattern: Phased bounded concurrency across independent checks
  - Env defaults: `OC_RCA_CONCURRENCY=8` (fallback `OC_DIAG_CONCURRENCY`)
- Outcome: Sequential→Batched: 1079ms → 468ms (+57%) with checks parity (6/6)

## Methodology
- Work-equivalent comparison via env toggles:
  - Sequential: `OC_RCA_CONCURRENCY=1`
  - Batched: `OC_RCA_CONCURRENCY=8`
- Phases:
  1. Cluster + Node (parallel)
  2. Namespace-focused (namespace or critical namespaces)
  3. Storage + Network + Events (parallel)
  4. Deep analysis (optional)

## Results (Live)
- Checks: 6
- Sequential: 1079ms (≈180ms/check)
- Batched: 468ms (≈78ms/check)
- Improvement: +57%

## Implementation Notes
- `runChecklist` reworked into phases with `runWithConcurrency` helper
- Maintains existing per-check error handling and evidence capture
- Concurrency configurable via `OC_RCA_CONCURRENCY`

## Command
- `./node_modules/.bin/tsx tests/integration/bench/run-rca-fair-comparison.ts`

## Recommendation
- Keep `OC_RCA_CONCURRENCY=8` default; adjust based on API latency and cluster size
- Consider timeouts per check if needed for noisy environments

