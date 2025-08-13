#!/bin/bash
# 
# Commit script for MCP-ocs project with validation
# Usage: ./scripts/utils/commit.sh "Commit message"

echo "🚀 Committing changes..."
cd /Users/kevinbrown/MCP-ocs

# Add all changes
git add .

# Commit with message if provided
if [ -n "$1" ]; then
    git commit -m "$1"
    echo "✅ Committed with message: $1"
else
    git commit -m "chore: Automated commit"
    echo "✅ Committed with default message"
fi
