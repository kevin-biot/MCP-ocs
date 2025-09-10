# D-005: Async Correctness

**Status**: Complete  
**Priority**: P0 - CRITICAL  
**Review Date**: 2025-08-30  
**Tasks Created**: 6  

---

## Executive Summary

The MCP-ocs system contains critical async correctness issues including unawaited promises, missing return statements in async handlers, race conditions, and lack of timeout/AbortSignal handling. These issues can cause memory leaks, unhandled promise rejections, and system instability.

### Key Findings
- **Unawaited promises** in tool execution handlers
- **Missing timeout handling** for long-running operations
- **Race conditions** in memory operations and session state
- **Promise.all vs Promise.allSettled** misuse
- **No AbortSignal** support for cancellable operations

### Risk Assessment
**CRITICAL**: System vulnerable to memory leaks, crashes from unhandled rejections, and race condition data corruption.

---

## Issue Categories by File

### src/index.ts
**Risk**: P0 - Critical
- Unawaited promises in tool execution handlers
- Missing returns in async handlers
- No timeout handling for long-running operations

### src/lib/memory/shared-memory.ts
**Risk**: P1 - High  
- Race conditions in ChromaDB operations
- Missing proper error handling for concurrent operations

### src/lib/tools/sequential-thinking-with-memory.ts
**Risk**: P1 - High
- Promise.all vs Promise.allSettled misuse
- Missing AbortSignal for long-running operations

### src/lib/workflow/workflow-engine.ts
**Risk**: P2 - Medium
- Race conditions in session state updates
- Missing async handling in state transitions

---

## Epic Breakdown

### EPIC-005: Async Infrastructure Fixes
**Priority**: P0 - CRITICAL | **Estimated**: 18 hours | **Dependencies**: None

#### Tasks:
- **TASK-005-A**: Fix unawaited promises in main tool execution flow (4h)
- **TASK-005-B**: Add timeout handling with AbortSignal for all I/O operations (5h)
- **TASK-005-C**: Fix race conditions in memory operations (4h)
- **TASK-005-D**: Replace Promise.all with appropriate Promise.allSettled (3h)
- **TASK-005-E**: Add proper error propagation in async handlers (2h)

### EPIC-006: Async Testing & Monitoring  
**Priority**: P1 - HIGH | **Estimated**: 8 hours | **Dependencies**: EPIC-005

#### Tasks:
- **TASK-006-A**: Add async correctness tests with timeout scenarios (5h)

---

## Implementation Patterns

### Timeout Pattern with AbortSignal
```typescript
// Add timeout handling for long-running tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tool execution timeout')), 30000);
    });
    
    const resultPromise = toolRegistry.executeTool(name, args);
    const result = await Promise.race([resultPromise, timeoutPromise]);
    
    return { content: [{ type: 'text', text: result }] };
  } catch (error) {
    console.error(`Tool execution failed: ${error}`);
    throw error; // Proper error propagation
  }
});
```

### Race Condition Fix Pattern
```typescript
// Fix race conditions in memory operations
async storeConversation(memory: ConversationMemory): Promise<string> {
  // Properly await all async operations
  const jsonId = await this.jsonStorage.storeConversation(memory);
  
  if (this.chromaClient.isChromaAvailable()) {
    try {
      // Properly await ChromaDB operations
      await this.chromaClient.addDocuments('conversations', [document]);
    } catch (error) {
      console.error('ChromaDB storage failed:', error);
      throw new MemoryError('ChromaDB storage failed', 'store_conversation');
    }
  }
  
  return jsonId;
}
```

### Promise.all vs Promise.allSettled Pattern
```typescript
// Use Promise.all when all operations must succeed
try {
  const stepResults = await Promise.all(executionPromises);
  return { success: true, results: stepResults };
} catch (error) {
  return { success: false, error: error };
}

// Use Promise.allSettled when partial success is acceptable
const results = await Promise.allSettled(executionPromises);
const successes = results.filter(r => r.status === 'fulfilled');
const failures = results.filter(r => r.status === 'rejected');
```

---

## Testing Strategy

### Async Correctness Tests Required
- Timeout scenarios with long-running operations
- Race condition simulation with concurrent operations
- Promise rejection handling verification
- AbortSignal cancellation testing

### Example Test Pattern
```typescript
test('should handle tool execution timeout gracefully', async () => {
  const slowTool = jest.fn().mockImplementation(() => 
    new Promise(resolve => setTimeout(resolve, 35000)) // Exceeds 30s timeout
  );
  
  await expect(executeToolWithTimeout(slowTool, {}))
    .rejects.toThrow('Tool execution timeout');
});

test('should prevent race conditions in memory storage', async () => {
  const memory = createTestMemory();
  
  // Execute concurrent operations
  const promises = Array.from({length: 10}, () => 
    memoryManager.storeConversation(memory)
  );
  
  const results = await Promise.allSettled(promises);
  const uniqueIds = new Set(results.map(r => r.status === 'fulfilled' ? r.value : null));
  
  // Should have consistent results, no race condition corruption
  expect(uniqueIds.size).toBe(1); // All should return same ID
});
```

---

## Files Requiring Changes

### Critical Files
- `/src/index.ts` - Main async handlers
- `/src/lib/memory/shared-memory.ts` - Memory race conditions
- `/src/lib/tools/sequential-thinking-with-memory.ts` - Promise handling
- `/src/lib/workflow/workflow-engine.ts` - Session state races

### Supporting Files
- All tool execution files with async operations
- Memory adapter and ChromaDB client files
- Error handling and logging utilities

---

## Success Criteria

### Phase 1 Completion
- [ ] Zero unawaited promises in critical paths
- [ ] All I/O operations have timeout handling
- [ ] Race conditions eliminated in shared state
- [ ] Proper Promise.all vs Promise.allSettled usage

### Validation Metrics
- **Memory Leaks**: Zero unresolved promises after 1 hour operation
- **Error Handling**: 100% async operations have proper error propagation
- **Timeouts**: All I/O operations complete within defined limits
- **Race Conditions**: Concurrent operations produce consistent results

---

**Domain Owner**: Backend Architecture Team  
**Implementation Lead**: Codex (guided by patterns)  
**Review Required**: Performance testing after completion
