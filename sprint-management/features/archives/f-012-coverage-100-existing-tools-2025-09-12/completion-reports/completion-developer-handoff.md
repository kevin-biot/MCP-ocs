# Developer → Tester Handoff (F-012 Coverage Sprint)

Date: 2025-09-12
Scope: Phase 1–3 tests for instrumentation, collections, integration

## What to validate
- Phase 1 (middleware + writers):
  - tests/unit/instrumentation/instrumentation-middleware.behavior.test.ts
  - tests/unit/tools/metrics-writer.test.ts
  - tests/unit/tools/vector-writer.test.ts
  - tests/unit/tools/evidence-anchors.test.ts
- Phase 2 (collections + state + CLI):
  - tests/unit/memory/unified-memory-adapter.test.ts
  - tests/unit/tools/state-mgmt-tools.phase2.test.ts
  - tests/unit/cli/memory-audit.test.ts
- Phase 3 (registry boundary integration):
  - tests/unit/tools/registry-integration.phase3.test.ts

## How to run (targeted)
- Phase 1: `./node_modules/.bin/jest --runInBand tests/unit/tools/metrics-writer.test.ts tests/unit/tools/evidence-anchors.test.ts tests/unit/tools/vector-writer.test.ts tests/unit/instrumentation/instrumentation-middleware.behavior.test.ts`
- Phase 2: `./node_modules/.bin/jest --runInBand tests/unit/memory/unified-memory-adapter.test.ts tests/unit/tools/state-mgmt-tools.phase2.test.ts tests/unit/cli/memory-audit.test.ts`
- Phase 3: `./node_modules/.bin/jest --runInBand tests/unit/tools/registry-integration.phase3.test.ts`

## Pass criteria
- All suites pass.
- No external network calls attempted (Chroma/oc mocked).
- Library logging uses stderr. Tests do not rely on stdout outside the CLI audit JSON print.
- Instrumentation confirms:
  - preInstrument invoked on all registry executions
  - postInstrument invoked on successes
  - postInstrumentError invoked on failures
  - collectAnchors invoked in post paths

## Evidence anchors
- Coverage focus files exercised; metrics artifact when appended: `analytical-artifacts/08-technical-metrics-data.json`
- Execution log: `execution-logs/execution-log-codex.md` (this sprint’s detailed record)

## Notes
- Some defensive catch/log lines remain intentionally uncovered to avoid intrusive test seams.
- All tests are unit-level, fast, and isolated.

