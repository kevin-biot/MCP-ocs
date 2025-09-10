# D-002 EPIC-004 — Developer Completion (Process v3.2)

Status: Developer phase complete; artifacts ready for TESTER.

## Scope
- Validate and document the hybrid ChromaDB + JSON memory architecture.
- Establish a quantitative baseline from current repository state and artifacts.
- Validate ADR-003 (Shared Memory) and ADR-004 (Namespace) alignment.

## System Architecture (ChromaDB + JSON Hybrid)
- SharedMemoryManager: Orchestrates persistence and recall across two storage backends, auto-enriches records with tags/context, and exposes operations for conversations and operational memories. Uses per-namespace paths under `memory/<namespace>/...`.
- JSON Fallback Storage: Primary durable store and guaranteed fallback. Structure:
  - Conversations: `memory/<namespace>/conversations/*.json`
  - Operational: `memory/<namespace>/operational/*.json`
  - Provides simple similarity via token overlap for fallback search.
- MCPFilesChromaAdapter: Bridges to the local `ChromaMemoryManager` implementation (REST v2, local embeddings with Xenova or simple hashing fallback). Accepts conversation/operational inputs and serializes metadata for Chroma compatibility.
- ChromaMemoryManager (local file: `src/lib/memory/chroma-memory-manager.ts`):
  - REST v2 usage with client-side embeddings; ensures collection and can configure server-side embeddings.
  - Embedding: Xenova all-MiniLM-L6-v2 when available; else simple hash fallback. Dimensions 384.
  - JSON backup for every write; reload utility to bulk (re)index JSON into Chroma.
- VectorMemoryManager (shim): Minimal tool-facing API to satisfy callers that expect a vector manager.
- Adapter Entry (`createOcsAdapter`): Convenience initializer for `MCPOcsMemoryAdapter` wrapper.

## Data Flow (Write)
1) Tool or workflow calls SharedMemoryManager.storeConversation/storeOperational.
2) SharedMemoryManager enriches tags/context and writes JSON to `memory/<namespace>/...`.
3) If Chroma available, MCPFilesChromaAdapter converts record to a vector document and calls ChromaMemoryManager.add via REST v2 (with embeddings).

## Data Flow (Query)
1) Search request → if Chroma available, vector query via REST v2; results are re-ranked (content phrase, session/tags boosts).
2) On failure or unavailability, fallback to JSON text similarity search on local files.

## Namespacing Model (ADR-004 alignment)
- Storage isolation via `SharedMemoryConfig.namespace`, ensuring per-namespace subtrees under `memory/`.
- Tool namespace declarations align with ADR-004 conventions (e.g., `mcp-memory`, `mcp-core`, `mcp-openshift`) in tool definitions. Memory tools include: `memory_store_operational`, `memory_search_operational`, `memory_search_conversations`, `memory_get_stats`.
- Domain tagging propagated into metadata/tags for query-time filtering.

## ADR Compliance Summary
- ADR-003 (Shared Memory):
  - Implemented by `SharedMemoryManager` with dual-write pattern (JSON always, Chroma when available), context extraction, and stats. JSON is authoritative for durability and replay; Chroma augments retrieval quality and speed.
- ADR-004 (Namespace Isolation):
  - Enforced at storage path level and respected in tool registry definitions. No cross-namespace write observed. Queries operate within the adapter/collection scope and may be filtered by tags/session/domain as required.

## Integration Points
- Tool Registry: State management tools interact with `SharedMemoryManager` for incident storage and searches.
- Workflow: Incident workflows record both operational and conversational footprints for cross-signal analysis.
- Config: `SharedMemoryConfig` controls `namespace`, `memoryDir`, Chroma host/port; `MCP_OCS_FORCE_JSON` provides a hard switch to fallback-only.

## Risks and Mitigations
- Chroma availability variance → JSON dual-write ensures durability; `reloadAllMemoriesFromJson()` provides reindexing to Chroma.
- Metadata shape drift → Adapter serializes arrays/objects into strings for Chroma metadata constraints.
- Embedding availability → Xenova optional; falls back to simple hash embeddings.

## Enhancements (Recommendations)
- Consolidate collection naming and namespace scoping in Chroma for multi-tenant stability (collection per `<namespace>_<type>`).
- Persist a lightweight secondary index for JSON search to improve fallback recall/latency (e.g., per-file token sets).
- Add read/write circuit-breakers with health probes to avoid repeated slow failover attempts.
- Extend stats: expose Chroma availability, embedding method, and recent error counts via `getStats()`.

## Evidence (Repo References)
- `src/lib/memory/shared-memory.ts`
- `src/lib/memory/mcp-files-adapter.ts`
- `src/lib/memory/chroma-memory-manager.ts`
- `src/tools/state-mgmt/index.ts`
- `memory/` contents for JSON persistence and historical benches

## Timing and Calibration
- Phase timestamps captured via CLI echoes and stored in `.process/*_epoch` files.
- Historical D-002 EPIC-003 0.17x calibration noted; architectural depth retained at TIER 3.
