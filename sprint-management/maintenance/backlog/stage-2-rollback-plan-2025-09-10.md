# Stage 2 Rollback Plan — 2025-09-10

## Scope
Rollback any Stage 2 changes (format normalization, path updates) while preserving zero content loss.

## Actions to Track
- File moves/renames between legacy and maintenance backlogs
- README structure changes (directory vs single-file conversions)
- Reference/path updates across templates, docs, scripts

## Rollback Procedures
1. Revert file moves: restore original files from git history (use `git restore -SW -- <path>`).
2. Revert content edits: `git restore --source=<pre-Stage-2-commit> <files>`.
3. Validate links: run link checks or manual spot checks for previously updated references.

## Verification After Rollback
- Confirm legacy references resolve again ("sprint-management/backlog/").
- Confirm maintenance canonical paths remain intact.
- Re-run content parity report to re-establish baseline.

## Notes
- All Stage 2 actions are content-preserving; no deletions will occur without archival copies.
