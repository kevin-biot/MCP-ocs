# f-011 — Vector Collections v2 & Instrumentation Middleware — Technical Design

Source epic: sprint-management/features/epics/f-011-vector-collections-v2/README.md

Status: Draft (Phase 1 focus)
Owner: MCP‑OCS
Last updated: 2025‑09‑11

---

## 1) Goals & Non‑Goals

Goals
- Add a safe, deterministic instrumentation middleware around tool execution in the tool gateway.
- Emit dual writes: JSON analytics metrics (v2) and vector memory metadata (schema v2).
- Establish vector collections defaults and isolation strategy with strict tagging.
- Provide performance/safety bounds and redaction discipline; preserve zero‑stdout.
- Pilot on allowlisted read/diagnostic tools to validate pattern.

Non‑Goals (for this feature)
- Full incident lifecycle UX; only scaffolding and tags included here.
- Broad AutoMemorySystem enrichment; only allowlisted, bounded pre‑search in Phase 3.
- Reindex/migration tooling for legacy data; optional scripts may be added later.

---

## 2) Architecture Overview

Core Pattern
- Tool Gateway → [PRE] middleware → Tool execute → [POST] middleware → Dual write (JSON + Vector)
- Evidence anchors: execution log pointers, artifact references (04–09), optional ADR/commit anchors when available.
- Safety: input redaction, minimal structured metadata, zero‑stdout; structured logs only to stderr/files.

Primary Integration Points (existing code)
- Tool execution hook: `src/lib/tools/tool-registry.ts` → `UnifiedToolRegistry.executeTool()`
- Memory abstractions: 
  - `src/lib/tools/tool-memory-gateway.ts`
  - `src/lib/tools/tool-execution-tracker.ts`
  - `src/lib/memory/unified-memory-adapter.ts`
  - `src/lib/memory/chroma-memory-manager.ts`
- Logging/safety: `src/utils/strict-stdio.ts`, `src/lib/logging/structured-logger.ts`, `src/lib/config/feature-flags.ts`

High‑Level Flow
1) PRE middleware gathers context: tool ID, opType/mode, flags, start time, sessionId.
2) Execute tool with timeout and zero‑stdout discipline (already enforced; ensure preserved).
3) POST middleware measures latency, captures outcome and anchors, and performs dual write:
   - JSON metrics append → `analytical-artifacts/08-technical-metrics-data.json`
   - Vector write → Chroma collection(s) with v2 tags
4) Errors: still emit JSON metrics with `outcome=error` and redacted details; vector write optional.
5) Bounds and flags control enrichment pre‑search and vector path (safe defaults).

---

## 3) Middleware Architecture (Tool Gateway Integration)

Hook Point
- Wrap `UnifiedToolRegistry.executeTool()` around the actual tool `execute()` call.
- Middleware lives as a small interceptor module, imported and called from execute path.

Proposed Modules
- `src/lib/tools/instrumentation-middleware.ts`
  - `pre(toolFullName: string, args: any): PreContext`
  - `post(pre: PreContext, resultJson: string): Promise<void>`
  - `postError(pre: PreContext, error: unknown): Promise<void>`
- `src/lib/tools/metrics-writer.ts` (JSON analytics appender)
- `src/lib/tools/vector-writer.ts` (vector metadata writer via UnifiedMemoryAdapter/Chroma)

Pre Hook Responsibilities
- Normalize identifiers: `toolId`, `opType` (read|diagnostic|memory|workflow), `mode` (json|vector), `sessionId`.
- Capture active flags snapshot (e.g., `UNIFIED_MEMORY`, `MCP_LOG_VERBOSE`, enrichment flags).
- Start high‑precision timer.
- For Phase 3: optionally run vector pre‑search (allowlist; topK=3; timeout 400ms; fallback empty). Disabled in Phase 1.

Post Hook Responsibilities
- Compute `elapsedMs`; derive `outcome = ok|error`.
- Create evidence anchors (bounded):
  - `logs/sprint-execution.log` line/time window references if available
  - artifact pointers (04–09 series under sprint archives when present)
  - optional ADR identifiers if mentioned in execution context
- Dual write:
  - JSON metrics append (schema v2)
  - Vector add with schema v2 tags, redacted summary ≤ 1.5KB

Redaction & Discipline
- Strip/obfuscate sensitive input fields; store only keys and coarse values where needed.
- Do not store raw tool stdout; store summarized metadata and tags.
- Log to stderr only, using structured logger; no protocol leakage to stdout.

---

## 4) Schema v2 Specifications

4.1 JSON Analytics Metrics (v2)
- Path: `analytical-artifacts/08-technical-metrics-data.json` (appended; created if missing)
- Record fields:
  - `toolId: string` — tool full name (e.g., `oc_read_get_pods`)
  - `opType: string` — one of `read|diagnostic|memory|workflow|other`
  - `mode: string` — `json` when vector disabled/fallback; `vector` when vector path active
  - `elapsedMs: number`
  - `outcome: 'ok'|'error'`
  - `errorSummary: string|null` — redacted on error; null on success
  - `cleanupCheck: boolean` — whether post‑exec cleanup/guards passed
  - `anchors: string[]` — file/line refs, artifact IDs, ADR refs, commit short hashes when available
  - `timestamp: string` — ISO8601
  - `sessionId: string`
  - `flags: Record<string, boolean|string|number>` — snapshot of relevant feature flags (bounded)
  - `vector: { tenant?: string; database?: string; collection?: string }` — identifiers when vector write attempted

Redaction Rules
- Inputs are not stored verbatim; only selected safe keys or hashes.
- Errors are summarized to a short message, with stack/PII stripped.

4.2 Vector Metadata (v2)
- Storage: ChromaDB collections via `ChromaMemoryManager`/`UnifiedMemoryAdapter`
- Required tags (serialized to Chroma metadata as strings):
  - `kind:<conversation|operational|tool_exec>`
  - `domain:<...>`
  - `environment:<dev|test|staging|prod>`
- Optional tags:
  - `tool:<name>` `suite:<name>` `resource:<type>` `severity:<low|medium|high|critical>`
- IDs: `<kind>_<sessionOrIncident>_<timestamp>`
- Arrays: stored as arrays in JSON and comma‑joined strings in Chroma `metadata`; rehydrate on read.
- Content: summary document synthesized from redacted inputs and outcomes; size ≤ 1.5KB.

Phase Strategy for Collections
- Phase 1: single unified collection with strict `kind:` filtering in tags.
- Phase 2: option to isolate into per‑kind collections (`conversations`, `operational`, `tool_exec`).

---

## 5) Collections, Isolation, and Env Configuration

Defaults (configurable)
- `CHROMA_TENANT=mcp-ocs`
- `CHROMA_DATABASE=prod`
- Strategy toggle (Phase 2 ready):
  - Separate collections (default): `CHROMA_COLLECTION_PREFIX=mcp-ocs-`
    - conversations → `${prefix}conversations`
    - operational → `${prefix}operational`
    - tool_exec → `${prefix}tool_exec`
  - Unified collection: set `CHROMA_COLLECTION=<name>` to store/search all kinds in a single collection (tags carry `kind:`)

Isolation Rules
- No mixing with MCP‑files by default; vector paths are tenant/database isolated.
- Separate strategy keeps `mcp-ocs-` prefix guard; audit CLI checks for unprefixed collections.
- Unified strategy uses a single `CHROMA_COLLECTION` with strict `kind:` tagging.

Stats & Visibility
- `memory_get_stats?detailed=true` returns totals and includes tenant/database/collections identifiers.
- `memory:collections:audit` CLI reports strategy, expected/present/missing and isolation status.

---

## 6) Implementation Plan (Concrete Integration Points)

Milestone A — Middleware & Metrics (Phase 1)
1) Add middleware module: `src/lib/tools/instrumentation-middleware.ts`
   - Define `pre/post/postError` APIs.
   - Collect flags, timestamps, and normalize `opType`, `sessionId`.
   - Keep pre‑search stubbed (disabled by default; feature flag for Phase 3).
2) Wire `UnifiedToolRegistry.executeTool()` (src/lib/tools/tool-registry.ts)
   - Call `pre()` before timeout‑wrapped execute.
   - On success, call `post()` with result JSON.
   - On error, call `postError()` and still return a JSON error payload.
3) JSON metrics writer: `src/lib/tools/metrics-writer.ts`
   - Append schema‑v2 entries to `analytical-artifacts/08-technical-metrics-data.json`.
   - Ensure directory exists; atomic write (append with tmp+rename) to avoid corruption.
4) Vector writer: `src/lib/tools/vector-writer.ts`
   - Use `UnifiedMemoryAdapter` → `ChromaMemoryManager` to store vector documents with v2 tags and redacted summary.
   - Respect env: `MCP_OCS_FORCE_JSON` disables vector path; record `mode=json` in metrics.
5) Evidence anchors helper: `src/lib/tools/evidence-anchors.ts`
   - Provide bounded anchors: log references, artifact refs (04–09 under sprint archive), optional ADR refs.
6) Feature flags & config: extend `src/lib/config/feature-flags.ts`
   - `ENABLE_INSTRUMENTATION=true` (default true)
   - `ENABLE_VECTOR_WRITES=true` (default true; auto‑fallback if Chroma unavailable)
   - `ENABLE_PRESEARCH=false` (Phase 3)
   - Allowlist env `INSTRUMENT_ALLOWLIST` (CSV of full tool names)
7) Unit tests (Phase 1 scope)
   - Middleware emits schema‑valid metrics for success/error.
   - Vector writer no‑ops cleanly when disabled or Chroma unavailable.
   - Redaction applied; zero‑stdout maintained.

Milestone B — Collections & Stats (Phase 2)
1) Collections isolation
   - Add `tool_exec` stream to `UnifiedMemoryAdapter` or a dedicated collection with prefix mapping.
   - Env switch: `CHROMA_COLLECTION` to force unified collection or `CHROMA_COLLECTION_PREFIX` per‑kind collections.
2) Stats tool
   - Implement `memory_get_stats?detailed=true` using `UnifiedMemoryAdapter.getStats()` plus Chroma collection counts.
3) Incident lifecycle scaffolding
   - Define API shims for: `memory_begin_incident`, `memory_append_evidence`, `memory_add_hypothesis`, `memory_publish_rca`, `memory_close_incident`.
   - Ensure tags apply `kind:operational` with normalized fields; dedup hash on evidence.
4) Tests & docs
   - Validate per‑kind collection writes and filters; ensure reader tolerance.

Milestone C — Pre‑Search Enrichment (Phase 3)
1) Enable allowlisted tools for pre‑search
   - Bounds: `topK=3`, `timeout=400ms`, summary ≤ 1.5KB
   - Log only counts/timing to stderr; fallback empty on any failure.
2) Expand pilot and document guidance
   - Ensure no protocol leakage; keep enrichment optional and bounded.

---

## 7) Safety Constraints & Performance Bounds

Safety
- No PII stored; redact inputs and summarize results.
- Zero‑stdout discipline preserved for all middleware logging and writers.
- Structured logs to stderr or file; metrics append is atomic and quiet.
- Vector path kill‑switch: `MCP_OCS_FORCE_JSON`.

Performance
- Middleware overhead target: < 5ms (excluding storage I/O).
- Pre‑search (Phase 3) time budget: ≤ 400ms with hard timeout and early cancel.
- Vector summary size limit: ≤ 1.5KB per document.
- JSON metrics append cost: amortized O(1); rotate if file grows beyond 5MB (future).

Failure Handling
- If vector write fails, still return success if JSON append succeeds; record `mode=json` and error summary.
- If JSON append fails, log to stderr and continue; do not block tool responses.

---

## 8) Phase 1 Pilot — Tool Instrumentation

Allowlist (initial)
- `oc_read_get_pods`
- `oc_read_describe`
- `cluster_health` (diagnostic suite)

Pilot Rules
- PRE‑search disabled in Phase 1; POST dual write enabled.
- Vector metadata `kind:tool_exec`, `domain:openshift`, `environment:prod` (configurable per tool context).
- Anchors include `logs/sprint-execution.log` pointer (if present) and any `artifacts/...` generated.

Acceptance (Phase 1)
- JSON metrics and vector writes emitted for allowlisted tools, schema‑valid.
- Error paths covered (postError metrics + optional vector write).
- Readers tolerant of v1/v2; daily snapshot appended to metrics file.

---

## 9) Open Questions & Decisions

Collections Partitioning
- Phase 1 unified with strict `kind:` tags vs. Phase 2 per‑kind collections — confirm timing and env defaults.

Evidence Anchors
- Minimal set now (log line refs, artifacts 04–09); ADR/commit anchors optional — confirm scope.

Flags Defaults
- `ENABLE_INSTRUMENTATION=true`, `ENABLE_VECTOR_WRITES=true`, `ENABLE_PRESEARCH=false` — confirm.

Pilot Expansion
- After initial 2–3 tools, expand to all diagnostic read‑ops in Phase 2.

---

## 10) Test Plan (Phase 1)

Unit
- Middleware success/error paths emit schema‑valid JSON metrics; redaction verified.
- Vector writer behaves under `MCP_OCS_FORCE_JSON` and when Chroma unreachable.

Integration
- Execute allowlisted tools and validate:
  - Metrics file appended with expected fields and anchors.
  - Chroma collections receive entries with correct tags and bounded content.

Observability
- `memory_get_stats?detailed=true` (Phase 2) to report vector and JSON counts by kind/collection.

---

## 11) Implementation Notes & References

Relevant Code
- `src/lib/tools/tool-registry.ts` — central execute hook for middleware
- `src/lib/tools/tool-memory-gateway.ts` — existing tool→memory storage pattern
- `src/lib/tools/tool-execution-tracker.ts` — execution records; can be aligned with metrics
- `src/lib/memory/unified-memory-adapter.ts` — vector write facade
- `src/lib/memory/chroma-memory-manager.ts` — Chroma REST client & JSON fallback

References
- Epic: f-011 Vector Collections v2 (this directory)
- Readiness report: docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md
- Enrichment pilot design: docs/reports/technical/memory-enrichment-pilot-design-2025-09-10.md
