# D-002 EPIC-004 — Performance Metrics (Baseline v3.2)

Note: Metrics captured from current repository state and artifacts without executing external services (network-restricted). Where live Chroma metrics are unavailable, we provide calibrated expectations and methodology.

## Repository-Derived Baseline (JSON Store)
- Total JSON files (memory/): 2385
- Total memory directory size: 13M
- Namespaces present: 5 (directories under `memory/`)
- File count by key dirs:
  - `memory/default`: 1572 files (~6.3M)
  - `memory/test`: 60 files
  - `memory/e2e`: 1 file
- Bench artifacts:
  - `bench-*.json`: 3 samples (~28K each)
  - `e2e-concurrent-*.json`: 5 samples (81 lines each, ~20K)

## Expected Latency Bands (Chroma vs JSON)
- Embedding (Xenova all-MiniLM-L6-v2): 120–350 ms per document (p50) on typical dev hardware; p95 250–600 ms.
- Embedding (hash fallback): 3–12 ms per document (p50); p95 < 25 ms.
- Chroma REST v2 add: 40–150 ms network + server compute per batch (excluding embedding), scales with payload size.
- Chroma REST v2 query: 50–200 ms per query (excluding embedding); with client embeddings add the same embedding cost for query text.
- JSON fallback search: O(N) file scan by directory; small sets (<2K files) typically 20–80 ms p50 on SSD when cached; p95 rises with cold cache and file size.

## Load Characteristics (Methodology)
- Write path: Dual-write (JSON always, Chroma when available). Throughput bound by slower of file I/O or embeddings + REST add.
- Read path: Vector query preferred with re-ranking; fallback scans JSON with simple token overlap.

## Recommended Measurements (to collect in TESTER phase)
- JSON only
  - p50/p95 write latency for conversation and operational entries (single + batched 10).
  - p50/p95 search latency across 1K/5K/10K files.
- Chroma enabled
  - Embedding method reported (Xenova/hash), embedding time p50/p95; add/query p50/p95; result counts.
  - End-to-end search time (embed+query+re-rank) p50/p95.
- Concurrency
  - 10/25/50 parallel writes: throughput (ops/sec), error rate, JSON/Chroma skew.

## Current Evidence Snapshots
- JSON store scale (counts, sizes) captured above.
- Bench JSON samples present for replay; use to seed Chroma when available via provided reload utility in `mcp-files-memory-extension.ts`.

## Variance and Calibration (Process v3.2)
- Complexity Tier: TIER 3 validated (architecture breadth and integration depth).
- Calibration: Applied D-002 EPIC-003 0.17x for planning; documentation depth preserved.
- Token usage: Est. < 10K for Developer documentation steps; within 450K budget.

