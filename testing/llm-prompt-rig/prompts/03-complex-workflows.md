# Level 3: Complex Workflows Tests

## Test 3.1: Multi-Step Cluster Investigation
**Prompt:**
```
I'm experiencing performance issues in my OpenShift cluster. Please conduct a comprehensive investigation:
1. Check overall cluster health
2. Identify any problematic namespaces
3. Look at specific pod issues in problem namespaces
4. Search for any historical incidents that might be related

Use session ID "perf-investigation-001" for all operations.
```

**Expected Behavior:**
- Sequences multiple tools logically
- Uses consistent sessionId across operations
- Builds investigation narrative connecting results
- Identifies patterns and relationships

**Success Criteria:**
- Starts with cluster_health for overview
- Follows up with namespace_health for problem areas
- Uses pod_health or get_pods for specific issues
- Searches memory for related incidents
- Maintains consistent sessionId throughout
- Provides coherent analysis connecting all findings

---

## Test 3.2: Targeted Namespace Deep Dive
**Prompt:**
```
The "openshift-etcd" namespace is showing warnings. Please do a thorough analysis:
- Check namespace health including events
- Examine individual pod status and restarts
- Look at recent logs for any error patterns
- Check if there are any dependency issues

Session: "etcd-deep-dive-001"
```

**Expected Behavior:**
- Systematic approach to namespace investigation
- Uses multiple complementary tools
- Analyzes patterns across different data sources
- Provides actionable insights

**Success Criteria:**
- Uses namespace_health with includeEvents=true
- Follows with pod_health or get_pods for detailed pod analysis
- Uses logs tool for error pattern analysis
- Considers pod dependencies and relationships
- Synthesizes findings into coherent assessment

---

## Test 3.3: Pod Discovery and Prioritization
**Prompt:**
```
I want to find the most problematic pods across my entire cluster. Can you help me identify pods that need immediate attention? Focus on crashloops, failed starts, and resource issues. Use session "pod-priority-001".
```

**Expected Behavior:**
- Uses pod_health tool in discovery mode
- Understands cluster-wide scanning capability
- Prioritizes based on severity of issues
- Provides actionable recommendations

**Success Criteria:**
- Uses pod_health without specific namespace/pod (discovery mode)
- Sets appropriate focusStrategy (auto or events)
- Interprets prioritization results correctly
- Identifies highest-impact issues first
- Provides clear next-step recommendations

---

## Test 3.4: Historical Pattern Analysis
**Prompt:**
```
I've been having recurring issues with image pull failures. Can you:
1. Search for previous image pull related incidents
2. Check current cluster state for any ongoing image pull issues
3. Identify patterns or common factors
4. Recommend preventive measures

Session: "image-pull-analysis-001"
```

**Expected Behavior:**
- Combines historical and current data analysis
- Recognizes patterns across time
- Provides both immediate and strategic recommendations
- Uses appropriate tools for each analysis phase

**Success Criteria:**
- Searches memory for "image pull" related incidents
- Checks current cluster/pod health for active issues
- Correlates historical and current data
- Identifies common factors (repositories, namespaces, timing)
- Provides both immediate fixes and prevention strategies

---

## Test 3.5: Workflow Optimization
**Prompt:**
```
I need to establish a daily health check routine for my cluster. Can you design a workflow that covers the most important areas efficiently? Show me what tools to use and in what order. Use session "daily-routine-001" to test the workflow.
```

**Expected Behavior:**
- Designs logical tool sequence for regular monitoring
- Considers efficiency and coverage
- Provides clear workflow documentation
- Tests the designed workflow

**Success Criteria:**
- Suggests logical tool sequence (cluster → namespace → pod → memory)
- Explains rationale for tool selection and ordering
- Considers time efficiency vs. thoroughness
- Actually executes the designed workflow
- Refines recommendations based on execution results

---

## Scoring Guide
- **5/5**: Excellent workflow design with logical tool sequencing and insightful analysis
- **4/5**: Good workflows with minor inefficiencies or missed connections
- **3/5**: Functional workflows but some illogical sequencing or superficial analysis
- **2/5**: Basic workflow understanding but frequent missteps or shallow analysis
- **1/5**: Poor workflow design or failure to connect multiple tools effectively
