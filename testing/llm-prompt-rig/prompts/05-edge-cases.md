# Level 5: Edge Cases and Error Handling Tests

## Test 5.1: Invalid Parameter Handling
**Prompt:**
```
Please check the health of namespace "invalid-namespace-that-does-not-exist" using session "error-test-001".
```

**Expected Behavior:**
- Attempts the operation correctly
- Recognizes and handles the error gracefully
- Provides helpful error explanation
- Suggests corrective actions

**Success Criteria:**
- Uses namespace_health tool with correct parameters
- Recognizes namespace not found error
- Explains what the error means
- Suggests verification steps (list namespaces, check spelling)
- Doesn't crash or give up completely

---

## Test 5.2: Missing Required Parameters
**Prompt:**
```
Run a cluster health check for me.
```

**Expected Behavior:**
- Recognizes missing sessionId requirement
- Asks for missing information
- Provides guidance on required parameters
- Completes operation once parameters provided

**Success Criteria:**
- Identifies missing sessionId parameter
- Asks user to provide sessionId
- Explains why sessionId is required
- Successfully executes once sessionId provided
- Doesn't attempt operation with invalid/missing parameters

---

## Test 5.3: Tool Selection Confusion
**Prompt:**
```
I want to see the CPU and memory usage of all nodes in my cluster. Which tool should I use? Session: "resource-usage-001".
```

**Expected Behavior:**
- Recognizes that current tools don't directly provide node resource metrics
- Explains available tool capabilities honestly
- Suggests alternative approaches or workarounds
- Doesn't pretend tools can do things they can't

**Success Criteria:**
- Correctly identifies that MCP-ocs tools focus on health/diagnostics, not resource metrics
- Suggests using describe tool to get node information
- Explains limitations clearly
- Recommends alternative approaches (kubectl top, monitoring tools)
- Doesn't attempt impossible operations

---

## Test 5.4: Malformed Request Recovery
**Prompt:**
```
Please help me run oc get pods with namespace kube-system and also check health and maybe logs? session is test-recovery-001 i think
```

**Expected Behavior:**
- Parses unclear request and identifies multiple operations
- Clarifies user intent before proceeding
- Breaks down complex request into steps
- Executes operations systematically

**Success Criteria:**
- Recognizes multiple operations requested (get pods, health check, logs)
- Asks for clarification on which pods for logs
- Uses consistent sessionId across operations
- Provides organized results for each operation
- Maintains helpful tone despite unclear input

---

## Test 5.5: Resource Limits and Timeouts
**Prompt:**
```
Can you get logs from all pods in all namespaces? I want to see everything that's happened. Session: "all-logs-001".
```

**Expected Behavior:**
- Recognizes potentially problematic request scope
- Explains resource and practical limitations
- Suggests more targeted alternatives
- Demonstrates understanding of operational constraints

**Success Criteria:**
- Identifies that getting all logs from all pods is impractical/problematic
- Explains resource consumption and time constraints
- Suggests filtering by namespace, pod, or time range
- Offers to help design a more targeted investigation
- Shows awareness of operational impact

---

## Test 5.6: Authentication/Permission Issues
**Prompt:**
```
I'm trying to check cluster health but getting permission denied errors. Can you help? Session: "permission-test-001".
```

**Expected Behavior:**
- Recognizes permission-related error patterns
- Provides troubleshooting guidance for access issues
- Explains authentication vs. authorization concepts
- Suggests verification steps

**Success Criteria:**
- Attempts cluster health operation
- Recognizes permission/authentication errors in output
- Explains difference between authentication and authorization
- Suggests checking kubeconfig, RBAC, service accounts
- Provides systematic troubleshooting approach

---

## Test 5.7: Graceful Degradation
**Prompt:**
```
My cluster is in a bad state - the API server is responding very slowly. Can you still help me diagnose issues? Session: "degraded-cluster-001".
```

**Expected Behavior:**
- Adapts strategy for degraded cluster conditions
- Uses timeouts and retries appropriately
- Prioritizes most important information gathering
- Maintains functionality under adverse conditions

**Success Criteria:**
- Acknowledges cluster degradation impact on diagnostics
- Suggests starting with basic operations first
- Explains how tool timeouts help prevent hanging
- Prioritizes critical health checks over comprehensive analysis
- Maintains useful functionality despite constraints

---

## Test 5.8: Data Interpretation Edge Cases
**Prompt:**
```
I ran a namespace health check and got back a lot of data. Some pods show "Unknown" status and others have empty restart counts. What does this mean? Session: "data-interpretation-001".
```

**Expected Behavior:**
- Explains edge cases in Kubernetes data
- Provides context for unusual status values
- Helps interpret incomplete or unexpected data
- Maintains confidence while acknowledging limitations

**Success Criteria:**
- Explains what "Unknown" pod status typically indicates
- Discusses when restart counts might be empty/zero
- Provides context for Kubernetes state transitions
- Acknowledges when data might be incomplete or stale
- Maintains helpful analysis despite data ambiguity

---

## Test 5.9: Tool Chaining Errors
**Prompt:**
```
First check cluster health, then use the results to check the worst namespace, then get detailed pod info. If any step fails, continue with the rest. Session: "chain-with-errors-001".
```

**Expected Behavior:**
- Implements error-tolerant workflow
- Continues processing despite intermediate failures
- Provides partial results where possible
- Maintains workflow integrity under error conditions

**Success Criteria:**
- Attempts each operation in sequence
- Continues workflow even if one step fails
- Provides results from successful operations
- Explains which operations failed and why
- Adapts subsequent steps based on available information

---

## Test 5.10: Ambiguous User Intent
**Prompt:**
```
Something is wrong with my cluster. Fix it. Session: "vague-request-001".
```

**Expected Behavior:**
- Recognizes vague request and asks clarifying questions
- Suggests systematic investigation approach
- Guides user toward more specific problem description
- Begins helpful investigation despite unclear requirements

**Success Criteria:**
- Asks clarifying questions about symptoms
- Suggests starting with cluster health overview
- Provides framework for problem description
- Begins investigation while gathering more information
- Maintains helpful tone despite vague input

---

## Scoring Guide
- **5/5**: Excellent error handling with graceful recovery and helpful guidance
- **4/5**: Good error recognition with appropriate recovery strategies
- **3/5**: Basic error handling but may struggle with complex edge cases
- **2/5**: Limited error recognition with poor recovery strategies
- **1/5**: Poor error handling, crashes, or gives up when facing issues
