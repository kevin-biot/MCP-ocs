# MCP-OCS v2.0 Test Cases Specification

## 📋 **Test Case Framework**

Based on the `oc CLI mapping cheatsheet`, this document defines comprehensive test scenarios that validate each tool against real OpenShift cluster behavior.

---

## 🧪 **Test Strategy Overview**

### **Test Categories**
1. **Unit Tests** - Individual function validation
2. **Integration Tests** - Tool vs real `oc` command comparison
3. **Validation Tests** - Real cluster scenario testing
4. **Performance Tests** - SLA compliance verification
5. **Edge Case Tests** - Error handling and boundary conditions

### **Test Environment Requirements**
- **Live OpenShift cluster** with known state
- **Multiple namespaces** with different health conditions
- **ChromaDB instance** for RAG testing
- **Historical data set** for pattern matching tests

---

## 🎯 **UC-1: check_namespace_health Test Cases**

### **Test Case 1.1: Healthy Namespace**
```typescript
describe('check_namespace_health - Healthy Namespace', () => {
  const testNamespace = 'healthy-test-ns';
  
  beforeAll(async () => {
    // Setup: Create namespace with healthy resources
    await createHealthyTestNamespace(testNamespace);
  });
  
  it('should report healthy status for all-green namespace', async () => {
    const result = await checkNamespaceHealth({
      namespace: testNamespace,
      includeIngressTest: false
    });
    
    expect(result.status).toBe('healthy');
    expect(result.checks.pods.ready).toEqual(result.checks.pods.total);
    expect(result.checks.pvcs.pending).toBe(0);
    expect(result.suspicions).toHaveLength(0);
  });
  
  it('should match real oc command output', async () => {
    // Compare tool output with direct oc commands
    const realPods = await execOc(['get', 'pods', '-n', testNamespace, '-o', 'json']);
    const realPodCount = JSON.parse(realPods).items.length;
    
    const toolResult = await checkNamespaceHealth({ namespace: testNamespace });
    
    expect(toolResult.checks.pods.total).toBe(realPodCount);
  });
});
```

### **Test Case 1.2: Degraded Namespace - CrashLoop Pods**
```typescript
describe('check_namespace_health - CrashLoop Detection', () => {
  const testNamespace = 'crashloop-test-ns';
  
  beforeAll(async () => {
    // Setup: Create pod with crashloop condition
    await createCrashLoopPod(testNamespace, 'crashloop-pod');
  });
  
  it('should detect crashloop pods accurately', async () => {
    const result = await checkNamespaceHealth({ namespace: testNamespace });
    
    expect(result.status).toBe('degraded');
    expect(result.checks.pods.crashloops).toContain('crashloop-pod');
    expect(result.suspicions).toContainEqual(
      expect.stringMatching(/crashloop|restart/i)
    );
  });
  
  it('should match oc crashloop detection', async () => {
    // Validate against real oc command
    const realPods = await execOc(['get', 'pods', '-n', testNamespace, '-o', 'json']);
    const realCrashLoops = JSON.parse(realPods).items.filter(pod =>
      pod.status.containerStatuses?.some(c =>
        c.state?.waiting?.reason === 'CrashLoopBackOff'
      )
    );
    
    const toolResult = await checkNamespaceHealth({ namespace: testNamespace });
    
    expect(toolResult.checks.pods.crashloops).toHaveLength(realCrashLoops.length);
  });
});
```

### **Test Case 1.3: PVC Binding Issues**
```typescript
describe('check_namespace_health - PVC Issues', () => {
  const testNamespace = 'pvc-test-ns';
  
  it('should detect pending PVCs', async () => {
    // Create PVC with non-existent storage class
    await createPendingPVC(testNamespace, 'pending-pvc', 'nonexistent-sc');
    
    const result = await checkNamespaceHealth({ namespace: testNamespace });
    
    expect(result.status).toBe('degraded');
    expect(result.checks.pvcs.pending).toBeGreaterThan(0);
    expect(result.checks.pvcs.errors).toContainEqual(
      expect.stringMatching(/pending-pvc.*pending/i)
    );
  });
  
  it('should suggest storage class fix', async () => {
    const result = await checkNamespaceHealth({ namespace: testNamespace });
    
    expect(result.suspicions).toContainEqual(
      expect.stringMatching(/storageclass|storage class/i)
    );
  });
});
```

### **Test Case 1.4: Route/Ingress Testing**
```typescript
describe('check_namespace_health - Route Testing', () => {
  const testNamespace = 'route-test-ns';
  
  it('should test route connectivity when enabled', async () => {
    await createTestRoute(testNamespace, 'test-route', 'app.example.com');
    
    const result = await checkNamespaceHealth({
      namespace: testNamespace,
      includeIngressTest: true
    });
    
    expect(result.checks.routes).toBeDefined();
    expect(result.checks.routes.probe).toBeDefined();
    expect(result.checks.routes.probe.url).toMatch(/app\.example\.com/);
  });
  
  it('should skip route testing when disabled', async () => {
    const result = await checkNamespaceHealth({
      namespace: testNamespace,
      includeIngressTest: false
    });
    
    expect(result.checks.routes.probe).toBeUndefined();
  });
});
```

---

## 🔍 **UC-2: search_rca_patterns Test Cases**

### **Test Case 2.1: Pattern Matching Accuracy**
```typescript
describe('search_rca_patterns - Pattern Matching', () => {
  beforeAll(async () => {
    // Seed ChromaDB with known incidents
    await seedIncidentDatabase([
      {
        errorMessage: 'ImagePullBackOff: x509 certificate signed by unknown authority',
        resolution: ['Add CA to trust bundle', 'Restart deployment'],
        namespace: 'test-ns'
      },
      {
        errorMessage: 'PVC data-redis pending - no storage class',
        resolution: ['Create default storage class', 'Update PVC spec'],
        namespace: 'test-ns'
      }
    ]);
  });
  
  it('should find similar certificate errors', async () => {
    const result = await searchRcaPatterns({
      errorMessage: 'ImagePullBackOff due to x509: certificate signed by unknown authority',
      limit: 5
    });
    
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].similarity).toBeGreaterThan(0.8);
    expect(result.matches[0].resolutionSteps).toContain('Add CA to trust bundle');
  });
  
  it('should handle typos and variations', async () => {
    const result = await searchRcaPatterns({
      errorMessage: 'ImagePullBackoff cert signed by unknown auth',
      limit: 5
    });
    
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].similarity).toBeGreaterThan(0.7);
  });
  
  it('should filter by namespace when specified', async () => {
    const result = await searchRcaPatterns({
      errorMessage: 'PVC pending',
      filters: { namespace: 'test-ns' },
      limit: 10
    });
    
    result.matches.forEach(match => {
      expect(match.namespace).toBe('test-ns');
    });
  });
});
```

---

## 🚀 **UC-3: run_rca_checklist Test Cases**

### **Test Case 3.1: Complete RCA Workflow**
```typescript
describe('run_rca_checklist - Complete Workflow', () => {
  const testNamespace = 'rca-test-ns';
  
  beforeAll(async () => {
    // Setup complex failure scenario
    await createComplexFailureScenario(testNamespace);
  });
  
  it('should execute complete diagnostic checklist', async () => {
    const result = await runRcaChecklist({
      namespace: testNamespace,
      outputFormat: 'json'
    });
    
    expect(result.findings).toBeDefined();
    expect(result.findings.health).toBeOneOf(['healthy', 'degraded', 'failing']);
    expect(result.nextActions).toBeInstanceOf(Array);
    expect(result.nextActions.length).toBeGreaterThan(0);
  });
  
  it('should provide markdown output format', async () => {
    const result = await runRcaChecklist({
      namespace: testNamespace,
      outputFormat: 'markdown'
    });
    
    expect(result.rendered).toMatch(/^##\s+RCA/);
    expect(result.rendered).toContain('Health:');
    expect(result.rendered).toContain('Next:');
  });
  
  it('should complete within time SLA', async () => {
    const startTime = Date.now();
    
    await runRcaChecklist({ namespace: testNamespace });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(15000); // 15 second SLA
  });
});
```

### **Test Case 3.2: Common Failure Pattern Detection**
```typescript
describe('run_rca_checklist - Pattern Detection', () => {
  it('should detect ImagePullBackOff patterns', async () => {
    await createImagePullFailure('pattern-test-ns', 'failing-pod');
    
    const result = await runRcaChecklist({ namespace: 'pattern-test-ns' });
    
    expect(result.findings.suspectedRootCause).toMatch(/image.*pull|registry|auth/i);
    expect(result.nextActions).toContainEqual(
      expect.stringMatching(/registry|image|pull/i)
    );
  });
  
  it('should detect resource constraint patterns', async () => {
    await createResourceConstraintFailure('pattern-test-ns');
    
    const result = await runRcaChecklist({ namespace: 'pattern-test-ns' });
    
    expect(result.findings.suspectedRootCause).toMatch(/resource|quota|limit/i);
  });
});
```

---

## 📊 **UC-4: Performance Test Cases**

### **Test Case 4.1: Response Time Validation**
```typescript
describe('Performance Tests', () => {
  const performanceNamespace = 'perf-test-ns';
  
  beforeAll(async () => {
    // Create namespace with realistic resource counts
    await createRealisticNamespace(performanceNamespace, {
      pods: 50,
      services: 10,
      pvcs: 5,
      routes: 8
    });
  });
  
  it('should meet check_namespace_health SLA', async () => {
    const measurements = [];
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      await checkNamespaceHealth({ namespace: performanceNamespace });
      measurements.push(Date.now() - startTime);
    }
    
    const avgTime = measurements.reduce((a, b) => a + b) / measurements.length;
    expect(avgTime).toBeLessThan(5000); // 5 second SLA
  });
  
  it('should handle concurrent requests', async () => {
    const promises = Array(5).fill(null).map(() =>
      checkNamespaceHealth({ namespace: performanceNamespace })
    );
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    expect(results).toHaveLength(5);
    expect(duration).toBeLessThan(10000); // Should not be 5x slower
  });
});
```

---

## 🚨 **UC-5: Error Handling Test Cases**

### **Test Case 5.1: Non-existent Resources**
```typescript
describe('Error Handling', () => {
  it('should handle non-existent namespace gracefully', async () => {
    const result = await checkNamespaceHealth({
      namespace: 'nonexistent-namespace-12345'
    });
    
    expect(result.status).toBe('failing');
    expect(result.human).toMatch(/not found|does not exist/i);
  });
  
  it('should handle oc command timeouts', async () => {
    // Mock slow oc command
    jest.spyOn(ocWrapper, 'executeOc').mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 20000))
    );
    
    await expect(
      checkNamespaceHealth({ namespace: 'timeout-test' })
    ).rejects.toThrow(/timeout/i);
  });
  
  it('should handle invalid oc output', async () => {
    jest.spyOn(ocWrapper, 'executeOc').mockResolvedValue('invalid json{');
    
    const result = await checkNamespaceHealth({ namespace: 'test' });
    
    expect(result.status).toBe('failing');
    expect(result.human).toMatch(/error|unable to parse/i);
  });
});
```

---

## 🔄 **UC-6: Integration Test Cases**

### **Test Case 6.1: Real Cluster Validation**
```typescript
describe('Real Cluster Integration', () => {
  // Test against known cluster namespaces
  const realNamespaces = ['devops', 'openshift-apiserver', 'default'];
  
  realNamespaces.forEach(namespace => {
    it(`should analyze real namespace: ${namespace}`, async () => {
      const result = await checkNamespaceHealth({ namespace });
      
      // Validate structure
      expect(result).toHaveProperty('namespace', namespace);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('human');
      
      // Validate data consistency
      expect(result.checks.pods.ready).toBeLessThanOrEqual(result.checks.pods.total);
      expect(result.checks.pvcs.bound).toBeLessThanOrEqual(
        result.checks.pvcs.bound + result.checks.pvcs.pending
      );
    });
  });
  
  it('should match oc command results exactly', async () => {
    const namespace = 'openshift-apiserver';
    
    // Get real data
    const realPods = JSON.parse(await execOc(['get', 'pods', '-n', namespace, '-o', 'json']));
    const realEvents = JSON.parse(await execOc(['get', 'events', '-n', namespace, '-o', 'json']));
    
    // Get tool data
    const toolResult = await checkNamespaceHealth({ namespace });
    
    // Compare critical metrics
    expect(toolResult.checks.pods.total).toBe(realPods.items.length);
    
    const realCrashLoops = realPods.items.filter(pod =>
      pod.status.containerStatuses?.some(c =>
        c.state?.waiting?.reason === 'CrashLoopBackOff'
      )
    ).length;
    
    expect(toolResult.checks.pods.crashloops.length).toBe(realCrashLoops);
  });
});
```

---

## 📈 **UC-7: Load and Stress Test Cases**

### **Test Case 7.1: Large Namespace Handling**
```typescript
describe('Load Testing', () => {
  it('should handle large namespaces efficiently', async () => {
    const largeNamespace = await createLargeNamespace('large-test-ns', {
      pods: 200,
      services: 50,
      pvcs: 30,
      configmaps: 100
    });
    
    const startTime = Date.now();
    const result = await checkNamespaceHealth({ 
      namespace: largeNamespace 
    });
    const duration = Date.now() - startTime;
    
    expect(result.checks.pods.total).toBe(200);
    expect(duration).toBeLessThan(10000); // Should scale reasonably
  });
  
  it('should handle cluster-wide operations', async () => {
    const startTime = Date.now();
    const result = await getClusterStateSnapshot({
      includeDiff: false
    });
    const duration = Date.now() - startTime;
    
    expect(result.summary.nodes.total).toBeGreaterThan(0);
    expect(duration).toBeLessThan(10000); // 10 second SLA
  });
});
```

---

## 🎯 **Test Execution Framework**

### **Test Data Setup**
```typescript
// Helper functions for test data creation
export class TestDataManager {
  static async createHealthyTestNamespace(name: string) {
    await execOc(['create', 'namespace', name]);
    await execOc(['run', 'healthy-pod', '--image=nginx', '-n', name]);
    await this.waitForPodReady(name, 'healthy-pod');
  }
  
  static async createCrashLoopPod(namespace: string, podName: string) {
    const crashLoopDeployment = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${podName}
  namespace: ${namespace}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${podName}
  template:
    metadata:
      labels:
        app: ${podName}
    spec:
      containers:
      - name: crashloop
        image: busybox
        command: ["sh", "-c", "exit 1"]
    `;
    
    await this.applyYaml(crashLoopDeployment);
    await this.waitForCrashLoop(namespace, podName);
  }
}
```

### **Validation Framework**
```bash
#!/bin/bash
# validate-against-real-cluster.sh

echo "🧪 Validating MCP tools against real cluster"

# Test each tool against known namespaces
for namespace in devops openshift-apiserver default; do
  echo "Testing namespace: $namespace"
  
  # Run tool
  tool_result=$(echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"check_namespace_health","arguments":{"namespace":"'$namespace'"}}}' | node dist/index.js)
  
  # Run real oc commands
  real_pods=$(oc get pods -n $namespace -o json | jq '.items | length')
  real_events=$(oc get events -n $namespace -o json | jq '.items | length')
  
  # Compare results
  echo "  Real pods: $real_pods"
  echo "  Tool result: $tool_result"
  echo ""
done
```

---

## 🏁 **Test Success Criteria**

### **Per-Tool Acceptance**
- **Unit tests**: 100% pass rate
- **Integration tests**: Match real `oc` command results
- **Performance tests**: Meet SLA requirements
- **Error handling**: Graceful degradation

### **Overall System**
- **End-to-end workflows**: Complete successfully
- **Real cluster validation**: Accurate results
- **Stress testing**: Stable under load
- **User acceptance**: Operational validation

---

**This test framework ensures each tool works correctly against real OpenShift clusters and matches the operational patterns defined in your CLI mapping cheatsheet!** 🎯
