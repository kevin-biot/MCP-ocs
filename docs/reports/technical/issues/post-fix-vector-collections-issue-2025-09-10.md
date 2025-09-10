Title: Post-fix: Vector collections v2, incident lifecycle, and enrichment rollout

Type: enhancement
Labels: enhancement, vector-memory, collections, orchestration, post-fix

Summary
Build on the MCP-OCS foundation refactor to introduce production-grade vector collections, structured incident lifecycle, and controlled AutoMemorySystem enrichment.

Blocked by
- #31 Vector memory issue — collection strategy, schema v2, and orchestration enrichment (recommendations and base readiness)
- Foundation phases: Protocol safety, remove external dependency, unify backend, import hardening, validation (see readiness report)

Scope
1) Collections & Isolation
- Defaults: `CHROMA_TENANT=mcp-ocs`, `CHROMA_DATABASE=prod`, `CHROMA_COLLECTION=ocs_memory_v2` (configurable)
- Partitioning: either separate collections (conversations/operational/tool_exec) or single unified with mandatory `kind:` tag and strict filters

2) Schema v2 (unified)
- Required tags: `kind:<conversation|operational|tool_exec>`, `domain:<...>`, `environment:<...>`
- Optional tags: `tool:<name>`, `suite:<name>`, `resource:<type>`, `severity:<level>`
- IDs: `<kind>_<sessionOrIncident>_<timestamp>`; arrays stored as arrays in JSON and comma-joined in Chroma metadata (rehydrate on read)

3) Incident Lifecycle Tools
- `memory_begin_incident`, `memory_append_evidence`, `memory_add_hypothesis`, `memory_publish_rca`, `memory_close_incident`
- Diagnostics/Read-ops tools write `tool_exec` evidence with normalized fields and dedup hash

4) AutoMemorySystem Rollout (flagged)
- Start with `oc_diagnostic_pod_health` allowlist → then namespace health, RCA checklist, select read-ops
- Bounds: topK=3, timeout=400ms, summary≤1.5KB; stderr count-only logs; fallback to empty

5) Stats & Visibility
- `memory_get_stats?detailed=true` returns vector totals and by-kind/collection counts plus tenant/database/collection identifiers

Acceptance Criteria
- Vector collections isolated by tenant/database/collection; no mixing with MCP-files by default
- Unified schema v2 enforced on new writes; v1/v2 tolerant readers; optional reindex script available
- Incident lifecycle tools present and usable end-to-end; evidence written on tool execs
- AutoMemorySystem enrichment active for allowlisted tools, within performance bounds, no protocol leakage
- Stats show both JSON and vector counts, by kind/collection

References
- Readiness report: docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md
- Enrichment pilot: docs/reports/technical/memory-enrichment-pilot-design-2025-09-10.md
- Vector memory base issue: docs/reports/technical/issues/vector-memory-issue-2025-09-10.md

