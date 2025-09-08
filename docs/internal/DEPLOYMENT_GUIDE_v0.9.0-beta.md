# MCP-ocs v0.9.0-beta — Production Deployment Guide

Date: $(date)

## Overview
- Release branch: `release/v0.9.0-beta`
- Tag: `v0.9.0-beta`
- Integration base: `integration/template-engine-beta9`

This release introduces the deterministic template engine foundation with integrated beta diagnostics (namespace + pod discovery/prioritization) and performance-tuned OpenShift event handling.

## Prerequisites
- Node.js >= 18
- `oc` CLI on PATH for live cluster operations
- Optional: `TRANSFORMERS_CACHE`, `SHARED_MEMORY_DIR` environment variables

## Build
```bash
npm ci || npm install
npm run build
```

## Run (server)
```bash
node dist/src/index.js --help
```

## Run (beta tool server)
```bash
npm run start:beta
```

## Validated Tools (beta)
```bash
node scripts/beta-list.js --json | jq .
```

## Configuration
- Memory (JSON fallback): `./memory` (created automatically)
- Chroma v2 (optional): set `CHROMA_HOST`/`CHROMA_PORT`; set `MCP_OCS_FORCE_JSON=1` to force JSON fallback

## Operational Health
- Graceful shutdown & health endpoints are included.
- Diagnostics tools provide cluster, namespace, and pod health summaries.

## Current Testing Status (no live cluster)
- Build: PASS
- Unit tests: known failures (new beta integration); triage recommended post-deploy window
- Integration tests: require live cluster; currently skipped (access interrupted)

## Dry-Run / Offline Validation
- Use `tmp/*.ts` scripts to simulate flows without cluster writes:
  - `tmp/get-pods.ts`, `tmp/describe.ts`, `tmp/logs.ts` (will no-op without cluster)
  - Beta diagnostics server can be started and queried via MCP client harnesses

## Rollback
```bash
git checkout integration/template-engine-beta9
git reset --hard pre-merge/spine-YYYYMMDD-HHMMSS  # safety tag recorded earlier
# Or re-create release branch from integration baseline
git branch -D release/v0.9.0-beta
git checkout -b release/v0.9.0-beta integration/template-engine-beta9
```

## Release Process
1) Ensure `release/v0.9.0-beta` is up to date with integration
2) Tag `v0.9.0-beta`
3) Push branch + tag
4) Open PR or fast-forward into main per policy

## Known Issues
- Unit test suite contains failures post-integration (see `FINAL_TEST_RESULTS.md`)
- Cluster-dependent tests are not executable without access; schedule validation window

## Post-Access Validation Checklist
- Run `npm run test:integration`
- Run real namespace diagnostics: `npm run itest:real:ns`
- Execute beta server help and smoke commands

