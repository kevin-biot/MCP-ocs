#!/usr/bin/env bash
set -euo pipefail

# CODEX CLI Dual-Branch Documentation Sync
# Safely commit and push docs and sprint-management to both main and beta-9.

PHASE=${1:-all} # all | validate | sync | push

echo "🔍 CODEX: Validating dual-branch sync safety..."

# 1) Verify current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")
if [[ -z "${CURRENT_BRANCH}" ]]; then
  echo "❌ ERROR: Not in a git repository or no current branch"
  exit 1
fi
echo "Current branch: ${CURRENT_BRANCH}"

# 2) Check for uncommitted changes
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  WARNING: Uncommitted changes detected"
  git status --porcelain || true
  if [[ "${PHASE}" == "all" || "${PHASE}" == "validate" ]]; then
    read -r -p "Continue? (y/N): " confirm || true
    if [[ ! ${confirm:-N} =~ ^[Yy]$ ]]; then
      echo "🛑 Aborting by user choice"
      exit 1
    fi
  fi
fi

# 3) Determine target branches (default: main + release/v0.9.0-beta)
DEFAULT_BRANCHES=(main release/v0.9.0-beta)
if [[ -n "${CODEX_SYNC_BRANCHES:-}" ]]; then
  # Space-separated list from env
  read -r -a BRANCHES <<< "${CODEX_SYNC_BRANCHES}"
else
  # Auto-adapt: prefer release/v0.9.0-beta; fallback to beta-9; else defaults
  if git show-ref --verify --quiet refs/heads/release/v0.9.0-beta; then
    BRANCHES=("main" "release/v0.9.0-beta")
  elif git show-ref --verify --quiet refs/heads/beta-9; then
    BRANCHES=("main" "beta-9")
  else
    BRANCHES=("${DEFAULT_BRANCHES[@]}")
  fi
fi

# Verify all target branches exist locally
for b in "${BRANCHES[@]}"; do
  if ! git show-ref --verify --quiet "refs/heads/${b}"; then
    echo "❌ ERROR: branch not found: ${b}"
    exit 1
  fi
done

# 4) Remote reachability (non-fatal warning if detached/offline)
if ! git ls-remote origin >/dev/null 2>&1; then
  echo "⚠️  WARNING: Cannot reach remote origin right now. You can still commit locally and push later."
fi

echo "✅ Pre-commit validation passed"

if [[ "${PHASE}" == "validate" ]]; then
  exit 0
fi

echo "🚀 CODEX: Starting dual-branch documentation sync..."

ORIGINAL_BRANCH="${CURRENT_BRANCH}"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="docs: sync documentation and sprint-management - CODEX automated dual-branch update [${TIMESTAMP}]"

sync_docs_to_branch() {
  local target_branch=$1
  echo "📝 Syncing docs to ${target_branch}..."

  # Switch to target branch and ensure it's up to date (non-fatal if offline)
  git checkout "${target_branch}" || { echo "❌ ERROR: Failed to checkout ${target_branch}"; return 1; }
  if git ls-remote origin >/dev/null 2>&1; then
    git pull --rebase origin "${target_branch}" || echo "⚠️  Warning: Unable to pull/rebase ${target_branch}, proceeding with local state"
  fi

  # Stage docs and sprint-management
  if ! git add docs/ sprint-management/; then
    echo "❌ ERROR: Failed to add docs/sprint-management"
    return 1
  fi

  # Skip if nothing to commit
  if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit on ${target_branch}"
    return 0
  fi

  # Commit
  git commit -m "${COMMIT_MSG}" || { echo "❌ ERROR: Failed to commit on ${target_branch}"; return 1; }
  echo "✅ Committed docs to ${target_branch}"
}

push_branch_safely() {
  local target_branch=$1
  echo "🚀 Pushing ${target_branch} to origin..."
  if ! git ls-remote origin >/dev/null 2>&1; then
    echo "⚠️  Skipping push: remote not reachable"
    return 1
  fi
  git push origin "${target_branch}" || {
    echo "❌ ERROR: Failed to push ${target_branch}"
    echo "💡 Try: git pull origin ${target_branch} --rebase && git push origin ${target_branch}"
    return 1
  }
  echo "✅ Successfully pushed ${target_branch}"
}

SYNC_SUCCESS=true

for branch in "${BRANCHES[@]}"; do
  if ! sync_docs_to_branch "${branch}"; then
    echo "❌ FAILED: Documentation sync to ${branch} failed"
    SYNC_SUCCESS=false
    break
  fi
done

# Return to original branch
git checkout "${ORIGINAL_BRANCH}" || true

if [[ "${SYNC_SUCCESS}" != true ]]; then
  echo "❌ ABORT: Sync failed, no pushes attempted"
  exit 1
fi

echo "✅ Documentation sync completed successfully on both branches"

if [[ "${PHASE}" == "sync" ]]; then
  exit 0
fi

echo "🚀 CODEX: Starting dual-branch push..."

PUSH_SUCCESS=true
PUSHED_BRANCHES=()

for branch in "${BRANCHES[@]}"; do
  git checkout "${branch}"
  if push_branch_safely "${branch}"; then
    PUSHED_BRANCHES+=("${branch}")
    echo "✅ Push successful: ${branch}"
  else
    echo "❌ Push failed: ${branch}"
    PUSH_SUCCESS=false
    break
  fi
done

# Return to original branch
git checkout "${ORIGINAL_BRANCH}" || true

if [[ "${PUSH_SUCCESS}" == true ]]; then
  echo ""
  echo "🎉 SUCCESS: Dual-branch documentation sync completed!"
  echo "📋 Updated branches: ${PUSHED_BRANCHES[*]}"
  echo "📅 Timestamp: ${TIMESTAMP}"
  echo ""
  echo "✅ CODEX can now pull beta-9 with current documentation"
  echo "✅ Viewers can access docs on main branch"
  echo "✅ Sprint management synchronized across branches"
else
  echo ""
  echo "⚠️  PARTIAL SUCCESS: Some branches failed to push"
  echo "✅ Successful pushes: ${PUSHED_BRANCHES[*]}"
  echo "❌ Check failed branches manually"
  echo ""
  echo "💡 RECOVERY: Run git pull --rebase on failed branches and retry push"
fi

cat <<'EOF'

Tip: Quick function for rapid iteration (source into your shell):

codex-sync-docs() {
  local original_branch=$(git branch --show-current)
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  local commit_msg="docs: CODEX automated sync [${timestamp}]"
  echo "🚀 CODEX: Dual-branch doc sync starting..."
  git checkout main && git add docs/ sprint-management/ && git commit -m "${commit_msg}" && git push origin main && echo "✅ main updated" || echo "❌ main failed"
  git checkout release/v0.9.0-beta && git add docs/ sprint-management/ && git commit -m "${commit_msg}" && git push origin release/v0.9.0-beta && echo "✅ release/v0.9.0-beta updated" || echo "❌ release/v0.9.0-beta failed"
  git checkout "${original_branch}"
  echo "🎉 CODEX: Dual-branch sync completed"
}

Rollback helper:
rollback_last_commit() {
  local branch=$1
  git checkout "$branch" && git reset --hard HEAD~1 && echo "⏪ Rolled back last commit on $branch"
}

Conflict resolution helper:
resolve_push_conflict() {
  local branch=$1
  git checkout "$branch" && git pull origin "$branch" --rebase && git push origin "$branch" && echo "🔧 Resolved conflicts and pushed $branch"
}

EOF
