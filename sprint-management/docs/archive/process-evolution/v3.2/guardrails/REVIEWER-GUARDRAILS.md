# [LEGACY — v3.2 Archived] REVIEWER Role Guardrails

**Role**: REVIEWER  
**Framework**: Process v3.2 Enhanced  
**Status**: Comprehensive Execution and Quality Standards  
**Last Updated**: 2025-09-02  

## SYSTEMATIC EXECUTION FRAMEWORK

### Phase-by-Phase Review Protocol

#### **PHASE 1: Context Analysis and Planning** (10-15 minutes)
- [ ] **Implementation Review**: Analyze DEVELOPER completion logs and code changes
- [ ] **Testing Assessment**: Review TESTER validation results and quality gates
- [ ] **Architecture Impact**: Evaluate changes against system architecture and ADRs
- [ ] **Quality Standards Selection**: Choose appropriate review depth for complexity tier
- [ ] **Review Strategy Definition**: Plan systematic assessment approach

#### **PHASE 2: Comprehensive Quality Assessment** (45-75 minutes)
- [ ] **Code Quality Analysis**: Systematic evaluation against standards
- [ ] **Architecture Compliance**: Verify alignment with established patterns
- [ ] **Security Assessment**: Validate trust boundaries and input handling
- [ ] **Performance Evaluation**: Review efficiency and resource usage
- [ ] **Integration Impact**: Assess effects on broader system

#### **PHASE 3: Decision and Handoff** (15-20 minutes)
- [ ] **Quality Scoring**: Systematic evaluation with numerical assessment
- [ ] **Risk Assessment**: Identify potential issues and mitigation strategies
- [ ] **Release Readiness**: Determine approval status with clear rationale
- [ ] **Improvement Recommendations**: Provide actionable feedback
- [ ] **Documentation Completion**: Create comprehensive review summary

### Complexity Tier Review Standards

#### **TIER 1 Review (1-2 SP - Simple Tasks)**
- **Review Depth**: Core functionality, basic patterns, obvious issues
- **Time Allocation**: 45-60 minutes
- **Quality Threshold**: 7.0/10 minimum for approval
- **Focus Areas**: Functionality, basic security, pattern consistency

#### **TIER 2 Review (3-5 SP - Standard Implementation)**
- **Review Depth**: Comprehensive analysis, architecture alignment, security review
- **Time Allocation**: 75-90 minutes
- **Quality Threshold**: 7.5/10 minimum for approval
- **Focus Areas**: Quality, security, performance, integration impact

#### **TIER 3 Review (6+ SP - Complex Architecture)**
- **Review Depth**: Complete systematic analysis, architectural impact assessment
- **Time Allocation**: 90-120 minutes
- **Quality Threshold**: 8.0/10 minimum for approval
- **Focus Areas**: Architecture, scalability, security, long-term maintainability

## QUALITY STANDARDS AND SCORING CRITERIA

### Systematic Quality Assessment Framework

#### **Code Quality Scoring (25% of total score)**
**9-10 Points: Exceptional**
- [ ] **Pattern Consistency**: Perfect adherence to established patterns
- [ ] **Readability**: Self-documenting code with clear intent
- [ ] **Maintainability**: Easy to understand and modify
- [ ] **Efficiency**: Optimal algorithms and data structures

**7-8 Points: Good**
- [ ] **Pattern Adherence**: Mostly follows established patterns
- [ ] **Clear Structure**: Logical organization with minor issues
- [ ] **Reasonable Efficiency**: Acceptable performance characteristics
- [ ] **Minor Issues**: Small deviations that don't impact functionality

**5-6 Points: Adequate**
- [ ] **Basic Functionality**: Works but with pattern deviations
- [ ] **Structural Issues**: Organization problems affecting readability
- [ ] **Performance Concerns**: Inefficient but acceptable approaches
- [ ] **Maintenance Risk**: Harder to modify or extend

**Below 5 Points: Inadequate (Automatic Failure)**
- [ ] **Pattern Violations**: Significant deviations from standards
- [ ] **Poor Structure**: Difficult to understand or maintain
- [ ] **Performance Problems**: Unacceptable resource usage
- [ ] **Critical Issues**: Problems affecting functionality or security

#### **Architecture Compliance (25% of total score)**
**9-10 Points: Perfect Alignment**
- [ ] **ADR Compliance**: Full alignment with architectural decisions
- [ ] **Integration Harmony**: Seamless fit with existing systems
- [ ] **Future-Proof**: Extensible design supporting growth
- [ ] **Abstraction Levels**: Appropriate separation of concerns

**7-8 Points: Good Alignment**
- [ ] **Mostly Compliant**: Minor deviations from ADRs
- [ ] **Good Integration**: Works well with existing systems
- [ ] **Reasonable Design**: Adequate extensibility
- [ ] **Minor Issues**: Small architectural inconsistencies

**5-6 Points: Acceptable**
- [ ] **Basic Compliance**: Meets minimum architectural standards
- [ ] **Integration Works**: Functions with existing systems
- [ ] **Limited Extensibility**: Harder to modify or extend
- [ ] **Some Violations**: Architectural pattern deviations

#### **Security Assessment (25% of total score)**
**9-10 Points: Comprehensive Security**
- [ ] **Input Validation**: All inputs properly validated with schemas
- [ ] **Trust Boundaries**: Clear security boundaries maintained
- [ ] **Error Handling**: Security-conscious error responses
- [ ] **Data Protection**: Sensitive data properly handled

**7-8 Points: Good Security**
- [ ] **Most Inputs Validated**: Minor validation gaps
- [ ] **Boundaries Mostly Clear**: Some trust boundary issues
- [ ] **Adequate Error Handling**: Minor information leakage risk
- [ ] **Basic Data Protection**: Acceptable data handling

**5-6 Points: Minimum Security**
- [ ] **Basic Validation**: Some input validation present
- [ ] **Boundary Issues**: Trust boundary problems present
- [ ] **Poor Error Handling**: Information leakage risks
- [ ] **Data Concerns**: Suboptimal sensitive data handling

#### **Testing and Validation (25% of total score)**
**9-10 Points: Comprehensive Testing**
- [ ] **Full Coverage**: All critical paths tested
- [ ] **Edge Cases**: Boundary conditions properly tested
- [ ] **Integration Testing**: Component interactions validated
- [ ] **Performance Testing**: Appropriate performance validation

**7-8 Points: Good Testing**
- [ ] **Good Coverage**: Most critical paths tested
- [ ] **Some Edge Cases**: Basic boundary testing
- [ ] **Basic Integration**: Core interactions tested
- [ ] **Limited Performance**: Some performance validation

**5-6 Points: Adequate Testing**
- [ ] **Basic Coverage**: Core functionality tested
- [ ] **Minimal Edge Cases**: Limited boundary testing
- [ ] **No Integration**: Little integration testing
- [ ] **No Performance**: Performance not validated

## HISTORICAL PATTERNS - CRITICAL REVIEW FOCUS

### High-Risk Areas Requiring Special Attention

#### **D-001: Trust Boundary Security** (P0 - Always Review)
**Critical Review Points:**
- [ ] **Input Validation Schemas**: Every user input must have validation schema
- [ ] **SQL Parameterization**: No dynamic query construction without parameters
- [ ] **File Path Security**: All file operations must sanitize paths
- [ ] **Command Execution**: No shell execution with unsanitized input

**Review Questions:**
- Does this create any new attack vectors?
- Are all external inputs properly validated?
- Could an attacker manipulate this functionality?

**Historical Context**: Previous sprints missed input validation leading to security vulnerabilities

#### **D-002: Type Safety** (P1 - Pattern Enforcement)
**Critical Review Points:**
- [ ] **No Any Types**: Verify complete elimination of `any` usage
- [ ] **Safe Type Assertions**: All type assertions have runtime validation
- [ ] **Null Safety**: Proper handling of null/undefined throughout
- [ ] **Interface Compliance**: Runtime data matches declared interfaces

**Review Questions:**
- Will this break with unexpected data shapes?
- Are type assumptions properly validated?
- Could this fail silently with wrong types?

**Historical Context**: Type shortcuts cause runtime failures in production

#### **D-005: Async Correctness** (P0 - Concurrency Safety)
**Critical Review Points:**
- [ ] **Promise Handling**: All async operations properly awaited
- [ ] **Race Condition Prevention**: Concurrent operations safely managed
- [ ] **Error Propagation**: Async errors properly caught and handled
- [ ] **Timeout Management**: Long operations have appropriate limits

**Review Questions:**
- Could concurrent execution cause data corruption?
- Are all async operations properly sequenced?
- What happens if operations take too long?

**Historical Context**: Race conditions in tool execution caused data inconsistencies

#### **D-006: Error Handling** (P1 - Operational Reliability)
**Critical Review Points:**
- [ ] **Structured Errors**: Proper error taxonomy instead of generic Error
- [ ] **Context Preservation**: Error messages include sufficient debugging context
- [ ] **User-Appropriate Messages**: Different error messages for different audiences
- [ ] **Recovery Strategies**: Clear error recovery or graceful degradation

**Review Questions:**
- Will errors provide sufficient debugging information?
- Are user-facing errors appropriate and helpful?
- Can the system recover gracefully from failures?

**Historical Context**: Generic error handling made production debugging difficult

### Proven Successful Patterns (Encourage Usage)

#### **Dynamic Resource Discovery Pattern**
```typescript
// Successful pattern from ingress template
const resources = await discoverResources(namespace, selector);
if (resources.length === 0) {
    return createEmptyEvidence("No matching resources found");
}
```

**Review Validation:**
- [ ] Handles empty resource scenarios gracefully
- [ ] Provides meaningful fallback behavior
- [ ] Includes appropriate logging for debugging

#### **Evidence Completeness Scoring**
```typescript
// Proven reliability pattern
const completeness = calculateCompleteness(evidence);
if (completeness < 0.9) {
    addDiagnosticSteps(evidence, "Increase resource discovery scope");
}
```

**Review Validation:**
- [ ] Scoring calculation is transparent and auditable
- [ ] Threshold handling provides actionable feedback
- [ ] Results are consistent across similar scenarios

## APPROVAL DECISION FRAMEWORK

### Decision Matrix

#### **APPROVE** (Score ≥ 7.5 for TIER 2, ≥ 8.0 for TIER 3)
**All Criteria Met:**
- [ ] **Quality Standards**: Score meets tier threshold
- [ ] **Security Clearance**: No critical security issues
- [ ] **Architecture Compliance**: Aligns with established patterns
- [ ] **Testing Validation**: TESTER quality gates passed
- [ ] **Integration Safety**: No risk to existing functionality

**Documentation Required:**
- Quality score with breakdown
- Specific strengths noted
- Minor improvement recommendations
- Release readiness confirmation

#### **CONDITIONAL APPROVAL** (Score 6.0-7.4)
**Criteria:**
- [ ] **Core Functionality**: Works as specified
- [ ] **No Critical Issues**: Security and functionality acceptable
- [ ] **Documented Limitations**: Issues clearly identified
- [ ] **Risk Assessment**: Risks understood and acceptable

**Required Documentation:**
- Specific conditions for final approval
- Timeline for addressing identified issues
- Risk mitigation strategies
- Monitoring recommendations

#### **REJECT** (Score < 6.0 or Critical Issues)
**Automatic Rejection Triggers:**
- [ ] **Security Vulnerabilities**: Critical security issues present
- [ ] **Functional Failures**: Core functionality not working
- [ ] **Architecture Violations**: Significant pattern violations
- [ ] **Integration Breakage**: Existing functionality compromised

**Required Documentation:**
- Specific reasons for rejection
- Detailed improvement requirements
- Recommended remediation approach
- Re-review criteria

### Risk Assessment Framework

#### **Low Risk** (Proceed with standard monitoring)
- [ ] **Isolated Changes**: Minimal system interaction
- [ ] **Proven Patterns**: Uses established successful approaches
- [ ] **Comprehensive Testing**: Full validation completed
- [ ] **Easy Rollback**: Changes easily reversible

#### **Medium Risk** (Enhanced monitoring required)
- [ ] **Broad Impact**: Affects multiple system components
- [ ] **New Patterns**: Uses approaches not previously validated
- [ ] **Partial Testing**: Some test coverage gaps
- [ ] **Complex Rollback**: Rollback requires coordination

#### **High Risk** (Special deployment procedures)
- [ ] **System-Wide Impact**: Changes affect core functionality
- [ ] **Unproven Approaches**: Significant deviation from patterns
- [ ] **Limited Testing**: Insufficient validation coverage
- [ ] **Difficult Rollback**: Rollback could cause disruption

## HANDOFF REQUIREMENTS

### Final Documentation Package

#### **Required Artifacts**
- [ ] **Review Completion Report**: `[domain]-[epic]-reviewer-completion-v3.2.md`
- [ ] **Quality Assessment**: `[domain]-[epic]-quality-assessment-v3.2.md`
- [ ] **Strategic Assessment**: `[domain]-[epic]-strategic-assessment-v3.2.md`
- [ ] **Risk Analysis**: Risk level and mitigation strategies
- [ ] **Improvement Recommendations**: Actionable feedback for future work

#### **Quality Gate Summary Format**
```markdown
## REVIEWER QUALITY GATE ASSESSMENT

**Overall Decision**: APPROVE / CONDITIONAL / REJECT
**Quality Score**: [X.X]/10.0 (Threshold: [threshold] for [TIER])
**Complexity Tier**: [TIER_1/2/3]
**Review Duration**: [actual] minutes (estimated: [estimated])

**Score Breakdown**:
- Code Quality: [X.X]/10 ([25%] weight)
- Architecture: [X.X]/10 ([25%] weight)
- Security: [X.X]/10 ([25%] weight)
- Testing: [X.X]/10 ([25%] weight)

**Risk Assessment**: Low / Medium / High
**Security Clearance**: Pass / Conditional / Fail
**Architecture Compliance**: Full / Partial / Non-compliant

**Key Strengths**: [2-3 specific positive observations]
**Improvement Areas**: [2-3 specific recommendations]
**Strategic Value**: [Assessment of long-term benefit]

**Release Recommendation**: [Specific guidance for deployment]
```

## CONTINUOUS IMPROVEMENT

### Review Effectiveness Metrics
- [ ] **Accuracy Rate**: Issues found vs issues that reach production
- [ ] **Consistency**: Score reliability across similar implementations
- [ ] **Timeliness**: Review completion within allocated time
- [ ] **Value Addition**: Improvement recommendations adoption rate

### Process Learning Documentation
- [ ] **Pattern Recognition**: Which patterns led to higher quality scores
- [ ] **Risk Prediction**: Accuracy of risk assessments
- [ ] **Time Allocation**: Efficiency of review time distribution
- [ ] **Decision Outcomes**: Quality of approval/rejection decisions

### Framework Evolution
- [ ] **Scoring Calibration**: Adjust thresholds based on outcomes
- [ ] **Pattern Updates**: Incorporate new successful/failed patterns
- [ ] **Risk Refinement**: Improve risk assessment accuracy
- [ ] **Process Efficiency**: Optimize review workflow based on experience

---

**Framework Integration**: This guardrails file integrates with DEVELOPER-GUARDRAILS.md and TESTER-GUARDRAILS.md to provide systematic quality assurance throughout Process v3.2 execution.

**Historical Context**: Review criteria and risk patterns derived from D-001 through D-014 domain analysis ensure comprehensive quality assessment.

**Process Authority**: REVIEWER role maintains independent assessment authority while following systematic framework for consistency and accountability.
