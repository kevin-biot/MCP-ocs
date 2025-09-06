# Daily Role Context Template - DEVELOPER

**Date**: YYYY-MM-DD  
**Sprint**: [Sprint Name/Number]  
**Role**: DEVELOPER  

## Today's Mission
[Brief description of today's development focus - 1-2 sentences]

## Role Assignment Boundaries
**Sprint Timeline**: Day X of 6-day sprint  
**Working Philosophy**: Functional over perfect, ship working solutions  
**Pattern Priority**: Use existing MCP-ocs patterns, avoid new frameworks  
**Time Box**: [Estimated session duration]  

## Tasks Assigned for Today

### Primary Tasks (Must Complete)
- **TASK-XXX**: [Task name from tasks-current.md]
  - **Priority**: HIGH
  - **Estimated Effort**: [Time estimate]
  - **Acceptance Criteria**: [Key criteria from tasks-current.md]
  - **Dependencies**: [Any dependencies or blockers]
  - **Files to Modify**: [Expected files based on task]

- **TASK-YYY**: [Second task if applicable]
  - **Priority**: MEDIUM
  - **Estimated Effort**: [Time estimate]
  - **Acceptance Criteria**: [Key criteria]
  - **Dependencies**: [Any dependencies or blockers]

### Secondary Tasks (If Time Permits)
- **TASK-ZZZ**: [Lower priority task]
  - **Priority**: LOW
  - **Estimated Effort**: [Time estimate]
  - **Note**: Only attempt if primary tasks completed

## Context from Previous Sessions

### Yesterday's Status
[Summary from previous dev-completion-log]
- **Completed**: [What was finished]
- **In Progress**: [What's partially done]
- **Handoff Notes**: [Any specific notes for today]

### Git State
- **Current Branch**: [Active branch name]
- **Uncommitted Changes**: [Yes/No - describe if yes]
- **Commits Ready to Merge**: [List any pending commits]

### Known Issues/Blockers
- [Any known issues that might affect today's work]
- [Workarounds or solutions for known issues]

## Implementation Guidance

### Existing Patterns to Use
- **Template Engine**: Located in `src/lib/templates/`
- **Tool Registration**: Use `ToolRegistry` pattern
- **Memory Integration**: Use `MCPOcsMemoryAdapter`
- **Error Handling**: Follow existing error boundary patterns
- **Testing**: Use Jest with existing test structure

### Files You'll Likely Touch
[Based on assigned tasks, list expected files]
- `src/lib/[expected-area]/`
- `tests/[expected-test-files]`
- `docs/[expected-docs]`

### Quality Requirements
- All new code must have basic test coverage
- Follow existing TypeScript conventions
- Update relevant documentation
- Ensure all tests pass before committing

## Success Criteria for Today
- [ ] Primary tasks implemented and tested
- [ ] All commits include relevant tests
- [ ] Code follows existing patterns and conventions
- [ ] Documentation updated where necessary
- [ ] Clear handoff notes for TESTER role
- [ ] No regressions in existing functionality

## Role Chain Context
**Your Output Feeds**: TESTER role (who validates your implementations)  
**Next in Chain**: REVIEWER role (who assesses quality and architecture)  
**Final Gate**: Human review and acceptance  

## Emergency Contacts/Escalation
- **Technical Blockers**: Document in completion log for human review
- **Architecture Questions**: Note for ADR process consideration
- **Scope Creep**: Add to backlog, don't implement without approval

---
*Generated from template on [generation-date]*
*Role Assignment by: [human/claude]*
*Expected Session Duration: [time-estimate]*
