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

## Decision

**Phase 1 (Current): `oc` CLI Wrapper**
- Use shell command execution for all OpenShift operations
- Leverage existing authentication and cluster access
- Focus on rapid development and testing

**Phase 2 (Future): Kubernetes API Client Migration**
- Migrate to @kubernetes/client-node for standard operations
- Retain `oc` wrapper for OpenShift-specific features (Routes, ImageStreams, SCCs)
- Enable in-cluster deployment with ServiceAccount authentication

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
```typescript
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

## Review Date

Review this decision after Sprint 2.3 (Health Check implementation) to assess:
- Performance bottlenecks in shell execution
- Complexity of error handling and parsing
- Readiness for Kubernetes API migration
- In-cluster deployment requirements
