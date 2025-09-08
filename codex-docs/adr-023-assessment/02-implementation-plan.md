# Implementation Plan: oc_triage Entry Tool (ADR-023)

## Goals
- Natural human prompts → normalized intent → internal template execution.
- Deterministic, bounded triage with safety and rubric evaluation.
- Keep templates invisible; preserve existing tools.

## Scope of Change
- Add one new MCP tool: `oc_triage` (diagnostic, v1).
- Add lightweight normalization and intent→template mapping.
- Integrate with existing `TemplateRegistry`, `TemplateEngine`, `BoundaryEnforcer`, and rubrics in `index-sequential.ts`.

## Steps
1. Define Triage Envelope and Input Interfaces
   - Add TS interfaces (see `code-samples/triage-envelope-interfaces.ts`).

2. Implement Intent Normalization + Mapping (Dictionary Stubs)
   - Normalize free text/issue synonyms to canonical intents.
   - Map canonical intents to internal template targets (e.g., “pvc-binding”, “scheduling-failures”, “ingress-pending”).
   - See `code-samples/intent-mapping-stub.ts`.

3. Implement oc_triage Tool
   - Name: `oc_triage`; category: `diagnostic`; version: `v1`.
   - Input schema: `{ prompt?, intent?, issue?, namespace?, bounded?, stepBudget?, urgency? }`.
   - Behavior: normalize → select template via `TemplateRegistry` → `TemplateEngine.buildPlan` → enforce boundaries → execute steps via `UnifiedToolRegistry.executeTool` → evaluate rubrics → return TriageEnvelope.
   - See `code-samples/oc-triage-tool-definition.ts`.

4. Register oc_triage in Server Entry
   - In `src/index-sequential.ts`, after suites registration, register `oc_triage` with `UnifiedToolRegistry` using the implementation from step 3.
   - Keep existing tools unchanged.
   - See `code-samples/tool-registry-integration.ts`.

5. Adjust Ingress Post-Hook (Optional)
   - Replace existing ST mini-plan with running the `ingress-pending` template using the same bounded path for consistency.

6. Observability
   - Log a single-line banner on triage runs: `Triage engaged (intent=..., template=..., steps=...)`.
   - Persist a normalized summary (using existing persistSummary helpers if applicable).

7. Tests
   - E2E: three flows: pvc-binding (namespace), scheduling-failures (namespace), ingress-pending (cluster).
   - Validate: intent mapping, bounded steps, evidence completeness threshold, rubrics present in envelope.
   - Ensure no regressions in `oc_diagnostic_*` and read-ops tools.

## Timeline
- Day 1: Implement interfaces, mapping stubs, and tool skeleton; wire registration; local dry run.
- Day 2: Add E2E cases; adjust logs and envelopes; optional ingress post-hook swap.
- Day 3: Polish dictionary coverage and doc updates.

## Migration
- Backward compatible. No changes to existing tool signatures or behavior.
- `oc_triage` is additive; LLMs can adopt it progressively.

