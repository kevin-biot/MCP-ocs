# CODEX TECHNICAL INTEGRATION CLARIFICATIONS - F-010-01 Phase 0

## 1. TOOL REGISTRY - DiagnosticToolsV2

**✅ CONFIRMED PATH**: `src/tools/diagnostics/index.ts`  
**✅ CLASS**: `DiagnosticToolsV2` (already exists)  
**✅ INTEGRATION POINT**: Add to existing `getTools()` method in the tools array

```typescript
// Add to existing getTools() method in DiagnosticToolsV2 class:
{
  name: "oc_triage",
  fullName: "oc_diagnostic_triage", 
  description: "Bounded triage entry point with natural intent routing",
  maturity: "experimental",
  inputSchema: TriageInputSchema,
  execute: this.executeOcTriage.bind(this)
}
```

## 2. TEMPLATE ENGINE - Confirmed Integration

**✅ IMPORT PATH**: `import { TemplateEngine } from '../../lib/templates/template-engine.js'`  
**✅ API CONFIRMED**: 
```typescript
// Template engine is NOT directly accessible in DiagnosticToolsV2
// INSTEAD: Use existing pattern - call template execution via internal methods
// Templates are loaded from src/lib/templates/templates/ directory
```

**✅ TEMPLATE IDs CONFIRMED (EXACT MATCH)**:
- `pvc-binding-v1` (file: `pvc-binding.json`)  
- `scheduling-failures-v1` (file: `scheduling-failures.json`)
- `ingress-pending-v1` (file: `ingress-pending.json`)

**✅ INTEGRATION APPROACH**: 
```typescript
// Follow existing DiagnosticToolsV2 pattern - don't call template engine directly
// Instead, create method that loads and executes template following existing pattern
private async executeTriageTemplate(templateId: string, params: any) {
  // Load template from templates directory
  // Execute following existing DiagnosticToolsV2 execution pattern
}
```

## 3. ERROR TYPES AND TYPES STRUCTURE

**✅ ERROR TYPES PATH**: `src/lib/errors/error-types.ts`  
**✅ EXISTING ERRORS TO USE**:
```typescript
import { ValidationError, TimeoutError, AppError } from '../../lib/errors/error-types.js';

// CREATE NEW: TriageExecutionError extends AppError
export class TriageExecutionError extends AppError {
  constructor(message: string, options: ErrorOptions = {}) {
    super('ToolExecutionError', message, { ...options, statusCode: options.statusCode ?? 500 });
  }
}
```

**✅ TYPES LOCATION**: **CREATE** `src/types/triage.ts` for TriageEnvelope and TriageInput

## 4. BOUNDARYENFORCER INTEGRATION  

**✅ IMPORT PATH**: `import { BoundaryEnforcer } from '../../lib/enforcement/boundary-enforcer.js'`  
**✅ INTEGRATION**: BoundaryEnforcer is already integrated in DiagnosticToolsV2 - your oc_triage will inherit existing safety

## 5. EVIDENCE COMPLETENESS PATTERN

**✅ ADAPTATION REQUIRED**: The DEVELOPER-GUARDRAILS.md pattern needs adaptation for template results  
**✅ STRUCTURE**: Template results have `.evidence` property, adapt the calculation accordingly  
**✅ APPROACH**: Use the calculation logic but adjust for actual template result structure

## 6. DEFAULT NAMESPACE HANDLING

**✅ PHASE 0 DECISION**: **REQUIRE** namespace parameter - do not provide default  
**✅ RATIONALE**: Phase 0 is bounded scope, explicit namespace improves safety

```typescript
const TriageInputSchema = z.object({
  intent: z.enum(['pvc-binding', 'scheduling-failures', 'ingress-pending']),
  namespace: z.string().min(1, 'Namespace is required for Phase 0')
});
```

## 7. TESTS AND RUNNER

**✅ TEST FRAMEWORK**: Jest with TypeScript  
**✅ EXISTING MOCKS**: Available in DiagnosticToolsV2 tests  
**✅ PATTERN**: Follow existing test patterns in `tests/` directory

## 8. CRC E2E APPROACH

**✅ APPROACH**: Create tests locally, I will run against CRC cluster  
**✅ NETWORK**: Skip `git pull` for now, work locally  
**✅ BRANCH**: Create feature branch locally: `feature/f-010-phase-0-oc-triage-entry`

## 9. LOGGING FILES - START IMMEDIATELY

**✅ CREATE NOW**: All logging files and start with Phase A timestamp  
**✅ FILES TO CREATE**:
```bash
sprint-management/active-tasks/f-010-01-phase-0-spike/execution-log-developer.md
sprint-management/active-tasks/f-010-01-phase-0-spike/task-status-2025-09-09.md  
sprint-management/active-tasks/f-010-01-phase-0-spike/task-changelog-2025-09-09.md
```

## 10. STEP BUDGET - DOCUMENTATION ONLY

**✅ IMPLEMENTATION**: Document in `TriageEnvelope.routing.stepBudget = 3`  
**✅ ENFORCEMENT**: BoundaryEnforcer already handles step limiting - you inherit this via existing DiagnosticToolsV2 patterns

---

## INTEGRATION SUMMARY

**Primary Integration Pattern**: Follow existing DiagnosticToolsV2 methods, do NOT call template engine directly  
**Safety**: Inherit existing BoundaryEnforcer integration automatically  
**Templates**: Load from JSON files in templates directory following existing patterns  
**Testing**: Create local tests, follow existing DiagnosticToolsV2 test structure  
**Process**: Start logging files immediately with Phase A timestamp

## PROCEED WITH IMPLEMENTATION

✅ **All clarifications provided**  
✅ **Technical integration points confirmed**  
✅ **Process v3.3.1 compliance maintained**  
✅ **Ready for systematic implementation**

**BEGIN PHASE A: TOOL REGISTRATION**