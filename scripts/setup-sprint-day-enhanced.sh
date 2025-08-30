#!/bin/bash

# Enhanced Daily Sprint Setup Script
# Integrates human standup decisions with AI-driven content generation

set -e

# Configuration
TODAY=$(date +%Y-%m-%d)
SPRINT_DIR="sprint-management"
ACTIVE_DIR="$SPRINT_DIR/active-tasks"
TEMPLATES_DIR="$SPRINT_DIR/templates"
COMPLETION_DIR="$SPRINT_DIR/completion-logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 MCP-ocs Daily Sprint Setup with Standup Integration - $TODAY${NC}"
echo "=================================================================="

# Check for Claude availability and memory access
echo -e "${YELLOW}🤖 Checking AI integration capabilities...${NC}"

# Check if we can run Claude queries (would need to be implemented with your memory tools)
if command -v claude-query &> /dev/null; then
    AI_INTEGRATION="available"
    echo -e "${GREEN}✅ Claude integration available${NC}"
else
    AI_INTEGRATION="manual"
    echo -e "${YELLOW}⚠️  Claude integration not available - using manual standup input${NC}"
fi

echo
echo -e "${BLUE}📋 DAILY STANDUP INTEGRATION${NC}"
echo "============================================"

# Option 1: AI-Enhanced Standup (if Claude integration available)
if [ "$AI_INTEGRATION" = "available" ]; then
    echo -e "${GREEN}🧠 Running AI-enhanced standup analysis...${NC}"
    
    # This would call Claude with memory tools to:
    # 1. Read yesterday's completion logs
    # 2. Analyze current sprint progress  
    # 3. Recommend today's task assignments
    # 4. Generate role-specific context
    
    echo "Analyzing previous session completion logs..."
    echo "Assessing sprint progress against objectives..."
    echo "Generating task assignment recommendations..."
    
    # Placeholder for actual Claude integration
    echo -e "${YELLOW}[AI Integration not implemented yet - falling back to manual]${NC}"
    AI_INTEGRATION="manual"
fi

# Option 2: Manual Standup Input (current implementation)
if [ "$AI_INTEGRATION" = "manual" ]; then
    echo -e "${YELLOW}📝 Manual Daily Standup Input${NC}"
    echo "Please provide today's sprint focus..."
    echo
    
    # Read yesterday's status if available
    YESTERDAY=$(date -j -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
    if [ -f "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" ]; then
        echo -e "${GREEN}📖 Yesterday's DEVELOPER completion status:${NC}"
        grep -A 5 "## Tasks Completed" "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" | head -10
        echo
    fi
    
    if [ -f "$COMPLETION_DIR/review-completion-log-$YESTERDAY.md" ]; then
        echo -e "${GREEN}📊 Yesterday's REVIEWER recommendation:${NC}"
        grep -A 3 "Final Recommendation" "$COMPLETION_DIR/review-completion-log-$YESTERDAY.md" | head -5
        echo
    fi
    
    # Interactive task assignment
    echo "Available tasks from tasks-current.md:"
    grep "### TASK-" "$SPRINT_DIR/tasks-current.md" | sed 's/### /- /'
    echo
    
    read -p "Which task should DEVELOPER focus on today? (e.g., TASK-001): " DEVELOPER_PRIMARY_TASK
    read -p "Secondary task for DEVELOPER if time permits? (e.g., TASK-002 or 'none'): " DEVELOPER_SECONDARY_TASK
    read -p "Any specific focus or constraints for today? (e.g., 'bug fixes', 'performance', 'testing'): " DAILY_FOCUS
    read -p "Estimated DEVELOPER session duration? (e.g., '3-4 hours'): " SESSION_DURATION
    
    # Set defaults if empty
    DEVELOPER_PRIMARY_TASK=${DEVELOPER_PRIMARY_TASK:-"TASK-001"}
    DEVELOPER_SECONDARY_TASK=${DEVELOPER_SECONDARY_TASK:-"TASK-002"}
    DAILY_FOCUS=${DAILY_FOCUS:-"Template hygiene implementation"}
    SESSION_DURATION=${SESSION_DURATION:-"3-4 hours"}
    
    echo
    echo -e "${GREEN}📋 Standup Summary:${NC}"
    echo "  Primary Task: $DEVELOPER_PRIMARY_TASK"
    echo "  Secondary Task: $DEVELOPER_SECONDARY_TASK"
    echo "  Daily Focus: $DAILY_FOCUS"
    echo "  Session Duration: $SESSION_DURATION"
    echo
    read -p "Proceed with this configuration? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
fi

# Generate dynamic content based on standup input
echo -e "${GREEN}📁 Generating dynamic daily files...${NC}"

# Get current git status for context
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
GIT_STATUS=$(git status --porcelain | wc -l)
UNCOMMITTED_CHANGES="No"
if [ "$GIT_STATUS" -gt 0 ]; then
    UNCOMMITTED_CHANGES="Yes - $(git status --porcelain | head -3 | tr '\n' '; ')"
fi

# Extract task details from tasks-current.md
get_task_details() {
    local task_id=$1
    local task_details=$(grep -A 20 "### $task_id:" "$SPRINT_DIR/tasks-current.md" | sed '/### TASK-/,$d' | head -20)
    echo "$task_details"
}

PRIMARY_TASK_DETAILS=$(get_task_details "$DEVELOPER_PRIMARY_TASK")
if [ "$DEVELOPER_SECONDARY_TASK" != "none" ]; then
    SECONDARY_TASK_DETAILS=$(get_task_details "$DEVELOPER_SECONDARY_TASK")
else
    SECONDARY_TASK_DETAILS="No secondary task assigned"
fi

# Create dynamic DEVELOPER role context
cat > "$ACTIVE_DIR/role-context-developer-$TODAY.md" << EOF
# Daily Role Context - DEVELOPER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: DEVELOPER  

## Today's Mission (From Daily Standup)
Focus on $DAILY_FOCUS with primary emphasis on $DEVELOPER_PRIMARY_TASK implementation.

## Standup Decisions
- **Primary Task**: $DEVELOPER_PRIMARY_TASK
- **Secondary Task**: $DEVELOPER_SECONDARY_TASK
- **Daily Focus**: $DAILY_FOCUS
- **Time Box**: $SESSION_DURATION
- **Decided By**: Human standup on $TODAY

## Role Assignment Boundaries
**Sprint Timeline**: Template Hygiene Sweep (3-day sprint)  
**Working Philosophy**: Functional over perfect, reuse ingress patterns  
**Pattern Priority**: Copy proven patterns from ingress template  
**Time Box**: $SESSION_DURATION maximum  

## Tasks Assigned for Today

### Primary Task (Must Complete)
$PRIMARY_TASK_DETAILS

### Secondary Task (If Time Permits)
$SECONDARY_TASK_DETAILS

## Context from Previous Sessions
EOF

# Add yesterday's context if available
if [ -f "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" ]; then
    echo "### Yesterday's Completion Status" >> "$ACTIVE_DIR/role-context-developer-$TODAY.md"
    grep -A 10 "## Tasks Completed\|## Tasks In Progress" "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" >> "$ACTIVE_DIR/role-context-developer-$TODAY.md"
    echo >> "$ACTIVE_DIR/role-context-developer-$TODAY.md"
fi

cat >> "$ACTIVE_DIR/role-context-developer-$TODAY.md" << EOF

### Git State
- **Current Branch**: $GIT_BRANCH
- **Uncommitted Changes**: $UNCOMMITTED_CHANGES
- **Commits Ready to Merge**: $(git log --oneline origin/main..HEAD 2>/dev/null | wc -l) commits ahead

## Implementation Guidance

### Existing Patterns to Use
- **Dynamic Resource Discovery**: Copy from \`ingress-template.ts\` lines 45-67
- **Evidence Completeness**: Copy pattern from \`ingress-template.ts\` lines 89-105
- **Error Handling**: Use established error boundary patterns
- **Testing**: Follow existing Jest test structure in \`tests/templates/\`

### Quality Requirements
- Copy proven patterns exactly, don't innovate
- All new code must have basic test coverage
- Ensure all existing tests still pass
- Document any deviations from ingress pattern

## Success Criteria for Today
- [ ] Primary task ($DEVELOPER_PRIMARY_TASK) implemented and working
- [ ] Code follows existing patterns and conventions
- [ ] All tests passing (existing + new)
- [ ] Clear handoff notes for TESTER role
- [ ] No regressions in existing functionality

## Role Chain Context
**Your Output Feeds**: TESTER role (who validates your implementations)  
**Next in Chain**: REVIEWER role (who assesses quality and architecture)  
**Final Gate**: Human review for sprint completion  

---
*Generated on $TODAY at $(date +%H:%M)*
*Based on standup decisions: Primary=$DEVELOPER_PRIMARY_TASK, Focus=$DAILY_FOCUS*
*Expected Session Duration: $SESSION_DURATION*
EOF

echo -e "${GREEN}✅ Dynamic DEVELOPER role context created with standup decisions!${NC}"

# Create other role contexts (TESTER and REVIEWER would be generated similarly)
# ... (rest of script similar to original but with dynamic content)

echo
echo -e "${BLUE}🎯 Today's Sprint Plan (Based on Standup):${NC}"
echo "  Primary Task: $DEVELOPER_PRIMARY_TASK"
echo "  Focus Area: $DAILY_FOCUS"
echo "  Session Length: $SESSION_DURATION"
echo "  AI Integration: $AI_INTEGRATION"
echo
echo -e "${GREEN}✨ Sprint day $TODAY is ready with personalized task assignments!${NC}"
