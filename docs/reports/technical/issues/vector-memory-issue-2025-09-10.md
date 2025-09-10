Title: Vector memory issue — collection strategy, schema v2, and orchestration enrichment

Summary
- Consolidate vector memory architecture, improve collection/partitioning, align schema, and add optional, bounded context enrichment to improve diagnostic relevance while preserving MCP protocol safety and clean packaging.

Current State
- Single logical collection (`llm_conversation_memory`) stores mixed kinds: conversations, operational incidents, and tool executions.
- Dual adapters write with slightly different tag shapes; orchestration does not read context (no-op AutoMemorySystem).
- JSON fallback is always written; Chroma REST v2 used when available. Some logging risks to stdout identified.

Problems
- Retrieval noise: mixed kinds in one collection without strong partitioning.
- Inconsistent tags/schema between write paths; arrays serialized to strings inconsistently.
- No automatic context enrichment prior to tool execution; missed reuse of prior incidents.
- Potential protocol risk if memory client logs to stdout; external repo dependency complicates builds.

Recommendations
- Collection strategy:
  - Prefer separate collections per kind or enforce `kind:` partition strictly: `conversation`, `operational`, `tool_exec`.
  - If single collection retained, require `kind:` tag and filter by it on all reads.
- Unified schema (v2):
  - Required tags: `kind:<conversation|operational|tool_exec>`, `domain:<...>`, `environment:<...>`.
  - Optional tags: `tool:<name>`, `suite:<name>`, `resource:<type>`, `severity:<low|medium|high|critical>`.
  - Context array in JSON; comma-joined in Chroma metadata (parse on read). IDs: `<kind>_<sessionOrIncident>_<timestamp>`.
- Write discipline:
  - Cap stored document size (≤2–4 KB), prefer summaries; redact secrets/PII; keep rich details in JSON backup.
  - Dedup via hash of salient fields to avoid noisy duplicates for quick retries.
- Search strategy (tool-first):
  - Build queries from tool + args (namespace, resource, error class), add filters on `kind`, `tool`, `resource`, `domain`, `environment`.
  - Bounds: `topK=3`, timeout 400ms, summary ≤1.5KB; fall back to session conversation context if empty.
- Retention & hygiene:
  - Add TTL/purge job for vector store matching JSON cleanup; keep JSON as source of truth.
- Consolidation & packaging:
  - Remove external `MCP-files` import; use in-repo client with stderr-only logging.

Acceptance Criteria
- No stdout during normal operation (protocol smoke test passes).
- No external `MCP-files/` path usage; clean builds/package.
- Unified schema v2 defined; readers handle v1/v2; optional reindex available.
- With unified backend enabled: consistent tags across all writes; searches filter by `kind` and return unified shapes.
- Optional enrichment delivers ≤3 summaries within ≤400ms and ≤1.5KB text; safe fallback to empty.

Schema Migration Strategy
- Version-tolerant readers: normalize v1/v2 tags, split serialized arrays, infer missing `kind`, `domain`, `environment` where possible.
- Non-destructive options:
  1) JSON in-place normalization to v2 (with `.bak` kept).
  2) Chroma reindex into `..._v2` collection from JSON backup; switch via `CHROMA_COLLECTION`.
  3) Fresh start for vectors while keeping JSON backup.
- Rollback: keep v1 readers for one release; flip env to revert.

Orchestration Context (AutoMemorySystem)
- Interface:
  - `retrieveRelevantContext(toolName, args, sessionId) → Promise<ContextSummary[]>`.
  - Config flags: `ENABLE_ORCH_CONTEXT=false`, `ORCH_CONTEXT_MODE=hybrid`, `CONTEXT_TOPK=3`, `CONTEXT_TIMEOUT_MS=400`, `CONTEXT_SUMMARY_BYTES=1500`.
- Mode: tool-specific first, conversation fallback; count-only logs to stderr.

Performance Guards
- Timeout: 400ms per retrieval.
- TopK: 3 results.
- Summary budget: 1.5KB text (or 250–400 tokens).
- On timeout/failure: proceed with zero context, no retries in critical path.

Risks & Mitigations
- Adapter unification regressions → feature-flagged rollout; beta entry unchanged.
- Chroma availability variance → JSON-only fallback; `MCP_OCS_FORCE_JSON` supported.
- Protocol risks → stderr-only logging; smoke test in CI.

Tracking & Next Steps
- Phases (separate PRs):
  1) Protocol safety (stderr-only logs, smoke test).
  2) Remove external dependency; retarget adapter.
  3) Unify backend; align schema; enable via `UNIFIED_MEMORY` flag.
  4) Import resolution hardening.
  5) Validation/E2E.
  6) Optional enrichment behind flags.

References
- Report: `docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md`
- TODO: `docs/reports/technical/mcp-ocs-memory-system-consolidation-todo-2025-09-10.md`

