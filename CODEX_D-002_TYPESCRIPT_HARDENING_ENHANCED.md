# CODEX CLI PROMPT: D-002 TypeScript Hardening - Process v3.1 Complete

## ROLE: DEVELOPER
**Guardrails**: Zero technical debt acceptance, systematic implementation, commit after each phase
**Focus**: TypeScript configuration hardening with error resolution

TASK: D-002 TypeScript Configuration Hardening + Status Tracking Pilot

BRANCH: feature/deterministic-template-engine (stay on current branch)
PROCESS: v3.1 Enhanced Framework - DEVELOPER → TESTER → REVIEWER → TECHNICAL_REVIEWER
DURATION: 4-hour sprint session

OBJECTIVE: Implement stricter TypeScript configuration and establish status tracking process

## DEVELOPER PHASE EXECUTION

### PHASE 1: Current State Assessment (15 minutes)
```bash
# Review current configuration
cat tsconfig.json
echo "=== BASELINE BUILD ===" > build-baseline.log
npm run build 2>&1 | tee -a build-baseline.log
echo "Baseline established: $(date)" >> build-baseline.log
```

### PHASE 2: Incremental TypeScript Hardening (3 hours)

#### Step 1 - Enable noUncheckedIndexedAccess (2 hours):
**Configuration Change**:
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

**Target Files Priority**:
1. /src/lib/tools/tool-registry.ts
2. /src/lib/memory/shared-memory.ts  
3. /src/tools/ (diagnostic tools)

**Validation**: `npm run build` must succeed after each major file fix

#### Step 2 - Enable exactOptionalPropertyTypes (1.5 hours):
**Configuration Change**:
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

### PHASE 3: Status Process Update (30 minutes)
1. Update /sprint-management/backlog/domains/d-002-repository-structure/README.md
2. Apply status tracking template 
3. Document implementation vs specification status

## DEVELOPER DELIVERABLES

Create these artifacts for TESTER role handoff:

### Artifact 1: Implementation Summary
```bash
echo "# D-002 DEVELOPER COMPLETION REPORT
## Configuration Changes Applied:
- noUncheckedIndexedAccess: enabled
- exactOptionalPropertyTypes: enabled

## Files Modified:
$(git diff --name-only HEAD~1)

## Build Status:
$(npm run build 2>&1 | tail -5)

## Commit Hash: $(git rev-parse HEAD)
## Completion Time: $(date)
" > sprint-management/completion-logs/d-002-developer-completion.md
```

### Artifact 2: Testing Instructions
```bash
echo "# D-002 TESTING REQUIREMENTS

## TESTER ROLE VALIDATION NEEDED:

### Build Validation:
- [ ] npm run build completes without errors
- [ ] npm run build produces no TypeScript warnings  
- [ ] Build output size comparable to baseline

### Runtime Validation:
- [ ] Core diagnostic tools function correctly
- [ ] Memory system operations work
- [ ] Tool registry loads without errors
- [ ] No runtime type errors in console

### Regression Testing:
- [ ] All existing tests pass: npm test
- [ ] No functional regressions in core features
- [ ] Performance comparable to baseline

### Type Safety Validation:
- [ ] Array access properly guarded
- [ ] Optional properties correctly typed
- [ ] No workaround type assertions added

## Test Commands:
\`\`\`bash
npm run build
npm test  
npm run lint
\`\`\`

## Manual Testing Areas:
1. Diagnostic tools execution
2. Memory storage/retrieval operations
3. Tool parameter validation

## Success Criteria:
All checkboxes above must pass for TESTER approval.
" > sprint-management/completion-logs/d-002-testing-requirements.md
```

### Artifact 3: Process Status Update
Update D-002 README.md with implementation status using the status tracking template.

## DEVELOPER SUCCESS CRITERIA:
- [ ] TypeScript builds with both stricter settings enabled
- [ ] Zero compilation errors or warnings
- [ ] All target files updated with proper patterns
- [ ] Status tracking process documented
- [ ] Testing artifacts created for TESTER role
- [ ] Work committed with descriptive messages

## COMMIT STRATEGY:
```bash
git add .
git commit -m "feat: D-002 TypeScript hardening - DEVELOPER phase complete

- Enable noUncheckedIndexedAccess and exactOptionalPropertyTypes
- Fix array access and optional property patterns
- Update status tracking process
- Create testing artifacts for validation

Process v3.1: DEVELOPER → TESTER handoff ready"
```

## HANDOFF TO TESTER:
Upon DEVELOPER completion, TESTER role should validate all artifacts and run comprehensive testing before REVIEWER assessment.

Begin with Phase 1 assessment - establish TypeScript configuration baseline.
