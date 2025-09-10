# [LEGACY — v3.2 Archived] TESTER Role Guardrails

**Role**: TESTER  
**Framework**: Process v3.2 Enhanced  
**Status**: Comprehensive Execution and Quality Standards  
**Last Updated**: 2025-09-02  

## SYSTEMATIC EXECUTION FRAMEWORK

### Phase-by-Phase Testing Protocol

#### **PHASE 1: Test Strategy Development** (15-20 minutes)
- [ ] **Implementation Analysis**: Review DEVELOPER completion logs and code changes
- [ ] **Risk Assessment**: Identify high-risk areas based on complexity and change scope
- [ ] **Test Coverage Planning**: Design comprehensive test strategy matching complexity tier
- [ ] **Environment Setup**: Prepare test environment with necessary resources
- [ ] **Success Criteria Definition**: Establish clear pass/fail thresholds

#### **PHASE 2: Systematic Validation Execution** (60-90 minutes)
- [ ] **Functional Testing**: Verify all acceptance criteria met per specification
- [ ] **Integration Testing**: Validate component interactions and data flow
- [ ] **Edge Case Testing**: Test boundary conditions and error scenarios
- [ ] **Regression Testing**: Ensure no existing functionality broken
- [ ] **Performance Validation**: Verify response times and resource usage within bounds

#### **PHASE 3: Quality Assessment and Handoff** (20-30 minutes)
- [ ] **Test Results Documentation**: Comprehensive validation evidence compilation
- [ ] **Issue Classification**: Categorize any failures by severity and impact
- [ ] **REVIEWER Handoff Preparation**: Create detailed validation summary
- [ ] **Quality Gate Assessment**: Determine overall validation outcome

### Complexity Tier Requirements

#### **TIER 1 Testing (1-2 SP - Simple Tasks)**
- **Minimum Coverage**: Core functionality, basic error cases
- **Test Types**: Unit tests, basic integration
- **Time Allocation**: 45-60 minutes
- **Quality Threshold**: 95% acceptance criteria passing

#### **TIER 2 Testing (3-5 SP - Standard Implementation)**
- **Minimum Coverage**: Full functionality, edge cases, integration points
- **Test Types**: Unit, integration, basic performance
- **Time Allocation**: 90-120 minutes
- **Quality Threshold**: 98% acceptance criteria passing, no critical issues

#### **TIER 3 Testing (6+ SP - Complex Architecture)**
- **Minimum Coverage**: Comprehensive testing including stress scenarios
- **Test Types**: Unit, integration, performance, security, compatibility
- **Time Allocation**: 120-180 minutes
- **Quality Threshold**: 100% acceptance criteria passing, comprehensive validation

## QUALITY STANDARDS AND THRESHOLDS

### Pass/Fail Criteria

#### **PASS Requirements** (All must be met)
- [ ] **Functional Completeness**: 100% of specified acceptance criteria validated
- [ ] **Build Stability**: All tests pass, no compilation errors
- [ ] **Regression Prevention**: No existing functionality broken
- [ ] **Error Handling**: Appropriate error responses for invalid inputs
- [ ] **Integration Integrity**: Component interactions work as specified

#### **CONDITIONAL PASS** (Minor issues requiring documentation)
- [ ] **Non-Critical Issues**: Minor edge cases with documented workarounds
- [ ] **Performance Within Range**: Response times acceptable but not optimal
- [ ] **Documentation Gaps**: Implementation correct but documentation incomplete

#### **FAIL Criteria** (Any one triggers failure)
- [ ] **Critical Functionality Broken**: Core features not working as specified
- [ ] **Build Failures**: Compilation errors or test suite failures
- [ ] **Data Loss Risk**: Potential for data corruption or loss identified
- [ ] **Security Vulnerabilities**: Input validation failures or trust boundary issues
- [ ] **Integration Failures**: Component interactions broken or unreliable

### Evidence Requirements

#### **Documentation Standards**
- [ ] **Test Coverage Report**: Specific tests executed with results
- [ ] **Issue Log**: All problems found with reproduction steps
- [ ] **Performance Metrics**: Response times, resource usage, throughput
- [ ] **Validation Evidence**: Screenshots, logs, or output samples
- [ ] **Environment Details**: Test environment configuration and state

## HISTORICAL PATTERNS - AVOID/USE FRAMEWORK

### Critical Anti-Patterns to Catch (From D-001 through D-014 Analysis)

#### **D-001: Trust Boundary Violations** (P0 - Critical)
**Test For:**
- [ ] **Unvalidated Input**: Any user input accepted without validation schema
- [ ] **SQL Injection Vectors**: Dynamic query construction without parameterization
- [ ] **Path Traversal**: File operations without path sanitization
- [ ] **Command Injection**: Shell execution with unsanitized parameters

**Historical Pattern**: Previous sprints missed input validation in tool parameter handling

#### **D-002: Type Safety Gaps** (P1 - High Priority)
**Test For:**
- [ ] **Any Type Usage**: Verify no `any` types introduced in implementation
- [ ] **Unsafe Assertions**: Check for `as` casts without proper validation
- [ ] **Missing Null Checks**: Verify null/undefined handling in data processing
- [ ] **Interface Violations**: Ensure actual data matches declared interfaces

**Historical Pattern**: Type shortcuts lead to runtime errors in production

#### **D-003: Interface Hygiene Issues** (P1 - High Priority)
**Test For:**
- [ ] **Structural Collisions**: Multiple interfaces with similar shapes causing confusion
- [ ] **Missing Branded Types**: Critical identifiers without type safety
- [ ] **Generic Constraints**: Ensure generic types properly constrained
- [ ] **Return Type Consistency**: Verify consistent return patterns across similar functions

**Historical Pattern**: Interface mismatches cause integration failures

#### **D-005: Async Correctness Problems** (P0 - Critical)
**Test For:**
- [ ] **Unawaited Promises**: All async operations properly awaited
- [ ] **Race Conditions**: Concurrent operations properly sequenced
- [ ] **Error Propagation**: Async errors properly caught and handled
- [ ] **Timeout Handling**: Long-running operations have appropriate timeouts

**Historical Pattern**: Race conditions in concurrent tool execution

#### **D-006: Poor Error Handling** (P1 - High Priority)
**Test For:**
- [ ] **Generic Error Catches**: Avoid catch-all error handlers without classification
- [ ] **Error Context Loss**: Ensure error messages include sufficient context
- [ ] **Structured Error Types**: Use proper error taxonomy instead of generic Error
- [ ] **User-Facing Messages**: Appropriate error messages for different audiences

**Historical Pattern**: Generic error handling makes debugging difficult

#### **D-010: Exhaustiveness Gaps** (P1 - High Priority)
**Test For:**
- [ ] **Missing Switch Cases**: All enum/union cases handled
- [ ] **AssertNever Guards**: Unreachable code paths protected
- [ ] **Configuration Variants**: All config options tested
- [ ] **State Machine Completeness**: All state transitions validated

**Historical Pattern**: Missing cases cause runtime failures with new inputs

### Recommended Testing Patterns (Historical Successes)

#### **Dynamic Resource Discovery Pattern** (From ingress template success)
```typescript
// Test pattern for resource discovery
expect(resources).toBeDefined();
expect(resources.length).toBeGreaterThan(0);
expect(resources[0]).toHaveProperty('name');
expect(resources[0]).toHaveProperty('namespace');
```

#### **Evidence Completeness Validation** (Proven reliable)
```typescript
// Test completeness scoring
const score = calculateCompleteness(evidence);
expect(score).toBeGreaterThanOrEqual(0.9);
expect(evidence.sources).toHaveLength(expectedSourceCount);
```

#### **Error Boundary Testing** (Critical safety net)
```typescript
// Test error handling
await expect(invalidOperation()).rejects.toThrow(SpecificErrorType);
expect(errorLog).toContain('Expected error context');
```

## TESTING STRATEGY TEMPLATES

### Standard Testing Checklist
```markdown
### Functional Testing
- [ ] All acceptance criteria validated
- [ ] Core functionality working as specified
- [ ] Input validation working properly
- [ ] Output format matches specification

### Integration Testing  
- [ ] Component interactions verified
- [ ] Data flow validation complete
- [ ] External dependency mocking appropriate
- [ ] API contracts honored

### Edge Case Testing
- [ ] Empty/null input handling
- [ ] Maximum/minimum value boundaries
- [ ] Network failure scenarios
- [ ] Resource exhaustion conditions

### Regression Testing
- [ ] Existing tests still passing
- [ ] No performance degradation
- [ ] Backward compatibility maintained
- [ ] Configuration changes handled
```

### Performance Testing Template (TIER 2/3)
```markdown
### Performance Validation
- [ ] Response times within acceptable range (< 2s for most operations)
- [ ] Memory usage stable (no leaks detected)
- [ ] CPU utilization reasonable (< 80% sustained)
- [ ] Concurrent operation handling

### Load Testing (TIER 3 only)
- [ ] Multiple simultaneous requests handled
- [ ] Graceful degradation under load
- [ ] Resource cleanup after operations
- [ ] Error rates acceptable under stress
```

## HANDOFF REQUIREMENTS

### REVIEWER Handoff Documentation

#### **Required Artifacts**
- [ ] **Test Completion Report**: `[domain]-[epic]-tester-completion-v3.2.md`
- [ ] **Validation Evidence**: `[domain]-[epic]-validation-evidence-v3.2.md` 
- [ ] **Issue Log**: Any problems found with classification and severity
- [ ] **Performance Data**: Metrics and benchmarks from testing
- [ ] **Quality Assessment**: Overall validation outcome with rationale

#### **Quality Gate Summary Format**
```markdown
## TESTER QUALITY GATE ASSESSMENT

**Overall Result**: PASS / CONDITIONAL / FAIL
**Complexity Tier**: [TIER_1/2/3]
**Testing Duration**: [actual] minutes (estimated: [estimated])
**Coverage Achieved**: [percentage] of acceptance criteria validated

**Critical Issues**: [count] (must be 0 for PASS)
**Non-Critical Issues**: [count]
**Performance Status**: Within/Outside acceptable bounds
**Regression Impact**: None/Minor/Significant

**Recommendation**: Proceed to REVIEWER / Return to DEVELOPER
**Rationale**: [specific reasoning for decision]
```

## CONTINUOUS IMPROVEMENT

### Testing Effectiveness Metrics
- [ ] **Issue Detection Rate**: Problems found vs problems reaching production
- [ ] **False Positive Rate**: Issues reported that weren't actual problems
- [ ] **Testing Efficiency**: Time spent vs quality improvement achieved
- [ ] **Pattern Recognition**: Historical issue types caught/missed

### Process Learning Documentation
- [ ] **Strategy Effectiveness**: Which testing approaches worked best
- [ ] **Time Allocation**: Actual vs estimated testing time by category
- [ ] **Issue Patterns**: Types of problems commonly found/missed
- [ ] **Tool Effectiveness**: Which testing tools provided best coverage

---

**Framework Integration**: This guardrails file integrates with DEVELOPER-GUARDRAILS.md and REVIEWER-GUARDRAILS.md to provide systematic quality assurance throughout Process v3.2 execution.

**Historical Context**: Anti-patterns derived from D-001 through D-014 domain analysis ensure previously identified issues don't reoccur.

**Process Authority**: TESTER role maintains independent validation authority while following systematic framework for consistency and completeness.
