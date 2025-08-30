#!/bin/bash

# Interactive Daily Sprint Setup Script
# Integrates human standup decisions into daily file generation

set -e

# Configuration
TODAY=$(date +%Y-%m-%d)
SPRINT_DIR="sprint-management"
ACTIVE_DIR="$SPRINT_DIR/active-tasks"
COMPLETION_DIR="$SPRINT_DIR/completion-logs"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Interactive Daily Sprint Setup - $TODAY${NC}"
echo "=================================================="

# Check for yesterday's completion logs for context
YESTERDAY=$(date -j -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")
echo
echo -e "${YELLOW}📖 Yesterday's Context (if available):${NC}"
if [ -n "$YESTERDAY" ] && [ -f "$COMPLETION_DIR/review-completion-log-$YESTERDAY.md" ]; then
    echo "Yesterday's final recommendation:"
    grep -A 3 "Final Recommendation" "$COMPLETION_DIR/review-completion-log-$YESTERDAY.md" | head -5
    echo
else
    echo "No previous completion logs found."
    echo
fi

# Show available tasks
echo -e "${YELLOW}📋 Available tasks from tasks-current.md:${NC}"
if [ -f "$SPRINT_DIR/tasks-current.md" ]; then
    grep "### TASK-" "$SPRINT_DIR/tasks-current.md" | sed 's/### /- /'
else
    echo "- TASK-001: Dynamic Resource Selection Pattern"
    echo "- TASK-002: Evidence Completeness Scoring"
    echo "- TASK-003: Robust Output Parsing"  
    echo "- TASK-004: Error Boundary Handling"
fi
echo

# Interactive standup decisions
echo -e "${BLUE}📝 Daily Standup Input:${NC}"
read -p "Which task should DEVELOPER focus on today? (e.g., TASK-001): " DEVELOPER_PRIMARY_TASK
read -p "Secondary task for DEVELOPER if time permits? (e.g., TASK-002 or 'none'): " DEVELOPER_SECONDARY_TASK
read -p "What's today's focus area? (e.g., 'foundation building', 'bug fixes', 'testing'): " DAILY_FOCUS
read -p "How long should the DEVELOPER session be? (e.g., '3 hours'): " SESSION_DURATION

# Set defaults if empty
DEVELOPER_PRIMARY_TASK=${DEVELOPER_PRIMARY_TASK:-"TASK-001"}
DEVELOPER_SECONDARY_TASK=${DEVELOPER_SECONDARY_TASK:-"TASK-002"}
DAILY_FOCUS=${DAILY_FOCUS:-"Template hygiene implementation"}
SESSION_DURATION=${SESSION_DURATION:-"3 hours"}

echo
echo -e "${GREEN}📋 Standup Summary:${NC}"
echo "  Primary Task: $DEVELOPER_PRIMARY_TASK"
echo "  Secondary Task: $DEVELOPER_SECONDARY_TASK"
echo "  Daily Focus: $DAILY_FOCUS"
echo "  Session Duration: $SESSION_DURATION"
echo
read -p "Create daily files with these decisions? (Y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Setup cancelled"
    exit 0
fi

# Get task details from tasks-current.md
get_task_details() {
    local task_id=$1
    if [ -f "$SPRINT_DIR/tasks-current.md" ]; then
        local task_details=$(awk "/### $task_id:/,/### TASK-|^## |^# /" "$SPRINT_DIR/tasks-current.md" | head -20)
        echo "$task_details"
    else
        echo "**$task_id**: [Task details from tasks-current.md]"
    fi
}

PRIMARY_TASK_DETAILS=$(get_task_details "$DEVELOPER_PRIMARY_TASK")
if [ "$DEVELOPER_SECONDARY_TASK" != "none" ]; then
    SECONDARY_TASK_DETAILS=$(get_task_details "$DEVELOPER_SECONDARY_TASK")
else
    SECONDARY_TASK_DETAILS="No secondary task assigned for this session"
fi

# Create the daily files with standup decisions
echo -e "${GREEN}📁 Creating daily files with your standup decisions...${NC}"

# Create task status file with actual decisions
cat > "$ACTIVE_DIR/task-status-$TODAY.md" << EOF
# Task Status - $TODAY

**Sprint**: Template Hygiene Sweep  
**Day**: $(date +"%A, %B %d, %Y")  
**Daily Focus**: $DAILY_FOCUS
**Session Duration**: $SESSION_DURATION

## Task Assignments (From Standup)
- **Primary**: $DEVELOPER_PRIMARY_TASK (DEVELOPER role)
- **Secondary**: $DEVELOPER_SECONDARY_TASK (if time permits)

## Task Status Overview

### $DEVELOPER_PRIMARY_TASK
- **Status**: NOT_STARTED
- **Assigned Role**: DEVELOPER
- **Priority**: HIGH (from standup)
- **Last Updated**: $TODAY 09:00
- **Notes**: Primary focus for today's session

$(if [ "$DEVELOPER_SECONDARY_TASK" != "none" ]; then echo "
### $DEVELOPER_SECONDARY_TASK  
- **Status**: NOT_STARTED
- **Assigned Role**: DEVELOPER
- **Priority**: MEDIUM (secondary task)
- **Last Updated**: $TODAY 09:00
- **Notes**: Only if primary task completes early"; fi)

## Role Session Status

### DEVELOPER Session
- **Status**: PENDING
- **Focus**: $DAILY_FOCUS
- **Assigned Tasks**: $DEVELOPER_PRIMARY_TASK$(if [ "$DEVELOPER_SECONDARY_TASK" != "none" ]; then echo ", $DEVELOPER_SECONDARY_TASK"; fi)
- **Expected Duration**: $SESSION_DURATION

### TESTER Session  
- **Status**: WAITING
- **Dependencies**: DEVELOPER completion
- **Expected Start**: After DEVELOPER handoff
- **Focus**: Execute DEVELOPER testing strategy

### REVIEWER Session
- **Status**: WAITING  
- **Dependencies**: TESTER completion
- **Expected Start**: After TESTER handoff
- **Focus**: Quality and process assessment

---
*Created on $TODAY with standup decisions*
*Primary: $DEVELOPER_PRIMARY_TASK | Focus: $DAILY_FOCUS | Duration: $SESSION_DURATION*
EOF

# Create changelog
cat > "$ACTIVE_DIR/task-changelog-$TODAY.md" << EOF
# Task Changelog - $TODAY

**Sprint**: Template Hygiene Sweep  
**Date**: $(date +"%A, %B %d, %Y")  

## Change Log Entries

### $TODAY 09:00 - Sprint Day Setup (Interactive)
- **Action**: Daily files created with standup decisions
- **By**: Interactive setup script  
- **Decisions Made**: 
  - Primary Task: $DEVELOPER_PRIMARY_TASK
  - Secondary Task: $DEVELOPER_SECONDARY_TASK
  - Daily Focus: $DAILY_FOCUS
  - Session Duration: $SESSION_DURATION
- **Files Created**: 
  - task-status-$TODAY.md
  - task-changelog-$TODAY.md (this file)
  - role-context files for all three roles
- **Status**: Ready for role assignments

---

*This file will be updated throughout the day by each role session*
*Format: YYYY-MM-DD HH:MM - [Role] - [Action] - [Details]*
EOF

# Create DEVELOPER role context with standup decisions
cat > "$ACTIVE_DIR/role-context-developer-$TODAY.md" << EOF
# Daily Role Context - DEVELOPER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: DEVELOPER  

## Today's Mission (From Standup Decisions)
Focus on $DAILY_FOCUS with primary emphasis on $DEVELOPER_PRIMARY_TASK implementation.

## Standup Decisions
- **Primary Task**: $DEVELOPER_PRIMARY_TASK
- **Secondary Task**: $DEVELOPER_SECONDARY_TASK
- **Daily Focus**: $DAILY_FOCUS
- **Session Duration**: $SESSION_DURATION
- **Decided**: $(date +"%Y-%m-%d %H:%M") during human standup

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
$(if [ -n "$YESTERDAY" ] && [ -f "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" ]; then
    echo "### Yesterday's Status"
    grep -A 5 "Tasks Completed\|Tasks In Progress" "$COMPLETION_DIR/dev-completion-log-$YESTERDAY.md" | head -10
else
    echo "### Previous Session Status"
    echo "No previous completion logs available - starting fresh"
fi)

## Implementation Guidance
- **Dynamic Resource Discovery**: Copy from \`ingress-template.ts\` patterns
- **Evidence Completeness**: Follow ingress template scoring approach
- **Error Handling**: Use established error boundary patterns
- **Testing**: Follow existing Jest test structure

## Success Criteria for Today
- [ ] Primary task ($DEVELOPER_PRIMARY_TASK) implemented and working
- [ ] **⭐ Comprehensive testing strategy created for TESTER role**
- [ ] **⭐ Edge cases and complexity areas documented**
- [ ] All tests passing (existing + new)
- [ ] Clear handoff notes with testing strategy for TESTER role

## Role Chain Context
**Your Output Feeds**: TESTER role (who validates your implementations)  
**Next in Chain**: REVIEWER role (who assesses quality and architecture)  
**Final Gate**: Human review for sprint completion  

---
*Generated on $TODAY at $(date +%H:%M)*
*Based on standup decisions: Primary=$DEVELOPER_PRIMARY_TASK, Focus=$DAILY_FOCUS*
*Expected Session Duration: $SESSION_DURATION*
EOF

# Create similar files for TESTER and REVIEWER (abbreviated for space)
cat > "$ACTIVE_DIR/role-context-tester-$TODAY.md" << EOF
# Daily Role Context - TESTER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: TESTER  

## Today's Mission
Execute DEVELOPER testing strategy for $DEVELOPER_PRIMARY_TASK and validate implementation quality.

## Testing Assignment (From Standup)
- **Primary Focus**: Test $DEVELOPER_PRIMARY_TASK implementation
- **Testing Approach**: Execute DEVELOPER-designed testing strategy
- **Daily Context**: $DAILY_FOCUS validation
- **Expected Duration**: 2-3 hours after DEVELOPER completion

## Your Responsibilities
1. **Execute** DEVELOPER testing strategy from completion log
2. **Validate** edge cases and integration points identified
3. **Enhance** strategy if gaps discovered
4. **Provide feedback** on strategy quality for process improvement

## Success Criteria
- [ ] DEVELOPER testing strategy executed completely
- [ ] All implementation features validated
- [ ] Strategy feedback provided for process improvement
- [ ] Clear handoff notes for REVIEWER role

---
*Generated on $TODAY for testing focus on $DEVELOPER_PRIMARY_TASK*
EOF

cat > "$ACTIVE_DIR/role-context-reviewer-$TODAY.md" << EOF
# Daily Role Context - REVIEWER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: REVIEWER  

## Today's Mission
Review $DEVELOPER_PRIMARY_TASK implementation quality and assess DEVELOPER→TESTER process effectiveness.

## Review Assignment (From Standup)
- **Implementation Review**: $DEVELOPER_PRIMARY_TASK code quality and architecture
- **Process Review**: DEVELOPER testing strategy → TESTER execution effectiveness
- **Focus Context**: $DAILY_FOCUS quality assessment
- **Expected Duration**: 1-2 hours after TESTER completion

## Review Scope
1. **Code Quality**: Implementation maintainability and patterns
2. **Testing Process**: Strategy design and execution effectiveness  
3. **Architecture**: Alignment with existing patterns and ADRs
4. **Process Learning**: Workflow improvement recommendations

## Success Criteria
- [ ] Implementation quality assessed with clear recommendation
- [ ] Testing process effectiveness evaluated
- [ ] Process improvement recommendations provided
- [ ] Release readiness determination made

---
*Generated on $TODAY for review of $DEVELOPER_PRIMARY_TASK*
EOF

echo -e "${GREEN}✅ Daily files created with your standup decisions!${NC}"
echo
echo -e "${BLUE}📋 Files created:${NC}"
echo "  - task-status-$TODAY.md (with your task assignments)"
echo "  - task-changelog-$TODAY.md (with your decisions logged)"
echo "  - role-context-developer-$TODAY.md (with $DEVELOPER_PRIMARY_TASK focus)"
echo "  - role-context-tester-$TODAY.md (for testing $DEVELOPER_PRIMARY_TASK)"
echo "  - role-context-reviewer-$TODAY.md (for reviewing $DEVELOPER_PRIMARY_TASK)"
echo
echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "1. Start DEVELOPER session: codex reads role-context-developer-$TODAY.md"
echo "2. After DEVELOPER completes, start TESTER session"
echo "3. After TESTER completes, start REVIEWER session"
echo "4. Evening wrap-up with human + Claude review"
echo
echo -e "${GREEN}✨ Sprint day $TODAY ready with YOUR standup decisions!${NC}"
