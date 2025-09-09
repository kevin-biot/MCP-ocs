# Read Logs Optimization Benchmark (2025-09-09)

## Summary
- Target: `oc_read_logs` (pod logs retrieval)
- Pattern: Bounded worker pool for multi-pod logs with per-op timeout
  - Env defaults: `OC_READ_LOGS_CONCURRENCY=8`, `OC_READ_LOGS_TIMEOUT_MS=5000`
- Outcome: 10 pods → Sequential 931ms vs Batched 572ms (+39%), successes parity 10/10

## Methodology
- Candidate pods discovered from `oc get pods -A -o json`, first 10 selected
- Work equivalence:
  - Sequential: iterate pods and call `oc_read_logs` with single `podName`/`namespace`
  - Batched: call `oc_read_logs` with `targetList` (same pods)
  - Verify success counts match N

## Results (Live)
- Sequential: 931ms (10 pods)
- Batched: 572ms (10 pods)
- Improvement: +39%

## Implementation Notes
- Input schema extended with `targetList` (array or comma-separated `ns/pod`)
- Batched path aggregates items, counts API calls, reports duration
- Per-op timeout enforced; optional container/lines/since supported per-target

## Command
- `./node_modules/.bin/tsx tests/integration/bench/run-logs-fair-comparison.ts`

## Recommendation
- Prefer batched logs retrieval for multi-pod investigations; adjust concurrency based on API responsiveness and log size.

