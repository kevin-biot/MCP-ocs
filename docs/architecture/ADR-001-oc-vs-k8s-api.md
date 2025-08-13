# ADR-001: OpenShift vs Kubernetes API Client Decision

**Status:** Accepted  
**Date:** August 10, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs needs to interact with OpenShift clusters to perform diagnostics and operations. We have three main approaches:

1. **`oc` CLI Wrapper** - Execute shell commands via Node.js
2. **Kubernetes API Client** - Direct API calls via @kubernetes/client-node
3. **Hybrid Approach** - `oc` for OpenShift-specific, K8s API for standard operations

### Current Situation
- Development happening on laptop with existing `oc` CLI access
- Target AWS OpenShift cluster already configured and accessible
- Need rapid iteration and testing against real cluster
- Future plans for containerized deployment in-cluster
- **OPERATOR REQUIREMENT:** Production operator deployment mandates Kubernetes API migration
- **RBAC CONSTRAINT:** Pod environment prohibits shell command execution
- **TIMELINE CRITICAL:** Operator deployment timeline requires API migration completion

## Decision

**Phase 1 (Current): `oc` CLI Wrapper**
- Use shell command execution for all OpenShift operations
- Leverage existing authentication and cluster access
- Focus on rapid development and testing

**Phase 2 (Future): Kubernetes API Client Migration**
- Migrate to @kubernetes/client-node for standard operations
- Retain `oc` wrapper for OpenShift-specific features (Routes, ImageStreams, SCCs)
- Enable in-cluster deployment with ServiceAccount authentication

**MANDATORY TIMELINE FOR OPERATOR DEPLOYMENT:**
- **Month 1-2:** API migration must be completed
- **Month 3:** Operator deployment preparation
- **Month 4:** Production operator deployment
- **No Shell Access:** Pod environment cannot execute `oc` commands
- **ServiceAccount Auth:** Must use Kubernetes ServiceAccount tokens
- **RBAC Integration:** API calls must respect ADR-009 permission constraints

## Rationale

### Why `oc` CLI Wrapper First:
✅ **Rapid Development** - Leverage existing knowledge and setup  
✅ **Existing Authentication** - Works with current kubeconfig  
✅ **OpenShift Features** - Full access to Routes, ImageStreams, SCCs  
✅ **Proven Workflow** - Use familiar commands and output formats  
✅ **Quick Testing** - Immediate validation against real cluster  

### Why Kubernetes API Later:
✅ **Performance** - Direct API calls vs shell execution overhead  
✅ **Type Safety** - Full TypeScript interfaces and validation  
✅ **Streaming** - Real-time log tails and resource watching  
✅ **In-Cluster** - Native ServiceAccount authentication  
✅ **Standard** - Works across all Kubernetes distributions  

## Implementation

### Phase 1 Architecture:
```

## Review Date and Success Criteria

### Original Review Criteria (Updated)
Review this decision after Sprint 2.3 (Health Check implementation) to assess:
- Performance bottlenecks in shell execution
- Complexity of error handling and parsing
- **COMPLETED:** Readiness for Kubernetes API migration
- **MANDATORY:** In-cluster deployment requirements

### Operator Deployment Success Criteria
- **Zero Shell Dependencies:** No oc binary required in production pods
- **ServiceAccount Authentication:** 100% API calls use in-cluster authentication
- **RBAC Compliance:** All operations respect ADR-009 permission constraints
- **Performance Parity:** API client performance matches or exceeds oc wrapper
- **OpenShift Compatibility:** All OpenShift-specific features accessible via API
- **Migration Completeness:** All tools migrated from shell commands to API calls

---

**Updated:** August 13, 2025 - Added mandatory operator deployment requirements  
**Dependencies:** ADR-008 (Production Architecture), ADR-009 (RBAC Strategy), ADR-002 (GitOps)  
**Timeline:** CRITICAL - Month 1-2 migration required for operator deploymenttypescript
class OcWrapperClient {
  async getPods(namespace: string): Promise<Pod[]> {
    const result = await execCommand(`oc get pods -n ${namespace} -o json`);
    return JSON.parse(result.stdout).items;
  }
  
  async getRoutes(namespace: string): Promise<Route[]> {
    const result = await execCommand(`oc get routes -n ${namespace} -o json`);
    return JSON.parse(result.stdout).items;
  }
}
```

## Review Date and Success Criteria

### Original Review Criteria (Updated)
Review this decision after Sprint 2.3 (Health Check implementation) to assess:
- Performance bottlenecks in shell execution
- Complexity of error handling and parsing
- **COMPLETED:** Readiness for Kubernetes API migration
- **MANDATORY:** In-cluster deployment requirements

### Operator Deployment Success Criteria
- **Zero Shell Dependencies:** No oc binary required in production pods
- **ServiceAccount Authentication:** 100% API calls use in-cluster authentication
- **RBAC Compliance:** All operations respect ADR-009 permission constraints
- **Performance Parity:** API client performance matches or exceeds oc wrapper
- **OpenShift Compatibility:** All OpenShift-specific features accessible via API
- **Migration Completeness:** All tools migrated from shell commands to API calls

---

**Updated:** August 13, 2025 - Added mandatory operator deployment requirements  
**Dependencies:** ADR-008 (Production Architecture), ADR-009 (RBAC Strategy), ADR-002 (GitOps)  
**Timeline:** CRITICAL - Month 1-2 migration required for operator deployment

### Phase 2 Architecture:
```typescript
interface ClusterClient {
  getPods(namespace: string): Promise<Pod[]>;
  getRoutes(namespace: string): Promise<Route[]>;
}

class KubernetesApiClient implements ClusterClient {
  // Standard K8s operations via API
}

class OpenShiftExtensions {
  // OpenShift-specific operations via oc CLI
}
```

## Consequences

### Benefits:
- **Faster Time to Market** - Start with what works
- **Lower Learning Curve** - Familiar `oc` commands
- **OpenShift Completeness** - Access to all OpenShift features
- **Flexible Migration Path** - Can transition gradually

### Costs:
- **Performance Overhead** - Shell execution latency
- **Error Handling Complexity** - Parse text output vs structured API responses
- **Future Migration Work** - Will need to rewrite core operations
- **Limited Streaming** - Harder to implement real-time features

### Risks:
- **Shell Command Injection** - Must sanitize all inputs carefully
- **Output Format Changes** - `oc` output could change between versions
- **Platform Dependencies** - Requires `oc` binary installation

## Operator Deployment Requirements (ADR-008 Integration)

### Mandatory Kubernetes API Implementation

Operator deployment (ADR-008) makes Kubernetes API migration mandatory, not optional:

```typescript
// REQUIRED: ServiceAccount-based authentication in pods
class ProductionClusterClient implements ClusterClient {
  private k8sApi: k8s.CoreV1Api;
  private appsApi: k8s.AppsV1Api;
  private openShiftApi: OpenShiftApiClient;
  
  constructor() {
    // NO shell access in pods - must use ServiceAccount
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster(); // Uses in-cluster ServiceAccount token
    
    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    this.appsApi = kc.makeApiClient(k8s.AppsV1Api);
    this.openShiftApi = new OpenShiftApiClient(kc);
  }
  
  async getPods(namespace: string): Promise<Pod[]> {
    // Direct API call - NO oc command execution possible
    const response = await this.k8sApi.listNamespacedPod(namespace);
    return response.body.items;
  }
  
  async getRoutes(namespace: string): Promise<Route[]> {
    // OpenShift API extension - direct API calls
    const response = await this.openShiftApi.routes.list(namespace);
    return response.items;
  }
  
  // NO shell commands allowed in production pods
  async executeCommand(command: string): Promise<never> {
    throw new Error('Shell command execution not permitted in operator pods');
  }
}
```

### ServiceAccount Permission Requirements

Integration with ADR-009 RBAC strategy:

```yaml
# MCP Server ServiceAccount - Read-Only Operations
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: mcp-ocs-server-api-access
rules:
# Standard Kubernetes resources
- apiGroups: [""]
  resources: ["pods", "services", "events", "nodes", "namespaces"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "daemonsets"]
  verbs: ["get", "list", "watch"]
# OpenShift-specific resources
- apiGroups: ["route.openshift.io"]
  resources: ["routes"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["image.openshift.io"]
  resources: ["imagestreams", "imagestreamtags"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["build.openshift.io"]
  resources: ["builds", "buildconfigs"]
  verbs: ["get", "list", "watch"]
# NO write permissions - all writes via GitOps (ADR-002)
```

### OpenShift API Extensions for Operator

```typescript
class OpenShiftApiClient {
  constructor(private kubeConfig: k8s.KubeConfig) {}
  
  // OpenShift-specific resources via direct API
  async getRoutes(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET', 
      `/apis/route.openshift.io/v1/namespaces/${namespace}/routes`
    );
  }
  
  async getImageStreams(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET',
      `/apis/image.openshift.io/v1/namespaces/${namespace}/imagestreams`
    );
  }
  
  async getBuildConfigs(namespace: string): Promise<any> {
    return await this.makeRequest(
      'GET',
      `/apis/build.openshift.io/v1/namespaces/${namespace}/buildconfigs`
    );
  }
  
  // Security and Projects API
  async getSecurityContextConstraints(): Promise<any> {
    return await this.makeRequest(
      'GET',
      '/apis/security.openshift.io/v1/securitycontextconstraints'
    );
  }
}
```

## Migration Strategy and Timeline

### Mandatory Migration Timeline

**Month 1: API Client Foundation**
- Implement basic Kubernetes API client
- Replace core diagnostic tools (get_pods, describe_pod)
- Add ServiceAccount authentication support
- Maintain backward compatibility with oc wrapper

**Month 2: OpenShift Extensions**
- Implement OpenShift-specific API calls
- Replace Route, ImageStream, BuildConfig operations
- Add comprehensive error handling and retry logic
- Performance optimization and caching

**Month 3: Operator Preparation**
- Complete API migration for all tools
- Remove oc command dependencies
- Integration testing with RBAC constraints
- Multi-pod deployment testing

**Month 4: Production Deployment**
- Operator deployment with API-only client
- Production validation and monitoring
- Performance tuning and optimization
- Documentation and team training

### Backward Compatibility Strategy

```typescript
// Adapter pattern for gradual migration
class ClusterClientAdapter implements ClusterClient {
  private apiClient?: ProductionClusterClient;
  private ocWrapper?: OcWrapperClient;
  
  constructor(mode: 'development' | 'operator') {
    if (mode === 'operator') {
      // Operator deployment - API only
      this.apiClient = new ProductionClusterClient();
    } else {
      // Development mode - oc CLI available
      this.ocWrapper = new OcWrapperClient();
    }
  }
  
  async getPods(namespace: string): Promise<Pod[]> {
    if (this.apiClient) {
      return await this.apiClient.getPods(namespace);
    } else {
      return await this.ocWrapper!.getPods(namespace);
    }
  }
}
```
