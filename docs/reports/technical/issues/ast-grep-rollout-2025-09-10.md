Title: AST-grep rollout: weekly → daily reviewer → coding gate (low-disruption)

Type: enhancement
Labels: enhancement, quality, ast-grep, process

Summary
Introduce ast-grep as a guardrail tool in three phases to avoid disrupting active sprints: (1) Weekly manual review, (2) Daily reviewer warn-only check, (3) Selective coding gates for agreed rules.

Phases
1) Weekly review (manual, outside coding)
   - Run: `sg scan -r tools/ast-grep > docs/reports/quality/ast-grep-weekly-YYYY-MM-DD.txt`
   - Use checklist: `docs/reports/quality/ast-grep-weekly-review-checklist.md`
   - Triage: create ≤ 5 small quality issues (labels: quality, ast-grep, protocol/config/memory)

2) Daily reviewer (non-blocking)
   - Run in morning checks: `sg scan -r tools/ast-grep --format=github || true`
   - Curate any new findings into issues; no sprint scope impact

3) Coding gate (subset, blocking)
   - Promote a few stable rules to “error” for server paths (e.g., no-stdout, external-mcp-files)
   - Keep other rules warn-only until tuned

Initial Rule Pack
- no-stdout.yml: forbid console.log/info in runtime/server code
- external-mcp-files.yml: forbid external MCP-files imports
- path-alias.yml: flag '@/…' imports (require resolver or refactor)
- env-reads.yml: flag direct `process.env.*` reads (migrate to loader)
- auto-memory-retrieve.yml: flag unguarded AutoMemory usage

Artifacts
- Weekly report: `docs/reports/quality/ast-grep-weekly-YYYY-MM-DD.txt`
- Templates: checklist and weekly report template under `docs/reports/quality/`

Acceptance Criteria
- Weekly review produces a small, curated quality backlog without affecting the sprint
- Daily reviewer integrates warn-only scan; zero blocking
- Coding gate enforces 1–2 agreed rules on server code with no false-positive churn

Success Metrics
- Fewer protocol/config regressions over time
- Clear, scoped quality issues instead of ad-hoc findings

Owners & Labels
- Owner: Reviewer (weekly), Dev Lead (gate selection)
- Labels: enhancement, quality, ast-grep, process

