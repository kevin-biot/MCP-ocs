# ADR-002: GitOps Integration Strategy

**Status:** Accepted  
**Date:** August 10, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs will provide write operations (apply, scale, restart) that modify cluster state. We need to decide how these operations integrate with GitOps practices and change management.

### Current Industry Practice
- **GitOps Philosophy:** Git as single source of truth for cluster state
- **Change Management:** All modifications via pull requests and approval
- **Drift Detection:** Automated reconciliation of actual vs desired state
- **Audit Trail:** Complete history of changes in git commits

### MCP-ocs Requirements
- **Emergency Operations** - Sometimes need immediate cluster changes
- **Structured Diagnostics** - Write operations as part of troubleshooting workflow
- **Learning Loop** - Capture successful changes for future automation
- **Multi-Environment** - Different risk tolerance dev vs prod

## Decision

**GitOps-First Strategy with Emergency Escape Hatch**

### Environment-Based Approach:
```typescript
ENVIRONMENT_CLASSES = {
  "dev": { 
    risk_level: "low", 
    auto_apply: true,
    gitops_required: false
  },
  "test": { 
    risk_level: "medium", 
    auto_apply: true,
    gitops_required: false
  },
  "staging": { 
    risk_level: "high", 
    auto_apply: false,
    gitops_required: true
  },
  "prod": { 
    risk_level: "critical", 
    auto_apply: false,
    gitops_required: true,
    requires_senior_approval: true
  }
}
```

### Write Operation Flow:

#### **Development/Test Environments:**
1. **Direct Apply** - Immediate cluster changes allowed
2. **Git Backfill** - Automatically create PR with applied changes
3. **Reconciliation** - Ensure Git reflects actual state

#### **Staging/Production Environments:**
1. **Git PR First** - Create pull request with proposed changes
2. **Policy Validation** - Run OPA/Gatekeeper checks in CI
3. **Approval Required** - Senior engineer review and approval
4. **ArgoCD Sync** - Automated application of approved changes
5. **Validation** - Confirm successful deployment

#### **Emergency Break-Glass:**
1. **Red Light Warnings** - Multiple confirmations required
2. **Senior Approval** - Mandatory senior engineer authorization
3. **Direct Apply** - Immediate cluster modification
4. **Mandatory Postmortem** - Automatic incident creation
5. **Git Reconciliation** - Required within 24 hours

## Implementation

### Phase 1: Direct Operations with Audit
```typescript
async function applyConfig(config: string, environment: string) {
  const envClass = ENVIRONMENT_CLASSES[environment];
  
  if (envClass.auto_apply) {
    // Direct apply in dev/test
    const result = await execCommand(`oc apply -f -`, config);
    await createGitBackfillPR(config, environment);
    return result;
  } else {
    // GitOps flow for staging/prod
    return await createGitOpsPR(config, environment);
  }
}
```

### Phase 2: Full GitOps Integration
```typescript
async function createGitOpsPR(config: string, environment: string) {
  const branch = `mcp-ocs/change-${Date.now()}`;
  const prData = {
    title: `MCP-ocs: Apply configuration to ${environment}`,
    body: generateChangeDescription(config),
    head: branch,
    base: 'main'
  };
  
  // Create branch and commit
  await gitApi.createBranch(branch);
  await gitApi.commitFile(getConfigPath(environment), config, branch);
  
  // Create PR with policy checks
  const pr = await gitApi.createPullRequest(prData);
  await triggerPolicyValidation(pr.number);
  
  return {
    type: 'gitops_pr',
    pr_url: pr.html_url,
    pr_number: pr.number,
    message: 'Pull request created - awaiting approval and ArgoCD sync'
  };
}
```

### Phase 3: Advanced Workflow Integration
```typescript
interface ChangeRequest {
  incidentId?: string;
  justification: string;
  riskAssessment: RiskLevel;
  rollbackPlan: string;
  affectedServices: string[];
  maintenanceWindow?: TimeWindow;
}

async function requestChange(change: ChangeRequest, config: string) {
  // Integrate with incident management
  // Link to diagnostic session memory
  // Include automated rollback procedures
  // Schedule deployment windows
}
```

## Rationale

### Benefits:
✅ **Change Visibility** - All modifications tracked in Git  
✅ **Approval Workflows** - Human oversight for critical changes  
✅ **Rollback Capability** - Git history enables easy reversion  
✅ **Compliance** - Audit trail for regulatory requirements  
✅ **Drift Prevention** - Git as authoritative source of truth  
✅ **Emergency Flexibility** - Break-glass for critical incidents  

### Costs:
- **Complexity** - Multi-path change management logic
- **Latency** - GitOps flow adds approval and sync delays
- **Tool Integration** - Requires Git, ArgoCD, policy engine setup
- **Learning Curve** - Teams must understand GitOps workflows

## Integration Points

### Git Repository Structure:
```
cluster-config/
├── environments/
│   ├── dev/
│   ├── test/
│   ├── staging/
│   └── prod/
├── policies/
│   ├── opa/
│   └── gatekeeper/
└── mcp-ocs/
    ├── changes/
    └── templates/
```

### ArgoCD Applications:
- **Per-environment apps** monitoring cluster-config repository
- **Automatic sync** for dev/test environments
- **Manual sync** for staging/prod with approval gates
- **Health checks** and rollback on deployment failures

### Policy Integration:
- **OPA/Gatekeeper policies** validate all configuration changes
- **Resource quotas** prevent excessive resource allocation
- **Security policies** enforce SCCs, network policies, RBAC
- **Compliance checks** ensure regulatory requirements

## Emergency Procedures

### Break-Glass Criteria:
- **Service Down** - Critical service unavailable
- **Security Incident** - Immediate remediation required
- **Data Loss Risk** - Potential for permanent data loss
- **Regulatory Violation** - Compliance deadline immediate

### Break-Glass Process:
1. **Senior Engineer Approval** - Manual authorization required
2. **Incident Documentation** - Automatic Jira ticket creation
3. **Red Light Warnings** - Multiple confirmation dialogs
4. **Direct Cluster Apply** - Bypass GitOps for speed
5. **Immediate Notification** - Alert stakeholders of emergency change
6. **Mandatory Postmortem** - Required within 24 hours
7. **Git Reconciliation** - Update repository within SLA

## Consequences

### Positive:
- **Operational Excellence** - Structured change management
- **Risk Reduction** - Approval gates prevent mistakes
- **Knowledge Capture** - All changes documented and reviewable
- **Compliance Ready** - Audit trail for enterprise requirements

### Negative:
- **Incident Response Latency** - GitOps adds delay in emergencies
- **Process Overhead** - More steps for simple changes
- **Tool Dependencies** - Requires GitOps toolchain maturity
- **Training Required** - Teams need GitOps workflow education

## Review Criteria

Evaluate after 3 months of operation:
- **Emergency Usage** - How often break-glass procedures used
- **Approval Delays** - Impact on incident resolution times
- **Change Success Rate** - GitOps vs direct apply reliability
- **Team Adoption** - Developer workflow satisfaction
- **Compliance Value** - Audit and regulatory benefits realized
