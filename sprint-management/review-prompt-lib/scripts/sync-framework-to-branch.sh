#!/bin/bash
# Systematic Sprint-Management Framework Synchronization
# Part of Review-Prompt-Lib v1.0 Git Workflow Integration

CURRENT_BRANCH=$(git branch --show-current)

echo "Sprint-Management Framework Sync"
echo "Current branch: $CURRENT_BRANCH"

# Safety check - never sync TO main
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo "Error: Cannot sync sprint-management TO main branch"
    echo "   This script syncs FROM main TO feature branches"
    echo "   Use './push-sprint-management-to-main.sh' to update main"
    exit 1
fi

echo "Syncing complete sprint-management directory from main..."

# Complete directory sync - no cherry-picking to prevent missing artifacts
git checkout main -- sprint-management/

# Add and commit with clear provenance
git add sprint-management/
git commit -m "sync: Complete sprint-management framework from main

Framework sync ensures:
- All evidence files available (prevents D-009 gap pattern)
- Complete process documentation (v3.3 + Review-Prompt-Lib v1.0)  
- Latest review-prompt-lib domains and prompts
- Updated templates, scripts, and executable permissions

Branch: $CURRENT_BRANCH
Sync date: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Framework source: main branch"

echo "Sprint-management framework sync complete"
echo "Verify with: ls -la sprint-management/review-prompt-lib/domains/"
echo "Ready for Process v3.3 execution with complete evidence baseline"