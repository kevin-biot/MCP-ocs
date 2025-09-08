# ADR-023: Introduction of oc_triage Entry Tool

**Status:** Accepted  
**Date:** September 08, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor), CODEX CLI (Implementation Validator)  
**Context Owner:** MCP-ocs  
**Type:** INTERIM IMPLEMENTATION (Bridge to Full Dictionary Architecture)

---

## Context

### The Template Visibility Gap

The design goal established in previous ADRs is to support deterministic, rubric-gated diagnostic flows (templates) without exposing template internals to the LLM or human operators. Our current architecture has achieved significant operational success:

- **ADR-014**: Deterministic Template Engine is fully implemented and operational (evidence completeness 1.0)
- **Template Infrastructure**: Templates exist internally and execute reliably via TemplateRegistry + TemplateEngine
- **Rubric Framework**: Safety, priority, and confidence scoring mechanisms are implemented and operational
- **Boundary Enforcement**: BoundaryEnforcer enforces step/time bounds with read-only posture

However, a critical usability gap exists: **Templates are only triggered when a `triageTarget` parameter is explicitly passed in tool calls** - this approach doesn't align with natural human or LLM usage patterns.

### Current State vs. ADR Intent

**Current Implementation (Validated by CODEX):**
```typescript
// Templates triggered only through internal parameter:
oc_diagnostic_namespace_health({
  namespace: "student03",
  triageTarget: "pvc-binding"  // ← Required for template activation
})
```

**ADR Intent (Entry Dictionary → Domain Dictionary → Template Routing):**
```typescript
// Natural triage request should route automatically:
"Quick triage PVC binding in student03" 
→ Entry Dictionary: canonical intent extraction
→ Domain Dictionary: OpenShift PVC domain mapping  
→ Template Engine: pvc-binding-template.json execution
```

### The Immediate Need

This creates a gap between ADR architectural intent and current usability:

1. **Human Operators**: Cannot naturally request "triage PVC binding in student03"
2. **LLM Agents**: Default to using raw tools (oc_read_*, diagnostics) instead of guided templates  
3. **Template Validation**: No natural way to validate end-to-end template→rubric→evidence flows
4. **Enterprise Demo**: Cannot demonstrate bounded triage capabilities to stakeholders

---

## Decision

**Introduce a single visible `oc_triage` entry tool that bridges the current implementation with the target dictionary architecture using a hybrid approach validated by CODEX analysis.**

### Core Design Principles (CODEX Validated)

1. **Single Entry Point**: One visible tool for all guided triage operations
2. **Intent-Based Interface**: Natural language intent mapping to internal templates  
3. **Bounded Execution**: Enforced step budgets and time limits using existing BoundaryEnforcer
4. **Structured Output**: Consistent triage envelope format for all responses
5. **Hybrid Trigger Policy**: Replace/Suggest/Observe modes based on intent clarity
6. **Safety First**: Read-only operations with classified follow-up actions

### Implementation Strategy

**Phase-Based Approach (CODEX Recommended):**
- **Phase 0**: Spike implementation with 3 intents behind feature flag
- **Phase 1**: Enable by default with shadow Suggest mode
- **Phase 2**: Expand scope with additional intents
- **Phase 3**: Measure and iterate based on real-world usage

### Trigger Policy Framework

```typescript
enum TriggerMode {
  REPLACE = "replace",    // Replace LLM planning (bounded/short intent)
  SUGGEST = "suggest",    // Shadow run + advisory (parallel execution)
  OBSERVE = "observe"     // Pass-through (deliberate multi-step workflows)
}
```

**Trigger Logic:**
- **Replace**: When `oc_triage` is explicitly called OR clear bounded intent detected
- **Suggest**: Shadow run template for diagnostics, attach advisory summary (no behavior change)
- **Observe**: Multi-step workflows or unclear intent patterns

---

## Tool Specification

### Tool Definition

```typescript
interface OcTriageTool {
  name: "oc_triage";
  category: "diagnostic";
  version: "v1";
  fullName: "oc_diagnostic_triage";
  maturity: "experimental";  // Until golden dataset validation
  
  inputSchema: {
    intent: string;           // REQUIRED: from supported intent list
    namespace?: string;       // optional, validates against cluster
    scopeType?: "namespace" | "cluster" | "node" | "global";
    bounded?: boolean;        // default true
    stepBudget?: number;      // default 3, max 5 (Phase 1: ≤3)
    urgency?: "low" | "medium" | "high" | "critical";
  };
  
  outputSchema: TriageEnvelope;
}
```

### Triage Envelope Schema (Stable Contract)

```typescript
interface TriageEnvelope {
  routing: {
    intent: string;           // Mapped intent identifier
    templateId: string;       // Internal template used
    bounded: boolean;         // Execution mode
    stepBudget: number;       // Steps allocated
    triggerMode: TriggerMode; // Replace/Suggest/Observe
  };
  
  rubrics: {
    safety: "ALLOW" | "REQUIRES_APPROVAL" | "BLOCK";
    priority: "P1" | "P2" | "P3" | "P4";
    confidence: "Low" | "Medium" | "High";
  };
  
  summary: string;            // Human-readable result
  
  evidence: {
    completeness: number;     // 0..1 (threshold ≥0.8)
    threshold?: number;       // Expected completeness
    missing?: string[];       // Missing evidence types
    present?: string[];       // Collected evidence types
    infrastructure?: InfrastructureEvidence;
    workloads?: WorkloadEvidence;
    storage?: StorageEvidence;
    networking?: NetworkingEvidence;
  };
  
  nextActions: SafetyClassifiedAction[];
  promptSuggestions: string[];
  followUpTools?: ExecutedToolCall[];
}

interface SafetyClassifiedAction {
  command: string;
  type: "read-only" | "mutating";
  safety: "SAFE" | "REQUIRES_APPROVAL" | "DANGEROUS";
  description: string;
  rationale?: string;
}
```

### Supported Intents (Phased Implementation)

**Phase 1 (Initial - 3 Intents):**
```yaml
storage:
  - "pvc-binding"           # PVC stuck in Pending state
  
compute:  
  - "scheduling-failures"   # Pod unschedulable diagnosis
  
networking:
  - "ingress-pending"       # Ingress controller issues
```

**Phase 2 (Expansion - Additional 2 Intents):**
```yaml
compute_extended:
  - "crashloop-analysis"    # Pod crashlooping diagnosis
  
networking_extended:
  - "route-5xx"            # Route returning 5xx errors
```

**Phase 3 (Future Consideration):**
```yaml
storage_extended:
  - "pvc-storage-affinity"  # Storage class / node affinity issues
  - "volume-mount-failures" # Mount path / permission issues
  
platform:
  - "api-degraded"         # Kubernetes API performance
  - "cluster-health"       # Overall cluster status
```

---

## Performance & Safety Bounds

### Performance Requirements (CODEX Validated)

```yaml
Performance Bounds:
  typical_completion: "< 15 seconds"
  step_budget_phase1: "≤ 3 steps"
  timeout_default: "20 seconds"
  evidence_threshold: "≥ 0.8"

Boundary Enforcement:
  max_steps: 5
  timeout_ms: 20000
  read_only: true
  namespace_scoped: true
```

### Safety Enforcement

- **BoundaryEnforcer**: Existing system enforces step/time limits
- **Read-Only Operations**: No cluster mutations through triage path
- **Safety Classification**: All suggested actions labeled with safety level
- **RBAC Respect**: Namespace isolation and proper permission handling
- **Token Scrubbing**: PII and sensitive data removed from persisted payloads

---

## Implementation Plan

### Phase 0: Spike Implementation (1-2 days)

**Deliverables:**
- Implement `oc_triage` behind feature flag (`ENABLE_OC_TRIAGE=true`)
- Wire 3 intents with envelope generation
- Integrate with existing TemplateEngine and BoundaryEnforcer
- Add logging: "Triage engaged (intent=X, template=Y, steps=Z)"
- E2E testing on crc cluster

**Acceptance Criteria:**
```typescript
// Natural interaction test
oc_triage({
  intent: "pvc-binding",
  namespace: "student03"
}) 
// Returns: TriageEnvelope with evidence completeness ≥ 0.8
```

### Phase 1: Adopt (Enable by Default)

**Deliverables:**
- Enable `oc_triage` by default in tool registry
- Update diagnostic tool descriptions to hint "bounded triage" capabilities
- Add shadow Suggest mode to `oc_diagnostic_namespace_health` and `oc_diagnostic_cluster_health`
- No Replace behavior yet (Suggest-only advisory summaries)

**Shadow Mode Implementation:**
```typescript
// Parallel execution - no behavior change
const shadowResult = await this.templateEngine.execute({
  template: "pvc-binding",
  namespace,
  bounded: true,
  stepBudget: 3
});

// Attach advisory to existing response
response.advisory = {
  triageMode: "suggest",
  summary: shadowResult.summary,
  confidence: shadowResult.rubrics.confidence
};
```

### Phase 2: Refine & Expand

**Deliverables:**
- Add crashloop-analysis and route-5xx intents
- Implement soft-hint mapping for common issue patterns
- Consider migrating ingress post-hook to use ingress template for consistency
- Enhanced evidence structure validation

### Phase 3: Measure & Optimize

**Deliverables:**
- Instrument success metrics: routing accuracy, evidence completeness, time-to-summary
- Collect operator satisfaction feedback
- Iterate dictionary and templates based on real-world usage traces
- Performance optimization based on actual usage patterns

---

## Observability & Monitoring

### Logging Strategy

```typescript
// Triage engagement banner
console.log(`Triage engaged: intent=${intent}, template=${templateId}, steps=${stepBudget}, mode=${triggerMode}`);

// Evidence collection tracking
console.log(`Evidence collection: completeness=${completeness}, threshold=${threshold}, missing=[${missing.join(', ')}]`);

// Performance tracking
console.log(`Triage completed: duration=${duration}ms, steps_executed=${stepsExecuted}/${stepBudget}`);
```

### Persistence Strategy

```yaml
Optional Summary Persistence:
  - planId: execution identifier
  - templateId: template used
  - evidence_completeness: 0..1 score
  - rubrics: safety, priority, confidence
  - engine_model_fingerprint: LLM model info
  - pii_scrubbed: true
  - storage: ./memory/triage-summaries/
```

---

## Risk Assessment & Mitigation

### Technical Risks (CODEX Identified)

**1. Intent Misclassification**
- **Risk**: Wrong template selection due to ambiguous intent
- **Mitigation**: Keep dictionary tiny and explicit; log routing decisions; include "why" in envelope

**2. Template Drift/Maturity**
- **Risk**: Low-quality templates producing poor evidence
- **Mitigation**: Use evidence completeness + confidence rubric to detect low assurance; degrade to advisory mode

**3. Performance Impact**
- **Risk**: Triage operations affecting existing tool performance
- **Mitigation**: Enforce tight bounds (stepBudget≤3, 20s timeout); parallel shadow mode for testing

**4. Security Concerns**
- **Risk**: Unintended cluster mutations or privilege escalation
- **Mitigation**: Read-only enforcement; safety classification; no implicit mutations; RBAC compliance

### Business Risks

**1. User Confusion**
- **Risk**: Mixed mental models between triage and diagnostic tools
- **Mitigation**: Clear tool descriptions; consistent envelope format; explicit consent model

**2. Over-reliance on Bounded Mode**
- **Risk**: Users avoiding deliberate multi-step investigation
- **Mitigation**: Preserve existing tools unchanged; clear guidance on when to use each approach

---

## Success Criteria

### Technical Validation

- [ ] **Natural Interaction**: `"Quick triage PVC binding in student03"` yields deterministic summary
- [ ] **Determinism**: Same intent produces identical envelope structure across calls
- [ ] **Evidence Quality**: Completeness ≥ 0.8 for all supported intents
- [ ] **Performance**: Typical completion < 15 seconds with stepBudget ≤ 3
- [ ] **Safety**: No cluster mutations; all suggested actions classified
- [ ] **Non-regression**: Existing tools behave identically when triage not invoked

### Usability Validation

- [ ] **LM Studio Integration**: Can call `oc_triage` naturally from LLM interactions
- [ ] **Human Operator Adoption**: Clear value proposition for bounded investigation
- [ ] **Envelope Utility**: promptSuggestions enable effective LLM continuation workflows
- [ ] **Action Clarity**: nextActions provide clear human CLI paths with safety guidance

### Strategic Alignment

- [ ] **ADR Compliance**: Maintains path to full dictionary architecture
- [ ] **Template Invisibility**: Templates remain internal implementation detail
- [ ] **Expert Workflow Preservation**: Power users can still access full diagnostic toolkit
- [ ] **Enterprise Readiness**: Demonstrates controlled, auditable triage capabilities

---

## Future Evolution Path

### Dictionary Architecture Migration

```typescript
// Current (Phase 1): Static intent mapping
const intentMap = {
  "pvc-binding": "pvc-binding-template",
  "scheduling-failures": "scheduling-failures-template"
};

// Target (Future): Dictionary-driven routing
const entryDictionary = await this.dictionaryEngine.resolve(naturalLanguageInput);
const domainDictionary = await this.domainRouter.route(entryDictionary.canonical);
const template = await this.templateEngine.select(domainDictionary.templateHints);
```

### Advanced Capabilities

- **AI-Assisted Dictionary Generation**: Machine learning-based intent classification
- **Cross-Model Consistency Validation**: Ensure deterministic behavior across LLM providers
- **Real-time Feedback Integration**: Continuous improvement based on operator feedback
- **Domain-Specific Audit Tools**: Regulatory compliance for enterprise deployment

---

## References

### Implementation Analysis
- **CODEX Assessment Report**: `./codex-docs/adr-023-assessment/` (comprehensive technical analysis)
- **Current State Validation**: Template engine operational with 1.0 evidence completeness
- **Safety Mechanism Review**: BoundaryEnforcer and read-only enforcement validated

### Related Architecture
- **ADR-014**: Deterministic Template Engine Architecture (foundation)
- **ADR-006**: Modular Tool Architecture (tool registry integration)
- **ADR-010**: Systemic Diagnostic Intelligence (template framework)
- **ADR-003**: Memory Storage and Retrieval Patterns (evidence persistence)

### Supporting Documentation
- **Template Engine Interface**: `src/lib/templates/template-engine.ts`
- **Tool Registry Pattern**: `src/lib/tools/tool-registry.ts`
- **Boundary Enforcement**: `src/lib/workflow/boundary-enforcer.ts`
- **Rubric System**: `docs/RUBRICS_LIBRARY.md`

---

## Conclusion

ADR-023 represents a pragmatic, interim solution that bridges our operational template engine capabilities with natural user interaction patterns. The CODEX analysis validates this approach as low-risk and high-value, providing immediate usability improvements while maintaining clear evolution path to full dictionary architecture.

**Key Strategic Value:**
- **Immediate**: Natural triage capabilities without disrupting existing workflows
- **Architectural**: Maintains template invisibility and deterministic execution
- **Enterprise**: Demonstrates controlled, auditable diagnostic capabilities
- **Evolution**: Clear migration path to AI-assisted dictionary routing

**Implementation Confidence:**
- Built on proven template engine foundation (1.0 evidence completeness)
- Leverages existing safety and boundary enforcement mechanisms
- Phased approach with measured expansion based on real-world validation
- Comprehensive risk mitigation and rollback strategies

With systematic execution of the phased implementation plan, oc_triage will provide the missing natural entry point to our deterministic template architecture while preserving all existing architectural investments and expert workflow capabilities.

---

**Last Updated**: September 08, 2025  
**Implementation Status**: Ready for Phase 0 spike development  
**Next Review**: After Phase 1 deployment and initial usage metrics collection