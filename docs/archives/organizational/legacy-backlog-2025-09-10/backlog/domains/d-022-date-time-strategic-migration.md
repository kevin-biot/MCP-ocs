# D-022: Date-Time Safety Strategic Migration

**Status**: Planned  
**Priority**: P3 - LOW  
**Estimated Effort**: 4-6 hours  
**Prerequisites**: D-009 complete  

## Background
D-009 successfully eliminated critical date-time safety issues with ESLint enforcement in tools paths. Strategic migration opportunities remain for broader codebase standardization.

## Scope
**Current State**: 23 ESLint warnings for Date.now() usage outside enforced tool paths
**Target**: Systematic migration to nowEpoch()/nowIso() utility functions

## Strategic Migration Plan

### Phase 1: High-Impact Areas (2-3 hours)
- CLI utilities with timestamp output
- Frequently used helper functions
- Public API timestamp generation

### Phase 2: Remaining Areas (2-3 hours)  
- Test utilities and mock timestamps
- Low-frequency internal utilities
- Documentation timestamp examples

## Success Criteria
- ESLint warnings reduced from 23 to <5
- All timestamp generation uses utility functions
- Consistent timezone strategy across entire codebase

## Implementation Notes
- **Do not rush**: Migrate during normal development cycles
- **Maintain compatibility**: Ensure no breaking changes
- **Test coverage**: Verify utility function behavior
- **Documentation**: Update coding standards

## Related Work
- Builds on D-009 systematic date-time safety elimination
- Complements ESLint enforcement infrastructure
- Prepares foundation for advanced timezone features

---
**Created**: 2025-09-06 from D-009 enhancement recommendations  
**Context**: Strategic follow-up to systematic date-time safety resolution