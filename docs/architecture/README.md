# Architecture Decision Records

This directory contains the technical decisions and architectural rationale for the MCP-ocs project. All ADRs follow a consistent format to document context, decisions, and consequences of major architectural choices.

## Current ADRs

### Foundation Architecture
- **[ADR-001: OpenShift vs Kubernetes API Client Decision](./ADR-001-oc-vs-k8s-api.md)** - *Accepted*  
  Phased approach: Start with `oc` CLI wrapper for rapid development, migrate to Kubernetes API client for production scalability

- **[ADR-002: GitOps Integration Strategy](./ADR-002-gitops-strategy.md)** - *Accepted*  
  Environment-based GitOps workflow with emergency break-glass procedures for dev/test vs staging/prod

### Memory and Intelligence Systems  
- **[ADR-003: Memory Storage and Retrieval Patterns](./ADR-003-memory-patterns.md)** - *Accepted*  
  Hybrid ChromaDB + JSON fallback architecture for operational intelligence with auto-context extraction

- **[ADR-007: Automatic Tool Memory Integration](./ADR-007-automatic-tool-memory-integration.md)** - *Accepted*  
  Zero-effort automatic capture and tagging of tool executions for operational intelligence and RED ZONE pattern recognition

### Tool and Workflow Architecture
- **[ADR-004: Tool Namespace Management](./ADR-004-tool-namespace-management.md)** - *Accepted*  
  Hierarchical tool namespace architecture with context-aware filtering to prevent tool confusion across MCP domains

- **[ADR-005: Workflow State Machine Design](./ADR-005-workflow-state-machine.md)** - *Accepted*  
  Structured diagnostic workflow with panic detection to prevent "4 AM panic operations" and enforce evidence-based troubleshooting

- **[ADR-006: Modular Tool Plugin Architecture](./ADR-006-modular-tool-architecture.md)** - *Proposed*  
  Plugin-based architecture for scalable tool expansion supporting Tekton, GitOps, and custom organizational tools

### Production Deployment & Security
- **[ADR-008: Production Operator Architecture](./ADR-008-production-operator-architecture.md)** - *Proposed*  
  Multi-pod operator deployment with external memory services, RBAC constraints, and GitOps integration

- **[ADR-009: RBAC and Emergency Change Management](./ADR-009-rbac-emergency-change-management.md)** - *Proposed*  
  Layered RBAC with role-based permissions, emergency break-glass procedures, and comprehensive audit trails

### Advanced Intelligence & Diagnostics
- **[ADR-010: Systemic Diagnostic Intelligence](./ADR-010-systemic-diagnostic-intelligence.md)** - *Proposed*  
  Root cause chain analysis, infrastructure correlation, and cross-system failure analysis to address diagnostic tool limitations

## Architecture Overview

For a complete system overview, see [ARCHITECTURE.md](./ARCHITECTURE.md) which provides:
- System component relationships
- Data flow diagrams  
- Technology stack decisions
- Integration patterns

## ADR Template

Each ADR follows this standard format:

```markdown
# ADR-XXX: [Title]

**Status:** [Proposed|Accepted|Superseded]  
**Date:** [YYYY-MM-DD]  
**Decision Makers:** [List]

## Context
What is the issue we're trying to solve?

## Decision  
What is the change we're proposing?

## Consequences
What becomes easier or more difficult?
```

## Related Documentation

- **Implementation Specs:** See [../implementation/](../implementation/) for detailed technical specifications
- **Developer Guides:** See [../guides/](../guides/) for workflow and development guidance  
- **Reference Materials:** See [../reference/](../reference/) for API documentation and quick lookups

## Status Summary

| ADR | Status | Focus Area | Key Decision |
|-----|--------|------------|-------------|
| 001 | ✅ Accepted | API Strategy | `oc` CLI → K8s API migration path **MANDATORY for operator** |
| 002 | ✅ Accepted | GitOps | Environment-based workflows with emergency change capture |
| 003 | ✅ Accepted | Memory | ChromaDB + JSON hybrid with auto-extraction |
| 004 | ✅ Accepted | Namespaces | Context-aware tool filtering prevents confusion |
| 005 | ✅ Accepted | Workflows | State machine prevents panic operations |
| 006 | 🔄 Proposed | Architecture | Modular plugin system for tool expansion |
| 007 | ✅ Accepted | Intelligence | Automatic memory capture for pattern recognition |
| 008 | 🔄 Proposed | **Production** | **Multi-pod operator architecture** |
| 009 | 🔄 Proposed | **Security** | **RBAC and emergency change management** |
| 010 | 🔄 Proposed | **Diagnostics** | **Systemic intelligence and root cause chain analysis** |

## Problem Areas Addressed

### Tool Management & Organization
- **ADR-004** solves tool namespace conflicts (Atlassian vs file memory confusion)
- **ADR-006** enables scalable tool expansion (Tekton, GitOps, custom tools)
- Context-aware filtering ensures appropriate tools for operational domains

### Operational Intelligence & Safety
- **ADR-005** prevents destructive "4 AM panic operations" with structured workflows
- **ADR-007** automatically captures operational knowledge for pattern recognition
- **ADR-003** provides fast similarity search for incident correlation

### Infrastructure & Integration
- **ADR-001** provides pragmatic OpenShift integration with migration path
- **ADR-002** balances GitOps best practices with emergency flexibility
- Environment-appropriate change management (dev vs prod)

## Implementation Status

### Completed (Accepted ADRs)
- ✅ **OpenShift CLI Integration** - Functional with command sanitization
- ✅ **Memory System** - ChromaDB + JSON operational, 43+ sessions stored
- ✅ **Tool Namespace Management** - Context-aware filtering implemented
- ✅ **Workflow State Machine** - Panic detection and evidence requirements
- ✅ **Auto-Memory System** - Smart tagging and pattern recognition operational
- ✅ **GitOps Integration** - Environment-based change management

### In Progress (Proposed ADRs)
- 🔄 **Modular Plugin Architecture** - Design complete, implementation pending
- 🔄 **Tekton Tools Module** - Awaiting plugin system completion

## Cross-ADR Integration

The ADRs work together as a cohesive system:

- **Memory + Workflows** (ADR-003 + ADR-005): Memory-guided workflow suggestions prevent repetitive troubleshooting
- **Namespaces + Plugins** (ADR-004 + ADR-006): Namespace management scales with modular tool expansion
- **GitOps + Workflows** (ADR-002 + ADR-005): State machine integrates with environment-appropriate change management
- **Auto-Memory + All** (ADR-007): Automatic capture works across all tool domains and workflow states

## Contributing

When creating new ADRs:

1. Use the next sequential number (ADR-008, ADR-009, etc.)
2. Follow the established template format
3. Include clear context, decision rationale, and consequences
4. Update this README with the new ADR summary
5. Consider impacts on existing ADRs (mark as Superseded if needed)
6. Ensure integration with the overall architectural vision

---

*Last Updated: August 13, 2025 - Post documentation reorganization with accurate ADR content verification*
