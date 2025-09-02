# Architecture Decision Records

This directory contains the technical decisions and architectural rationale for the MCP-ocs project. All ADRs follow a consistent format to document context, decisions, and consequences of major architectural choices.

**Current Status**: 22 ADRs with 89% feature coverage through systematic gap analysis and remediation (September 2025)

## Current ADRs

### Foundation Architecture
- **[ADR-001: OpenShift vs Kubernetes API Client Decision](./ADR-001-oc-vs-k8s-api.md)** - *Implemented*  
  Phased approach: Start with `oc` CLI wrapper for rapid development, migrate to Kubernetes API client for production scalability

- **[ADR-002: GitOps Integration Strategy](./ADR-002-gitops-strategy.md)** - *Partial*  
  Environment-based GitOps workflow with emergency break-glass procedures for dev/test vs staging/prod

### Memory and Intelligence Systems  
- **[ADR-003: Memory Storage and Retrieval Patterns](./ADR-003-memory-patterns.md)** - *Implemented*  
  Hybrid ChromaDB + JSON fallback architecture for operational intelligence with auto-context extraction

- **[ADR-007: Automatic Tool Memory Integration](./ADR-007-automatic-tool-memory-integration.md)** - *Implemented*  
  Zero-effort automatic capture and tagging of tool executions for operational intelligence and pattern recognition

### Tool and Workflow Architecture
- **[ADR-004: Tool Namespace Management](./ADR-004-tool-namespace-management.md)** - *Partial*  
  Hierarchical tool namespace architecture with context-aware filtering to prevent tool confusion across MCP domains

- **[ADR-005: Workflow State Machine Design](./ADR-005-workflow-state-machine.md)** - *Implemented*  
  Structured diagnostic workflow with panic detection to prevent "4 AM panic operations" and enforce evidence-based troubleshooting

- **[ADR-006: Modular Tool Plugin Architecture](./ADR-006-modular-tool-architecture.md)** - *Designed*  
  Plugin-based architecture for scalable tool expansion supporting dynamic loading/unloading. **F-008 Epic Created**

### Template and Processing Systems
- **[ADR-014: Deterministic Template Engine](./ADR-014-deterministic-template-engine.md)** - *Implemented*  
  Template-driven tool execution replacing dynamic LLM planning for consistent diagnostic workflows

- **[ADR-021: Natural Language Input Normalization Architecture](./ADR-021-natural-language-input-normalization-architecture.md)** - *Designed* **NEW**  
  Git-versioned dictionary system transforming natural language queries into canonical forms. **F-006 Epic Created**

- **[ADR-022: Normalized Fact Model Type System Architecture](./ADR-022-normalized-fact-model-type-system-architecture.md)** - *Designed* **NEW**  
  Optional semantic type system with constraint validation for domains requiring formal contracts. **F-007 Epic Created**

### Production Deployment & Security
- **[ADR-008: Production Operator Architecture](./ADR-008-production-operator-architecture.md)** - *Designed*  
  Multi-pod operator deployment with external memory services, RBAC constraints, and GitOps integration. **F-003 Epic (P1-CRITICAL)**

- **[ADR-009: RBAC and Emergency Change Management](./ADR-009-rbac-emergency-change-management.md)** - *Partial*  
  Layered RBAC with role-based permissions, emergency break-glass procedures, and comprehensive audit trails

### Advanced Intelligence & Diagnostics
- **[ADR-010: Systemic Diagnostic Intelligence](./ADR-010-systemic-diagnostic-intelligence.md)** - *Partial*  
  Root cause chain analysis, infrastructure correlation, and cross-system failure analysis

- **[ADR-011: Fast RCA Framework Implementation](./ADR-011-fast-rca-framework.md)** - *Designed*  
  Automated root cause analysis with pattern recognition and historical incident learning. **F-009 Epic Created**

- **[ADR-012: Operational Intelligence Data Model](./ADR-012-operational-data-model.md)** - *Designed*  
  Structured data models for operational analytics and insights. **Integrated with F-002 Epic**

- **[ADR-013: Automated Runbook Execution Framework](./ADR-013-automated-runbooks.md)** - *Designed*  
  Safe automation framework with approval workflows and rollback capabilities. **Integrated with F-002 Epic**

### Future Platform Enhancements
- **[ADR-015: gollm LLM Provider Enhancement](./ADR-015-gollm-enhancement.md)** - *Designed*  
  Multi-provider LLM integration for vendor flexibility and performance optimization

- **[ADR-016: Multi-tenancy Session Management](./ADR-016-multi-tenancy-sessions.md)** - *Designed*  
  Session isolation and management for multi-tenant deployments

- **[ADR-017: AI War Room Commander Architecture](./ADR-017-ai-war-room-commander.md)** - *Designed*  
  Advanced AI-driven incident command and coordination system

- **[ADR-018: kubectl AI Future Enhancement](./ADR-018-kubectl-ai-enhancement.md)** - *Designed*  
  Native Kubernetes integration expanding beyond OpenShift focus

- **[ADR-019: Multi-tenancy Progressive Evolution](./ADR-019-multi-tenancy-evolution.md)** - *Designed*  
  Progressive multi-tenant architecture evolution strategy

- **[ADR-020: Risk-based Security Development Guidelines](./ADR-020-security-guidelines.md)** - *Designed*  
  Security-focused development practices and architectural guidelines

## Architecture Overview

For a complete system overview, see [ARCHITECTURE.md](./ARCHITECTURE.md) which provides:
- System component relationships with input processing layers
- Data flow diagrams including dictionary normalization  
- Technology stack decisions
- Integration patterns for natural language processing

## Recent Architecture Enhancements (September 2025)

### Input Processing Architecture
The system now includes a comprehensive input processing layer addressing the critical gap between natural language queries and template execution:

- **ADR-021**: Dictionary-based normalization transforms natural language to canonical terms
- **ADR-022**: Optional semantic type system for formal contract domains
- **Integration**: Enhances existing ADR-014 template engine with systematic input processing

### Feature Coverage Achievement
- **89% ADR Coverage**: 16 of 18 core ADRs have corresponding feature epic coverage
- **Priority Alignment**: Critical ADRs properly prioritized in feature backlog
- **Systematic Validation**: Framework prevents future architecture debt accumulation

## ADR Template

Each ADR follows this standard format:

```markdown
# ADR-XXX: [Title]

**Status:** [Proposed|Accepted|Implemented|Partial]  
**Date:** [YYYY-MM-DD]  
**Decision Makers:** [List]

## Context
What is the issue we're trying to solve?

## Decision  
What is the change we're proposing?

## Consequences
What becomes easier or more difficult?
```

## Status Summary

| ADR | Status | Focus Area | Implementation |
|-----|--------|------------|----------------|
| 001 | ✅ Implemented | API Strategy | `oc` CLI wrapper operational |
| 002 | 🚧 Partial | GitOps | Strategy documented, code minimal |
| 003 | ✅ Implemented | Memory | ChromaDB + JSON hybrid operational |
| 004 | 🚧 Partial | Namespaces | Basic implementation, needs enhancement |
| 005 | ✅ Implemented | Workflows | State machine with panic detection |
| 006 | 📋 Designed | Architecture | **F-008 Epic** - Plugin system |
| 007 | ✅ Implemented | Intelligence | Auto-capture operational |
| 008 | 📋 Designed | **Production** | **F-003 Epic (P1-CRITICAL)** |
| 009 | 🚧 Partial | **Security** | Strategy documented |
| 010 | 🚧 Partial | **Diagnostics** | Infrastructure correlation partial |
| 011 | 📋 Designed | **RCA** | **F-009 Epic** - Pattern recognition |
| 012 | 📋 Designed | **Data Model** | **F-002 Integration** |
| 013 | 📋 Designed | **Automation** | **F-002 Integration** |
| 014 | ✅ Implemented | Templates | Deterministic engine operational |
| 015-020 | 📋 Designed | **Future** | Deferred to future consideration |
| 021 | 📋 Designed | **Input Processing** | **F-006 Epic** - Dictionary system |
| 022 | 📋 Designed | **Type System** | **F-007 Epic** - NFM optional |

## Implementation Status

### ✅ Implemented (Production Ready - 23%)
- **OpenShift Integration** (ADR-001) - CLI wrapper with migration path
- **Memory System** (ADR-003) - ChromaDB + JSON with 156+ sessions  
- **Workflow State Machine** (ADR-005) - Panic detection operational
- **Auto-Memory Integration** (ADR-007) - Smart capture and tagging
- **Deterministic Templates** (ADR-014) - Template engine operational

### 🚧 Partially Implemented (18%)
- **GitOps Integration** (ADR-002) - Strategy complete, code minimal
- **Tool Namespaces** (ADR-004) - Basic implementation needs enhancement
- **RBAC Management** (ADR-009) - Strategy documented, implementation minimal
- **Systemic Intelligence** (ADR-010) - Infrastructure correlation partial

### 📋 Designed with Feature Coverage (59%)
All remaining ADRs have corresponding feature epics or integration plans:
- **Critical Production** (ADR-008): F-003 Epic elevated to P1-CRITICAL
- **Input Processing** (ADR-021, ADR-022): F-006 and F-007 Epics created
- **Operational Intelligence** (ADR-011, ADR-012, ADR-013): F-009 and F-002 Epics
- **Tool Architecture** (ADR-006): F-008 Epic created

## Cross-ADR Integration

The ADRs work together as a cohesive system with new input processing layer:

- **Input → Templates** (ADR-021 → ADR-014): Dictionary normalization enhances template selection
- **Templates → Intelligence** (ADR-014 → ADR-011): Structured diagnostics enable RCA patterns
- **Memory + Everything** (ADR-003, ADR-007): Memory system captures all operational patterns
- **Production Ready** (ADR-001, ADR-008): API migration enables operator deployment

## Contributing

When creating new ADRs:

1. Use the next sequential number (ADR-023+)
2. Follow the established template format
3. **Create corresponding feature epic** in sprint-management/features/
4. Update this README with the new ADR summary
5. Run ADR coverage validation: `./scripts/validate-adr-coverage.sh`
6. Consider impacts on existing ADRs and feature dependencies

---

*Last Updated: September 02, 2025 - Complete ADR coverage validation and gap remediation with 89% feature coverage achievement*
