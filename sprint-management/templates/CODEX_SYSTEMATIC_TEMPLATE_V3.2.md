# CODEX SYSTEMATIC EXECUTION TEMPLATE - Process v3.2
## PRECISION PERFORMANCE FRAMEWORK - ENHANCED WITH TIMING & RESOURCE MONITORING

**MANDATORY CHECKLIST COMPLETION REQUIRED BEFORE EXECUTION**
**SYSTEMATIC TIMING CAPTURE THROUGHOUT ALL PHASES**

---

## 🎯 ROLE: DEVELOPER - Process v3.2 Precision Framework

### ⏱️ **MANDATORY TIMING PROTOCOL - PHASE START**
```bash
# CAPTURE DEVELOPER PHASE START TIMESTAMP
echo "DEVELOPER PHASE INITIATED - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```

### 📋 MANDATORY REFERENCE FILES - READ FIRST:
```bash
# Core Framework Definition (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/PROCESS-V3.2-ENHANCED.md

# Daily Checklist Verification (REQUIRED)  
cat /Users/kevinbrown/MCP-ocs/sprint-management/templates/DAILY_STANDUP_CHECKLIST_V3.2.md

# Domain Specification (REPLACE WITH SELECTED DOMAIN)
cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[SELECTED_DOMAIN]/README.md

# Current Sprint Status (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/[CURRENT_SPRINT].md

# Historical Performance Data
# Query vector memory for similar task patterns, timing data, token consumption
```

### 🛡️ EXPLICIT GUARDRAILS V3.2 (NON-NEGOTIABLE):

#### **QUALITY STANDARDS** (Preserved from V3.1):
1. **Zero Technical Debt Acceptance**: No `any` types, `@ts-ignore`, or shortcuts
2. **Systematic Error Resolution**: Fix methodically using established patterns  
3. **Incremental Validation**: Test build success after each change
4. **Quality Gate Enforcement**: All acceptance criteria pass before handoff

#### **PERFORMANCE MONITORING** (New in V3.2):
5. **Systematic Timing Capture**: Record phase transitions and duration
6. **Token Consumption Tracking**: Monitor usage against estimated budget
7. **Complexity Validation**: Confirm tier appropriateness during execution
8. **Estimation Accuracy**: Log actual vs predicted metrics for learning

#### **PROCESS COMPLIANCE** (Enhanced):
9. **Tier-Appropriate Depth**: Execute validation appropriate to complexity tier
10. **Resource Budget Adherence**: Stay within time and token allocations
11. **Historical Data Integration**: Apply lessons from similar task patterns
12. **Continuous Learning**: Document variance for future calibration

### 🔄 SYSTEMATIC EXECUTION PHASES V3.2:

#### **PHASE 1: BASELINE ESTABLISHMENT** (Enhanced - Mandatory)
```bash
# PHASE 1 START TIMESTAMP
echo "PHASE 1 (BASELINE) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **System State Analysis**: Current state vs domain specification requirements
- [ ] **Historical Pattern Matching**: Query similar tasks from vector memory  
- [ ] **Resource Baseline**: Document starting build status, error count, test results
- [ ] **Complexity Confirmation**: Validate selected tier matches actual requirements
- [ ] **File Change Identification**: Map all files requiring modification per specification
- [ ] **Acceptance Criteria Review**: Confirm understanding of success metrics
```bash
# PHASE 1 COMPLETE TIMESTAMP  
echo "PHASE 1 (BASELINE) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```

#### **PHASE 2: SYSTEMATIC IMPLEMENTATION** (Enhanced)
```bash
# PHASE 2 START TIMESTAMP
echo "PHASE 2 (IMPLEMENTATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Incremental Change Application**: Apply modifications with validation at each step
- [ ] **Pattern Adherence**: Follow established patterns from domain specification
- [ ] **Continuous Testing**: Validate after each major change
- [ ] **Token Monitoring**: Track consumption against budget estimation
- [ ] **Time Tracking**: Monitor progress against tier-appropriate duration targets
- [ ] **Quality Validation**: Ensure tier-appropriate validation depth maintained
- [ ] **Deviation Documentation**: Record any changes from planned approach with rationale
```bash
# PHASE 2 COMPLETE TIMESTAMP
echo "PHASE 2 (IMPLEMENTATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```

#### **PHASE 3: QUALITY VALIDATION** (Enhanced)
```bash  
# PHASE 3 START TIMESTAMP
echo "PHASE 3 (VALIDATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Acceptance Criteria Verification**: All requirements met per complexity tier
- [ ] **Test Suite Execution**: Complete validation appropriate to tier depth
- [ ] **Performance Metrics**: Actual vs estimated story points and resource usage
- [ ] **Technical Debt Assessment**: Zero technical debt policy enforcement
- [ ] **TESTER Handoff Preparation**: Create tier-appropriate validation artifacts
- [ ] **Quality Gate Confirmation**: All tier-specific criteria satisfied
```bash
# PHASE 3 COMPLETE TIMESTAMP
echo "PHASE 3 (VALIDATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```

#### **PHASE 4: PROCESS V3.2 HANDOFF** (Enhanced)
```bash
# PHASE 4 START TIMESTAMP  
echo "PHASE 4 (HANDOFF) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
```
- [ ] **Implementation Completion Report**: Comprehensive delivery documentation
- [ ] **Performance Metrics Report**: Timing, token usage, complexity validation
- [ ] **Testing Requirements**: Tier-appropriate validation specifications for TESTER
- [ ] **Status Update**: Domain README and progress tracking updates
- [ ] **Continuous Learning**: Document lessons for historical database
- [ ] **Quality Evidence**: Build logs, test results, validation confirmation
```bash
# PHASE 4 COMPLETE TIMESTAMP + TOTAL DURATION
echo "PHASE 4 (HANDOFF) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "DEVELOPER PHASE TOTAL DURATION: [CALCULATE FROM START TO END]"
```

### 📊 MANDATORY DELIVERABLES V3.2:

#### **Implementation Artifacts**:
1. **Implementation Report**: `sprint-management/completion-logs/[DOMAIN]-[EPIC]-developer-completion-v3.2.md`
2. **Testing Requirements**: `sprint-management/completion-logs/[DOMAIN]-[EPIC]-testing-requirements-v3.2.md`
3. **Performance Metrics**: `sprint-management/completion-logs/[DOMAIN]-[EPIC]-performance-metrics-v3.2.md`

#### **Process Documentation**:  
4. **Status Update**: Domain README with implementation progress
5. **Quality Evidence**: Build logs, test results, validation confirmation
6. **Lessons Learned**: Historical data for continuous improvement

#### **Performance Data** (New in V3.2):
7. **Timing Analysis**: Phase duration breakdown with variance analysis
8. **Resource Consumption**: Token usage vs budget with efficiency metrics
9. **Estimation Accuracy**: Actual vs predicted story points and complexity validation

### ✅ SUCCESS CRITERIA VERIFICATION V3.2:

#### **Quality Standards** (Preserved):
- [ ] All specified tasks completed within defined scope
- [ ] Zero compilation errors or warnings  
- [ ] All tests passing without regression
- [ ] TESTER handoff artifacts complete and validated

#### **Performance Standards** (New in V3.2):
- [ ] Execution time within tier-appropriate range (±15 minutes target)
- [ ] Token consumption within budget (±20% target)
- [ ] Story point estimation accuracy documented (±1 SP target)  
- [ ] Complexity tier validation confirmed (appropriate depth maintained)

### 🔄 PROCESS V3.2 COMMIT FORMAT (Enhanced):
```bash
git add .
git commit -m "feat: [DOMAIN] [EPIC] - DEVELOPER phase complete (Process v3.2)

Domain: [DOMAIN_NAME]  
Epic: [EPIC_NAME]
Tasks completed: [LIST_TASKS]
Complexity Tier: [TIER_1/2/3]
Story Points: [ACTUAL] SP (Estimated: [ESTIMATED] SP)
Duration: [ACTUAL] minutes (Estimated: [ESTIMATED] minutes)  
Token Usage: [ACTUAL]K (Budget: [ESTIMATED]K)

Process v3.2: DEVELOPER → TESTER handoff ready
Quality Gates: [ALL_PASSED]
Performance: [WITHIN_TARGETS/VARIANCE_NOTED]"
```

### 🚨 ENHANCED ABORT CONDITIONS:

**Mandatory abort if:**
- Reference files not accessible or framework components missing
- Guardrails cannot be satisfied or quality standards not achievable
- Resource budgets impossible to maintain (time/token overrun >50%)
- Complexity tier inappropriate for actual requirements (escalation needed)
- Success criteria unclear or validation requirements undefined

**Escalation Procedures:**
- **Time Overrun**: Scope reduction assessment with stakeholder notification  
- **Token Limit Approach**: Context compression with priority preservation
- **Complexity Explosion**: Tier escalation with enhanced validation procedures
- **Quality Gate Failure**: Systematic correction cycle with root cause analysis

### 🎯 HANDOFF AUTHORIZATION V3.2:

**Only proceed to TESTER role when:**
- [ ] All deliverables created and validated per tier requirements
- [ ] Success criteria completely satisfied with documented evidence
- [ ] Performance metrics within acceptable variance ranges
- [ ] Implementation artifacts ready for independent tier-appropriate validation
- [ ] Process v3.2 framework properly executed with timing/resource data captured

### ⏱️ **MANDATORY TIMING PROTOCOL - PHASE COMPLETE**
```bash
# CAPTURE DEVELOPER PHASE END TIMESTAMP + PERFORMANCE SUMMARY
echo "DEVELOPER PHASE COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "PERFORMANCE SUMMARY:"
echo "- Story Points: [ACTUAL] (Estimated: [ESTIMATED]) - Variance: [XX]%"  
echo "- Duration: [ACTUAL] minutes (Estimated: [ESTIMATED]) - Variance: [XX]%"
echo "- Token Usage: [ACTUAL]K (Budget: [ESTIMATED]K) - Variance: [XX]%"
echo "- Complexity Tier: [TIER] - Appropriateness: [CONFIRMED/NEEDS_ADJUSTMENT]"
echo ""
echo "HANDOFF TO TESTER: AUTHORIZED"
```

---

**EXECUTE ONLY AFTER DAILY STANDUP CHECKLIST V3.2 COMPLETION**
**NO EXCEPTIONS - NO SHORTCUTS - SYSTEMATIC TIMING REQUIRED**

**EVOLUTION**: V3.2 precision performance framework with data-driven continuous improvement.
Replace [PLACEHOLDERS] with actual values from completed checklist before execution.