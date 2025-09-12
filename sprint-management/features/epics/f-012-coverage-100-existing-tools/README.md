# f-012: 100% Coverage Sprint (Existing Tools)

## Overview

**Type**: Epic  
**Priority**: P2 - High  
**Complexity**: Medium  
**Sprint Target**: 2-3 hours  
**GitHub Issue**: [#39 - B-012: 100% coverage sprint (existing tools + middleware)](https://github.com/kevin-biot/MCP-ocs/issues/39)

## Summary

Achieve near-100% test coverage for existing tool surfaces and new middleware/collections code introduced in f-011, with focus on safety and deterministic behavior across the complete diagnostic tool ecosystem.

## Dependencies

**Prerequisites**:
- ✅ **f-011-vector-collections-v2**: Instrumentation middleware foundation complete
- ✅ **Operational Validation**: Proven patterns with 4-tool pilot coverage
- ✅ **Safety Standards**: MCP protocol + D-009 compliance established
 - ✅ **Vector Patterns v2**: Baseline spec and helpers available (docs/architecture/vector-patterns.v2.md; tag enforcer + dedup utils)

**Downstream Impact**:
- Enables confident production deployment across all diagnostic tools
- Foundation for incident lifecycle tooling (f-013 candidate)
- Complete operational intelligence platform readiness

## Technical Scope

### 1. Middleware & Writers Coverage
**Target Files**:
- `src/lib/tools/instrumentation-middleware.ts`
- `src/lib/tools/metrics-writer.ts`
- `src/lib/tools/vector-writer.ts`
- `src/lib/tools/evidence-anchors.ts`

**Coverage Requirements**:
- Pre/post/error hooks (metrics records on ok/error paths)
- Vector writer best-effort behavior with JSON fallback
- Pre-search bounds validation (topK=3, timeout=400ms)
- Redaction and safety constraint testing

### 2. Collections & Stats Coverage
**Target Files**:
- `src/lib/memory/unified-memory-adapter.ts`
- `src/tools/state-mgmt/index.ts`
- `src/cli/memory-audit.ts`

**Coverage Requirements**:
- UnifiedMemoryAdapter.initialize eager collection ensure
- memory_get_stats(detailed) identifiers and content validation
- Collections audit CLI outputs (strategy/expected/present/missing/isolation)
- Both unified and separate collection strategy testing

### 3. Diagnostic Tools Coverage
**Target Tools**:
- `oc_diagnostic_cluster_health`
- `oc_diagnostic_namespace_health` (sample namespaces)
- `oc_diagnostic_rca_checklist`
- `oc_diagnostic_pod_health` (basic path)

**Coverage Requirements**:
- Instrumentation integration across all diagnostic tools
- Error path validation and graceful degradation
- Performance bounds compliance testing

### 4. Read Operations Coverage
**Target Tools**:
- `oc_read_get_pods` (single & multi-namespace paths)
- `oc_read_logs`
- `oc_read_describe`

**Coverage Requirements**:
- Sanity testing and error path validation
- Evidence anchor collection verification
- Performance impact assessment

## Acceptance Criteria

### Primary Success Criteria
- [ ] **95-100% coverage** in all target middleware and collections files
- [ ] **Safety validation** - no stdout violations, D-009 compliance in all new paths
- [ ] **Error path coverage** - both success and error scenarios tested
- [ ] **Performance bounds** - pre-search boundedness validated with timeout testing
- [ ] **Integration testing** - unified/separate strategies tested with environment toggle

### Quality Gates
- [ ] All tests pass with no compilation errors
- [ ] Mock strategies for Chroma endpoints when not available
- [ ] Environment-driven test harness for collection strategy toggle
- [ ] No network dependencies beyond localhost Chroma

### Evidence Requirements
- [ ] Test coverage reports showing 95%+ for target files
- [ ] Performance validation data within established bounds
- [ ] Safety constraint verification (stdout, D-009, async patterns)
- [ ] Integration test results for all diagnostic and read-ops tools

## Implementation Strategy

### Phase 1: Middleware Coverage (60-90 min)
- Unit tests for instrumentation, metrics, vector writers
- Error path and boundary condition testing
- Safety constraint validation (MCP protocol + D-009)

### Phase 2: Collections Coverage (45-60 min)
- UnifiedMemoryAdapter initialization testing
- Stats and audit CLI validation
- Strategy toggle testing (unified vs separate)

### Phase 3: Tool Integration Coverage (45-75 min)
- Diagnostic tool instrumentation testing
- Read-ops integration validation
- End-to-end operational testing

## Risk Assessment

**Risk Level**: Low-Medium  
**Primary Risks**:
- Test environment complexity with Chroma integration
- Potential performance impact discovery with full tool coverage
- Maintenance overhead for comprehensive test suite

**Mitigation Strategy**:
- Mock Chroma endpoints for unit testing
- Performance monitoring with established baselines
- Focused testing on new instrumentation code vs existing tool logic

## Success Metrics

**Quantitative**:
- 95-100% test coverage in target files
- All diagnostic and read-ops tools instrumented
- Zero safety standard violations
- Performance bounds maintained across tool suite

**Qualitative**:
- Confidence in production deployment across all tools
- Comprehensive operational intelligence platform readiness
- Foundation established for incident lifecycle development

## Out of Scope

- **New incident lifecycle tools**: Tracked in separate epic (f-013 candidate)
- **Schema reindex tooling**: Separate backlog item for v1/v2 migration
- **New tool development**: Focus on existing diagnostic and read-ops tools only

## References

- **GitHub Issue**: #39 - B-012: 100% coverage sprint
- **Foundation Epic**: f-011-vector-collections-v2 (prerequisite)
- **Operational Evidence**: Analytics data from f-011 pilot validation
- **Safety Standards**: MCP protocol compliance + D-009 date-time standards

## Implementation Notes

**Testing Framework**:
- Jest unit tests for pure modules
- Light integration testing with mocked Chroma endpoints
- Environment-driven test harness for strategy validation

**Development Approach**:
- Leverage proven patterns from f-011 middleware implementation
- Focus on testing new instrumentation integration vs existing tool logic
- Maintain localhost-only testing to avoid network dependencies

---

**Created**: 2025-09-11  
**Sprint Target**: 2-3 hours  
**Complexity**: Medium (testing and integration focus)  
**Success Criteria**: Production-ready coverage across complete diagnostic tool ecosystem
