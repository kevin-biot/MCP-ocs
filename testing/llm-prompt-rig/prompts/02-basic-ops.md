# Level 2: Basic Operations Tests

## Test 2.1: Simple Cluster Health Check
**Prompt:**
```
Please run a basic health check on my OpenShift cluster. Use session ID "test-001" for tracking.
```

**Expected Behavior:**
- Uses `oc_diagnostic_cluster_health` tool
- Passes correct sessionId parameter
- Interprets results and provides summary

**Success Criteria:**
- Correctly invokes cluster health tool
- Uses provided sessionId "test-001"
- Provides meaningful interpretation of health status

---

## Test 2.2: Namespace Health Analysis
**Prompt:**
```
I'm having issues with the "openshift-monitoring" namespace. Can you check its health? Use session "monitoring-check-001".
```

**Expected Behavior:**
- Uses `oc_diagnostic_namespace_health` tool
- Passes namespace and sessionId correctly
- Analyzes pod status and events

**Success Criteria:**
- Invokes namespace health tool with correct parameters
- Specifies namespace="openshift-monitoring"
- Uses sessionId="monitoring-check-001"
- Interprets pod statuses and identifies issues

---

## Test 2.3: Pod Listing and Analysis  
**Prompt:**
```
Show me all pods in the "kube-system" namespace and their current status. Session ID should be "pod-list-001".
```

**Expected Behavior:**
- Uses `oc_read_get_pods` tool
- Specifies correct namespace filter
- Provides organized pod status summary

**Success Criteria:**
- Correctly uses get_pods tool
- Filters by namespace="kube-system"
- Provides clear pod status overview
- Uses sessionId="pod-list-001"

---

## Test 2.4: Basic Log Retrieval
**Prompt:**
```
I need to see recent logs from a pod called "alertmanager-main-0" in the "openshift-monitoring" namespace. Get the last 50 lines. Session: "log-check-001".
```

**Expected Behavior:**
- Uses `oc_read_logs` tool with correct parameters
- Specifies pod, namespace, and line count
- Retrieves and presents logs clearly

**Success Criteria:**
- Uses logs tool with podName="alertmanager-main-0"
- Specifies namespace="openshift-monitoring"
- Sets tailLines=50
- Uses sessionId="log-check-001"

---

## Test 2.5: Memory Search
**Prompt:**
```
Search for any previous incidents related to "monitoring" issues. Session ID: "search-001".
```

**Expected Behavior:**
- Uses `memory_search_incidents` tool
- Searches with appropriate query terms
- Presents relevant historical incidents

**Success Criteria:**
- Invokes memory search with query containing "monitoring"
- Uses sessionId="search-001"
- Interprets search results meaningfully

---

## Scoring Guide
- **5/5**: All operations execute correctly with perfect parameter usage
- **4/5**: Most operations correct with minor parameter issues
- **3/5**: Operations mostly work but some parameter confusion
- **2/5**: Some operations succeed but frequent parameter errors
- **1/5**: Operations fail due to incorrect tool usage or parameters
