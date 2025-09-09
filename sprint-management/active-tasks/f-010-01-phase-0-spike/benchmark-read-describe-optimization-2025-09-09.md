# Read Describe Optimization Benchmark (2025-09-09)

## Summary
- Target: `oc_read_describe` (resource describe operation)
- Pattern: Bounded worker pool for parallel describes with per-op timeout
  - Env defaults: `OC_READ_DESCRIBE_CONCURRENCY=8`, `OC_READ_DESCRIBE_TIMEOUT_MS=5000`
- Outcome: 10 clusteroperators → Sequential 1113ms vs Batched 609ms (+45%), ops parity 10/10

## Methodology
- Resource type: `clusteroperator` (cluster-scoped, consistent presence)
- Work-equivalence:
  - Sequential: iterate names, call `oc_read_describe` with single `name`
  - Batched: call `oc_read_describe` with `nameList` (array), same names
  - Verify successes per approach match N
- Timing: total wall-clock and per-item sequential timings captured

## Results (Live)
- Sequential: 1113ms (111ms/item), OK=10
- Batched: 609ms (61ms/item), OK=10
- Improvement: +45%

## Implementation Notes
- Input schema extended with `nameList` (array or comma-separated string)
- New batched path aggregates results and logs API calls (equal to N)
- Per-op timeout enforced via Promise.race

## Command
- `./node_modules/.bin/tsx tests/integration/bench/run-describe-fair-comparison.ts`

## Recommendation
- Prefer batched describe for multi-resource investigations, using sensible concurrency based on API responsiveness.

