# MCP-ocs Tool Behavior Requirements - Human OpenShift Usage Patterns

## 🧑‍💻 **How Humans Actually Use OpenShift**

### **Real Human Behavior with `oc` CLI:**

1. **Namespace Access Patterns:**
   ```bash
   # Humans switch contexts but can always access any namespace they have RBAC for
   oc get pods                           # Current namespace only
   oc get pods -n devops                 # Specific namespace  
   oc get pods -A                        # ALL namespaces (if permitted)
   oc get pods --all-namespaces          # Same as -A
   
   # Current project context is just a "default" - not a limitation
   oc project devops                     # Switch default context
   oc get pods                           # Now shows devops pods
   oc get pods -n kube-system            # Still works if RBAC allows
   ```

2. **Version Checking:**
   ```bash
   oc version                            # Shows CLIENT and SERVER versions
   oc version --output=json              # Structured output with both
   # Humans care about SERVER version for cluster capabilities
   # CLIENT version is just for compatibility checks
   ```

3. **Real Diagnostic Workflows:**
   ```bash
   # Health check pattern
   oc cluster-info                       # Cluster accessibility
   oc get nodes                          # Node health
   oc get pods -A | grep -v Running      # Find problem pods anywhere
   oc describe pod <problempod> -n <ns>  # Deep dive on issues
   ```

## 🎯 **Expected MCP Tool Behaviors**

### **1. Namespace Behavior - Tool Should:**

#### **✅ CORRECT: Respect explicit namespace parameters**
```typescript
// User specifies namespace - tool should honor it
oc_read_get_pods({namespace: "devops"})          // Only devops pods
oc_read_get_pods({namespace: "kube-system"})     // Only kube-system pods  
oc_read_get_pods({namespace: "openshift-*"})     // Pattern matching
```

#### **✅ CORRECT: Default behavior when no namespace specified**
```typescript
// Option A: Current namespace (like plain `oc get pods`)
oc_read_get_pods({})                             // Current project pods

// Option B: All accessible namespaces (like `oc get pods -A`)
oc_read_get_pods({allNamespaces: true})          // All pods everywhere
```

#### **❌ WRONG: Ignoring namespace parameter**
```typescript
// This is broken behavior:
oc_read_get_pods({namespace: "devops"})          // Shows kube-system instead!
```

### **2. Version Reporting - Tool Should:**

#### **✅ CORRECT: Report OpenShift server version**
```bash
# Real cluster version that matters for capabilities
"version": "4.18.18"  # What's actually running
```

#### **❌ WRONG: Report client version**  
```bash
# CLI version doesn't indicate cluster capabilities
"version": "4.18.1"   # Just the oc binary version
```

### **3. Cluster Information - Tool Should:**

#### **✅ CORRECT: Live cluster data**
```typescript
{
  "serverUrl": "https://api.bootcamp-ocs-cluster.bootcamp.tkmind.net:6443",
  "currentUser": "kube:admin", 
  "version": "4.18.18",
  "currentProject": "devops"  // Default context, not a limitation
}
```

## 🔧 **Current Tool Issues vs Expected Behavior**

### **Issue #1: Version Mismatch**
- **Expected**: Server version `4.18.18`
- **Actual**: Client version `4.18.1`  
- **Fix**: Use `oc version -o json` and parse `openshiftVersion`

### **Issue #2: Pod Count Wrong**
- **Expected**: When user asks for `namespace: "devops"`, show devops pods (1)
- **Actual**: Tool shows 0 pods everywhere
- **Likely Cause**: Tool not using `-n <namespace>` flag correctly

### **Issue #3: Server URL Malformed**
- **Expected**: Actual URL `https://api.bootcamp-ocs-cluster...`
- **Actual**: JSONPath string `.clusters[0].cluster.server`
- **Fix**: Command not executing jsonpath, just returning the string

## 🎯 **Corrected Tool Implementation Requirements**

### **1. Namespace-Aware Pod Listing**
```typescript
// Tool should work like this:
async getPods(namespace?: string, allNamespaces?: boolean): Promise<PodInfo[]> {
  let args = ['get', 'pods', '-o', 'json'];
  
  if (allNamespaces) {
    args.push('--all-namespaces');
  } else if (namespace) {
    args.push('-n', namespace);          // Explicit namespace
  }
  // If neither specified, use current context (default oc behavior)
  
  return await this.executeOcCommand(args);
}
```

### **2. Accurate Version Reporting**
```typescript
// Tool should get server version:
const versionData = await this.executeOcCommand(['version', '-o', 'json']);
const parsed = JSON.parse(versionData);
return parsed.openshiftVersion;  // Not clientVersion!
```

### **3. Proper URL Extraction**
```bash
# Should execute jsonpath, not return the string:
oc config view --minify -o jsonpath='{.clusters[0].cluster.server}'
# Not just return the jsonpath string itself
```

## 🧑‍💻 **Human Expectation Test Cases**

### **Test Case 1: "Show me pods in devops namespace"**
```typescript
// Human expectation:
oc_read_get_pods({namespace: "devops"})
// Should return: 1 pod (the actual devops pod)
// Currently returns: 0 pods ❌
```

### **Test Case 2: "What version is the cluster?"**
```typescript
// Human expectation:  
oc_diagnostic_cluster_health()
// Should return: "4.18.18" (server version)
// Currently returns: "4.18.1" (client version) ❌
```

### **Test Case 3: "Show me all pods across the cluster"**
```typescript
// Human expectation:
oc_read_get_pods({allNamespaces: true})
// Should return: Pods from all accessible namespaces
// Currently: Not implemented yet
```

## 🎯 **Priority Implementation Order**

1. **HIGH**: Fix version to use server version (`openshiftVersion`)
2. **HIGH**: Fix namespace parameter handling in pod listing
3. **MEDIUM**: Fix server URL extraction (jsonpath execution)
4. **LOW**: Add all-namespaces support for cluster-wide visibility

## 📋 **Validation After Fixes**

Each fix should make the comprehensive validation pass:
- Version: `4.18.18` ✅
- devops pod count: `1` ✅  
- openshift-apiserver pod count: `3` ✅
- Server URL: Full valid URL ✅

This aligns tool behavior with real human OpenShift usage patterns!
