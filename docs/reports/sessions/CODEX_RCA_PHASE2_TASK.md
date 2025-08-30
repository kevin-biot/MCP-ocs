### FIX #7: Intelligent Root Cause Analysis Enhancement
**Problem**: RCA tool provides symptom detection but not true root cause analysis
**Current Output**:
```json
{
  "status": "degraded",
  "findings": ["PVCs: 5/10 bound"],
  "recommendations": ["Check PVC status: oc get pvc"]
}
```

**Desired Output**:
```json
{
  "status": "degraded",
  "root_cause": "Storage class provisioner unreachable due to network policy restrictions",
  "findings": ["PVCs: 5/10 bound", "Storage class provisioner unreachable"],
  "evidence": ["Network policy blocking access to storage provisioner"],
  "recommendations": ["Add network policy exception for storage provisioner"]
}
```

**Implementation Tasks**:
- [ ] Add root cause correlation logic between symptoms
- [ ] Implement evidence collection and analysis
- [ ] Create intelligent recommendation engine based on evidence
- [ ] Add pattern matching for common root cause scenarios:
  - Storage provisioner issues → PVC problems
  - Network policies → service connectivity issues  
  - Resource constraints → pod scheduling failures
  - RBAC issues → permission-related failures
- [ ] Correlate events, resources, and configurations for true RCA
- [ ] Provide actionable, specific recommendations vs generic commands

**Success Criteria**:
- RCA tool identifies actual root causes, not just symptoms
- Evidence-based analysis with correlation between components
- Actionable recommendations based on specific problems identified
- Move from "Check PVC status" to "Fix storage provisioner network policy"

Read CODEX_GIT_STRATEGY_MANDATORY.md and follow git workflow. Continue on develop branch.

TASK: RCA Tool Reliability Fixes - Phase 2 (Architectural Improvements)

## CRITICAL REMINDERS
- ✅ Continue on develop branch (git status to confirm)
- ✅ Phase 1 COMPLETED: Resource parsing + endpoint validation ✅
- ✅ Commit locally but DO NOT PUSH until both phases complete
- ✅ Building on successful Phase 1 foundation

## PHASE 2 OBJECTIVES (Architectural Fixes + Intelligent Analysis)

### FIX #3: Memory Integration Modernization
**Problem**: RCA tool uses old SharedMemoryManager instead of new ToolMemoryGateway
**Current Issues**:
- Uses `this.memoryManager.storeOperational()` (OLD system)
- Should use `ToolMemoryGateway` (NEW system)  
- Breaks Chroma v2 storage integration
- Inconsistent with other working diagnostic tools

**Implementation Tasks**:
- [ ] Locate memory integration code in RCA engine
- [ ] Replace SharedMemoryManager imports with ToolMemoryGateway
- [ ] Update `storeOperational()` calls to use `memoryGateway.storeToolExecution()`
- [ ] Ensure proper adapter integration pattern (like cluster_health tool)
- [ ] Test memory storage works with ChromaDB and JSON fallback
- [ ] Verify RCA results are stored and searchable

**Success Criteria**:
- RCA tool uses same memory system as other diagnostic tools
- Incident storage works with ChromaDB v2 integration
- Results searchable via memory_search_operational
- Consistent memory architecture across all tools

### FIX #4: Architecture Simplification  
**Problem**: Complex initialization chain causes fragility (RCA engine → OcWrapperV2 → NamespaceHealthChecker)
**Current Issues**:
- More complex than other working diagnostic tools
- Complex tool suite vs simple tool pattern
- Multiple v2 dependencies that may have issues
- Harder to debug and maintain

**Implementation Tasks**:
- [ ] Review current RCA tool registration pattern
- [ ] Compare with successful diagnostic tools (cluster_health, namespace_health)
- [ ] Simplify initialization if possible without losing functionality
- [ ] Ensure consistent error handling patterns
- [ ] Reduce unnecessary complexity in tool registration
- [ ] Maintain all existing RCA functionality

**Success Criteria**:
- RCA tool follows same patterns as other successful diagnostic tools
- Reduced complexity without functionality loss
- Consistent error handling and timeout patterns
- Easier to debug and maintain

### FIX #5: Enhanced Event Pattern Recognition (Qwen Analysis)
**Problem**: Limited error pattern matching compared to comprehensive event analysis
**Current Issues**:
- Only recognizes specific error patterns
- Misses broader Kubernetes-specific error conditions
- Limited context-aware analysis capabilities

**Implementation Tasks**:
- [ ] Review current event pattern recognition logic
- [ ] Expand pattern library for common Kubernetes errors:
  - ImagePullBackOff, ErrImagePull
  - CrashLoopBackOff, OOMKilled
  - FailedScheduling, Evicted
  - NetworkPolicy, DNS resolution issues
  - Resource quota exceeded patterns
- [ ] Add context-aware analysis (correlate events with resource constraints)
- [ ] Improve event severity classification
- [ ] Test against real cluster with various error conditions

**Success Criteria**:
- Broader pattern recognition for Kubernetes errors
- Context-aware event analysis
- Better correlation between events and resource issues
- More accurate problem detection and classification

### FIX #6: Robust Timeout and Retry Handling (Qwen Analysis)
**Problem**: Basic timeout handling with no retry logic for transient failures
**Current Issues**:
- No exponential backoff for temporary cluster connectivity issues
- No proper resource cleanup on timeouts
- Can fail on transient network issues

**Implementation Tasks**:
- [ ] Implement exponential backoff retry logic for oc commands
- [ ] Add proper timeout management with cleanup
- [ ] Handle transient cluster connectivity issues gracefully
- [ ] Ensure consistent timeout patterns with other diagnostic tools
- [ ] Add circuit breaker pattern for repeated failures
- [ ] Test retry logic against simulated network issues

**Success Criteria**:
- Exponential backoff retry for transient failures
- Proper timeout management and resource cleanup
- Graceful handling of temporary cluster issues
- Consistent reliability patterns across diagnostic tools

## TESTING REQUIREMENTS

### Integration Testing
- [ ] Test memory integration with ChromaDB storage
- [ ] Verify RCA results searchable via memory tools
- [ ] Test against various cluster error conditions
- [ ] Ensure retry logic works with network simulations

### Regression Testing  
- [ ] Verify Phase 1 fixes still work (resource parsing, endpoints)
- [ ] Ensure all existing RCA functionality preserved
- [ ] Test against real cluster scenarios
- [ ] Performance impact assessment

### Architecture Validation
- [ ] Compare RCA tool patterns with successful diagnostic tools
- [ ] Verify consistent error handling across tools
- [ ] Test tool registration and execution reliability

## IMPLEMENTATION APPROACH

### Step 1: Memory Integration Fix
1. Update imports and memory calls
2. Test memory storage and retrieval
3. Verify ChromaDB integration

### Step 2: Architecture Review
1. Compare with successful diagnostic tools
2. Simplify initialization where possible
3. Ensure consistent patterns

### Step 3: Enhanced Pattern Recognition
1. Expand error pattern library
2. Add context-aware analysis
3. Test against real error scenarios

### Step 4: Retry Logic Implementation
1. Add exponential backoff for oc commands
2. Implement proper timeout management
3. Test retry mechanisms

### Step 5: Comprehensive Testing
1. Integration tests for all fixes
2. Regression testing for Phase 1
3. Real cluster validation
4. Performance assessment

## DELIVERABLES

- [ ] Modern memory integration using ToolMemoryGateway
- [ ] Simplified architecture following successful tool patterns
- [ ] Enhanced event pattern recognition library
- [ ] Robust retry and timeout handling
- [ ] Comprehensive test coverage for all fixes
- [ ] Performance and reliability assessment
- [ ] Documentation of architectural improvements

## SUCCESS METRICS - PHASE 2

- ✅ RCA tool uses consistent memory architecture with other tools
- ✅ Simplified initialization and error handling patterns
- ✅ Broader error pattern recognition for Kubernetes issues  
- ✅ Reliable retry logic for transient failures
- ✅ **Intelligent root cause analysis with evidence-based recommendations**
- ✅ **Move from symptom detection to true RCA capabilities**
- ✅ All Phase 1 improvements preserved and enhanced
- ✅ Ready for production-quality beta release

## INTEGRATION WITH PHASE 1

Phase 2 builds on Phase 1's success:
- **Phase 1**: Fixed resource parsing and endpoint validation ✅
- **Phase 2**: Architectural reliability and consistency
- **Combined Result**: Production-ready RCA tool matching quality of enhanced cluster_health

## FINAL OUTCOME

After Phase 2, the RCA tool will be:
- ✅ **Accurate**: Correct resource parsing and network validation (Phase 1)
- ✅ **Consistent**: Same patterns as other successful diagnostic tools (Phase 2)
- ✅ **Reliable**: Proper retry logic and timeout handling (Phase 2)
- ✅ **Integrated**: Modern memory system with ChromaDB support (Phase 2)
- ✅ **Comprehensive**: Enhanced error pattern recognition (Phase 2)

CODEX: Execute Phase 2 architectural improvements to complete the RCA tool transformation.