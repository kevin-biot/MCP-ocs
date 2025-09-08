# Safety Validation

## Input Validation
- `oc_triage` input schema restricts:
  - `bounded` defaults to true; `stepBudget` defaults to 2–3 and is capped (e.g., max 5).
  - `intent|issue` normalized to a canonical set (rejects unknowns unless a fallback template exists).
  - `namespace` optional; may be validated by a cheap `oc` call if allowed, or trusted for read-only paths.

## Execution Boundaries
- BoundaryEnforcer applies `maxSteps` and `timeoutMs` from the selected template, optionally intersected with request `stepBudget`.
- Optional `allowedNamespaces` can be passed (e.g., to restrict triage to current project during demos/tests).

## Operation Safety
- Templates use read-only diagnostic and read-ops tools (`oc_read_*`, `oc_diagnostic_*`).
- No mutating actions are executed by triage; any remedial suggestions are classified (`SAFE`, `REQUIRES_APPROVAL`, `DANGEROUS`) in the envelope.

## Rubric Safety Gate
- Safety rubric produces `allowAuto` which maps to envelope safety: `ALLOW`, `BLOCK`, `REQUIRES_APPROVAL`.
- Other rubrics (priority, confidence, SLO) included for operator context without changing behavior.

## Error Handling and Degradation
- If intent normalization fails, return a helpful error with supported intents.
- If template selection or execution fails/times out, fall back to returning a basic diagnostic output with an advisory.
- Persist partial evidence and timing for observability (optional).

## RBAC Considerations
- Triage runs only read operations; cluster role must allow get/list/describe/logs in the targeted namespaces.
- For environments with restricted access, the tool should surface permission errors as degraded evidence, not fatal errors.

