# CODEX CLI Dual-Branch Documentation Sync

This script safely commits and pushes `docs/` and `sprint-management/` to both `main` and `beta-9` so:
- CODEX can pull `beta-9` with current docs
- Viewers see up-to-date docs on `main`
- Sprint management stays synchronized

## Script
- Path: `scripts/codex-dual-branch-sync.sh`
- Phases:
  - `validate`: pre-flight checks only
  - `sync`: commit changes to both branches (no push)
  - default (`all`): validate → sync → push

## Usage
```bash
# Make sure it’s executable
chmod +x scripts/codex-dual-branch-sync.sh

# Full flow: validate, commit, push
./scripts/codex-dual-branch-sync.sh

# Validate only
./scripts/codex-dual-branch-sync.sh validate

# Commit only (no push)
./scripts/codex-dual-branch-sync.sh sync
```

## Helpers (printed at end of run)
- Quick function: `codex-sync-docs` (fast dual-branch commit/push)
- Rollback last commit per branch: `rollback_last_commit <branch>`
- Resolve push conflicts: `resolve_push_conflict <branch>`

## Notes
- The script prompts if uncommitted changes are present (in `all`/`validate`).
- If `origin` isn’t reachable, commits still proceed; pushes are skipped.
- It rebases from `origin` per branch when reachable to minimize conflicts.
