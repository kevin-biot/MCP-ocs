# MCP-OCS Memory System Consolidation – Implementation Readiness Report

Date: 2025-09-10
Owner: MCP-OCS Team
Scope: Read-only analysis and implementation specification (no code changes)

## Executive Summary

- Goal: Consolidate memory architecture, ensure MCP protocol safety, remove external MCP-files dependency, and enable optional context enrichment with strict performance bounds.
- Today’s state:
  - Two parallel write paths to vector memory; no automatic read-path enrichment in orchestration (AutoMemorySystem is a no-op).
  - Path alias usage (`@/`) and a local dependency on `MCP-files/` create build/packaging fragility.
  - Logging includes emojis to stderr; a few components risk stdout logs (protocol hazard) if not guarded.
- Tomorrow’s plan emphasizes protocol safety and clean packaging first, then backend unification, and finally optional enrichment behind flags.

---

## Implementation Readiness Assessment

### Immediate Actionable Items

1) AutoMemorySystem Interface Draft (Priority 1)
- Concrete API to enable bounded, opt-in context retrieval prior to tool execution.

```ts
// types
export interface ContextSummary {
  source: 'conversation' | 'operational' | 'tool_exec';
  memoryId?: string;              // logical id or composed id
  sessionId?: string;             // if available
  timestamp?: number;             // epoch ms
  score: number;                  // normalized 0..1 relevance
  similarity?: number;            // raw vector similarity (optional)
  tags: string[];                 // normalized tag set
  snippet: string;                // short summary (<= CONTEXT_SUMMARY_BYTES)
  origin: 'json' | 'chroma';      // storage origin
}

export interface AutoMemorySystemConfig {
  mode: 'tool' | 'conversation' | 'hybrid';
  topK: number;                   // default 3
  timeoutMs: number;              // default 400
  summaryBytes: number;           // default 1500
  enable: boolean;                // gate
}

export interface AutoMemorySystem {
  initialize(): Promise<void>;
  retrieveRelevantContext(
    toolName: string,
    args: Record<string, any>,
    sessionId: string
  ): Promise<ContextSummary[]>;
}
```

- Behavior:
  - mode=tool: derive a query from `toolName` + salient `args` and filter by tags.
  - mode=conversation: prefer recent session memories (by `sessionId`) and general signals.
  - mode=hybrid: try tool-specific first, fall back to conversation if empty.
  - Hard timeout: return best-effort results or `[]` when time-budget is exceeded.

2) Configuration Schema (env flags + defaults)

- Protocol/logging:
  - `STRICT_STDIO_LOGS=true` (default): forbid stdout during server operation.
  - `MCP_LOG_VERBOSE=false` (default): gate verbose memory logs.
- Memory backend:
  - `UNIFIED_MEMORY=false` (default; enable after validation): switch both write paths to a single adapter.
  - `SHARED_MEMORY_DIR=./memory`
  - `CHROMA_HOST=127.0.0.1`
  - `CHROMA_PORT=8000`
  - `CHROMA_TENANT=default`
  - `CHROMA_DATABASE=default`
  - `MCP_OCS_FORCE_JSON=false` (force JSON-only mode regardless of Chroma availability)
- Orchestration context (Phase 6):
  - `ENABLE_ORCH_CONTEXT=false` (gate enrichment)
  - `ORCH_CONTEXT_MODE=hybrid` (tool|conversation|hybrid)
  - `CONTEXT_TOPK=3`
  - `CONTEXT_TIMEOUT_MS=400`
  - `CONTEXT_SUMMARY_BYTES=1500`

3) Beta Validation Checklist (rollback safety)

- Isolation assumptions: Do not modify `src/index.beta.ts`; leave default flags so beta uses current behavior by default.
- Steps:
  1. Start beta: `tsx src/index.beta.ts`
     - Expect stderr: `✅ MCP-ocs beta server connected and ready!`
  2. List tools via MCP client or script
     - Expect count equals `getMCPToolsByMaturity([PRODUCTION, BETA])`.
  3. Execute a safe read-only diagnostic (e.g., namespace health list)
     - Expect successful result and no stdout emission.
  4. Repeat the above after each phase change (Protocol → Unify → Enrichment) with flags left at defaults.
  5. JSON-only mode: unset Chroma env; confirm memory initializes; stats report sane values.
  6. Chroma-enabled: set `CHROMA_HOST/PORT`; confirm server remains functional.

4) Memory Schema Migration – Handling Existing Inconsistent Data (Priority 2)

- See “Schema Migration Strategy” below; high-level options:
  - Version-tolerant reads during transition.
  - Optional in-place JSON migration for local files.
  - Reindex into a new Chroma collection for v2 (non-destructive).

---

## Critical Success Factors

### Schema Migration Strategy

Question: How do we handle existing memory data with inconsistent schemas during Phase 3 unification?

Recommended approach: Version-tolerant read + optional reindex; avoid destructive edits.

- Define Schema v2 (unified):
  - Required tags: `domain:<str>`, `environment:<str>`
  - Optional tags: `severity:<low|medium|high|critical>`, `resource:<type>`, `tool:<name>`, `suite:<name>`
  - Kind marker: `kind:conversation|operational|tool_exec`
  - Context: array in JSON; comma-joined string in Chroma metadata (parse on read)
  - Envelope fields for JSON backup: `{ version: 2, ... }`
- Readers (during transition):
  - Normalize both v1/v2:
    - If arrays in metadata were serialized to strings, split on comma.
    - If tags missing mandatory items, infer from known fields (e.g., `domain`/`environment` on operational records).
    - If `kind` unknown, infer from write path or content (operational vs conversation heuristics).
- Migration options:
  1. JSON-only in-place update (fast): iterate `SHARED_MEMORY_DIR/*.json`, normalize entries to v2 and rewrite. Keep a `.bak` copy.
  2. Chroma reindex to v2 collection: read JSON backup, write to `llm_conversation_memory_v2`, then switch collection via env (`CHROMA_COLLECTION=...`). Keep v1 collection intact for rollback.
  3. Fresh start: support truncating vector collection and letting data repopulate organically; retain JSON backup for safety.
- Rollback:
  - Keep v1 reader path available for one release; switching back is a single env change (`UNIFIED_MEMORY=false`, `CHROMA_COLLECTION=v1`).

### Context Query Performance

Question: What’s the search query strategy for tool-specific context?

- Query construction (tool-first):
  - Tokens: `tool:<name>`, suite tag, resource type(s), namespace, error category (e.g., CrashLoopBackOff, ImagePullBackOff), and domain.
  - Example (oc_diagnostic_pod_health):

```ts
// logical query + filters
query = 'pod scheduling error namespace:kube-system';
filters = {
  tool: 'oc_diagnostic_pod_health',
  resource: 'pod',
  kind: 'tool_exec'
};
```

- Execution policy:
  - Use attribute filters where supported; otherwise boost via query terms.
  - Top-K default 3; cutoff by score/recency.
  - Timeout 400ms; on timeout, return partial results or empty.
  - Summarize compactly (≤ 1.5KB); prefer metadata-derived summaries to avoid dumping raw logs.
- Fallback:
  - If no results, switch to conversation mode scoped to `sessionId` or domain-level recents.

### Beta Isolation Verification

Question: How do we guarantee beta entry remains unaffected by memory backend changes?

- Environment isolation:
  - Default `UNIFIED_MEMORY=false`; do not enable in beta runs unless explicitly set.
  - Keep `MCP_OCS_FORCE_JSON=false` but supported; beta defaults to current behavior.
- Separate init path (logical):
  - Beta continues to instantiate the same `SharedMemoryManager` interface; unified backend toggled only via `UNIFIED_MEMORY`.
- Runtime detection:
  - If Chroma unavailable or `MCP_OCS_FORCE_JSON=true`, automatically operate in JSON-only mode (no behavior change for beta).
- Checklist-driven: Use the Beta Validation Checklist after each change set.

---

## Recommendations for Codex

### Priority 1: API Interface Draft (AutoMemorySystem)

- Provide the interface and types (above) and skeleton adapter that calls the unified memory search under strict timeout.
- Include a small “query builder” utility that maps toolName + args → query tokens + filters.
- Make it opt-in behind `ENABLE_ORCH_CONTEXT=true`.

### Priority 2: Migration Strategy (Schema v2 Transition)

- Implement reader normalization (v1/v2 tolerant) first.
- Add a JSON migration utility (idempotent) to upgrade local files to v2.
- Add a reindex script (optional) to populate `llm_conversation_memory_v2` from JSON backup.
- Ship with default readers that parse both schemas; enable reindex via script and env flag.

### Priority 3: Query Optimization

- Tool-specific first, conversation fallback; filters for `tool`, `suite`, `resource`, `kind`.
- Top-K=3, timeout=400ms, summary=1.5KB.
- Prefer metadata-driven summaries; redact sensitive values; count-only logs to stderr.

---

## Configuration Reference (Proposed Defaults)

- Protocol / Logging
  - `STRICT_STDIO_LOGS=true`
  - `MCP_LOG_VERBOSE=false`
- Memory Backend
  - `UNIFIED_MEMORY=false`
  - `SHARED_MEMORY_DIR=./memory`
  - `CHROMA_HOST=127.0.0.1`
  - `CHROMA_PORT=8000`
  - `CHROMA_TENANT=default`
  - `CHROMA_DATABASE=default`
  - `MCP_OCS_FORCE_JSON=false`
  - `CHROMA_COLLECTION=llm_conversation_memory` (implicit default)
- Orchestration Context
  - `ENABLE_ORCH_CONTEXT=false`
  - `ORCH_CONTEXT_MODE=hybrid`
  - `CONTEXT_TOPK=3`
  - `CONTEXT_TIMEOUT_MS=400`
  - `CONTEXT_SUMMARY_BYTES=1500`

---

## Beta Validation Checklist (Step-by-Step)

1) Start beta
- Command: `tsx src/index.beta.ts`
- Expect: connect message on stderr; no stdout.

2) List tools
- Send MCP `list_tools`; verify count equals beta maturity filter.

3) Execute safe diagnostic
- Run a read-only tool; confirm success, no stdout.

4) JSON-only scenario
- Unset `CHROMA_*`; run tool again; confirm stable behavior.

5) Chroma-enabled scenario
- Set `CHROMA_HOST/PORT`; confirm no regressions.

6) Post-change repeat
- Repeat 1–5 after Phase 1, 2, 3 changes with default flags.

---

## Day-1/Day-2 Execution Plan (High Level)

- Phase 1 (Protocol Safety): stderr-only logging, stdout audit, smoke test.
- Phase 2 (Remove MCP-files Dependency): retarget adapter to in-repo client; build verification.
- Phase 3 (Unify Backend): single adapter behind both facades; align tags/context mapping; keep flags off by default.
- Phase 4 (Import Resolution): pin alias resolution or convert to relative paths.
- Phase 5 (Validation/E2E): protocol smoke, JSON-only and Chroma-enabled checks, beta checklist.
- Phase 6 (Optional Enrichment): implement AutoMemorySystem with flags and guards.

---

## Acceptance Criteria

- No stdout during normal operation (smoke test passes).
- No imports from `MCP-files/` paths; clean builds/package.
- Unified schema v2 defined; readers handle v1/v2; optional reindex available.
- Both write paths persist via the same backend (when `UNIFIED_MEMORY=true`); consistent tags/context.
- Optional enrichment returns ≤3 summaries within ≤400ms and ≤1.5KB total text.
- Beta entry remains functional with default flags and acts as rollback.

---

## Risks and Rollback

- Risk: Adapter unification regressions
  - Mitigation: Feature-flagged; keep prior adapter path available. Beta unchanged.
- Risk: Chroma variance / connectivity
  - Mitigation: JSON-only fallback; `MCP_OCS_FORCE_JSON=true` for guaranteed offline mode.
- Risk: Protocol contamination via stdout
  - Mitigation: `STRICT_STDIO_LOGS`; audit and CI smoke test.
- Rollback: Flip `UNIFIED_MEMORY=false` and/or `ENABLE_ORCH_CONTEXT=false`; restore `CHROMA_COLLECTION=v1` if reindexed.

---

## Appendix A – Query Builder Cheatsheet

- Inputs:
  - Tool: name, suite
  - Args: namespace, resource name/type, error string/category
  - Session: sessionId (for conversation fallback)
- Tokens:
  - `tool:<name>` `suite:<name>` `resource:<type>` `domain:<x>` `environment:<x>` `kind:tool_exec`
  - Extracted error keywords: crashloop, oom, image pull, timeout, dns, tls
- Filters (if supported): tool, resource, kind, domain, environment
- Policy: topK=3, timeout=400ms, summary≤1.5KB, fallback to conversation-by-session if empty

---

## Appendix B – Reader Normalization (v1/v2)

- Tags: if string → split by comma; trim; lowercase.
- Ensure required tags: add `domain:`/`environment:` if missing (best-effort inference).
- Kind inference: `operational` if incident-like fields; else `conversation`; mark `tool_exec` when gateway path detected.
- Context: ensure array; if string, split on comma or whitespace.

---

## Appendix C – Sample Config Matrix

- Production baseline:
  - `STRICT_STDIO_LOGS=true`
  - `UNIFIED_MEMORY=false` (Step 1), then `true` after validation
  - `ENABLE_ORCH_CONTEXT=false`
- Enrichment pilot:
  - `UNIFIED_MEMORY=true`
  - `ENABLE_ORCH_CONTEXT=true`
  - `ORCH_CONTEXT_MODE=hybrid`
  - `CONTEXT_TOPK=3`, `CONTEXT_TIMEOUT_MS=400`, `CONTEXT_SUMMARY_BYTES=1500`

