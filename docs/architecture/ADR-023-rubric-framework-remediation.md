# ADR-023: Rubric Framework Architecture Remediation

**Status:** Accepted  
**Date:** September 4, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)  
**Type:** REMEDIATION (Technical Debt Elimination)

## Context

### The Fragmentation Crisis

During the comprehensive rubrics/guardrails assessment conducted September 2025, critical architectural fragmentation was identified that threatens the viability of MCP-ocs as a reusable framework. While individual rubric components demonstrate excellent design, the overall system suffers from **systematic integration debt** that will compound exponentially if not addressed.

### Current State Analysis

**Rubric Implementation Status:**
- **Core Universal Rubrics:** Well-designed (triage-priority.v1, evidence-confidence.v1, remediation-safety.v1) but inconsistently applied
- **Template Integration:** Ad-hoc coupling with 21% coverage (3/14 tools)
- **Registry System:** Designed but not implemented (`rubric-registry.ts` planned)
- **Versioning:** Basic `.v1` naming without evolution framework
- **Golden Testing:** Excellent deterministic validation system in place

**Technical Debt Evidence:**
```typescript
// Current fragmented pattern (inconsistent across templates)
const rubrics = evaluateRubrics({
  triage: TRIAGE_PRIORITY_V1,
  confidence: EVIDENCE_CONFIDENCE_V1, 
  safety: REMEDIATION_SAFETY_V1
}, inputs); // Different evaluation patterns per template
```

**Impact Without Remediation:**
- Each new template requires custom rubric integration
- Framework extraction becomes impossible due to coupling variance
- Debugging becomes exponentially complex as templates diverge
- Audit trail consistency cannot be guaranteed across system

### Strategic Risk Assessment

**Path A: Continue Current Approach** 🚨
```
New Template → Custom Rubric Logic → Exponential Complexity
├── Framework extraction blocked by inconsistent patterns
├── Debugging nightmare (each template behaves differently)
├── Audit trail inconsistencies across system
└── Technical debt compounds with each addition
```

**Path B: Remediation First** ✅
```
Registry + Versioning + Coverage → Consistent Framework → Easy Extensions
├── Framework extraction ready
├── Predictable debugging (all templates use same patterns)
├── Consistent audit trails system-wide
└── Linear complexity scaling
```

## Decision

**We will implement a comprehensive Rubric Framework Remediation before adding any new template-specific rubrics or diagnostic capabilities.**

### Remediation Scope

**PHASE 1: Registry Infrastructure (Critical)**
- Implement centralized rubric registry with standardized evaluation interface
- Create RubricEvaluator base class with consistent patterns
- Convert all existing templates to use registry-based evaluation
- Establish plugin architecture for rubric registration

**PHASE 2: Versioning & Evolution Framework (Essential)**
- Implement rubric versioning with migration support
- Create Rubric Design Records (RDR) process for governance
- Add compatibility matrix tracking (template ↔ rubric versions)
- Establish change management process for rubric evolution

**PHASE 3: Comprehensive Coverage Expansion (Foundation)**
- Extend core rubrics (triage/confidence/safety) to ALL 14 tools
- Implement missing `slo-impact.v1` rubric across system
- Achieve 90%+ baseline coverage before any new rubric development
- Validate cross-template consistency through golden test expansion

### Architecture Target State

**Unified Rubric Framework Interface:**
```typescript
interface RubricFramework {
  // Registry Management
  register(rubric: RubricDefinition): void;
  get(rubricId: string, version?: string): RubricDefinition;
  
  // Evaluation Engine
  evaluate<T>(rubricId: string, evidence: Evidence): RubricResult<T>;
  evaluateSet(rubricIds: string[], evidence: Evidence): RubricResultSet;
  
  // Validation & Testing
  validate(evidence: Evidence): ValidationResult;
  test(goldenSnapshot: GoldenTest): TestResult;
  
  // Evolution Management  
  migrate(fromVersion: string, toVersion: string): MigrationResult;
  getCompatibility(template: string, rubric: string): CompatibilityInfo;
}
```

**Template Integration Pattern:**
```typescript
// Target consistent pattern across ALL templates
const framework = new RubricFramework();
framework.register(triagePriorityRubric);
framework.register(evidenceConfidenceRubric); 
framework.register(remediationSafetyRubric);

const results = await framework.evaluateSet([
  'triage-priority.v1',
  'evidence-confidence.v1', 
  'remediation-safety.v1'
], evidence);
```

## Rationale

### Why Remediation Before Features

**Technical Excellence Over Feature Velocity:**
The current fragmented state creates exponential complexity growth. Each new template becomes harder to integrate and debug. By establishing consistent patterns first, all future development becomes predictable and maintainable.

**Framework Viability:**
MCP-ocs aims to become reusable IP. Fragmented rubric integration makes extraction impossible. Systematic remediation enables clean framework boundaries and commercial viability.

**Operational Reliability:**
Inconsistent rubric application across templates creates unpredictable behavior during incidents. Uniform patterns ensure reliable decision-making when it matters most.

**Audit Compliance:**
Enterprise deployment requires consistent audit trails. Ad-hoc rubric integration creates compliance gaps that are unacceptable in regulated environments.

## Implementation Strategy

### Development Freeze Policy

**IMMEDIATE FREEZE:**
- No new template development until Phase 3 completion
- No new rubric types until registry system implemented
- Exception: Critical bug fixes and security issues only

**PARALLEL DEVELOPMENT APPROACH:**
- Use existing templates as registry implementation test cases
- Improve current template consistency while building framework
- Validate registry design against real-world usage patterns

### Sprint Allocation

**Estimated Effort:**
- **Phase 1:** 2-3 sprints (Registry Infrastructure)
- **Phase 2:** 1-2 sprints (Versioning & Evolution) 
- **Phase 3:** 2-3 sprints (Coverage Expansion)
- **Total:** 5-8 sprints for complete remediation

**Resource Priority:** P0 - All development resources allocated to remediation track

### Success Metrics

**Consistency Metrics:**
- 100% of converted templates use identical rubric evaluation patterns
- ≥80% tool coverage for core rubrics (triage/confidence/safety)  
- Zero custom rubric integration code outside registry pattern

**Framework Readiness:**
- Registry supports plugin architecture for easy extension
- Versioning system handles backward compatibility automatically
- Golden test coverage validates all rubric combinations

**Quality Assurance:**
- All rubric evaluations produce identical audit trail format
- Cross-template debugging uses consistent patterns
- Framework extraction possible without refactoring

## Consequences

### Positive Consequences

**Architectural Excellence:**
- Clean, reusable framework ready for commercial deployment
- Predictable behavior patterns across all templates
- Professional-grade audit trail and compliance capabilities

**Development Velocity:**
- Future template development becomes plug-and-play
- Debugging simplified through consistent patterns
- Framework extension requires minimal effort

**Commercial Viability:**
- Clean framework extraction enables IP monetization
- Enterprise-grade consistency meets regulatory requirements
- Competitive advantage through systematic approach

### Negative Consequences

**Short-term Feature Freeze:**
- No new template capabilities during remediation period
- Development focus shifts from features to infrastructure
- Potential stakeholder impatience with "invisible" improvements

**Initial Development Overhead:**
- 5-8 sprints dedicated to remediation work
- Existing code requires refactoring for consistency
- Testing effort increased due to pattern changes

### Risk Mitigation

**Stakeholder Communication:**
- Clear ROI communication: 8 sprints investment prevents 20+ sprints future debt
- Demonstrate framework value through clean architecture examples
- Show competitive advantage of systematic approach

**Incremental Value Delivery:**
- Phase 1 immediately improves debugging experience
- Phase 2 enables confident rubric evolution
- Phase 3 provides complete system consistency

**Technical Risk Management:**
- Use existing templates to validate registry design
- Maintain current functionality throughout remediation
- Comprehensive testing prevents regression introduction

## Related ADRs

- **ADR-014: Deterministic Template Engine** - Provides template execution foundation for rubric integration
- **ADR-010: Systemic Diagnostic Intelligence** - Advanced analytics require consistent rubric framework
- **ADR-006: Modular Tool Architecture** - Tool boundaries align with rubric evaluation boundaries

## Backlog Impact Analysis

### Current Backlog Prioritization

**Technical Debt Backlog:** D-001 through D-015 (33% complete, 72 tasks remaining)
**Feature Backlog:** F-001 through F-005 (template expansions and capabilities)

**Remediation Classification:** This is NOT a feature addition - it is **critical technical debt remediation** that prevents framework viability.

**Priority Override:** Rubric Framework Remediation takes precedence over remaining D-domain items due to:
- **Architectural Impact:** Affects all future development
- **Framework Viability:** Blocks commercial extraction
- **Compound Interest:** Debt grows exponentially without remediation

### Backlog Reordering

**NEW P0 TRACK: Rubric Framework Remediation**
```yaml
Priority: P0 - BLOCKING (Above all other work)
Domains: RFR-001, RFR-002, RFR-003 (New domain classification)
Rationale: Foundation for all future development
```

**EXISTING P0 ITEMS: Maintain Priority**  
```yaml  
D-001 through D-006: COMPLETED ✅
D-010, D-012, D-014: Maintain P1 status (after RFR completion)
```

**FEATURE BACKLOG: SUSPENDED**
```yaml
F-001 through F-005: BLOCKED until RFR completion
Rationale: Prevents exponential complexity growth
```

## Implementation Phases

### RFR-001: Registry Infrastructure (2-3 sprints)
**MVP Deliverables (Thin Registry First):**
- `src/lib/rubrics/rubric-registry.ts` - Minimal registry (register, evaluate, list)
- `src/lib/rubrics/RubricEvaluator.ts` - Standardized evaluation engine
- Convert 4-6 existing templates to registry pattern
- **Visible Progress:** Registry demo + template conversion dashboard

**Success Criteria:** All converted templates use identical evaluation patterns

### RFR-002: Versioning & Evolution (1-2 sprints)  
**Lightweight Deliverables:**
- `docs/rubrics/CHANGELOG.md` - Simple markdown change tracking
- RDR markdown template for rubric design decisions
- Basic version compatibility validation (not full migration framework)
- **Visible Progress:** Version tracking dashboard + change history

**Success Criteria:** All rubric changes have documented rationale and compatibility info

### RFR-003: Coverage Expansion (2-3 sprints)
**Realistic Deliverables:**  
- Core rubrics extended to achieve ≥80% coverage across current templates
- `slo-impact.v1` rubric implementation and integration
- Golden test coverage for all converted templates
- **Visible Progress:** Coverage metrics dashboard + consistency validation report

**Success Criteria:** ≥80% tool coverage, consistent audit trails across all covered templates

## Conclusion

The Rubric Framework Remediation represents a critical architectural investment that transforms MCP-ocs from a working prototype into a professional, reusable platform. While requiring 5-8 sprints of focused effort, this remediation prevents exponential technical debt accumulation and enables all future development to proceed predictably.

**The fundamental choice:** Invest 8 sprints now in systematic remediation, or spend 20+ sprints later refactoring fragmented, inconsistent patterns while fighting architectural debt.

This ADR establishes the technical debt remediation track as the highest development priority, ensuring MCP-ocs achieves its potential as valuable, reusable IP rather than becoming an unmaintainable prototype.

---

**Implementation Status:** Approved - Sprint Planning Proceeds from This ADR  
**Next Steps:** Create RFR-001, RFR-002, RFR-003 domain breakdown for sprint planning  
**Framework Authority:** This remediation is foundation for all subsequent development
