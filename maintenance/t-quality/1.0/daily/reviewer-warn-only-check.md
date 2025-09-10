# Daily Reviewer – Warn‑Only Check (Optional Phase B)

Purpose: quick, non‑blocking morning scan to surface potential issues without affecting sprint scope.

Command:
- `sg scan -r tools/ast-grep --format=github || true`

Reviewer notes:
- Skim warnings; if actionable, create small issues (≤30 minutes effort each)
- Use labels: `quality`, `ast-grep`, and a topical label (`protocol`, `config`, `memory`)
- Do not re‑scope the sprint; these flow to maintenance backlog unless urgent

