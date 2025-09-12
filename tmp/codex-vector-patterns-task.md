# CODEX Task — Vector Patterns Consolidation (Collections | Schema v2 | Enrichment)

Date: 2025-09-11
Owner: CODEX
Status: Ready to execute (aligned with #38, #37 follow‑ups)

## Objective
Define and codify standard vector patterns across the stack so all tools follow consistent, production‑grade behaviors:
- Collections strategy (unified vs separate) with eager ensure and isolation
- Schema v2 enforcement (kind: conversation|operational|tool_exec + normalized tags)
- Write/search patterns (tool_exec evidence, operational incidents, conversations)
- Pre‑search enrichment (bounds, allowlist, anchors)
- Stats visibility (by‑kind, per‑collection), reindexing, and dedup

## ADR Anchors
- ADR‑027: Collection Strategy & Isolation
- ADR‑026: Analytics Schema v2 Design
- ADR‑028: Pre‑search Enrichment Bounds
- ADR‑003: Memory Storage & Retrieval Patterns

## Scope (in this task)
- Finalize patterns and publish as living spec (1 doc + examples)
- Map patterns to concrete code changes (ties into #38, #37)
- Provide minimal helpers (tag enforcement, kind coercion, dedup hash util)

## Deliverables
1) Vector Patterns Spec (MD)
   - Collections: unified/separate, env toggles, eager ensure
   - Schema v2: required/optional metadata + kind tag rules
   - Write paths: tool_exec (middleware), operational (lifecycle), conversations
   - Search patterns: by kind, filters, fallbacks, bounds
   - Enrichment: allowlist, latency/timeouts, anchors format
   - Stats: by‑kind/per‑collection definitions
   - Reindex strategy: JSON→Chroma, idempotent, safety guards
2) Helpers + Stubs (TS)
   - tagEnforcer(kind, domain, environment, severity)
   - dedupHash(payload) for evidence
   - collectionResolver(unified|separate) w/ eager ensure
3) Acceptance matrix linking ADRs → code paths

## Implementation Plan
- Docs
  - Add: `docs/architecture/vector-patterns.v2.md` (new)
  - Update: f‑011 technical design with brief pointer
- Code
  - Tag enforcement injected at vector‑writer and unified adapter write boundaries
  - Stats expansion: per‑collection + by‑kind breakdown (ties to #38)
  - Reindex script skeleton: `scripts/memory/reindex-v2.mjs` (JSON→Chroma, dry‑run)
  - Dedup hash util under `src/lib/memory/utils/dedup.ts`
- Tests
  - Tag enforcement unit tests
  - Stats by‑kind/per‑collection unit tests (mocked)
  - Reindex dry‑run unit test (parses JSON only)

## Acceptance Criteria
- Spec published with clear examples and ADR references
- New writes include enforced `kind:` tag; readers tolerant
- Stats endpoint(s) expose by‑kind/per‑collection counts (mock acceptable)
- Reindex script dry‑run generates plan without side effects
- Pre‑search remains bounded (≤400ms) and allowlisted only; anchors ≤10 items

## Evidence Plan
- Link to commits updating writer/adapter with tag enforcement
- Metrics diffs showing `kind:` distribution
- Reindex dry‑run output artifact (JSON)
- Tests: passing unit tests for tag enforcement and stats

## Risks & Mitigations
- Inconsistent legacy tags → add enforcer + test guards
- Large reindex → dry‑run first; batch processing; idempotent adds
- Chroma listing quirks → dual list (tenant + root) and cache IDs

## Timebox (est.)
- Spec + helpers: 2.0–3.0h
- Tag enforcement + tests: 1.5–2.0h
- Stats expansion + tests: 1.5–2.0h
- Reindex skeleton + dry‑run test: 1.5–2.0h
- Total: 6.5–9.0h (fits within #38 windows)

## Next Steps
- [ ] Confirm inclusion with #38 execution
- [ ] Draft spec and open quick review
- [ ] Implement helpers + minimal code changes
- [ ] Add tests and produce evidence
