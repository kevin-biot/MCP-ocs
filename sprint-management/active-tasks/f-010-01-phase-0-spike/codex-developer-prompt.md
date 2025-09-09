# F-010-01 PHASE 0 SPIKE COMPLETE EXECUTION PROMPT - Process v3.3.1

## CODEX SYSTEMATIC EXECUTION - Process v3.3.1 FEATURE DEVELOPMENT FRAMEWORK
**MANDATORY CHECKLIST COMPLETION REQUIRED BEFORE EXECUTION**
**SYSTEMATIC TIMING CAPTURE THROUGHOUT ALL PHASES**

---

## ROLE: DEVELOPER (FEATURE IMPLEMENTER) - Process v3.3.1 Enhanced Framework

**WORKING DIRECTORY**: /Users/kevinbrown/MCP-ocs

**SPRINT CONTEXT**:
- **Sprint**: F-010-01 Phase 0 Spike (oc_triage Entry Tool)
- **Epic**: F-010: oc_triage Entry Tool (ADR-023)
- **Priority**: P1 CRITICAL (Natural Interaction Enabler)
- **Framework**: Process v3.3.1 Feature Development + Architectural Implementation
- **Implementation Base**: CODEX-validated technical specification with all dependencies met

---

## GIT BRANCH DIRECTIVE - EXPLICIT COMMANDS:
```bash
cd /Users/kevinbrown/MCP-ocs
git status
git branch
# Create feature branch for F-010 Phase 0 if needed
git checkout -b feature/f-010-phase-0-oc-triage-entry || git checkout feature/f-010-phase-0-oc-triage-entry
git pull origin main
```

---

## SPRINT GOAL & SUCCESS CRITERIA

### **PRIMARY DELIVERABLE**:
Implement working `oc_triage` natural entry point tool with 3 basic intents, integrated with existing template engine, validated on CRC cluster.

### **SUCCESS CRITERIA CHECKLIST**:
```typescript
// MANDATORY VALIDATION - ALL MUST PASS
✅ oc_triage tool registered in DiagnosticToolsV2 category='diagnostic'
✅ 3 intents operational: 'pvc-binding', 'scheduling-failures', 'ingress-pending'  
✅ Template engine integration via triageTarget bridge mechanism
✅ CRC E2E testing: performance <15s, evidence completeness ≥0.8
✅ BoundaryEnforcer safety validation with read-only operations
✅ Natural interaction test: oc_triage({intent: "pvc-binding", namespace: "student03"})
✅ TriageEnvelope schema properly structured with routing/rubrics/evidence
```

---

## TECHNICAL IMPLEMENTATION SPECIFICATIONS

### **ARCHITECTURE INTEGRATION POINTS**:
- **Tool Registry**: Extend DiagnosticToolsV2 in `src/tools/diagnostics/index.ts`
- **Template Engine**: Integrate with existing engine via triageTarget parameter bridge
- **BoundaryEnforcer**: Leverage existing safety mechanisms (read-only, namespace-scoped)
- **Schema**: Implement TriageEnvelope interface for structured responses

### **PERFORMANCE REQUIREMENTS**:
```yaml
Performance Bounds (MANDATORY):
  completion_time: "< 15 seconds"
  step_budget: "≤ 3 steps"
  timeout: "20 seconds default"
  evidence_threshold: "≥ 0.8"

Safety Requirements (MANDATORY):
  read_only: true
  namespace_scoped: true  
  boundary_enforced: true
  rbac_respected: true
```

---

## PHASE A: TOOL REGISTRATION IMPLEMENTATION (Target: 30 minutes)

### **STEP A1: Locate and Examine Current Tool Registry**
```bash
# Find DiagnosticToolsV2 implementation
find src -name "*.ts" -exec grep -l "DiagnosticToolsV2" {} \;
cat src/tools/diagnostics/index.ts | head -50
```

### **STEP A2: Create oc_triage Tool Definition**
Add to DiagnosticToolsV2.getTools() array:
```typescript
{
  name: "oc_triage",
  fullName: "oc_diagnostic_triage", 
  description: "Bounded triage entry point with natural intent routing",
  maturity: "experimental",
  inputSchema: TriageInputSchema,
  execute: this.executeOcTriage.bind(this)
}
```

### **STEP A3: Implement TriageEnvelope Schema**
Create interface in appropriate types file:
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

---

## PHASE B: INTENT MAPPING IMPLEMENTATION (Target: 45 minutes)

### **STEP B1: Create Intent-to-Template Mapping**
```typescript
// Phase 0: 3 intents only
private readonly PHASE_0_INTENTS = {
  "pvc-binding": "pvc-binding-template",
  "scheduling-failures": "scheduling-failures-template", 
  "ingress-pending": "ingress-pending-template"
};

private mapIntentToTemplate(intent: string): string | null {
  return this.PHASE_0_INTENTS[intent] || null;
}
```

### **STEP B2: Implement executeOcTriage Method**
```typescript
async executeOcTriage(params: { intent: string; namespace?: string }): Promise<TriageEnvelope> {
  // 1. Intent validation and mapping
  const template = this.mapIntentToTemplate(params.intent);
  if (!template) {
    throw new Error(`Unsupported intent: ${params.intent}`);
  }
  
  // 2. Execute via existing template engine with triageTarget bridge
  const result = await this.templateEngine.execute({
    template: template,
    triageTarget: params.intent,  // Bridge to current implementation
    namespace: params.namespace,
    bounded: true,
    stepBudget: 3
  });
  
  // 3. Transform to TriageEnvelope format
  return this.buildTriageEnvelope(result, template, params.intent);
}
```

### **STEP B3: Implement TriageEnvelope Builder**
```typescript
private buildTriageEnvelope(templateResult: any, templateId: string, intent: string): TriageEnvelope {
  return {
    routing: {
      intent: intent,
      templateId: templateId,
      bounded: true,
      stepBudget: 3,
      triggerMode: "replace"
    },
    rubrics: {
      safety: this.classifySafety(templateResult),
      priority: this.determinePriority(templateResult), 
      confidence: this.assessConfidence(templateResult)
    },
    summary: templateResult.summary || "Triage analysis complete",
    evidence: {
      completeness: templateResult.evidence?.completeness || 0,
      missing: templateResult.evidence?.missing || [],
      present: templateResult.evidence?.present || []
    },
    nextActions: this.extractSafetyClassifiedActions(templateResult),
    promptSuggestions: this.generatePromptSuggestions(templateResult),
    followUpTools: templateResult.followUpTools || []
  };
}
```

---

## PHASE C: CRC CLUSTER E2E TESTING (Target: 45 minutes)

### **STEP C1: Basic Tool Registry Verification**
```bash
# Test tool appears in registry
npm test -- --testNamePattern="tool.*registry"
# Or run specific diagnostic tool tests
npm run test:integration -- tests/integration/diagnostics/
```

### **STEP C2: CRC Cluster Integration Testing**
```bash
# Test each Phase 0 intent against real cluster
tsx tests/integration/real/cluster-health-real.ts --session oc-triage-test-1 --intent pvc-binding --namespace student03
tsx tests/integration/real/cluster-health-real.ts --session oc-triage-test-2 --intent scheduling-failures --namespace student03  
tsx tests/integration/real/cluster-health-real.ts --session oc-triage-test-3 --intent ingress-pending --namespace student03
```

### **STEP C3: Performance and Evidence Validation**
Create test file: `tests/integration/oc-triage-validation.ts`
```typescript
// Validate performance bounds and evidence completeness
test('oc_triage performance validation', async () => {
  const startTime = Date.now();
  
  const result = await diagnosticToolsV2.executeOcTriage({
    intent: 'pvc-binding',
    namespace: 'student03'
  });
  
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(15000); // <15s requirement
  expect(result.evidence.completeness).toBeGreaterThanOrEqual(0.8); // ≥0.8 requirement
  expect(result.routing.stepBudget).toBeLessThanOrEqual(3); // ≤3 steps
});
```

---

## PHASE D: SAFETY INTEGRATION & DOCUMENTATION (Target: 30 minutes)

### **STEP D1: BoundaryEnforcer Integration**
Verify existing safety mechanisms apply to oc_triage:
```typescript
// Ensure BoundaryEnforcer wraps oc_triage execution
// Should inherit existing read-only, namespace-scoped, timeout protections
```

### **STEP D2: Create Natural Interaction Test**
```typescript
// Test case for LLM integration pattern
test('natural language interaction pattern', async () => {
  // This should work via oc_triage
  const naturalRequest = "Quick triage PVC binding in student03";
  
  // Maps to structured call
  const result = await diagnosticToolsV2.executeOcTriage({
    intent: "pvc-binding", 
    namespace: "student03"
  });
  
  expect(result.summary).toBeDefined();
  expect(result.promptSuggestions).toHaveLength.greaterThan(0);
});
```

### **STEP D3: Update Execution Log with Implementation Evidence**
Document in `/sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md`:
- Exact implementation approach and architectural decisions
- Performance metrics from CRC testing
- Any deviations from specification
- Issues encountered and resolution approaches

---

## SYSTEMATIC EVIDENCE COLLECTION REQUIREMENTS

### **REAL-TIME DOCUMENTATION** (Throughout Implementation):
```bash
# Update execution log with timestamp entries
echo "$(date): Phase A started - Tool registration implementation" >> sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md
echo "$(date): CRC Testing Results - [PERFORMANCE DATA]" >> sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md
```

### **PERFORMANCE METRICS CAPTURE**:
- Response times for each intent on CRC cluster
- Evidence completeness scores achieved
- Step counts consumed by template engine
- Memory usage and resource consumption

### **TECHNICAL DECISION LOG**:
- Architecture choices made during implementation
- Integration approaches selected and rationale
- Trade-offs identified and resolution decisions
- Any scope adjustments or constraint discoveries

---

## HANDOFF PACKAGE REQUIREMENTS (DEVELOPER → TESTER)

### **DELIVERABLES FOR TESTER PHASE**:
1. **Working Implementation**: oc_triage operational with all 3 intents
2. **CRC Test Results**: Performance validation evidence
3. **Implementation Documentation**: Clear explanation of approach
4. **Known Issues**: Any limitations or areas requiring validation
5. **Test Instructions**: How TESTER can independently validate functionality

### **COMPLETION CRITERIA**:
```bash
# Final validation before handoff
npm run build
npm test
git add . 
git commit -m "F-010-01 Phase 0: Complete oc_triage implementation with CRC validation"
git push origin feature/f-010-phase-0-oc-triage-entry
```

---

## MANDATORY TIMING CAPTURE

**Start Each Phase With**:
```bash
echo "$(date): [PHASE NAME] - START" >> sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md
```

**End Each Phase With**:
```bash
echo "$(date): [PHASE NAME] - COMPLETE - Duration: [X] minutes" >> sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md
```

---

## EMERGENCY ESCALATION

**If ANY step fails or scope seems impossible**:
1. **Document the blocker immediately** in execution log
2. **Estimate time impact** for resolution
3. **Flag for architect/reviewer** consultation  
4. **Do NOT proceed without resolution** - maintain Process v3.3.1 discipline

---

**PROCESS v3.3.1 DEVELOPER PHASE EXECUTION READY**

**All specifications provided. Begin implementation with systematic timing capture and evidence documentation.**

**START TIMER NOW** 🚀