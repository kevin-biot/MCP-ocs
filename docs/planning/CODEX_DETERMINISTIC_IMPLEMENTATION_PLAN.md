# MCP-ocs Deterministic Template Engine Implementation Plan

## Project Overview
Transform MCP-ocs from LLM-driven diagnostic exploration to deterministic template-based triage engine while preserving Sequential Thinking as constrained post-template enhancement capability.

## Context & Justification
- Model variance testing shows 0-30+ tool calls for identical prompts across different LLMs
- Current Sequential Thinking Orchestrator produces non-deterministic behavior preventing production deployment  
- Desktop deployment blocked due to inability to recommend specific models with confidence
- 4AM incident response unreliable due to inconsistent evidence collection across models

## Strategic Goals
- **Operational Intelligence**: Transform raw findings into prioritized, auditable action
- **Deterministic scoring**: Evidence completeness + weighted rubrics for decision support
- **Infrastructure correlation**: Automated zone conflict detection and remediation guidance
- **4AM production ready**: Triage priority, confidence levels, and safety gates for operators

## Architecture Transition

### Current State - ACHIEVED ✅
```
DeterministicTemplateEngine (Production Ready)
├── 5 templates hardened with evidence completeness 1.0
├── Dynamic pod discovery working (real cluster data)
├── Template hygiene testing (offline + cross-model validation)
├── Infrastructure correlation engine (483ms detection, 42 conflicts found)
├── Rubrics integrated behind ENABLE_RUBRICS (triage, confidence, safety)
├── Summary v1.0 with schema/versioning + determinism envelope
├── Formatter v1.0 (human/color, JSON, CSV, gating)
├── Golden snapshots + strict comparator (pos/neg; determinism enforced)
└── E2E testing with performance monitoring
```

### Target State - OPERATIONAL INTELLIGENCE
```
OperationalIntelligenceEngine (Enhanced Template Engine)
├── Rubric-based scoring (triage priority, confidence, safety, SLO impact)
├── Infrastructure zone correlation template (leveraging existing engine)
├── Evidence completeness + weighted decision support
└── Complete operator decision framework
    ├── P1/P2/P3 triage with clear escalation
    ├── High/Medium/Low evidence confidence
    ├── Auto-execute vs. human required safety gates
    └── Technical failure → business impact mapping
```

## Implementation Phases

### Phase 0: Template Validation Checkpoint (Current Priority)
**Status**: COMPLETE EXISTING WORK - Validate template hygiene before proceeding
**Rationale**: Ensure solid foundation before adding operational intelligence layer

#### Task 0.1: Template Hygiene Validation
**Location**: Testing framework
**Commands to Execute**:
```bash
# Fast offline validation
LMSTUDIO_DRY_RUN=true npm run template:hygiene:test:all

# Or with LM Studio
export LMSTUDIO_BASE_URL=http://localhost:1234/v1
export LMSTUDIO_MODEL=ministral-8b-instruct-2410
npm run template:hygiene:test:all
```

#### Task 0.2: Real-Cluster Route/Networking Validation
**Location**: Live cluster testing
**Validation Steps**:
1. Start server with baseline configuration
2. Trigger `route-5xx` via `oc_diagnostic_namespace_health`
3. Use vars: `{ ns: "<ns>", route: "<route>" }`
4. Confirm service/backendPod auto-fill functionality

#### Task 0.3: Cross-Model Hygiene Validation
**Location**: Multi-model testing framework
**Commands to Execute**:
```bash
# Basic cross-model validation
npm run template:hygiene:cross:all

# Optional: Configure specific models and token limits
# export LMSTUDIO_MODELS=...
# export LMSTUDIO_MAX_TOKENS=...
# npm run template:hygiene:cross:all
```

**Success Criteria for Phase 0**:
- ✅ All template hygiene tests pass
- ✅ Real cluster route/networking validation confirmed
- ✅ Cross-model consistency validated
- ✅ Foundation solid for operational intelligence enhancement

#### Task 0.4: Template Coverage Tool (Evidence Thresholds)
Status: COMPLETE — implemented and gated
Location: `scripts/e2e/template-coverage.mjs`

Purpose: Offline check that each deterministic template reaches its evidence completeness threshold using fabricated, deterministic exec outputs.

Commands to Execute:
```bash
ENABLE_TEMPLATE_ENGINE=true ENABLE_SEQUENTIAL_THINKING=true ENABLE_RUBRICS=true \
  OC_TIMEOUT_MS=120000 npm run -s template:coverage
```

Templates and Thresholds (v1):
- ingress-pending: 0.9
- crashloopbackoff: 0.8
- route-5xx: 0.7
- pvc-binding: 0.8
- api-degraded: 0.7

Outputs:
- PASS: `{ ok: true, targets: [ ... ] }`
- FAIL: `{ failures: [{ target, completeness, threshold }, ...] }` and non-zero exit

Integration Notes:
- Coverage runs offline and is safe for CI; no cluster access required.
- Complements golden tests by asserting evidence contract sufficiency.
- Can be included in a CI bundle with golden compare and rubric coverage.

### Phase 1: Operational Rubrics Implementation (Week 1-2)
**Status**: IN PROGRESS — Core rubrics integrated; SLO rubric integrated
**ChatGPT Insight**: Use rubrics surgically to turn raw findings into prioritized, auditable action

#### Task 1.1: Triage Priority Rubric
Status: COMPLETE (triage-priority.v1)
**Location**: `src/lib/rubrics/`
**Files to Create**:
- `triage-priority-rubric.ts` - P1/P2/P3 scoring with clear escalation rules
- `rubric-evaluator.ts` - Mathematical scoring engine
- `rubric-types.ts` - Rubric interfaces and scoring definitions

**Triage Priority Implementation**:
```typescript
interface TriagePriorityRubric {
  id: "triage-priority.v1";
  inputs: ["blastRadius", "customerPaths", "operatorsDegraded", "timeSinceFirstEventMin"];
  weights: { blastRadius: 0.4, customerPaths: 0.3, operatorsDegraded: 0.2, timeSinceFirstEventMin: 0.1 };
  bands: { "P1": ">=0.8", "P2": ">=0.55", "P3": "otherwise" };
  output: TriageResult; // P1/P2/P3 with score and breakdown
}

interface TriageResult {
  priority: "P1" | "P2" | "P3";
  score: number;
  breakdown: { [key: string]: number };
  escalation: {
    notify: string[]; // "SRE Lead", "Platform Team", "On-call"
    urgency: "immediate" | "within_30min" | "next_business_day";
  };
}
```

#### Task 1.2: Evidence Confidence Rubric
Status: COMPLETE (evidence-confidence.v1)
**Location**: `src/lib/rubrics/`
**Files to Create**:
- `evidence-confidence-rubric.ts` - High/Medium/Low confidence scoring
- `evidence-completeness-enhancer.ts` - Extend existing completeness system
- `confidence-decision-support.ts` - Act vs. investigate more guidance

**Evidence Confidence Implementation**:
```typescript
interface EvidenceConfidenceRubric {
  id: "evidence-confidence.v1";
  mapping: {
    High: "evidenceCompleteness>=0.9 AND toolAgreement>=0.8 AND freshnessMin<=10";
    Medium: "evidenceCompleteness>=0.75 AND freshnessMin<=30";
    Low: "otherwise";
  };
  output: {
    confidence: "High" | "Medium" | "Low";
    recommendation: "proceed" | "gather_more" | "escalate";
    reasoning: string;
  };
}
```

**Integration with Existing Templates**:
- Extend current evidence completeness (0..1) with confidence assessment
- Add tool agreement scoring (cross-validation between diagnostic tools)
- Include data freshness metrics (timestamp analysis)

#### Task 1.3: Remediation Safety Gate Rubric
Status: COMPLETE (remediation-safety.v1)
**Location**: `src/lib/rubrics/`
**Files to Create**:
- `remediation-safety-rubric.ts` - Auto-execute vs. human required decisions
- `safety-gate-evaluator.ts` - Guard condition checking
- `runbook-fitness-scorer.ts` - Precondition validation for automated actions

**Remediation Safety Implementation**:
```typescript
interface RemediationSafetyRubric {
  id: "remediation-safety.v1";
  guards: [
    "etcdHealthy == true",
    "controlPlaneReady >= 2/3", 
    "affectedNamespaces <= 3",
    "noCriticalAlerts == true"
  ];
  decision: { allowAuto: "all guards true" };
  output: {
    allow_auto: boolean;
    guards_status: boolean[];
    blocked_reason?: string;
    manual_approval_required?: string[];
  };
}
```

**Safety Gate Integration**:
- Evaluate cluster stability before allowing automated remediation
- Generate safe oc/kubectl commands with validation
- Provide clear reasoning for auto-execute vs. human approval decisions

#### Task 1.4: SLO Impact Classification Rubric
Status: COMPLETE — integrated and used in goldens/formatter
**Location**: `src/lib/rubrics/`
**Files to Create**:
- `slo-impact-rubric.ts` - Technical failure → business impact mapping
- `slo-breach-predictor.ts` - Time-to-breach estimation
- `business-impact-classifier.ts` - Customer-facing vs. internal impact assessment

**SLO Impact Implementation**:
```typescript
interface SLOImpactRubric {
  id: "slo-impact.v1";
  mapping: {
    api_degraded: "API Availability SLO at risk (breach in 45min)";
    ingress_pending: "External Traffic SLO at risk (breach in 30min)";
    storage_full: "Data Persistence SLO at risk (immediate)";
    pod_crashloop: "Application Availability SLO at risk (depends on replicas)";
  };
  output: {
    impact_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    affected_slos: string[];
    time_to_breach?: string;
    customer_impact: "external" | "internal" | "none";
  };
}
```

### Phase 2: Infrastructure Zone Correlation Template (Week 3-4)
**Status**: LEVERAGE EXISTING CORRELATION ENGINE - 483ms detection, 42 conflicts identified

#### Task 2.1: Complete Infrastructure Tools
**Location**: `src/tools/infrastructure/`
**Missing Tools to Create**:
- `oc_read_nodes.ts` - Zone mapping, taint/toleration analysis, capacity information
- `oc_read_machinesets.ts` - MachineSet status and zone distribution
- `oc_analyze_zone_conflicts.ts` - Storage/compute zone correlation

**Critical Gap Addressed**:
Current tools provide basic node data but lack dedicated infrastructure analysis for template engine. Need comprehensive zone mapping for deterministic conflict detection.

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

### Operational Intelligence Metrics
- **Triage Accuracy**: ≥95% correct P1/P2/P3 classification during incidents
- **Evidence Confidence**: High confidence correlates with ≥90% correct diagnosis
- **Safety Gate Effectiveness**: Zero unauthorized auto-remediation executions
- **SLO Impact Prediction**: ≤15 minute variance in breach time estimates

### Infrastructure Correlation Targets
- **Zone Conflict Detection**: <500ms automated identification
- **Storage-Infrastructure Mapping**: 100% PVC zone requirements identified
- **Remediation Guidance**: Specific MachineSet scaling recommendations
- **Template Integration**: Infrastructure template with rubric scoring

### Enhanced Operator Experience
- **Decision Support**: Clear P1/P2/P3 with escalation contacts
- **Confidence Levels**: High/Medium/Low with proceed/investigate guidance
- **Safety Validation**: Auto-execute vs. human approval with reasoning
- **Business Impact**: Technical failure → SLO impact mapping

This implementation transforms MCP-ocs from a template engine into an **Operational Intelligence Platform** that provides:

- **Intelligent Triage**: P1/P2/P3 priority with clear escalation rules
- **Evidence-Based Decisions**: High/Medium/Low confidence with proceed/investigate guidance  
- **Safety-First Automation**: Validated auto-remediation with human approval gates
- **Business Impact Awareness**: Technical failures mapped to SLO risks and customer impact
- **Infrastructure Intelligence**: Automated zone conflict detection with specific remediation guidance

The enhanced system maintains deterministic template execution while adding the operational intelligence layer that transforms raw diagnostic findings into **prioritized, auditable action** suitable for enterprise 4AM incident response.

## Current Rubrics Coverage Snapshot (2025-08-17)

- Covered (integrated via template engine path):
  - oc_read_get_pods, oc_read_describe, oc_read_logs
- Pending coverage (to implement in Phase 1/2/3):
  - Diagnostic: oc_diagnostic_cluster_health, oc_diagnostic_namespace_health, oc_diagnostic_pod_health, oc_diagnostic_rca_checklist
  - Memory: memory_search_incidents, memory_store_operational, memory_search_operational, memory_get_stats, memory_search_conversations
  - Core: core_workflow_state, sequential_thinking

Coverage: 3/14 tools (21%). Target ≥90% before broad release; SLO Impact rubric tracked under Task 1.4 (pending).

## Recent Deliverables (2025-08-17)

- ENABLE_RUBRICS integration in both entrypoints with rubric outputs next to evidence
- Summary v1.0 (schemaVersion, engineVersion, templateId/version, rubricVersions, determinism, rubricInputs, evidence present/missing + thresholds, safety guards)
- Evidence gate forces confidence=Low below threshold
- Persisted summaries (scrubbed) and drift NDJSON; optional shadow plan-only diff
- Golden snapshots and strict comparator (positive/negative) with determinism envelope; CI scripts added
- Rubrics formatter v1.0 with color/CSV/JSON output and gating flags

## Rubrics Phase Alignment (Context & Structure)

To introduce rubric-based scoring in a deterministic and auditable way, we align the implementation as follows:

- Folder layout (scaffolded):
  - `src/lib/rubrics/`
    - `core/` — universal meta-rubrics (triage-priority, evidence-confidence, remediation-safety)
    - `diagnostic/` — template-specific rubrics (e.g., scheduler-predicate, pvc-binding, ingress-risk)
    - `intelligence/` — advanced pattern rubrics (operator-impact, noise-filter, runbook-fitness)
    - `rubric-registry.ts` — shared types + registration (present)

- Documentation (added):
  - `docs/RUBRICS_CONTEXT_PLAN.md` — objectives, schemas (weighted/guards/mapping), evaluator integration, rollout plan
  - `docs/RUBRICS_LIBRARY.md` — library overview, categories, development cycle, memory integration

- Initial P0 set (planned):
  - triage-priority.v1 — P1/P2/P3 classification with explicit bands
  - evidence-confidence.v1 — High/Medium/Low confidence from completeness + agreement + freshness
  - remediation-safety.v1 — guard-based ALLOW/AUTO-BLOCK for safe actions

- Integration points:
  - After evidence evaluation; before final report emission; output under `rubrics` with per-badge breakdowns
  - Tiny safe DSL for guards/mappings; weighted scoring for criteria with optional normalizers

- Testing:
  - Unit tests for evaluator; hygiene tests extended with rubric inputs; E2E assertions for badges; cross-model stability checks
