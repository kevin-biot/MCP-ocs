# D-002 EPIC-004 — Testing Requirements (TIER 3)

## Acceptance Criteria
- Architecture documentation covers components, data flow, namespace isolation, and ADR alignment.
- Performance baseline includes quantitative metrics (counts, sizes) and method to measure vector/JSON latencies.
- ADR-004 namespace consistency validated across storage paths and tool registry declarations.

## Test Matrix
- Memory Writes
  - Store conversation: JSON file created under `memory/<ns>/conversations/`; when Chroma available, document added to collection; tags/context enriched.
  - Store operational: JSON file under `memory/<ns>/operational/`; Chroma document created with `operational` tag and incident metadata.
- Memory Reads
  - Vector search returns ranked results; verify re-ranking bias by phrase/session/tags; fallback JSON search returns results when Chroma is disabled.
- Namespace Isolation (ADR-004)
  - Writes in namespace A do not appear in namespace B storage trees; tool definitions carry correct `namespace` fields; query filters honor tags/domain scoping.
- Stats
  - `getStats()` exposes counts, storage used, namespace; includes Chroma availability and embedding method when enhanced.

## Test Procedures
- JSON-only Mode
  - Set `MCP_OCS_FORCE_JSON=1` and perform write/search; verify no Chroma calls; ensure files written and JSON search returns expected results.
- Chroma-enabled Mode
  - With Chroma v2 reachable, perform write/search and assert vector results; verify JSON dual-write still occurs.
- Concurrency
  - Simulate N parallel writes (10–50) and measure:
    - JSON write throughput (files/sec)
    - Average vector add latency (if enabled)
- Fallback Robustness
  - Kill or block Chroma endpoint; ensure operations continue via JSON and log only once per interval for availability errors.

## Metrics to Capture
- JSON
  - File count by type and namespace; total bytes; average file size; write throughput under load.
- Chroma
  - Embedding method and time per embedding (p50/p95); query end-to-end latency (p50/p95); add latency; result count distribution.

## Tooling Hints (existing repo)
- Bench seeds: `memory/bench-*.json` and `memory/e2e-concurrent-*.json` for replay.
- Scripts: `test-memory/`, `test-robust-chromadb.sh`, `final-chromadb-test.sh` (adapt for CI where available).

## Pass/Fail Gates
- All acceptance checks above pass across both modes.
- No cross-namespace leakage detected.
- Quantitative metrics recorded and attached to completion logs.

