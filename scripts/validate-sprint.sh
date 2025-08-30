#!/bin/bash

# Daily Sprint Validation Script
# Validates that all required files exist and are properly formatted

set -e

TODAY=$(date +%Y-%m-%d)
SPRINT_DIR="sprint-management"
ACTIVE_DIR="$SPRINT_DIR/active-tasks"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Sprint Day Validation - $TODAY${NC}"
echo "========================================"

# Check if we're in MCP-ocs directory
if [ ! -f "package.json" ] || ! grep -q "mcp-ocs" package.json; then
    echo -e "${RED}❌ Error: Not in MCP-ocs directory${NC}"
    exit 1
fi

# Check directory structure
echo -e "${YELLOW}📁 Checking directory structure...${NC}"

REQUIRED_DIRS=(
    "$SPRINT_DIR"
    "$ACTIVE_DIR"
    "$SPRINT_DIR/completion-logs"
    "$SPRINT_DIR/templates"
    "$SPRINT_DIR/roles"
    "$SPRINT_DIR/archive"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ✅ $dir"
    else
        echo -e "  ❌ $dir (missing)"
        exit 1
    fi
done

# Check role definition files
echo -e "${YELLOW}👥 Checking role definitions...${NC}"

ROLE_FILES=(
    "$SPRINT_DIR/roles/developer.md"
    "$SPRINT_DIR/roles/tester.md"
    "$SPRINT_DIR/roles/reviewer.md"
)

for file in "${ROLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ❌ $file (missing)"
        exit 1
    fi
done

# Check template files
echo -e "${YELLOW}📋 Checking template files...${NC}"

TEMPLATE_FILES=(
    "$SPRINT_DIR/templates/role-context-developer-template.md"
    "$SPRINT_DIR/templates/role-context-tester-template.md"
    "$SPRINT_DIR/templates/role-context-reviewer-template.md"
)

for file in "${TEMPLATE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ❌ $file (missing)"
        exit 1
    fi
done

# Check master tasks file
echo -e "${YELLOW}📝 Checking master tasks file...${NC}"

if [ -f "$SPRINT_DIR/tasks-current.md" ]; then
    echo -e "  ✅ tasks-current.md"
else
    echo -e "  ❌ tasks-current.md (missing)"
    exit 1
fi

# Check daily files (if today's setup was run)
echo -e "${YELLOW}📅 Checking today's files...${NC}"

DAILY_FILES=(
    "$ACTIVE_DIR/task-status-$TODAY.md"
    "$ACTIVE_DIR/task-changelog-$TODAY.md"
    "$ACTIVE_DIR/role-context-developer-$TODAY.md"
    "$ACTIVE_DIR/role-context-tester-$TODAY.md"
    "$ACTIVE_DIR/role-context-reviewer-$TODAY.md"
)

ALL_DAILY_EXIST=true
for file in "${DAILY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $(basename $file)"
    else
        echo -e "  ⚠️  $(basename $file) (not created yet - run setup-sprint-day.sh)"
        ALL_DAILY_EXIST=false
    fi
done

# Git status check
echo -e "${YELLOW}🔧 Checking git status...${NC}"
if git status > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo -e "  ✅ Git repository active (branch: $BRANCH)"
    
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "  ✅ Working directory clean"
    else
        echo -e "  ⚠️  $UNCOMMITTED uncommitted changes"
    fi
else
    echo -e "  ❌ Git repository not found"
    exit 1
fi

# Validate file formats (basic check)
echo -e "${YELLOW}📄 Validating file formats...${NC}"

# Check tasks-current.md format
if grep -q "## Sprint Objectives" "$SPRINT_DIR/tasks-current.md"; then
    echo -e "  ✅ tasks-current.md format valid"
else
    echo -e "  ❌ tasks-current.md missing required sections"
    exit 1
fi

# Summary
echo
echo -e "${GREEN}🎯 Validation Summary:${NC}"
echo -e "  ✅ Directory structure complete"
echo -e "  ✅ Role definitions present"
echo -e "  ✅ Template files ready"
echo -e "  ✅ Master tasks file valid"
echo -e "  ✅ Git repository functional"

if [ "$ALL_DAILY_EXIST" = true ]; then
    echo -e "  ✅ Daily files for $TODAY ready"
    echo
    echo -e "${GREEN}✨ Sprint framework fully validated and ready for execution!${NC}"
else
    echo -e "  ⚠️  Daily files not yet created"
    echo
    echo -e "${YELLOW}Next step: Run 'bash scripts/setup-sprint-day.sh' to create today's files${NC}"
fi

echo
echo -e "${BLUE}📖 Usage:${NC}"
echo "  Setup today:     bash scripts/setup-sprint-day.sh"
echo "  Validate setup:  bash scripts/validate-sprint.sh"
echo "  Start session:   codex --context active-tasks/role-context-developer-$TODAY.md"
