# CODEX CLI PROMPT: D-002 TypeScript Configuration Hardening

## SPRINT CONTEXT
**Current Branch**: feature/deterministic-template-engine  
**Sprint File**: `/Users/kevinbrown/MCP-ocs/sprint-management/active-tasks/d-002-typescript-hardening-sprint.md`  
**Process**: v3.1 Enhanced Framework with zero technical debt acceptance  
**Duration**: 4-hour intensive sprint session  

## TASK SUMMARY
Implement stricter TypeScript configuration (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) and establish status tracking process for quality domains.

## IMPLEMENTATION PRIORITY

### PHASE 1: Current State Assessment (15 minutes)
1. **Review current TypeScript configuration**:
   ```bash
   cat tsconfig.json
   npm run build 2>&1 | tee build-baseline.log
   ```
2. **Establish error baseline** before making changes
3. **Identify critical files** that will need modification

### PHASE 2: Incremental TypeScript Hardening (3 hours)

#### Step 1: Enable `noUncheckedIndexedAccess` (2 hours)
**Target Files**:
- `tsconfig.json` - Add `"noUncheckedIndexedAccess": true`
- `/src/lib/tools/tool-registry.ts` - Fix array access patterns
- `/src/lib/memory/shared-memory.ts` - Guard object property access
- `/src/tools/` - Fix diagnostic tool array operations

**Pattern to Apply**:
```typescript
// Replace: arr[index].property
// With: arr[index]?.property || defaultValue
// Replace: obj[key].method()
// With: obj[key]?.method?.() || fallback
```

#### Step 2: Enable `exactOptionalPropertyTypes` (1.5 hours)  
**Target Files**:
- `tsconfig.json` - Add `"exactOptionalPropertyTypes": true`
- `/src/lib/types/common.ts` - Fix optional property definitions
- Memory interfaces with optional properties
- Tool parameter interfaces

**Pattern to Apply**:
```typescript
// Replace: property?: T
// With: property?: T | undefined (where T can be undefined)
// Or: property: T (where T cannot be undefined)
```

### PHASE 3: Status Process Update (30 minutes)
1. **Update D-002 status** in `/sprint-management/backlog/domains/d-002-repository-structure/README.md`
2. **Create status template** for other domains
3. **Document process improvements**

## PROCESS v3.1 EXECUTION

### DEVELOPER Role Execution:
- Follow incremental implementation approach
- Test build after each configuration change
- Apply systematic error fixing patterns
- Document any deviations from planned approach

### VALIDATION REQUIREMENTS:
- `npm run build` succeeds without errors or warnings
- `npm test` passes all existing tests
- No runtime regressions in core functionality
- Type safety measurably improved

## SUCCESS CRITERIA CHECKLIST

### Technical Implementation:
- [ ] `noUncheckedIndexedAccess: true` enabled and errors resolved
- [ ] `exactOptionalPropertyTypes: true` enabled and conflicts resolved  
- [ ] Zero TypeScript compilation errors
- [ ] All existing tests pass
- [ ] Core diagnostic tools function correctly
- [ ] Memory system operations verified

### Process Improvement:
- [ ] D-002 README.md updated with implementation status
- [ ] Status tracking template created
- [ ] Process documentation completed
- [ ] Template ready for application to other domains

## ERROR HANDLING STRATEGY
1. **Enable one setting at a time** to isolate issues
2. **Fix errors systematically** by file/module priority
3. **Test incrementally** to catch regressions early  
4. **Document patterns** for similar fixes in other domains
5. **Rollback quickly** if major blocking issues discovered

## COMMIT STRATEGY
- Commit after each successful configuration change
- Include detailed commit messages with scope and impact
- Tag commits with process v3.1 validation status
- Final commit should reference sprint completion

## COMPLETION COMMAND
When sprint objectives achieved, update completion log:
```bash
echo "$(date): D-002 TypeScript hardening sprint completed successfully" >> sprint-management/completion-logs/d-002-completion.log
```

---

**READY FOR EXECUTION**: All files prepared, success criteria defined, process v3.1 framework activated.

**NEXT ACTION**: Begin Phase 1 assessment with current TypeScript configuration review.