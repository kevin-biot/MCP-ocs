# RFR-002: Versioning & Evolution Framework

**Status**: Ready for Implementation  
**Priority**: P0 - BLOCKING (After RFR-001 completion)  
**ADR Reference**: ADR-023 Rubric Framework Architecture Remediation  
**Review Date**: 2025-09-04  
**Tasks Created**: 6  

---

## Executive Summary

The MCP-ocs rubric system has **basic `.v1` naming** but no systematic evolution framework. Without proper versioning and change management, rubric updates become breaking changes instead of managed evolution. We need lightweight versioning infrastructure to enable confident rubric improvement.

### Key Findings
- **Basic versioning**: `.v1` suffixes exist but no evolution support
- **No change tracking**: Rubric modifications have no audit trail
- **Missing compatibility info**: Templates don't know which rubric versions work
- **Breaking change risk**: Rubric updates could break existing templates
- **No migration path**: Cannot safely upgrade rubric versions

### Impact Without Versioning
**CRITICAL**: Rubric improvements become risky, templates cannot evolve safely, no audit trail for compliance.

---

## Detailed Versioning Analysis

### Current State (Inadequate)
```typescript
// Basic naming without evolution support
const TRIAGE_PRIORITY_V1 = { id: 'triage-priority.v1' };
// No way to migrate to v2, no compatibility tracking
```

### Target State (Systematic)  
```typescript
// Version-aware registry with compatibility tracking
const registry = new RubricRegistry();
registry.register('triage-priority.v1', triagePriorityV1);
registry.register('triage-priority.v2', triagePriorityV2);

// Compatibility validation
const compatibility = registry.getCompatibility('ingress-pending-template', 'triage-priority.v2');
if (compatibility.compatible) {
  await registry.evaluate('triage-priority.v2', evidence);
}
```

---

## Epic Breakdown

### EPIC-001: Lightweight Change Tracking
**Priority**: P0 - BLOCKING | **Estimated**: 12 hours | **Dependencies**: RFR-001

#### Tasks:
- **TASK-001-A**: Create `docs/rubrics/CHANGELOG.md` with simple markdown format (3h)
- **TASK-001-B**: Design RDR (Rubric Design Record) markdown template (2h)
- **TASK-001-C**: Document existing rubric versions (triage.v1, confidence.v1, safety.v1) (4h)
- **TASK-001-D**: Create change tracking workflow for future rubric modifications (3h)

### EPIC-002: Basic Version Compatibility  
**Priority**: P0 - BLOCKING | **Estimated**: 10 hours | **Dependencies**: EPIC-001

#### Tasks:
- **TASK-002-A**: Implement version parsing and validation in registry (3h)
- **TASK-002-B**: Create compatibility checking framework (basic version comparison) (4h)
- **TASK-002-C**: Add version tracking to golden snapshots (rubricVersions field) (3h)

### EPIC-003: Version Dashboard & Visibility
**Priority**: P0 - BLOCKING | **Estimated**: 8 hours | **Dependencies**: EPIC-002

#### Tasks:  
- **TASK-003-A**: Create version tracking dashboard showing current rubric versions (4h)
- **TASK-003-B**: Build change history visualization (last 10 changes) (4h)

---

## Implementation Patterns

### Lightweight RDR Template
```markdown
# RDR-001: Triage Priority Scoring Enhancement

**Rubric**: triage-priority.v1 → v2  
**Date**: 2025-09-XX  
**Author**: [Developer]  

## Change Summary
- Enhanced blast radius calculation for multi-zone failures
- Added customer path weighting for premium customers

## Breaking Changes
- YES: Modified input schema (added `customerTier` field)

## Migration Path  
Templates using v1 must add `customerTier` to evidence collection:
```typescript
evidence.customerTier = determineCustomerTier(affectedNamespaces);
```

## Testing
- [ ] Golden snapshots updated for new scoring
- [ ] Backward compatibility validated with v1 templates
```

### Simple Compatibility Checking
```typescript
interface VersionCompatibility {
  compatible: boolean;
  reason?: string;
  migrationRequired?: boolean;
  migrationInstructions?: string;
}

function checkCompatibility(templateId: string, rubricId: string): VersionCompatibility {
  const template = getTemplate(templateId);
  const rubric = getRubric(rubricId);
  
  // Simple semantic version comparison
  if (rubric.version === template.expectedRubricVersions[rubricId]) {
    return { compatible: true };
  }
  
  return {
    compatible: false, 
    reason: `Template expects ${template.expectedRubricVersions[rubricId]}, got ${rubric.version}`,
    migrationRequired: true
  };
}
```

### CHANGELOG.md Format
```markdown
# Rubric Framework Changelog

## [Unreleased]
### Changed
- Enhanced triage-priority.v1 blast radius calculation

## [triage-priority.v1] - 2025-08-15
### Added
- Initial weighted scoring for P1/P2/P3 classification
- Blast radius, customer paths, operator degradation inputs
- Time-based escalation rules

### Breaking Changes  
- None (initial version)

## [evidence-confidence.v1] - 2025-08-15
### Added
- High/Medium/Low confidence mapping
- Evidence completeness and tool agreement factors
- Freshness-based confidence adjustment
```

---

## Versioning Strategy

### Semantic Versioning Approach
- **Major Version** (X.0): Breaking changes requiring template updates
- **Minor Version** (1.X): New features, backward compatible  
- **Patch Version** (1.1.X): Bug fixes, no interface changes

### Version Compatibility Rules
```yaml
Compatibility Rules:
  - Same major version: Always compatible
  - Different major version: Requires migration
  - Template can specify version range: ">=1.0, <2.0"
  - Registry validates compatibility before evaluation
```

### Migration Strategy (Future - Not RFR-002)
```typescript
// Planned for future (keep RFR-002 lightweight)
interface RubricMigration {
  from: string;        // "triage-priority.v1" 
  to: string;          // "triage-priority.v2"
  migrate: (oldResult: RubricResult) => RubricResult;
  evidenceChanges?: EvidenceSchemaChange[];
}
```

---

## Files Requiring Changes

### New Files (Versioning Infrastructure)
- `/docs/rubrics/CHANGELOG.md` - Central change tracking
- `/docs/rubrics/RDR-TEMPLATE.md` - Rubric Design Record template
- `/src/lib/rubrics/version-compatibility.ts` - Basic compatibility checking
- `/src/lib/rubrics/version-parser.ts` - Semantic version parsing

### Modified Files (Version Integration)
- `/src/lib/rubrics/rubric-registry.ts` - Add version validation and compatibility
- `/docs/examples/golden-templates/*.json` - Add rubricVersions tracking
- `/src/v2/templates/*.ts` - Add expected rubric version declarations

### Documentation Files
- `/docs/rubrics/RDR-001-triage-priority-v1.md` - Document existing triage rubric
- `/docs/rubrics/RDR-002-evidence-confidence-v1.md` - Document confidence rubric  
- `/docs/rubrics/RDR-003-remediation-safety-v1.md` - Document safety rubric

---

## Success Criteria

### Phase 1: Change Tracking (Sprint 1)
- [ ] CHANGELOG.md with current rubric documentation
- [ ] RDR template for future rubric decisions  
- [ ] All existing rubrics documented with RDRs
- [ ] Change tracking workflow established

### Phase 2: Basic Compatibility (Sprint 2)
- [ ] Version parsing and validation working
- [ ] Compatibility checking framework implemented
- [ ] Golden snapshots track rubric versions
- [ ] Registry validates version compatibility

### Phase 3: Version Dashboard (Sprint 2)
- [ ] Version tracking dashboard showing current state
- [ ] Change history visualization
- [ ] Version compatibility reports

### Validation Metrics
- **Documentation**: 100% of existing rubrics have RDR documentation
- **Compatibility**: Version checking prevents incompatible evaluations
- **Audit Trail**: All rubric changes tracked in CHANGELOG with rationale
- **Stability**: Version compatibility prevents breaking template changes

---

## Visible Progress Tracking

### Sprint 1 Deliverables (Stakeholder Visibility)
- **Version Dashboard**: Live view of current rubric versions and compatibility
- **Change History**: Visual timeline of rubric evolution
- **Documentation Coverage**: All existing rubrics properly documented

### Sprint 2 Deliverables
- **Compatibility Reports**: Templates show which rubric versions they support
- **Version Validation**: Registry prevents incompatible rubric usage
- **Change Process**: Documented workflow for future rubric improvements

---

## Risk Mitigation

### Technical Risks
**Risk**: Version compatibility checking adds complexity  
**Mitigation**: Keep initial compatibility simple (exact version match), enhance later

**Risk**: Change tracking overhead slows rubric development  
**Mitigation**: Lightweight RDR template, minimal required fields

**Risk**: Versioning system becomes over-engineered  
**Mitigation**: Focus on basic functionality, defer advanced migration to future phases

### Process Risks
**Risk**: Developers skip change documentation  
**Mitigation**: Integrate change tracking into development workflow, make it easy

**Risk**: Version incompatibility blocks template usage  
**Mitigation**: Clear error messages, migration guidance in compatibility checking

---

## Dependencies and Blockers

### Prerequisites  
- **RFR-001 Complete**: Registry infrastructure must exist before versioning
- **Template Conversions**: Templates must use registry before version tracking valuable

### Blocking Items
- **Rubric Improvements**: Cannot safely enhance rubrics without versioning
- **Template Evolution**: Cannot upgrade templates without compatibility tracking

### Enables (After Completion)
- **RFR-003**: Coverage Expansion (can safely extend rubrics to more tools)
- **Confident Rubric Evolution**: Safe to improve scoring algorithms
- **Template Independence**: Templates can specify version requirements

---

## Future Enhancements (Not RFR-002 Scope)

### Advanced Migration Framework
- Automatic migration functions for breaking changes
- Template auto-upgrade tooling
- Compatibility matrix management

### Enterprise Versioning Features  
- Approval workflows for rubric changes
- Rollback capabilities for rubric versions
- Multi-environment version management

---

**Domain Owner**: Architecture Team  
**Implementation Lead**: DEVELOPER (guided by ADR-023)  
**Review Required**: REVIEWER approval of versioning strategy and RDR process  
**Sprint Allocation**: 1-2 sprints (estimated 30 hours total work)  
**Business Impact**: Enables confident rubric evolution and enterprise change management
