# f-013: Platform Contracts (Behavioral Systematization)

## Overview

**Type**: Epic - Maintenance  
**Priority**: P1 - Critical  
**Complexity**: Low  
**Sprint Target**: 3-5 story points (Week 1)  
**GitHub Issue**: TBD - Behavioral Systematization Foundation  

## Summary

Establish shared Target, Budget, and ResultEnvelope components to eliminate LLM schema guessing and enable deterministic, bounded execution across all diagnostic tools. This epic provides the architectural foundation for systematic LLM behavior control.

## Dependencies

**Prerequisites**:
- P0 reliability fixes complete (session ID, execution cap, placeholder validation)
- Beta branch stable with existing tool architecture

**Enables**:
- f-014: Read/Discovery Tools (requires Target/Budget components)
- f-015: Diagnostics Upgrades (requires ResultEnvelope)
- f-016: LLM Policy & Prompts (requires shared semantics)

## Technical Scope

### Core Components

**Target Schema**:
```typescript
Target: {
  scope: "cluster" | "namespaces"
  selector: "all" | "system" | "user" | {
    names?: string[]
    labelSelector?: string
    regex?: string
    sample?: {size: number, seed?: string}
  }
}
```

**Budget Schema**:
```typescript
Budget: {
  timeMs: number
  namespaceLimit?: number
  concurrency?: number
}
```

**ResultEnvelope Schema**:
```typescript
ResultEnvelope<T> = {
  data: T
  metadata: {
    partial: boolean
    exhaustedBudget: boolean
    namespaceErrors: Array<{namespace: string, error: string}>
    signals: Record<string, any>
    summary: string
    executionTimeMs: number
  }
}
```

### Recommended Defaults and Ceilings

These defaults and ceilings are referenced by dependent epics (f-014, f-015, f-017) and must be documented and enforced server-side where applicable.

```yaml
Budget:
  defaults:
    timeMs: 60000        # 60s default per end-to-end flow
    concurrency: 6       # bounded parallelism; tune by environment
    namespaceLimit: 200  # cap fanout on large clusters
  ceilings:
    concurrency: 10      # hard server-side maximum
    namespaceLimit: 500  # hard server-side maximum
  cancelPolicy:
    cancelOnUsage: 0.70  # cancel remaining fanout when 70% time consumed
    cancelOnSufficiency: true  # cancel when enough high-confidence signals found

ResultEnvelope:
  invariants:
    - metadata.partial is true if any limit/ceiling prevented full execution
    - metadata.exhaustedBudget is true when timeMs was fully consumed
    - metadata.namespaceErrors aggregates per-namespace RBAC/timeouts
  examples:
    - partial: true, exhaustedBudget: false  # hit namespaceLimit, not time
    - partial: true, exhaustedBudget: true   # hit timeMs before completion
```

### Capability Discovery (mcp_capabilities)

All tools expose self-describing capabilities to guide LLM planning and client queues.

```json
{
  "tool": "mcp_capabilities",
  "returns": {
    "name": "oc_diagnostic_triage",
    "supportsTarget": true,
    "maxConcurrency": 10,
    "rateLimits": { "perMinute": 120 },
    "hints": { "expectedLatencyMs": 2000, "scalesWithNamespaces": true }
  }
}
```

### Deliverables

1. **Shared Component Library**
   - `src/lib/shared/target.ts` - Target schema and validation
   - `src/lib/shared/budget.ts` - Budget schema and enforcement
   - `src/lib/shared/result-envelope.ts` - Envelope wrapper utilities

2. **Capability Discovery**
   - `mcp_capabilities` tool for runtime schema discovery
   - Per-tool metadata: `supportsTarget`, `maxConcurrency`, `rateLimits`

3. **Documentation**
   - Session/budget/scope semantic documentation
   - JSON Schema definitions with examples
   - Integration patterns for existing tools
   - See also:
     - `/docs/llm/policy.md`
     - `/docs/llm/prompts.md`
     - `/docs/llm/playbooks/pvc-triage.md`
     - `/docs/schemas/components.json`

## Acceptance Criteria

✅ **Shared Components Created**:
- Target, Budget, ResultEnvelope schemas defined and validated
- TypeScript types exported from shared library
- Jest unit tests with 100% coverage

✅ **Capability Discovery**:
- `mcp_capabilities` tool returns accurate metadata per tool
- Schema documentation accessible at runtime
- Version compatibility checks included

✅ **Defaults & Ceilings Documented**:
- Budget defaults and ceilings published and enforced
- Cancel policy (70% time, sufficiency-of-signals) documented
- ResultEnvelope invariants and examples included in docs

✅ **Integration Ready**:
- Existing tools can import shared components
- No breaking changes to current API contracts
- Migration path documented for tool upgrades

✅ **Documentation Complete**:
- Session/budget semantics clearly defined
- Example calls provided for each component
- Integration patterns documented with code samples

## Success Metrics

- **Zero schema guessing**: LLMs can query capabilities before tool use
- **Consistent behavior**: All tools use identical Target/Budget patterns
- **Bounded execution**: Budget enforcement prevents runaway operations
- **Graceful degradation**: Partial results always available via ResultEnvelope

## Risk Assessment

**LOW RISK**: Foundational components with clear requirements
- **Mitigation**: Extensive unit testing and backward compatibility
- **Rollback**: Components are additive, no existing functionality affected

## Sprint Planning Notes

- **Week 1 Priority**: Foundation for all other behavioral epics
- **Parallel Work**: Can run alongside f-016 (LLM Policy documentation)
- **Critical Path**: Must complete before f-014 and f-015 can begin

---

*Created: 2025-09-12*  
*Status: Ready for Sprint Planning*  
*Next: f-014 (Read/Discovery Tools)*
