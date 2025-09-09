# Cluster Health Optimization Benchmark (2025-09-09)

## Summary
- Target: `oc_diagnostic_cluster_health` (cluster-wide analysis)
- Pattern: Batched namespace health checks with bounded workers and per-namespace timeouts
  - Env defaults: `OC_DIAG_NS_CONCURRENCY=8`, `OC_DIAG_NS_TIMEOUT_MS=5000` (fallback to `OC_DIAG_CONCURRENCY`/`OC_DIAG_TIMEOUT_MS`)
- Outcome: Sequential→Batched (20 namespaces): 2314ms → 218ms (+91%), checks parity confirmed

## Environment
- Node >= 18, oc authenticated
- Namespaces: first 20 from `scope=all` (consistent list)
- Cluster density snapshot (reference): 121 pods across 49 namespaces

## Methodology
- Work-equivalent comparison:
  - Sequential: `batchAnalyzeNamespaceHealth` with `maxConcurrent=1`
  - Batched: `batchAnalyzeNamespaceHealth` with `maxConcurrent=8`
- Operation parity: number of checks equals `N` in both approaches
- Per-namespace elapsed times captured from the sequential run

## Results (Live)
- Sequential: 2314ms (116ms/ns), checks: 20
- Batched: 218ms (11ms/ns), checks: 20
- Improvement: +91%
- Sample per-namespace timings (sequential): ~109–154ms per namespace

## Implementation Notes
- `enhancedClusterHealth` now reads env-configurable concurrency/timeout; removed hard-coded 5/10000 values
- `batchAnalyzeNamespaceHealth` returns per-namespace elapsed timings and totalMs

## Commands
- Run: `./node_modules/.bin/tsx tests/integration/bench/run-cluster-health-fair-comparison.ts`

## Recommendations
- Adopt `concurrency=8`, `timeout=5000ms` as defaults; tune per cluster capacity
- Extend batching to other cluster-wide aggregates as needed

