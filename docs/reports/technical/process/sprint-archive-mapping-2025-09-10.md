# Sprint Archive Migration Mapping — 2025-09-10

This document captures a first-pass mapping from legacy archive locations to the canonical semantic domain structure.

- Source root: `sprint-management/archive/`
- Target roots:
  - Maintenance domain archives: `sprint-management/maintenance/archives/`
  - Features domain archives: `sprint-management/features/archives/`

See CSV for details: `docs/reports/technical/process/sprint-archive-mapping-2025-09-10.csv`.

Notes
- Rows flagged with `needs_review` require human verification (ambiguous naming) or missing completion date (`-undated`).
- This is a non-destructive plan; actual moves should use `git mv` to preserve history.
- After migration, legacy roots (`archive/`, `backlog/`, `active/`) can be removed per REQ-003.
