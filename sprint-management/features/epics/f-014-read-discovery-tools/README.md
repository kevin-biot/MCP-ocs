# f-014: Read/Discovery Tools (Deterministic Namespace Handling)

## Overview

**Type**: Epic - Feature  
**Priority**: P1 - Critical  
**Complexity**: Medium  
**Sprint Target**: 5-8 story points (Week 1)  
**GitHub Issue**: TBD - Deterministic Namespace Discovery  

## Summary

Implement deterministic namespace discovery and cluster-wide resource enumeration to eliminate LLM "namespace guessing" behavior. Provides scalable, filtered access to cluster resources with pagination support for large-scale environments.

## Dependencies

**Prerequisites**:
- f-013: Platform Contracts (requires Target/Budget schemas)
- Existing read-ops tooling foundation

**Enables**:
- f-015: Diagnostics Upgrades (provides namespace candidates)
- f-017: Orchestration Efficiency (provides discovery foundation)

## Technical Scope

### New Tools

**1. oc_read_list_namespaces**
```typescript
Input: {
  sessionId: string
  filters?: {
    labelSelector?: string    // e.g., "environment=production"
    regex?: string           // e.g., ".*-system$"
    exclude?: string[]       // e.g., ["kube-system", "kube-public"]
  }
  pagination?: {
    limit?: number           // default 100, max 500
    continueToken?: string   // for >10k namespace clusters
  }
  target?: Target            // scope: "cluster", selector: "system"|"user"|"all"
}

Output: ResultEnvelope<{
  namespaces: Array<{
    name: string
    labels: Record<string, string>
    status: "Active" | "Terminating"
    createdAt: string
  }>
  pagination: {
    continueToken?: string
    hasMore: boolean
    totalCount?: number      // if available from server
  }
}>
```

**2. Enhanced Read Tools (Target Support)**
- `oc_read_pods`: Accept `target` parameter for multi-namespace queries
- `oc_read_pvcs`: Accept `target` parameter with Budget enforcement  
- `oc_read_services`: Accept `target` parameter for cluster-wide discovery

### Enhanced Tools

**oc_diagnostic_cluster_health Signals**
```typescript
// Add to existing cluster_health output
signals: {
  pvcIssues: {
    namespaces: string[]     // Namespaces with PVC problems
    totalAffected: number    // Count of problematic PVCs
    criticalNamespaces: string[]  // High-priority namespace candidates
  }
  resourcePressure: {
    namespaces: string[]     // Namespaces with resource constraints
    memoryPressure: string[] // Memory-constrained namespaces
    storagePressure: string[] // Storage-constrained namespaces
  }
}
```

Filtering precedence and defaults (aligned with f-013):
- Precedence: `names` (if provided) > `labelSelector` > `regex` > `exclude`.
- Defaults: `pagination.limit` defaults to 100; server enforces ceilings via Budget.
- Target selector `"all"` is permitted when server enforces Budget ceilings; otherwise enumerate via pagination.

## Implementation Details

### Server-Side Filtering
- **Performance**: Filter at K8s API level, not post-processing
- **Pagination**: Handle `continueToken` for clusters with >10k namespaces  
- **RBAC-Aware**: Return only namespaces user can access
- **Error Handling**: Capture per-namespace RBAC failures in `namespaceErrors`

### Target Integration
```typescript
// Example: Multi-namespace PVC listing
{
  "tool": "oc_read_pvcs",
  "input": {
    "target": {
      "scope": "namespaces", 
      "selector": {"names": ["app-prod", "app-staging"]}
    },
    "budget": {"timeMs": 30000, "namespaceLimit": 50}
  }
}
```

### Signal Quality
- **Cluster Health**: Emit specific namespace lists for PVC issues
- **Confidence Scoring**: High/medium/low confidence on namespace recommendations
- **Contextual Hints**: Include resource types and counts in signals

## Deliverables

1. **New Tools**
   - `src/tools/read-ops/list-namespaces.ts` - Namespace discovery with filters
   - Enhanced read tools with Target support integration
   - Pagination utilities for large cluster support

2. **Signal Enhancement**
   - Updated `oc_diagnostic_cluster_health` with PVC namespace signals
   - Documented signal schema with examples
   - Signal quality validation and testing

3. **Integration Layer**
   - Target-to-namespace resolution utilities
   - Budget enforcement for multi-namespace operations
   - RBAC error aggregation and reporting

4. **Testing & Validation**
   - Unit tests for all new filtering logic
   - Integration tests with mock large clusters (>1000 namespaces)
   - RBAC edge case testing

## References
- `/docs/llm/policy.md`
- `/docs/llm/prompts.md`
- `/docs/llm/playbooks/pvc-triage.md`
- `/docs/schemas/components.json`

## Acceptance Criteria

✅ **Namespace Discovery**:
- `oc_read_list_namespaces` handles >10k namespaces with pagination
- Server-side filtering by labelSelector, regex, and exclusion lists
- RBAC errors captured and reported, don't fail entire operation

✅ **Target Integration**:
- All read tools accept `target` parameter with proper validation
- Multi-namespace queries respect budget constraints
- Graceful degradation when budget exhausted

✅ **Signal Enhancement**:
- Cluster health emits `signals.pvcIssues.namespaces` with actionable lists
- Signal quality sufficient to guide LLM namespace selection
- Confidence indicators help prioritize namespace triage
 - Signals reduce downstream triage fanout by ≥60% on test fixtures

✅ **Performance Requirements**:
- Namespace listing <5s for clusters with 1000+ namespaces
- Multi-namespace queries respect budget.timeMs limits
- Pagination works seamlessly with continueToken
 - Server enforces Budget defaults/ceilings from f-013 (timeMs, concurrency, namespaceLimit)

## Success Metrics

- **Zero namespace guessing**: LLMs use discovery tools instead of "all"
- **Scalable enumeration**: Support clusters with 10k+ namespaces
- **Actionable signals**: 90%+ accuracy in PVC namespace recommendations
- **RBAC resilience**: Partial results even with fragmented permissions

## Risk Assessment

**MEDIUM RISK**: Kubernetes API performance and RBAC complexity
- **Mitigation**: Extensive pagination testing, RBAC simulation
- **Performance**: Server-side filtering and reasonable default limits
- **Fallback**: Graceful degradation with partial results

## Sprint Planning Notes

- **Week 1 Priority**: Foundation for deterministic LLM behavior
- **Parallel Work**: Can begin once f-013 Platform Contracts delivers Target schema
- **Testing Focus**: Large cluster simulation and RBAC edge cases
- **Integration**: Coordinates with existing read-ops architecture

---

*Created: 2025-09-12*  
*Status: Ready for Sprint Planning*  
*Previous: f-013 (Platform Contracts)*  
*Next: f-015 (Diagnostics Upgrades)*
