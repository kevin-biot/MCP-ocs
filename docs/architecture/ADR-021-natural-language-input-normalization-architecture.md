# ADR-021: Natural Language Input Normalization Architecture

**Status:** Accepted  
**Date:** September 02, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

The MCP-ocs system successfully implements deterministic template execution via ADR-014 (Deterministic Template Engine), but has an architectural gap in the input processing layer. Currently, natural language queries like "OpenShift ingress is acting up" are processed directly by the template selection engine without systematic normalization, leading to inconsistent template routing and suboptimal diagnostic workflows.

### The Input Normalization Gap

**Current Architecture Gap:**
```
Natural Language Input → ??? → Template Selection (ADR-014) → Tool Execution
```

**Problem Evidence:**
- Same semantic intent ("ingress down", "router not working") may route to different templates
- No systematic extraction of structured parameters from natural language
- Template selection relies on LLM interpretation rather than deterministic normalization
- No confidence scoring for input understanding quality
- Inconsistent handling of domain-specific terminology and abbreviations

### Enterprise Requirements

For production OpenShift operations, the system must provide:
- **Consistent Input Understanding** - Same intent always produces same normalized representation
- **Deterministic Template Routing** - Normalized inputs always route to appropriate templates
- **Confidence Scoring** - Quantified confidence in normalization accuracy
- **Domain Expertise Capture** - Systematic capture of expert knowledge in phrase dictionaries
- **Auditability** - Complete traceability from natural language to canonical representation
- **Version Control** - Dictionaries must be versioned, reviewable, and rollback-capable

## Decision

**We will implement a Git-Versioned Dictionary Normalization Architecture that transforms natural language inputs into canonical structured forms before template selection.**

### Core Architectural Principles

1. **Two-Layer Dictionary System** - Phrase normalization followed by domain routing
2. **Git-Versioned Dictionary Storage** - Immutable, versioned dictionaries in source control
3. **AI-Assisted Dictionary Generation** - Rapid dictionary creation with human oversight
4. **Deterministic Normalization Pipeline** - Same input always produces identical canonical output
5. **Backward Compatible Integration** - Zero breaking changes to existing template system

### Dictionary Architecture Components

**Layer 1: Phrase Dictionary (Normalization)**
```yaml
function: "Transform natural language patterns to canonical terms"
input: "OpenShift ingress is acting up"
output: "canonical: ingress_controller_degradation, confidence: 0.92"
storage: "Git-versioned JSON files with semantic versioning"
```

**Layer 2: Domain Dictionary (Routing)**
```yaml
function: "Route canonical terms to appropriate templates and contexts"
input: "canonical: ingress_controller_degradation"
output: "template: ingress-pending.json, domain: networking, priority: high"
storage: "Git-versioned routing rules with template mappings"
```

**AI-Assisted Generation System:**
```yaml
function: "Rapid dictionary generation with human quality control"
process: "AI generates comprehensive entries → Human review workflow → Production deployment"
validation: "Confidence scoring, test case generation, expert review"
```

### Git-Versioned Dictionary Structure

```
src/dictionaries/
├── phrase/
│   ├── openshift/
│   │   ├── v1.0.0.json           # Semantic versioning
│   │   ├── v1.1.0.json           # Backward-compatible updates
│   │   ├── v2.0.0.json           # Breaking changes
│   │   └── latest → v2.0.0.json  # Symlink to current
│   ├── medical/
│   └── financial/
├── domain/
│   ├── routing/
│   │   ├── v1.0.0.json
│   │   └── latest → v1.0.0.json
│   └── templates/
└── archived/                     # Archived old versions
```

### Dictionary Entry Schema

```json
{
  "metadata": {
    "version": "2.1.0",
    "domain": "openshift",
    "type": "phrase_dictionary",
    "created": "2025-09-02T10:30:00Z",
    "created_by": "expert.engineer",
    "approved_by": "senior.architect", 
    "parent_version": "2.0.0",
    "changelog": ["Added ingress failure patterns", "Fixed storage keyword conflicts"],
    "backward_compatible": true
  },
  "entries": [
    {
      "id": "ingress_001",
      "patterns": ["ingress down", "router not working", "ingress controller failed"],
      "canonical": "ingress_controller_failure",
      "confidence": 0.95,
      "domain_hints": ["networking", "ingress"],
      "validation_status": "human_reviewed",
      "template_routing": "ingress-pending.json",
      "evidence": ["incident-67890", "expert-review-session-123"]
    }
  ]
}
```

### Integration with Existing Architecture

**Enhanced Template Selection Flow:**
```typescript
// Existing flow preserved, enhanced with normalization
async selectTemplate(userInput: string, context: any): Promise<DiagnosticTemplate> {
  // 1. NEW: Dictionary normalization layer
  const normalized = await this.normalizeInput(userInput, context);
  
  // 2. EXISTING: Template selection (enhanced with normalized input)
  return this.findBestTemplate({
    ...context,
    normalized_input: normalized,
    routing_confidence: normalized.confidence
  });
}
```

## Rationale

### Why Git-Versioned Dictionaries Over Vector Storage

**Determinism and Reproducibility:**
- **Git-Versioned:** Same dictionary version always produces identical normalization results
- **Vector Storage:** Embedding models, database state, and indexing can cause non-deterministic results

**Auditability and Compliance:**
- **Git-Versioned:** Complete change history, diff capability, rollback mechanisms
- **Vector Storage:** Opaque vector representations with no clear audit trail

**Operational Resilience:**
- **Git-Versioned:** Works offline, no database dependencies, simple file loading
- **Vector Storage:** Requires ChromaDB service, vulnerable to database corruption

**Team Collaboration:**
- **Git-Versioned:** Standard Git workflow (branches, PRs, reviews, merges)
- **Vector Storage:** Difficult to collaborate on vector representations

### Why AI-Assisted Generation with Human Oversight

**Speed and Coverage:**
- AI can rapidly generate comprehensive phrase patterns across domains
- Weeks instead of months for complete domain dictionary coverage

**Quality and Accuracy:**
- Human experts review and validate AI-generated entries
- Domain expertise ensures accurate canonical representations
- Confidence scoring guides review priorities

**Continuous Improvement:**
- Usage patterns feed back into dictionary refinement
- Automated test case generation ensures comprehensive validation
- Systematic capture of expert knowledge

### Integration Benefits

**Preserves Existing Investment:**
- Zero changes required to existing templates (ADR-014)
- Template engine enhanced, not replaced
- Existing memory system (ADR-003) continues operating unchanged
- Current rubric system (multiple ADRs) extended with dictionary confidence

**Natural Architecture Evolution:**
- Dictionary normalization fits seamlessly before template selection
- Leverages existing variable resolution system for normalized parameters
- Memory system can store dictionary usage patterns for improvement
- Rubric system naturally extends to score normalization confidence

## Consequences

### Positive Consequences

**Deterministic Input Processing:**
- Same natural language input always produces identical canonical representation
- Template routing becomes predictable and auditable
- Consistent diagnostic workflows regardless of input phrasing variations

**Enterprise-Grade Dictionary Management:**
- Version-controlled dictionaries enable systematic domain knowledge capture
- Git workflow enables collaborative dictionary improvement by domain experts
- Rollback capability provides safety for dictionary updates

**Operational Excellence:**
- Fast dictionary loading (file read vs database query)
- Offline operation capability (no external dependencies)
- Simple backup and disaster recovery (git repository)

**Quality Assurance:**
- Confidence scoring enables systematic quality measurement
- Human review workflow ensures expert knowledge validation  
- Automated testing prevents dictionary regressions

### Negative Consequences

**Initial Implementation Effort:**
- Dictionary infrastructure requires development time
- AI-assisted generation system needs initial setup
- Integration with existing template system requires careful implementation

**Dictionary Maintenance Overhead:**
- Dictionaries need ongoing maintenance as domain knowledge evolves
- Human review process requires expert time allocation
- Version management adds operational complexity

**Storage and Memory Usage:**
- Dictionary files consume disk space (minimal impact)
- In-memory dictionary caching uses RAM (acceptable trade-off)

### Risk Mitigation

**Gradual Implementation:**
- Feature flags enable A/B testing of dictionary vs direct template selection
- Backward compatibility ensures existing workflows continue working
- Phased rollout reduces deployment risk

**Quality Assurance:**
- Comprehensive test suites validate dictionary normalization accuracy
- Golden dataset testing ensures consistent results across dictionary versions
- Human review workflow prevents low-quality entries from reaching production

**Operational Safety:**
- Fallback to direct template selection if dictionary normalization fails
- Version pinning enables stable operation in critical environments
- Simple rollback mechanism for problematic dictionary updates

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
- Implement Git-versioned dictionary loader
- Create dictionary schema validation
- Build basic phrase normalization engine
- Establish human review workflow infrastructure

### Phase 2: Integration (Weeks 3-4)  
- Integrate dictionary normalization with template selection
- Extend template engine with normalized parameter support
- Add dictionary confidence scoring to rubric system
- Implement A/B testing framework for gradual rollout

### Phase 3: AI-Assisted Generation (Weeks 5-6)
- Develop AI-assisted dictionary generation system
- Create automated test case generation
- Implement usage-based dictionary improvement pipeline
- Build confidence calibration and validation tools

### Phase 4: Production Deployment (Weeks 7-8)
- Deploy comprehensive OpenShift domain dictionary
- Establish production dictionary update workflow
- Complete performance optimization and caching
- Full production rollout with monitoring and validation

## Related ADRs

- **ADR-014: Deterministic Template Engine** - Enhanced with dictionary normalization layer
- **ADR-003: Memory Storage and Retrieval Patterns** - Dictionary usage patterns stored in memory system
- **ADR-004: Tool Namespace Management** - Dictionary domains align with tool namespaces
- **ADR-007: Automatic Tool Memory Integration** - Dictionary normalization automatically captured

## Success Metrics

**Consistency Metrics:**
- 95%+ identical normalization results for same natural language inputs
- <5% variance in template routing across dictionary versions
- 90%+ template selection accuracy improvement with dictionary normalization

**Quality Metrics:**
- Dictionary confidence scores correlate with human expert agreement >85%
- Expert review approval rate >90% for AI-generated dictionary entries
- Production incident resolution time improvement >30%

**Operational Metrics:**
- Dictionary loading time <100ms average
- Zero downtime dictionary updates
- Complete audit trail for all dictionary changes

## References

- **DOP Pattern Master Document** - Conceptual foundation for dictionary-driven normalization
- **Template Engine Implementation** - Integration target for dictionary enhancement
- **Memory System Architecture** - Dictionary usage pattern storage and analysis

## Implementation Notes

### Dictionary Update Workflow
```bash
# 1. Create new dictionary version
cp src/dictionaries/phrase/openshift/v2.0.0.json \
   src/dictionaries/phrase/openshift/v2.1.0.json

# 2. AI-assisted generation (optional)
npm run dict:generate --domain=openshift --base-version=v2.0.0

# 3. Human expert review
npm run dict:review --queue=openshift:v2.1.0

# 4. Validation and testing
npm run dict:validate src/dictionaries/phrase/openshift/v2.1.0.json
npm run dict:test --dictionary=openshift:v2.1.0 --suite=comprehensive

# 5. Production deployment
npm run dict:deploy --dictionary=openshift:v2.1.0 --environment=production
```

### Performance Targets
- Dictionary loading: <100ms
- Normalization processing: <50ms per query
- Memory footprint: <50MB per domain dictionary
- Cache hit rate: >95% for repeated queries

## Conclusion

The Natural Language Input Normalization Architecture fills a critical gap in the MCP-ocs system by providing deterministic, auditable transformation from natural language to structured template inputs. The Git-versioned dictionary approach ensures enterprise-grade reliability while enabling rapid domain knowledge capture through AI-assisted generation.

This architecture preserves all existing investments in templates, tools, and operational workflows while significantly enhancing input processing consistency and auditability. The systematic approach to domain knowledge capture positions MCP-ocs as a platform that learns and improves from expert interactions while maintaining the deterministic execution guarantees required for production incident response.

By implementing this architecture, MCP-ocs evolves from a template-driven diagnostic system to a comprehensive natural language operations platform that combines human expertise with AI assistance while maintaining full deterministic control and enterprise auditability.

---

**Implementation Status:** Designed - Ready for Development  
**Dependencies:** None (extends existing architecture)  
**Risk Level:** Low (backward compatible enhancement)
## Process v3.3.1 Integration

The NL input normalization pipeline should expect and produce summaries that tie back to the 11‑artifact template framework (Process v3.3.1), ensuring prompts, decisions, and outcomes are consistently documented.

- Usage guide: `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.1.md`
- Example artifact set: `sprint-management/archive/d-009-date-time-safety-2025-09-06/`

This allows human/AI workflows to remain aligned with the organizational closure process.
