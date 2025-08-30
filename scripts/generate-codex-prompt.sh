#!/bin/bash

# Generate Codex Prompt Script
# This script creates a detailed, context-aware prompt for Codex based on daily standup decisions
# Run after setup-sprint-day-enhanced.sh to get the perfect Codex prompt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Dates
TODAY=$(date +%Y-%m-%d)

# Directories
SPRINT_DIR="sprint-management"
ACTIVE_DIR="$SPRINT_DIR/active-tasks"
COMPLETION