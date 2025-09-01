# CORRECTED CODEX CLI PROMPT: D-002 Domain EPIC-003 TypeScript Configuration Hardening

## ROLE: DEVELOPER - Process v3.1 Enhanced Framework
**Domain**: D-002 Repository Structure & Configuration
**Epic**: EPIC-003 TypeScript Configuration Hardening  
**Sprint Scope**: 4 hours (partial implementation of 8-hour epic)

BRANCH: feature/deterministic-template-engine
PROCESS FLOW: DEVELOPER → TESTER → REVIEWER → TECHNICAL_REVIEWER
GUARDRAILS: Zero technical debt acceptance, systematic implementation

## D-002 EPIC-003 TASK BREAKDOWN

**Total Epic**: 8 hours (3 tasks)
**Sprint Target**: 4 hours (focus on TASK-003-A, TASK-003-B, partial TASK-003-C)

### TASK-003-A: Enable `noUncheckedIndexedAccess` and fix resulting errors
**Time**: 2 hours (reduced scope from 4h specification)
**Priority**: Critical paths first

### TASK-003-B: Enable `exactOptionalPropertyTypes` and resolve conflicts  
**Time**: 1.5 hours (reduced scope from 3h specification)
**Priority**: High-impact interfaces first

### TASK-003-C: Audit and fix remaining `any` types (Partial)
**Time**: 0.5 hours (partial of 1h specification)  
**Priority**: Most critical any usage only

## IMPLEMENTATION PHASES

### PHASE 1: Current State Assessment (15 minutes)
```bash
# Review D-002 TypeScript configuration
cat tsconfig.json
echo "=== D-002 BASELINE BUILD ===" > build-baseline.log
npm run build 2>&1 | tee -a build-baseline.log
echo "D-002 baseline: $(date)" >> build-baseline.log
```

### PHASE 2: EPIC-003 TypeScript Configuration Hardening (3.5 hours)

#### TASK-003-A: Enable noUncheckedIndexedAccess (2 hours)
**Configuration**:
```json
// Add to tsconfig.json compilerOptions:
"noUncheckedIndexedAccess": true
```

**Fix Pattern**:
```typescript
// Replace: arr[index].property  
// With: arr[index]?.property || defaultValue
// Replace: obj[key].method()
// With: obj[key]?.method?.() || fallback
```

**Target Files** (priority order):
1. /src/lib/tools/tool-registry.ts
2. /src/lib/memory/shared-memory.ts
3. /src/tools/ (diagnostic tools with array access)

**Validation**: `npm run build` succeeds after major fixes

#### TASK-003-B: Enable exactOptionalPropertyTypes (1.5 hours)
**Configuration**:
```json  
// Add to tsconfig.json compilerOptions:
"exactOptionalPropertyTypes": true
```

**Fix Pattern**:
```typescript
// Replace: property?: T (where T can be undefined)
// With: property?: T | undefined
// Replace: property?: T (where T cannot be undefined)
// With: property: T
```

**Target Files**:
1. /src/lib/types/common.ts
2. Memory interfaces with optional properties
3. Tool parameter interfaces

#### TASK-003-C: Critical any types audit (0.5 hours - partial)
**Focus**: Only most critical any usage encountered during TASK-003-A/B
**Pattern**: Replace with proper types where immediately feasible
**Scope**: Modified files only, don't hunt for all any types

### PHASE 3: D-002 Status Update (30 minutes)
1. Update D-002 domain README.md with implementation status
2. Apply status tracking template (specification vs implementation)
3. Document EPIC-003 progress and remaining work

## DEVELOPER DELIVERABLES

### Artifact 1: D-002 Implementation Summary
```bash
echo "# D-002 EPIC-003 DEVELOPER COMPLETION REPORT

## Domain: D-002 Repository Structure & Configuration  
## Epic: EPIC-003 TypeScript Configuration Hardening
## Sprint Scope: 4 hours of 8-hour epic

## Tasks Completed:
- [x] TASK-003-A: noUncheckedIndexedAccess enabled and errors fixed
- [x] TASK-003-B: exactOptionalPropertyTypes enabled and conflicts resolved  
- [x] TASK-003-C: Critical any types addressed (partial)

## Configuration Applied:
- noUncheckedIndexedAccess: true
- exactOptionalPropertyTypes: true

## Files Modified:
$(git diff --name-only HEAD~1)

## Build Validation:
$(npm run build 2>&1 | tail -5)

## Remaining Epic Work:
- TASK-003-C: Complete any type audit (0.5 hours remaining)

## Handoff: Ready for TESTER validation
## Commit: $(git rev-parse HEAD)
## Completed: $(date)
" > sprint-management/completion-logs/d-002-epic-003-developer-completion.md
```

### Artifact 2: TESTER Validation Requirements
```bash
echo "# D-002 EPIC-003 TESTING REQUIREMENTS

## TESTER ROLE VALIDATION FOR EPIC-003 TypeScript Configuration Hardening

### Build Validation:
- [ ] npm run build completes without errors
- [ ] npm run build produces no TypeScript warnings
- [ ] Build output comparable to baseline

### TypeScript Configuration Validation:
- [ ] noUncheckedIndexedAccess properly enabled and working
- [ ] exactOptionalPropertyTypes properly enabled and working
- [ ] Array access patterns properly guarded
- [ ] Optional properties correctly typed

### Runtime Validation:
- [ ] Core diagnostic tools function correctly
- [ ] Memory system operations work without type errors
- [ ] Tool registry loads and operates normally
- [ ] No console type errors during operation

### Regression Testing:
- [ ] All existing tests pass: npm test
- [ ] No functional regressions in diagnostic tools
- [ ] Performance comparable to baseline
- [ ] Memory operations stable

### D-002 Epic Progress:
- [ ] TASK-003-A implementation verified
- [ ] TASK-003-B implementation verified  
- [ ] TASK-003-C partial implementation verified
- [ ] Status update reflects actual progress

## Success Criteria:
All validation items must pass for TESTER approval of D-002 EPIC-003 progress.

## Test Commands:
npm run build && npm test && npm run lint
" > sprint-management/completion-logs/d-002-epic-003-testing-requirements.md
```

## SUCCESS CRITERIA
- [ ] TASK-003-A: noUncheckedIndexedAccess enabled with fixes
- [ ] TASK-003-B: exactOptionalPropertyTypes enabled with fixes
- [ ] TASK-003-C: Critical any types addressed (partial completion)
- [ ] D-002 status updated to reflect implementation progress
- [ ] Testing artifacts created for TESTER validation
- [ ] Zero TypeScript compilation errors

## COMMIT STRATEGY
```bash
git add .
git commit -m "feat: D-002 EPIC-003 TypeScript hardening - DEVELOPER phase

Domain: D-002 Repository Structure & Configuration
Epic: EPIC-003 TypeScript Configuration Hardening (4h of 8h completed)

Tasks completed:
- TASK-003-A: Enable noUncheckedIndexedAccess and fix errors
- TASK-003-B: Enable exactOptionalPropertyTypes and resolve conflicts  
- TASK-003-C: Critical any types audit (partial)

Process v3.1: DEVELOPER → TESTER handoff ready
Remaining epic work: 4 hours for complete TASK-003-C coverage"
```

Begin with PHASE 1 - establish D-002 TypeScript configuration baseline for EPIC-003 implementation.
