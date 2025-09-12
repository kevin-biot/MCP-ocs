# GitHub Issues – F-012 Reliability Follow-ups (Bugfix Sprint)

Repo: MCP-ocs
Date: 2025-09-12

## Issue 1 — P0: Centralize Session ID Management
Command:
- gh issue create \
  -t "P0: Centralize Session ID Management" \
  -b @- \
  -l "P0,reliability,D-009"
Body:
```
Summary: Create a single session ID generator and enforce it registry-wide. Remove ad-hoc defaults (e.g., read-${Date.now()}).

Changes:
- Add src/utils/session.ts: createSessionId(seed?) using nowEpoch() + short random suffix (policy-compliant).
- src/lib/tools/tool-registry.ts (executeTool): inject sessionId when missing via createSessionId().
- src/tools/read-ops/index.ts: remove Date.now() fallback; rely on registry injection or createSessionId().

Acceptance:
- No Date.now() used for session IDs; all calls have valid sessionId by default.
- Unit test: missing sessionId → auto-generated format sess-<epoch>-<short>.

Refs: D‑009 time policy; instrumentation middleware already supports sessionId propagation.
```

## Issue 2 — P0: Implement Global Tool Execution Cap
Command:
- gh issue create \
  -t "P0: Implement Global Tool Execution Cap" \
  -b @- \
  -l "P0,reliability,circuit-breaker"
Body:
```
Summary: Prevent runaway execution with a per-request hard cap (e.g., TOOL_MAX_EXEC_PER_REQUEST=10).

Changes:
- src/lib/tools/tool-registry.ts: maintain per-request counter in execution context; abort after N tools with a structured error; call postInstrumentError; include reason “global_cap_exceeded”.
- Optional: env var override TOOL_MAX_EXEC_PER_REQUEST.

Acceptance:
- Unit test: executing > cap tools returns error and stops further calls; postInstrumentError invoked.
```

## Issue 3 — P0: Universal Placeholder Validation
Command:
- gh issue create \
  -t "P0: Universal Placeholder Validation" \
  -b @- \
  -l "P0,safety,validation"
Body:
```
Summary: Block tool execution if critical params contain unresolved placeholders (e.g., "<backendPod>").

Changes:
- Add src/lib/tools/tool-args-validator.ts: detect placeholders /^<[^>]+>$/ for resource/pod names.
- src/lib/tools/tool-registry.ts (pre-exec): run validation; on unresolved placeholder, return structured error + guidance; do not call tool.

Acceptance:
- Unit test: oc_read_describe with name "<pod>" fails fast, returns guidance; postInstrumentError called.

Refs: Template path has best-effort resolver; this adds a universal safety net.
```

## Issue 4 — P1: Normalize Mode Defaults
Command:
- gh issue create \
  -t "P1: Normalize Mode Defaults (boundedMultiStep)" \
  -b @- \
  -l "P1,consistency,orchestrator"
Body:
```
Summary: Default to boundedMultiStep with stepBudget=2 unless explicitly overridden by trusted callers.

Changes:
- src/lib/tools/sequential-thinking-with-memory.ts: handleUserRequest defaults → boundedMultiStep + stepBudget=2 when not specified.
- src/index.ts (CallToolRequest): apply safe defaults for template engine path unless provided.

Acceptance:
- Unit test: unspecified mode executes ≤2 steps; planOnly/firstStepOnly unchanged.
```

## Issue 5 — P1: D‑009 Compliance Cleanup (time)
Command:
- gh issue create \
  -t "P1: D‑009 Compliance Cleanup (time helpers)" \
  -b @- \
  -l "P1,policy,D-009"
Body:
```
Summary: Replace Date.now()/new Date().toISOString() in business logic with nowEpoch()/nowIso().

Changes:
- Sweep hotspots: read-ops, orchestrator, and tool logic; keep display-only prints if necessary.

Acceptance:
- Code search shows no Date.now()/toISOString() in logic paths (exceptions documented).
```

Notes:
- Link to F‑012 execution log and tie-ins to #38 (schema v2/reindex/stats readiness) if desired.

