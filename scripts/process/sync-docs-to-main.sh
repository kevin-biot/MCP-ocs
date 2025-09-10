#!/usr/bin/env bash
set -euo pipefail
SRC_BRANCH=${1:-release/v0.9.0-beta}
DST_BRANCH=${2:-main}
paths=(
  "sprint-management/active"
  "logs/sprint-execution.log"
  "docs/reports/technical"
)
orig=$(git rev-parse --abbrev-ref HEAD)
need_stash=0
if ! git diff --quiet || ! git diff --cached --quiet; then
  need_stash=1
  git stash push -u -m "sync-docs-prep"
fi
trap 'if [ "$need_stash" -eq 1 ]; then git stash pop || true; fi; git checkout "$orig" >/dev/null 2>&1 || true' EXIT

git fetch --all --prune --quiet || true
# Ensure source updated
if [ "$orig" != "$SRC_BRANCH" ]; then git checkout "$SRC_BRANCH"; fi
git pull --ff-only origin "$SRC_BRANCH"
# Switch to destination
git checkout "$DST_BRANCH"
git pull --ff-only origin "$DST_BRANCH"
# Checkout paths from source into destination
for p in "${paths[@]}"; do
  git checkout "$SRC_BRANCH" -- "$p" || true
  git add -A "$p" || true
done
# Commit if changes
if ! git diff --cached --quiet; then
  git commit -m "process(sync): EOD sync of sprint docs from $SRC_BRANCH"
  git push origin "$DST_BRANCH"
else
  echo "No changes to sync"
fi
