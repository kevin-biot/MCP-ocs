# Level 4: RCA Scenarios Tests

## Test 4.1: Basic RCA Execution
**Prompt:**
```
I'm having issues with a service called "prometheus-k8s" in the "openshift-monitoring" namespace. Users can't reach it and I'm getting connection timeouts. Can you help me run a root cause analysis? Use session "prometheus-rca-001".
```

**Expected Behavior:**
- Uses `oc_diagnostic_rca_checklist` tool
- Passes correct service and namespace
- Interprets RCA findings and root cause
- Provides actionable next steps

**Success Criteria:**
- Invokes RCA tool with serviceName="prometheus-k8s" and namespace="openshift-monitoring"
- Uses sessionId="prometheus-rca-001"
- Understands the root cause analysis output
- Explains confidence levels and evidence
- Provides clear remediation recommendations

---

## Test 4.2: RCA with Context Understanding
**Prompt:**
```
A user reported that they can't access the OpenShift web console. The error message mentions connection refused. I suspect it might be related to the oauth-openshift service in openshift-authentication namespace. Please investigate using RCA. Session: "console-access-rca-001".
```

**Expected Behavior:**
- Understands the connection between symptoms and suspected service
- Uses RCA tool with correct parameters
- Interprets network/authentication related findings
- Connects technical findings to user impact

**Success Criteria:**
- Correctly identifies serviceName="oauth-openshift" and namespace="openshift-authentication"
- Recognizes authentication/network connectivity patterns
- Explains how technical issues relate to console access problems
- Provides user-focused remediation steps

---

## Test 4.3: Multi-Service RCA Investigation
**Prompt:**
```
I'm seeing cascading failures in my monitoring stack. Multiple services seem affected:
- alertmanager-main (openshift-monitoring)
- prometheus-k8s (openshift-monitoring)  
- grafana (openshift-monitoring)

Can you run RCA on each service to help me understand if there's a common root cause? Use session "monitoring-cascade-rca-001".
```

**Expected Behavior:**
- Runs RCA on multiple services systematically
- Compares root causes across services
- Identifies common patterns or dependencies
- Provides holistic remediation strategy

**Success Criteria:**
- Executes RCA for all three services with correct parameters
- Uses consistent sessionId across all operations
- Compares and contrasts root cause findings
- Identifies shared infrastructure or dependency issues
- Provides prioritized remediation plan

---

## Test 4.4: RCA Result Interpretation
**Prompt:**
```
Run an RCA on the "router-default" service in "openshift-ingress" namespace. After getting the results, please explain:
1. What the root cause means in practical terms
2. What evidence supports this conclusion
3. How confident we should be in this diagnosis
4. What the immediate next steps should be

Session: "router-rca-interpretation-001"
```

**Expected Behavior:**
- Executes RCA correctly
- Provides detailed interpretation of results
- Explains technical concepts in accessible terms
- Connects findings to actionable steps

**Success Criteria:**
- Proper RCA tool execution
- Clear explanation of root cause types and meanings
- Discusses confidence levels and what they indicate
- Explains evidence quality and relevance
- Provides specific, actionable next steps
- Considers both immediate fixes and prevention

---

## Test 4.5: RCA-Driven Investigation Workflow
**Prompt:**
```
I want to establish a systematic troubleshooting process using RCA. When a service is reported as down, what's the best workflow? Please design this process and then test it by investigating a hypothetical issue with "etcd" service in "openshift-etcd" namespace. Session: "rca-workflow-design-001".
```

**Expected Behavior:**
- Designs systematic RCA-based troubleshooting process
- Tests the process with provided scenario
- Refines workflow based on execution experience
- Provides documented procedure for future use

**Success Criteria:**
- Creates logical troubleshooting workflow incorporating RCA
- Considers when to use RCA vs. other diagnostic tools
- Tests workflow with etcd scenario
- Documents lessons learned and process improvements
- Provides templates or checklists for future incidents

---

## Advanced RCA Scenarios

## Test 4.6: Complex Dependency Chain Analysis
**Prompt:**
```
I'm seeing intermittent failures in my application namespace "production-app". The app depends on services in multiple namespaces:
- Database service in "database" namespace
- Redis cache in "cache" namespace
- External API gateway in "api-gateway" namespace

Use RCA to help me understand if infrastructure issues are causing the app problems. Session: "dependency-chain-rca-001".
```

**Expected Behavior:**
- Understands multi-namespace dependency complexity
- Uses RCA strategically across the dependency chain
- Correlates findings across different services
- Identifies infrastructure vs. application issues

---

## Test 4.7: Performance vs. Availability RCA
**Prompt:**
```
Users report that the "api-server" service in "kube-system" namespace is slow but not completely down. Response times are 10x normal. Can RCA help with performance issues or is it only for complete outages? Session: "performance-rca-001".
```

**Expected Behavior:**
- Understands RCA capabilities and limitations
- Applies RCA appropriately to performance issues
- Distinguishes between availability and performance problems
- Suggests complementary investigation methods when needed

---

## Scoring Guide
- **5/5**: Expert-level RCA usage with excellent interpretation and workflow design
- **4/5**: Competent RCA execution with good interpretation and practical recommendations
- **3/5**: Functional RCA usage but some interpretation gaps or missed nuances
- **2/5**: Basic RCA execution but poor interpretation or workflow understanding
- **1/5**: Incorrect RCA usage or failure to understand root cause analysis concepts
