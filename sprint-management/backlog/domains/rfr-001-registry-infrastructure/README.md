# RFR-001: Rubric Registry Infrastructure

**Status**: Ready for Implementation  
**Priority**: P0 - BLOCKING (All development frozen until completion)  
**ADR Reference**: ADR-023 Rubric Framework Architecture Remediation  
**Review Date**: 2025-09-04  
**Tasks Created**: 8  

---

## Executive Summary

The MCP-ocs system currently has **fragmented rubric integration** where each template implements custom rubric evaluation logic. This creates exponential complexity growth and prevents framework extraction. We need a centralized, minimal viable registry to establish consistent patterns across all templates.

### Key Findings
- **Ad-hoc rubric integration** across different templates  
- **21% rubric coverage** (3/14 tools) with inconsistent patterns
- **No common evaluation interface** leading to debugging nightmares
- **Framework extraction blocked** by coupling variance
- **Technical debt compounding** with each new template

### Impact Without Remediation
**CRITICAL**: Each new template becomes harder to integrate, framework extraction impossible, debugging exponentially complex.

---

## Detailed Architecture Analysis

### Current Fragmented State
```typescript
// Different evaluation patterns per template (PROBLEMATIC)
const rubrics = evaluateRubrics({
  triage: TRIAGE_PRIORITY_V1,
  confidence: EVIDENCE_CONFIDENCE_V1, 
  safety: REMEDIATION_SAFETY_V1
}, inputs); // Custom logic scattered across templates
```

### Target Registry Pattern
```typescript
// Consistent registry pattern (TARGET)
const framework = new RubricFramework();
framework.register('triage-priority.v1', triagePriorityRubric);
framework.register('evidence-confidence.v1', evidenceConfidenceRubric);

const results = await framework.evaluateSet([
  'triage-priority.v1',
  'evidence-confidence.v1'
], evidence);
```

---

## Epic Breakdown

### EPIC-001: Minimal Rubric Registry (MVP)
**Priority**: P0 - BLOCKING | **Estimated**: 20 hours | **Dependencies**: None

#### Tasks:
- **TASK-001-A**: Create minimal RubricRegistry with register/evaluate/list methods (6h)
- **TASK-001-B**: Implement RubricEvaluator base class with consistent interfaces (4h) 
- **TASK-001-C**: Define RubricDefinition and RubricResult TypeScript interfaces (3h)
- **TASK-001-D**: Create rubric evaluation pipeline with error handling (4h)
- **TASK-001-E**: Add basic rubric validation and registration checks (3h)

### EPIC-002: Template Conversion (Registry Integration)
**Priority**: P0 - BLOCKING | **Estimated**: 16 hours | **Dependencies**: EPIC-001

#### Tasks:
- **TASK-002-A**: Convert ingress-pending template to use registry pattern (4h)
- **TASK-002-B**: Convert cluster-health template to use registry pattern (4h)
- **TASK-002-C**: Convert scheduling-failures template to use registry pattern (4h)
- **TASK-002-D**: Convert crashloopbackoff template to use registry pattern (4h)

### EPIC-003: Registry Testing & Validation
**Priority**: P0 - BLOCKING | **Estimated**: 12 hours | **Dependencies**: EPIC-002

#### Tasks:
- **TASK-003-A**: Create registry unit tests with rubric registration scenarios (4h)
- **TASK-003-B**: Implement golden snapshot validation for converted templates (4h)
- **TASK-003-C**: Create registry demo and template conversion dashboard (4h)

---

## Implementation Patterns

### Minimal Registry Interface
```typescript
interface RubricRegistry {
  // Core operations only (avoid feature creep)
  register(id: string, rubric: RubricDefinition): void;
  evaluate(id: string, evidence: Evidence): RubricResult;
  list(): string[]; // Simple list of registered rubrics
  
  // Future: Advanced features after MVP proven
  // migrate(), getCompatibility(), etc.
}
```

### RubricDefinition Schema
```typescript
interface RubricDefinition {
  id: string;                    // e.g., "triage-priority.v1"
  kind: 'weighted' | 'mapping' | 'guards';
  inputs: string[];             // Required evidence fields
  evaluate: (evidence: Evidence) => RubricResult;
  
  // Version 1: Keep simple
  version?: string;
  description?: string;
}
```

### Consistent Evaluation Pattern
```typescript
// Standard pattern for all templates
async function evaluateTemplateRubrics(evidence: Evidence): Promise<RubricResultSet> {
  const registry = getRubricRegistry();
  
  return registry.evaluateSet([
    'triage-priority.v1',
    'evidence-confidence.v1', 
    'remediation-safety.v1'
  ], evidence);
}
```

---

## Template Conversion Strategy

### Conversion Priority Order
1. **ingress-pending** - Well-tested, good example case
2. **cluster-health** - Clean scenario for pattern validation  
3. **scheduling-failures** - More complex rubric integration
4. **crashloopbackoff** - Validation of pattern across different scenarios

### Conversion Pattern (Each Template)
```typescript
// Before: Custom rubric evaluation
const rubrics = evaluateRubrics(customConfig, inputs);

// After: Registry-based evaluation  
const registry = getRubricRegistry();
const rubrics = await registry.evaluateSet([
  'triage-priority.v1',
  'evidence-confidence.v1', 
  'remediation-safety.v1'
], evidence);
```

### Validation Strategy
- Golden snapshot comparison before/after conversion
- Identical rubric results from old vs new pattern
- Performance metrics (registry should add <10ms overhead)

---

## Files Requiring Changes

### New Files (Registry Infrastructure)
- `/src/lib/rubrics/rubric-registry.ts` - Core registry implementation
- `/src/lib/rubrics/RubricEvaluator.ts` - Base evaluation engine
- `/src/lib/rubrics/types.ts` - TypeScript interfaces and schemas
- `/src/lib/rubrics/index.ts` - Public API exports

### Modified Files (Template Conversion)
- `/src/v2/templates/ingress-pending-template.ts` - Convert to registry pattern
- `/src/v2/templates/cluster-health-template.ts` - Convert to registry pattern  
- `/src/v2/templates/scheduling-failures-template.ts` - Convert to registry pattern
- `/src/v2/templates/crashloopbackoff-template.ts` - Convert to registry pattern

### Supporting Files
- `/src/lib/rubrics/core/` - Core rubric definitions (triage, confidence, safety)
- `/tests/lib/rubrics/` - Registry unit tests
- `/docs/examples/golden-templates/` - Updated golden snapshots

---

## Success Criteria

### Phase 1: Registry MVP (Sprint 1)
- [ ] Minimal registry with register/evaluate/list functionality
- [ ] TypeScript interfaces for all rubric operations
- [ ] Basic validation and error handling
- [ ] Unit tests with >90% coverage

### Phase 2: Template Conversion (Sprint 2-3)  
- [ ] 4+ templates converted to registry pattern
- [ ] Identical golden snapshot results (before/after conversion)
- [ ] Zero custom rubric evaluation code outside registry
- [ ] Registry demo showing consistent evaluation patterns

### Validation Metrics
- **Consistency**: 100% of converted templates use identical evaluation pattern
- **Performance**: Registry adds <10ms overhead to template execution
- **Coverage**: All core rubrics (triage/confidence/safety) work through registry
- **Stability**: Golden snapshots identical before/after conversion

---

## Visible Progress Tracking

### Sprint 1 Deliverables (Stakeholder Visibility)
- **Registry Demo**: Live demonstration of consistent rubric evaluation
- **Conversion Dashboard**: Progress tracking of template conversions
- **Golden Validation**: Before/after comparison proving identical results

### Sprint 2-3 Deliverables
- **Template Conversion Report**: 4+ templates using registry pattern
- **Performance Metrics**: Registry overhead analysis
- **Consistency Validation**: All templates use identical evaluation code

---

## Risk Mitigation

### Technical Risks
**Risk**: Registry introduces performance overhead  
**Mitigation**: Benchmark registry operations, target <10ms overhead

**Risk**: Template conversion introduces regressions  
**Mitigation**: Golden snapshot validation, comprehensive before/after testing

**Risk**: Registry complexity grows beyond MVP scope  
**Mitigation**: Strict scope control, defer advanced features to RFR-002/003

### Stakeholder Risks  
**Risk**: Feature freeze creates impatience during "invisible" work  
**Mitigation**: Sprint-by-sprint visible demos and progress dashboards

---

## Dependencies and Blockers

### Prerequisites
- None - RFR-001 is foundation work that enables everything else

### Blocking Items
- **All template development** - Frozen until registry established
- **All new rubric types** - Must use registry pattern
- **Framework extraction** - Impossible without consistent patterns

### Enables (After Completion)
- RFR-002: Versioning & Evolution (depends on registry foundation)
- RFR-003: Coverage Expansion (depends on consistent evaluation patterns)
- All future template development (plug-and-play with registry)

---

**Domain Owner**: Architecture Team  
**Implementation Lead**: DEVELOPER (guided by ADR-023)  
**Review Required**: REVIEWER approval of registry interface design before template conversion  
**Sprint Allocation**: 2-3 sprints (estimated 48 hours total work)  
**Business Impact**: Transforms MCP-ocs from prototype to framework-ready platform
