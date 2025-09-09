# Daily End-of-Day Git Sync Workflow

## Context
Manual daily sync for dual-branch strategy accommodating ongoing remediation work outside formal sprint boundaries.

## Pre-Sync Assessment (2 minutes)

### Current State Check
```bash
# Verify current position
pwd
git status
git branch

# Check what's been done today
git log --oneline --since="1 day ago"
```

### Sync Decision Matrix
**Sync main → beta if today included:**
- Documentation updates
- Process framework changes  
- Sprint management updates
- ADR modifications
- README/CHANGELOG updates

**Sync beta → main if today included:**
- Repository cleanup/organization
- Infrastructure improvements
- Quality enforcement changes
- Build/tooling enhancements

**Skip sync if today was only:**
- Feature development
- Code debugging
- Test iterations
- Temporary/experimental work

## Sync Execution (5-10 minutes)

### Option A: Documentation/Process Changes (main → beta)
```bash
# Switch to beta branch
git checkout release/v0.9.0-beta

# Pull latest from both branches  
git fetch origin main release/v0.9.0-beta
git merge origin/release/v0.9.0-beta  # Update local beta

# Selective merge from main
git merge origin/main --no-ff -m "sync: daily documentation/process updates from main

- [brief description of what's being synced]
- Maintains dual-branch documentation consistency"

# Push updated beta
git push origin release/v0.9.0-beta
```

### Option B: Infrastructure Changes (beta → main)
```bash
# Switch to main branch
git checkout main

# Pull latest from both branches
git fetch origin main release/v0.9.0-beta  
git merge origin/main  # Update local main

# Selective merge from beta (docs/infrastructure only)
git cherry-pick [specific commits] 
# OR
git merge origin/release/v0.9.0-beta --no-ff -m "sync: daily infrastructure updates from beta

- [brief description of what's being synced]
- Docs/process/infrastructure only - no feature code"

# Push updated main  
git push origin main
```

### Option C: No Changes Requiring Sync
```bash
# Just ensure both local branches are current
git checkout main && git pull origin main
git checkout release/v0.9.0-beta && git pull origin release/v0.9.0-beta

# Document the decision
echo "$(date): No cross-branch sync needed" >> .git/daily-sync.log
```

## Conflict Resolution Strategy

### If Merge Conflicts Occur:
```bash
# Don't panic - this is normal with active dual-branch work

# Assess conflict scope
git status
git diff --name-only --diff-filter=U

# For documentation conflicts: usually keep both versions
# For process conflicts: main branch takes precedence  
# For infrastructure: beta branch usually has latest

# Resolve conflicts manually
git add [resolved-files]
git commit -m "resolve: daily sync conflicts - [brief description]"
```

### Escalation Criteria:
- More than 5 files in conflict
- Core codebase conflicts (not just docs)
- Conflicts you're unsure how to resolve
- Time spent > 15 minutes

**Action**: Skip sync, document issue, resolve next day with fresh perspective.

## Verification & Documentation (2 minutes)

### Post-Sync Verification
```bash
# Verify both branches are in expected state
git log --oneline -3 main
git log --oneline -3 release/v0.9.0-beta

# Quick sanity check
ls -la | grep -E "(README|CHANGELOG|docs|sprint-management)"
```

### Daily Sync Log
```bash
# Track sync patterns for process improvement
echo "$(date): [main→beta|beta→main|no-sync] - [brief reason]" >> .git/daily-sync.log

# Weekly review of patterns
tail -7 .git/daily-sync.log
```

## Weekly Cleanup (Fridays)

### Branch Hygiene
```bash
# Clean up any temporary branches
git branch -a | grep -E "(temp|test|debug)"

# Verify remote state matches local
git fetch --all
git status

# Review sync log for patterns
cat .git/daily-sync.log | tail -7
```

### Documentation Update
Update any affected:
- Sprint archives with cross-branch work
- ADRs with dual-branch decisions  
- Process docs with workflow refinements

## Success Metrics

**Time Investment**: < 15 minutes daily (including decision-making)
**Conflict Rate**: < 1 significant conflict per week
**Branch Divergence**: Branches never more than 2-3 commits apart
**Documentation Consistency**: READMEs and process docs aligned across branches

## Troubleshooting Common Issues

**"I forgot which branch I'm on"**: Always run `git status` and `pwd` first
**"Too many changes to sync"**: Break into smaller, focused commits tomorrow
**"Merge conflicts every day"**: Review if dual-branch strategy needs adjustment
**"Sync taking too long"**: Consider whether changes actually need cross-branch sync

---

## Integration with Existing Workflow

This fits into your current pattern of:
- Morning: Pick up work where left off
- Day: Focused development/remediation work  
- Evening: Housekeeping, organization, sync, wrap-up

The manual approach respects that much of your work is remediation and quality improvement that doesn't fit sprint boundaries, while ensuring branches don't drift too far apart.
