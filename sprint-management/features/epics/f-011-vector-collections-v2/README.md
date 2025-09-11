# ENHANCEMENT-001: Vector Collections v2 + Instrumentation Middleware

## Overview

**Type**: Enhancement  
**Priority**: P1 - High  
**Complexity**: Medium  
**Sprint Target**: Single sprint (4-5 hours)  
**GitHub Issue**: [#32 - Post-fix: Vector collections v2, incident lifecycle, and enrichment rollout](https://github.com/kevin-biot/MCP-ocs/issues/32)

## Summary

Build on the MCP-OCS foundation refactor (post FIX-001 resolution) to introduce production-grade vector collections, structured incident lifecycle, and controlled AutoMemorySystem enrichment through instrumentation middleware.

## Blocked By (RESOLVED)
- ✅ **FIX-001**: Memory system crisis resolution completed
- ✅ **Foundation phases**: Protocol safety, external dependency removal, backend unification, import hardening, validation

## Dependencies

**Prerequisites**:
- MCP-OCS memory system foundation stable (sequential entry point)
- ChromaDB client available with env configuration support
- Tool gateway architecture for middleware integration

**Downstream Impact**:
- Enables incident lifecycle tooling in future sprints
- Foundation for AutoMemorySystem enrichment rollout
- Analytics capability for tool performance monitoring

## Sprint Structure - Three Phases

### Phase 1: Instrumentation + Schema v2 Foundation (2-2.5h)
**Core Deliverables**:
- v2 JSON metrics + vector metadata schema finalized
- Middleware wrapper at tool gateway (pre/post hooks, redaction, zero-stdout)
- Dual-write plumbing: JSON append + vector write with Chroma env config
- Evidence anchors (logs, artifacts 04-09)
- Pilot allowlist on 2-3 tools
- Unit tests for middleware emission + error paths

### Phase 2: Collections Isolation + Stats (2-2.5h) 
**Core Deliverables**:
- Collections isolation strategy (single collection with `kind:` filtering → Phase 1; separate collections → Phase 2)
- `memory_get_stats?detailed=true` implementation
- Incident lifecycle tool scaffolding
- Diagnostic read-ops evidence capture with dedup hash
- Expand pilot coverage

**Enhancements (added from Phase 1 evidence):**
- UnifiedMemoryAdapter.initialize(): Eager collection ensuring for `conversations/operational/tool_exec` to eliminate first-write races.
- Health Check CLI: `memory:collections:audit` to verify tenant/database/collections health before runs.
- Collection Strategy Decision: finalize separate vs unified collections based on pilot metrics and operational needs.

### Phase 3: Validation + Documentation (30-60min)
**Core Deliverables**:
- Integration testing across pilot tools
- Documentation (README updates, ADR notes)
- Performance validation within bounds
- Sprint closure report

## Technical Scope

### 1. Collections & Isolation
- **Defaults**: `CHROMA_TENANT=mcp-ocs`, `CHROMA_DATABASE=prod`, `CHROMA_COLLECTION=ocs_memory_v2` (configurable)
- **Phase 1**: Single unified collection with mandatory `kind:` tag and strict filters
- **Phase 2**: Separate collections option (`conversations/operational/tool_exec`)

### 2. Schema v2 (Unified)
**Required tags**: `kind:<conversation|operational|tool_exec>`, `domain:<...>`, `environment:<...>`  
**Optional tags**: `tool:<n>`, `suite:<n>`, `resource:<type>`, `severity:<level>`  
**IDs**: `<kind>_<sessionOrIncident>_<timestamp>`

**JSON Metrics Schema**:
```json
{
  "toolId": "string",
  "opType": "string", 
  "mode": "vector|json",
  "elapsedMs": "number",
  "errorSummary": "string|null",
  "cleanupCheck": "boolean",
  "anchors": ["array"],
  "timestamp": "ISO8601",
  "sessionId": "string"
}
```

### 3. Instrumentation Middleware
**Pattern**: `Tool Gateway → [PRE-SEARCH] → Tool Execution → [POST-CAPTURE] → Dual Write`
- Pre-search enrichment (Phase 3): topK=3, 400ms timeout
- Post-capture: Vector + JSON storage with evidence anchors
- Safety: No PII, input redaction, zero-stdout discipline

### 4. Incident Lifecycle Tools (Scaffolding)
- `memory_begin_incident`, `memory_append_evidence`, `memory_add_hypothesis`
- `memory_publish_rca`, `memory_close_incident`  
- Evidence written on tool executions with normalized fields

### 5. Pilot Allowlist
**Phase 1 Tools**:
- `oc_read_pods`
- `oc_read_nodes` 
- `cluster_health`

## Acceptance Criteria

### Phase 1 Complete When:
- ✅ Middleware emits schema-valid v2 JSON metrics and vector writes for allowlisted tools
- ✅ Evidence anchors present (logs + artifact refs); redaction applied
- ✅ Error paths covered by unit tests
- ✅ Daily snapshot appended to `08-technical-metrics-data.json`
- ✅ Readers tolerant to v1/v2 schema versions

### Phase 2 Complete When:
- ✅ Vector collections isolated by tenant/database/collection
- ✅ `memory_get_stats` returns vector totals and by-kind counts
- ✅ Incident lifecycle tools present and usable end-to-end
- ✅ Diagnostic tools emit `tool_exec` evidence with dedup

### Phase 3 Complete When:
- ✅ Integration tests pass across pilot tools
- ✅ Performance within bounds (400ms timeout, ≤1.5KB summaries)
- ✅ Documentation updated with usage examples
- ✅ Sprint closure with evidence-anchored validation

## Risk Assessment

**Risk Level**: Medium  
**Primary Risks**:
- Tool gateway integration complexity if central hook doesn't exist
- ChromaDB performance with increased write volume
- Schema migration complexity from existing memory data

**Mitigation Strategy**:
- Feature flags for safe rollback capability
- Performance bounds with hard timeouts
- Backward compatibility with v1/v2 tolerant readers
- Phased rollout starting with pilot tools only

## Success Metrics

**Quantitative**:
- All pilot tools instrumented with dual-write capability
- < 400ms overhead for enrichment operations
- 100% test coverage for middleware error paths
- Zero protocol violations (stdout discipline maintained)

**Qualitative**:
- Analytics capability demonstrates tool performance insights
- Evidence anchors provide actionable incident context
- Schema v2 enables semantic search across operational data
- Foundation ready for AutoMemorySystem enrichment rollout

## References

- **GitHub Issue**: https://github.com/kevin-biot/MCP-ocs/issues/32
- **Foundation Report**: `docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md`
- **Memory System Crisis**: FIX-001 resolution (predecessor)
- **Codex Design Input**: Instrumentation middleware + evidence anchors approach

## Implementation Notes

**Environment Configuration**:
- Default safe: enrichment opt-in via allowlist only  
- Vector pre-search: OFF in Phase 1, enabled in Phase 3
- Collections: single with `kind:` tags (Phase 1) → isolated (Phase 2)

**Safety Constraints**:
- No PII persistence
- Input redaction for stored metadata
- Zero-stdout discipline preserved
- Fallback to JSON-only if vector operations fail

## Next Actions

1. **Design Document**: Codex to create initial technical design document
2. **Tool Gateway Investigation**: Confirm middleware integration points
3. **Schema Finalization**: Complete v2 JSON + vector metadata specifications
4. **Implementation**: Begin Phase 1 with pilot tool instrumentation

---

**Created**: 2025-09-11  
**Sprint Target**: Today (4-5 hours)  
**Phase Breakdown**: 2-2.5h + 2-2.5h + 30-60min  
**Success Criteria**: Production-ready instrumentation with analytics capability and incident lifecycle foundation
