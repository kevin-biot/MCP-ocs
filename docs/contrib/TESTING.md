# Testing (Read-Only Policy)

This project enforces a strict read-only policy for test code and helper scripts.

- Defense-in-depth guard: `scripts/ci/prevent-mutations.sh` runs on `npm test` as a pretest hook and scans `scripts/`, `tests/`, and npm scripts for forbidden mutation commands:
  - `oc ... (apply|delete|scale|patch|edit|replace|cordon|drain|uncordon|annotate|label|taint)`
  - `rollout (restart|pause|resume|undo)`
  - Allowlist: `tests/fixtures/**` (data files only)
  - If any hit is found, the script prints the offending paths and exits with `MUTATION COMMAND DETECTED`.

- Runtime lock (formatter): `scripts/tools/format-summary.mjs` defaults `OC_ALLOW_MUTATIONS=0`. If a future summary payload includes mutation-like actions, the formatter exits with code `2` and a red warning banner. Set `OC_ALLOW_MUTATIONS=1` only for internal developer testing — never in CI.

- Live reads: Infra tools honor `INFRA_LIVE_READS=true` to enable bounded cluster reads (safe for CI if needed), but mutations remain blocked by policy.

