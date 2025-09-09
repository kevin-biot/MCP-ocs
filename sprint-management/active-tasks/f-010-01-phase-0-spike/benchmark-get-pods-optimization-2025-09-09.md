# Get Pods Optimization Benchmark (2025-09-09)

## Summary
- Target: `oc_read_get_pods` (fundamental pod enumeration primitive)
- Pattern: Bounded worker pool + per-namespace timeout for multi-namespace input
  - Defaults: `OC_READ_PODS_CONCURRENCY=8`, `OC_READ_PODS_TIMEOUT_MS=5000`
  - Backwards compatible single-namespace behavior
- Outcome: 20-namespace run improved from 1530ms → 1077ms (+30%) with ops parity

## Environment
- Node >= 18, oc authenticated
- Namespace set: first 20 from scope=all (consistent across runs)
- Cluster density snapshot: 121 pods across 49 namespaces (avg 2.47 pods/ns)

## Methodology
- Traditional: sequential `oc_read_get_pods` calls per namespace (N=20)
- Batched: a single `oc_read_get_pods` call with `namespaceList` (or comma list) using bounded concurrency
- Operation parity: API calls per approach counted (expect equal N)
- Timing capture: sequential per-namespace timings and counts recorded; batched overall timing and per-namespace counts returned

## Results (Live)
- Fair comparison (20 namespaces):
  - Traditional: 1530ms (77ms/ns), API calls: 20
  - Batched: 1077ms (54ms/ns), API calls: 20
  - Improvement: +30%
- Sequential per-namespace timings (examples):
  - default: 217ms (0 pods)
  - devops: 109ms (7 pods)
  - openshift-builds: 126ms (7 pods)
  - others: 59–74ms (0–1 pods)

## Interpretation
- Work equivalence validated: both paths perform the same number of API calls for N namespaces (20 vs 20).
- Improvement magnitude is bounded by API latency and server-side variability; batching reduces wall-clock by overlapping I/O.
- High-density namespaces (e.g., openshift-builds/devops) show higher sequential time; batching amortizes this cost.

## Usage
- Traditional (sequential): repeated calls per namespace
- Batched: `executeTool('oc_read_get_pods', { namespaceList: [ns1, ns2, ...] })`
- Env tuning: override with `OC_READ_PODS_CONCURRENCY`, `OC_READ_PODS_TIMEOUT_MS`

## Commands
- Run: `./node_modules/.bin/tsx tests/integration/bench/run-get-pods-fair-comparison.ts`

## Recommendation
- Prefer batched invocation when querying multiple namespaces.
- Keep concurrency at 8 by default; tune based on cluster capacity and API rate limits.

