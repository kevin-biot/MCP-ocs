# Vector Patterns v2 — Collections, Schema, Enrichment, Stats

Date: 2025-09-11
Owner: CODEX
Status: Adopted (ties to issues #38, #37)

## Goals
- Consistent, production‑grade vector behavior across all tools
- Clear collection strategy (unified vs separate) with eager ensure and isolation
- Enforced schema v2 (kind:, normalized tags) on all new writes
- Predictable write/search patterns (tool_exec, operational, conversations)
- Bounded enrichment (allowlist, ≤400ms, anchors ≤10)
- Visible stats (by‑kind and per‑collection) + reindex strategy and dedup safety

## ADR Anchors
- ADR‑027: Collection Strategy & Isolation
- ADR‑026: Analytics Schema v2 Design
- ADR‑028: Pre‑search Enrichment Bounds
- ADR‑003: Memory Storage & Retrieval Patterns

## Collections Strategy
- Separate (default):
  - `CHROMA_COLLECTION_PREFIX=mcp-ocs-`
  - Collections: `${prefix}conversations`, `${prefix}operational`, `${prefix}tool_exec`
  - Eager ensure at startup; audit CLI verifies isolation
- Unified:
  - `CHROMA_COLLECTION=<name>` (all kinds stored together)
  - Strict `kind:` tagging; filters required on search
- Both strategies:
  - Eager ensure (resolve IDs via tenant and root endpoints)
  - No mixing with MCP files; JSON fallback always available

## Schema v2 Enforcement
- Required metadata on vector writes:
  - `kind:` one of `conversation|operational|tool_exec`
  - `domain:` e.g., `openshift|mcp-ocs`
  - `environment:` `dev|test|staging|prod`
  - Optional: `tool:`, `suite:`, `severity:`
- Arrays stored as arrays in JSON, comma‑joined in Chroma metadata; rehydrate on read
- Size bound: summary ≤1.5KB

## Write Patterns
- tool_exec (middleware and vector‑writer)
  - Tags: `kind:tool_exec`, `tool:<name>`, domain/env/severity
  - Evidence: argsSummary (redacted), resultSummary (bounded)
- operational (lifecycle tools)
  - Tags: `kind:operational`, domain/env; dedupHash of evidence
  - Incident lifecycle: begin/append/hypothesis/publish/close (issue #37)
- conversations
  - Tags: `kind:conversation`, domain
  - Stored for knowledge recall; filtered out of operational views

## Search Patterns
- Respect `kind:` filters; `topK` bounded per use case
- Prefer tenant/database endpoints; fallback to root
- JSON fallback on any vector failure (non‑fatal)

## Enrichment (Pre‑Search)
- Allowlist gated; disabled by default; enable via `ENABLE_PRESEARCH=true`
- Bounds: `topK=3`, `timeout=400ms` (race), anchors `presearch:hits=<n>;ms=<ms>`
- No stdout; record only minimal metadata; never blocks tool execution

## Stats & Reindex
- memory_get_stats(detailed): show tenant/database and collection identifiers
- Extend to by‑kind/per‑collection counts (issue #38)
- Reindex script (dry‑run → apply): JSON→Chroma; idempotent

## Dedup
- Use stable JSON serialization + SHA‑256 for evidence
- Attach dedup hash to operational writes; skip or update on match

## Acceptance
- All writes carry enforced `kind:` and normalized tags
- Enrichment bounded and allowlisted
- Stats expose by‑kind/per‑collection counts
- Reindex dry‑run produces plan; apply is idempotent

