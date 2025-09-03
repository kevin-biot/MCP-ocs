# CODEX SYSTEMATIC EXECUTION TEMPLATE - Process v3.2
**COMPLETE OPERATIONAL PROCEDURES FOR CODEX CLI SESSIONS**

## 🎯 TEMPLATE PURPOSE
This template generates complete, self-contained prompts for Codex CLI sessions following Process v3.2 Enhanced Framework. Each prompt contains ALL context, procedures, and requirements for systematic execution.

---

## 📋 MANDATORY PROMPT COMPONENTS

### **HEADER SECTION - ROLE & CONTEXT**
```
CODEX CLI: You are in [DEVELOPER/TESTER/REVIEWER] role for Process v3.2 [TIER] Sprint

WORKING DIRECTORY: /Users/kevinbrown/MCP-ocs

SPRINT CONTEXT:
- Sprint: [DOMAIN] + [DOMAIN] [SPRINT_NAME]
- Priority: [P0/P1/P2] [PRIORITY_LEVEL]
- Duration: [X] hours calibrated execution  
- Complexity Tier: [TIER_1/2/3] ([TIER_DESCRIPTION])
- Historical Calibration: [MULTIPLIER] from previous sprint patterns
```

### **GIT BRANCH SAFETY PROTOCOL**
```
GIT BRANCH DIRECTIVE - EXPLICIT COMMANDS:
1. Check current branch: git branch --show-current
2. Verify branch status: git status --porcelain
3. Switch to work branch: git checkout [BRANCH_NAME]
4. Confirm correct branch: git branch --show-current
5. Pull latest changes: git pull origin [BRANCH_NAME]
6. ALL work must be done on [BRANCH_NAME] branch
7. Regular commits with structured messages throughout execution
```

### **MANDATORY REFERENCE FILES SECTION**
```
📋 MANDATORY REFERENCE FILES - READ FIRST:

# Process Framework (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/PROCESS-V3.2-ENHANCED.md

# Daily Checklist Verification (REQUIRED)  
cat /Users/kevinbrown/MCP-ocs/sprint-management/templates/DAILY_STANDUP_CHECKLIST_V3.2.md

# Developer Guardrails (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/DEVELOPER-GUARDRAILS.md

# Domain Specifications (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_1]/README.md
cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[DOMAIN_2]/README.md

# Current Sprint Task Definition (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/[CURRENT_TASK_FILE].md

# Historical Performance Data (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/historical-data/[PREVIOUS_SPRINT_METRICS].md
```

### **SYSTEMATIC TIMING PROTOCOL**
```
⏱️ MANDATORY TIMING PROTOCOL - SYSTEMATIC CAPTURE

# EXECUTION START TIMESTAMP
echo "[ROLE] PHASE INITIATED - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[SPRINT_NAME] - [ROLE] PHASE START"
echo "Process v3.2 [TIER] Framework Execution"
echo "Historical Calibration: [MULTIPLIER] applied"
echo "Token Budget: [TOKEN_BUDGET]K allocated"
echo "Time Budget: [TIME_BUDGET] minutes estimated"
```

### **DAILY LOG TEMPLATE CREATION**
```
# CREATE DAILY EXECUTION LOG FOR PROGRESS TRACKING
cat > /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md << 'EOF'
# Codex Execution Log - $(date +%Y-%m-%d)

## Sprint: [SPRINT_NAME]
**Role**: [DEVELOPER/TESTER/REVIEWER]  
**Complexity**: [TIER] ([TIER_DESCRIPTION])
**Start Time**: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

## PHASE EXECUTION TRACKING

### PHASE 1: [PHASE_NAME]
- Start: [CODEX UPDATES WITH TIMESTAMP]  
- Tasks: [CODEX UPDATES PROGRESS]
- Issues: [CODEX NOTES PROBLEMS]
- Duration: [CODEX CALCULATES]

### PHASE 2: [PHASE_NAME]  
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Tasks: [CODEX UPDATES PROGRESS]
- Issues: [CODEX NOTES PROBLEMS] 
- Duration: [CODEX CALCULATES]

### PHASE 3: [PHASE_NAME]
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Tasks: [CODEX UPDATES PROGRESS]
- Issues: [CODEX NOTES PROBLEMS]
- Duration: [CODEX CALCULATES]

### PHASE 4: [PHASE_NAME]
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Tasks: [CODEX UPDATES PROGRESS] 
- Issues: [CODEX NOTES PROBLEMS]
- Duration: [CODEX CALCULATES]

## PERFORMANCE METRICS
- Total Duration: [CODEX CALCULATES AT END]
- Token Usage: [CODEX TRACKS CONSUMPTION]
- Story Points: [ACTUAL] vs [ESTIMATED]
- Complexity Validation: [TIER_APPROPRIATE/NEEDS_ADJUSTMENT]

## DELIVERABLES COMPLETED
- [ ] [DELIVERABLE_1]: [STATUS]
- [ ] [DELIVERABLE_2]: [STATUS]  
- [ ] [DELIVERABLE_3]: [STATUS]

## HANDOFF STATUS
- Quality Gates: [ALL_PASSED/ISSUES_NOTED]
- Next Phase: [TESTER/REVIEWER/COMPLETE]
- Archive Ready: [YES/NO]

EOF

# Confirm log file created
echo "✅ Daily execution log created: execution-logs/codex-execution-log-$(date +%Y-%m-%d).md"
```

---

## 🔄 SYSTEMATIC EXECUTION PHASES

### **PHASE 1: BASELINE ESTABLISHMENT**
```
# PHASE 1 START TIMESTAMP  
echo "PHASE 1 (BASELINE) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[DOMAIN_DESCRIPTION] Baseline Analysis"

# Update daily log
echo "### PHASE 1 PROGRESS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
echo "- Start: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md

BASELINE TASKS:
☐ [TASK_1]: [TASK_DESCRIPTION]
☐ [TASK_2]: [TASK_DESCRIPTION] 
☐ [TASK_3]: [TASK_DESCRIPTION]

# PHASE 1 COMPLETE TIMESTAMP
echo "PHASE 1 (BASELINE) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Baseline Duration: [CALCULATE MINUTES] minutes"

# Update daily log with completion
echo "- Duration: [CALCULATE] minutes" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
```

### **PHASE 2: SYSTEMATIC IMPLEMENTATION**
```
# PHASE 2 START TIMESTAMP
echo "PHASE 2 (IMPLEMENTATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[DOMAIN_DESCRIPTION] Implementation"

# Update daily log
echo "### PHASE 2 PROGRESS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
echo "- Start: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md

IMPLEMENTATION TASKS:
[DETAILED_TASK_BREAKDOWN_WITH_CALIBRATED_ESTIMATES]

# PHASE 2 COMPLETE TIMESTAMP  
echo "PHASE 2 (IMPLEMENTATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Implementation Duration: [CALCULATE] minutes"
echo "Token Usage Check: [MONITOR against BUDGET]"
```

### **PHASE 3: QUALITY VALIDATION**  
```
# PHASE 3 START TIMESTAMP
echo "PHASE 3 (VALIDATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[DOMAIN_DESCRIPTION] Quality Validation"

VALIDATION TASKS:
☐ [VALIDATION_CRITERIA_1]: [DESCRIPTION]
☐ [VALIDATION_CRITERIA_2]: [DESCRIPTION]
☐ [VALIDATION_CRITERIA_3]: [DESCRIPTION]

# PHASE 3 COMPLETE TIMESTAMP
echo "PHASE 3 (VALIDATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Validation Duration: [CALCULATE] minutes"
```

### **PHASE 4: HANDOFF PREPARATION**
```
# PHASE 4 START TIMESTAMP
echo "PHASE 4 (HANDOFF) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" 
echo "[SPRINT_NAME] Documentation and Handoff"

HANDOFF TASKS:
☐ Implementation completion report creation
☐ Performance metrics documentation  
☐ Testing requirements specification
☐ Quality evidence compilation
☐ Archive preparation

# PHASE 4 COMPLETE + TOTAL DURATION
echo "PHASE 4 (HANDOFF) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[ROLE] PHASE TOTAL DURATION: [CALCULATE FROM START TO END]"
echo "Target: [TARGET] minutes | Actual: [CALCULATE] | Variance: [XX]%"
echo "Token Usage: [ACTUAL]K | Budget: [BUDGET]K | Efficiency: [XX]%"
```

---

## 📊 MANDATORY DELIVERABLES TEMPLATE

### **COMPLETION ARTIFACTS**
```
📊 MANDATORY DELIVERABLES - [SPRINT_NAME]:

Implementation Artifacts:
☐ Implementation Report: sprint-management/completion-logs/[SPRINT_ID]-developer-completion-v3.2.md
☐ Testing Requirements: sprint-management/completion-logs/[SPRINT_ID]-testing-requirements-v3.2.md  
☐ Performance Metrics: sprint-management/completion-logs/[SPRINT_ID]-performance-metrics-v3.2.md

Technical Deliverables:
[SPECIFIC_TECHNICAL_DELIVERABLES_FOR_DOMAIN]

Performance Data (Process v3.2):
☐ Timing Analysis: Phase duration breakdown vs [TARGET]-minute target
☐ Resource Consumption: Token usage vs [BUDGET]K budget with efficiency metrics
☐ Estimation Accuracy: Actual vs predicted [SP] SP with complexity validation
```

---

## 🔄 PROCESS V3.2 COMMIT TEMPLATE

### **STRUCTURED COMMIT FORMAT**
```
# SYSTEMATIC GIT COMMIT - Process v3.2
git add .
git commit -m "[TYPE]: [SPRINT_ID] - [ROLE] phase complete (Process v3.2)

Domain: [DOMAIN_NAME] 
Epic: [EPIC_NAME]
Tasks completed:
- [TASK_1]: [BRIEF_OUTCOME]
- [TASK_2]: [BRIEF_OUTCOME]  
- [TASK_3]: [BRIEF_OUTCOME]

Complexity Tier: [TIER] ([TIER_DESCRIPTION])
Story Points: [ACTUAL] SP (Estimated: [ESTIMATED] SP)
Duration: [ACTUAL] minutes (Estimated: [TARGET] minutes)
Token Usage: [ACTUAL]K (Budget: [BUDGET]K)

Process v3.2: [CURRENT_ROLE] → [NEXT_ROLE] handoff ready
Quality Gates: [STATUS]
Performance: [WITHIN_TARGETS/VARIANCE_NOTED]
Calibration: Applied [MULTIPLIER] multiplier with [COMPLEXITY] adjustment"

# Push changes
git push origin [BRANCH_NAME]
```

---

## ✅ SUCCESS CRITERIA VERIFICATION TEMPLATE

### **COMPLETION CHECKLIST**
```
✅ SUCCESS CRITERIA VERIFICATION - [SPRINT_NAME]:

Quality Standards:
☐ All [DOMAIN] tasks completed within scope
☐ [SPECIFIC_QUALITY_CRITERIA_1] achieved
☐ [SPECIFIC_QUALITY_CRITERIA_2] validated
☐ [NEXT_ROLE] handoff artifacts complete and validated

Performance Standards (Process v3.2):
☐ Execution time within [TIER] range ([TARGET] minutes ±15 minutes)
☐ Token consumption within budget ([BUDGET]K ±20% target)
☐ Story point estimation accuracy ([ESTIMATED] vs [ACTUAL] SP)
☐ [TIER] complexity validation confirmed

Process Standards:
☐ Systematic timing capture completed throughout all phases
☐ Daily execution log updated with complete progress tracking
☐ All reference files read and applied according to guardrails
☐ Quality gates enforced with evidence-based validation
```

---

## 🚨 ENHANCED ABORT CONDITIONS TEMPLATE

### **MANDATORY ABORT TRIGGERS**
```
🚨 ENHANCED ABORT CONDITIONS - [SPRINT_NAME]:

Mandatory abort if:
☐ [DOMAIN]-specific files not accessible or requirements unclear
☐ [SPECIFIC_BLOCKING_CONDITION_1] cannot be satisfied
☐ Token budget overrun >50% ([THRESHOLD]K exceeded)
☐ [TIER] complexity requirements exceed current framework capacity

Escalation Procedures:
☐ Time Overrun: Prioritize [CRITICAL_TASKS] over [OPTIONAL_TASKS]
☐ Token Limit Approach: Focus on [CORE_DELIVERABLES], defer [ENHANCEMENTS]
☐ Complexity Explosion: Escalate to [TIER+1] if [CONDITIONS]
☐ Quality Gate Failure: [SPECIFIC_RECOVERY_PROCEDURES]
```

---

## 🎯 HANDOFF AUTHORIZATION TEMPLATE

### **ROLE TRANSITION CRITERIA**
```
🎯 HANDOFF AUTHORIZATION - [SPRINT_NAME]:

Only proceed to [NEXT_ROLE] when:
☐ All [DOMAIN] tasks completed with documented deliverables
☐ [SPECIFIC_COMPLETION_CRITERIA_1] satisfied with evidence
☐ [SPECIFIC_COMPLETION_CRITERIA_2] validated with metrics
☐ Process v3.2 [TIER] framework executed with performance data captured
☐ Daily execution log complete with timing and progress documentation

HANDOFF SIGNAL:
"[ROLE] PHASE COMPLETE - READY FOR [NEXT_ROLE] ROLE TRANSITION"
```

---

## ⏱️ FINAL TIMING PROTOCOL TEMPLATE

### **PERFORMANCE SUMMARY**
```
⏱️ MANDATORY TIMING PROTOCOL - PHASE COMPLETE

# CAPTURE FINAL PERFORMANCE SUMMARY
echo "[ROLE] PHASE COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[SPRINT_NAME] - [ROLE] EXECUTION COMPLETE"
echo ""
echo "PERFORMANCE SUMMARY:"
echo "- Story Points: [ACTUAL] (Estimated: [ESTIMATED]) - Variance: [XX]%"
echo "- Duration: [ACTUAL] minutes (Target: [TARGET] minutes) - Variance: [XX]%"  
echo "- Token Usage: [ACTUAL]K (Budget: [BUDGET]K) - Variance: [XX]%"
echo "- Complexity Tier: [TIER] - Appropriateness: [CONFIRMED/NEEDS_ADJUSTMENT]"
echo "- Calibration Applied: [MULTIPLIER] multiplier with [COMPLEXITY] adjustment"
echo ""
echo "[DOMAIN] DELIVERABLES:"
echo "- [DELIVERABLE_1]: [STATUS]"
echo "- [DELIVERABLE_2]: [STATUS]"
echo "- [DELIVERABLE_3]: [STATUS]"
echo ""
echo "HANDOFF TO [NEXT_ROLE]: AUTHORIZED"
echo "Next Phase: [NEXT_PHASE_DESCRIPTION]"

# Update final status in daily log
echo "## FINAL STATUS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
echo "- Total Duration: [ACTUAL] minutes" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md  
echo "- Performance: [STATUS]" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
echo "- Handoff: [NEXT_ROLE] authorized" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/codex-execution-log-$(date +%Y-%m-%d).md
```

---

**TEMPLATE USAGE**: Replace bracketed placeholders with actual sprint values
**SESSION SAFETY**: Every prompt generated from this template is self-contained
**PROCESS COMPLIANCE**: Follows Process v3.2 Enhanced Framework completely  
**PILOT APPROVED**: Complete operational procedures for systematic execution