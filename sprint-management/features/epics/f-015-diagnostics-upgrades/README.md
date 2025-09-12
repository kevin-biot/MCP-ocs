# f-015: Diagnostics Upgrades (Target/Budget Integration)

## Overview

**Type**: Epic - Feature  
**Priority**: P1 - Critical  
**Complexity**: High  
**Sprint Target**: 8-12 story points (Week 1-2)  
**GitHub Issue**: TBD - Diagnostics Tool Target/Budget Integration  

## Summary

Upgrade core diagnostic tools to support Target/Budget patterns with ResultEnvelope responses, enabling bounded, deterministic execution while maintaining backward compatibility. This epic transforms diagnostic tools from single-namespace to cluster-aware operations.

## Dependencies

**Prerequisites**:
- f-013: Platform Contracts (requires Target/Budget/ResultEnvelope schemas)
- f-014: Read/Discovery Tools (requires namespace enumeration capabilities)

**Enables**:
- f-017: Orchestration Efficiency (requires upgraded tool contracts)
- f-016: LLM Policy & Prompts (requires consistent tool behavior)

## Technical Scope

### Core Tool Upgrades

**1. oc_diagnostic_triage v2**
```typescript
// NEW: Support both legacy and target-based inputs
Input: {
  sessionId: string
  intent: "pvc-binding" | "image-pull" | "network" | "quota" | "general"
  
  // anyOf pattern for backward compatibility
} & (
  // Legacy single-namespace (deprecated but supported)
  { namespace: string } |
  
  // New target-based multi-namespace
  { 
    target: Target
    budget?: Budget
  }
)

Output: ResultEnvelope<{
  findings: Array<{
    namespace: string
    severity: "critical" | "warning" | "info"
    category: string
    description: string
    recommendations: string[]
    resources: Array<{type: string, name: string}>
  }>
  summary: {
    totalIssues: number
    criticalCount: number
    namespacesAnalyzed: string[]
    executionTimeMs: number
  }
}>
```

**2. oc_diagnostic_cluster_health (Budget Integration)**
```typescript
// ENHANCED: Add budget support and ensure PVC signals
Input: {
  sessionId: string
  includeNamespaceAnalysis?: boolean
  depth?: "summary" | "detailed"
  budget?: Budget  // NEW: time/namespace limits
}

Output: ResultEnvelope<{
  cluster: {
    status: "healthy" | "degraded" | "critical"
    nodeCount: number
    namespaceCount: number
  }
  signals: {
    pvcIssues: {
      namespaces: string[]           // NEW: Specific namespaces with PVC issues
      totalAffected: number
      criticalNamespaces: string[]   // High-priority candidates
      issueTypes: string[]          // ["pending", "failed-mount", "insufficient-storage"]
    }
    resourcePressure: {
      namespaces: string[]
      memoryPressure: string[]
      storagePressure: string[]
    }
    networkIssues?: {
      namespaces: string[]
      dnsFailures: string[]
      serviceConnectivity: string[]
    }
  }
  namespaceAnalysis?: Array<{      // Only if includeNamespaceAnalysis=true
    namespace: string
    status: string
    resourceUtilization: object
    criticalPods: number
  }>
}>
```

**3. oc_diagnostic_namespace_health (Target Support)**
```typescript
// ENHANCED: Accept target for multi-namespace analysis
Input: {
  sessionId: string
  target: Target                    // NEW: Multi-namespace support
  budget?: Budget
  depth?: "summary" | "detailed"
}

Output: ResultEnvelope<{
  results: Array<{
    namespace: string
    health: {
      status: "healthy" | "warning" | "critical"
      podHealth: {running: number, pending: number, failed: number}
      resourceUsage: {cpu: string, memory: string, storage: string}
      events: Array<{type: string, reason: string, count: number}>
    }
    issues: Array<{
      severity: "critical" | "warning" | "info"
      category: string
      description: string
    }>
  }>
}>
```

## Implementation Strategy

### Backward Compatibility Approach
```typescript
// Tool input validation with graceful fallback
if ('namespace' in input) {
  // Legacy single-namespace path
  return await legacyTriageLogic(input.namespace, input.intent);
} else if ('target' in input) {
  // New target-based multi-namespace path
  return await targetBasedTriage(input.target, input.budget, input.intent);
} else {
  throw new Error("Must provide either 'namespace' or 'target'");
}
```

### Budget Enforcement Pattern
```typescript
class DiagnosticBudgetManager {
  constructor(private budget: Budget) {}
  
  async executeWithBudget<T>(
    namespaces: string[],
    operation: (ns: string) => Promise<T>
  ): Promise<ResultEnvelope<T[]>> {
    const results: T[] = [];
    const namespaceErrors: Array<{namespace: string, error: string}> = [];
    const startTime = Date.now();
    
    // Apply namespace limit
    const targetNamespaces = this.budget.namespaceLimit 
      ? namespaces.slice(0, this.budget.namespaceLimit)
      : namespaces;
    
    // Execute with concurrency and time limits
    for (const ns of targetNamespaces) {
      if (Date.now() - startTime > this.budget.timeMs) {
        return {
          data: results,
          metadata: {
            partial: true,
            exhaustedBudget: true,
            namespaceErrors,
            summary: `Budget exhausted after ${results.length}/${targetNamespaces.length} namespaces`,
            executionTimeMs: Date.now() - startTime
          }
        };
      }
      
      try {
        const result = await operation(ns);
        results.push(result);
      } catch (error) {
        namespaceErrors.push({
          namespace: ns,
          error: error.message
        });
      }
    }
    
    return {
      data: results,
      metadata: {
        partial: namespaces.length > targetNamespaces.length,
        exhaustedBudget: false,
        namespaceErrors,
        summary: `Analyzed ${results.length} namespaces successfully`,
        executionTimeMs: Date.now() - startTime
      }
    };
  }
}
```

## Deliverables

1. **Tool Upgrades**
   - `src/tools/diagnostic/triage-v2.ts` - Target/budget support with legacy fallback
   - Enhanced `cluster-health.ts` with budget and improved PVC signals
   - Enhanced `namespace-health.ts` with multi-namespace target support

2. **Budget Infrastructure**
   - `src/lib/diagnostics/budget-manager.ts` - Shared budget enforcement
   - `src/lib/diagnostics/result-envelope.ts` - Consistent response wrapping
   - `src/lib/diagnostics/target-resolver.ts` - Target to namespace resolution

3. **Migration Support**
   - Legacy input validation with deprecation warnings
   - Backward compatibility test suite
   - Migration guide for existing LLM prompts

4. **Enhanced Signals**
   - Improved PVC issue detection with specific namespace targeting
   - Resource pressure signals with actionable namespace lists
   - Network issue detection with DNS/connectivity specifics

## References
- `/docs/llm/policy.md`
- `/docs/llm/prompts.md`
- `/docs/llm/playbooks/pvc-triage.md`
- `/docs/schemas/components.json`

## Acceptance Criteria

✅ **Target/Budget Support**:
- All diagnostic tools accept `target` parameter with proper namespace resolution
- Budget enforcement prevents runaway execution on large clusters
- ResultEnvelope provides consistent partial result handling

✅ **Backward Compatibility**:
- Legacy `namespace` parameter continues to work without changes
- Existing LLM prompts require no immediate updates
- Deprecation warnings guide toward new patterns

✅ **Signal Quality**:
- Cluster health provides actionable PVC namespace recommendations
- Signal confidence scores help prioritize triage efforts
- Multi-namespace results aggregated meaningfully

✅ **Performance Requirements**:
- Target-based triage completes within budget.timeMs constraints
- Concurrent namespace analysis respects budget.concurrency limits
- Partial results always available when budget exhausted

✅ **Error Handling**:
- RBAC failures isolated to specific namespaces, don't fail entire operation
- Timeout/budget exhaustion returns partial results with clear indicators
- Network/API failures captured in namespaceErrors with context

## Success Metrics

- **Deterministic execution**: Budget constraints prevent timeouts/overruns
- **Scalable analysis**: Support clusters with 100+ namespaces efficiently  
- **Actionable signals**: 85%+ accuracy in PVC namespace recommendations
- **Backward compatibility**: Zero breaking changes for existing usage

## Risk Assessment

**HIGH COMPLEXITY**: Multi-namespace orchestration and backward compatibility
- **Mitigation**: Extensive testing with both legacy and new input patterns
- **Performance**: Budget enforcement prevents resource exhaustion
- **Quality**: Signal accuracy validation with real cluster scenarios
- **Compatibility**: Parallel legacy/new code paths with feature flags

## Sprint Planning Notes

- **Week 1-2 Delivery**: Core capability for behavioral systematization
- **Testing Priority**: Backward compatibility and budget enforcement
- **Integration**: Works with f-014 namespace discovery and f-013 schemas  
- **Documentation**: Migration guide and new usage patterns

---

*Created: 2025-09-12*  
*Status: Ready for Sprint Planning*  
*Previous: f-014 (Read/Discovery Tools)*  
*Next: f-016 (LLM Policy & Prompts)*
