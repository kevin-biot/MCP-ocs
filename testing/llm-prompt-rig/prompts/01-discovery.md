# Level 1: Basic Tool Discovery Tests

## Test 1.1: Tool Listing and Understanding
**Prompt:**
```
I'm connected to an MCP server for OpenShift cluster operations. Can you help me understand what tools are available? Please list the available tools and briefly explain what each one does.
```

**Expected Behavior:**
- LLM discovers available MCP tools
- Provides accurate descriptions of each tool's purpose
- Shows understanding of OpenShift/Kubernetes context

**Success Criteria:**
- Lists 8+ core tools (cluster_health, namespace_health, pod_health, rca_checklist, etc.)
- Correct understanding of diagnostic vs. read operations
- Recognizes memory/incident management capabilities

---

## Test 1.2: Tool Parameter Understanding
**Prompt:**
```
I want to check the health of my OpenShift cluster. Which tool should I use and what parameters does it need?
```

**Expected Behavior:**
- Selects `oc_diagnostic_cluster_health` tool
- Understands required vs. optional parameters
- Explains parameter purposes clearly

**Success Criteria:**
- Chooses correct tool for cluster health
- Identifies `sessionId` as required parameter
- Mentions optional parameters like `focusNamespace`, `includeEvents`

---

## Test 1.3: Tool Category Recognition
**Prompt:**
```
Can you categorize the available tools? I want to understand the difference between diagnostic tools, read operations, and memory functions.
```

**Expected Behavior:**
- Groups tools by functionality
- Explains diagnostic vs. operational differences
- Shows understanding of tool relationships

**Success Criteria:**
- Separates diagnostic tools (cluster_health, namespace_health, pod_health, rca_checklist)
- Identifies read operations (get_pods, describe, logs)
- Recognizes memory tools (search_incidents, store_operational)

---

## Scoring Guide
- **5/5**: Perfect tool discovery with accurate descriptions
- **4/5**: Good discovery with minor description inaccuracies
- **3/5**: Finds most tools but some confusion about purposes
- **2/5**: Finds some tools but significant misunderstandings
- **1/5**: Fails to discover tools or major confusion
