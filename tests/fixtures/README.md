# Fixtures for Mock OC Runs

This folder stores recorded or synthetic `oc` outputs used by the mock wrappers to run tests without a live cluster.

Structure
- `tests/fixtures/<namespace>/pods.json`
- `tests/fixtures/<namespace>/pvcs.json`
- `tests/fixtures/<namespace>/routes.json`
- `tests/fixtures/<namespace>/deployments.json`
- `tests/fixtures/<namespace>/events.json`
- `tests/fixtures/<namespace>/ingress.json`

How mocking works
- `tests/mocks/mock-oc-wrapper-v2.ts` maps high-level oc commands to a simple key:
  - `get pods` -> `pods.json`
  - `get pvc` -> `pvcs.json`
  - `get route` -> `routes.json`
  - `get deployments` -> `deployments.json`
  - `get events` -> `events.json`
  - `get ingress` -> `ingress.json`
- `tmp/pod-health.ts` swaps the v2 oc wrapper with the mock when `USE_MOCK_OC=1`.
- Read-ops harnesses (`tmp/get-pods.ts`, `tmp/describe.ts`, `tmp/logs.ts`) use `MockOpenShiftClient` when `USE_MOCK_OC=1`.

Adding a new fixture set
1) Choose a namespace (folder name) — e.g., `tests/fixtures/prod-ns`.
2) Add any of the supported JSON files. Shapes should mirror `-o json` from the real `oc` command.
3) Run with: `USE_MOCK_OC=1 npm run itest:beta:pod-health -- prod-ns app-1`.
   - The mock wrapper looks for files in `tests/fixtures/<ns>/`. Missing files default to `{ items: [] }`.

Extending mock command mappings
- Update `tests/mocks/mock-oc-wrapper-v2.ts` in `mapArgsToKey()` to map new commands to a key and provide the corresponding `<key>.json` file in each namespace folder.
- Keep keys simple and stable to avoid brittle tests.

Tips
- Redact volatile fields (timestamps, resourceVersion, UIDs) to keep tests deterministic.
- Create multiple namespaces (e.g., `healthy-ns`, `degraded-ns`) to model scenarios.
- For larger fixtures, consider splitting per resource and using just the fields your checks read.
