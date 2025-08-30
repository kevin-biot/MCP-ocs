# ADR-019: Multi-Tenancy Strategy - Progressive Evolution

**Date:** 2025-08-22  
**Status:** Deferred Implementation  
**Deciders:** Architecture Team  
**Technical Story:** Define multi-tenancy evolution path while prioritizing single-user production deployment

## Context

MCP-ocs is currently designed for **single-user execution** (engineer laptop with personal oc session). Our immediate goal is **production deployment for OpenShift operations teams**. Multi-tenancy becomes relevant when moving from laptop-based to shared infrastructure, but this transition should happen **after proving core functionality**.

### Current Single-User Architecture (V1 Target)
```
Engineer A → Claude → MCP-ocs (laptop A) → oc (Engineer A's session) → OpenShift
Engineer B → Claude → MCP-ocs (laptop B) → oc (Engineer B's session) → OpenShift
```

### Future Multi-Tenant Architecture (V2+ Option)
```
Engineer A → Claude → MCP-ocs (shared pod) → OpenShift API (Engineer A's context)
Engineer B → Claude → MCP-ocs (shared pod) → OpenShift API (Engineer B's context)  
Engineer C → Claude → MCP-ocs (shared pod) → OpenShift API (Engineer C's context)
```

## Decision

We will **implement single-user architecture first** and design for **future multi-tenancy evolution** without building multi-tenant complexity upfront.

### Core Strategy: **Progressive Architecture Evolution**

#### V1: Single-User Production (Immediate)
- Deploy MCP-ocs per-engineer or per-team
- Use engineer's direct oc credentials
- Focus on proving diagnostic value
- Establish operational patterns

#### V2: Shared Infrastructure (Future)
- Transition to shared MCP-ocs deployment
- Implement session-based multi-tenancy
- Add credential delegation/impersonation
- Scale operational efficiency

#### V3: Enterprise Multi-Tenancy (Long-term)
- Cross-cluster session federation
- Advanced RBAC integration
- Audit compliance features
- Enterprise identity integration

## V1 Implementation (Current Priority)

### Architecture Decisions for V1
```typescript
// Simple single-user configuration
interface MCPOcsConfig {
  mode: 'single-user';
  credentials: {
    type: 'oc-session' | 'service-account';
    token?: string;
    kubeconfig?: string;
  };
  audit: {
    enabled: boolean;
    engineerId: string;  // Static for single-user mode
  };
}
```

### Tool Implementation (V1)
```typescript
// Tools designed for single-user but multi-tenancy ready
async function oc_diagnostic_pod_health(params: {
  namespace: string;
  podName: string;
  // Future: sessionId?: string; // Commented out for V1
}) {
  // V1: Use current oc session
  const credentials = getCurrentOcCredentials();
  
  // V2: Will use session-based credentials
  // const session = await sessionManager.getSession(params.sessionId);
  // const credentials = session.credentials;
  
  const evidence = await collectPodEvidence(params, credentials);
  return evidence;
}
```

### Deployment Strategy (V1)
```yaml
# Option A: Per-Engineer Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-ocs-engineer-john
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: mcp-ocs
        env:
        - name: ENGINEER_ID
          value: "john.doe"
        - name: OC_TOKEN
          valueFrom:
            secretKeyRef:
              name: john-oc-credentials
              key: token

---
# Option B: Per-Team Deployment  
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-ocs-platform-team
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: mcp-ocs
        env:
        - name: TEAM_ID
          value: "platform-team"
        - name: OC_TOKEN
          valueFrom:
            secretKeyRef:
              name: platform-team-credentials
              key: token
```

## V2 Multi-Tenancy Design (Future Implementation)

### Session Management Architecture
```typescript
interface EngineerSession {
  sessionId: string;
  engineerId: string;
  credentials: {
    token: string;
    clusters: string[];
    namespaces: string[];
    permissions: string[];
  };
  metadata: {
    createdAt: Date;
    lastActivity: Date;
    clientInfo: string;
  };
  ttl: number;
}

class SessionManager {
  // V2: Full session management
  async createSession(engineerToken: string): Promise<string> {
    const identity = await this.validateToken(engineerToken);
    const sessionId = this.generateSessionId();
    
    const session: EngineerSession = {
      sessionId,
      engineerId: identity.user,
      credentials: {
        token: engineerToken,
        clusters: identity.clusters,
        namespaces: identity.namespaces,
        permissions: identity.permissions
      },
      metadata: {
        createdAt: new Date(),
        lastActivity: new Date(),
        clientInfo: 'claude-mcp-client'
      },
      ttl: 2 * 60 * 60 * 1000 // 2 hours
    };
    
    await this.storeSession(session);
    return sessionId;
  }
}
```

### Authentication Strategies (V2 Options)

#### Option A: Token Delegation
```typescript
// Engineer workflow: oc login → extract token → delegate to shared service
class TokenDelegationAuth {
  async authenticate(engineerToken: string): Promise<EngineerSession> {
    // Validate token with OpenShift API
    const tokenReview = await this.validateWithAPI(engineerToken);
    if (!tokenReview.authenticated) {
      throw new Error('Invalid engineer token');
    }
    
    return await this.sessionManager.createSession(engineerToken);
  }
}
```

#### Option B: Impersonation Pattern
```typescript
// Service account with impersonation permissions
class ImpersonationAuth {
  async authenticate(engineerIdentity: EngineerIdentity): Promise<EngineerSession> {
    const serviceAccountToken = await this.getServiceAccountToken();
    
    return await this.sessionManager.createSession(serviceAccountToken, {
      impersonateUser: engineerIdentity.user,
      impersonateGroups: engineerIdentity.groups
    });
  }
}
```

### Tool Enhancement for Multi-Tenancy (V2)
```typescript
// V2: Session-aware tool execution
async function oc_diagnostic_pod_health(params: {
  namespace: string;
  podName: string;
  sessionId: string; // Required in V2
}) {
  // Get engineer's session context
  const session = await sessionManager.getSession(params.sessionId);
  if (!session) {
    throw new Error('Invalid or expired session');
  }
  
  // Verify engineer has access to namespace
  await this.verifyNamespaceAccess(session, params.namespace);
  
  // Execute with engineer's credentials
  const k8sClient = this.createK8sClient(session.credentials);
  const evidence = await collectPodEvidence(params, k8sClient);
  
  // Audit the operation
  await this.auditLogger.log({
    sessionId: params.sessionId,
    engineerId: session.engineerId,
    operation: 'pod_health_diagnostic',
    namespace: params.namespace,
    timestamp: new Date()
  });
  
  return evidence;
}
```

## Migration Strategy

### Phase 1: V1 Production Deployment (Months 1-6)
- [ ] **Single-User Architecture**: Deploy per-engineer or per-team
- [ ] **Prove Value**: Establish diagnostic effectiveness
- [ ] **Operational Learning**: Understand real-world usage patterns
- [ ] **Performance Baseline**: Document resource usage and scaling characteristics

### Phase 2: Multi-Tenancy Evaluation (Months 6-9)
- [ ] **Requirements Analysis**: Gather multi-tenancy requirements from operations teams
- [ ] **Architecture Planning**: Detailed design for session management
- [ ] **Prototype Development**: Test session management concepts
- [ ] **Migration Strategy**: Plan transition from V1 to V2

### Phase 3: V2 Implementation (Months 9-15)
- [ ] **Session Management**: Implement core session infrastructure
- [ ] **Tool Migration**: Update tools for session-aware execution
- [ ] **Deployment Migration**: Transition from per-user to shared deployments
- [ ] **Validation**: Ensure security isolation and audit compliance

### Phase 4: V3 Enterprise Features (Months 15+)
- [ ] **Advanced Features**: Cross-cluster federation, advanced RBAC
- [ ] **Enterprise Integration**: SSO, identity providers, compliance features
- [ ] **Scale Optimization**: Performance tuning for large organizations
- [ ] **Advanced Audit**: Compliance reporting and security features

## Design Principles for All Versions

### Security First
- **V1**: Engineer credentials never leave their control
- **V2**: Session isolation with complete audit trail
- **V3**: Enterprise-grade identity and compliance integration

### Backward Compatibility
- **V1→V2**: Single-user deployments continue working
- **V2→V3**: Session-based architecture preserved
- **Gradual Migration**: No forced upgrades, opt-in evolution

### Operational Simplicity
- **V1**: Minimal operational overhead
- **V2**: Session management with automatic cleanup
- **V3**: Enterprise features with operational automation

## Success Criteria by Version

### V1 Success Criteria
- [ ] **Production Deployment**: MCP-ocs running in OpenShift for operations teams
- [ ] **User Adoption**: Engineers actively using for daily diagnostics
- [ ] **Reliability**: ≥99% uptime for 3 months
- [ ] **Performance**: <2s average response time for diagnostic templates

### V2 Success Criteria
- [ ] **Multi-User Operation**: Multiple engineers using shared infrastructure
- [ ] **Security Isolation**: Zero unauthorized cross-engineer access
- [ ] **Audit Compliance**: Complete action traceability
- [ ] **Performance**: <200ms additional latency for session management

### V3 Success Criteria
- [ ] **Enterprise Scale**: Support for 100+ concurrent engineers
- [ ] **Cross-Cluster**: Session federation across multiple OpenShift clusters
- [ ] **Compliance**: SOC2, HIPAA, or equivalent audit compliance
- [ ] **Advanced Features**: Role delegation, team collaboration, advanced analytics

## Risk Assessment

### V1 Risks (Manageable)
- **Resource Usage**: Per-user deployments may be resource intensive
  - *Mitigation*: Start with per-team deployments, monitor usage
- **Credential Management**: Individual oc tokens require management
  - *Mitigation*: Use existing OpenShift RBAC and credential rotation

### V2 Risks (Moderate)
- **Session Complexity**: Session management adds operational overhead
  - *Mitigation*: Extensive testing, automated session cleanup
- **Security Surface**: Shared infrastructure increases attack vectors
  - *Mitigation*: Strong session isolation, comprehensive audit logging

### V3 Risks (Complex)
- **Enterprise Integration**: Complex identity provider integration
  - *Mitigation*: Phased rollout, extensive testing with enterprise systems
- **Scale Challenges**: Performance issues at enterprise scale
  - *Mitigation*: Load testing, performance optimization, caching strategies

## Decision Rationale

### Why Start with V1?
1. **Immediate Value**: Get diagnostic capabilities to users quickly
2. **Learning Opportunity**: Understand real usage patterns before optimizing
3. **Risk Reduction**: Validate core assumptions with simpler architecture
4. **Resource Focus**: Concentrate on diagnostic effectiveness, not infrastructure

### Why Plan for V2/V3?
1. **Architectural Guidance**: Ensure V1 decisions don't preclude future evolution
2. **Stakeholder Communication**: Document evolution path for planning
3. **Investment Protection**: Show path to enterprise-scale deployment
4. **Technical Debt Avoidance**: Design current architecture for future expansion

### Strategic Alignment
- **Ship First**: Get working solution to users quickly
- **Learn Fast**: Use production experience to guide evolution
- **Scale Smart**: Build complexity only when justified by business value
- **Security Always**: Maintain security principles across all versions

## Related ADRs
- **ADR-015**: kubectl-ai Future Enhancement (may provide session management capabilities)
- **ADR-014**: Deterministic Template Engine (session context for template execution)
- **ADR-009**: RBAC Emergency Change Management (permission model evolution)
- **ADR-003**: Memory Patterns (session-scoped vs global memory)

## Future Decision Points

### V1→V2 Triggers
- **Resource Constraints**: Per-user deployments become resource prohibitive
- **Operational Efficiency**: Shared infrastructure provides clear operational benefits
- **User Demand**: Engineers request shared collaboration features
- **Cost Pressure**: Organization needs to optimize infrastructure costs

### V2→V3 Triggers
- **Enterprise Requirements**: Large organization adoption requires advanced features
- **Compliance Needs**: Regulatory requirements for advanced audit and identity integration
- **Scale Demands**: Current architecture hits performance or operational limits
- **Competitive Pressure**: Market requires enterprise-grade features

This ADR establishes a **pragmatic evolution path** that prioritizes **immediate production value** while preserving **future enhancement options** based on real-world experience and demonstrated business need.
