# ADR-022: Normalized Fact Model (NFM) Type System Architecture

**Status:** Accepted  
**Date:** September 02, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

ADR-021 (Natural Language Input Normalization Architecture) successfully addresses phrase normalization and dictionary-based input processing. However, for domains requiring higher semantic precision and type safety (medical, financial, complex operational scenarios), simple phrase-to-canonical mapping is insufficient.

Current architecture provides deterministic phrase normalization but lacks:
- **Semantic type system** for facts and entities
- **Constraint validation** for domain-specific business rules  
- **Relationship modeling** between entities and their attributes
- **Evidence contract enforcement** based on formal semantic requirements

### The Semantic Precision Gap

**Current Flow (ADR-021):**
```
"Check failing pods in openshift-ingress" 
→ Phrase Dictionary: {canonical: "pod_failure_check", namespace: "openshift-ingress"}
→ Template Selection: pod-failure-template.json
```

**Enhanced Flow with NFM:**
```
"Check failing pods in openshift-ingress"
→ Phrase Dictionary: canonical terms
→ NFM Parser: AST + typed facts
→ Constraint Validation: business rules + evidence requirements
→ Type-Safe Template Selection: NFM-compatible templates
```

### Domain-Specific Requirements

**OpenShift Operations (Current Need):**
- Moderate semantic precision required
- Entity relationships matter (Pod→Node, Route→Service)
- Evidence requirements flexible
- Performance over strict type safety

**Future Medical/Financial Domains:**
- High semantic precision required
- Strict constraint validation mandatory
- Evidence requirements contractual
- Type safety critical for compliance

## Decision

**We will implement a Normalized Fact Model (NFM) Type System as an optional semantic layer that can be plugged into the existing dictionary normalization architecture when domain-specific type safety and constraint validation are required.**

### Core Architectural Principles

1. **Optional Semantic Layer** - NFM operates as plugin for domains requiring type safety
2. **Separate from Dictionary System** - ADR-021 works independently, NFM enhances when needed
3. **Domain-Specific Schema Granularity** - Each vertical defines appropriate NFM precision level
4. **Cached Constraint Validation** - Performance-optimized with 500ms latency target
5. **Gradual Type Safety Adoption** - Templates can be NFM-unaware, NFM-compatible, or NFM-strict

### NFM Architecture Components

**NFM Schema Definition (Per Domain):**
```yaml
# src/nfm/schemas/openshift-v1.yml
domain: "openshift_operations"
version: "1.0.0"
precision_level: "moderate"  # moderate | high | strict

entities:
  Pod:
    attributes:
      name: { type: string, required: true }
      namespace: { type: string, required: true }
      phase: { type: enum, values: [Pending, Running, Failed, Succeeded] }
    relationships:
      scheduled_on: { target: Node, cardinality: "many:1" }
      controlled_by: { target: [Deployment, ReplicaSet], cardinality: "many:1" }
    constraints:
      - name: "failed_pods_require_termination_reason"
        rule: "phase=Failed → termination_reason must exist"
        enforcement: "soft"  # soft | hard
        
  IngressController:
    # Moderate granularity - key relationships only
    relationships:
      manages: { target: Route, cardinality: "1:many" }
    constraints:
      - name: "degraded_controller_evidence_required"
        rule: "status=Degraded → [controller_logs, pod_status] required"
        enforcement: "hard"
```

**AST Parser Integration:**
```typescript
// Query: "Check failing pods in openshift-ingress namespace"
interface OpenShiftQueryAST {
  action: "CHECK" | "ANALYZE" | "DIAGNOSE";
  target_entity: string;  // Maps to NFM entity
  filters: {
    namespace?: string;
    condition?: string;
    temporal?: TimeRange;
  };
  nfm_context?: {
    entity_type: string;    // Pod, IngressController, etc.
    constraint_checks: string[];  // Which constraints to validate
    evidence_requirements: string[];  // What evidence is required
  };
}
```

**NFM-Enhanced Template Selection:**
```typescript
interface NFMTemplate extends DiagnosticTemplate {
  nfm_requirements?: {
    required_entities: string[];           // [Pod, Node, Service]
    constraint_validations: string[];     // [pod_failure_evidence, node_capacity_check] 
    evidence_contracts: EvidenceContract; // What evidence satisfies NFM constraints
    type_safety_level: "none" | "compatible" | "strict";
  };
}
```

### Implementation Strategy: Plugin Architecture

**NFM as Optional Enhancement:**
```typescript
// Core template engine works without NFM
class TemplateEngine {
  private nfmProcessor?: NFMProcessor;
  
  constructor(options: { enableNFM?: boolean } = {}) {
    if (options.enableNFM) {
      this.nfmProcessor = new NFMProcessor();
    }
  }
  
  async selectTemplate(query: string, context: any): Promise<DiagnosticTemplate> {
    // 1. Standard dictionary normalization (ADR-021)
    const normalized = await this.normalizeInput(query, context);
    
    // 2. Optional NFM processing
    if (this.nfmProcessor && context.domain_requires_nfm) {
      const nfmFacts = await this.nfmProcessor.parseToNFM(normalized);
      const constraintResults = await this.nfmProcessor.validateConstraints(nfmFacts);
      
      // NFM-enhanced template selection
      return this.selectNFMTemplate(normalized, nfmFacts, constraintResults);
    }
    
    // 3. Standard template selection (existing)
    return this.selectStandardTemplate(normalized, context);
  }
}
```

## Rationale

### Why Separate NFM ADR from Dictionary Architecture

**Clean Separation of Concerns:**
- **ADR-021:** Solves phrase normalization and template routing (universally needed)
- **ADR-022:** Solves semantic type safety and constraint validation (domain-specific need)

**Incremental Adoption:**
- OpenShift operations work fine with ADR-021 dictionary normalization
- Medical/financial domains can add NFM when semantic precision becomes critical
- Teams can evaluate NFM value before committing to implementation complexity

**Architecture Flexibility:**
- Dictionary system (ADR-021) has broad applicability across domains
- NFM system targets specific domains requiring formal semantic contracts
- Allows different teams to adopt different levels of type safety

### Why Plugin Architecture Over Embedded NFM

**Performance Optimization:**
- Teams not needing NFM avoid validation overhead
- NFM processing only occurs when domain explicitly requires it
- Caching strategies can be domain-specific

**Complexity Management:**
- Dictionary normalization remains simple and fast
- NFM complexity contained in separate architectural layer
- Easier debugging and maintenance with clear boundaries

**Implementation Pragmatism:**
- Can implement ADR-021 first, add NFM later when needed
- Proof of concept NFM in one domain before broader rollout
- Teams can choose appropriate semantic precision for their use cases

### Domain-Specific Granularity Approach

**OpenShift Operations (Moderate Precision):**
```yaml
# Moderate NFM - key relationships only
entities:
  Pod:
    key_relationships: [Node, Controller]  # Essential for diagnostics
    constraint_level: "soft"               # Warnings, not failures
    evidence_flexibility: "high"           # Multiple evidence paths accepted
```

**Future Medical Domain (High Precision):**
```yaml
# Strict NFM - comprehensive modeling  
entities:
  Patient:
    all_relationships: [Diagnosis, Treatment, Provider, Insurance]
    constraint_level: "hard"               # Violations block execution
    evidence_flexibility: "low"            # Exact evidence requirements
```

**Future Financial Domain (Strict Precision):**
```yaml  
# Contractual NFM - regulatory compliance
entities:
  Transaction:
    audit_relationships: [Account, Customer, Regulatory_Report]
    constraint_level: "hard"               # Regulatory compliance required
    evidence_flexibility: "none"           # Exact audit trail mandatory
```

## Consequences

### Positive Consequences

**Semantic Precision Where Needed:**
- Domains requiring type safety get formal constraint validation
- Complex entity relationships properly modeled and enforced
- Evidence requirements can be contractually specified

**Architectural Flexibility:**
- Teams adopt NFM only when domain complexity justifies it
- Simple domains continue using fast dictionary normalization
- Plugin architecture allows domain-specific customization

**Implementation Pragmatism:**
- Can be implemented gradually after ADR-021 proves successful
- OpenShift operations continue working while NFM developed
- Clear upgrade path from dictionary-only to NFM-enhanced processing

**Performance Control:**
- NFM overhead only incurred when explicitly needed
- Caching strategies optimize constraint validation performance
- 500ms latency target provides acceptable user experience

### Negative Consequences

**Implementation Complexity:**
- NFM system adds significant architectural complexity
- AST parsing and constraint validation require substantial development
- Schema design and maintenance overhead for each domain

**Adoption Overhead:**
- Teams must learn NFM schema design principles
- Template authors need to understand constraint implications
- Additional testing required for NFM-enabled workflows

**Performance Impact:**
- NFM validation adds latency even with caching optimization
- Schema loading and constraint checking consume memory and CPU
- Complex constraint validation could exceed 500ms target

### Risk Mitigation

**Gradual Implementation Strategy:**
- Implement ADR-021 dictionary normalization first
- Prototype NFM with single domain (OpenShift) for proof of concept
- Expand to additional domains only after successful validation

**Performance Optimization:**
- Aggressive caching of schema definitions and constraint results
- Lazy loading of NFM components only when explicitly required
- Performance monitoring with automatic fallback to dictionary-only mode

**Complexity Management:**
- Clear documentation and examples for NFM schema design
- Automated validation tools for schema correctness
- Template compatibility testing framework for NFM integration

## Implementation Questions for Future Detailed Design

### AST Complexity Evolution
**Decision Deferred:** AST parsing complexity will evolve during implementation based on:
- Real-world query patterns encountered in OpenShift operations
- Performance characteristics of rule-based vs ML-based parsing approaches
- Ambiguous query handling requirements as they emerge in practice

**Implementation Approach:**
- Start with simple entity-action AST parsing for OpenShift domain
- Gather usage data to inform complexity decisions
- Iterate toward full query semantics only if justified by domain needs

### NFM Integration Strategy Details
**Decision Deferred:** Specific integration mechanics will be refined during implementation:
- Template migration strategies for NFM compatibility
- Rollout procedures for constraint validation
- Fallback mechanisms when NFM validation fails

**Implementation Approach:**
- Begin with NFM-compatible templates (optional NFM enhancement)
- Graduate to NFM-strict templates for domains requiring formal contracts
- Maintain NFM-unaware templates for simple use cases

### Type Safety vs Performance Optimization  
**Open Question:** Balance between type safety guarantees and execution performance
- How much validation overhead is acceptable for different domain precision levels?
- When should constraint validation be runtime vs compile-time?
- What caching strategies provide optimal performance for different constraint types?

**Implementation Approach:**
- Performance benchmarking with real OpenShift diagnostic workloads
- A/B testing of constraint validation strategies
- Domain-specific performance targets based on use case criticality

## Success Metrics

**NFM Effectiveness:**
- Constraint violation detection rate >95% for rules that should trigger
- False positive constraint violations <5% of total validations
- Template selection accuracy improvement >20% for NFM-enabled domains

**Performance Targets:**
- NFM processing latency <500ms average (including constraint validation)
- NFM cache hit rate >90% for repeated entity/constraint combinations  
- Memory footprint increase <100MB per domain schema

**Adoption Metrics:**
- Teams successfully implement NFM schemas without architectural support >80%
- NFM-strict templates provide measurably better diagnostic outcomes
- Zero production incidents caused by NFM constraint validation failures

## Related ADRs

- **ADR-021: Natural Language Input Normalization Architecture** - NFM extends dictionary normalization with semantic type safety
- **ADR-014: Deterministic Template Engine** - NFM-compatible templates integrate with existing engine
- **ADR-003: Memory Storage and Retrieval Patterns** - NFM constraint results can be cached in memory system

## Implementation Phases

### Phase 1: NFM Foundation (Weeks 1-3)
- Implement NFM schema definition format and validation
- Create basic AST parser for OpenShift query patterns
- Build constraint validation engine with caching

### Phase 2: Template Integration (Weeks 4-6)  
- Extend template engine with optional NFM processing
- Create NFM-compatible versions of key OpenShift templates
- Implement performance optimization and caching strategies

### Phase 3: OpenShift Domain Schema (Weeks 7-9)
- Design moderate-precision NFM schema for OpenShift entities  
- Implement constraint validation for key OpenShift relationships
- Validate performance targets with real diagnostic workloads

### Phase 4: Production Validation (Weeks 10-12)
- Deploy NFM system in shadow mode for validation
- A/B test NFM-enhanced vs dictionary-only template selection
- Performance tuning and production readiness verification

## References

- **Normalized Fact Model Concept** - Formal semantic modeling for deterministic systems
- **AST Parsing Strategies** - Abstract syntax tree approaches for natural language queries
- **Constraint Validation Patterns** - Performance-optimized rule validation architectures

## Conclusion

The Normalized Fact Model (NFM) Type System Architecture provides an optional semantic enhancement layer that can be selectively applied to domains requiring formal type safety and constraint validation. By maintaining clean separation from the dictionary normalization system (ADR-021), teams can adopt appropriate levels of semantic precision for their specific domain requirements.

The plugin architecture ensures that simple domains continue operating with fast dictionary normalization while complex domains benefit from rigorous constraint validation and evidence contract enforcement. This approach balances architectural flexibility with the growing need for formal semantic contracts in regulated and safety-critical applications.

The NFM system positions the platform for future expansion into medical, financial, and other domains requiring strict semantic precision while maintaining the performance and pragmatism that make the existing dictionary normalization system successful for operational use cases.

---

**Implementation Status:** Designed - Ready for Phased Development  
**Dependencies:** ADR-021 (Natural Language Input Normalization Architecture)  
**Risk Level:** Medium (optional enhancement, can be implemented incrementally)
