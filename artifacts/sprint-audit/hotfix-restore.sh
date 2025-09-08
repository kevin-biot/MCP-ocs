#!/usr/bin/env bash
set -euo pipefail
echo "Creating hotfix branch from release/v0.9.0-beta"
git checkout -f release/v0.9.0-beta
git checkout -b hotfix/sprint-restore-202509072024
echo "No missing commits detected."
echo "Resolve conflicts if any, then push:"
echo git push -u origin hotfix/sprint-restore-202509072024
echo "Open PR into release/v0.9.0-beta"
