# CODEX Task — ADR Coverage Validation (Process v3.3.2)

Date: 2025-09-11  
Owner: CODEX  
Branch: release/v0.9.0-beta  
Status: Ready to run

## Objective
Validate Architectural Decision Record (ADR) coverage for the f-011 implementation and adjacent modules by:
- Inventorying ADRs in the repo
- Scanning code/docs for explicit ADR references and implicit policy patterns
- Producing a coverage matrix with gaps and concrete remediation actions

## Scope
- New/modified modules in f-011
  - `src/lib/tools/instrumentation-middleware.ts`
  - `src/lib/tools/metrics-writer.ts`
  - `src/lib/tools/vector-writer.ts`
  - `src/lib/memory/unified-memory-adapter.ts`
  - `src/tools/state-mgmt/index.ts` (stats path)
  - `src/cli/memory-audit.ts`
- Core integration points
  - `src/lib/tools/tool-registry.ts`
  - `src/lib/memory/chroma-memory-manager.ts`

## Assumptions
- ADRs may be found under `docs/**`, `sprint-management/**`, or `*reports*/**` paths
- ADRs might be referenced as "ADR-XYZ" in text; some ADRs may be implicit via guardrails (D-009, zero-stdout)

## Acceptance Criteria
- A machine-parsable ADR inventory with IDs, titles, and paths
- A coverage matrix mapping ADR → (files referencing it)
- Coverage summary with score and prioritized remediation list
- Artifacts saved under `sprint-management/process/adr-coverage-*.{json,md}`

## Method (Systematic)
1) ADR Inventory
- Command: `rg -n "^#\s*ADR|ADR-\d+|^ADR-" docs sprint-management | sort`
- Extract canonical ADR list: ID, Title, Path

2) Reference Scan
- Code + docs scanning:
  - `rg -n "ADR-[0-9]{2,}" src docs sprint-management | sort`
  - Policy patterns (D-009, zero-stdout): `rg -n "nowEpoch\(|nowIso\(|console\.error\(" src`

3) Coverage Matrix
- Build mapping: ADR ID → { referencedBy: [files], missing: [key modules not referencing] }
- Key modules list = Scope files above

4) Report & Score
- Score idea: (#modules referencing at least one applicable ADR) / (total key modules)
- Identify gaps: modules lacking ADR references where policy applies (e.g., D-009, protocol safety)
- Recommend additions: minimal ADR anchors in module file headers or related docs

5) Artifacts
- JSON: `sprint-management/process/adr-coverage-report.json`
- Markdown: `sprint-management/process/adr-coverage-report.md`
- Optional: CI-friendly line with coverage percentage

## Example Commands
- ADR inventory (IDs + titles):
  - `rg -n "^#\s*ADR|^ADR-" docs sprint-management | sed -E 's/:/ /'`
- References in code:
  - `rg -n "ADR-[0-9]{2,}" src | sort`
- Policy evidence (D-009, zero-stdout) in new modules:
  - `rg -n "import.*now(Epoch|Iso).*from.*utils/time|console\.error\(" src/lib/tools src/lib/memory`

## Deliverables
- Coverage JSON with fields: `{ adrs: [...], refs: [...], matrix: {...}, score: <0..1>, gaps: [...], recommendations: [...] }`
- Coverage MD summarizing:
  - ADR inventory (table)
  - Coverage by key modules (table)
  - Gaps + suggested remediation text blocks

## Remediation Guidance (if gaps found)
- Add minimal ADR anchors to module headers or adjacent docs (e.g., D-009, MCP protocol safety ADR numbers)
- Cross-link ADRs from execution logs where relevant decisions were applied (middleware, safety, enrichment)

## Timebox
- 30–45 minutes for inventory + scan + report
- +15 minutes if remediation anchors are requested

## Notes
- Treat D-009 and protocol safety as ADR-equivalent standards when formal ADR doc IDs are not present; anchor to guardrails filenames.
- Keep zero-stdout and D-009 evidence as part of coverage narrative even if not formal ADRs.

