MCP-ocs v0.9.0-beta (Draft)

Highlights
- P0 reliability fixes completed
  - Centralized Session IDs with registry injection (#40)
  - Global tool execution cap per session with structured error + instrumentation (#41)
  - Universal placeholder validation across all string args (#42)
- P1 improvements
  - Default sequential mode: boundedMultiStep with stepBudget=2 (#43)
  - D‑009 targeted time hygiene in touched paths (#44)
- Session policy (it just works)
  - Server-authoritative session IDs with idle-gap auto-rotation
    - SESSION_POLICY=idleGap (soft reuse=120s, hard rotate=900s, max lifetime=2h)
    - Middle band: reuse for same client process, rotate otherwise
    - Admission lock (400ms) to avoid split-brain after idle
    - Default: RESPECT_CLIENT_SESSION_ID=false (client tokens treated as hints)
    - Debug toggles: PROBE_NDJSON, FORCE_NEW_SESSION_ID (off in prod)

Validation
- Targeted Jest suites passed: tool-registry + read-ops
- Sequential smoke: defaults observed (boundedMultiStep, 2 steps)
  - Artifact: tmp/smoke-sequential-defaults.out.json
- LM Studio probe (NDJSON): client sticky token ignored; server-generated session IDs in request snapshots

Commits
- P0 core fixes: cb35db41
- P1 defaults + D‑009: f5fa74c6
- Observability + session policy: b6338539
- CI unit-smoke workflow: 6634a237

Links
- #38 Schema v2 enforcement readiness confirmed
- #40, #41, #42, #43, #44 closed as fixed
