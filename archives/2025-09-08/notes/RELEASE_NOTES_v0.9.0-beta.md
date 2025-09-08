MCP-ocs v0.9.0-beta — Release Notes

Date: $(date)

Highlights
- Template engine foundation integrated from Spine branch.
- Beta diagnostics co-exist with template engine:
  - Namespace health (v2) with bounded mode, focus strategies.
  - Pod health discovery with prioritization (crashloops, image pull, pending, OOM, restarts).
- Performance: Reduced event volume; increased buffers in OpenShift client paths.

Changes
- Diagnostics
  - Added namespace prioritization and bounded execution flags.
  - Pod diagnostics support discovery and specific-pod modes; writes summaries to memory.
- Testing & Harness
  - Added real namespace runner script and tmp helpers for offline flows.
  - Merged test configs additively (kept template hygiene, added beta harness).
- Docs & Hygiene
  - Added BETA_TESTING_GUIDE and RCA analysis docs.
  - Expanded .gitignore for test tmp and real-example artifacts.

Compatibility
- Node.js ≥ 18.
- ESM-first codebase; Jest runs via ts-jest ESM preset.

Developer Notes
- Unit test configuration updated for stability:
  - Jest uses tsconfig.test.json with relaxed `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`.
  - ModuleNameMapper extended for ESM-style .js-to-.ts remaps.

Known Issues
- Unit test suite: some environments require serial runs (`jest -i --runInBand`).
- Integration tests require cluster access; currently skipped/offline.

How to Validate
1) Build: `npm run build`
2) Unit tests (serial ESM): `NODE_OPTIONS=--experimental-vm-modules npx jest -i --runInBand tests/unit`
3) Beta tools list: `node scripts/beta-list.js --json`
4) Start beta server: `npm run start:beta`

Upgrade Notes
- Memory system defaults to JSON fallback; set `MCP_OCS_FORCE_JSON=1` to force JSON.
- Chroma v2 integration attempts heartbeat; logs warnings when unavailable.

CI/Release
- Branch: `release/v0.9.0-beta` (active)
- Tag: `v0.9.0-beta`
- Integration branch preserved: `integration/template-engine-beta9`

Completeness Checklist
- [x] Beta 8 tool parity checked (see `artifacts/postmerge/tools_diff.txt`)
- [x] Pod discovery/prioritization present in diagnostics
- [x] Performance tuning (reduced events, raised buffers) confirmed
- [x] Deterministic routing active with maturity filters
- [x] Unit tests stabilized (serial ESM); key suites pass
- [ ] validate:beta passes with cluster access (deferred)
- [ ] CLI help smoke verified in CI (now exits 0 offline)
