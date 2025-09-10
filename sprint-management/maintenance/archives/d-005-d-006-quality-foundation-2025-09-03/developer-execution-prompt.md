# CODEX CLI EXECUTION PROMPT - D-005 + D-006 Quality Foundation Sprint

**EXECUTION AUTHORITY**: DEVELOPER Role - Process v3.2 Enhanced Framework  
**SPRINT ID**: d-005-d-006-quality-foundation-2025-09-03  
**COMPLEXITY TIER**: TIER 2 (6-8 SP, Full Framework Depth)  
**ESTIMATED DURATION**: 6-8 hours systematic implementation  

## COPY-PASTE PROMPT FOR CODEX CLI:

```
You are the DEVELOPER role in Process v3.2 Enhanced Framework executing a TIER 2 extended sprint:

SPRINT SCOPE: D-005 Async Correctness (P0 CRITICAL) + D-006 Error Taxonomy (P1 HIGH)

MISSION: Implement systematic async correctness and error taxonomy standardization across MCP-ocs codebase to establish critical quality foundation.

REPOSITORY CONTEXT: 
- Location: /Users/kevinbrown/MCP-ocs
- Process: v3.2 Enhanced Framework TIER 2
- Quality Standard: Zero technical debt with comprehensive validation
- Token Budget: 280K execution allocation (70% of 400K total)

PRIMARY OBJECTIVES:

D-005 ASYNC CORRECTNESS (P0 CRITICAL - 4 SP):
1. Fix unawaited promises in tool execution handlers (/src/index.ts, tool registry)
2. Add timeout handling with AbortSignal for all I/O operations
3. Fix race conditions in memory operations (/src/lib/memory/shared-memory.ts)
4. Replace Promise.all with appropriate Promise.allSettled patterns
5. Add proper error propagation in async handlers with context preservation

D-006 ERROR TAXONOMY (P1 HIGH - 3 SP):  
1. Create canonical error classes (ValidationError, ToolExecutionError, MemoryError)
2. Replace all throw strings with structured error classes throughout codebase
3. Implement consistent HTTP status code mapping (400, 404, 408, 500, 503)
4. Add error context preservation through async chains
5. Standardize error response format across all endpoints

IMPLEMENTATION REQUIREMENTS:
- Systematic async pattern corrections preventing memory leaks and crashes
- Comprehensive error class hierarchy with proper inheritance
- Timeout patterns with configurable AbortSignal support  
- Race condition elimination in shared memory operations
- HTTP status code consistency for operational reliability

SUCCESS CRITERIA:
- Zero unawaited promises in critical execution paths
- All I/O operations have appropriate timeout handling  
- Race conditions eliminated in shared memory operations
- Structured error classes replace all ad-hoc throw strings
- Consistent HTTP status code mapping implemented
- Error context preserved through all async operations

PROCESS ADHERENCE:
- Apply TIER 2 implementation depth with systematic code changes
- Maintain comprehensive testing validation throughout
- Document all changes with clear rationale
- Preserve existing functionality while improving reliability
- Follow systematic file modification patterns

COMPLETION SIGNAL: Respond with "DEVELOPER PHASE COMPLETE - READY FOR TESTER HANDOFF" when all objectives achieved with validation evidence.
```

## HANDOFF CHECKLIST FOR CODEX CLI:
- [ ] Repository location confirmed: /Users/kevinbrown/MCP-ocs
- [ ] Process v3.2 TIER 2 framework understood
- [ ] D-005 + D-006 scope clearly defined
- [ ] Success criteria comprehension confirmed
- [ ] Token budget allocation acknowledged
- [ ] Quality standard (zero technical debt) accepted

EXECUTE THIS PROMPT IN CODEX CLI TO BEGIN DEVELOPER PHASE.
