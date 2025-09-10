# FIX-001 Memory Crisis Implementation Plan

**Fix ID**: FIX-001  
**Implementation Method**: Codex CLI with Human Oversight  
**Total Estimated Time**: 6-8 hours  
**Date**: September 10, 2025  

## Implementation Overview

This document provides the detailed **6-phase implementation plan** for emergency consolidation of the MCP-OCS memory system architecture. Each phase is designed for independent deployment with validation checkpoints and rollback capabilities.

**Reference**: Based on Codex CLI comprehensive fact-finding analysis and technical design specifications.

## Pre-Implementation Setup

### Environment Validation
```bash
# Confirm current working state
cd /Users/kevinbrown/MCP-ocs
oc whoami
npm run build
tsx src/index-sequential.ts --version

# Baseline memory system test
SHARED_MEMORY_DIR=./memory/test CHROMA_HOST=localhost tsx src/index-sequential.ts
```

### Feature Flag Configuration
```bash
# Create environment template for safe rollback
cat > .env.fix-001 << EOF
# FIX-001 Emergency Consolidation Feature Flags
STRICT_STDIO_LOGS=false          # Phase 1: Protocol safety
UNIFIED_MEMORY=false             # Phase 3: Memory consolidation  
ENABLE_ORCH_CONTEXT=false        # Phase 6: AutoMemorySystem
MCP_LOG_VERBOSE=false            # Logging control
EOF
```

## Phase 0: Guardrails and Baseline (30-45 minutes)

### Objectives
- Establish baseline functionality validation
- Create rollback safety mechanisms
- Set up feature flag infrastructure

### Implementation Tasks

#### 1. Baseline Validation
```bash
# Test current sequential entry point stability
NAMESPACE=student03 tsx src/index-sequential.ts &
# Wait for startup, then test basic functionality
kill %1

# Test beta entry point as fallback
tsx src/index.beta.ts &
# Verify tool list and basic operation
kill %1
```

#### 2. Feature Flag Infrastructure
```typescript
// Add to src/lib/config/feature-flags.ts
export const FEATURE_FLAGS = {
  STRICT_STDIO_LOGS: process.env.STRICT_STDIO_LOGS === 'true',
  UNIFIED_MEMORY: process.env.UNIFIED_MEMORY === 'true', 
  ENABLE_ORCH_CONTEXT: process.env.ENABLE_ORCH_CONTEXT === 'true',
  MCP_LOG_VERBOSE: process.env.MCP_LOG_VERBOSE === 'true'
};
```

#### 3. Beta Entry Freeze
```bash
# Create backup of beta entry point
cp src/index.beta.ts src/index.beta.ts.backup
# Document: Beta entry remains unchanged during consolidation
```

### Validation Checkpoint
- [ ] Sequential entry starts successfully in JSON-only mode
- [ ] Beta entry functional with tool listing
- [ ] Feature flag infrastructure ready
- [ ] Baseline performance benchmarks captured

## Phase 1: Protocol Safety (60-90 minutes)

### Objectives
- Eliminate stdout logging during MCP server operation
- Remove Unicode emojis from logging output
- Ensure MCP JSON protocol compliance

### Implementation Tasks

#### 1. Memory Manager Logging Fix
```typescript
// src/lib/memory/chroma-memory-manager.ts
// BEFORE: protocol-unsafe logging
console.log("✓ initialized");
console.log("💾 Storing to ChromaDB"); 
console.log("🔍 Searching...");

// AFTER: protocol-safe logging
const log = (message: string) => {
  if (FEATURE_FLAGS.MCP_LOG_VERBOSE) {
    console.error(`[MCP-OCS Memory] ${message}`); // stderr only, no emojis
  }
};

log("Memory system initialized");
log("Storing conversation to ChromaDB");
log("Searching vector memories");
```

#### 2. Help Output Safety
```typescript
// src/index.ts - ensure help only prints before server start
if (args.includes('--help')) {
  console.log(helpText); // stdout OK before server starts
  process.exit(0);       // critical: exit before MCP server initialization
}
```

#### 3. Protocol Smoke Test
```bash
# Create protocol compliance test
cat > scripts/protocol-smoke-test.sh << 'EOF'
#!/bin/bash
# Start server in background and capture stdout
tsx src/index-sequential.ts > stdout.log 2> stderr.log &
SERVER_PID=$!
sleep 2

# Simulate basic MCP handshake and tool call
# Check that stdout.log is empty
if [ -s stdout.log ]; then
  echo "FAIL: stdout output detected during server operation"
  cat stdout.log
  kill $SERVER_PID
  exit 1
else
  echo "PASS: No stdout output during server operation"
fi

kill $SERVER_PID
rm stdout.log stderr.log
EOF

chmod +x scripts/protocol-smoke-test.sh
```

### Validation Checkpoint
- [ ] `./scripts/protocol-smoke-test.sh` passes
- [ ] Memory operations log to stderr only
- [ ] No Unicode emojis in server output
- [ ] Help flag still functional (pre-server)

## Phase 2: Remove MCP-files Dependency (90-120 minutes)

### Objectives
- Eliminate external `../../../MCP-files/src/memory-extension.ts` import
- Vendor internal ChromaMemoryManager implementation
- Ensure clean build without external dependencies

### Implementation Tasks

#### 1. Retarget MCPOcsMemoryAdapter
```typescript
// src/lib/memory/mcp-ocs-memory-adapter.ts
// BEFORE: external dependency
import { ChromaMemoryManager } from '../../../MCP-files/src/memory-extension';

// AFTER: internal dependency  
import { ChromaMemoryManager } from './mcp-files-memory-extension';
```

#### 2. Verify Internal ChromaMemoryManager
```typescript
// Confirm src/lib/memory/chroma-memory-manager.ts exists and exports
// ChromaMemoryManager with same interface as external version
export class ChromaMemoryManager {
  async storeConversation(/* ... */): Promise<void>
  async searchRelevantMemories(/* ... */): Promise<MemoryResult[]>
  isAvailable(): boolean
  // ... other required methods
}
```

#### 3. Clean Build Validation
```bash
# Remove any remaining MCP-files references
grep -r "MCP-files" src/ | grep -v node_modules || echo "Clean"

# Test build without external dependencies
npm run build
# Should complete successfully without external import errors
```

### Validation Checkpoint
- [ ] No imports from `../../../MCP-files/` paths
- [ ] `npm run build` succeeds without external dependency errors
- [ ] Both memory adapters use internal ChromaMemoryManager
- [ ] E2E tests pass with internal implementation

## Phase 3: Unify Memory Backend (90-120 minutes)

### Objectives
- Collapse dual memory adapters into single UnifiedMemoryAdapter
- Ensure both SharedMemoryManager and ToolMemoryGateway use same backend
- Maintain API compatibility for existing tool code

### Implementation Tasks

#### 1. Create UnifiedMemoryAdapter
```typescript
// src/lib/memory/unified-memory-adapter.ts
export class UnifiedMemoryAdapter {
  private chromatManager: ChromaMemoryManager;
  
  constructor(config: MemoryConfig) {
    this.chromatManager = new ChromaMemoryManager(config);
  }
  
  // Unified interface for all memory operations
  async storeConversation(data: ConversationData): Promise<void>
  async storeOperational(data: OperationalData): Promise<void>  
  async storeToolExecution(data: ToolExecutionData): Promise<void>
  async searchRelevantMemories(query: string, options?: SearchOptions): Promise<MemoryResult[]>
  async getStats(): Promise<MemoryStats>
  isAvailable(): boolean
}
```

#### 2. Update SharedMemoryManager
```typescript
// src/lib/memory/shared-memory.ts
// BEFORE: uses MCPFilesChromaAdapter
import { MCPFilesChromaAdapter } from './mcp-files-adapter';

// AFTER: uses UnifiedMemoryAdapter (facade pattern)
import { UnifiedMemoryAdapter } from './unified-memory-adapter';

export class SharedMemoryManager {
  private adapter: UnifiedMemoryAdapter; // unified backend
  
  // Keep existing public API unchanged for tool compatibility
  async storeConversation(/* ... */): Promise<void> {
    return this.adapter.storeConversation(/* ... */);
  }
  // ... other methods unchanged
}
```

#### 3. Update ToolMemoryGateway
```typescript
// src/lib/tools/tool-memory-gateway.ts
// BEFORE: uses MCPOcsMemoryAdapter
import { MCPOcsMemoryAdapter } from '../memory/mcp-ocs-memory-adapter';

// AFTER: uses UnifiedMemoryAdapter
import { UnifiedMemoryAdapter } from '../memory/unified-memory-adapter';

export class ToolMemoryGateway {
  private adapter: UnifiedMemoryAdapter; // same backend as SharedMemoryManager
  
  // Keep existing API for tool compatibility
  async storeToolExecution(/* ... */): Promise<void> {
    return this.adapter.storeToolExecution(/* ... */);
  }
}
```

#### 4. Schema Alignment
```typescript
// Ensure consistent tagging across all write paths
const unifiedTags = [
  `domain:${domain}`,
  `environment:${env}`,
  `tool:${toolName}`,
  `suite:${suiteName}`,
  `kind:${conversation|operational|tool_exec}`,
  `severity:${level}`,     // optional
  `resource:${type}`       // optional
];
```

### Validation Checkpoint
- [ ] Both SharedMemoryManager and ToolMemoryGateway use UnifiedMemoryAdapter
- [ ] Memory writes produce consistent tags/metadata
- [ ] All existing tool APIs remain functional
- [ ] Memory integration tests pass

## Phase 4: Import Resolution Hardening (45-60 minutes)

### Objectives
- Fix TypeScript path alias resolution issues
- Ensure consistent behavior across development and production
- Choose between relative imports or tsconfig-paths resolution

### Implementation Tasks

#### 1. Audit Path Alias Usage
```bash
# Find all @/ imports in library modules
grep -r "@/" src/lib/ | grep -v node_modules
# Expected: src/lib/memory/shared-memory.ts, src/lib/type-guards/index.ts
```

#### 2. Choose Resolution Strategy
**Option A: Replace with Relative Imports**
```typescript
// src/lib/memory/shared-memory.ts
// BEFORE: @/ alias
import { SomeType } from '@/lib/types';

// AFTER: relative import
import { SomeType } from '../types';
```

**Option B: Add tsconfig-paths Runtime Resolution**
```typescript
// src/index-sequential.ts (at top)
import 'tsconfig-paths/register';
// Enables @/ resolution at runtime
```

#### 3. Validation
```bash
# Test both development and "production-like" execution
npm run build && node dist/src/index-sequential.js --version
tsx src/index-sequential.ts --version
# Both should work identically
```

### Validation Checkpoint
- [ ] No path alias resolution failures at runtime
- [ ] Consistent behavior between tsx and compiled execution
- [ ] All imports resolve correctly in both modes

## Phase 5: Validation & E2E Testing (60-90 minutes)

### Objectives
- Comprehensive regression testing of consolidated system
- Performance validation of unified memory backend
- E2E script validation with real cluster interaction

### Implementation Tasks

#### 1. Memory Integration Testing
```bash
# Test JSON-only mode (Chroma unavailable)
MCP_OCS_FORCE_JSON=true npm test -- --testPathPattern=memory-integration

# Test Chroma-enabled mode (if available)
CHROMA_HOST=localhost CHROMA_PORT=8000 npm test -- --testPathPattern=memory-integration
```

#### 2. E2E Regression Testing
```bash
# Run existing CRC validation with consolidated system
NAMESPACE=student03 tsx src/index-sequential.ts &
SERVER_PID=$!
sleep 5

# Execute E2E test scenarios
npx tsx tests/integration/oc-triage-crc-validation.ts

kill $SERVER_PID
```

#### 3. Performance Validation
```bash
# Memory operation latency testing
npm run test:memory-performance
# Expected: Store <1000ms, Search <400ms, Context retrieval <400ms
```

#### 4. Protocol Compliance Final Check
```bash
# Final protocol smoke test with all changes
./scripts/protocol-smoke-test.sh
# Must pass: zero stdout during server operation
```

### Validation Checkpoint
- [ ] All memory integration tests pass
- [ ] E2E scripts complete successfully
- [ ] Performance within established budgets
- [ ] Protocol compliance verified

## Phase 6: Optional AutoMemorySystem Implementation (60-90 minutes)

### Objectives
- Replace AutoMemorySystem no-op with functional context retrieval
- Implement tool-specific context queries with performance guards
- Enable orchestration context enhancement (behind feature flag)

### Implementation Tasks

#### 1. Implement AutoMemorySystem
```typescript
// src/lib/memory/auto-memory-system.ts
export class AutoMemorySystem {
  private adapter: UnifiedMemoryAdapter;
  
  async retrieveRelevantContext(
    toolName: string,
    args: Record<string, any>,
    sessionId: string
  ): Promise<ContextSummary[]> {
    if (!FEATURE_FLAGS.ENABLE_ORCH_CONTEXT) {
      return []; // maintain no-op behavior when disabled
    }
    
    // Tool-specific context query with timeout
    const query = `${toolName} ${Object.values(args).join(' ')}`;
    const results = await Promise.race([
      this.adapter.searchRelevantMemories(query, { topK: 3 }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Context timeout')), 400)
      )
    ]);
    
    return this.summarizeResults(results);
  }
  
  private summarizeResults(results: MemoryResult[]): ContextSummary[] {
    // Convert to 1.5KB summary budget, redact PII
    return results.slice(0, 3).map(r => ({
      summary: r.metadata.summary || 'Context available',
      relevance: r.score,
      timestamp: r.metadata.timestamp
    }));
  }
}
```

#### 2. Update Entry Points
```typescript
// src/index-sequential.ts
// Enable context retrieval in orchestration
const context = await autoMemory.retrieveRelevantContext(toolName, args, sessionId);
if (context.length > 0) {
  console.error(`[MCP-OCS] Found ${context.length} relevant experiences`);
}
```

#### 3. Performance Guards
```typescript
// Environment configuration
ENABLE_ORCH_CONTEXT=false    # Default disabled for safety
CONTEXT_TIMEOUT_MS=400       # Hard timeout
CONTEXT_TOPK=3               # Result limit
CONTEXT_SUMMARY_BYTES=1500   # Summary size limit
```

### Validation Checkpoint
- [ ] AutoMemorySystem context retrieval functional when enabled
- [ ] Performance within 400ms timeout budget
- [ ] Graceful degradation on timeout/failure
- [ ] Feature flag properly gates functionality

## Final Integration Testing

### Complete System Validation
```bash
# Full stack test with all consolidation changes
STRICT_STDIO_LOGS=true UNIFIED_MEMORY=true tsx src/index-sequential.ts &
SERVER_PID=$!

# Protocol compliance
./scripts/protocol-smoke-test.sh

# Memory operations
npm test -- --testPathPattern=memory

# E2E functionality
NAMESPACE=student03 npx tsx tests/integration/oc-triage-crc-validation.ts

kill $SERVER_PID
```

### Production Readiness Checklist
- [ ] All 6 phases completed successfully
- [ ] Zero stdout output during server operation
- [ ] No external MCP-files dependencies
- [ ] Unified memory backend serving all tools
- [ ] E2E tests pass without regressions
- [ ] Beta entry point preserved as fallback
- [ ] Feature flags enable safe rollback

## Rollback Procedures

### Emergency Rollback (Immediate)
```bash
# Disable all feature flags
export STRICT_STDIO_LOGS=false
export UNIFIED_MEMORY=false  
export ENABLE_ORCH_CONTEXT=false

# Restart with original behavior
tsx src/index-sequential.ts
```

### Beta Fallback (If Main Fails)
```bash
# Switch to beta entry point
tsx src/index.beta.ts
# Provides filtered tool subset with original architecture
```

### Git Rollback (If Code Issues)
```bash
# Create rollback commit reverting all changes
git revert <consolidation-commit-range>
# Restore exact previous working state
```

---

**Implementation Status**: Ready for Execution  
**Estimated Total Time**: 6-8 hours across 6 phases  
**Risk Level**: Medium (controlled phased approach with feature flags)  
**Authority**: REVIEWER approval required for production deployment
