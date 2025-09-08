# Online Testing Guide (Integration/E2E)

This guide covers tests that require a working `oc` CLI and, ideally, a reachable OpenShift cluster. Use this when validating real tool behavior end‑to‑end.

## Prerequisites
- Node >= 18, npm >= 10
- `oc` CLI installed and on PATH
- Authenticated cluster session or `KUBECONFIG` pointing to a valid context
- Optional (vector memory):
  - `CHROMA_HOST`, `CHROMA_PORT` if running with ChromaDB

## Commands
- Unit (standard): `npm run test:unit`
- Integration: `npm run test:integration`
- E2E runners and scripts: see `scripts/e2e/*` and `scripts/smoke/*`
- Full CI mode: `npm run test:ci`

Tip: Start with unit, then integration. E2E scripts may incur longer runtimes and external dependencies.

## Environment Setup
- `KUBECONFIG=/path/to/kubeconfig` (if not using current context)
- `OC_PATH` (optional): ensure `oc` is available and matches cluster version expectations
- Vector memory (optional): set `CHROMA_HOST`, `CHROMA_PORT` to enable embeddings; otherwise JSON fallback is used.

## Stubbing `oc` When No Cluster Is Available (CI-friendly)
If you need to run “online” integration flows without a real cluster:
- Stub `oc` via PATH:
  1. Create a small script `bin/oc` that returns canned JSON for commands your tests use (e.g., `get pods -o json`).
  2. `chmod +x bin/oc` and prepend to PATH: `PATH="$(pwd)/bin:$PATH" npm run test:integration`.
- Or mock `child_process.execSync` and `spawn` in targeted Jest tests to return fixtures.

Common oc commands to stub for this repo:
- `oc version -o json`
- `oc whoami`
- `oc project -q`
- `oc get <resource> -o json` (pods, nodes, events, namespaces, pvc, routes, deployments)
- `oc logs ...`
- `oc describe <resource> <name>`

Keep the stub output consistent with Kubernetes API shapes expected by the code.

## Date/Time Policy (D-009)
- External/user-facing JSON: ISO 8601 UTC strings (e.g., `2025-09-06T18:32:10.123Z`).
- Internal/memory/compute: numeric epoch milliseconds for ordering/math.

## Choosing Offline vs Online Config
- Offline unit tests (no cluster): `npm run test:offline` (uses `jest.offline.config.js` and a mocked BlockRegistry)
- Online/standard unit tests: `npm run test:unit` (uses base `jest.config.js`)
- Integration/E2E: run the relevant scripts under `tests/integration` or `scripts/e2e/*`.

## Troubleshooting
- Permission or exec errors: ensure the macOS/Linux sandbox allows child processes, or run with appropriate permissions in CI.
- Module resolution: run `npm run build` once and ensure Node >= 18 for ESM.
- Noisy logs: run with `--runInBand` and target specific test files for faster iteration.

