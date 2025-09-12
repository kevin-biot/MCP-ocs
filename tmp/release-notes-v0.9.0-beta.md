MCP-ocs v0.9.0-beta (Draft)

Highlights
- P0 reliability fixes completed
  - Centralized Session IDs with registry injection (#40)
  - Global tool execution cap per session with structured error + instrumentation (#41)
  - Universal placeholder validation across all string args (#42)
- P1 improvements
  - Default sequential mode: boundedMultiStep with stepBudget=2 (#43)
  - D‑009 targeted time hygiene in touched paths (#44)

Validation
- Targeted Jest suites passed: tool-registry + read-ops
- Sequential smoke: defaults observed (boundedMultiStep, 2 steps)
  - Artifact: tmp/smoke-sequential-defaults.out.json

Commits
- P0 core fixes: cb35db41
- P1 defaults + D‑009: f5fa74c6
- Test config: c5b2683d

Links
- #38 Schema v2 enforcement readiness confirmed
- #40, #41, #42, #43, #44 closed as fixed
