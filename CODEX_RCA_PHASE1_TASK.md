Read CODEX_GIT_STRATEGY_MANDATORY.md and follow git workflow. Start on develop branch.

TASK: RCA Tool Reliability Fixes - Phase 1 (Focused Scope)

## CRITICAL REMINDERS
- ✅ ALWAYS start: `cd /Users/kevinbrown/MCP-ocs && git checkout develop && git status`
- ✅ Work on develop branch ONLY (protect beta users)
- ✅ Commit locally but DO NOT PUSH without approval
- ✅ Test changes against real cluster scenarios

## PHASE 1 OBJECTIVES (High Impact, Achievable)

### FIX #1: Resource Parsing Enhancement
**File**: `src/tools/diagnostics/rca-checklist-engine.ts` (likely location)
**Problem**: parseResourceValue method incorrectly handles Kubernetes resource units
**Current Issues**:
- CPU millicores ("200m", "500m", "1000m") not parsed correctly
- Memory units (Ki, Mi, Gi, Ti) incomplete conversion
- Affects quota and resource constraint analysis accuracy

**Implementation Tasks**:
- [ ] Locate current parseResourceValue method
- [ ] Add comprehensive CPU millicore handling (1000m = 1 CPU)
- [ ] Add complete memory unit conversion (1024Ki = 1Mi, 1024Mi = 1Gi, etc.)
- [ ] Handle edge cases: "0", empty strings, invalid formats
- [ ] Add unit tests for resource parsing logic
- [ ] Test against real Kubernetes resource formats

**Success Criteria**:
- Correctly parse "200m" as 0.2 CPU cores
- Correctly parse "512Mi" as 536,870,912 bytes
- Handle all standard Kubernetes resource unit formats
- Return consistent numeric values for calculations

### FIX #2: Network Endpoint Validation
**File**: Same RCA engine file
**Problem**: Network analysis only counts services/routes but doesn't validate actual connectivity
**Current Issues**:
- Counts services but doesn't check if they have active endpoints
- Reports "X services available" even if services have no backend pods
- Misses critical service connectivity problems

**Implementation Tasks**:
- [ ] Add `oc get endpoints -n <namespace> -o json` call to network analysis
- [ ] Parse endpoints JSON to check for active backend addresses
- [ ] Cross-reference services with their endpoints
- [ ] Flag services without endpoints as "service connectivity issues"
- [ ] Update network analysis output to include endpoint status
- [ ] Test against namespace with broken services (no endpoints)

**Success Criteria**:
- Network analysis includes endpoint availability
- Reports services without endpoints as issues
- Provides more accurate service connectivity assessment
- Maintains existing service/route counting functionality

## TESTING REQUIREMENTS

### Unit Testing
- [ ] Add resource parsing unit tests
- [ ] Test CPU millicore conversion accuracy
- [ ] Test memory unit conversion accuracy
- [ ] Test edge cases and error handling

### Real Cluster Testing
- [ ] Test against namespace with resource constraints
- [ ] Test against namespace with broken services
- [ ] Verify endpoint validation catches real issues
- [ ] Ensure no regression in existing RCA functionality

### Performance Testing
- [ ] Ensure additional endpoint queries don't significantly slow analysis
- [ ] Test against large namespaces (20+ services)
- [ ] Maintain acceptable response times

## IMPLEMENTATION APPROACH

### Step 1: Investigation
1. Locate RCA checklist engine source code
2. Find current parseResourceValue implementation
3. Identify network analysis section
4. Review current test coverage

### Step 2: Resource Parsing Fix
1. Implement comprehensive unit conversion
2. Add proper error handling
3. Create unit tests
4. Test against real cluster resources

### Step 3: Network Endpoint Fix
1. Add endpoint validation to network analysis
2. Update output format to include endpoint status
3. Test against broken services
4. Verify no performance regression

### Step 4: Integration Testing
1. Run full RCA checklist against test namespace
2. Verify improved accuracy in resource and network analysis
3. Ensure backward compatibility
4. Test memory integration still works

## DELIVERABLES

- [ ] Enhanced parseResourceValue method with full Kubernetes unit support
- [ ] Network analysis with endpoint validation
- [ ] Unit tests for resource parsing logic
- [ ] Integration test against real cluster
- [ ] Commit message documenting improvements
- [ ] Performance impact assessment

## SUCCESS METRICS

- ✅ Resource parsing handles all Kubernetes unit formats correctly
- ✅ Network analysis includes endpoint availability validation
- ✅ No regression in existing RCA checklist functionality
- ✅ Performance remains acceptable (<2s for namespace analysis)
- ✅ Ready for Phase 2 architectural improvements

## WHAT NOT TO DO (Phase 2 Scope)
- ❌ Don't fix memory integration (SharedMemoryManager issue)
- ❌ Don't change tool registration architecture
- ❌ Don't add advanced event pattern recognition
- ❌ Don't implement retry logic (save for Phase 2)

Focus only on resource parsing and endpoint validation for maximum impact with minimal risk.

## NEXT PHASE PREVIEW
After successful completion, Phase 2 will address:
- Memory integration fixes (ToolMemoryGateway)
- Architecture simplification
- Advanced event pattern recognition
- Comprehensive retry logic

CODEX: Execute Phase 1 fixes with laser focus on resource parsing and endpoint validation.