# AST-grep Weekly Review – Checklist (Read-Only)

Purpose: Run a non-blocking code health scan outside coding sprints, capture findings, and curate a small quality backlog without disrupting active work.

## Prep (5m)
- [ ] Ensure ast-grep (`sg`) is installed and on PATH (`sg -V`).
- [ ] Confirm rule pack location: `tools/ast-grep/*.yml`.
- [ ] Choose a baseline branch (e.g., `main`) for context.

## Run (10–15m)
- [ ] Repository root
- [ ] Command (plain output):
  - `sg scan -r tools/ast-grep > docs/reports/quality/ast-grep-weekly-YYYY-MM-DD.txt`
- [ ] Optional (GitHub format for ad-hoc CI or PR notes):
  - `sg scan -r tools/ast-grep --format=github`

## Focus Areas (triage lens)
- Protocol safety: stdout usage (console.log/info) in server/runtime paths
- External dependencies: MCP-files imports (should be removed)
- Path hygiene: '@/…' imports (resolver or refactor to relative)
- Config discipline: direct `process.env.*` reads (move behind loader)
- Memory enrichment: unguarded `AutoMemorySystem.retrieveRelevantContext(...)`

## Triage (15–20m)
- [ ] Skim the weekly report; group by rule and severity
- [ ] Classify findings:
  - Keep (quality backlog): clear, scoped improvements
  - Ignore (benign): tests/CLI-only or accepted exceptions
  - Escalate (urgent): protocol break risks, production hazards
- [ ] Create/append issues with labels (examples): `quality`, `ast-grep`, `protocol`, `config`, `memory`
- [ ] Link each issue to the weekly report file

## Outcome
- [ ] Weekly report saved under `docs/reports/quality/`
- [ ] ≤ 5 small quality issues created (scoped and actionable)
- [ ] Zero disruptions to current sprint scope

## Notes
- Start as warn-only; later promote selected rules to daily reviewer, then to coding gates.
- Prefer improving rule specificity over adding many rules.

