# Role Guardrails — Process v3.3.1-Enhanced

Purpose: Single source of truth for Developer, Tester, and Reviewer guardrails aligned with the v3.3.x problem‑resolution framework and Sprint Kit. Derived from validated v3.2 checklists with updated framing. Use this in conjunction with the Landing Checklist and Sprint Kit.

## Developer — Technical Guardrails (P0/P1)

- Trust Boundaries (D-001)
  - Validate all external inputs with schemas; reject on failure
  - Sanitize file paths; prevent traversal; parameterize shell/DB commands
  - Pattern: compute `safePath` under a known root; verify prefix; throw on violation

- Async Correctness (D-005)
  - Await every Promise or handle explicitly; no floating promises
  - Protect concurrent state: sequence or lock hot paths (mutex/queues)
  - Bound long operations with timeouts; propagate errors with context
  - Pattern: `Promise.race([op(), timeout(ms)])` + structured error

- Type Safety (D-002) and Interface Hygiene (D-003)
  - No `any`; use precise types and branded identifiers for critical IDs
  - Assertions require runtime validation; enforce null/undefined handling
  - Avoid structural collisions; constrain generics; keep return types consistent

- Error Taxonomy (D-006)
  - Use structured error classes; preserve context; map status codes consistently
  - Separate user‑facing vs internal error content; include traceable details

- Exhaustiveness (D-010)
  - Cover all union/enum cases; use assertNever guards for safety

## Tester — Validation Guardrails

- Strategy
  - Analyze dev changes; plan coverage by complexity tier; define pass/fail thresholds
  - Execute functional, integration, edge, and regression tests; add performance checks for TIER 2/3

- Pass/Fail (must meet all PASS conditions)
  - Functional completeness; green build; no regressions; appropriate error handling; integration integrity
  - Conditional pass requires documented minor issues and rationale

- Evidence
  - Provide coverage report, issue log with repro, performance metrics, env details, and artifact links

- Critical Test Focus (derived from historical gaps)
  - D-001: input schemas, path safety, parameterization
  - D-002/3: no `any`, safe assertions, interface compliance, branded IDs
  - D-005: unawaited promises, race conditions, timeouts
  - D-006: structured errors, context preservation, user‑appropriate messages
  - D-010: switch coverage, assertNever, state transitions

## Reviewer — Verification Guardrails

- Process
  - Assess code quality, architecture/ADR alignment, security, performance, and integration impact
  - Validate evidence completeness and landing readiness; approve with clear rationale

- Critical Review Points
  - D-001: schemas on all inputs; parameterization; path security; command safety
  - D-002/3: no `any`; validated assertions; null safety; interface compliance; branded IDs
  - D-005: awaited async; concurrency safety; error propagation; timeouts
  - D-006: structured taxonomy; context; recovery/UX appropriateness
  - D-010: exhaustive handling; guards present

- Decision Aids
  - Approve only with zero P0 and no unresolved P1 in target scope
  - Require evidence score ≥ required threshold per Landing Checklist

## References
- Sprint Kit cockpit: `sprint-management/templates/sprint-kit-3.3.x/`
- Landing checklist: `sprint-management/SPRINT-LANDING-CHECKLIST-V3.3-ENHANCED.md`
- Process evolution: `sprint-management/PROCESS-V3.3.2-EVOLUTION-SUMMARY.md`

