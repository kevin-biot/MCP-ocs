# Review — GitHub Issue #32

Title: Post-fix: Vector collections v2, incident lifecycle, and enrichment rollout  
Date: 2025-09-11  
Reviewer: CODEX (REVIEWER role)

## Acceptance Criteria Review

1) Vector collections isolated by tenant/database/collection; no mixing with MCP-files by default
- Status: MET
- Evidence: Strategy toggle (unified via `CHROMA_COLLECTION`, separate via `CHROMA_COLLECTION_PREFIX`), eager ensure in `UnifiedMemoryAdapter.initialize()`, collections audit CLI.

2) Unified schema v2 enforced on new writes; v1/v2 tolerant readers; optional reindex script
- Status: PARTIAL
- What’s delivered:
  - Middleware + writers produce v2-style metadata (tool_exec tagging, domain/environment, bounded content).
  - Readers are tolerant; JSON fallback maintained.
- Gaps:
  - Systematic `kind:` tags on all vector writes (conversations/operational/tool_exec) not enforced everywhere.
  - No reindex script delivered in this sprint.

3) Incident lifecycle tools present and usable end-to-end
- Status: PARTIAL
- What’s delivered:
  - Existing `memory_store_operational`/search flows; RCA checklist writes operational evidence.
- Gaps:
  - Dedicated lifecycle tools (`memory_begin_incident`, `memory_append_evidence`, `memory_add_hypothesis`, `memory_publish_rca`, `memory_close_incident`) not yet implemented.

4) AutoMemorySystem enrichment active for allowlisted tools, within performance bounds, no protocol leakage
- Status: MET
- Evidence: Pre-search enrichment (allowlisted) in middleware, bounded to topK=3 and 400ms; anchors included; zero-stdout preserved.

5) Stats show both JSON and vector counts, by kind/collection
- Status: PARTIAL
- What’s delivered:
  - `memory_get_stats?detailed=true` returns totals and includes tenant/database/collections identifiers; audit CLI available.
- Gap:
  - Not yet returning per-collection counts or explicit by-kind vector counts.

## Recommendation
- Do NOT fully close Issue #32; mark completed sub-scope (instrumentation, collections toggle+ensure, enrichment pilot) and create follow-up issues for remaining items.

## Follow-up Issues Proposed

1) Incident Lifecycle Tools (End-to-End)
- Implement: `memory_begin_incident`, `memory_append_evidence`, `memory_add_hypothesis`, `memory_publish_rca`, `memory_close_incident`.
- Ensure v2 schema (`kind:operational`) and dedup hash.
- Tests and docs.

2) Schema v2 Enforcement + Reindex
- Enforce `kind:` tags (conversation/operational/tool_exec) on all writes.
- Provide reindex/migration script for existing data.
- Expand `memory_get_stats` to include by-kind and per-collection vector counts.

3) 100% Test Coverage Sprint (existing tools) — see backlog issue B-012
- Unit tests for middleware emission, vector writer, pre-search bounds, stats and audit CLI, UnifiedMemoryAdapter eager ensure.
- Diagnostic tools smoke set (cluster health, namespace health, RCA checklist, pod health) across sample namespaces.

