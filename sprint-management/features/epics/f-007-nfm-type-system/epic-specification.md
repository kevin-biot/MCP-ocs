# F-007: Normalized Fact Model (NFM) Type System Epic

**ADR Coverage**: ADR-022 (Normalized Fact Model Type System Architecture)  
**Epic Status**: 📋 **PLANNED**  
**Priority**: **P3 - MEDIUM**  
**Dependencies**: F-006 (Natural Language Input Normalization)  
**Estimated Effort**: 50-60 development days  

---

## Epic Overview

### Business Problem
For domains requiring high semantic precision and formal contract compliance (medical, financial, complex operational scenarios), simple phrase-to-canonical mapping is insufficient. These domains need formal type safety, constraint validation, and evidence contract enforcement based on semantic business rules.

### Solution Architecture
Implement an optional Normalized Fact Model (NFM) Type System as a plugin that enhances dictionary normalization with formal semantic contracts, constraint validation, and type-safe template selection when domain complexity justifies the additional architectural investment.

### Key Value Proposition
- **Semantic Type Safety**: Formal constraint validation for domains requiring contractual precision
- **Domain-Specific Granularity**: Moderate precision for OpenShift, strict precision for regulated domains
- **Plugin Architecture**: Optional enhancement that doesn't impact simple dictionary normalization performance
- **Future-Ready Foundation**: Prepares platform for medical, financial, and regulated domain expansion

---

## Implementation Phases

### Phase 1: NFM Foundation (Weeks 1-3)
**Goal**: Establish NFM schema definition and constraint validation engine

**Tasks**:
- **F-007-001**: Implement NFM schema definition format and validation system
- **F-007-002**: Create basic AST parser for OpenShift query patterns
- **F-007-003**: Build constraint validation engine with caching optimization
- **F-007-004**: Design domain-specific schema granularity framework

**Deliverables**:
- NFM schema definition system supporting multiple precision levels
- AST parser converting natural language to structured facts
- Constraint validation engine with performance optimization
- Framework supporting moderate (OpenShift) to strict (medical) precision

**Success Criteria**:
- Schema validation preventing malformed NFM definitions
- AST parsing with >90% accuracy for OpenShift diagnostic patterns
- Constraint validation engine meeting <500ms latency targets
- Domain granularity framework supporting multiple precision levels

### Phase 2: Template Integration (Weeks 4-6)
**Goal**: Integrate NFM processing with existing template engine as optional enhancement

**Tasks**:
- **F-007-005**: Extend template engine with optional NFM processing capabilities
- **F-007-006**: Create NFM-compatible versions of key OpenShift templates
- **F-007-007**: Implement performance optimization and caching strategies
- **F-007-008**: Build NFM-template compatibility validation system

**Deliverables**:
- Template engine supporting both NFM-enhanced and standard processing
- NFM-compatible templates demonstrating enhanced semantic precision
- Caching system optimizing NFM constraint validation performance
- Compatibility validation ensuring template-NFM alignment

**Success Criteria**:
- Zero performance impact when NFM processing disabled
- NFM-enhanced templates provide measurably better diagnostic precision
- Cache hit rate >90% for repeated NFM constraint evaluations
- Template compatibility validation catches NFM constraint violations

### Phase 3: OpenShift Domain Schema (Weeks 7-9)
**Goal**: Implement moderate-precision NFM schema for OpenShift operational domain

**Tasks**:
- **F-007-009**: Design moderate-precision NFM schema for OpenShift entities
- **F-007-010**: Implement constraint validation for key OpenShift relationships  
- **F-007-011**: Create evidence contract enforcement based on NFM constraints
- **F-007-012**: Validate performance targets with real diagnostic workloads

**Deliverables**:
- OpenShift NFM schema with moderate semantic precision
- Constraint validation covering Pod-Node, Route-Service, Controller-Pod relationships
- Evidence contracts ensuring diagnostic completeness based on NFM rules
- Performance validation with real-world OpenShift diagnostic scenarios

**Success Criteria**:
- NFM schema covers 90% of common OpenShift diagnostic relationships
- Constraint validation accuracy >95% for rules that should trigger
- Evidence contract enforcement improves diagnostic completeness by >20%
- All performance targets met: <500ms NFM processing, >90% cache hit rate

### Phase 4: Production Validation (Weeks 10-12)
**Goal**: Deploy NFM system in production with comprehensive validation and monitoring

**Tasks**:
- **F-007-013**: Deploy NFM system in shadow mode for production validation
- **F-007-014**: A/B test NFM-enhanced vs dictionary-only template selection
- **F-007-015**: Performance tuning and production readiness verification
- **F-007-016**: Documentation and training for NFM schema management

**Deliverables**:
- Production-ready NFM system with comprehensive monitoring
- A/B testing results demonstrating NFM value for OpenShift diagnostics
- Performance-tuned system meeting all operational requirements
- Complete documentation enabling teams to create NFM schemas

**Success Criteria**:
- Shadow mode deployment with zero production impact
- A/B testing shows measurable improvement in diagnostic accuracy
- All performance and reliability targets met in production environment
- Documentation enables independent NFM schema development

---

## Technical Architecture

### NFM Schema Structure
```yaml
# OpenShift NFM Schema (Moderate Precision)
domain: "openshift_operations"
version: "1.0.0"
precision_level: "moderate"

entities:
  Pod:
    attributes:
      name: { type: string, required: true }
      phase: { type: enum, values: [Pending, Running, Failed, Succeeded] }
    relationships:
      scheduled_on: { target: Node, cardinality: "many:1" }
      controlled_by: { target: [Deployment, ReplicaSet], cardinality: "many:1" }
    constraints:
      - name: "failed_pods_require_evidence"
        rule: "phase=Failed → [termination_reason, controller_logs] required"
        enforcement: "soft"  # Warnings for OpenShift, "hard" for medical
```

### Plugin Architecture
```typescript
// NFM as optional enhancement
class TemplateEngine {
  private nfmProcessor?: NFMProcessor;
  
  constructor(options: { enableNFM?: boolean }) {
    if (options.enableNFM) {
      this.nfmProcessor = new NFMProcessor();
    }
  }
  
  async selectTemplate(query: string, context: any): Promise<DiagnosticTemplate> {
    // Standard dictionary normalization (F-006)
    const normalized = await this.normalizeInput(query, context);
    
    // Optional NFM enhancement
    if (this.nfmProcessor && context.domain_requires_nfm) {
      const nfmFacts = await this.nfmProcessor.parseToNFM(normalized);
      return this.selectNFMTemplate(normalized, nfmFacts);
    }
    
    // Standard template selection
    return this.selectStandardTemplate(normalized, context);
  }
}
```

### Domain-Specific Granularity
```yaml
# Precision levels by domain
openshift_operations:
  precision_level: "moderate"
  constraint_enforcement: "soft"     # Warnings, not failures
  evidence_flexibility: "high"       # Multiple evidence paths accepted
  
medical_diagnostics:
  precision_level: "strict" 
  constraint_enforcement: "hard"     # Violations block execution
  evidence_flexibility: "low"        # Exact evidence requirements
  
financial_compliance:
  precision_level: "contractual"
  constraint_enforcement: "hard"     # Regulatory compliance required
  evidence_flexibility: "none"       # Exact audit trail mandatory
```

---

## Success Metrics

### NFM Effectiveness Metrics
- **Constraint Detection Rate**: >95% for rules that should trigger in OpenShift diagnostics
- **False Positive Rate**: <5% of total constraint validations produce incorrect warnings
- **Template Selection Improvement**: >20% better diagnostic accuracy with NFM enhancement
- **Evidence Completeness**: NFM constraints improve diagnostic evidence collection by >25%

### Performance Metrics
- **NFM Processing Latency**: <500ms average including AST parsing and constraint validation
- **Cache Hit Rate**: >90% for repeated entity/constraint combinations
- **Memory Footprint**: <100MB per domain schema in memory
- **Processing Overhead**: <10% additional latency when NFM enabled vs disabled

### Quality Metrics
- **Schema Accuracy**: Expert validation >85% agreement with NFM constraint assessments
- **AST Parsing Accuracy**: >90% correct semantic interpretation of OpenShift queries
- **Constraint Rule Quality**: >95% of implemented constraints reflect valid business rules
- **Template Compatibility**: 100% of NFM-enhanced templates pass compatibility validation

### Adoption Metrics
- **Teams Successfully Using NFM**: >80% of teams can implement NFM schemas without support
- **Schema Development Velocity**: Teams can create domain schemas in <2 weeks
- **Production Reliability**: Zero production incidents caused by NFM constraint validation
- **Domain Coverage**: NFM schemas available for >90% of identified operational scenarios

---

## Risk Assessment and Mitigation

### Technical Risks
- **Performance Impact**: NFM validation adds significant latency even with caching
- **Complexity Explosion**: AST parsing and constraint validation create maintenance burden
- **Schema Quality**: Poor NFM schemas could degrade rather than improve diagnostic quality

### Mitigation Strategies
- **Performance**: Aggressive caching, lazy loading, automatic fallback to dictionary-only mode
- **Complexity**: Clear documentation, automated validation tools, expert training programs
- **Quality**: Multi-stage schema validation, expert review requirements, automated testing

### Adoption Risks
- **Over-Engineering**: NFM complexity may not justify benefits for simple OpenShift operations
- **Learning Curve**: Teams may struggle with NFM schema design and constraint specification
- **Maintenance Overhead**: Ongoing NFM schema maintenance requires specialized expertise

### Mitigation Strategies
- **Over-Engineering**: Plugin architecture allows teams to opt-out if complexity not justified
- **Learning Curve**: Comprehensive documentation, training programs, schema templates
- **Maintenance**: Automated tooling, clear ownership models, expert support channels

---

## Dependencies

### Internal Dependencies
- **F-006 Input Normalization**: NFM requires dictionary normalization as foundation
- **F-001 Template Engine**: Stable template system required for NFM integration
- **F-004 Template Quality**: High-quality templates required for NFM constraint validation

### External Dependencies
- **Schema Design Expertise**: Domain experts required for NFM schema creation
- **Performance Infrastructure**: Robust caching and validation infrastructure
- **Documentation Platform**: Comprehensive documentation system for NFM guidance

### Blocking Dependencies
- **F-006 Success**: Dictionary normalization must be proven successful before NFM investment
- **Performance Baseline**: System performance must meet targets before adding NFM overhead
- **Domain Expertise**: Access to OpenShift experts for schema validation and constraint design

---

## Future Domain Expansion

### Medical Domain NFM Schema
```yaml
# Future medical domain (high precision)
domain: "medical_diagnostics"
precision_level: "strict"

entities:
  Patient:
    attributes:
      medical_record_number: { type: string, required: true, format: "mrn" }
      diagnosis_codes: { type: array, items: "icd_10_code" }
    constraints:
      - name: "diagnosis_evidence_required"
        rule: "diagnosis_assigned → [clinical_evidence, provider_validation] required"
        enforcement: "hard"  # Regulatory compliance
```

### Financial Domain NFM Schema
```yaml
# Future financial domain (contractual precision)
domain: "financial_compliance" 
precision_level: "contractual"

entities:
  Transaction:
    attributes:
      amount: { type: decimal, precision: 2, required: true }
      compliance_status: { type: enum, values: [Compliant, Under_Review, Non_Compliant] }
    constraints:
      - name: "audit_trail_required"
        rule: "amount > 10000 → [audit_documentation, approval_chain] required"
        enforcement: "hard"  # Regulatory requirement
```

---

## Deliverable Artifacts

### Code Deliverables
- `src/lib/nfm/` - NFM schema definition and validation system
- `src/lib/nfm/ast-parser/` - Abstract syntax tree parsing engine
- `src/lib/nfm/constraint-engine/` - Constraint validation with caching
- `src/lib/templates/nfm-integration/` - Template engine NFM plugin

### Schema Deliverables  
- `src/nfm/schemas/openshift-v1.yml` - OpenShift moderate-precision schema
- `src/nfm/templates/` - NFM schema templates for new domains
- `src/nfm/validation/` - Schema validation and testing tools
- `src/nfm/examples/` - Example schemas for different precision levels

### Documentation Deliverables
- NFM architecture and design principles guide
- Schema design and constraint specification manual
- AST parsing and constraint engine technical reference
- Performance optimization and troubleshooting guide

---

## Implementation Decision Points

### AST Complexity Evolution
**Current Decision**: Start with simple entity-action AST parsing for OpenShift
**Future Evolution**: Based on real-world query patterns and performance characteristics
**Implementation Approach**: Iterative complexity increase only when justified by domain needs

### NFM Integration Strategy
**Current Decision**: Plugin architecture with optional enhancement
**Future Evolution**: May become standard for domains requiring semantic precision
**Implementation Approach**: Maintain backward compatibility, gradual adoption path

### Performance vs Type Safety Balance
**Open Question**: Optimal balance between constraint validation and execution speed
**Implementation Approach**: Performance benchmarking, A/B testing, domain-specific tuning
**Success Criteria**: <500ms latency target, >90% cache hit rate, measurable diagnostic improvement

---

**Epic Owner**: Senior Development Team  
**Business Stakeholder**: Enterprise Architecture  
**Technical Reviewer**: Principal Engineer  
**Domain Expert**: OpenShift Operations Team  

**Created**: 2025-09-02  
**Last Updated**: 2025-09-02  
**Review Cycle**: Bi-weekly during design phase, weekly during active development
