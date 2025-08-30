# D-007: Module & tsconfig Hygiene

**Status**: Complete  
**Priority**: P2 - MEDIUM  
**Review Date**: 2025-08-30  
**Tasks Created**: 3  

---

## Executive Summary

Mixed ESM/CJS module patterns throughout the codebase create import inconsistencies and module resolution issues. TypeScript configuration needs alignment with actual module usage patterns.

### Key Issues
- **Mixed module styles**: ESM and CJS patterns coexisting
- **Module resolution mismatch**: tsconfig vs actual usage
- **Import inconsistencies**: Dynamic imports mixed with static imports

---

## Epic Breakdown

### EPIC-012: Module Consistency
**Priority**: P2 - MEDIUM | **Estimated**: 6 hours

#### Tasks:
- **TASK-012-A**: Standardize all imports to ESM patterns (3h)
- **TASK-012-B**: Update tsconfig for proper ESM module resolution (2h)
- **TASK-012-C**: Fix package.json module type declarations (1h)

---

## Pattern: ESM Standardization
```typescript
// Replace mixed patterns with consistent ESM
import { UnifiedToolRegistry } from './lib/tools/tool-registry.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "node16",
    "esModuleInterop": false
  }
}
```

---

## Files Requiring Changes
- All TypeScript files with import statements
- `tsconfig.json` - Module resolution settings
- `package.json` - Module type declarations
