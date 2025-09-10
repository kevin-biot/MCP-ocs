# CODEX SYSTEMATIC EXECUTION TEMPLATE - Process v3.3
**PROBLEM-RESOLUTION OPERATIONAL PROCEDURES FOR CODEX CLI SESSIONS**

## 🎯 TEMPLATE PURPOSE
This template generates complete, self-contained prompts for Codex CLI sessions following Process v3.3 Problem-Resolution Framework. Each prompt contains ALL context, procedures, and requirements for systematic problem elimination with quality intelligence integration.

---

## 📋 MANDATORY PROMPT COMPONENTS

### **HEADER SECTION - ROLE & PROBLEM CONTEXT**
```
CODEX CLI: You are in [DEVELOPER/TESTER/REVIEWER] role for Process v3.3 Problem-Resolution Sprint

WORKING DIRECTORY: /Users/kevinbrown/MCP-ocs

PROBLEM-RESOLUTION CONTEXT:
- Target Problem: [PROBLEM_CATEGORY] systematic elimination
- Domain Focus: [PRIMARY_DOMAIN] + [SECONDARY_DOMAIN] 
- Quality Intelligence: [WEEKLY_FINDINGS_SUMMARY]
- Evidence Goal: Zero [PROBLEM_CATEGORY] issues + prevention measures
- Duration: [X] hours calibrated execution  
- Complexity Tier: [TIER_1/2/3] ([TIER_DESCRIPTION])
- Historical Context: [PROBLEM_PATTERNS] from quality baseline
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
8. Focus: Problem elimination, not task completion
```

### **MANDATORY REFERENCE FILES SECTION**
```
📋 MANDATORY REFERENCE FILES - READ FIRST:

# Process Framework (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/PROCESS-V3.3-PROBLEM-RESOLUTION.md

# Daily Checklist Verification (REQUIRED)  
cat /Users/kevinbrown/MCP-ocs/sprint-management/templates/DAILY_STANDUP_CHECKLIST_V3.3.md

# Quality Intelligence Context (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/domains/[PRIMARY_DOMAIN]/domain-specification.yaml
cat /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/domains/[PRIMARY_DOMAIN]/historical/finding-registry.json

# Problem-Resolution Sprint Definition (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/[CURRENT_PROBLEM_RESOLUTION_SPRINT].md

# Cross-Domain Context (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/review-prompt-lib/domains/[SECONDARY_DOMAIN]/domain-specification.yaml

# Role-Specific Guardrails (REQUIRED)
cat /Users/kevinbrown/MCP-ocs/sprint-management/DEVELOPER-GUARDRAILS.md
cat /Users/kevinbrown/MCP-ocs/sprint-management/TESTER-GUARDRAILS.md
cat /Users/kevinbrown/MCP-ocs/sprint-management/REVIEWER-GUARDRAILS.md
```

### **PROBLEM-RESOLUTION TIMING PROTOCOL**
```
⏱️ MANDATORY TIMING PROTOCOL - SYSTEMATIC PROBLEM ELIMINATION

# EXECUTION START TIMESTAMP
echo "[ROLE] PROBLEM-RESOLUTION INITIATED - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[PROBLEM_CATEGORY] Systematic Elimination - [ROLE] PHASE START"
echo "Process v3.3 Problem-Resolution Framework Execution"
echo "Quality Intelligence: [WEEKLY_FINDINGS_COUNT] findings informing approach"
echo "Evidence Goal: Zero [PROBLEM_CATEGORY] + prevention measures"
echo "Token Budget: [TOKEN_BUDGET]K allocated"
echo "Time Budget: [TIME_BUDGET] minutes estimated"
```

### **DAILY PROBLEM-RESOLUTION LOG TEMPLATE CREATION**
```
# CREATE DAILY PROBLEM-RESOLUTION LOG FOR EVIDENCE TRACKING
cat > /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md << 'EOF'
# Problem-Resolution Execution Log - $(date +%Y-%m-%d)

## Problem-Resolution Sprint: [PROBLEM_CATEGORY] Elimination
**Role**: [DEVELOPER/TESTER/REVIEWER]  
**Domain**: [PRIMARY_DOMAIN]
**Complexity**: [TIER] ([TIER_DESCRIPTION])
**Start Time**: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

## QUALITY INTELLIGENCE CONTEXT
- Weekly Findings: [FINDINGS_COUNT] in target domain
- Historical Patterns: [PATTERN_SUMMARY]
- Cross-Domain Impact: [RELATED_DOMAINS]
- Baseline Assessment: [CURRENT_STATE]

## PROBLEM ELIMINATION TRACKING

### PHASE 1: PROBLEM BASELINE & ANALYSIS
- Start: [CODEX UPDATES WITH TIMESTAMP]  
- Problems Identified: [CODEX DOCUMENTS SPECIFIC ISSUES]
- Evidence Collected: [CODEX NOTES BASELINE STATE]
- Scope Definition: [CODEX DEFINES ELIMINATION BOUNDARIES]
- Duration: [CODEX CALCULATES]

### PHASE 2: SYSTEMATIC ELIMINATION
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Problems Eliminated: [CODEX TRACKS SPECIFIC FIXES]
- Prevention Measures: [CODEX DOCUMENTS SAFEGUARDS]
- Evidence Generated: [CODEX CREATES PROOF]
- Duration: [CODEX CALCULATES]

### PHASE 3: VERIFICATION & VALIDATION
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Elimination Verified: [CODEX CONFIRMS ZERO ISSUES]
- Cross-Domain Checked: [CODEX VALIDATES NO REGRESSION]
- Evidence Completeness: [CODEX SCORES ≥ 0.9]
- Duration: [CODEX CALCULATES]

### PHASE 4: QUALITY BASELINE UPDATE
- Start: [CODEX UPDATES WITH TIMESTAMP]
- Baseline Improvement: [CODEX MEASURES IMPROVEMENT]
- Prevention Documentation: [CODEX CREATES GUIDES]
- Quality Intelligence Update: [CODEX FEEDS WEEKLY PROCESS]
- Duration: [CODEX CALCULATES]

## EVIDENCE COMPLETENESS METRICS
- Problems Eliminated: [COUNT] / [TOTAL] ([PERCENTAGE]%)
- Prevention Measures: [COUNT] implemented
- Evidence Score: [SCORE] / 1.0 (Target: ≥ 0.9)
- Quality Baseline: [BEFORE] → [AFTER] ([IMPROVEMENT])

## DELIVERABLES COMPLETED
- [ ] [ELIMINATION_DELIVERABLE_1]: [STATUS]
- [ ] [ELIMINATION_DELIVERABLE_2]: [STATUS]  
- [ ] [PREVENTION_DELIVERABLE_1]: [STATUS]
- [ ] [EVIDENCE_DELIVERABLE_1]: [STATUS]

## HANDOFF STATUS
- Problem Elimination: [COMPLETE/PARTIAL/BLOCKED]
- Evidence Quality: [SUFFICIENT/NEEDS_ENHANCEMENT]
- Next Phase: [TESTER/REVIEWER/QUALITY_UPDATE]
- Archive Ready: [YES/NO]

EOF

# Confirm log file created
echo "✅ Problem-resolution log created: execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md"
```

---

## 🔄 SYSTEMATIC PROBLEM-RESOLUTION PHASES

### **PHASE 1: PROBLEM BASELINE & ANALYSIS**
```
# PHASE 1 START TIMESTAMP  
echo "PHASE 1 (PROBLEM BASELINE) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[PROBLEM_CATEGORY] Baseline Analysis in [DOMAIN]"

# Update problem-resolution log
echo "### PHASE 1 PROGRESS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Start: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md

PROBLEM BASELINE TASKS:
☐ [SCAN_CODEBASE]: Identify all instances of [PROBLEM_CATEGORY]
☐ [DOCUMENT_PATTERNS]: Catalog specific problem patterns found
☐ [ASSESS_IMPACT]: Evaluate severity and scope of problems
☐ [EVIDENCE_COLLECTION]: Gather before-state evidence

# PHASE 1 COMPLETE TIMESTAMP
echo "PHASE 1 (PROBLEM BASELINE) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Problems Identified: [COUNT] instances"
echo "Baseline Duration: [CALCULATE MINUTES] minutes"

# Update log with completion
echo "- Problems Found: [COUNT] instances" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Duration: [CALCULATE] minutes" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
```

### **PHASE 2: SYSTEMATIC ELIMINATION**
```
# PHASE 2 START TIMESTAMP
echo "PHASE 2 (SYSTEMATIC ELIMINATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[PROBLEM_CATEGORY] Systematic Elimination in [DOMAIN]"

# Update problem-resolution log
echo "### PHASE 2 PROGRESS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Start: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md

SYSTEMATIC ELIMINATION TASKS:
☐ [ELIMINATE_INSTANCE_1]: [SPECIFIC_PROBLEM_DESCRIPTION]
☐ [ELIMINATE_INSTANCE_2]: [SPECIFIC_PROBLEM_DESCRIPTION]
☐ [ELIMINATE_INSTANCE_N]: [SPECIFIC_PROBLEM_DESCRIPTION]
☐ [IMPLEMENT_PREVENTION]: Safeguards to prevent recurrence
☐ [VERIFY_ELIMINATION]: Confirm zero instances remain

# PHASE 2 COMPLETE TIMESTAMP  
echo "PHASE 2 (SYSTEMATIC ELIMINATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Problems Eliminated: [COUNT] / [TOTAL]"
echo "Elimination Duration: [CALCULATE] minutes"
echo "Token Usage Check: [MONITOR against BUDGET]"
```

### **PHASE 3: VERIFICATION & EVIDENCE VALIDATION**  
```
# PHASE 3 START TIMESTAMP
echo "PHASE 3 (VERIFICATION) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[PROBLEM_CATEGORY] Elimination Verification in [DOMAIN]"

VERIFICATION TASKS:
☐ [ZERO_VERIFICATION]: Confirm zero [PROBLEM_CATEGORY] instances remain
☐ [PREVENTION_VALIDATION]: Verify prevention measures working
☐ [EVIDENCE_COMPLETENESS]: Score evidence quality ≥ 0.9
☐ [CROSS_DOMAIN_CHECK]: Ensure no regression in related domains
☐ [BASELINE_IMPROVEMENT]: Measure quality improvement

# PHASE 3 COMPLETE TIMESTAMP
echo "PHASE 3 (VERIFICATION) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "Evidence Score: [SCORE] / 1.0"
echo "Verification Duration: [CALCULATE] minutes"
```

### **PHASE 4: QUALITY BASELINE UPDATE & HANDOFF**
```
# PHASE 4 START TIMESTAMP
echo "PHASE 4 (QUALITY UPDATE) START - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" 
echo "[PROBLEM_CATEGORY] Quality Baseline Update & Handoff"

QUALITY UPDATE TASKS:
☐ Problem elimination evidence compilation
☐ Prevention measures documentation  
☐ Quality baseline improvement metrics
☐ Weekly quality intelligence update
☐ Archive preparation with evidence

# PHASE 4 COMPLETE + TOTAL DURATION
echo "PHASE 4 (QUALITY UPDATE) COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[ROLE] PROBLEM-RESOLUTION TOTAL DURATION: [CALCULATE FROM START TO END]"
echo "Target: [TARGET] minutes | Actual: [CALCULATE] | Variance: [XX]%"
echo "Problems Eliminated: [COUNT] | Evidence Score: [SCORE] / 1.0"
echo "Quality Improvement: [BASELINE_BEFORE] → [BASELINE_AFTER]"
```

---

## 📊 MANDATORY PROBLEM-RESOLUTION DELIVERABLES

### **ELIMINATION ARTIFACTS**
```
📊 MANDATORY DELIVERABLES - [PROBLEM_CATEGORY] ELIMINATION:

Problem-Resolution Artifacts:
☐ Problem Elimination Report: sprint-management/completion-logs/[SPRINT_ID]-problem-elimination-v3.3.md
☐ Evidence Collection: sprint-management/completion-logs/[SPRINT_ID]-evidence-validation-v3.3.md  
☐ Quality Baseline Update: sprint-management/completion-logs/[SPRINT_ID]-quality-improvement-v3.3.md

Technical Deliverables:
☐ [SPECIFIC_TECHNICAL_DELIVERABLE_1]: Zero [PROBLEM_CATEGORY] instances
☐ [SPECIFIC_TECHNICAL_DELIVERABLE_2]: Prevention measures implemented
☐ [SPECIFIC_TECHNICAL_DELIVERABLE_3]: Quality intelligence updated

Evidence Quality (Process v3.3):
☐ Completeness Scoring: [SCORE] / 1.0 (Target: ≥ 0.9)
☐ Before/After Metrics: [BASELINE_IMPROVEMENT] demonstrated
☐ Prevention Validation: [PREVENTION_MEASURES] working
☐ Cross-Domain Impact: [NO_REGRESSION] confirmed
```

---

## 🔄 PROCESS V3.3 COMMIT TEMPLATE

### **PROBLEM-RESOLUTION COMMIT FORMAT**
```
# SYSTEMATIC GIT COMMIT - Process v3.3 Problem-Resolution
git add .
git commit -m "[TYPE]: [PROBLEM_CATEGORY] systematic elimination (Process v3.3)

Problem Domain: [PRIMARY_DOMAIN] 
Quality Intelligence: [WEEKLY_FINDINGS_COUNT] findings addressed
Elimination Scope:
- [PROBLEM_1]: [ELIMINATION_OUTCOME]
- [PROBLEM_2]: [ELIMINATION_OUTCOME]  
- [PROBLEM_3]: [ELIMINATION_OUTCOME]

Evidence Quality: [SCORE] / 1.0 (Target: ≥ 0.9)
Prevention Measures: [COUNT] implemented
Quality Baseline: [BEFORE] → [AFTER] ([IMPROVEMENT]%)
Duration: [ACTUAL] minutes (Estimated: [TARGET] minutes)

Process v3.3: [CURRENT_ROLE] → [NEXT_ROLE] handoff ready
Problem Status: [ELIMINATED/PARTIAL] with [EVIDENCE_LEVEL] evidence
Quality Intelligence: Updated for weekly review process"

# Push changes
git push origin [BRANCH_NAME]
```

---

## ✅ SUCCESS CRITERIA VERIFICATION TEMPLATE

### **PROBLEM-RESOLUTION COMPLETION CHECKLIST**
```
✅ SUCCESS CRITERIA VERIFICATION - [PROBLEM_CATEGORY] ELIMINATION:

Problem Elimination Standards:
☐ Zero [PROBLEM_CATEGORY] instances confirmed in codebase
☐ [SPECIFIC_ELIMINATION_CRITERIA_1] achieved with evidence
☐ [SPECIFIC_ELIMINATION_CRITERIA_2] validated with metrics
☐ Prevention measures implemented and tested

Evidence Quality Standards (Process v3.3):
☐ Evidence completeness score ≥ 0.9 achieved
☐ Before/after baseline improvement demonstrated
☐ Cross-domain regression testing passed
☐ Quality intelligence updated for weekly process

Process Standards:
☐ Systematic problem-resolution timing capture completed
☐ Problem-resolution log updated with complete evidence
☐ All reference files read and quality intelligence applied
☐ Role-specific guardrails enforced throughout execution
```

---

## 🚨 ENHANCED ABORT CONDITIONS TEMPLATE

### **MANDATORY ABORT TRIGGERS**
```
🚨 ENHANCED ABORT CONDITIONS - [PROBLEM_CATEGORY] ELIMINATION:

Mandatory abort if:
☐ [PROBLEM_CATEGORY] scope expands beyond planned elimination boundaries
☐ Evidence completeness cannot achieve ≥ 0.9 threshold
☐ Cross-domain regression detected in [RELATED_DOMAINS]
☐ Quality intelligence indicates approach causing new problems

Escalation Procedures:
☐ Scope Expansion: Focus on [CRITICAL_PROBLEMS] over [OPTIONAL_IMPROVEMENTS]
☐ Evidence Gap: Extend verification phase, defer [NON_ESSENTIAL_ELIMINATION]
☐ Regression Risk: Escalate to human review, implement additional safeguards
☐ Quality Conflict: [SPECIFIC_RECOVERY_PROCEDURES] for domain conflicts
```

---

## 🎯 HANDOFF AUTHORIZATION TEMPLATE

### **ROLE TRANSITION CRITERIA**
```
🎯 HANDOFF AUTHORIZATION - [PROBLEM_CATEGORY] ELIMINATION:

Only proceed to [NEXT_ROLE] when:
☐ All [PROBLEM_CATEGORY] instances eliminated with documented evidence
☐ Evidence completeness score ≥ 0.9 achieved
☐ Prevention measures implemented and validated
☐ Quality baseline improvement demonstrated
☐ Cross-domain impact assessed with no regression

HANDOFF SIGNAL:
"[ROLE] PROBLEM-RESOLUTION COMPLETE - [PROBLEM_CATEGORY] ELIMINATED - READY FOR [NEXT_ROLE] ROLE TRANSITION"
```

---

## ⏱️ FINAL TIMING PROTOCOL TEMPLATE

### **PROBLEM-RESOLUTION PERFORMANCE SUMMARY**
```
⏱️ MANDATORY TIMING PROTOCOL - PROBLEM-RESOLUTION COMPLETE

# CAPTURE FINAL PERFORMANCE SUMMARY
echo "[ROLE] PROBLEM-RESOLUTION COMPLETE - $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo "[PROBLEM_CATEGORY] Systematic Elimination - [ROLE] EXECUTION COMPLETE"
echo ""
echo "PROBLEM-RESOLUTION SUMMARY:"
echo "- Problems Eliminated: [COUNT] (Target: [TARGET]) - Success: [XX]%"
echo "- Evidence Score: [SCORE] / 1.0 (Target: ≥ 0.9) - Quality: [STATUS]"
echo "- Duration: [ACTUAL] minutes (Target: [TARGET] minutes) - Variance: [XX]%"  
echo "- Quality Baseline: [BEFORE] → [AFTER] - Improvement: [XX]%"
echo "- Prevention Measures: [COUNT] implemented"
echo ""
echo "[PROBLEM_CATEGORY] ELIMINATION EVIDENCE:"
echo "- [EVIDENCE_1]: [STATUS]"
echo "- [EVIDENCE_2]: [STATUS]"
echo "- [EVIDENCE_3]: [STATUS]"
echo ""
echo "HANDOFF TO [NEXT_ROLE]: AUTHORIZED"
echo "Next Phase: [NEXT_PHASE_DESCRIPTION]"

# Update final status in problem-resolution log
echo "## FINAL STATUS" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Total Duration: [ACTUAL] minutes" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md  
echo "- Problems Eliminated: [COUNT] / [TARGET]" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Evidence Score: [SCORE] / 1.0" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Quality Improvement: [IMPROVEMENT]%" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
echo "- Handoff: [NEXT_ROLE] authorized" >> /Users/kevinbrown/MCP-ocs/sprint-management/execution-logs/problem-resolution-log-$(date +%Y-%m-%d).md
```

---

**TEMPLATE USAGE**: Replace bracketed placeholders with actual problem-resolution values
**SESSION SAFETY**: Every prompt generated from this template is self-contained
**PROCESS COMPLIANCE**: Follows Process v3.3 Problem-Resolution Framework completely  
**QUALITY INTELLIGENCE**: Integrates Review-Prompt-Lib findings and weekly quality process
**EVIDENCE-BASED**: Requires ≥ 0.9 evidence completeness for systematic validation

---
