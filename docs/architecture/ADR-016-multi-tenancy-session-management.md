# ADR-016: Multi-Tenancy and Session Management

**Date:** 2025-08-22  
**Status:** Proposed  
**Deciders:** Architecture Team  
**Technical Story:** Enable secure multi-tenant operation when transitioning from laptop-based execution to shared in-cluster deployment

## Context

MCP-ocs currently operates in **single-user mode** on engineer laptops, where each instance has exclusive access to the engineer's `oc` session and credentials. As we transition to **shared in-cluster deployment** for operational efficiency, we face critical multi-tenancy challenges:

### Current Single-User Architecture
```
Engineer A → Claude → MCP-ocs (laptop A) → oc (Engineer A's token) → OpenShift
Engineer B → Claude → MCP-ocs (laptop B) → oc (Engineer B's token) → OpenShift
```

### Target Multi-Tenant Architecture
```
Engineer A → Claude → MCP-ocs (shared pod) → K8s API (Engineer A's context) → OpenShift
Engineer B → Claude → MCP-ocs (shared pod) → K8s API (Engineer B's context) → OpenShift  
Engineer C → Claude → MCP-ocs (shared pod) → K8s API (Engineer C's context) → OpenShift
```

### Key Challenges
1. **Identity Isolation**: Shared pod must execute commands with correct engineer credentials
2. **Permission Enforcement**: Each engineer's RBAC permissions must be preserved
3. **Session Management**: Time-limited sessions with proper cleanup and renewal
4. **Audit Compliance**: All actions must be traceable to individual engineers
5. **Security Boundaries**: Engineers cannot access each other's resources or sessions

## Decision

We will implement **session-based multi-tenancy** with **credential delegation** to enable secure shared execution while preserving individual engineer identity and permissions.

### Core Architecture Components

1. **Session Manager**: Creates and manages time-limited engineer sessions
2. **Credential Delegation**: Securely passes engineer tokens to shared infrastructure
3. **Execution Isolation**: Ensures tools execute with correct engineer context
4. **Audit Trail**: Complete traceability of actions to individual engineers

## Technical Implementation

### Session Architecture
```typescript
interface EngineerSession {
  sessionId: string;           // Unique session identifier
  engineerId: string;          // Engineer identity (email/username)
  token: string;              // Delegated OpenShift token
  groups: string[];           // Engineer's RBAC groups
  clusters: string[];         // Accessible clusters
  permissions: string[];      // Effective permissions
  defaultNamespace?: string;  // Engineer's default namespace
  createdAt: Date;           // Session creation time
  expiresAt: Date;           // Session expiration time
  lastActivity: Date;        // Last activity timestamp
  metadata: {
    clientIP?: string;       // Source IP for audit
    userAgent?: string;      // Client identification
    clusterContext?: string; // Current cluster context
  };
}
```

### Session Management Service
```typescript
class SessionManager {
  private sessions = new Map<string, EngineerSession>();
  private tokenValidator = new TokenValidator();
  private auditLogger = new AuditLogger();
  
  async createSession(engineerToken: string, metadata?: SessionMetadata): Promise<string> {
    // Validate engineer token and extract identity
    const identity = await this.tokenValidator.validate(engineerToken);
    
    // Check for existing active session
    const existingSession = this.findActiveSession(identity.user);
    if (existingSession) {
      await this.extendSession(existingSession.sessionId);
      return existingSession.sessionId;
    }
    
    // Create new session
    const session: EngineerSession = {
      sessionId: this.generateSecureId(),
      engineerId: identity.user,
      token: engineerToken,
      groups: identity.groups,
      clusters: identity.clusters,
      permissions: identity.permissions,
      defaultNamespace: identity.defaultNamespace,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.getSessionTTL()),
      lastActivity: new Date(),
      metadata: metadata || {}
    };
    
    this.sessions.set(session.sessionId, session);
    
    // Audit session creation
    await this.auditLogger.logSessionEvent({
      type: 'session_created',
      sessionId: session.sessionId,
      engineerId: session.engineerId,
      metadata: session.metadata
    });
    
    return session.sessionId;
  }
  
  async getSession(sessionId: string): Promise<EngineerSession | null> {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check expiration
    if (session.expiresAt < new Date()) {
      await this.destroySession(sessionId);
      return null;
    }
    
    // Update activity
    session.lastActivity = new Date();
    
    return session;
  }
  
  async executeWithSession<T>(
    sessionId: string, 
    operation: (session: EngineerSession) => Promise<T>
  ): Promise<T> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Invalid or expired session: ${sessionId}`);
    }
    
    // Create isolated execution context
    const executionContext = {
      user: session.engineerId,
      token: session.token,
      groups: session.groups,
      defaultNamespace: session.defaultNamespace,
      permissions: session.permissions
    };
    
    // Execute with proper context
    return await this.executeInContext(executionContext, operation);
  }
}
```

### MCP Tool Enhancement for Multi-Tenancy
```typescript
// Enhanced MCP tool signature with session support
async function oc_read_get_pods(params: {
  namespace: string;
  sessionId: string; // Required for multi-tenant execution
  labelSelector?: string;
  fieldSelector?: string;
}) {
  // Get engineer's session and credentials
  const session = await sessionManager.getSession(params.sessionId);
  if (!session) {
    throw new Error('Invalid or expired session');
  }
  
  // Verify engineer has access to namespace
  await rbacValidator.verifyNamespaceAccess(session, params.namespace);
  
  // Execute with engineer's credentials
  const k8sClient = createK8sClient({
    token: session.token,
    impersonateUser: session.engineerId,
    impersonateGroups: session.groups
  });
  
  const result = await k8sClient.listNamespacedPod(
    params.namespace,
    undefined, // pretty
    false, // allowWatchBookmarks
    undefined, // continue
    params.fieldSelector,
    params.labelSelector
  );
  
  // Audit the operation
  await auditLogger.logToolExecution({
    sessionId: params.sessionId,
    engineerId: session.engineerId,
    tool: 'oc_read_get_pods',
    namespace: params.namespace,
    result: 'success',
    resourceCount: result.body.items.length
  });
  
  return result.body;
}
```

### Template Engine Session Integration
```typescript
class SessionAwareTemplateEngine extends TemplateEngine {
  async buildPlan(
    template: DiagnosticTemplate, 
    context: {
      sessionId: string;    // Required for multi-tenant execution
      bounded?: boolean;
      stepBudget?: number;
      vars?: Record<string, any>;
    }
  ): Promise<PlanResult> {
    
    // Validate session
    const session = await sessionManager.getSession(context.sessionId);
    if (!session) {
      throw new Error('Invalid session for template execution');
    }
    
    // All template steps inherit session context
    const steps = template.steps.map(step => ({
      tool: step.tool,
      params: { 
        ...this.replaceVars(step.params, context.vars || {}),
        sessionId: context.sessionId // Inject session into all tool calls
      },
      rationale: step.rationale
    }));
    
    return { 
      planId: `${context.sessionId}-${template.id}`,
      steps, 
      boundaries: template.boundaries 
    };
  }
}
```

## Authentication Strategies

### Option A: Token Delegation (Recommended)
```typescript
// Engineer workflow remains unchanged
// 1. Engineer: oc login (normal workflow)
// 2. MCP Client: Extract token via oc whoami -t
// 3. MCP Client: Send token to shared MCP-ocs service
// 4. MCP-ocs: Use engineer's token for API calls

class TokenDelegationAuth {
  async authenticate(request: AuthRequest): Promise<EngineerSession> {
    const engineerToken = request.headers['X-Engineer-Token'];
    
    // Validate token with OpenShift API
    const tokenReview = await this.validateTokenWithAPI(engineerToken);
    
    if (!tokenReview.authenticated) {
      throw new Error('Invalid engineer token');
    }
    
    // Create session with engineer's identity
    return await sessionManager.createSession(engineerToken, {
      clientIP: request.ip,
      userAgent: request.headers['user-agent']
    });
  }
}
```

### Option B: Impersonation Pattern
```typescript
// MCP-ocs pod has impersonation permissions
// Uses service account to impersonate engineers

class ImpersonationAuth {
  constructor(private serviceAccount: ServiceAccount) {}
  
  async authenticate(request: AuthRequest): Promise<EngineerSession> {
    const engineerIdentity = await this.verifyEngineerIdentity(request);
    
    // Create session with impersonation context
    const session = await sessionManager.createSession(
      this.serviceAccount.token,
      {
        impersonateUser: engineerIdentity.user,
        impersonateGroups: engineerIdentity.groups
      }
    );
    
    return session;
  }
}
```

### Option C: Hybrid Delegation + Impersonation
```typescript
// Combine token delegation with impersonation fallback
class HybridAuth {
  async authenticate(request: AuthRequest): Promise<EngineerSession> {
    try {
      // Try token delegation first
      return await this.tokenDelegationAuth.authenticate(request);
    } catch (error) {
      // Fallback to impersonation for expired tokens
      return await this.impersonationAuth.authenticate(request);
    }
  }
}
```

## Security Implementation

### RBAC Preservation
```yaml
# Engineer's existing permissions are preserved
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: engineer-permissions
subjects:
- kind: User
  name: john.doe@company.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

---
# MCP-ocs impersonation permissions (if using Option B)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-impersonator
rules:
- apiGroups: [""]
  resources: ["users", "groups"]
  verbs: ["impersonate"]
- apiGroups: ["authentication.k8s.io"]
  resources: ["userextras"]
  verbs: ["impersonate"]
```

### Session Security
```typescript
class SessionSecurity {
  // Session encryption
  private encryptSession(session: EngineerSession): string {
    return AES.encrypt(JSON.stringify(session), this.getSessionKey()).toString();
  }
  
  // Token rotation
  async rotateSessionToken(sessionId: string): Promise<void> {
    const session = await sessionManager.getSession(sessionId);
    if (session) {
      const newToken = await this.refreshEngineerToken(session.token);
      session.token = newToken;
      session.lastActivity = new Date();
    }
  }
  
  // Session cleanup
  async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = this.findExpiredSessions();
    for (const session of expiredSessions) {
      await this.destroySession(session.sessionId);
    }
  }
}
```

### Audit and Compliance
```typescript
interface AuditEvent {
  timestamp: Date;
  sessionId: string;
  engineerId: string;
  eventType: 'session_created' | 'tool_executed' | 'resource_accessed' | 'session_expired';
  resource?: {
    type: string;
    namespace: string;
    name: string;
  };
  outcome: 'success' | 'failure' | 'unauthorized';
  metadata: Record<string, any>;
}

class ComplianceLogger {
  async logAuditEvent(event: AuditEvent): Promise<void> {
    // Store in multiple locations for compliance
    await Promise.all([
      this.writeToAuditLog(event),
      this.sendToSIEM(event),
      this.storeInCompliantStorage(event)
    ]);
  }
}
```

## Migration Strategy

### Phase 1: Session Infrastructure (Month 1)
- [ ] Implement SessionManager with basic token delegation
- [ ] Add sessionId to all MCP tool signatures (optional)
- [ ] Create session creation/cleanup endpoints
- [ ] Basic audit logging implementation

### Phase 2: MCP Client Enhancement (Month 2)
- [ ] Auto-session creation in MCP client startup
- [ ] Automatic sessionId injection into tool calls
- [ ] Session renewal and error handling
- [ ] Engineer workflow testing

### Phase 3: Production Deployment (Month 3)
- [ ] Deploy shared MCP-ocs service in OpenShift
- [ ] Configure RBAC for impersonation (if needed)
- [ ] Implement monitoring and alerting
- [ ] Complete audit trail validation

### Phase 4: Advanced Features (Month 4+)
- [ ] Session sharing for team collaboration
- [ ] Role switching within sessions
- [ ] Advanced security features (MFA, session recording)
- [ ] Cross-cluster session federation

## Risk Assessment

### Security Risks
- **Token Exposure**: Engineer tokens transmitted to shared service
  - *Mitigation*: TLS encryption, token encryption at rest, short TTLs
- **Session Hijacking**: Potential for session identifier compromise
  - *Mitigation*: Secure session ID generation, IP validation, regular rotation
- **Privilege Escalation**: Potential for engineers to access unauthorized resources
  - *Mitigation*: RBAC enforcement, namespace validation, audit logging

### Operational Risks
- **Session Limits**: Too many concurrent sessions could impact performance
  - *Mitigation*: Session limits per engineer, automatic cleanup, monitoring
- **Token Expiration**: Sessions fail when underlying tokens expire
  - *Mitigation*: Token refresh mechanisms, graceful degradation, user notification
- **Single Point of Failure**: Shared service becomes critical dependency
  - *Mitigation*: High availability deployment, fallback to local mode, monitoring

### Compliance Risks
- **Audit Trail Gaps**: Incomplete logging of engineer actions
  - *Mitigation*: Comprehensive audit logging, multiple storage locations, validation
- **Identity Confusion**: Actions attributed to wrong engineer
  - *Mitigation*: Strong session validation, identity verification, audit reconciliation

## Success Criteria

### Functional Success
- [ ] Multiple engineers can use shared MCP-ocs simultaneously
- [ ] Each engineer's RBAC permissions are correctly enforced
- [ ] Complete audit trail showing individual engineer actions
- [ ] Session management handles creation, renewal, and cleanup automatically

### Security Success
- [ ] Zero unauthorized cross-engineer resource access
- [ ] All engineer actions traceable to individual identity
- [ ] Session hijacking attempts detected and prevented
- [ ] Compliance audit passes with flying colors

### Operational Success
- [ ] ≤100ms additional latency for session validation
- [ ] ≥99.9% session reliability (no lost sessions)
- [ ] Automated session cleanup with zero manual intervention
- [ ] Successful migration from single-user to multi-tenant mode

### User Experience Success
- [ ] Engineers experience no workflow disruption
- [ ] Session creation and management is transparent
- [ ] Clear error messages for session-related issues
- [ ] Fallback to local mode when needed

## Decision Rationale

### Why Session-Based Multi-Tenancy?
1. **Security Isolation**: Each engineer operates in their own security context
2. **RBAC Preservation**: Existing permissions and access controls maintained
3. **Audit Compliance**: Complete traceability required for enterprise environments
4. **Operational Efficiency**: Shared infrastructure reduces resource overhead
5. **Scalability**: Foundation for supporting hundreds of concurrent engineers

### Why Token Delegation?
1. **Familiar Workflow**: Engineers continue using standard `oc login` process
2. **Security Preservation**: Engineer's existing authentication and permissions
3. **Audit Trail**: All actions traced to engineer identity, not service account
4. **Compliance**: Meets regulatory requirements for individual accountability
5. **Flexibility**: Can fallback to impersonation if needed

### Strategic Alignment
- **Enterprise Readiness**: Multi-tenancy essential for production deployment
- **Security First**: Strong isolation and audit requirements
- **Operational Efficiency**: Shared infrastructure with personal security contexts
- **Compliance**: Individual accountability and complete audit trails

## Consequences

### Positive
- **Secure Multi-Tenancy**: Multiple engineers can safely share infrastructure
- **Preserved Permissions**: Each engineer's RBAC context maintained
- **Complete Auditability**: All actions traceable to individual engineers
- **Operational Efficiency**: Shared resources with personal security boundaries
- **Enterprise Compliance**: Meets regulatory requirements for access control

### Negative
- **Increased Complexity**: Session management adds operational overhead
- **Security Surface**: Additional attack vectors through session management
- **Token Management**: Complex credential handling and rotation
- **Performance Impact**: Session validation adds latency to operations
- **Monitoring Overhead**: Need to track sessions, tokens, and audit events

### Neutral
- **Learning Curve**: Operations team needs session management skills
- **Testing Complexity**: Multi-user scenarios require comprehensive testing
- **Migration Effort**: Transition from single-user to multi-tenant architecture

## Related ADRs
- **ADR-015**: gollm Multi-Provider Enhancement (session context for LLM calls)
- **ADR-014**: Deterministic Template Engine (session integration for template execution)
- **ADR-009**: RBAC Emergency Change Management (permission enforcement)
- **ADR-003**: Memory Patterns (session-scoped memory isolation)

## Implementation Notes

### Development Priorities
1. **Security First**: Implement strong session isolation before performance optimization
2. **Backward Compatibility**: Maintain single-user mode during transition
3. **Audit Completeness**: Ensure comprehensive logging from day one
4. **Error Handling**: Graceful degradation when sessions fail

### Testing Strategy
- **Security Testing**: Session isolation, unauthorized access attempts
- **Load Testing**: Concurrent sessions, session cleanup under load
- **Failure Testing**: Token expiration, session corruption, service failures
- **Audit Testing**: Complete audit trail validation and compliance verification

This ADR establishes the foundation for **secure multi-tenant operation** while preserving **individual engineer identity and permissions** - enabling the transition from laptop-based to shared infrastructure deployment.
