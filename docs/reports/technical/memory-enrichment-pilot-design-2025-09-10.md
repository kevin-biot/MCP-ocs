# Memory Enrichment Pilot – oc_diagnostic_pod_health

Date: 2025-09-10
Owner: MCP-OCS Team
Scope: Pilot design to enable bounded vector-memory enrichment for a single tool. No code changes in this doc.

## Goal
Add optional, low-latency context enrichment before executing one diagnostic tool, then template for broader rollout.

## Pilot Target
- Tool: `oc_diagnostic_pod_health` (Diagnostics suite)
- Entry points: `src/index.ts`, `src/index-sequential.ts`
- Default: OFF. Enable via flags for controlled trials.

## Flags (proposed defaults)
- `ENABLE_ORCH_CONTEXT=false`
- `MEM_CTX_TOOLS=oc_diagnostic_pod_health` (comma-separated allowlist)
- `ORCH_CONTEXT_MODE=hybrid` (tool|conversation|hybrid)
- `CONTEXT_TOPK=3`
- `CONTEXT_TIMEOUT_MS=400`
- `CONTEXT_SUMMARY_BYTES=1500`

## Hook Point
- Location: right before `toolRegistry.executeTool(name, args)` in both entry points.
- Behavior (pseudocode):
  1) If `ENABLE_ORCH_CONTEXT` && `name in MEM_CTX_TOOLS`
  2) Build query tokens from tool + args
  3) `ctx = AutoMemorySystem.retrieveRelevantContext(name, args, sessionId)` with timeout
  4) Inject into args as `memoryContext` (tool may ignore if unknown)
  5) stderr log only: `Found N relevant memories`

## AutoMemorySystem API (from readiness report)
```ts
export interface ContextSummary {
  source: 'conversation' | 'operational' | 'tool_exec';
  memoryId?: string;
  sessionId?: string;
  timestamp?: number;
  score: number;
  similarity?: number;
  tags: string[];
  snippet: string;
  origin: 'json' | 'chroma';
}

export interface AutoMemorySystemConfig {
  mode: 'tool' | 'conversation' | 'hybrid';
  topK: number; timeoutMs: number; summaryBytes: number; enable: boolean;
}

export interface AutoMemorySystem {
  initialize(): Promise<void>;
  retrieveRelevantContext(toolName: string, args: Record<string, any>, sessionId: string): Promise<ContextSummary[]>;
}
```

## Query Strategy (tool-first)
- Tokens:
  - `tool:oc_diagnostic_pod_health`
  - `resource:pod`
  - `namespace:<ns if provided>`
  - Error hints from args (e.g., scheduling/crashloop/image/timeouts)
  - `domain:openshift`, `kind:tool_exec|operational`
- Fallback: If no hits, conversation mode scoped by `sessionId`.

## Packaging to Tool (non-breaking)
- Inject into args:
```ts
memoryContext: {
  summary: string;              // <= CONTEXT_SUMMARY_BYTES
  items: Array<{ score: number; tags: string[]; snippet: string }>
}
```
- Tool uses it for reasoning hints; output schema unchanged.

## Safety & Protocol
- No stdout. Only stderr logs: count-only (“Found N relevant memories”).
- Redaction: Summaries are metadata-derived; no raw secrets/logs.
- Degrade: On timeout/failure → omit `memoryContext` and proceed.

## Metrics & Storage
- After execution, tag tool-exec memory via `ToolMemoryGateway`:
  - `mem_ctx:used|not_used`, `mem_ctx:count:N`
- Optional: record latency bucket in tags (e.g., `mem_ctx:latency:<ms>` rounded).

## Validation Plan
- JSON-only and Chroma-enabled runs
- Measure enrichment latency (< 400ms), confirm tool outputs unchanged
- Protocol smoke: zero stdout
- Manual spot-check that context items match expected past incidents

## Acceptance Criteria
- With flags ON, the tool receives ≤3 context items within ≤400ms and ≤1.5KB; stderr shows count-only
- With flags OFF, behavior identical to today
- No stdout during normal operation; no output schema changes

## Rollout Plan
- Phase A (pilot): Apply to `oc_diagnostic_pod_health` only
- Phase B (backlog): Extend to namespace health (v2), RCA checklist, selected read-ops
- Generalize query builder: add `suite`, `resource`, `domain`, error classifiers
- Align with unified schema v2 and collection partitioning

## Tasks (Day-1 ready)
- Implement `AutoMemorySystem` skeleton + timeout wrapper
- Add query builder for `oc_diagnostic_pod_health`
- Wire entry points (flagged) to inject `memoryContext`
- Update `ToolMemoryGateway` tagging post-exec
- Validate with smoke tests and measure latency

