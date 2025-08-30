#!/bin/bash

# Daily Sprint Management Setup Script
# Creates all necessary files for a sprint day with role-based agent coordination

set -e

# Configuration
TODAY=$(date +%Y-%m-%d)
SPRINT_DIR="sprint-management"
ACTIVE_DIR="$SPRINT_DIR/active-tasks"
TEMPLATES_DIR="$SPRINT_DIR/templates" 
COMPLETION_DIR="$SPRINT_DIR/completion-logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MCP-ocs Daily Sprint Setup - $TODAY${NC}"
echo "============================================"

# Check if we're in the right directory
if [ ! -d "$SPRINT_DIR" ]; then
    echo -e "${RED}❌ Error: sprint-management directory not found${NC}"
    echo "Please run this script from the MCP-ocs root directory"
    exit 1
fi

# Check if today's files already exist
if [ -f "$ACTIVE_DIR/task-status-$TODAY.md" ]; then
    echo -e "${YELLOW}⚠️  Daily files for $TODAY already exist${NC}"
    read -p "Do you want to overwrite them? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
fi

echo -e "${GREEN}📁 Creating daily files structure...${NC}"

# 1. Create daily task status file
echo "Creating task-status-$TODAY.md..."
cat > "$ACTIVE_DIR/task-status-$TODAY.md" << EOF
# Task Status - $TODAY

**Sprint**: Template Hygiene Sweep  
**Day**: $(date +"%A, %B %d, %Y")  
**Roles Active**: DEVELOPER, TESTER, REVIEWER  

## Task Status Overview

### TASK-001: Dynamic Resource Selection Pattern
- **Status**: NOT_STARTED
- **Assigned Role**: DEVELOPER
- **Last Updated**: $TODAY 09:00
- **Notes**: Ready for implementation

### TASK-002: Evidence Completeness Scoring  
- **Status**: NOT_STARTED
- **Assigned Role**: DEVELOPER
- **Last Updated**: $TODAY 09:00
- **Notes**: Waiting for TASK-001 completion

### TASK-003: Robust Output Parsing
- **Status**: NOT_STARTED  
- **Assigned Role**: DEVELOPER
- **Last Updated**: $TODAY 09:00
- **Notes**: Can be done in parallel with other tasks

### TASK-004: Error Boundary Handling
- **Status**: NOT_STARTED
- **Assigned Role**: DEVELOPER  
- **Last Updated**: $TODAY 09:00
- **Notes**: Requires pattern understanding from completed tasks

## Role Session Status

### DEVELOPER Session
- **Status**: PENDING
- **Start Time**: TBD
- **Assigned Tasks**: TASK-001, TASK-002
- **Expected Duration**: 3-4 hours

### TESTER Session  
- **Status**: WAITING
- **Dependencies**: DEVELOPER completion
- **Expected Start**: After DEVELOPER handoff
- **Focus**: Validate implemented features

### REVIEWER Session
- **Status**: WAITING  
- **Dependencies**: TESTER completion
- **Expected Start**: After TESTER handoff
- **Focus**: Quality and architecture review

---
*Auto-generated on $TODAY*
*Updated by: Sprint setup script*
EOF

# 2. Create daily changelog file
echo "Creating task-changelog-$TODAY.md..."
cat > "$ACTIVE_DIR/task-changelog-$TODAY.md" << EOF
# Task Changelog - $TODAY

**Sprint**: Template Hygiene Sweep  
**Date**: $(date +"%A, %B %d, %Y")  

## Change Log Entries

### $TODAY 09:00 - Sprint Day Setup
- **Action**: Daily files created
- **By**: Sprint setup script  
- **Files Created**: 
  - task-status-$TODAY.md
  - task-changelog-$TODAY.md (this file)
  - role-context files for all three roles
- **Status**: Ready for role assignments

---

*This file will be updated throughout the day by each role session*
*Format: YYYY-MM-DD HH:MM - [Role] - [Action] - [Details]*

### Example Entries:
*$TODAY 10:30 - DEVELOPER - Started TASK-001 - Beginning dynamic resource selection implementation*
*$TODAY 11:45 - DEVELOPER - Committed abc123f - Dynamic discovery method implemented*  
*$TODAY 14:00 - TESTER - Started validation - Testing TASK-001 implementation*
*$TODAY 15:30 - REVIEWER - Quality review - Assessing code quality and architecture*
EOF

# 3. Generate role context files for each role
echo "Generating role context files..."

# Get current git status for context
GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
GIT_STATUS=$(git status --porcelain | wc -l)
UNCOMMITTED_CHANGES="No"
if [ "$GIT_STATUS" -gt 0 ]; then
    UNCOMMITTED_CHANGES="Yes - $(git status --porcelain | head -3 | tr '\n' '; ')"
fi

# DEVELOPER role context
cat > "$ACTIVE_DIR/role-context-developer-$TODAY.md" << EOF
# Daily Role Context - DEVELOPER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: DEVELOPER  

## Today's Mission
Implement dynamic resource selection and evidence completeness scoring to bring cluster-health and monitoring templates up to ingress template robustness standards.

## Role Assignment Boundaries
**Sprint Timeline**: Day 1 of 3-day focused sprint  
**Working Philosophy**: Functional over perfect, reuse ingress patterns  
**Pattern Priority**: Copy proven patterns from ingress template  
**Time Box**: 3-4 hours maximum  

## Tasks Assigned for Today

### Primary Tasks (Must Complete)
- **TASK-001**: Dynamic Resource Selection Pattern
  - **Priority**: HIGH
  - **Estimated Effort**: 2-3 hours
  - **Acceptance Criteria**: Replace hardcoded resources with dynamic discovery
  - **Dependencies**: None
  - **Files to Modify**: \`src/lib/templates/cluster-health-template.ts\`
  - **Pattern Source**: \`src/lib/templates/ingress-template.ts\`

- **TASK-002**: Evidence Completeness Scoring
  - **Priority**: HIGH  
  - **Estimated Effort**: 1-2 hours
  - **Acceptance Criteria**: Implement completeness scoring with 0.9+ target
  - **Dependencies**: None (can be done in parallel)
  - **Files to Modify**: \`src/lib/templates/monitoring-template.ts\`

### Secondary Tasks (If Time Permits)
- **TASK-003**: Robust Output Parsing
  - **Priority**: MEDIUM
  - **Estimated Effort**: 1.5-2 hours
  - **Note**: Only attempt if primary tasks completed early

## Context from Previous Sessions

### Yesterday's Status
Sprint initialization completed:
- Directory structure created
- Role definitions established
- Task planning completed
- Templates and scripts ready

### Git State
- **Current Branch**: $GIT_BRANCH
- **Uncommitted Changes**: $UNCOMMITTED_CHANGES
- **Commits Ready to Merge**: None (clean state)

### Known Issues/Blockers
- No known blockers for assigned tasks
- Ingress template patterns are proven and ready to copy
- All required files exist and are accessible

## Implementation Guidance

### Existing Patterns to Use
- **Dynamic Resource Discovery**: Copy from \`ingress-template.ts\` lines 45-67
- **Evidence Completeness**: Copy pattern from \`ingress-template.ts\` lines 89-105
- **Error Handling**: Use established error boundary patterns
- **Testing**: Follow existing Jest test structure in \`tests/templates/\`

### Files You'll Likely Touch
- \`src/lib/templates/cluster-health-template.ts\` (TASK-001)
- \`src/lib/templates/monitoring-template.ts\` (TASK-002)  
- \`tests/templates/cluster-health.test.ts\` (new tests)
- \`tests/templates/monitoring.test.ts\` (new tests)

### Quality Requirements
- Copy proven patterns exactly, don't innovate
- All new code must have basic test coverage
- Ensure all existing tests still pass
- Document any deviations from ingress pattern

## Success Criteria for Today
- [ ] TASK-001 implemented with dynamic resource selection working
- [ ] TASK-002 implemented with evidence completeness scoring ≥0.9
- [ ] Both templates achieve same robustness as ingress template
- [ ] All tests passing (existing + new)
- [ ] Clear handoff notes for TESTER role
- [ ] No regressions in existing functionality

## Role Chain Context
**Your Output Feeds**: TESTER role (who validates your implementations)  
**Next in Chain**: REVIEWER role (who assesses quality and architecture)  
**Final Gate**: Human review for sprint completion  

## Emergency Contacts/Escalation
- **Technical Blockers**: Document in completion log, continue with next task
- **Pattern Questions**: Refer to ingress template implementation
- **Scope Questions**: Stick to defined tasks, note extras for backlog

---
*Generated on $TODAY at $(date +%H:%M)*
*Role Assignment by: Sprint setup script*
*Expected Session Duration: 3-4 hours*
EOF

# TESTER role context
cat > "$ACTIVE_DIR/role-context-tester-$TODAY.md" << EOF
# Daily Role Context - TESTER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: TESTER  

## Today's Mission
Validate that cluster-health and monitoring templates achieve the same robustness level as the proven ingress template through systematic testing.

## Role Assignment Boundaries
**Testing Philosophy**: Verify templates work with real cluster resources, no 404 errors  
**Scope**: Test dynamic resource selection and evidence completeness features  
**Time Box**: 2-3 hours  
**Coverage Goal**: Match ingress template reliability  

## Tasks Assigned for Testing

### Primary Testing Tasks
- **TASK-001**: Validate Dynamic Resource Selection
  - **Test Focus**: Verify real resource discovery works correctly
  - **Success Criteria**: No hardcoded resource names, handles zero resources
  - **Key Test**: Run against real cluster with various resource states

- **TASK-002**: Validate Evidence Completeness Scoring  
  - **Test Focus**: Verify scoring calculation and 0.9+ target achievement
  - **Success Criteria**: Consistent scoring, appropriate evidence collection
  - **Key Test**: Compare completeness scores across different scenarios

### Secondary Testing (If Time Permits)
- **Integration Testing**: Verify templates work with existing template engine
- **Regression Testing**: Ensure no existing functionality broken
- **Comparison Testing**: Compare robustness with ingress template baseline

## Context from DEVELOPER Session

### Expected DEVELOPER Output
*This section will be populated from dev-completion-log-$TODAY.md when available*

- **Completion Status**: [Will be filled by DEVELOPER session]
- **Implementation Approach**: [From dev completion log]
- **Commits Created**: [List from dev log]
- **Files Modified**: [From dev log]

### Implementation Notes to Validate
- Dynamic resource selection replaces hardcoded names
- Evidence completeness scoring implemented
- Patterns copied from ingress template
- All tests passing after implementation

## Testing Strategy

### Functional Testing Plan
1. **Dynamic Resource Discovery**: 
   - Test with various cluster states (empty, partial, full)
   - Verify graceful handling of zero resources
   - Confirm real resource names used instead of placeholders

2. **Evidence Completeness**:
   - Test completeness calculation accuracy
   - Verify 0.9+ target achievement  
   - Compare scoring consistency across runs

3. **Integration Testing**:
   - Verify templates work with template engine
   - Test with real MCP-ocs tool calls
   - Confirm backward compatibility maintained

### Test Environment Setup
```bash
# Test environment preparation
git pull                           # Get DEVELOPER changes
npm install                       # Ensure dependencies current  
npm test                          # Verify existing tests pass
npm run test:templates            # Run template-specific tests
```

### Success Validation
- [ ] No 404 errors during template execution
- [ ] Dynamic resource selection working correctly  
- [ ] Evidence completeness scoring ≥0.9 achieved
- [ ] Templates match ingress template robustness
- [ ] All existing tests still passing
- [ ] Integration with template engine successful

## Expected Robustness Benchmarks
*Based on ingress template performance*

- **Error Rate**: 0% with real cluster resources
- **Evidence Completeness**: 0.9+ (90%+)  
- **Resource Discovery**: 100% success with available resources
- **Integration**: Seamless with existing template engine

## Role Chain Context
**Your Input From**: DEVELOPER role (implementations to validate)  
**Your Output Feeds**: REVIEWER role (who assesses overall quality)  
**Validation Standard**: Ingress template robustness level  

## Testing Priorities
1. **Critical**: No 404 errors or parsing failures
2. **High**: Evidence completeness targets met
3. **Medium**: Integration and regression testing
4. **Low**: Performance and edge case exploration

---
*Generated on $TODAY at $(date +%H:%M)*
*Role Assignment by: Sprint setup script*
*Expected Session Duration: 2-3 hours*
EOF

# REVIEWER role context  
cat > "$ACTIVE_DIR/role-context-reviewer-$TODAY.md" << EOF
# Daily Role Context - REVIEWER

**Date**: $TODAY  
**Sprint**: Template Hygiene Sweep  
**Role**: REVIEWER  

## Today's Mission
Conduct comprehensive review to ensure cluster-health and monitoring templates achieve production-quality robustness matching the ingress template standard.

## Role Assignment Boundaries
**Review Philosophy**: Verify patterns correctly copied, architecture maintained, quality achieved  
**Scope**: Review dynamic resource selection and evidence completeness implementations  
**Time Box**: 1-2 hours  
**Quality Standard**: Ingress template robustness level  

## Tasks Assigned for Review

### Primary Review Tasks
- **TASK-001**: Review Dynamic Resource Selection Implementation
  - **Quality Focus**: Pattern fidelity, error handling, resource discovery logic
  - **Architecture Focus**: Consistency with ingress template approach
  - **Risk Assessment**: Impact on existing template engine integration

- **TASK-002**: Review Evidence Completeness Scoring Implementation
  - **Quality Focus**: Calculation accuracy, scoring consistency, target achievement
  - **Architecture Focus**: Integration with template results structure
  - **Performance Focus**: Scoring efficiency and resource usage

## Context from Previous Roles

### DEVELOPER Implementation Summary
*This section will be populated from dev-completion-log-$TODAY.md when available*

- **Tasks Completed**: [From dev log]
- **Implementation Approach**: [From dev log]  
- **Pattern Fidelity**: [How closely ingress patterns were followed]
- **Files Modified**: [List from dev log]

### TESTER Validation Summary  
*This section will be populated from test-completion-log-$TODAY.md when available*

- **Test Results**: [Overall validation outcome]
- **Robustness Achievement**: [Comparison to ingress template]
- **Issues Found**: [Any testing concerns]
- **Quality Assessment**: [TESTER quality observations]

## Review Strategy

### Code Quality Review Plan
1. **Pattern Fidelity Review**: Verify ingress patterns copied correctly
2. **Implementation Quality**: Assess code clarity and maintainability  
3. **Error Handling**: Review boundary conditions and failure modes
4. **Integration Impact**: Assess impact on existing template engine

### Architecture Review Plan
1. **ADR Compliance**: Verify alignment with ADR-013 (Template Engine)
2. **Pattern Consistency**: Ensure consistent approach across templates
3. **Abstraction Maintenance**: Verify appropriate abstraction levels maintained
4. **Technical Debt**: Assess any technical debt introduced or resolved

### Quality Gates Assessment

### Must Pass Gates:
- [ ] **Pattern Fidelity**: Ingress template patterns correctly implemented
- [ ] **Robustness Achievement**: Same reliability as ingress template  
- [ ] **Architecture Alignment**: Consistent with template engine design
- [ ] **Quality Standard**: Code meets MCP-ocs quality standards
- [ ] **Test Coverage**: Adequate test coverage for new functionality
- [ ] **Integration**: Seamless integration with existing system

## Expected Review Focus Areas

### Dynamic Resource Selection Review:
- **Implementation Fidelity**: How closely does it match ingress pattern?
- **Error Handling**: Are all error cases from ingress pattern covered?  
- **Resource Discovery**: Is discovery logic robust and efficient?
- **Edge Cases**: Are zero-resource and error scenarios handled?

### Evidence Completeness Review:
- **Scoring Logic**: Is calculation correct and consistent?
- **Target Achievement**: Does it reliably achieve 0.9+ completeness?
- **Integration**: How well does it integrate with template results?
- **Performance**: Is scoring efficient and non-intrusive?

## Success Criteria for Today
- [ ] Comprehensive quality assessment completed for both tasks
- [ ] Pattern fidelity verified against ingress template
- [ ] Architecture alignment confirmed
- [ ] Quality gates assessment completed
- [ ] Clear recommendation (approve/conditional/reject) provided
- [ ] Specific feedback for any improvements needed

## Quality Benchmarks
*Based on ingress template standards*

- **Code Quality Score**: Target 8+ out of 10
- **Pattern Compliance**: 100% fidelity to ingress approach
- **Robustness Level**: Match ingress template reliability  
- **Integration Impact**: Zero negative impact on existing system

## Review Methodology

### Comparative Analysis:
1. **Side-by-side**: Compare new implementations with ingress template
2. **Pattern Mapping**: Verify each ingress pattern element present
3. **Quality Metrics**: Compare code quality indicators
4. **Robustness Testing**: Verify similar error handling capabilities

## Role Chain Context
**Your Input From**: DEVELOPER (implementation) + TESTER (validation)  
**Your Output Feeds**: Human review (final sprint assessment)  
**Quality Gate**: Final approval for template hygiene completion  

## Decision Framework
- **✅ APPROVE**: High fidelity to patterns, robustness achieved
- **⚠️ CONDITIONAL**: Good implementation, minor adjustments needed  
- **❌ REJECT**: Significant issues, requires DEVELOPER rework

---
*Generated on $TODAY at $(date +%H:%M)*
*Role Assignment by: Sprint setup script*
*Expected Session Duration: 1-2 hours*
EOF

echo -e "${GREEN}✅ Daily files created successfully!${NC}"
echo
echo -e "${BLUE}📋 Summary of files created:${NC}"
echo "  - task-status-$TODAY.md"
echo "  - task-changelog-$TODAY.md"
echo "  - role-context-developer-$TODAY.md"
echo "  - role-context-tester-$TODAY.md"
echo "  - role-context-reviewer-$TODAY.md"
echo

echo -e "${YELLOW}🎯 Next Steps:${NC}"
echo "1. Review the role context files to confirm task assignments"
echo "2. Start DEVELOPER session with: codex --task-context role-context-developer-$TODAY.md"
echo "3. TESTER session follows after DEVELOPER completes and creates completion log"
echo "4. REVIEWER session follows after TESTER completes"
echo "5. Human review and sprint day wrap-up"
echo

echo -e "${BLUE}📁 File Locations:${NC}"
echo "  Active Tasks: sprint-management/active-tasks/"
echo "  Completion Logs: sprint-management/completion-logs/"
echo "  Master Tasks: sprint-management/tasks-current.md"
echo

echo -e "${GREEN}✨ Sprint day $TODAY is ready to begin!${NC}"
