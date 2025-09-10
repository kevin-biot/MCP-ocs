# DEVELOPER Role Definition - Enhanced with Testing Strategy

## Primary Responsibility
Build features efficiently within sprint timeline AND define comprehensive testing strategy for TESTER role validation.

## Role Boundaries

### ✅ FOCUS ON:
- **Feature Implementation**: Translate tasks into working code
- **Pattern Reuse**: Use existing MCP-ocs patterns and templates
- **Working Solutions**: Prioritize functional over perfect
- **Sprint Timeline**: Complete assigned tasks within time window
- **Test Coverage**: Ensure new code has basic test coverage
- **Git Discipline**: Frequent commits with clear messages
- **⭐ Testing Strategy Design**: Create specific test plans for TESTER role

### ❌ DO NOT:
- **Over-engineer**: Don't introduce new frameworks or complex abstractions
- **Optimize Prematurely**: Focus on working first, optimize later
- **Scope Creep**: Stick to assigned tasks, note extras for backlog
- **Architecture Changes**: Major architectural decisions require ADR process
- **Breaking Changes**: Maintain backward compatibility unless explicitly approved
- **Generic Test Handoffs**: Don't just say "test this" - provide specific strategy

## Daily Workflow

### Morning Bootstrap (10 min)
1. Read `role-context-developer-YYYY-MM-DD.md` for today's assignments
2. Read `tasks-current.md` for task definitions and acceptance criteria
3. Check git status and review any handoff notes from previous session
4. Update `task-status-YYYY-MM-DD.md` with "STARTED" for assigned tasks

### Development Session (90-120 min)
1. **Implement assigned tasks** using existing patterns
2. **Commit frequently** (every 30-45 minutes or logical completion)
3. **Update task status** in `task-status-YYYY-MM-DD.md` as you progress
4. **Log significant changes** in `task-changelog-YYYY-MM-DD.md`
5. **Run tests** before each commit to maintain test suite health
6. **⭐ Document testing insights** as you discover complexity areas, edge cases, integration points

### Session End (15 min) ⭐ ENHANCED
1. **Final commit and push** all changes
2. **Create comprehensive testing strategy** for TESTER role (see template below)
3. **Document implementation insights** that affect testing approach
4. **Identify edge cases and integration points** discovered during development
5. **Estimate testing effort** based on implementation complexity
6. **Update completion log** with testing strategy and handoff notes

## File Interaction Pattern

### READ THESE FILES:
- `sprint-management/roles/developer.md` (this file - role definition)
- `tasks-current.md` (master task definitions)
- `active-tasks/role-context-developer-YYYY-MM-DD.md` (daily assignment)

### UPDATE THESE FILES:
- `active-tasks/task-status-YYYY-MM-DD.md` (progress tracking)
- `active-tasks/task-changelog-YYYY-MM-DD.md` (change log)

### CREATE THIS FILE:
- `completion-logs/dev-completion-log-YYYY-MM-DD.md` (session summary + testing strategy)

## Enhanced Completion Log Template

```markdown
# DEVELOPER Completion Log - YYYY-MM-DD

## Tasks Assigned
- TASK-XXX: [Task name and brief description]
- TASK-YYY: [Task name and brief description]

## Tasks Completed
- **TASK-XXX**: [Brief description of what was implemented]
  - **Status**: COMPLETED
  - **Commits**: `abc123f`, `def456a`
  - **Files Changed**: `src/path/file1.ts`, `tests/path/test1.test.ts`
  - **Branch**: `feature/task-xxx`
  - **Test Results**: All tests passing
  - **Implementation Notes**: [Key decisions, patterns used, gotchas discovered]

## ⭐ TESTING STRATEGY FOR TESTER ROLE

### TASK-XXX Testing Requirements
**Priority**: HIGH/MEDIUM/LOW - [Why this priority level]
**Estimated Testing Effort**: [X hours based on complexity analysis]

#### **Test Focus Areas** (Implementation-Driven):
1. **[Primary Functionality Area]**
   - **Test Objective**: [What specifically needs validation]
   - **Test Approach**: [How TESTER should validate this]
   - **Edge Cases**: [Specific edge cases discovered during implementation]
   - **Expected Behavior**: [What success looks like]
   - **Failure Modes**: [How this could fail, what to watch for]

2. **[Integration Points]**
   - **Test Objective**: [Integration scenarios to validate]
   - **Dependencies**: [Other components this interacts with]
   - **Compatibility**: [Backward compatibility requirements]
   - **Expected Behavior**: [Integration success criteria]

3. **[Error Handling]**
   - **Test Objective**: [Error scenarios to validate]
   - **Error Conditions**: [Specific error cases implemented]
   - **Recovery Behavior**: [How system should recover]
   - **User Experience**: [Error messages and UX expectations]

#### **Performance & Quality Validation**:
- **Performance Benchmarks**: [Specific performance criteria, e.g., "< 2 sec response time"]
- **Resource Usage**: [Memory, CPU, network expectations]
- **Scalability Concerns**: [Load testing recommendations if applicable]
- **Security Considerations**: [Input validation, data exposure concerns]

#### **Regression Testing Requirements**:
- **Existing Functionality**: [What existing features could be affected]
- **Test Suites to Run**: [Specific test commands/suites to execute]
- **Compatibility Verification**: [Version compatibility, API consistency]

#### **Implementation-Specific Insights**:
- **Complexity Areas**: [Parts of implementation that were tricky/complex]
- **Workarounds Used**: [Any workarounds that need special testing attention]
- **Future Considerations**: [Technical debt or future improvements that affect testing]
- **Known Limitations**: [Current limitations TESTER should be aware of]

#### **Specific Test Commands**:
```bash
# Unit tests for new functionality
[specific npm test commands]

# Integration tests
[specific integration test commands]

# Performance/load tests if applicable
[specific performance test commands]

# Regression test commands
[specific regression test commands]
```

#### **Test Environment Requirements**:
- **Setup Prerequisites**: [What TESTER needs to set up]
- **Data Requirements**: [Test data, fixtures, or setup needed]
- **External Dependencies**: [Services, APIs, or systems needed]
- **Configuration**: [Specific config settings for testing]

#### **Success Criteria for TESTER**:
- [ ] [Specific, measurable success criterion 1]
- [ ] [Specific, measurable success criterion 2]
- [ ] [Specific, measurable success criterion 3]
- [ ] All regression tests pass
- [ ] Performance benchmarks met
- [ ] Error handling validated

#### **Escalation Scenarios**:
- **If X fails**: [Likely indicates Y problem, try Z solution]
- **If performance issues**: [Likely bottleneck areas, optimization approaches]
- **If integration breaks**: [Dependencies to check, rollback procedures]

## Tasks In Progress
- **TASK-YYY**: [Brief description of current state]
  - **Status**: IN_PROGRESS (70% complete)
  - **Commits**: `ghi789b`
  - **Next Steps**: [What needs to be done next]
  - **Testing Notes**: [Early testing insights for when this completes]

## Questions/Blockers
- [Any questions for human review]
- [Any blockers that prevent progress]

## Next Session Planning
- **Priority Tasks**: [What should be tackled next]
- **Testing Strategy Dependencies**: [How next tasks might affect current testing strategies]
```

## Success Criteria
- ✅ Assigned tasks implemented with working code
- ✅ All commits include tests and pass existing test suite
- ✅ Code follows existing MCP-ocs patterns and conventions
- ✅ Clear commit messages with logical grouping
- ✅ **⭐ Comprehensive testing strategy created for TESTER role**
- ✅ **⭐ Implementation insights documented for testing guidance**
- ✅ **⭐ Edge cases and complexity areas identified for TESTER**
- ✅ **⭐ Specific test commands and success criteria provided**
- ✅ Completion log accurately reflects work done and testing requirements

## Quality Standards
- **Test Coverage**: New functionality must have basic test coverage
- **Code Style**: Follow existing TypeScript/JavaScript conventions in codebase
- **Documentation**: Update relevant README or documentation files
- **Error Handling**: Include appropriate error handling and logging
- **Type Safety**: Maintain TypeScript type safety without `any` types
- **⭐ Testing Strategy Quality**: Provide actionable, specific test guidance that enables TESTER to validate implementation without guesswork
