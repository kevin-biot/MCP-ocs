# ADR-009: RBAC and Emergency Change Management Strategy

**Status:** Proposed  
**Date:** August 13, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

Production deployment of MCP-ocs requires comprehensive Role-Based Access Control (RBAC) that supports different engineer experience levels while maintaining security and audit compliance. The system must handle both normal GitOps workflows and emergency "house-burning-down" scenarios with proper change capture and reconciliation.

### Current Single-User Security Model
- **Personal Credentials** - Uses developer's individual kubeconfig
- **Full Cluster Access** - No permission restrictions or role separation
- **No Audit Trail** - Operations not centrally logged or tracked
- **No Change Management** - Direct cluster modifications without workflow
- **Single Point of Failure** - One person's credentials control all operations

### Production Security Requirements
- **Multi-Level RBAC** - Different permissions for junior, senior, and admin engineers
- **Principle of Least Privilege** - Minimal permissions required for each role
- **Emergency Procedures** - Break-glass scenarios with mandatory reconciliation
- **Complete Audit Trail** - All operations logged and traceable
- **Change Management Integration** - GitOps-first with emergency overrides
- **Compliance Ready** - Meets enterprise security and audit requirements

## Decision

**Layered RBAC Architecture with Emergency Change Capture**

### Core Security Principles

1. **Defense in Depth** - Multiple security layers prevent unauthorized access
2. **Principle of Least Privilege** - Users get minimum permissions needed for their role
3. **GitOps-First Security** - All changes flow through Git unless emergency override
4. **Mandatory Audit Trail** - Every operation logged with user attribution
5. **Emergency Accountability** - Emergency procedures require justification and reconciliation

## Detailed Design

### Role-Based Permission Matrix

```typescript
interface RBACPermissionMatrix {
  juniorEngineer: {
    clusterAccess: 'ReadOnly';
    namespaces: 'AssignedNamespacesOnly';
    tools: ['Diagnostic', 'Analysis', 'MemorySearch'];
    restrictions: ['NoWriteOperations', 'NoEmergencyOverride', 'NoSecretAccess'];
    escalationPath: 'SeniorEngineerApproval';
  };
  
  seniorEngineer: {
    clusterAccess: 'ReadPlus';
    namespaces: 'MultipleNamespaceAccess';
    tools: ['AllDiagnostic', 'ChangeRequest', 'EmergencyApproval'];
    permissions: ['GitOpsChangeCreation', 'EmergencyBreakGlass'];
    restrictions: ['NoDirectClusterWrite', 'RequiresJustification'];
    escalationPath: 'PlatformAdminApproval';
  };
  
  platformAdmin: {
    clusterAccess: 'FullAccess';
    namespaces: 'ClusterWideAccess';
    tools: ['AllTools', 'EmergencyOperations', 'DirectClusterAccess'];
    permissions: ['EmergencyOverride', 'RBACManagement', 'OperatorDeployment'];
    restrictions: ['MandatoryAuditTrail', 'ComplianceReporting'];
    escalationPath: 'C-LevelApproval';
  };
  
  serviceAccount: {
    clusterAccess: 'FunctionSpecific';
    permissions: ['MinimalRequired', 'ComponentSpecific'];
    restrictions: ['NoHumanInteraction', 'AutomatedOnly'];
    auditLevel: 'Enhanced';
  };
}
```

### RBAC Implementation

```yaml
# Junior Engineer Role - Read-Only Diagnostics
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-junior-engineer
rules:
# Core Kubernetes resources - read-only
- apiGroups: [""]
  resources: ["pods", "services", "events", "nodes", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "daemonsets", "statefulsets"]
  verbs: ["get", "list", "watch"]
# Pod logs for diagnostics
- apiGroups: [""]
  resources: ["pods/log"]
  verbs: ["get", "list"]
# OpenShift resources - read-only
- apiGroups: ["route.openshift.io"]
  resources: ["routes"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["image.openshift.io"]
  resources: ["imagestreams", "imagestreamtags"]
  verbs: ["get", "list", "watch"]
# Build resources for diagnostics
- apiGroups: ["build.openshift.io"]
  resources: ["builds", "buildconfigs"]
  verbs: ["get", "list", "watch"]
# NO write permissions, NO secrets access

---
# Senior Engineer Role - Diagnostics + Change Requests
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-senior-engineer
rules:
# All junior engineer permissions plus:
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list"]  # Can read configs for debugging
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]  # Limited secret access for diagnostics
  resourceNames: ["diagnostic-*"]  # Only diagnostic secrets
# Project/namespace management
- apiGroups: ["project.openshift.io"]
  resources: ["projects"]
  verbs: ["get", "list", "watch"]
# Still NO direct write permissions - only via GitOps

---
# Platform Admin Role - Emergency Operations
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-platform-admin
rules:
# Full cluster access for emergency scenarios
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]
# With mandatory audit trail and justification
```

## Emergency Change Management

### Emergency Classification System

```typescript
enum EmergencyLevel {
  LEVEL_1 = 'service_degraded',      // Minor impact, can wait for GitOps
  LEVEL_2 = 'service_down',          // Service unavailable, expedited GitOps
  LEVEL_3 = 'data_loss_risk',        // Potential data loss, break-glass allowed
  LEVEL_4 = 'security_breach',       // Security incident, immediate action required
  LEVEL_5 = 'house_burning_down'     // Critical infrastructure failure
}

interface EmergencyJustification {
  level: EmergencyLevel;
  impact: string;
  affectedSystems: string[];
  businessJustification: string;
  timeConstraints: string;
  approver: string;
  estimatedDuration: number; // minutes
}
```

### Emergency Change Workflow

```typescript
class EmergencyChangeManager {
  async requestEmergencyChange(
    request: EmergencyChangeRequest
  ): Promise<EmergencyApproval> {
    
    // 1. Validate emergency criteria
    await this.validateEmergencyCriteria(request);
    
    // 2. Check user authorization
    await this.validateEmergencyPermissions(request.requester);
    
    // 3. Multi-step approval for high-level emergencies
    if (request.level >= EmergencyLevel.LEVEL_3) {
      await this.requireSeniorApproval(request);
    }
    
    if (request.level >= EmergencyLevel.LEVEL_4) {
      await this.requirePlatformAdminApproval(request);
    }
    
    // 4. Create emergency session with enhanced monitoring
    const emergencySession = await this.createEmergencySession({
      request,
      startTime: new Date(),
      requester: request.requester,
      approver: request.approver,
      monitoringLevel: 'enhanced'
    });
    
    return {
      approved: true,
      sessionId: emergencySession.id,
      timeLimit: request.estimatedDuration,
      auditTrail: emergencySession.auditTrail,
      reconciliationDeadline: this.calculateReconciliationDeadline(request.level)
    };
  }
}
```

## Multi-Tenancy and Team Isolation

### Team-Based Namespace Access

```yaml
# Team Alpha - Development Focus
apiVersion: v1
kind: Namespace
metadata:
  name: team-alpha-dev
  labels:
    team: "alpha"
    environment: "development"
    mcp-ocs-access: "enabled"
  annotations:
    mcp-ocs.io/permitted-roles: "junior-engineer,senior-engineer"
    mcp-ocs.io/emergency-level: "level-2-max"

---
# Team Alpha RBAC
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: team-alpha-mcp-access
  namespace: team-alpha-dev
subjects:
- kind: Group
  name: team-alpha-engineers
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: mcp-ocs-junior-engineer
  apiGroup: rbac.authorization.k8s.io

---
# Production Namespace - Restricted Access
apiVersion: v1
kind: Namespace
metadata:
  name: team-alpha-prod
  labels:
    team: "alpha"
    environment: "production"
    mcp-ocs-access: "restricted"
  annotations:
    mcp-ocs.io/permitted-roles: "senior-engineer,platform-admin"
    mcp-ocs.io/emergency-level: "level-4-max"
    mcp-ocs.io/requires-approval: "true"
```

## Authentication and Authorization Flow

```typescript
class MCPOcsAuthenticationManager {
  async authenticateUser(token: string): Promise<AuthenticatedUser> {
    // 1. Validate token against OpenShift OAuth
    const oauthResult = await this.validateOAuthToken(token);
    
    // 2. Resolve user groups and team membership
    const userGroups = await this.resolveUserGroups(oauthResult.username);
    
    // 3. Determine MCP-ocs role based on group membership
    const mcpRole = await this.determineMCPRole(userGroups);
    
    // 4. Load namespace permissions
    const namespaceAccess = await this.loadNamespacePermissions(
      oauthResult.username, 
      userGroups
    );
    
    // 5. Generate session with permissions
    return {
      username: oauthResult.username,
      groups: userGroups,
      mcpRole,
      namespaceAccess,
      permissions: await this.calculatePermissions(mcpRole, namespaceAccess),
      sessionId: this.generateSessionId(),
      expiresAt: this.calculateExpiration()
    };
  }
}
```

## Implementation Strategy

### Phase 1: Basic RBAC (Month 1)
- Implement user authentication integration
- Create basic role definitions (junior, senior, admin)
- Add namespace-based access control
- Basic audit trail implementation

### Phase 2: Emergency Procedures (Month 2)
- Emergency change classification system
- Break-glass procedures with approval workflow
- Real-time change capture implementation
- Git reconciliation automation

### Phase 3: Advanced Compliance (Month 3)
- Comprehensive audit framework
- Automated compliance checking
- SIEM integration for security monitoring
- Advanced reporting and analytics

### Phase 4: Multi-Tenancy (Month 4)
- Team-based isolation and resource quotas
- Advanced namespace management
- Cross-team emergency procedures
- Federated authentication integration

## Rationale

### Benefits of Layered RBAC:
✅ **Security by Default** - Minimal permissions prevent accidental damage  
✅ **Role-Appropriate Access** - Engineers get permissions matching their experience level  
✅ **Emergency Flexibility** - Break-glass procedures for critical incidents  
✅ **Complete Audit Trail** - Every operation tracked for compliance  
✅ **GitOps Integration** - Changes flow through proper approval workflows  
✅ **Multi-Tenant Support** - Team isolation and resource protection  

### Addresses Production Security Requirements:
✅ **Principle of Least Privilege** - Users get minimum required permissions  
✅ **Emergency Accountability** - Emergency procedures require justification  
✅ **Compliance Ready** - Comprehensive audit trail and reporting  
✅ **Multi-Level Security** - Defense in depth approach  
✅ **Change Management** - GitOps-first with emergency overrides  

## Consequences

### Benefits:
- **Enterprise Security** - Production-ready RBAC and audit capabilities
- **Compliance Automation** - Automated compliance checking and reporting
- **Emergency Response** - Proper procedures for critical incidents
- **Team Collaboration** - Multi-tenant support with proper isolation

### Costs:
- **Implementation Complexity** - Sophisticated RBAC and audit system
- **Administrative Overhead** - Role management and compliance monitoring
- **User Training** - Engineers need training on new procedures
- **Performance Impact** - Audit trail and authorization checks add latency

### Risks:
- **Permission Creep** - Users may accumulate unnecessary permissions over time
- **Emergency Abuse** - Emergency procedures could be misused
- **Audit Storage** - Comprehensive audit trail requires significant storage
- **Compliance Gaps** - Automated compliance checking may miss edge cases

## Review and Success Criteria

### Security Metrics:
- **Zero Unauthorized Access** - No users able to exceed their assigned permissions
- **100% Emergency Reconciliation** - All emergency changes reconciled within deadline
- **Complete Audit Coverage** - Every operation recorded in audit trail
- **Role Compliance** - Users consistently use appropriate permission levels

### Operational Metrics:
- **Emergency Response Time** - Break-glass procedures executable within SLA
- **Compliance Score** - Automated compliance checking shows 95%+ compliance
- **User Satisfaction** - Engineers can effectively perform their roles
- **Audit Performance** - Audit trail queries complete within acceptable time

### Compliance Metrics:
- **Audit Trail Completeness** - 100% of operations captured in audit log
- **Emergency Justification** - All emergency operations have proper justification
- **Role Separation** - Clear separation of duties between engineer levels
- **Change Traceability** - All cluster changes traceable to authorized requests

---

**Implementation Priority:** Critical for production deployment  
**Dependencies:** ADR-008 (Production Architecture), ADR-002 (GitOps Strategy)  
**Review Date:** After Phase 1 RBAC implementation
