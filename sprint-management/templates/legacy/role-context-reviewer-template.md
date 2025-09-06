# Daily Role Context Template - REVIEWER

**Date**: YYYY-MM-DD  
**Sprint**: [Sprint Name/Number]  
**Role**: REVIEWER  

## Today's Mission
[Brief description of today's review focus - 1-2 sentences]

## Role Assignment Boundaries
**Review Philosophy**: Assess quality, architecture alignment, and release readiness  
**Scope**: Review only what was implemented and tested today  
**Time Box**: [Estimated session duration]  
**Quality Standards**: MCP-ocs patterns, ADR compliance, security best practices  

## Tasks Assigned for Review

### Primary Review Tasks
- **TASK-XXX**: [Task name from completion logs]
  - **Implementation**: [Brief summary from dev log]
  - **Test Results**: [Summary from test log]
  - **Review Focus**: [Specific areas to focus review on]
  - **Risk Level**: [HIGH/MEDIUM/LOW based on task complexity]

- **TASK-YYY**: [Second task if applicable]
  - **Implementation**: [Summary]
  - **Test Results**: [Summary]
  - **Review Requirements**: [What aspects need review attention]

## Context from Previous Roles

### DEVELOPER Implementation Summary
[Key points from dev-completion-log-YYYY-MM-DD.md]
- **Features Implemented**: [List]
- **Implementation Approach**: [How it was built]
- **Commits**: [List of commit hashes]
- **Files Changed**: [List of modified files]
- **DEVELOPER Notes**: [Any concerns or notes]

### TESTER Validation Summary
[Key points from test-completion-log-YYYY-MM-DD.md]
- **Test Results**: [Overall pass/fail status]
- **Issues Found**: [Any issues identified by TESTER]
- **Quality Assessment**: [TESTER's quality observations]
- **TESTER Recommendations**: [Any recommendations from testing]

## Review Strategy

### Code Quality Review Plan
1. **Maintainability Assessment**: Code organization and clarity
2. **Pattern Compliance**: Adherence to existing MCP-ocs patterns
3. **Error Handling Review**: Robustness and appropriate error management
4. **Type Safety Review**: TypeScript usage and type definitions
5. **Performance Assessment**: Efficiency and resource usage

### Architecture Review Plan
1. **ADR Alignment**: Check compliance with relevant ADRs
   - [List relevant ADRs based on task area]
2. **Pattern Usage**: Verify proper use of established patterns
3. **Abstraction Level**: Appropriate level of abstraction
4. **Integration Points**: How new code integrates with existing system

### Security Review Plan
1. **Input Validation**: User input handling
2. **Output Encoding**: Proper data encoding/escaping
3. **Authentication/Authorization**: If applicable
4. **Error Information**: Ensure no sensitive data in errors

## Expected Review Areas

### Based on Task Analysis:
- **Primary Focus Area**: [Main area requiring review attention]
- **Secondary Areas**: [Additional areas to review]
- **Risk Concerns**: [Areas of particular concern]
- **Integration Points**: [Key integration areas to validate]

### Relevant ADRs for Review:
- **ADR-XXX**: [Relevant architectural decision]
- **ADR-YYY**: [Another relevant decision]
- **Pattern Compliance**: [Expected patterns to verify]

## Quality Gates Assessment

### Must Pass Gates:
- [ ] **Code Quality**: Maintainable, readable, follows conventions
- [ ] **Architecture Alignment**: Complies with ADRs and patterns  
- [ ] **Security Review**: No significant security concerns
- [ ] **Test Coverage**: Adequate test coverage exists
- [ ] **Documentation**: Appropriate documentation provided
- [ ] **Performance**: No significant performance degradation

### Risk Assessment Framework:
- **LOW Risk**: Minor changes, well-tested, follows patterns
- **MEDIUM Risk**: Moderate complexity, some new patterns, good test coverage
- **HIGH Risk**: Complex changes, architectural impact, needs careful review

## Success Criteria for Today
- [ ] Comprehensive quality assessment completed
- [ ] Clear approval/rejection decision with rationale
- [ ] Issues categorized by priority and impact
- [ ] Specific, actionable recommendations provided
- [ ] Architecture compliance verified
- [ ] Release readiness determination made
- [ ] Handoff notes complete for human review

## Review Methodology

### Quality Scoring Approach (1-10):
- **Code Quality**: Structure, readability, maintainability
- **Architecture**: Pattern compliance, design consistency
- **Security**: Risk assessment, best practices
- **Performance**: Efficiency, resource usage
- **Documentation**: Completeness, accuracy

### Decision Framework:
- **✅ APPROVE**: High quality, ready for release
- **⚠️ CONDITIONAL**: Good quality, minor fixes needed
- **❌ REJECT**: Significant issues, needs rework

## Special Considerations

### For This Sprint:
[Any sprint-specific considerations]
- **Sprint Goals**: [How tasks relate to sprint objectives]
- **Technical Debt**: [Any technical debt considerations]
- **Future Impact**: [How changes affect future development]

### Integration Concerns:
- **Compatibility**: Backward compatibility maintained?
- **Dependencies**: Any new dependencies introduced?
- **Migration**: Any migration requirements for existing users?

## Role Chain Context
**Your Input From**: DEVELOPER role (implementation) + TESTER role (validation)  
**Your Output Feeds**: Human review (final decision making)  
**Decision Weight**: Quality gate for release readiness  

## Escalation Criteria
- **Architecture Conflicts**: Escalate to human+Claude for ADR review
- **Security Concerns**: Flag for immediate human security review
- **Performance Issues**: Document with impact assessment
- **Pattern Evolution**: Assess if new patterns should be formalized

---
*Generated from template on [generation-date]*
*Role Assignment by: [human/claude]*
*Expected Session Duration: [time-estimate]*
