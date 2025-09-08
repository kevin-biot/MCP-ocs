# ADR-014: Deterministic Template Engine Architecture

**Status:** Accepted  
**Date:** August 15, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

The MCP-ocs system initially followed traditional LLM agent chain patterns where large language models (LLMs) decided tool execution sequences dynamically. During development and testing of OpenShift diagnostic workflows, we discovered critical determinism failures that made the system unsuitable for production incident response.

### The Determinism Crisis

**Problem Evidence:** Testing with CODEX revealed that identical OpenShift infrastructure failures produced different diagnostic sequences across different LLM models:

```
Same Ingress Failure Scenario:
- Qwen Model:    sql_query() → vector_search() → logs_fetch() → events_scan()
- Mistral Model: vector_search() → events_scan() → sql_query() → pod_health()  
- DevStral Model: events_scan() → sql_query() → describe_resource() → vector_search()
```

**Impact:** Three different diagnostic approaches for identical infrastructure failures created:
- Inconsistent evidence collection across investigation sessions
- Unpredictable tool call sequences making debugging difficult
- No reproducible audit trail for compliance requirements
- Unreliable behavior during 4AM incident response when consistency is critical

### Agent Chain Anti-Patterns Identified

1. **Stochastic Tool Selection** - LLM decides which tools to call based on prompt interpretation variance
2. **Unpredictable Execution Order** - Same semantic question produces different tool sequences
3. **Model-Dependent Behavior** - Different LLMs produce fundamentally different diagnostic approaches
4. **No Audit Trail** - Impossible to explain why Agent chose Tool X before Tool Y
5. **Evidence Collection Variance** - Different tool sequences gather different evidence sets

### Production Requirements

For enterprise OpenShift operations, the system must provide:
- **Consistent Investigation Procedures** - Same failure type produces same diagnostic sequence
- **Reproducible Results** - Identical evidence collection regardless of timing or operator
- **Complete Audit Trail** - Every tool call traceable with business justification
- **Regulatory Compliance** - Demonstrable consistency for enterprise governance
- **4AM Reliability** - Predictable behavior during high-stress incident response

## Decision

**We will implement a Deterministic Template Engine architecture where templates own execution plans rather than LLMs making dynamic tool selection decisions.**

### Core Architectural Principles

1. **Templates Own Execution Plans** - Fixed tool call sequences defined declaratively
2. **LLMs Become Renderers** - Process natural language input and render template results, but do not plan tool execution
3. **Deterministic Tool Orchestration** - Same diagnostic intent produces identical tool call sequence
4. **Evidence-Based Scoring** - Mathematical formulas replace LLM evaluation for consistency
5. **Bounded Tool Parameters** - Strict validation and resource limits on all tool calls

### Template Engine Components

**Intent Classification Layer:**
```yaml
intent_router:
  function: "Map natural language queries to specific templates"
  determinism: "temperature=0.0, consistent classification"
  output: "{template_id, extracted_parameters}"
```

**Template Execution Engine:**
```yaml
template_executor:
  function: "Execute fixed tool sequences with evidence chaining"
  determinism: "Predefined tool order, bounded parameters"
  validation: "Evidence completeness before scoring"
```

**Evidence-Based Scoring:**
```yaml
scoring_engine:
  function: "Mathematical scoring using collected evidence"
  determinism: "Transparent formulas, no LLM evaluation"
  auditability: "Complete traceability to evidence sources"
```

### Template Structure

```yaml
# Example: Namespace Health Diagnostic Template
namespace_health_diagnostic:
  trigger_patterns: ["namespace issues", "pod failures", "service disruption"]
  execution_sequence:
    1. oc_diagnostic_cluster_health() → infrastructure_context
    2. oc_diagnostic_namespace_health(namespace) → pod_status_evidence  
    3. oc_read_events(namespace, since=1h) → recent_timeline
    4. search_memory(similar_incidents) → historical_context
    5. workflow_analyze_evidence() → structured_diagnosis
  evidence_contract: ["cluster_status", "pod_health", "event_timeline", "memory_context"]
  completeness_threshold: 0.8
  audit_required: true
```

## Rationale

### Why Templates Over Agent Chains

**Consistency Requirements:**
- **Agent Chains:** Same diagnostic question → different tool sequences → inconsistent results
- **Templates:** Same diagnostic intent → identical tool sequence → reproducible results

**Production Reliability:**
- **Agent Chains:** Unpredictable behavior during high-stress incidents
- **Templates:** Deterministic execution provides reliability when it matters most

**Audit and Compliance:**
- **Agent Chains:** Cannot explain tool selection rationale to auditors
- **Templates:** Complete traceability from question to evidence to conclusion

**Debugging and Maintenance:**
- **Agent Chains:** Tool execution variance makes issue reproduction difficult
- **Templates:** Consistent execution enables systematic debugging and improvement

### Implementation Strategy

**Phase 1:** Convert existing diagnostic workflows to template format
**Phase 2:** Implement template execution engine with boundary enforcement
**Phase 3:** Add evidence validation and completeness checking
**Phase 4:** Deploy deterministic scoring with mathematical formulas

## Consequences

### Positive Consequences

**Operational Reliability:**
- Consistent diagnostic procedures across all operators and time periods
- Predictable resource usage and response times
- Reliable behavior during critical incident response scenarios

**Compliance and Auditability:**
- Complete audit trail from natural language question to final diagnosis
- Reproducible results for regulatory compliance requirements
- Transparent scoring methodology for business justification

**Maintainability:**
- Template-based architecture enables systematic testing and validation
- Clear separation between natural language processing and tool execution
- Composable templates allow reuse of proven diagnostic sequences

**Extensibility:**
- New diagnostic templates can be added without affecting existing workflows
- Templates can be composed from reusable action libraries
- Natural language query patterns enable intuitive template activation

### Negative Consequences

**Reduced Flexibility:**
- Templates require predefined diagnostic sequences rather than dynamic exploration
- New diagnostic approaches require template creation rather than prompt engineering

**Initial Development Overhead:**
- Converting existing agent-based workflows to template format requires effort
- Template engine implementation adds architectural complexity

**Template Maintenance:**
- Templates must be maintained and updated as diagnostic knowledge evolves
- Template quality directly impacts system effectiveness

### Risk Mitigation

**Template Quality Assurance:**
- Systematic testing of templates against known incident scenarios
- Regular review and updating of diagnostic templates based on operational feedback
- Evidence completeness validation prevents premature conclusions

**Flexibility Preservation:**
- Template library can be expanded to cover new diagnostic scenarios
- Composable action libraries enable rapid template creation
- Natural language processing allows for query variation within template patterns

## Related ADRs

- **ADR-003: Hybrid Memory Architecture** - Enables historical context in templates
- **ADR-004: Tool Namespace Management** - Provides clear tool organization for templates
- **ADR-005: Workflow State Machine** - Implements panic detection within template execution
- **ADR-010: Systemic Diagnostic Intelligence** - Advanced analytics within template framework

## References

- **Comprehensive Analysis:** `/docs/whitepaper-deterministic-operations.md` - Detailed technical analysis of the determinism crisis and template solution
- **Implementation Plan:** `docs/planning/CODEX_DETERMINISTIC_IMPLEMENTATION_PLAN.md` - Technical implementation strategy
- **Implementation Status:** `docs/planning/CODEX_IMPLEMENTATION_STATUS.md` - Current implementation progress

## Implementation Notes

### Template Library Structure

```
src/lib/templates/
├── cluster-health-template.ts      # Infrastructure-wide diagnostics
├── namespace-health-template.ts    # Namespace-specific analysis  
├── pod-failure-template.ts         # Container and pod diagnostics
├── networking-template.ts          # Connectivity and routing issues
├── storage-template.ts             # PVC and volume diagnostics
└── template-engine.ts              # Core execution engine
```

### Success Metrics

**Consistency Metrics:**
- 95%+ identical diagnostic sequences for same failure types
- <5% variance in evidence collection across investigation sessions

**Performance Metrics:**
- Investigation time: 45-90 minutes → 15-30 minutes average
- Evidence completeness: >80% for all template executions

**Reliability Metrics:**
- Zero diagnostic sequence failures due to LLM variance
- 100% audit trail completeness for compliance requirements

## Conclusion

The Deterministic Template Engine architecture transforms MCP-ocs from an experimental LLM-driven system into a production-ready operational platform. By moving execution control from dynamic LLM planning to deterministic templates, we achieve the consistency, reliability, and auditability required for enterprise incident response.

This architectural decision enables MCP-ocs to function reliably during 4AM outages when operations teams need facts and systematic procedures, not unpredictable AI exploration. The template-driven approach provides the foundation for all subsequent platform capabilities while maintaining the natural language interface that makes the system accessible to operations engineers.

---

**Implementation Status:** Complete - Production Ready
## Process v3.3.1 Alignment

The Deterministic Template Engine participates in the Process v3.3.1 closure workflow by producing structured evidence that maps to the 11‑artifact framework. When triage/diagnostics complete, curators should file the required artifacts.

- Process guide: `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.1.md`
- Example closure set: `sprint-management/archive/d-009-date-time-safety-2025-09-06/`

This mapping keeps diagnostic outputs reproducible and traceable within the organizational process.
