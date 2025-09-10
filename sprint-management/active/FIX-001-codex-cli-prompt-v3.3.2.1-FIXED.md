# CODEX CLI INITIALIZATION PROMPT - FIX-001 MEMORY SYSTEM CRISIS (Process v3.3.2.1 Compliant)

**Process Framework**: Process v3.3.2.1 - Two-Part Prompt Structure  
**Sprint ID**: FIX-001-memory-system-crisis-restart  
**Template Compliance**: MANDATORY fixed header + variable domain
**Quality Standard**: Aviation checklist discipline with zero deviation tolerance  

---

# PART 1: FIXED TEMPLATE HEADER - DAILY REPEATABLE TASKS

**Template Source**: `/sprint-management/templates/daily-repeatable-task-template-v3.3.2.md`  
**Template Version**: v3.3.2-daily-repeatable  
**Usage**: Standard foundation for all CODEX CLI sprint prompts - NEVER MODIFY

## MANDATORY GIT WORKFLOW INITIALIZATION

```bash
# STANDARD START - EVERY SPRINT
cd /Users/kevinbrown/MCP-ocs
git checkout release/v0.9.0-beta
git pull origin release/v0.9.0-beta  
git checkout -b feature/FIX-001-memory-system-crisis-restart

# VERIFY CLEAN WORKING STATE
git status
npm run build  # Ensure foundation compiles
```

**GIT DISCIPLINE DURING SPRINT**:
- **COMMIT**: Frequent local commits as work progresses
- **NO PUSH**: Never push during sprint execution 
- **NO MERGE**: End-of-day cleanup handled by Scrum Master + Human
- **SAFETY**: All work preserved locally on feature branch

## SYSTEMATIC TASK LOGGING FRAMEWORK

**Real-Time Logging Commands** (Use throughout sprint):
```bash
# PHASE START LOGGING
echo "$(date -Iseconds): [TASK] Starting [PHASE-NAME]" >> logs/sprint-execution.log

# DECISION POINT LOGGING  
echo "$(date -Iseconds): [DECISION] [Description] - Rationale: [reason]" >> logs/sprint-execution.log

# EVIDENCE LOGGING
echo "$(date -Iseconds): [EVIDENCE] [Metric/Test] - Result: [outcome]" >> logs/sprint-execution.log

# PHASE COMPLETION LOGGING
echo "$(date -Iseconds): [COMPLETE] [PHASE-NAME] - Evidence: [summary]" >> logs/sprint-execution.log
```

**Log Verification Commands**:
```bash
# CHECK LOG COMPLETENESS
tail -20 logs/sprint-execution.log
wc -l logs/sprint-execution.log  # Line count verification
```

## DEVELOPER-GUARDRAILS COMPLIANCE VERIFICATION

**Security Pattern Audit Commands** (Run at each phase):
```bash
# D-001: Input Validation Check
grep -r "process.env" src/ | grep -v "validation\|schema"

# D-002: TypeScript Hygiene Audit  
grep -r "any" src/ | grep -v "@ts-ignore" | head -5

# D-005: Async Correctness Check
grep -r "await" src/ | grep -v "try\|catch" | head -5

# D-006: Error Taxonomy Verification
grep -r "throw new Error" src/ | head -5

# D-009: Date-Time Safety Audit (CRITICAL)
grep -r "Date.now()\|new Date()\|Date.parse()" src/ || echo "✅ D-009 Compliant"
grep -r "nowIso\|nowEpoch" src/ | wc -l  # Count proper usage
```

## PERFORMANCE REQUIREMENTS ENFORCEMENT

**Timing Standards** (Measure all operations):
```bash
# OPERATION TIMING TEMPLATE
START_TIME=$(date +%s)
# [Execute operation]
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Operation took ${DURATION}s (requirement: <15s)" >> logs/sprint-execution.log
```

**Performance Validation Requirements**:
- Individual operations: <15 seconds
- Evidence confidence: ≥0.8 for critical validations  
- Step efficiency: ≤3 steps per validation checkpoint
- Memory operations: <1000ms store, <400ms search

## SYSTEMATIC PHASE COMPLETION CHECKLIST

**Before Proceeding to Next Phase** (Mandatory verification):
```bash
# PHASE COMPLETION VERIFICATION
echo "Phase Completion Checklist:"
echo "[ ] Performance requirements met (<15s operations, ≥0.8 evidence)"
echo "[ ] Quality gates passed (≤3 steps per validation)"
echo "[ ] Security guardrails verified (D-001, D-002, D-005, D-006, D-009)"
echo "[ ] Documentation complete (decision rationale logged)"
echo "[ ] Evidence collected (quantitative metrics captured)"
echo "[ ] Local commits made (work preserved safely)"
```

## EVIDENCE COLLECTION PROTOCOLS

**Quantitative Evidence Requirements**:
```bash
# PERFORMANCE EVIDENCE
echo "Performance Metrics:" >> logs/evidence-$(date +%Y%m%d).log
echo "- Operation latency: [Xs] (target: <15s)" >> logs/evidence-$(date +%Y%m%d).log
echo "- Test execution time: [Xs] (target: <180s)" >> logs/evidence-$(date +%Y%m%d).log

# QUALITY EVIDENCE  
echo "Quality Metrics:" >> logs/evidence-$(date +%Y%m%d).log
echo "- Test coverage: [N]% (target: >80%)" >> logs/evidence-$(date +%Y%m%d).log
echo "- Security compliance: [N/6] guardrails (target: 6/6)" >> logs/evidence-$(date +%Y%m%d).log
```

## ROLE DEFINITIONS & BOUNDARIES

**CODEX PRIMARY EXECUTOR RESPONSIBILITIES**:
- Systematic phase-based implementation following template
- Complete evidence collection with quantitative validation
- Technical decision documentation with rationale logging
- Performance optimization within established budgets
- Quality gate compliance before phase progression
- Local git commits preserving all work safely

**HUMAN OVERSIGHT (SCRUM MASTER) BOUNDARIES**:
- Strategic decisions requiring business context
- Scope boundary management and timeline adjustments  
- Rollback authority for production safety concerns
- End-of-day git cleanup and merge coordination
- Process framework compliance verification

**CRITICAL**: CODEX executes systematically, Human handles strategic oversight and git finalization

## QUALITY ASSURANCE INTEGRATION

**Testing Strategy Framework**:
```bash
# UNIT TESTING VERIFICATION
npm test -- --coverage --testPathPattern=[DOMAIN]

# INTEGRATION TESTING
npm run test:integration -- [SPECIFIC-SUITE]

# E2E TESTING (if applicable)
npm run test:e2e -- [SCENARIO]
```

**Code Quality Commands**:
```bash
# LINTING VERIFICATION
npm run lint -- src/[CHANGED-FILES]

# TYPE CHECKING
npm run typecheck

# BUILD VERIFICATION
npm run build && echo "✅ Build successful" || echo "❌ Build failed"
```

## HANDOFF PREPARATION FRAMEWORK

**TESTER Handoff Package Requirements**:
- Complete implementation with evidence documentation
- Performance benchmark results with quantitative metrics
- Quality gate completion verification logs
- Security guardrails compliance assessment
- Testing procedures with expected outcomes
- Rollback procedures (if applicable)

---

# PART 2: VARIABLE SPRINT DOMAIN - FIX-001 MEMORY SYSTEM CRISIS

**Domain Context**: MCP-OCS Memory System Emergency Architecture Consolidation  
**Priority**: P0 Production Breaking  
**Estimated Duration**: 6-8 hours systematic implementation  
**Aviation Context**: This airport (memory system) has specific challenges requiring bounded local procedures

## CRISIS-SPECIFIC TECHNICAL CONTEXT

### Root Cause Analysis (Vector Memory + GitHub Issue)

**Architecture Crisis Components**:
1. **Protocol Violations**: ChromaMemoryManager Unicode emoji logs breaking MCP JSON protocol
2. **Import Resolution Failure**: TypeScript path alias (@/lib) fails at runtime in index.ts
3. **External Dependency Coupling**: ../../../MCP-files/src/memory-extension.ts breaking clean builds
4. **Memory System Inconsistency**: Dual write paths causing data integrity issues
5. **Entry Point Architecture Chaos**: Three entry points with different behaviors

**Proven Working Evidence**:
- **index-sequential.ts**: Battle-tested by all E2E testing, direct imports, functional memory
- **index.ts**: Official main but runtime failures due to @/lib path alias resolution
- **index.beta.ts**: Stable subset, preserved as rollback option

### Memory Crisis Domain Files

**Critical File Locations**:
- **Protocol Crisis**: `src/lib/memory/chroma-memory-manager.ts` (ChromaMemoryManager.log method)
- **Import Crisis**: `src/lib/memory/shared-memory.ts` (MCPFilesChromaAdapter @/lib import)
- **Entry Points**: `src/index.ts`, `src/index-sequential.ts`, `src/index.beta.ts`
- **Memory Chain**: SharedMemoryManager → MCPFilesChromaAdapter → ChromaMemoryManager

## 6-PHASE EMERGENCY CONSOLIDATION STRATEGY

**Implementation Plan Reference**: `/Users/kevinbrown/MCP-ocs/docs/internal/codex-docs/fix-001-memory-crisis-implementation-plan-2025-09-10.md`

**CODEX CLI Generated Plan**: Complete 6-phase implementation strategy with detailed technical tasks, validation checkpoints, and rollback procedures already documented.

**Execute the phases as specified in the referenced CODEX implementation plan document.**

## DOMAIN-SPECIFIC SUCCESS CRITERIA

**P0 Memory Crisis Resolution**:
- [ ] Zero stdout output during server operation (protocol compliance)
- [ ] No imports from MCP-files/ external paths (clean builds)
- [ ] Unified memory backend serving all tool suites (consistency)
- [ ] Sequential entry passes E2E scripts without regressions (stability)
- [ ] Beta entry preserved and functional as fallback (safety)

**Performance Requirements (Memory Domain)**:
- Memory store operations: <1000ms
- Memory search operations: <400ms  
- Protocol smoke test: <5s execution
- Build validation: <30s
- Server startup: <10s with memory system

## DOMAIN-SPECIFIC RISK MITIGATION

**Memory System Risks**:
- **ChromaDB Availability**: JSON fallback operational, graceful degradation
- **Adapter Unification**: Feature-flagged rollout with selective rollback
- **Protocol Compliance**: Comprehensive testing before production deployment

**Emergency Rollback (Memory Domain)**:
```bash
# MEMORY CRISIS ROLLBACK
export MCP_PROTOCOL_SAFE=false
export UNIFIED_MEMORY=false
# Switch to beta entry: tsx src/index.beta.ts
```

## DOMAIN-SPECIFIC VALIDATION

**Memory System Testing Strategy**:
```bash
# MEMORY INTEGRATION TESTING
npm test -- --testPathPattern=memory-integration

# PROTOCOL COMPLIANCE TESTING
./scripts/protocol-smoke-test.sh

# E2E MEMORY WORKFLOWS
NAMESPACE=student03 npm run test:e2e -- memory-workflows
```

---

## EXECUTION INITIATION

**CODEX CLI**: Begin systematic implementation of FIX-001 emergency consolidation using Process v3.3.2.1 two-part structure with complete aviation checklist discipline.

**Sprint Execution**:
- **Part 1 (Fixed)**: Template provides all systematic foundation automatically
- **Part 2 (Variable)**: Focus on memory crisis domain-specific implementation
- **Evidence Standard**: Complete quantitative validation with ≥0.8 confidence
- **Quality Gates**: Systematic verification before each phase progression

**Human Oversight**: Strategic decisions, rollback authority, end-of-day git coordination

**Success Definition**: MCP-OCS memory system crisis resolved with production-ready unified architecture, complete Process v3.3.2.1 audit trail, and systematic rollback capabilities.

---

**PROCESS v3.3.2.1 COMPLIANT PROMPT READY FOR CODEX CLI DEPLOYMENT**

**Template Integration Verified**: Part 1 (Fixed) + Part 2 (Variable) structure achieved  
**Aviation Checklist Discipline**: Zero deviation tolerance maintained  
**Scrum Master Load**: Reduced to domain-specific context only  
**Sprint Readiness**: Complete systematic foundation with memory crisis bounded tasks
