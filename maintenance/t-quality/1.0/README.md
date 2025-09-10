# t-quality Process 1.0 (Beta)

Purpose: introduce a lightweight, non‑blocking quality process that runs in parallel with Daily 3.2 sprint execution. Starts as a weekly review; later adds a daily reviewer check; finally promotes a small, agreed set of rules to coding gates.

Key principles
- Non‑disruptive: no blocking checks during active sprints until explicitly promoted.
- Evidence‑driven: weekly reports → ≤5 scoped backlog items; no process paralysis.
- Versioned: iterate to 1.1/1.2 without churn.

Relationship to Daily 3.2
- Daily 3.2 remains the engine for coding work.
- t‑quality 1.0 runs outside coding time (weekly), then adds a warn‑only daily reviewer step when stable.

Directory map
- weekly/ — how to run and report the weekly ast‑grep review
- daily/ — the reviewer’s warn‑only check (when enabled)
- ci/ — draft CI workflow templates (not active)
- rules/ — where rule docs live (canonical rules are in tools/ast‑grep/)
- scorecard/ — one‑page release/status snapshot template

Getting started (weekly, 20–30m)
1) Run the scan (read‑only):
   - `sg scan -r tools/ast-grep > docs/reports/quality/ast-grep-weekly-YYYY-MM-DD.txt`
2) Use the checklist to triage findings and create ≤5 issues (labels: quality, ast‑grep, protocol/config/memory):
   - See weekly/checklist and report template below.
3) Do not alter sprint scope; these are maintenance/quality items unless critical.

Promotion path
- Phase A: weekly review only (this doc)
- Phase B: add daily reviewer warn‑only check (non‑blocking)
- Phase C: promote 1–2 rules (e.g., no‑stdout in server, no external MCP‑files) to coding gates in entrypoints/core

Non‑goals
- Heavy frameworks or rigid ceremonies; prefer checklists and small artifacts
- Blocking the sprint without prior agreement

Versioning
- This is 1.0 (Beta). Revisit after two cycles; adjust rules, add gates as needed.

