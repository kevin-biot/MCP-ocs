# F-010: oc_triage Entry Tool Epic

## Epic Overview
**Epic ID**: F-010  
**Epic Name**: oc_triage Entry Tool (Natural Interaction Bridge)  
**ADR Coverage**: ADR-023 (oc_triage Entry Tool)  
**Status**: 🎯 **READY FOR IMPLEMENTATION** (CODEX-validated)  
**Priority**: **P1 - HIGH** (Natural interaction enabler)  
**Dependencies**: ADR-014 (Template Engine - IMPLEMENTED), ADR-006 (Tool Registry - OPERATIONAL)  
**CODEX Assessment**: `./codex-docs/adr-023-assessment/` (Complete technical validation)

---

## Epic Description
Implements a single visible `oc_triage` entry tool that bridges the operational template engine (1.0 evidence completeness) with natural user interaction patterns. This epic addresses the critical usability gap where templates require `triageTarget` parameter, breaking natural human and LLM workflows.

**Strategic Value**: Enables immediate natural triage capabilities while maintaining all architectural investments and preserving clear evolution path to dictionary architecture.

---

## Features in Epic

### **F-010-01: Phase 0 Spike Implementation** (ADR-023 Phase 0)
**Effort**: 1-2 days  
**Priority**: P1-CRITICAL  
**Status**: READY  
**Current State**: Template engine operational, tool registry functional, safety mechanisms validated  
**Implementation Needed**: 
- oc_triage tool registration in diagnostic category
- Intent mapping for 3 initial intents (pvc-binding, scheduling-failures, ingress-pending)
- TriageEnvelope schema implementation
- Template engine integration with triageTarget bridging
- BoundaryEnforcer integration for safety

**Daily Sprint Tasks**:
- **Day 1 AM**: Create oc_triage tool definition and register in DiagnosticToolsV2
- **Day 1 PM**: Implement TriageEnvelope schema and basic intent mapping
- **Day 2 AM**: Integrate with existing template engine using triageTarget bridge
- **Day 2 PM**: Add BoundaryEnforcer integration and E2E testing on crc

**Acceptance Criteria**:
```typescript
// Natural interaction test
oc_triage({
  intent: "pvc-binding",
  namespace: "student03"
}) 
// Returns: TriageEnvelope with evidence completeness ≥ 0.8, <15s completion
```

### **F-010-02: Phase 1 Production Enablement** (ADR-023 Phase 1)
**Effort**: 2-3 days  
**Priority**: P1-HIGH  
**Status**: PENDING (After Phase 0)  
**Implementation Needed**:
- Enable oc_triage by default in tool registry
- Update diagnostic tool descriptions for "bounded triage" hints
- Implement shadow Suggest mode for existing diagnostic tools
- Add observability logging and performance monitoring

**Daily Sprint Tasks**:
- **Day 1**: Enable oc_triage by default, update tool descriptions
- **Day 2**: Implement shadow Suggest mode for oc_diagnostic_namespace_health
- **Day 3**: Add comprehensive logging and performance monitoring

**Shadow Mode Implementation**:
```typescript
// Parallel execution - no behavior change
const shadowResult = await this.templateEngine.execute({
  template: mapIntentToTemplate(detectedIntent),
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

### **F-010-03: Enhanced Intent Support** (ADR-023 Phase 2)
**Effort**: 3-4 days  
**Priority**: P2-HIGH  
**Status**: PENDING (After Phase 1)  
**Implementation Needed**:
- Add crashloop-analysis and route-5xx intents
- Implement soft-hint mapping for common issue patterns
- Enhanced evidence structure validation
- Performance optimization based on usage patterns

**Daily Sprint Tasks**:
- **Day 1**: Add crashloop-analysis intent mapping and template integration
- **Day 2**: Add route-5xx intent mapping and validation
- **Day 3**: Implement soft-hint mapping for issue pattern detection
- **Day 4**: Performance optimization and evidence validation enhancement

### **F-010-04: Observability & Monitoring** (ADR-023 Phase 3)
**Effort**: 2-3 days  
**Priority**: P2-MEDIUM  
**Status**: PENDING (After Phase 2)  
**Implementation Needed**:
- Comprehensive success metrics instrumentation
- Operator satisfaction feedback collection
- Real-world usage pattern analysis
- Template iteration based on production traces

**Daily Sprint Tasks**:
- **Day 1**: Implement success metrics collection (routing accuracy, evidence completeness)
- **Day 2**: Add operator satisfaction feedback and usage analytics
- **Day 3**: Performance monitoring dashboard and optimization recommendations

---

## Technical Implementation Details

### **Tool Registration Integration**
```typescript
// Integration with existing DiagnosticToolsV2
class DiagnosticToolsV2 implements ToolSuite {
  category = 'diagnostic';
  version = 'v2';
  
  getTools(): StandardTool[] {
    return [
      ...existingTools,
      {
        name: "oc_triage",
        fullName: "oc_diagnostic_triage",
        description: "Bounded triage entry point with natural intent routing",
        maturity: "experimental",
        inputSchema: TriageInputSchema,
        execute: this.executeOcTriage.bind(this)
      }
    ];
  }
}
```

### **Triage Envelope Schema**
```typescript
interface TriageEnvelope {
  routing: {
    intent: string;           // Mapped intent identifier
    templateId: string;       // Internal template used
    bounded: boolean;         // Execution mode
    stepBudget: number;       // Steps allocated
    triggerMode: "replace" | "suggest" | "observe";
  };
  
  rubrics: {
    safety: "ALLOW" | "REQUIRES_APPROVAL" | "BLOCK";
    priority: "P1" | "P2" | "P3" | "P4";
    confidence: "Low" | "Medium" | "High";
  };
  
  summary: string;            // Human-readable result
  
  evidence: {
    completeness: number;     // 0..1 (threshold ≥0.8)
    missing?: string[];       // Missing evidence types
    present?: string[];       // Collected evidence types
  };
  
  nextActions: SafetyClassifiedAction[];
  promptSuggestions: string[];
  followUpTools?: ExecutedToolCall[];
}
```

### **Intent Mapping (Phase-Based)**
```typescript
// Phase 1: 3 intents
const PHASE_1_INTENTS = {
  "pvc-binding": "pvc-binding-template",
  "scheduling-failures": "scheduling-failures-template", 
  "ingress-pending": "ingress-pending-template"
};

// Phase 2: Additional 2 intents  
const PHASE_2_INTENTS = {
  ...PHASE_1_INTENTS,
  "crashloop-analysis": "crashloop-analysis-template",
  "route-5xx": "route-5xx-template"
};
```

---

## Performance & Safety Requirements

### **Performance Bounds (CODEX Validated)**
```yaml
Performance Requirements:
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

### **Safety Enforcement**
- **BoundaryEnforcer**: Existing system enforces step/time limits
- **Read-Only Operations**: No cluster mutations through triage path
- **Safety Classification**: All suggested actions labeled with safety level
- **RBAC Respect**: Namespace isolation and proper permission handling

---

## Integration Points

### **Template Engine Integration**
```typescript
// Bridge to existing template engine
async executeTriage(intent: string, namespace?: string): Promise<TriageEnvelope> {
  // 1. Intent → Template Mapping
  const template = this.mapIntentToTemplate(intent, namespace);
  
  // 2. Execute via existing template engine
  const result = await this.templateEngine.execute({
    template: template.id,
    triageTarget: intent,  // Bridge to current implementation
    namespace,
    bounded: true,
    stepBudget: 3
  });
  
  // 3. Transform to triage envelope
  return this.buildTriageEnvelope(result, template);
}
```

### **Tool Registry Integration**
- Register as `oc_diagnostic_triage` in diagnostic category
- Follows existing tool naming conventions
- Integrates with current ToolSuite pattern
- Maintains compatibility with existing tool discovery

---

## Success Criteria

### **Technical Validation**
- [ ] **Natural Interaction**: `"Quick triage PVC binding in student03"` yields deterministic summary
- [ ] **Performance**: Completion < 15 seconds with stepBudget ≤ 3
- [ ] **Evidence Quality**: Completeness ≥ 0.8 for all supported intents
- [ ] **Safety**: No cluster mutations; all suggested actions classified
- [ ] **Non-regression**: Existing tools behave identically when triage not invoked

### **Usability Validation**
- [ ] **LM Studio Integration**: Can call `oc_triage` naturally from LLM interactions
- [ ] **Human Operator Adoption**: Clear value proposition for bounded investigation
- [ ] **Envelope Utility**: promptSuggestions enable effective LLM continuation workflows
- [ ] **Action Clarity**: nextActions provide clear human CLI paths with safety guidance

### **Strategic Alignment**
- [ ] **ADR Compliance**: Maintains path to full dictionary architecture
- [ ] **Template Invisibility**: Templates remain internal implementation detail
- [ ] **Expert Workflow Preservation**: Power users can still access full diagnostic toolkit
- [ ] **Enterprise Readiness**: Demonstrates controlled, auditable triage capabilities

---

## Risk Assessment & Mitigation

### **Technical Risks (CODEX Identified)**
**1. Intent Misclassification**
- **Risk**: Wrong template selection due to ambiguous intent
- **Mitigation**: Keep dictionary tiny and explicit (3 intents Phase 1); log routing decisions

**2. Performance Impact**
- **Risk**: Triage operations affecting existing tool performance
- **Mitigation**: Enforce tight bounds (stepBudget≤3, 20s timeout); parallel shadow mode

**3. Template Integration**
- **Risk**: Breaking existing template engine functionality
- **Mitigation**: Use existing triageTarget mechanism; comprehensive E2E testing

### **Business Risks**
**1. User Confusion**
- **Risk**: Mixed mental models between triage and diagnostic tools
- **Mitigation**: Clear tool descriptions; consistent envelope format

**2. Over-reliance on Bounded Mode**
- **Risk**: Users avoiding deliberate multi-step investigation
- **Mitigation**: Preserve existing tools unchanged; clear guidance on usage patterns

---

## Future Evolution Path

### **Dictionary Architecture Migration**
```typescript
// Current (Phase 1): Static intent mapping
const intentMap = {
  "pvc-binding": "pvc-binding-template"
};

// Target (Future): Dictionary-driven routing
const entryDictionary = await this.dictionaryEngine.resolve(naturalLanguageInput);
const domainDictionary = await this.domainRouter.route(entryDictionary.canonical);
const template = await this.templateEngine.select(domainDictionary.templateHints);
```

### **Integration with Future Features**
- **F-006 Input Normalization**: Replace static intent mapping with dictionary routing
- **F-009 RCA Framework**: Enhanced pattern recognition for intent classification
- **F-002 Operational Intelligence**: Real-time feedback integration for continuous improvement

---

## Dependencies & Sequencing

### **Prerequisites (Already Met)**
- ✅ **ADR-014**: Template Engine operational (1.0 evidence completeness)
- ✅ **Tool Registry**: DiagnosticToolsV2 functional and extensible
- ✅ **BoundaryEnforcer**: Safety mechanisms validated and operational
- ✅ **CODEX Validation**: Complete technical assessment and implementation guidance

### **Dependency Relationships**
```yaml
F-010: depends_on: [ADR-014, Tool Registry, BoundaryEnforcer]  # All prerequisites met
F-006: enhanced_by: [F-010]  # Input normalization can replace static intent mapping
F-009: enhanced_by: [F-010]  # RCA framework can improve intent classification
F-002: enhanced_by: [F-010]  # Operational intelligence benefits from natural entry point
```

### **Implementation Sequence**
1. **F-010 Phase 0**: Immediate implementation (1-2 days)
2. **F-010 Phase 1**: Production enablement (2-3 days)  
3. **F-010 Phase 2**: Enhanced intent support (3-4 days)
4. **F-010 Phase 3**: Observability & monitoring (2-3 days)

**Total Epic Effort**: 8-12 days with immediate Phase 0 value

---

## References

### **Implementation Guidance**
- **ADR-023**: `/docs/architecture/ADR-023-oc-triage-entry-tool.md` (Complete specification)
- **CODEX Assessment**: `./codex-docs/adr-023-assessment/` (Technical validation and implementation plan)
- **Template Engine**: `src/lib/templates/template-engine.ts` (Integration target)
- **Tool Registry**: `src/lib/tools/tool-registry.ts` (Registration pattern)
 - **LLM Policy**: `/docs/llm/policy.md`
 - **LLM Prompts**: `/docs/llm/prompts.md`
 - **PVC Playbook**: `/docs/llm/playbooks/pvc-triage.md`

### **Related Features**
- **F-001**: Core Platform Foundation (dependency - template engine stability)
- **F-006**: Input Normalization (future enhancement - dictionary routing)
- **F-009**: RCA Framework (future enhancement - pattern recognition)
- **F-002**: Operational Intelligence (future integration - natural entry point)

---

**Epic Summary**: F-010 provides immediate natural interaction capabilities with the operational template engine while maintaining clear evolution path to advanced dictionary architecture. CODEX-validated implementation plan with phased approach minimizes risk while delivering immediate value.

**Ready for Sprint Selection**: Phase 0 spike can begin immediately with 1-2 day delivery timeline.

---

**Last Updated**: September 08, 2025  
**Epic Status**: Ready for immediate Phase 0 implementation  
**Next Review**: After Phase 0 completion and usage validation
