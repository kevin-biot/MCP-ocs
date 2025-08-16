# MCP-OCS (OpenShift Container Storage Operations)

> **Intelligent Operational Assistant for OpenShift Clusters**

[![Beta Release](https://img.shields.io/badge/status-beta--v0.8.0--beta--1-orange.svg)](https://github.com/kevin-biot/MCP-ocs/releases/tag/v0.8.0-beta-1)
[![Success Rate](https://img.shields.io/badge/tool--success--rate-90%25%2B-brightgreen.svg)](#validation)
[![Namespace Coverage](https://img.shields.io/badge/namespace--coverage-116%20namespaces-blue.svg)](#features)
[![Tools Available](https://img.shields.io/badge/tools--available-13%20operational-success.svg)](#tools)

MCP-OCS transforms OpenShift cluster operations from reactive debugging to intelligent, proactive assistance. Built on the Model Context Protocol (MCP), it provides AI-powered diagnostic tools with full cluster visibility and crisis-ready intelligence.

## 🚀 What's New in v0.8.0-beta-1

- **🧠 Intelligent Cluster Diagnostics** - Auto-prioritizes real problems across 116+ namespaces
- **🎯 Crisis-Ready Operations** - Surfaces critical issues first for faster incident response  
- **⚡ Performance Optimized** - Handles large clusters with bounded analysis and event filtering
- **🔍 Complete Visibility** - System and user namespace discovery with smart focus capabilities

## ✨ Key Features

### **Complete Diagnostic Coverage**
- **Cluster Health** - Intelligent overview with automatic problem prioritization
- **Namespace Analysis** - Individual namespace health with pod/PVC/event checking
- **Pod Diagnostics** - Lifecycle analysis, resource constraints, restart patterns
- **Root Cause Analysis** - Systematic 7-point RCA framework for incidents

### **Intelligent Operations** 
- **Smart Prioritization** - Automatically surfaces namespaces with actual problems
- **Crisis Mode Ready** - Focus parameters for targeted diagnostics during outages
- **Memory Integration** - Learns from operational patterns and stores incident knowledge
- **Performance Bounded** - Configurable analysis depth for large cluster efficiency

### **Production Ready**
- **Real Cluster Tested** - Validated against production OpenShift environments
- **116+ Namespace Coverage** - Complete system and user namespace visibility
- **90%+ Tool Success Rate** - Reliable diagnostic capabilities under real workloads
- **Secure by Design** - Safe read-only operations with proper authentication

## 🛠 Tools Available (13 Operational)

### **Diagnostic Tools (4/4)**
| Tool | Description | Status |
|------|-------------|--------|
| `oc_diagnostic_cluster_health` | Intelligent cluster overview with prioritization | ✅ Enhanced |
| `oc_diagnostic_namespace_health` | Individual namespace health analysis | ✅ Working |
| `oc_diagnostic_pod_health` | Pod lifecycle and resource constraint analysis | ✅ Working |
| `oc_diagnostic_rca_checklist` | Systematic root cause analysis framework | ✅ Working |

### **Read Operations (3/3)**
| Tool | Description | Status |
|------|-------------|--------|
| `oc_read_get_pods` | Pod information retrieval with filtering | ✅ Working |
| `oc_read_describe` | Detailed resource descriptions | ✅ Working |
| `oc_read_logs` | Pod log retrieval and analysis | ✅ Working |

### **Memory Operations (5/5)**
| Tool | Description | Status |
|------|-------------|--------|
| `memory_store_operational` | Store operational incidents and knowledge | ✅ Working |
| `memory_search_operational` | Search operational memories with domain filtering | ✅ Working |
| `memory_search_incidents` | Search incident database for patterns | ✅ Working |
| `memory_get_stats` | Memory system statistics and health | ✅ Working |
| `memory_search_conversations` | Search conversation history for context | ✅ Working |

### **Workflow State (1/1)**
| Tool | Description | Status |
|------|-------------|--------|
| `core_workflow_state` | Workflow engine state management | ✅ Working |

## 🏃‍♂️ Quick Start

### **Try the Beta Release**

```bash
# Clone the beta release
git clone --branch v0.8.0-beta-1 https://github.com/kevin-biot/MCP-ocs.git
cd MCP-ocs

# Install dependencies
npm install

# Set your OpenShift connection
export KUBECONFIG=/path/to/your/kubeconfig

# Verify your cluster access
oc whoami && oc cluster-info

# Start the MCP server (beta)
npm run start:beta
```

### Sequential Thinking Mode (Experimental)

- Feature flag: set `ENABLE_SEQUENTIAL_THINKING=true` to enable memory‑enhanced orchestration.
- Parallel entrypoint: run the sequential server without touching the legacy entrypoint.

```bash
# Start the sequential entrypoint (feature-flag off by default)
npm run start:sequential

# Enable the orchestrator (recommended for testing)
ENABLE_SEQUENTIAL_THINKING=true npm run start:sequential
```

#### Using `sequential_thinking`

#### RCA Policy and Intent
- Specific requests stay targeted (no RCA by default). Examples: "check ingress operator", "describe router pod".
- Complex/unclear problems in unbounded mode may trigger comprehensive RCA.
- Explicit comprehensive requests trigger RCA; in bounded mode a bounded RCA subset is used.
- Escalation: when initial probes show red flags (degraded/pending/503), the orchestrator plans an RCA next step (bounded if bounded=true).

Bounded RCA defaults:
- `includeDeepAnalysis=false`, `maxCheckTime=15000`, optional `namespace` from prompt (e.g., `openshift-ingress`).
- Adds a suggestion noting bounded RCA was used for performance constraints.

Examples that trigger modes:
- "Check ingress operator health" → ingress-specific steps only.
- "Multiple applications failing; we don't know why" (unbounded) → full RCA allowed.
- "router pod pending" (bounded) → ingress steps, escalation planned to bounded RCA.
- "Full cluster analysis / complete incident report" → comprehensive RCA.

- Entrypoint: `npx tsx src/index.ts` (standard) or `ENABLE_SEQUENTIAL_THINKING=true npx tsx src/index-sequential.ts`
- Flags: set `bounded=true` to avoid sweeps; set `firstStepOnly=true` to execute one planned step and reflect.
- Timeouts: increase `OC_TIMEOUT_MS` (e.g., `120000`) if you see timeouts.

Natural prompts (MCP client-side examples):
- Safe start (bounded + one step)
  - "Use sequential thinking to investigate API latency in openshift-monitoring. Plan: namespace health (skip ingress), then list Prometheus pods. Bounded mode; execute one step only and reflect. Session: seq-demo-aws."
- Continue plan
  - "Continue the plan for session seq-demo-aws. Stay bounded; execute only the next planned step and reflect."
- Ingress 503 (new session)
  - "Start a bounded, step-by-step plan focused only on ingress troubleshooting. 503s for external users. First check ingress operator (openshift-ingress-operator), then router pods (openshift-ingress), then ingress resources. Execute one step only and reflect. Session: ingress-503-debug."
- Verify capture
  - "Search operational memory for recent tool executions in session seq-demo-aws and summarize the last 5 actions."

Direct tool calls (if your LLM struggles with tool formatting):
- `oc_read_get_pods({ sessionId: "ingress-503-debug", namespace: "openshift-ingress-operator" })`
- `oc_read_get_pods({ sessionId: "ingress-503-debug", namespace: "openshift-ingress" })`
- `oc_read_describe({ sessionId: "ingress-503-debug", resourceType: "ingresscontroller", name: "default", namespace: "openshift-ingress-operator" })`
- After listing router pods, describe one pod: `oc_read_describe({ sessionId: "ingress-503-debug", resourceType: "pod", name: "<router-pod>", namespace: "openshift-ingress" })`

Heuristics in bounded mode:
- Defaults to `includeIngressTest=false` and `deepAnalysis=false` unless explicitly overridden.
- If your prompt contains "skip ingress", the orchestrator disables ingress testing.
- Avoids broad `pod_health` calls without a specific pod; lists pods first in the likely namespace.

Example MCP messages over stdio:

```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
  "protocolVersion": "2024-11-05", "capabilities": {},
  "clientInfo": { "name": "example", "version": "1.0.0" }
}}

{ "jsonrpc": "2.0", "id": 2, "method": "tools/list" }

{ "jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": {
  "name": "oc_diagnostic_cluster_health",
  "arguments": { "sessionId": "seq-demo-1", "userInput": "monitoring alerts and timeouts" }
}}
```

Expected response includes `toolStrategy` with planned steps and `finalResult.summary` such as
"Executed N tools with memory-aware reasoning". Structured logs on stdout include `memory_search_operational`,
`sequential_strategy`, `tool_execution`, and (on retries) `tool_retry`.

### Memory System (Client-side Embeddings)

- Uses a single Chroma collection: `llm_conversation_memory`.
- Always writes JSON backup + vector (when Chroma is reachable).
- Always queries vector first; falls back to JSON when vector returns none or server is down.

Note: Recent updates, cleanup commands, diagnostics, and ranking tweaks are documented in `CHROMA_CHANGELOG.md`.

Dependencies:
- `@xenova/transformers` (optional but recommended).
- `node-fetch@3` only if your Node version lacks `fetch` (Node 18+ includes `fetch`).

Install/cleanup:
```bash
npm install @xenova/transformers node-fetch@3
npm uninstall chromadb
```

Health + reload CLI:
```bash
# Health (checks Chroma REST v2 is reachable)
npm run memory:health            # uses CHROMA_HOST/CHROMA_PORT or defaults

# Reload JSON -> vector DB (client embeddings)
npm run memory:reload            # migrates ./memory/default/*.json into vector DB

# Optional overrides
CHROMA_HOST=127.0.0.1 CHROMA_PORT=8000 npm run memory:health
CHROMA_HOST=127.0.0.1 CHROMA_PORT=8000 npm run memory:reload
```

Memory search CLI:
```bash
# Conversation memories (vector-first, JSON fallback)
npm run memory:search "chromadb victory"           # [limit=5] [sessionId]
npm run memory:search "kubernetes deployment" 10   # top 10

# Operational memories (incident-style)
npm run memory:find "imagepullbackoff troubleshooting" 5

# Recommended env
export SHARED_MEMORY_DIR=/Users/kevinbrown/memory/consolidated
export CHROMA_HOST=127.0.0.1
export CHROMA_PORT=8000

# Optional: silence Xenova warning in CI and force hashing fallback
export TRANSFORMERS_CACHE=~/.cache/transformers
export MCP_OCS_FORCE_JSON=true
```

Cleanup and collections:
```bash
# Remove synthetic benchmark data from vector store (bench-*)
npm run memory:clean-bench

# Delete by custom session/document pattern
npm run memory:delete-pattern -- "your-pattern"

# Inspect/switch collections (Chroma v2)
npm run memory:collections:list
npm run memory:collections:switch benchmark_test_data

# Benchmark now uses a dedicated collection, not production
export BENCHMARK_COLLECTION=benchmark_test_data
```

CI tip:
- Force JSON fallback for deterministic CI: `MCP_OCS_FORCE_JSON=true npm test`

### **Verify Beta Tools**

```bash
# List available beta tools
npm run beta:tools:node

# Validate beta configuration  
npm run validate:beta

# Quick cluster sanity check
npm run real:sanity
```

## 🔧 Configuration

### **Prerequisites**
- **OpenShift CLI (`oc`)** - Installed and authenticated
- **Node.js 18+** - For running the MCP server
- **KUBECONFIG** - Pointing to your OpenShift cluster
- **Read Access** - To cluster resources (no write permissions needed)

### **Environment Setup**
```bash
# Required: OpenShift cluster access
export KUBECONFIG=/path/to/your/kubeconfig

# Optional: Custom configuration
export MCP_OCS_LOG_LEVEL=info
export MCP_OCS_MAX_NAMESPACES=10  # For bounded analysis
```

## 🎯 Usage Examples

### **Intelligent Cluster Overview**
```bash
# Auto-prioritize problems across all namespaces  
oc_diagnostic_cluster_health({
  namespaceScope: 'all',
  focusStrategy: 'auto', 
  depth: 'summary',
  maxNamespacesToAnalyze: 8
})
```

### **Crisis Mode Diagnostics**
```bash
# Focus on specific critical namespace
oc_diagnostic_cluster_health({
  focusNamespace: 'openshift-monitoring',
  depth: 'detailed',
  focusStrategy: 'events'
})
```

### **Systematic Incident Response**
```bash
# Run complete RCA checklist
oc_diagnostic_rca_checklist({
  sessionId: 'incident-2024-08-14',
  includeEvidence: true
})
```

## 📊 Performance & Validation

### **Real Cluster Testing**
- ✅ **116 namespaces analyzed** - Complete system visibility
- ✅ **90%+ tool success rate** - Reliable under production workloads  
- ✅ **Large cluster performance** - Bounded analysis prevents timeouts
- ✅ **Crisis scenario validated** - Intelligent prioritization surfaces real issues

### **Memory Integration**
- **213 operational memories stored** - Learning from operational patterns
- **261.51 KB memory footprint** - Efficient knowledge storage
- **ChromaDB vector search** - Semantic pattern matching for incidents
- **Domain filtering** - Context-aware knowledge retrieval

## 🏗 Architecture

### **Built on Solid Foundations**
- **Model Context Protocol (MCP)** - Standard AI tool integration
- **TypeScript** - Type-safe implementation with comprehensive interfaces
- **Modular Design** - Tool maturity system with production/beta/alpha classification
- **Memory System** - ChromaDB + JSON hybrid for operational intelligence

### **Production Ready Patterns**
- **Secure CLI Execution** - No shell injection, argument validation
- **Bounded Performance** - Configurable limits for large cluster efficiency  
- **Intelligent Prioritization** - Crisis-ready problem detection
- **Operational Learning** - Memory-driven pattern recognition

## 🤝 Contributing

### **Development Workflow**
```bash
# Work on new features (develop branch)
git checkout develop
git pull origin develop

# Make changes and test
npm run build
npm test

# Commit and push
git add -A
git commit -m "feat: your enhancement"
git push origin develop
```

### **Beta Updates**
Critical fixes for beta users go through the `release/v0.8.0-beta` branch with patch releases (`v0.8.0-beta-1`, `v0.8.0-beta-2`, etc.).

## 🐛 Issues & Support

### **Beta User Support**
- **Critical bugs** in the 13 validated tools ✅
- **Installation/configuration issues** ✅  
- **OpenShift compatibility problems** ✅
- **Performance optimization** ✅

### **Not Supported in Beta**
- Feature requests (save for v1.0)
- Experimental tool issues
- Custom integrations

## 📈 Roadmap

### **v1.0 Features (In Development)**
- **Multi-Cluster Support** - Diagnose across dev/staging/prod environments
- **Predictive Intelligence** - "This usually means X, check Y next" recommendations
- **Enterprise Features** - Role-based access, audit trails, advanced reporting
- **GitOps Integration** - ArgoCD/Flux diagnostic capabilities

### **Advanced Capabilities**
- **Tekton Pipeline Diagnostics** - Build and deployment pipeline analysis
- **Resource Dependency Mapping** - Complete cluster dependency visualization
- **Automated Remediation** - Safe, intelligent problem resolution

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built for OpenShift engineers who need intelligent, reliable diagnostic tools that work under pressure. Special thanks to the OpenShift community for real-world validation and feedback.

---

**Ready to transform your OpenShift operations?** [Download v0.8.0-beta-1](https://github.com/kevin-biot/MCP-ocs/releases/tag/v0.8.0-beta-1) and experience intelligent cluster diagnostics today!
