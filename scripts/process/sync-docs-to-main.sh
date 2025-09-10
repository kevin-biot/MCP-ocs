#!/usr/bin/env bash
set -euo pipefail

# Sync sprint docs/logs from a source branch (beta) to main, then regenerate indices/registry on main.
# Usage: bash scripts/process/sync-docs-to-main.sh [SRC_BRANCH] [DST_BRANCH]
# Defaults: SRC_BRANCH=release/v0.9.0-beta, DST_BRANCH=main

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

cleanup() {
  if [ "$need_stash" -eq 1 ]; then git stash pop || true; fi
  git checkout "$orig" >/dev/null 2>&1 || true
}
trap cleanup EXIT

git fetch --all --prune --quiet || true

# Ensure source is updated
if [ "$orig" != "$SRC_BRANCH" ]; then git checkout "$SRC_BRANCH"; fi
git pull --ff-only origin "$SRC_BRANCH"

# Switch to destination
git checkout "$DST_BRANCH"
git pull --ff-only origin "$DST_BRANCH"

# Checkout paths from source into destination and stage
for p in "${paths[@]}"; do
  git checkout "$SRC_BRANCH" -- "$p" || true
  git add -A "$p" || true
done

# Commit if changes and push
if ! git diff --cached --quiet; then
  git commit -m "process(sync): EOD sync of sprint docs from $SRC_BRANCH"
  git push origin "$DST_BRANCH"
fi

# Post-sync: regenerate indices and registry on main
if [ "$DST_BRANCH" = "main" ]; then
  changed=0
  # Generate local archive indices
  if [ -f scripts/archives/generate-archives-index.mjs ]; then
    node scripts/archives/generate-archives-index.mjs || true
    git add sprint-management/features/archives/INDEX.md sprint-management/maintenance/archives/INDEX.md || true
    if ! git diff --cached --quiet; then changed=1; fi
  fi
  # Generate consolidated registry
  if [ -f scripts/archives/generate-archive-registry.mjs ]; then
    mkdir -p docs/reports/technical/process
    node scripts/archives/generate-archive-registry.mjs || true
    git add docs/reports/technical/process/archive-registry-* || true
    if ! git diff --cached --quiet; then changed=1; fi
  fi
  if [ $changed -eq 1 ]; then
    git commit -m "process(archives): post-sync index + registry refresh"
    git push origin "$DST_BRANCH"
  fi
fi

echo "Sync complete: $SRC_BRANCH -> $DST_BRANCH"

