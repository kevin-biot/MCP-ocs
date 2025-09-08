# ADR-023 Assessment: oc_triage Entry Tool

## Summary
- Decision: Implement a single visible `oc_triage` entry tool that normalizes human prompts, routes to a domain intent, and executes the appropriate internal template with safety bounds. Keep all existing diagnostic/read tools visible for expert workflows (hybrid model).
- Why: Bridges the natural interaction gap (no `triageTarget` required), preserves determinism and safety (bounded plan + BoundaryEnforcer), and maintains future compatibility with the dictionary architecture defined in the ADR.
- Feasibility: High. Current Template Engine, Rubrics, Tool Registry, and Safety mechanisms are operational and can be leveraged with modest glue code.
- Scope: Localized to server entry (`src/index-sequential.ts`) and small new modules (intent normalization + intent→template mapping). No breaking changes to existing tools.

## Key Findings
- Template Engine is internal and robust but only engages when `triageTarget` is present. LLMs don’t naturally produce that argument.
- Sequential Thinking auto-shims exist but don’t guarantee deterministic, template-based evidence envelopes.
- UnifiedToolRegistry supports dynamic tool registration; registering `oc_triage` is straightforward.
- Safety: BoundaryEnforcer, bounded step budgets, and read-only diagnostic tools already exist and fit the triage execution model.

## Recommendation
1. Add `oc_triage` tool (diagnostic, v1). Inputs: natural `intent|issue`, optional `namespace`, `bounded=true`, `stepBudget<=3`, optional `urgency`.
2. Normalize prompt via entry dictionary → canonical intent; route via domain dictionary → internal template target.
3. Execute the selected template with `TemplateEngine` + `BoundaryEnforcer`; evaluate rubrics; emit a stable TriageEnvelope.
4. Keep templates invisible to the LLM; do not change the tool list except adding `oc_triage`.
5. Optional follow-up: heuristic Suggest-mode in diagnostics (shadow-run template and attach advisory summary).

## Expected Impact
- Natural UX: Humans can say “Triage PVC binding in student03; two steps max” and the system routes correctly without mentioning templates.
- Determinism: Uses existing templates and rubric evaluation, preserving consistent envelopes and auditability.
- Safety: Bounded steps, timeouts, namespace scoping; read-only by default.
- Performance: Negligible overhead; work resembles current template execution with a small normalization step.

## Next Steps
- Implement the `oc_triage` tool (see code samples in `code-samples/`).
- Wire minimal normalization + mapping stubs; iterate to full dictionaries per ADR.
- Add 2–3 focused E2E tests covering intent mapping and envelope generation.

