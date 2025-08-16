# MCP-ocs Deterministic Template Engine Implementation Plan

## Project Overview
Transform MCP-ocs from LLM-driven diagnostic exploration to deterministic template-based triage engine while preserving Sequential Thinking as constrained post-template enhancement capability.

## Context & Justification
- Model variance testing shows 0-30+ tool calls for identical prompts across different LLMs
- Current Sequential Thinking Orchestrator produces non-deterministic behavior preventing production deployment  
- Desktop deployment blocked due to inability to recommend specific models with confidence
- 4AM incident response unreliable due to inconsistent evidence collection across models

## Strategic Goals
- Deterministic diagnostics: same infrastructure issue → same evidence → same conclusions
- Desktop deployment: reliable operation on 9GB-30GB models
- 4AM production ready: fast, complete diagnostics without human command intervention
- Sequential Thinking preservation: constrained enhancement within strict boundaries

## Architecture Transition

### Current State
```
EnhancedSequentialThinkingOrchestrator (Primary Controller)
├── LLM chooses diagnostic strategy
├── Variable tool call sequences per model  
├── Non-deterministic evidence collection
└── Timeout issues under load
```

### Target State  
```
DeterministicTemplateEngine (Primary Controller)
├── Template-driven execution with infrastructure-first analysis
├── Server-enforced boundaries (namespace, tools, budgets)
├── Mandatory evidence contracts with completeness validation
└── ConstrainedSequentialThinking (Secondary Enhancement)
    ├── Post-template gap-filling only
    ├── Evidence contract targeting
    └── Inherited template boundaries
```

## Implementation Phases

### Phase 1: Foundation Architecture (Week 1)

#### Task 1.1: Template Registry System
**Location**: `src/lib/templates/`
**Files to Create**:
- `template-registry.ts` - Template loading, caching, and selection
- `template-engine.ts` - Deterministic execution controller
- `template-types.ts` - Core interfaces and type definitions
- `evidence-validator.ts` - Contract-based validation with scoring
- `templates/` directory with JSON template definitions

**Key Components**:
```typescript
interface DiagnosticTemplate {
  id: string;
  name: string;
  version: string;
  triggers: TriggerCondition[];
  blocks: string[]; // Reusable block references
  composition: {
    infrastructure: string[];
    workload: string[];
    correlation: string[];
  };
  evidenceContract: VersionedEvidenceContract;
  boundaries: EnhancedExecutionBoundaries;
}
```

#### Task 1.2: Composable Block System
**Location**: `src/lib/templates/blocks/`
**Files to Create**:
- `infrastructure-blocks.ts` - Node, zone, MachineSets analysis
- `workload-blocks.ts` - Pod, deployment, resource analysis  
- `correlation-blocks.ts` - Cross-system correlation logic
- `block-registry.ts` - Block loading and composition

**Reusable Blocks**:
- `nodes_analysis` - Zone/taint/capacity analysis
- `events_scheduling` - FailedScheduling event filtering
- `pvc_zone_mapping` - PVC zone requirements  
- `machineset_status` - Zone replica health
- `pod_constraints` - Tolerations, affinity, selectors

#### Task 1.3: Enhanced Execution Boundaries
**Location**: `src/lib/enforcement/`
**Files to Create**:
- `boundary-enforcer.ts` - Namespace, tool, step enforcement
- `execution-guards.ts` - Budgets, retries, circuit breakers
- `tool-contract-validator.ts` - Parameter validation and coercion
- `telemetry-tracker.ts` - Determinism validation metrics

**Enhanced Boundaries**:
```typescript
interface EnhancedExecutionBoundaries {
  maxSteps: number;
  timeoutMs: number;
  allowedNamespaces: string[];
  toolWhitelist: string[];
  maxToolRetries: number;
  budgets: {
    infraSteps: number;
    workloadSteps: number;
    correlationSteps: number;
  };
  circuitBreaker: {
    windowMs: number;
    maxRepeatCallsPerTool: number;
  };
}
```

#### Task 1.4: Missing Infrastructure Tools
**Location**: `src/tools/infrastructure/`
**Files to Create**:
- `oc_read_nodes_enhanced.ts` - Comprehensive node state with zones/taints
- `oc_read_machinesets_status.ts` - Replica health and zone distribution
- `oc_analyze_scheduling_failures.ts` - Detailed scheduler predicate analysis
- `oc_read_events.ts` - Filtered event collection (replace log abuse)
- `oc_analyze_infrastructure_distribution.ts` - Cross-zone capacity correlation

### Phase 2: Template Implementation (Week 2)

#### Task 2.1: Core Diagnostic Templates
**Location**: `src/lib/templates/templates/`
**Templates to Create**:
1. `scheduling-failures.json` - Node taints, zone distribution, scheduler predicates
2. `infrastructure-scale-conflicts.json` - MachineSets, zone capacity, PVC placement
3. `pvc-binding-infrastructure.json` - Storage class zones, node availability  
4. `ingress-pending.json` - Router placement, anti-affinity, infrastructure gaps
5. `crashloop-analysis.json` - Process failures, resource constraints, probe issues

**Template Structure Example**:
```json
{
  "id": "scheduling-failures-v1",
  "name": "Pod Scheduling Failure Analysis",
  "version": "1.0.0",
  "triggers": [
    {
      "type": "event_pattern",
      "predicate": "$.events[?(@.reason == 'FailedScheduling')]",
      "confidence": 0.95
    }
  ],
  "blocks": ["nodes_analysis", "events_scheduling", "pod_constraints"],
  "composition": {
    "infrastructure": ["nodes_analysis", "machineset_status"],
    "workload": ["pod_constraints", "events_scheduling"],
    "correlation": ["scheduling_correlation"]
  },
  "evidenceContract": {
    "version": "v1.0.0",
    "required": ["nodeCapacity", "podConstraints", "schedulingEvents"],
    "completenessThreshold": 0.9
  },
  "boundaries": {
    "maxSteps": 5,
    "timeoutMs": 45000,
    "budgets": { "infraSteps": 3, "workloadSteps": 2, "correlationSteps": 1 }
  }
}
```

#### Task 2.2: Versioned Evidence Contracts
**Location**: `src/lib/evidence/`
**Files to Create**:
- `evidence-contract-validator.ts` - Contract loading and validation
- `schema-dsl.ts` - Model-agnostic evidence mapping  
- `evidence-extractor.ts` - JSONPath and DSL-based data extraction
- `completeness-scorer.ts` - Evidence quality and completeness metrics

**Evidence Contract System**:
```typescript
interface VersionedEvidenceContract {
  version: string;
  schemaRef: string;
  selectors: {
    type: "jsonpath" | "dsl";
    mappings: {
      nodeCapacity: "nodes.analysis.allocatable",
      schedulingEvents: "events.filtered.FailedScheduling",
      podConstraints: "workload.spec.placement"
    };
  };
  required: EvidenceField[];
  completenessThreshold: number;
}
```

#### Task 2.3: Constrained Sequential Thinking Integration
**Location**: `src/lib/sequential-thinking/`
**Files to Modify/Create**:
- `constrained-sequential-thinking.ts` - Post-template gap-filling capability
- `reflective-gap-filler.ts` - Evidence contract targeting
- `sequential-thinking-boundaries.ts` - Inherited constraint enforcement

**Integration Points**:
```typescript
class DeterministicTemplateEngine {
  async executeWithReflection(template: DiagnosticTemplate): Promise<EnhancedTriageResult> {
    // 1. Execute template (primary)
    const templateResult = await this.executeTemplate(template);
    
    // 2. Validate evidence completeness
    const evidenceValidation = await this.validateEvidence(templateResult.evidence);
    
    // 3. Optional Sequential Thinking enhancement
    if (evidenceValidation.completeness < 0.9) {
      const reflectionResult = await this.constrainedSequentialThinking.fillGaps({
        evidenceSummary: templateResult.evidence,
        missingFields: evidenceValidation.missing,
        boundaries: template.boundaries
      });
      
      return this.combineResults(templateResult, reflectionResult);
    }
    
    return templateResult;
  }
}
```

#### Task 2.4: Operator-Friendly Reporting
**Location**: `src/lib/reporting/`
**Files to Create**:
- `deterministic-reporter.ts` - Standardized output formatting
- `evidence-status-formatter.ts` - INCOMPLETE flags and confidence scores
- `admin-commands-generator.ts` - Safe oc/kubectl command generation
- `reflection-metadata-formatter.ts` - Sequential Thinking attribution

### Phase 3: Integration & Production (Week 3)

#### Task 3.1: Sequential Thinking Migration
**Location**: `src/index.ts` and orchestration files
**Files to Modify**:
- `src/index.ts` - Replace orchestrator with template engine
- `src/lib/tools/sequential-thinking-with-memory.ts` - Preserve as constrained capability
- `src/lib/tools/tool-registry.ts` - Wire template engine as primary

#### Task 3.2: Dual-Run Validation Framework
**Location**: `src/validation/`
**Files to Create**:
- `dual-run-validator.ts` - Parallel execution comparison
- `evidence-consistency-checker.ts` - Cross-model validation
- `migration-metrics-collector.ts` - Transition success tracking

#### Task 3.3: Golden Test Suite Implementation
**Location**: `tests/golden/`
**Files to Create**:
- `synthetic-cluster-states/` - JSON fixtures for deterministic testing
- `golden-test-runner.ts` - Cross-model validation execution
- `expected-outcomes/` - Deterministic diagnosis expectations

#### Task 3.4: Desktop Deployment Configuration
**Location**: `deployment/desktop/`
**Files to Create**:
- `docker-compose.desktop.yml` - 9GB model deployment
- `model-recommendations.md` - Tier-based model selection guide
- `performance-benchmarks.md` - Resource usage expectations
- `troubleshooting-guide.md` - Common deployment issues

## Success Criteria

### Determinism Validation
- Cross-model evidence consistency: ≥95%
- Execution predictability: ≤10% tool call variance  
- Evidence contract compliance: ≥90% completeness
- Bounded execution: 100% namespace/budget compliance

### Performance Targets
- Desktop performance: <2 minutes on 9GB models
- Operator experience: INCOMPLETE flags, confidence scores, admin commands
- Template coverage: 5 templates for 80% of failures
- Migration success: ≥95% agreement during dual-run

### Production Readiness
- Live cluster validation: Real infrastructure issue diagnosis
- Model tier documentation: Clear 9GB-30GB deployment guidance
- Sequential Thinking integration: Constrained enhancement working
- Golden test coverage: Synthetic states with deterministic outcomes

This implementation transforms MCP-ocs into a production-ready, deterministic infrastructure diagnostic engine while preserving Sequential Thinking capabilities as constrained enhancement tools within strict operational boundaries.
