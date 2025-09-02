# F-006: Natural Language Input Normalization Epic

**ADR Coverage**: ADR-021 (Natural Language Input Normalization Architecture)  
**Epic Status**: 📋 **PLANNED**  
**Priority**: **P2 - HIGH**  
**Dependencies**: F-001 (Core Platform Foundation - Template Engine)  
**Estimated Effort**: 30-40 development days  

---

## Epic Overview

### Business Problem
The MCP-ocs system has a critical gap between natural language queries and template selection. Users express the same diagnostic intent in different ways ("ingress down", "router not working", "ingress controller failed"), leading to inconsistent template routing and suboptimal diagnostic workflows.

### Solution Architecture
Implement a Git-versioned dictionary normalization system that transforms natural language inputs into deterministic canonical forms before template selection, enabling consistent diagnostic workflows regardless of input phrasing variations.

### Key Value Proposition
- **Consistent Template Routing**: Same diagnostic intent always produces same template selection
- **Expert Knowledge Capture**: Systematic capture of domain expertise in versioned dictionaries
- **Deterministic Audit Trail**: Complete traceability from natural language to template execution
- **AI-Assisted Scale**: Rapid dictionary generation with human quality control

---

## Implementation Phases

### Phase 1: Dictionary Infrastructure (Weeks 1-2)
**Goal**: Establish Git-versioned dictionary foundation with deterministic loading

**Tasks**:
- **F-006-001**: Implement Git-versioned dictionary loader with semantic versioning support
- **F-006-002**: Create dictionary schema validation and integrity checking
- **F-006-003**: Build phrase normalization engine with confidence scoring
- **F-006-004**: Establish human review workflow infrastructure

**Deliverables**:
- Dictionary loader supporting version pinning and symlink resolution
- Schema validation preventing malformed dictionary entries
- Basic phrase matching with confidence calculation
- Review workflow ready for expert validation

**Success Criteria**:
- Dictionary loading <100ms for production-sized dictionaries
- 100% schema validation coverage preventing invalid entries
- Phrase normalization with quantified confidence scores

### Phase 2: Template Integration (Weeks 3-4)
**Goal**: Integrate dictionary normalization with existing template selection engine

**Tasks**:
- **F-006-005**: Extend template registry with dictionary-aware template selection
- **F-006-006**: Enhance template engine variable resolution with normalized parameters
- **F-006-007**: Implement A/B testing framework for dictionary vs direct selection
- **F-006-008**: Add dictionary confidence scoring to rubric system

**Deliverables**:
- Enhanced template selection supporting both dictionary and direct modes
- Variable resolution system handling normalized query parameters
- A/B testing framework for gradual rollout validation
- Rubric integration scoring dictionary normalization confidence

**Success Criteria**:
- Zero breaking changes to existing template execution workflows
- A/B testing shows >20% improvement in template selection accuracy
- Dictionary confidence scores correlate with expert judgment >85%

### Phase 3: AI-Assisted Generation (Weeks 5-6)
**Goal**: Implement AI-assisted dictionary generation with human oversight

**Tasks**:
- **F-006-009**: Develop AI-assisted dictionary generation system
- **F-006-010**: Create automated test case generation for dictionary validation
- **F-006-011**: Implement usage-based dictionary improvement pipeline
- **F-006-012**: Build confidence calibration and validation tools

**Deliverables**:
- AI generation system producing comprehensive phrase dictionaries
- Automated test suite ensuring dictionary quality and coverage
- Usage feedback system improving dictionary accuracy over time
- Confidence calibration ensuring reliable quality scoring

**Success Criteria**:
- AI generates 80%+ viable dictionary entries requiring minimal human correction
- Human expert approval rate >90% for AI-generated entries
- Usage-based improvements demonstrate measurable accuracy gains

### Phase 4: Production Deployment (Weeks 7-8)
**Goal**: Deploy comprehensive OpenShift domain dictionary with production optimization

**Tasks**:
- **F-006-013**: Deploy comprehensive OpenShift diagnostic phrase dictionary
- **F-006-014**: Establish production dictionary update workflow
- **F-006-015**: Complete performance optimization and caching implementation
- **F-006-016**: Full production rollout with monitoring and validation

**Deliverables**:
- Production-ready OpenShift dictionary covering all diagnostic scenarios
- Git-based dictionary update workflow with CI/CD integration
- Performance-optimized system meeting <50ms normalization targets
- Production monitoring ensuring system reliability and performance

**Success Criteria**:
- >95% phrase recognition accuracy for OpenShift diagnostic queries
- Dictionary update workflow enabling safe production updates
- All performance targets met: <100ms loading, <50ms normalization
- Zero production incidents caused by dictionary normalization failures

---

## Technical Architecture

### Dictionary Structure
```
src/dictionaries/
├── phrase/
│   ├── openshift/
│   │   ├── v1.0.0.json           # Semantic versioning
│   │   ├── v2.0.0.json           # Major version updates
│   │   └── latest → v2.0.0.json  # Symlink to current
│   └── medical/                  # Future domain expansion
├── domain/
│   └── routing/                  # Domain-to-template routing rules
└── archived/                     # Archived old versions
```

### Dictionary Entry Schema
```json
{
  "metadata": {
    "version": "2.1.0",
    "domain": "openshift", 
    "created_by": "expert.engineer",
    "approved_by": "senior.architect"
  },
  "entries": [
    {
      "id": "ingress_001",
      "patterns": ["ingress down", "router not working", "ingress controller failed"],
      "canonical": "ingress_controller_failure",
      "confidence": 0.95,
      "template_routing": "ingress-pending.json"
    }
  ]
}
```

### Integration Points
- **Template Registry**: Enhanced with dictionary-aware selection logic
- **Template Engine**: Variable resolution supports normalized parameters  
- **Memory System**: Dictionary usage patterns stored for improvement
- **Rubric System**: Dictionary confidence integrated into scoring

---

## Success Metrics

### Consistency Metrics
- **Normalization Consistency**: >95% identical results for same natural language inputs
- **Template Routing Accuracy**: >90% correct template selection with dictionary enhancement
- **Cross-Version Stability**: <5% variance in results across dictionary versions

### Performance Metrics  
- **Dictionary Loading**: <100ms average loading time for production dictionaries
- **Normalization Processing**: <50ms per query normalization time
- **Memory Footprint**: <50MB per domain dictionary in memory
- **Cache Performance**: >95% hit rate for repeated queries

### Quality Metrics
- **AI Generation Quality**: >80% AI-generated entries approved by human experts
- **Expert Approval Rate**: >90% human reviewer approval for dictionary updates
- **Usage Improvement**: Demonstrable accuracy gains through usage-based refinement
- **Production Reliability**: Zero normalization failures causing diagnostic errors

### Business Impact Metrics
- **Diagnostic Consistency**: Same failure types produce identical investigation sequences
- **Investigation Time**: >30% reduction in time-to-diagnosis through consistent routing
- **Expert Knowledge Capture**: Systematic capture of domain expertise in reusable form
- **Operational Reliability**: Predictable behavior during high-stress incident response

---

## Risk Assessment and Mitigation

### Technical Risks
- **Performance Impact**: Dictionary processing adds latency to template selection
- **Complexity Overhead**: AI generation and human review workflows add operational complexity
- **Dictionary Quality**: Poor-quality dictionaries could degrade template selection accuracy

### Mitigation Strategies
- **Performance**: Aggressive caching and lazy loading, performance monitoring with fallback
- **Complexity**: Gradual rollout with feature flags, comprehensive documentation and training
- **Quality**: Multi-stage validation, expert review requirements, automated testing

### Integration Risks
- **Breaking Changes**: Dictionary integration could disrupt existing template workflows
- **Adoption Resistance**: Teams may resist learning new dictionary management processes
- **Maintenance Overhead**: Dictionary maintenance requires ongoing expert time allocation

### Mitigation Strategies
- **Breaking Changes**: Backward compatibility guarantees, optional enhancement approach
- **Adoption**: Clear value demonstration, gradual adoption path, comprehensive training
- **Maintenance**: Automated tooling, clear workflow documentation, expert time budgeting

---

## Dependencies

### Internal Dependencies
- **F-001 Template Engine**: Dictionary integration requires stable template selection foundation
- **Memory System**: Dictionary caching and usage pattern storage
- **Rubric System**: Confidence scoring integration requires rubric framework

### External Dependencies  
- **Git Repository**: Dictionary versioning requires reliable Git infrastructure
- **AI Generation**: Requires access to frontier LLM for dictionary generation
- **Expert Reviewers**: Human domain experts required for dictionary validation

### Blocking Dependencies
- **Template Stability**: F-001 template engine must be production-stable before integration
- **Memory Performance**: Memory system optimization required for dictionary caching
- **Review Workflow**: Human review process must be established before AI generation

---

## Deliverable Artifacts

### Code Deliverables
- `src/lib/dictionaries/` - Dictionary infrastructure and loading system
- `src/lib/templates/dictionary-integration.ts` - Template engine integration
- `src/lib/dictionaries/ai-generation/` - AI-assisted generation system
- `src/lib/dictionaries/validation/` - Dictionary quality validation tools

### Documentation Deliverables
- Dictionary design and maintenance guide
- AI generation workflow documentation  
- Human review process procedures
- Performance optimization and caching guide

### Configuration Deliverables
- OpenShift domain dictionary (comprehensive phrase coverage)
- Dictionary update CI/CD pipeline configuration
- Performance monitoring and alerting configuration
- Production deployment and rollback procedures

---

## Future Expansion

### Domain Scalability
The F-006 architecture enables rapid expansion to new domains:
- **Medical Domain**: High-precision phrase dictionaries for clinical terminology
- **Financial Domain**: Regulatory-compliant dictionaries for financial operations
- **Manufacturing Domain**: Industrial terminology and process-specific phrases

### Advanced Features  
Future enhancements building on F-006 foundation:
- **Multi-language Support**: Dictionary entries supporting multiple languages
- **Context-aware Normalization**: Dictionary selection based on operational context
- **Semantic Relationship Modeling**: Advanced phrase relationships and synonyms

### Integration Opportunities
- **F-007 NFM Integration**: Semantic type checking building on dictionary normalization
- **Advanced Analytics**: Dictionary usage patterns informing system optimization
- **Enterprise SSO**: Dictionary management integrated with enterprise identity systems

---

**Epic Owner**: Development Team  
**Business Stakeholder**: Operations Engineering  
**Technical Reviewer**: Senior Architecture  
**Success Criteria Owner**: Platform Engineering  

**Created**: 2025-09-02  
**Last Updated**: 2025-09-02  
**Review Cycle**: Weekly during active development
