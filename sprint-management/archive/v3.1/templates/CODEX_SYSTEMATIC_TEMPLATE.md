# CODEX SYSTEMATIC EXECUTION TEMPLATE - Process v3.1

**MANDATORY CHECKLIST COMPLETION REQUIRED BEFORE EXECUTION**

## ROLE: DEVELOPER - Process v3.1 Enhanced Framework

### MANDATORY REFERENCE FILES - READ FIRST:
```bash
# Framework Definition
cat /Users/kevinbrown/MCP-ocs/sprint-management/PROCESS-V3.1-READY.md

# Status Tracking Process  
cat /Users/kevinbrown/MCP-ocs/sprint-management/templates/status-tracking-template.md

# Domain Specification (REPLACE WITH SELECTED DOMAIN)
cat /Users/kevinbrown/MCP-ocs/sprint-management/backlog/domains/[SELECTED_DOMAIN]/README.md

# Current Sprint Definition
cat /Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/[CURRENT_SPRINT].md

# Daily Checklist Completion Verified
cat /Users/kevinbrown/MCP-ocs/sprint-management/templates/DAILY_STANDUP_CHECKLIST.md
```

### EXPLICIT GUARDRAILS (NON-NEGOTIABLE):
1. **Zero Technical Debt Acceptance**: No `any` types, `@ts-ignore`, or technical shortcuts permitted
2. **Systematic Error Resolution**: Fix errors methodically following established patterns  
3. **Incremental Validation**: Test build success after each configuration change
4. **Quality Gate Enforcement**: All acceptance criteria must pass before role handoff
5. **Commit After Each Phase**: Preserve work with descriptive messages per Process v3.1
6. **Documentation Requirements**: Create all specified handoff artifacts

### SYSTEMATIC EXECUTION PHASES:

#### PHASE 1: BASELINE ESTABLISHMENT (Mandatory)
- [ ] Review current system state against domain specification
- [ ] Document baseline metrics (build status, error count, test results)
- [ ] Identify all files requiring changes per specification
- [ ] Confirm understanding of acceptance criteria

#### PHASE 2: SYSTEMATIC IMPLEMENTATION 
- [ ] Apply changes incrementally with validation at each step
- [ ] Follow established patterns from domain specification
- [ ] Test and validate after each major change
- [ ] Document any deviations from planned approach

#### PHASE 3: QUALITY VALIDATION
- [ ] Verify all acceptance criteria met
- [ ] Run complete test suite validation
- [ ] Create TESTER handoff artifacts
- [ ] Update domain implementation status

#### PHASE 4: PROCESS v3.1 HANDOFF
- [ ] Generate implementation completion report
- [ ] Create testing requirements document
- [ ] Update status tracking per template
- [ ] Commit with structured message format

### MANDATORY DELIVERABLES:
1. **Implementation Report**: sprint-management/completion-logs/[DOMAIN]-[EPIC]-developer-completion.md
2. **Testing Requirements**: sprint-management/completion-logs/[DOMAIN]-[EPIC]-testing-requirements.md  
3. **Status Update**: Update domain README.md with implementation progress
4. **Quality Evidence**: Build logs, test results, validation confirmation

### SUCCESS CRITERIA VERIFICATION:
- [ ] All specified tasks completed within scope
- [ ] Zero compilation errors or warnings
- [ ] All tests passing without regression
- [ ] TESTER handoff artifacts created and complete
- [ ] Domain status reflects accurate implementation progress

### PROCESS v3.1 COMMIT FORMAT:
```bash
git add .
git commit -m "feat: [DOMAIN] [EPIC] - DEVELOPER phase complete

Domain: [DOMAIN_NAME]
Epic: [EPIC_NAME]
Tasks completed: [LIST_TASKS]

Process v3.1: DEVELOPER → TESTER handoff ready
Status: [IMPLEMENTATION_PROGRESS]"
```

### ABORT CONDITIONS:
Mandatory abort if:
- Reference files not accessible or current
- Guardrails cannot be satisfied
- Success criteria unclear or unachievable
- Required tools or dependencies unavailable

### HANDOFF AUTHORIZATION:
Only proceed to TESTER role when:
- [ ] All deliverables created and validated
- [ ] Success criteria completely satisfied
- [ ] Implementation artifacts ready for independent validation
- [ ] Process v3.1 framework properly executed

---

**EXECUTE ONLY AFTER DAILY STANDUP CHECKLIST COMPLETION**
**NO EXCEPTIONS - NO SHORTCUTS - NO DISCUSSION**

Replace [PLACEHOLDERS] with actual values from completed checklist before execution.
