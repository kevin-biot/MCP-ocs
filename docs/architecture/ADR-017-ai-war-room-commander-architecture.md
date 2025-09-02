# ADR-017: AI War Room Commander Architecture

**Date:** 2025-08-22  
**Status:** Proposed  
**Deciders:** Architecture Team  
**Technical Story:** Transform MCP-ocs from diagnostic tool to incident command system with multi-LLM coordination gateway

## Context

Through strategic analysis, we've identified a revolutionary market positioning for MCP-ocs: **"AI War Room Commander"** rather than a simple diagnostic tool. This positioning addresses critical operational challenges in enterprise incident response:

### Current War Room Problems
- **20-hour chaos cycles** with engineers stepping on each other
- **Duplicate investigations** across team members
- **No command authority** or coordination mechanism
- **Lost context** when engineers hand-off or rotate
- **Resource conflicts** when multiple engineers access same systems

### Market Opportunity
- **Middle East telcos** suffering from war room dysfunction
- **$725K savings per incident** vs $95K implementation cost
- **$2.7M annual savings** potential per customer
- **Cultural fit** with hierarchical command structures
- **On-premises deployment** addressing sovereignty concerns

## Decision

We will implement **AI War Room Commander Architecture** with the following components:

### 1. MCP Server as Incident Command Authority
- **Authentication & Authorization**: OIDC integration with engineer identity
- **Session Management**: Per-engineer sessions with incident scoping
- **RBAC Enforcement**: Role-based access control (Commander > Leads > Engineers)
- **Evidence Management**: All tool outputs written to shared vector DB
- **Schema Enforcement**: Tool calls follow incident command protocols

### 2. LLM Gateway (Transparent Multi-LLM Coordination)
```yaml
# LLM Gateway Service
apiVersion: v1
kind: Service
metadata:
  name: mcp-llm-gateway
spec:
  selector:
    app: mcp-llm-gateway
  ports:
  - port: 8000
    targetPort: 8000
    name: llm-api
```

**Gateway Capabilities:**
- **Masquerades as standard LLM API** (OpenAI-compatible)
- **Priority queues**: Commander > Leads > Engineers response priority
- **Load balancing**: Across multiple LLM worker pods (vLLM, MLX, Qwen)
- **Request management**: Cancellation, deduplication, budget enforcement
- **Metrics collection**: Latency, tokens, per-incident usage tracking
- **Transparent to MCP**: No changes required to existing MCP tools

### 3. LLM Worker Pods (Scale-Out Compute)
- **Stateless deployments** hosting actual models
- **OpenShift native**: Auto-scaling based on demand
- **Local LLM support**: Qwen, MLX, MoE models
- **Cloud overflow**: Route to external APIs when permitted
- **Resource isolation**: Per-worker resource limits and quotas

### 4. Shared Evidence Vector DB
- **Incident-keyed storage**: All tool outputs + LLM responses
- **Deduplication engine**: Prevent repeat work across engineers
- **Commander queries**: "What has Networking team completed?"
- **Pattern recognition**: Historical incident memory for guidance
- **HA deployment**: StatefulSet with pgvector or Milvus

## Consequences

### Positive

**Business Impact:**
- **Revolutionary positioning**: "AI War Room Commander" vs diagnostic tool
- **Competitive moat**: Only solution with incident-aware LLM coordination
- **Enterprise ready**: Complete in-cluster deployment with HA
- **Cultural fit**: Middle East hierarchical command structure alignment
- **Proven ROI**: $725K savings per incident validation

**Technical Benefits:**
- **True multi-LLM coordination**: Transparent gateway manages complexity
- **Command authority**: Priority queues enforce war room hierarchy  
- **Operational intelligence**: Shared evidence prevents conflicts
- **Enterprise deployment**: Everything inside OpenShift security boundary
- **Evolutionary architecture**: Builds on existing MCP foundation

**Operational Advantages:**
- **Faster resolution**: Priority queues reduce Commander wait time
- **Better coordination**: Shared evidence ledger prevents duplicate work
- **Cost control**: Budget enforcement prevents runaway LLM usage
- **Audit compliance**: Complete incident trail in vector database
- **Team transparency**: Real-time visibility into all engineer activities

### Negative

**Implementation Complexity:**
- **Gateway development**: New component requiring LLM API compatibility
- **Multi-tenant vector DB**: Incident isolation and performance tuning
- **Priority queue logic**: Fair queueing with role-based preemption
- **Metrics collection**: Comprehensive observability across all components

**Operational Challenges:**
- **Resource management**: LLM worker pod scaling and resource allocation
- **Gateway reliability**: Single point of failure for all LLM requests
- **Vector DB scaling**: Large incident volumes require careful capacity planning
- **Role management**: Integration with enterprise identity systems

## Implementation Strategy

### Phase 1: Foundation (Weeks 1-2)
1. **Gateway Development**
   - OpenAI-compatible API implementation
   - Basic load balancing to worker pods
   - Request routing and response handling

2. **Worker Pod Architecture**
   - Containerized LLM deployment (Qwen/MLX)
   - Resource isolation and scaling policies
   - Health checks and failure handling

### Phase 2: War Room Intelligence (Weeks 3-4)
1. **Priority Queue System**
   - Role-based request prioritization
   - Fair queuing with preemption policies
   - Budget enforcement and cancellation

2. **Shared Evidence DB**
   - Vector database integration (pgvector/Milvus)
   - Incident-scoped evidence storage
   - Deduplication and pattern recognition

### Phase 3: Command Authority (Weeks 5-6)
1. **RBAC Integration**
   - OIDC authentication with enterprise identity
   - Role-based tool access controls
   - Incident command hierarchy enforcement

2. **Operational Intelligence**
   - Cross-session pattern recognition
   - Commander status dashboards
   - Evidence-based decision support

## Architecture Diagrams

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Engineers     │────│   MCP Server     │────│  LLM Gateway    │
│  (Claude CLI)   │    │ (Auth/RBAC/Tools)│    │ (Priority/Queue)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                │                        ▼
                       ┌────────▼──────────┐    ┌─────────────────┐
                       │   Vector DB       │    │  LLM Workers    │
                       │ (Shared Evidence) │    │ (Qwen/MLX Pods) │
                       └───────────────────┘    └─────────────────┘
```

### Request Flow
```
Engineer Request → MCP Auth/RBAC → Gateway Priority Queue → LLM Worker
                                       │
                                       ▼
Vector DB ← Evidence Storage ← Tool Execution Results
```

## Relationship to Previous ADRs

**Builds Upon:**
- **ADR-003**: Memory patterns - Enhanced with shared vector DB
- **ADR-005**: Workflow state machine - Integrated with command authority
- **ADR-008**: Production operator - Foundation for in-cluster deployment
- **ADR-014**: Deterministic templates - Unchanged, enhanced with coordination
- **ADR-016**: Multi-tenancy - Incident-scoped rather than user-scoped

**Supersedes:**
- **Single-user laptop deployment** model
- **Direct LLM integration** without coordination
- **Simple diagnostic tool** positioning

## Success Metrics

**Technical Metrics:**
- Gateway latency < 200ms for priority requests
- 99.9% availability for LLM worker pools
- Vector DB query response < 100ms
- Zero evidence conflicts across engineers

**Business Metrics:**
- 50% reduction in incident resolution time
- 80% reduction in duplicate investigations
- 95% engineer satisfaction with command coordination
- 100% audit compliance for incident evidence

**Market Metrics:**
- 5 Middle East customer engagements within 60 days
- 1 paying PoC contracted ($25K) within 90 days
- Red Hat Ready certification within 45 days
- "War Room Commander" positioning validation

## Future Considerations

**V2.0 Enhancements:**
- **Advanced AI coordination**: Cross-incident pattern recognition
- **Predictive intelligence**: Proactive issue identification
- **Global deployment**: Multi-cluster incident coordination
- **Advanced analytics**: War room performance optimization

**Integration Opportunities:**
- **ServiceNow/Jira**: Incident ticket integration
- **Slack/Teams**: War room communication coordination
- **Grafana/Prometheus**: Metrics and alerting integration
- **Red Hat Advanced Cluster Management**: Multi-cluster visibility

## Conclusion

The **AI War Room Commander Architecture** transforms MCP-ocs from a diagnostic tool into a comprehensive incident command system. By implementing transparent multi-LLM coordination through the gateway pattern, we create a unique competitive advantage while maintaining the proven deterministic template foundation.

This architecture enables our strategic positioning in the Middle East market with a validated $725K ROI per incident, creating a platform for significant revenue growth through the "War Room Transformation" consulting model.

The evolutionary approach building on existing ADR foundations minimizes risk while enabling revolutionary business impact through the incident command paradigm.

---

**Related Documents:**
- Strategic Session Summary: `/docs/STRATEGIC_SESSION_SUMMARY.md`
- Business Model: "War Room Transformation" Package ($95K → $2.7M savings)
- Target Market: Middle East telcos and large enterprises
- Implementation Timeline: 30-day V1.1 sprint with gateway architecture
