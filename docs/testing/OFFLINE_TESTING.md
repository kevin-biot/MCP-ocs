# Offline Testing Guide (Unit-Only)

Purpose: Run a reliable, cluster-free test suite that validates core correctness without any OpenShift, network, or ChromaDB dependencies.

## Commands
- Run all offline-safe unit tests:
  - `npm run test:offline`
- Run a subset (examples):
  - `jest --config jest.offline.config.js --runInBand tests/unit/templates`
  - `jest --config jest.offline.config.js --runInBand tests/unit/tools/tool-execution-tracker.test.ts`

Notes:
- The offline config is defined in `jest.offline.config.js` (extends the base Jest config).
- Integration, e2e, and real tests are excluded by default in this mode.

## What’s Covered Offline
- Templates: plan building determinism, variable substitution, evidence evaluation (regex/jsonpath/dsl) using synthetic results.
- Tool Execution Tracker: execution history, memory storage link, error path, and cleanup routines using in-memory mocks.
- Error/Logging: canonical error taxonomy, structured logger behavior.
- Config: schema validation, type guards, and constants.
- Memory (JSON mode): Shared memory JSON fallback, search/store, stats (no ChromaDB required).
- Schemas: AJV validations for tool outputs using synthetic fixtures.
- Rubrics: Intelligence/rubric evaluation paths.

## Mocks/Stubs Used
- Template `BlockRegistry`: Mapped to `tests/mocks/templates/block-registry.ts` only in offline runs to avoid infra dependencies.
- OpenShift client calls: Unit tests provide local mocks for functions that would otherwise invoke `oc`.
- Memory system: Tests run with JSON storage; if ChromaDB is unavailable, code automatically uses fallback mode.

## What’s Excluded Offline
- Any tests under:
  - `tests/integration`
  - `tests/e2e`
  - `tests/real`
- Anything requiring a live cluster, external binaries, or network.

## Policy: Date/Time (D-009)
- External responses (user-facing JSON): ISO 8601 UTC via `nowIso()`.
- Internal memory/compute records: numeric epoch ms via `nowEpoch()` (ordering, duration math, vector metadata).

## When Cluster Access Is Available
- Regular unit suite: `npm run test:unit`
- Integration: `npm run test:integration`
- (Optional) E2E scripts in `scripts/e2e/*` or project-specific runners.

## Troubleshooting
- If runs seem slow or noisy, use `--runInBand` and target a smaller subset.
- If TS import resolution errors appear, ensure you’re using Node >= 18 and run `npm run build` once to populate `dist`.
- For persistent Jest cache issues, try `jest --clearCache`.

