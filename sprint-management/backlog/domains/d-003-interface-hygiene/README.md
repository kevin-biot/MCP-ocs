# D-003: Interface Hygiene & Structural Typing

**Status**: Complete  
**Priority**: P1 - HIGH  
**Review Date**: 2025-08-30  
**Tasks Created**: 5  

---

## Executive Summary

The MCP-ocs codebase has structural typing issues where unrelated domain concepts are assignable to each other due to similar interface shapes. Missing branded types for critical entities like IDs, timestamps, and domain objects creates type safety risks.

### Key Issues
- **Structural type collisions** between domain entities
- **Missing branded types** for IDs, timestamps, and money values
- **Unsafe any/as assertions** in type boundaries
- **Interface pollution** with overlapping structures

---

## Epic Breakdown

### EPIC-007: Interface Hygiene
**Priority**: P1 - HIGH | **Estimated**: 12 hours

#### Tasks:
- **TASK-007-A**: Add branded types for SessionId, ToolDefinition, and TimestampBrand (3h)
- **TASK-007-B**: Fix structural typing collisions in memory interfaces (3h)
- **TASK-007-C**: Audit and eliminate unsafe any/as assertions (3h)
- **TASK-007-D**: Implement interface segregation for tool types (2h)
- **TASK-007-E**: Add branded type validation at boundaries (1h)

---

## Implementation Pattern

### Branded Type Pattern
```typescript
type SessionIdBrand = string & { __brand: 'SessionId' };
type TimestampBrand = number & { __brand: 'Timestamp' };
type ToolDefinitionBrand = string & { __brand: 'ToolDefinition' };

export interface ConversationMemory {
  sessionId: SessionIdBrand;
  timestamp: TimestampBrand;
  // ... other fields
}
```

---

## Files Requiring Changes
- `/src/lib/tools/tool-registry.ts`
- `/src/lib/memory/shared-memory.ts`
- `/src/lib/workflow/workflow-engine.ts`
- `/src/lib/tools/sequential-thinking-types.ts`
