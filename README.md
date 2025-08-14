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

### **Fast Namespace Analysis**
```bash
# Quick namespace health check
npm run itest:real:ns -- --ns openshift-monitoring
npm run itest:real:ns -- --ns student03
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