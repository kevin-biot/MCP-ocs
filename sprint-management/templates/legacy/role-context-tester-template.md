# Daily Role Context Template - TESTER

**Date**: YYYY-MM-DD  
**Sprint**: [Sprint Name/Number]  
**Role**: TESTER  

## Today's Mission
[Brief description of today's testing focus - 1-2 sentences]

## Role Assignment Boundaries
**Testing Philosophy**: Validate functionality, identify edge cases, ensure quality  
**Scope**: Test only what was implemented by DEVELOPER role today  
**Time Box**: [Estimated session duration]  
**Coverage Goal**: Verify acceptance criteria and critical paths  

## Tasks Assigned for Testing

### Primary Testing Tasks
- **TASK-XXX**: [Task name from DEVELOPER completion log]
  - **Implementation Status**: [From dev-completion-log]
  - **Commits to Test**: [Specific commits from dev log]
  - **Files to Validate**: [Files changed by DEVELOPER]
  - **Acceptance Criteria**: [From tasks-current.md]
  - **Test Focus**: [Specific areas to focus testing on]

- **TASK-YYY**: [Second task if applicable]
  - **Implementation Status**: [Status from dev log]
  - **Test Requirements**: [What needs validation]

### Secondary Testing (If Time Permits)
- **Regression Testing**: Verify no existing functionality broken
- **Integration Testing**: Ensure new code works with existing system
- **Edge Case Exploration**: Test boundary conditions

## Context from DEVELOPER Session

### What Was Built Today
[Summary from dev-completion-log-YYYY-MM-DD.md]
- **Completed Features**: [List from dev log]
- **Implementation Approach**: [How it was built]
- **Known Limitations**: [Any noted limitations]

### Code Changes
- **Commits**: [List of commit hashes from dev log]
- **Files Modified**: [List from dev log]
- **New Tests Added**: [Any tests DEVELOPER added]

### DEVELOPER Notes
[Any specific notes or concerns from DEVELOPER handoff]
- **Test Suggestions**: [Areas DEVELOPER suggested focusing on]
- **Known Issues**: [Any issues DEVELOPER identified]
- **Implementation Decisions**: [Key decisions made during development]

## Testing Strategy

### Functional Testing Plan
1. **Happy Path Testing**: Verify normal use cases work
2. **Error Path Testing**: Verify error conditions handled properly
3. **Boundary Testing**: Test edge cases and limits
4. **Integration Testing**: Verify interaction with existing code

### Test Environment Setup
```bash
# Commands to set up testing environment
git pull                           # Get latest code
npm install                       # Ensure dependencies current
npm test                          # Run existing test suite
npm run test:integration          # Run integration tests
```

### Coverage Requirements
- [ ] All acceptance criteria verified
- [ ] Critical error conditions tested
- [ ] Integration points validated
- [ ] Regression testing completed

## Expected Issues/Risks
[Based on task complexity and implementation notes]
- **Risk Area 1**: [Potential issue area]
- **Risk Area 2**: [Another potential concern]
- **Mitigation**: [How to test these risk areas]

## Success Criteria for Today
- [ ] All assigned tasks thoroughly tested
- [ ] Clear pass/fail determination for each task
- [ ] Issues documented with reproduction steps
- [ ] Handoff notes complete for REVIEWER role
- [ ] Test results logged in completion log
- [ ] Recommendations provided for any issues found

## Testing Checklist

### For Each Task:
- [ ] **Functionality**: Does it work as designed?
- [ ] **Acceptance Criteria**: All criteria met?
- [ ] **Error Handling**: Fails gracefully?
- [ ] **Integration**: Works with existing code?
- [ ] **Performance**: Acceptable performance?
- [ ] **Edge Cases**: Boundary conditions handled?

### Documentation:
- [ ] **Test Results**: Clearly documented
- [ ] **Issues Found**: Specific reproduction steps
- [ ] **Recommendations**: Clear guidance for fixes

## Role Chain Context
**Your Input From**: DEVELOPER role (implementations to validate)  
**Your Output Feeds**: REVIEWER role (who assesses overall quality)  
**Information Source**: dev-completion-log-YYYY-MM-DD.md  

## Communication Protocol
- **Critical Issues**: Document immediately, flag for urgent attention
- **Minor Issues**: Document with severity and impact assessment
- **Enhancement Ideas**: Note for future consideration
- **Blocking Issues**: Clearly identify what prevents task acceptance

---
*Generated from template on [generation-date]*
*Role Assignment by: [human/claude]*
*Expected Session Duration: [time-estimate]*
