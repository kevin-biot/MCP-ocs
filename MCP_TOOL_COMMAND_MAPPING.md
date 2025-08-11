# MCP Tool → OpenShift `oc` Command Mapping

## 📋 **Current Tool Implementation Analysis**

### **🔧 Diagnostic Tools (`oc_diagnostic_*`)**

#### **`oc_diagnostic_cluster_health`**
```typescript
// MCP Tool Call:
oc_diagnostic_cluster_health({sessionId: "session-123"})

// Expected oc Commands:
oc cluster-info                           // Basic connectivity
oc version -o json                        // Cluster version  
oc whoami                                 // Current user
oc get nodes                              // Node health
oc get pods -A | grep -v Running          // Problem pods cluster-wide
oc get events -A --sort-by='.lastTimestamp' | tail -20  // Recent events

// Current Implementation Issues:
❌ Uses: oc version --client -o json       // Gets CLIENT version (4.18.1)
✅ Should use: oc version -o json          // Gets SERVER version (4.18.18)
❌ Limited health checks                   // Just basic info
✅ Should add: Node status, system pod health
```

#### **`oc_diagnostic_pod_health`**
```typescript
// MCP Tool Call:
oc_diagnostic_pod_health({
  sessionId: "session-123",
  namespace: "devops", 
  podName: "my-app-pod"
})

// Expected oc Commands:
oc describe pod my-app-pod -n devops      // Detailed pod info
oc get pod my-app-pod -n devops -o yaml   // Full pod spec
oc logs my-app-pod -n devops --tail=50    // Recent logs
oc get events -n devops --field-selector involvedObject.name=my-app-pod  // Pod events

// Current Implementation:
🤔 Need to check what's actually implemented
```

#### **`oc_diagnostic_resource_usage`**
```typescript
// MCP Tool Call:
oc_diagnostic_resource_usage({
  sessionId: "session-123",
  scope: "cluster"
})

// Expected oc Commands:
oc top nodes                              // Node resource usage
oc top pods -A                            // Pod resource usage
oc describe nodes                         // Node capacity/allocation
oc get pods -A -o custom-columns="NAMESPACE:.metadata.namespace,NAME:.metadata.name,CPU_REQ:.spec.containers[*].resources.requests.cpu,MEM_REQ:.spec.containers[*].resources.requests.memory"

// Current Implementation:
🤔 Need to check actual implementation
```

#### **`oc_diagnostic_events`**
```typescript
// MCP Tool Call:
oc_diagnostic_events({
  sessionId: "session-123",
  namespace: "devops"
})

// Expected oc Commands:
oc get events -n devops --sort-by='.lastTimestamp'  // Namespace events
oc get events -A --sort-by='.lastTimestamp' | tail -50  // Cluster events

// Current Implementation:
🤔 Need to check actual implementation
```

---

### **📖 Read Operations (`oc_read_*`)**

#### **`oc_read_get_pods`**
```typescript
// MCP Tool Call:
oc_read_get_pods({
  sessionId: "session-123",
  namespace: "devops"
})

// Expected oc Commands:
oc get pods -n devops -o json             // Specific namespace
oc get pods -A -o json                    // All namespaces (default)
oc get pods -o json                       // Current namespace only

// Current Implementation Issues:
❌ Returns 0 pods when real cluster has pods
❌ Doesn't respect namespace parameter
✅ Should use: -n <namespace> when specified
✅ Should use: -A when no namespace (ops default)
```

#### **`oc_read_describe`** (if implemented)
```typescript
// MCP Tool Call:
oc_read_describe({
  resourceType: "pod",
  name: "my-app-pod", 
  namespace: "devops"
})

// Expected oc Commands:
oc describe pod my-app-pod -n devops      // Pod description
oc describe node worker-1                 // Node description  
oc describe service my-service -n devops  // Service description
```

#### **`oc_read_logs`** (if implemented)
```typescript
// MCP Tool Call:
oc_read_logs({
  podName: "my-app-pod",
  namespace: "devops",
  lines: 100
})

// Expected oc Commands:
oc logs my-app-pod -n devops --tail=100   // Recent logs
oc logs my-app-pod -n devops --previous   // Previous container logs
oc logs my-app-pod -c container-name -n devops  // Specific container
```

---

### **✏️ Write Operations (`oc_write_*`)**

#### **`oc_write_apply`** (if implemented)
```typescript
// MCP Tool Call:
oc_write_apply({
  config: "apiVersion: v1\nkind: Pod...",
  namespace: "devops",
  dryRun: true
})

// Expected oc Commands:
oc apply -f - -n devops --dry-run=client  // Dry run first
oc apply -f - -n devops                   // Actual apply
```

#### **`oc_write_scale`** (if implemented)
```typescript
// MCP Tool Call:
oc_write_scale({
  deployment: "my-app",
  replicas: 3,
  namespace: "devops"
})

// Expected oc Commands:
oc scale deployment my-app --replicas=3 -n devops
```

#### **`oc_write_restart`** (if implemented)
```typescript
// MCP Tool Call:
oc_write_restart({
  deployment: "my-app",
  namespace: "devops"
})

// Expected oc Commands:
oc rollout restart deployment/my-app -n devops
```

---

### **⚙️ System Management (`core_*`, `memory_*`)**

#### **`core_workflow_state`**
```typescript
// MCP Tool Call:
core_workflow_state({sessionId: "session-123"})

// Expected Behavior:
// Internal state management - no oc commands
// Returns workflow session state, evidence level, etc.
```

#### **`memory_store_incident`**
```typescript
// MCP Tool Call:
memory_store_incident({
  incidentId: "incident-001",
  symptoms: ["pod crashes", "high CPU"],
  resolution: "increased memory limits"
})

// Expected Behavior:
// Store in ChromaDB + JSON
// No direct oc commands, but may trigger background cluster queries
```

---

## 🔍 **Current Implementation Gaps Analysis**

### **Let's check what's actually implemented:**

```bash
# Check diagnostic tool implementations
grep -A 20 "checkClusterHealth\|checkPodHealth" src/tools/diagnostics/index.ts

# Check read operations
grep -A 20 "getPods\|describeResource" src/tools/read-ops/index.ts

# Check write operations  
grep -A 20 "applyConfig\|scaleDeployment" src/tools/write-ops/index.ts
```

## 🎯 **Expected vs Actual Command Patterns**

### **Issue #1: Version Command**
```bash
# Current (WRONG):
oc version --client -o json              # Returns 4.18.1 (client)

# Should be (CORRECT):  
oc version -o json                       # Returns 4.18.18 (server)
```

### **Issue #2: Pod Listing**
```bash
# Current (BROKEN):
oc get pods ???                         # Returns 0 pods everywhere

# Should be (CORRECT):
oc get pods -n devops -o json            # When namespace specified
oc get pods -A -o json                   # When no namespace (default)
```

### **Issue #3: Server URL**
```bash
# Current (BROKEN):
# Returns: ".clusters[0].cluster.server" (literal string)

# Should be (CORRECT):
oc config view --minify -o jsonpath='{.clusters[0].cluster.server}'
# Returns: "https://api.bootcamp-ocs-cluster.bootcamp.tkmind.net:6443"
```

## 🔧 **Priority Fixes Needed**

1. **HIGH**: Fix `getPods()` to actually use namespace parameter
2. **HIGH**: Fix version command to get server version  
3. **MEDIUM**: Fix server URL jsonpath execution
4. **MEDIUM**: Implement default "all namespaces" behavior
5. **LOW**: Add missing tools (describe, logs, etc.)

---

## 📋 **Complete Tool Mapping Summary**

| MCP Tool | Real oc Command Pattern | Status |
|----------|-------------------------|---------|
| `oc_diagnostic_cluster_health` | `oc version -o json` + `oc cluster-info` | ❌ Version wrong |
| `oc_diagnostic_pod_health` | `oc describe pod` + `oc logs` | 🤔 Check impl |
| `oc_read_get_pods` | `oc get pods -A -o json` | ❌ Returns 0 pods |
| `core_workflow_state` | Internal state only | ✅ Working |
| `memory_store_incident` | ChromaDB + JSON storage | ✅ Working |

**Next: Fix the broken `oc` command patterns to match real human usage!** 🎯
