# Backlog B-012 — 100% Coverage Sprint (Existing Tools)

Date: 2025-09-11  
Owner: CODEX  
Status: Proposed

## Goal
Achieve near-100% test coverage for existing tool surfaces and new middleware/collections code introduced in f-011, with focus on safety and deterministic behavior.

## Scope
- Middleware & Writers
  - Instrumentation pre/post/error hooks (metrics records on ok/error; redaction)
  - Vector writer best-effort behavior (JSON fallback)
  - Pre-search bounds (topK=3, timeout=400ms)
- Collections & Stats
  - UnifiedMemoryAdapter.initialize eager ensure (unified/separate)
  - memory_get_stats(detailed) identifiers and content
  - memory:collections:audit CLI outputs (strategy/expected/present/missing/isolation)
- Diagnostic Tools (smoke)
  - oc_diagnostic_cluster_health
  - oc_diagnostic_namespace_health (sample namespaces)
  - oc_diagnostic_rca_checklist
  - oc_diagnostic_pod_health (basic path)
- Read Ops
  - oc_read_get_pods (single & multi-ns paths)
  - oc_read_logs, oc_read_describe (sanity + error path)

## Acceptance Criteria
- 95–100% coverage in target directories:
  - src/lib/tools/instrumentation-middleware.ts
  - src/lib/tools/metrics-writer.ts
  - src/lib/tools/vector-writer.ts
  - src/lib/memory/unified-memory-adapter.ts
  - src/tools/state-mgmt/index.ts (stats path)
  - src/cli/memory-audit.ts
- Tests include both success and error paths; pre-search boundedness validated.
- Safety checks asserted (no stdout, D-009 timestamps in new paths).

## Implementation Notes
- Use Jest unit tests for pure modules; light integration with mocked Chroma endpoints for vector path.
- Add environment-driven test harness to toggle unified/separate strategies.
- Do not introduce network dependency beyond localhost Chroma (mock if not available).

## Out of Scope
- New incident lifecycle tools (tracked separately).
- Schema reindex tooling (separate backlog item).

