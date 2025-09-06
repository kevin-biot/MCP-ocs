# RFR-003: Coverage Expansion & System Consistency

**Status**: Ready for Implementation  
**Priority**: P0 - BLOCKING (After RFR-001/002 completion)  
**ADR Reference**: ADR-023 Rubric Framework Architecture Remediation  
**Review Date**: 2025-09-04  
**Tasks Created**: 7  

---

## Executive Summary

The MCP-ocs system currently has **only 21% rubric coverage** (3/14 tools) with core rubrics inconsistently applied. Before adding any new rubric types, we must achieve systematic coverage of existing core rubrics (triage, confidence, safety) across all current templates to establish a solid foundation.

### Key Findings
- **Low Coverage**: Only 21% of tools use rubric evaluation
- **Inconsistent Application**: Core rubrics not universally applied
- **Missing SLO Impact**: Critical `slo-impact.v1` rubric not implemented
- **Template Inconsistency**: Different templates use different rubric combinations
- **Audit Trail Gaps**: Incomplete rubric evaluation across system

### Impact Without Coverage Expansion
**CRITICAL**: Inconsistent decision-making across templates, incomplete audit trails, unreliable escalation patterns.

---

## Detailed Coverage Analysis

### Current Coverage State (Inadequate)
```yaml
Tools with Rubric Integration (3/14 - 21%):
  - oc_read_get_pods: Basic triage/confidence/safety
  - oc_read_describe: Partial rubric coverage
  - oc_read_logs: Minimal rubric integration

Tools Missing Rubric Integration (11/14 - 79%):
  - oc_diagnostic_cluster_health: No rubrics
  - oc_diagnostic_namespace_health: No rubrics  
  - oc_diagnostic_pod_health: No rubrics
  - memory_search_incidents: No rubrics
  - core_workflow_state: No rubrics
  - sequential_thinking: No rubrics
  # + 5 more tools
```

### Target Coverage State (Systematic)
```yaml
Universal Core Rubrics (ALL tools):
  - triage-priority.v1: P1/P2/P3 classification
  - evidence-confidence.v1: High/Medium/Low confidence
  - remediation-safety.v1: Automation safety gates
  - slo-impact.v1: Business impact assessment

Coverage Target: ≥80% of current tools (11+ of 14 tools)
```

---

## Epic Breakdown

### EPIC-001: SLO Impact Rubric Implementation
**Priority**: P0 - CRITICAL | **Estimated**: 14 hours | **Dependencies**: RFR-001/002

#### Tasks:
- **TASK-001-A**: Design `slo-impact.v1` rubric with CRITICAL/HIGH/MEDIUM/LOW classification (4h)
- **TASK-001-B**: Implement SLO impact mapping logic (ingress, API, storage, compute) (4h)
- **TASK-001-C**: Create SLO impact golden test scenarios (3h)
- **TASK-001-D**: Document SLO impact rubric with RDR (RDR-004) (3h)

### EPIC-002: Diagnostic Tools Rubric Integration
**Priority**: P0 - BLOCKING | **Estimated**: 18 hours | **Dependencies**: EPIC-001

#### Tasks:
- **TASK-002-A**: Add core rubrics to `oc_diagnostic_cluster_health` tool (4h)
- **TASK-002-B**: Add core rubrics to `oc_diagnostic_namespace_health` tool (4h)
- **TASK-002-C**: Add core rubrics to `oc_diagnostic_pod_health` tool (4h)
- **TASK-002-D**: Add core rubrics to `oc_diagnostic_rca_checklist` tool (6h)

### EPIC-003: Memory & Core Tools Rubric Integration  
**Priority**: P0 - BLOCKING | **Estimated**: 16 hours | **Dependencies**: EPIC-001

#### Tasks:
- **TASK-003-A**: Add rubrics to memory tools (search_incidents, store_operational) (6h)
- **TASK-003-B**: Add rubrics to core workflow tools (workflow_state, sequential_thinking) (6h)
- **TASK-003-C**: Add rubrics to remaining operational tools (4h)

### EPIC-004: Coverage Validation & Golden Tests
**Priority**: P0 - BLOCKING | **Estimated**: 12 hours | **Dependencies**: EPIC-002/003

#### Tasks:
- **TASK-004-A**: Create coverage metrics dashboard (≥80% target tracking) (4h)
- **TASK-004-B**: Generate golden snapshots for all newly covered tools (4h)
- **TASK-004-C**: Create consistency validation report (identical audit trail format) (4h)

---

## Implementation Patterns

### Universal Core Rubric Pattern
```typescript
// Standard pattern for ALL tools (consistent application)
async function evaluateToolRubrics(evidence: Evidence, toolName: string): Promise<RubricResultSet> {
  const registry = getRubricRegistry();
  
  // Core rubrics applied to EVERY tool
  const coreResults = await registry.evaluateSet([
    'triage-priority.v1',     // P1/P2/P3 classification
    'evidence-confidence.v1',  // High/Medium/Low confidence
    'remediation-safety.v1',   // Automation safety gates  
    'slo-impact.v1'           // Business impact assessment
  ], evidence);
  
  // Tool-specific rubrics (if any)
  const specificResults = await evaluateToolSpecificRubrics(toolName, evidence);
  
  return { ...coreResults, ...specificResults };
}
```

### SLO Impact Rubric Design
```typescript  
const SLO_IMPACT_V1: MappingRubric = {
  id: 'slo-impact.v1',
  kind: 'mapping',
  inputs: ['ingressPending', 'apiDegraded', 'storageFailing', 'nodeDown'],
  mapping: {
    'ingressPending==1 || apiDegraded==1': 'CRITICAL',
    'storageFailing==1 || nodeDown>=0.3': 'HIGH', 
    'affectedNamespaces>=2': 'MEDIUM',
    'otherwise': 'LOW'
  },
  output: {
    classification: 'CRITICAL|HIGH|MEDIUM|LOW',
    reasoning: 'Business impact assessment based on affected services'
  }
};
```

### Coverage Tracking
```typescript
interface CoverageMetrics {
  totalTools: number;
  rubricIntegratedTools: number;
  coveragePercentage: number;
  missingTools: string[];
  rubricUsage: {
    [rubricId: string]: {
      toolCount: number;
      tools: string[];
    };
  };
}

function calculateRubricCoverage(): CoverageMetrics {
  // Track which tools implement which rubrics
  // Target: ≥80% coverage for core rubrics
}
```

---

## Tool Integration Strategy

### Integration Priority Order
1. **Diagnostic Tools** (Critical operational value)
   - `oc_diagnostic_cluster_health`
   - `oc_diagnostic_namespace_health`  
   - `oc_diagnostic_pod_health`
   - `oc_diagnostic_rca_checklist`

2. **Memory Tools** (Operational intelligence)
   - `memory_search_incidents`
   - `memory_store_operational`
   - `memory_search_operational`

3. **Core Tools** (System consistency)
   - `core_workflow_state` 
   - `sequential_thinking`

### Tool Integration Pattern (Each Tool)
```typescript
// Before: No rubric evaluation
async function executeTool(params: ToolParams): Promise<ToolResult> {
  const result = await performToolOperation(params);
  return { data: result }; // No rubric evaluation
}

// After: Consistent rubric evaluation
async function executeTool(params: ToolParams): Promise<ToolResult> {
  const result = await performToolOperation(params);
  const evidence = extractEvidence(result, params);
  const rubrics = await evaluateToolRubrics(evidence, toolName);
  
  return { 
    data: result, 
    evidence,
    rubrics,
    auditTrail: generateAuditTrail(evidence, rubrics)
  };
}
```

---

## Files Requiring Changes

### New Files (SLO Impact Rubric)
- `/src/lib/rubrics/core/slo-impact.v1.ts` - SLO impact rubric implementation
- `/docs/rubrics/RDR-004-slo-impact-v1.md` - SLO impact design record
- `/tests/lib/rubrics/slo-impact.test.ts` - SLO impact rubric tests

### Modified Files (Tool Integration)
- `/src/tools/diagnostics/cluster-health.ts` - Add core rubrics  
- `/src/tools/diagnostics/namespace-health.ts` - Add core rubrics
- `/src/tools/diagnostics/pod-health.ts` - Add core rubrics
- `/src/tools/diagnostics/rca-checklist.ts` - Add core rubrics
- `/src/tools/memory/*.ts` - Add rubrics to memory tools
- `/src/tools/core/workflow-state.ts` - Add core rubrics
- `/src/tools/core/sequential-thinking.ts` - Add core rubrics

### Golden Test Updates
- `/docs/examples/golden-templates/` - New golden snapshots for all tools
- `/tests/golden-tests/` - Comprehensive golden test coverage

### Dashboard Files
- `/src/lib/metrics/coverage-dashboard.ts` - Coverage tracking and reporting
- `/docs/metrics/rubric-coverage-report.md` - Coverage validation documentation

---

## Success Criteria

### Phase 1: SLO Impact Implementation (Sprint 1)
- [ ] `slo-impact.v1` rubric designed and implemented
- [ ] SLO impact mapping covers all major failure scenarios  
- [ ] SLO impact rubric documented with RDR-004
- [ ] Golden test scenarios for SLO impact classification

### Phase 2: Diagnostic Tool Coverage (Sprint 2-3)
- [ ] 4+ diagnostic tools integrated with core rubrics
- [ ] Consistent rubric evaluation patterns across diagnostic tools
- [ ] Golden snapshots for all diagnostic tools
- [ ] Coverage metrics show diagnostic tool compliance

### Phase 3: Complete Coverage & Validation (Sprint 3-4)
- [ ] ≥80% tool coverage achieved (11+ of 14 tools)
- [ ] All core rubrics (triage/confidence/safety/slo) consistently applied
- [ ] Coverage dashboard shows real-time metrics
- [ ] Consistency validation report confirms identical audit trail format

### Validation Metrics
- **Coverage**: ≥80% of tools integrated with core rubrics
- **Consistency**: 100% of integrated tools use identical rubric patterns
- **Completeness**: All core rubrics applied to all covered tools
- **Stability**: Golden snapshots pass for all newly integrated tools

---

## Visible Progress Tracking

### Sprint 1 Deliverables (Stakeholder Visibility)
- **SLO Impact Demo**: Live demonstration of business impact classification
- **Coverage Dashboard**: Real-time progress toward ≥80% target
- **SLO Mapping Report**: Business impact scenarios properly classified

### Sprint 2-4 Deliverables
- **Tool Integration Progress**: Weekly progress reports on tool coverage
- **Consistency Metrics**: Audit trail format validation across tools
- **Coverage Achievement**: Final report showing ≥80% coverage completion

---

## Risk Mitigation

### Technical Risks
**Risk**: Tool integration introduces performance overhead  
**Mitigation**: Benchmark rubric evaluation overhead, optimize if >50ms per tool

**Risk**: Inconsistent rubric application across different tool types  
**Mitigation**: Standardized integration pattern, comprehensive testing

**Risk**: SLO impact rubric classification inaccuracy  
**Mitigation**: Validate SLO mappings against real incident scenarios

### Scope Risks
**Risk**: Coverage expansion scope creep beyond core rubrics  
**Mitigation**: Strict focus on 4 core rubrics only, defer advanced rubrics to future

**Risk**: Tool integration complexity varies significantly  
**Mitigation**: Start with simpler tools, develop patterns, apply to complex tools

---

## Dependencies and Blockers

### Prerequisites
- **RFR-001 Complete**: Registry infrastructure must exist  
- **RFR-002 Complete**: Versioning system needed for safe rubric deployment

### Blocking Items
- **New Rubric Development**: Cannot add diagnostic rubrics until coverage complete
- **Template Extensions**: Coverage gaps create inconsistent behavior

### Enables (After Completion)  
- **New Template Development**: Consistent rubric foundation for all new templates
- **Advanced Rubric Types**: Diagnostic and intelligence rubrics on solid foundation
- **Enterprise Deployment**: Complete audit trail coverage for compliance

---

## Post-Completion State

### System Transformation Achieved
- **Consistent Decision Making**: All tools use identical rubric evaluation  
- **Complete Audit Trails**: Every operation has triage/confidence/safety/slo assessment
- **Enterprise Ready**: Systematic rubric coverage meets compliance requirements
- **Framework Ready**: Clean foundation enables framework extraction

### Metrics Dashboard (Final State)
```yaml
Rubric Coverage Report:
  Total Tools: 14
  Rubric Integrated: 11+ (≥80%)
  
Core Rubric Usage:
  triage-priority.v1: 11/14 tools (79%)
  evidence-confidence.v1: 11/14 tools (79%)  
  remediation-safety.v1: 11/14 tools (79%)
  slo-impact.v1: 11/14 tools (79%)

Consistency Metrics:
  Identical Evaluation Pattern: 100%
  Standard Audit Trail Format: 100%
  Golden Snapshot Coverage: 100%
```

---

**Domain Owner**: Architecture Team  
**Implementation Lead**: DEVELOPER (guided by ADR-023)  
**Review Required**: REVIEWER approval of SLO impact design and coverage strategy  
**Sprint Allocation**: 2-3 sprints (estimated 60 hours total work)  
**Business Impact**: Establishes systematic rubric foundation enabling all future development
