# Tester Handoff - F-010-01 Phase 0 (oc_triage)

## What to Validate
- oc_triage tool is registered and callable via UnifiedToolRegistry (fullName: `oc_diagnostic_triage`)
- Three intents work: `pvc-binding`, `scheduling-failures`, `ingress-pending`
- Bounded execution (≤3 steps) and read-only operations
- Performance: <15s per invocation on live cluster
- Evidence: structure present; completeness may be <0.8 without concrete identifiers

## How to Run
- Unit (targeted):
  - `node node_modules/jest/bin/jest.js tests/unit/tools/oc-triage.test.ts -w 1`
  - `node node_modules/jest/bin/jest.js tests/unit/safety/oc-triage-boundary.test.ts -w 1`
  - `node node_modules/jest/bin/jest.js tests/unit/diagnostics/oc-triage-interaction.test.ts -w 1`
- Integration (live cluster):
  - `NAMESPACE=student03 ./node_modules/.bin/tsx tests/integration/oc-triage-crc-validation.ts`

## Expected Results (Phase 0)
- Performance OK (<15s) across intents
- Evidence completeness:
  - ingress-pending ~0.6–0.7
  - scheduling-failures ~0.6
  - pvc-binding ~0.0 unless PVC/pod identifiers provided

## Safety Assurances
- Only `get`, `describe`, and `get machinesets` are used
- No mutation verbs are invoked

## Notes
- Provide specific pod/PVC names to increase completeness in future phases
- Logging in integration script uses `[TRIAGE]`/cluster-agnostic prefixes

