# DAILY STANDUP PRE-FLIGHT CHECKLIST - Process v3.1

**MANDATORY EXECUTION ORDER - NO EXCEPTIONS**

## PRE-FLIGHT INSPECTION (5 minutes)

### ✓ CONTEXT RECONSTRUCTION
- [ ] Read current git branch: `git branch` and `git status`
- [ ] Check sprint-management/active-tasks/ for current sprint status
- [ ] Review sprint-management/completion-logs/ for last session results
- [ ] Verify vector memory context available for session continuity

### ✓ SYSTEM READINESS
- [ ] Confirm Process v3.1 framework files exist:
  - [ ] `/sprint-management/PROCESS-V3.1-READY.md` readable
  - [ ] `/sprint-management/templates/status-tracking-template.md` available
  - [ ] Quality domain backlog accessible: `/sprint-management/backlog/domains/`
- [ ] Build system operational: `npm run build` baseline check

### ✓ SAFETY PROTOCOLS
- [ ] Git safety lessons applied: all previous work committed before new operations
- [ ] Branch protection confirmed: working on correct branch for new work
- [ ] Backup verification: recent commits pushed to origin

## MISSION PLANNING (10 minutes)

### ✓ BACKLOG ASSESSMENT
- [ ] Review quality domains D-001 through D-015 for implementation status
- [ ] Identify domains marked "Complete" (specification) but requiring implementation
- [ ] Select highest priority domain/epic combination based on:
  - [ ] P0/P1 priority level
  - [ ] Clear task definitions with acceptance criteria
  - [ ] 4-hour Process v3.1 capacity alignment
  - [ ] No blocking dependencies

### ✓ SPRINT SCOPE DEFINITION
- [ ] Domain selected: D-XXX
- [ ] Epic selected: EPIC-XXX
- [ ] Tasks identified with time estimates
- [ ] Success criteria defined and measurable
- [ ] Testing requirements specified
- [ ] Handoff artifacts identified

### ✓ RESOURCE VERIFICATION
- [ ] All reference files for selected domain accessible
- [ ] Specification source available and current
- [ ] Required tools and build environment ready
- [ ] Estimated time fits available session capacity

## EXECUTION AUTHORIZATION (5 minutes)

### ✓ PROCESS v3.1 FRAMEWORK ARMED
- [ ] DEVELOPER role guardrails defined explicitly
- [ ] TESTER handoff artifacts specified
- [ ] REVIEWER assessment criteria established
- [ ] Quality gates and acceptance criteria confirmed

### ✓ SYSTEMATIC EXECUTION PLAN
- [ ] Phase-by-phase breakdown with validation checkpoints
- [ ] Incremental commit strategy defined
- [ ] Error handling and rollback procedures confirmed
- [ ] Expected deliverables documented

### ✓ FINAL AUTHORIZATION
- [ ] All checklist items completed - NO EXCEPTIONS
- [ ] Sprint objectives clear and achievable
- [ ] Process framework properly configured
- [ ] Ready for systematic execution

## EXECUTION COMMAND

**Only when ALL checklist items confirmed:**

```
AUTHORIZED: Process v3.1 Sprint Execution
Domain: [SELECTED_DOMAIN]
Epic: [SELECTED_EPIC] 
Estimated Duration: [TIME]
Framework: DEVELOPER → TESTER → REVIEWER → TECHNICAL_REVIEWER

Proceed with systematic implementation.
```

## ABORT CONDITIONS

**Mandatory abort if ANY checklist item fails:**
- Incomplete context reconstruction
- Missing reference files
- Unclear sprint scope
- Framework components not ready
- Safety protocols not confirmed

**Recovery**: Complete missing checklist items before proceeding.

---

**CRITICAL**: This checklist is mandatory every session. No conversation, no shortcuts, no "we did this yesterday." Execute systematically every time like aircraft pre-flight inspection.
