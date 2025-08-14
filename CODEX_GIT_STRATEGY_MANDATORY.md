# CODEX MANDATORY GIT STRATEGY - READ FIRST IN EVERY SESSION

## CRITICAL: BRANCH STRUCTURE (NEVER CHANGE THIS)
```
main (protected) ← stable releases only
├── develop ← YOUR 1.0 DEVELOPMENT WORK GOES HERE
└── release/v0.8.0-beta ← beta users get this (NO EXPERIMENTAL CHANGES)
```

## YOUR DEVELOPMENT WORKFLOW (ALWAYS FOLLOW)

### Starting ANY Session:
```bash
cd /Users/kevinbrown/MCP-ocs
git checkout develop  # ALWAYS work on develop for new features
git pull origin develop  # Get latest changes
```

### Making Changes:
```bash
# ALWAYS work on develop branch for new features
git checkout develop
# Make your changes
git add -A
git commit -m "feat: your change description"
git push origin develop
```

### Beta Fixes ONLY:
```bash
# ONLY for critical beta bugs
git checkout release/v0.8.0-beta
# Make minimal fix
git commit -m "fix: critical beta issue"
git tag v0.8.0-beta-1  # increment patch number
git push origin release/v0.8.0-beta --tags
```

## BRANCH RULES (MANDATORY)

### ✅ DO:
- **develop**: New features, major changes, experimental work
- **release/v0.8.0-beta**: Critical bug fixes only
- **main**: Protected - only Kevin pushes here

### ❌ NEVER:
- Work directly on main
- Add experimental features to beta branch
- Break the beta for users
- Create new branches without Kevin's approval

## CODEX SESSION CHECKLIST

**1. First Command in Every Session:**
```bash
cd /Users/kevinbrown/MCP-ocs && git checkout develop && git status
```

**2. Before Making Changes:**
- Confirm you're on `develop` branch
- Pull latest: `git pull origin develop`

**3. Before Committing:**
- Verify branch: `git branch` (should show `* develop`)
- Test your changes work

**4. Commit Format:**
```bash
git commit -m "feat: brief description

- what changed
- why changed  
- any risks or follow-ups needed"
```

## CURRENT LIVE BRANCHES
- **main**: Protected stable code
- **develop**: Active development (YOUR WORKSPACE)
- **release/v0.8.0-beta**: Live beta for users (8 validated tools)

## VERSION TAGS
- **v0.8.0-beta**: Current beta release  
- **v0.8.0-beta-1, v0.8.0-beta-2**: Beta patches (if needed)
- **v1.0.0**: Future main release (from develop)

## EMERGENCY PROCEDURES

**If you accidentally work on wrong branch:**
```bash
git stash  # save changes
git checkout develop  # switch to correct branch
git stash pop  # restore changes
```

**If beta is broken:**
```bash
git checkout release/v0.8.0-beta
git revert HEAD  # undo last commit
git push origin release/v0.8.0-beta
```

## SUCCESS METRICS
- ✅ Beta users have stable tools (75% success rate maintained)
- ✅ Development continues on develop branch
- ✅ No experimental code breaks beta
- ✅ Clear separation between beta stability and 1.0 innovation

---

**CODEX: MEMORIZE THIS. CHECK BRANCH EVERY SESSION. DEVELOP = YOUR WORKSPACE.**