# D-002 EPIC-004 — Validation Evidence (Process v3.2)

## Evidence Index
- Files inspected: `src/lib/memory/` (shared-memory.ts, mcp-files-adapter.ts, mcp-files-memory-extension.ts, chromadb-client-fixed.ts)
- Tool registry: `src/tools/state-mgmt/index.ts`
- Completion logs: developer, testing requirements, performance metrics
- JSON persistence: `memory/` directory counts and sizes

## Architecture (TASK-004-A)
- Presence of components:
  - `SharedMemoryManager` orchestrates JSON + Chroma flows: found in `shared-memory.ts`.
  - MCPFiles adapter and Chroma memory manager present and referenced.
- Hybrid patterns:
  - JSON dual-write documented and implemented (`storeConversation`/`storeOperational` + adapter `addDocuments`).
  - Fallback search path implemented in MCP-files memory extension when Chroma unavailable.
- ADR-003 references present in header comments of `shared-memory.ts` and behavior matches description.

## Performance (TASK-004-B)
- Quantitative baseline captured from repo state:
  - JSON files: 2,385; total size ~13 MB; `memory/default` ~1,572 files.
  - Bench seeds (`bench-*.json`, `e2e-concurrent-*.json`) present for replay.
- Methodology documented for measuring embedding latency (Xenova/hash), add/query, and fallback JSON search.

## ADR-004 Namespace (TASK-004-C)
- Storage isolation:
  - Paths under `memory/<namespace>/...` referenced by `SharedMemoryConfig.namespace` and used by JSON fallback.
- Tool namespaces:
  - `src/tools/state-mgmt/index.ts` uses `namespace: 'mcp-memory'` and `namespace: 'mcp-core'` per ADR-004 patterns.
- Access patterns:
  - Adapter and manager operate within configured memoryDir/namespace; no cross-namespace writes detected in code paths.

