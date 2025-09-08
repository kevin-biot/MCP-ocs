# Risk Assessment & Mitigation

## Risks
- Intent Ambiguity: Human prompts may map to multiple intents.
- Over-routing: Triage could replace deliberate LLM multi-step plans unexpectedly.
- Template Drift: Templates may lag new failure modes.
- Performance: Added normalization and preflight could add latency.
- Security: Namespace validation or discovery could touch restricted APIs.

## Mitigations
- Deterministic Mapping: Keep a small, explicit dictionary; log mappings; include `routing.intent` in the envelope.
- Respect Intent: Only Replace when `bounded=true`/short-run hints are present; otherwise run diagnostics as requested or Suggest in shadow.
- Template Lifecycle: Use existing evidence completeness and rubrics to detect low-confidence and degrade gracefully; maintain templates alongside test fixtures.
- Tight Bounds: Default `stepBudget`=2–3; conservative `timeoutMs`; observe timeouts in logs.
- Read-only: Triage remains read-only; permission failures are surfaced in evidence, not fatal.

## Rollback Strategy
- Feature Flag: Gate `oc_triage` or template routing behind env flags; disable if issues arise.
- Fallback Path: On any error, fall back to standard diagnostic tool behavior.

