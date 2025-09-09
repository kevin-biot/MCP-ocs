# Testing Strategy - F-010-01 Phase 0 Spike (oc_triage)

## Scope
- Validate oc_triage intent routing and bounded execution (≤3 steps)
- Ensure read-only operations (BoundaryEnforcer-compatible)
- Establish performance baselines on a live cluster (CRC/OCP)

## Test Types
- Unit: oc_triage validation, mapping, envelope structure
  - `tests/unit/tools/oc-triage.test.ts`
- Safety: read-only boundary validation
  - `tests/unit/safety/oc-triage-boundary.test.ts`
- Natural interaction via registry
  - `tests/unit/diagnostics/oc-triage-interaction.test.ts`
- Integration (live cluster)
  - `tests/integration/oc-triage-crc-validation.ts` (cluster-agnostic logging)

## Commands
- Targeted unit tests: `node node_modules/jest/bin/jest.js tests/unit/tools/oc-triage.test.ts -w 1`
- Safety + interaction: `node node_modules/jest/bin/jest.js tests/unit/safety/oc-triage-boundary.test.ts tests/unit/diagnostics/oc-triage-interaction.test.ts -w 1`
- Live cluster validation: `NAMESPACE=student03 ./node_modules/.bin/tsx tests/integration/oc-triage-crc-validation.ts`

## Performance Baseline (Phase 0)
- Ingress pending: ~125ms
- Scheduling failures: ~122ms
- PVC binding: ~1ms (placeholders unresolved; steps skipped)

## Evidence Expectations
- Completeness may be <0.8 without specific pod/PVC identifiers.
- Phase 0 intentionally skips steps with unresolved placeholders.

## Read-only Validation
- Allowed: `oc get ...`, `oc describe ...`
- Disallowed: `oc apply|delete|scale|patch|edit|replace|cordon|drain|uncordon|annotate|label|taint`, `rollout ...`

## Tester Notes
- Provide concrete names to improve completeness where feasible (future phases).
- Use `NAMESPACE` env to target the test namespace.

