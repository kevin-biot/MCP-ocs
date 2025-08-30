# Rubrics Implementation Context & Plan

## Objectives

### Primary Goals
- **Transform Raw Findings → Prioritized Action**: Convert template evidence into P1/P2/P3 triage with clear escalation
- **Evidence-Based Decision Support**: High/Medium/Low confidence scoring with proceed/investigate guidance
- **Safety-First Automation**: Universal safety gates preventing dangerous auto-remediation
- **Business Impact Awareness**: Technical failures mapped to SLO risks and customer impact

### Strategic Value
- **Operator Intelligence**: 4AM decision support with clear reasoning
- **Consistent Escalation**: Deterministic priority classification across all incidents
- **Audit Compliance**: Mathematical scoring with complete traceability
- **Cross-Template Reusability**: Core rubrics work across all diagnostic templates

## Rubric Schema Types

### 1. Weighted Scoring Rubrics
**Purpose**: Mathematical scoring with transparent formulas
**Schema**:
```typescript
interface WeightedScoringRubric {
  id: string;
  version: string;
  inputs: string[];
  weights: { [key: string]: number };
  scoring: {
    formula: string;
    normalization: "0-1" | "0-100" | "percentile";
  };
  bands: Array<{
    condition: string;
    label: string;
    priority?: "P1" | "P2" | "P3";
    escalation?: EscalationRule;
  }>;
}
```

**Examples**: `triage-priority.v1`, `zone-capacity.v1`, `ingress-risk.v1`

### 2. Guard-Based Safety Rubrics  
**Purpose**: Boolean safety validation with clear blocking reasons
**Schema**:
```typescript
interface GuardBasedRubric {
  id: string;
  version: string;
  guards: Array<{
    condition: string;
    description: string;
    severity: "blocking" | "warning";
  }>;
  decision: {
    allowAuto: string; // "all guards true"
    blockedReasons: string[];
    manualApprovalRequired: string[];
  };
}
```

**Examples**: `remediation-safety.v1`, `runbook-fitness.v1`

### 3. Mapping-Based Classification Rubrics
**Purpose**: Discrete classification with clear mapping rules  
**Schema**:
```typescript
interface MappingBasedRubric {
  id: string;
  version: string;
  inputs: string[];
  mapping: {
    [key: string]: string; // condition → classification
  };
  output: {
    classification: string;
    confidence?: number;
    reasoning: string;
  };
}
```

**Examples**: `evidence-confidence.v1`, `scheduler-predicate.v1`

## Evaluator Integration

### RubricEvaluator Interface
```typescript
interface RubricEvaluator {
  evaluate<T extends RubricType>(
    rubric: T,
    evidence: EvidenceContext,
    metadata?: EvaluationMetadata
  ): Promise<RubricResult<T>>;
  
  validateInputs(rubric: RubricDefinition, evidence: EvidenceContext): ValidationResult;
  evaluateCondition(condition: string, context: object): boolean | number;
  generateAuditTrail(rubric: RubricDefinition, result: RubricResult): AuditTrail;
}
```

### Integration Points with Template Engine
1. **Post-Evidence Collection**: After template gathers evidence, evaluate applicable rubrics
2. **Pre-Action Validation**: Safety rubrics validate before any automated actions
3. **Result Enhancement**: Rubric results enhance template output with priority/confidence
4. **Audit Trail Generation**: Complete traceability from evidence → rubric → decision

### Expression DSL
**Simple expression language for rubric conditions**:
```typescript
// Boolean expressions
"etcdHealthy == true"
"controlPlaneReady >= 2"
"predicateFailures has 'UntoleratedTaint'"

// Numeric expressions  
"sum(zoneReadyWorkers.values) < desiredReplicas"
"completeness >= 0.9 && toolAgreement >= 0.8"

// Array operations
"intersection(pvc.topologyZones, zonesWithWorkers).length > 0"
"missingTolerations.length == 0"
```

## Rollout Strategy

### Phase 0: Foundation (Current)
- **Rubric schemas and types** defined
- **Evaluator interface** scaffolded  
- **Registry system** implemented
- **Unit test framework** established

### Phase 1: Core Operational Rubrics (Weeks 1-2)
**Priority Rubrics**:
- `triage-priority.v1` - Universal P1/P2/P3 classification
- `evidence-confidence.v1` - Evidence quality assessment
- `remediation-safety.v1` - Universal safety gates

**Integration**:
- Add to ALL existing templates (ingress, scheduling, infrastructure, crashloop, route-5xx)
- Test with current template evidence
- Validate cross-model determinism

### Phase 2: Diagnostic Rubrics (Weeks 3-4)  
**Template-Specific Rubrics**:
- `scheduler-predicate.v1` → scheduling-failures template
- `zone-capacity.v1` → infrastructure-correlation template
- `ingress-risk.v1` → ingress-pending template

**New Template Development**:
- Each new template paired with appropriate diagnostic rubrics
- Template + rubric tested as unit before integration

### Phase 3: Intelligence Rubrics (Weeks 5+)
**Advanced Pattern Rubrics**:
- `operator-impact.v1` - Cascading failure analysis
- `noise-filter.v1` - Event aggregation intelligence
- `runbook-fitness.v1` - Automated remediation ranking

## Risk Assessment & Mitigation

### Technical Risks

**Risk**: Rubric complexity creates performance bottlenecks
**Mitigation**: 
- Benchmark all rubrics for <100ms evaluation time
- Cache rubric compilation for repeated use
- Implement circuit breakers for rubric timeouts

**Risk**: Expression DSL becomes too complex
**Mitigation**:
- Limit DSL to simple boolean/numeric expressions
- Provide standard library functions (sum, intersection, etc.)
- Validate expressions at rubric registration time

**Risk**: Rubric versioning creates compatibility issues
**Mitigation**:
- Semantic versioning for rubric definitions
- Backward compatibility testing for rubric updates
- Template-rubric compatibility matrix tracking

### Operational Risks

**Risk**: Incorrect rubric logic causes wrong escalation
**Mitigation**:
- Comprehensive unit testing for all rubric conditions
- Integration testing with real incident data
- Gradual rollout with manual validation

**Risk**: Rubric outputs don't match operator expectations  
**Mitigation**:
- Operator feedback integration during rollout
- A/B testing against manual triage decisions
- Continuous rubric performance monitoring

## Testing Strategy

### Unit Testing Framework
```typescript
describe('TrigagePriorityRubric', () => {
  test('P1 classification for critical blast radius', () => {
    const evidence = {
      blastRadius: 0.9,
      customerPaths: 0.8,
      operatorsDegraded: 2,
      timeSinceFirstEventMin: 60
    };
    
    const result = evaluator.evaluate(triagePriorityRubric, evidence);
    expect(result.priority).toBe('P1');
    expect(result.escalation.notify).toContain('SRE Lead');
  });
});
```

### Integration Testing
- **Template-Rubric Pairs**: Test each template with its associated rubrics
- **Cross-Model Validation**: Ensure deterministic results across different LLM models
- **Real Incident Replay**: Test rubrics against historical incident data

### Performance Testing
- **Rubric Evaluation Speed**: <100ms per rubric evaluation
- **Expression DSL Performance**: <10ms for complex expressions
- **Memory Usage**: Rubric evaluation within template memory budgets

### Regression Testing  
- **Rubric Version Compatibility**: New rubric versions maintain backward compatibility
- **Template Integration**: Rubric changes don't break existing template functionality
- **Cross-Template Consistency**: Core rubrics produce consistent results across templates

## Success Metrics

### Accuracy Metrics
- **Triage Accuracy**: ≥95% agreement with manual operator classification
- **Evidence Confidence Correlation**: High confidence → ≥90% correct diagnosis
- **Safety Gate Effectiveness**: Zero inappropriate auto-remediation executions

### Performance Metrics  
- **Evaluation Speed**: All rubrics evaluate in <100ms
- **Template Integration Overhead**: <10% increase in template execution time
- **Cross-Model Consistency**: ≥98% identical results across LLM models

### Operational Metrics
- **Operator Satisfaction**: Rubric recommendations rated helpful by ≥85% of operators
- **Escalation Accuracy**: P1/P2/P3 classifications result in appropriate response times
- **Decision Support Value**: Operators report increased confidence in 4AM decisions

This context plan provides the foundation for implementing surgical, template-aligned rubrics that transform MCP-ocs into an operational intelligence platform.
