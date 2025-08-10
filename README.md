# MCP-ocs: OpenShift Container Platform Operations Server

**A Model Context Protocol (MCP) server for structured OpenShift diagnostics, operations, and incident management.**

## 🎯 **Project Vision**

MCP-ocs transforms chaotic 4 AM troubleshooting into methodical, AI-assisted operations. Built for telco operators and enterprise teams running OpenShift, it prevents "random troubleshooting" and captures operational knowledge for continuous learning.

### **Core Problems Solved**
- ❌ **Panic-driven operations** → ✅ **Structured diagnostic workflows**
- ❌ **Repeated incident resolution** → ✅ **Pattern recognition and knowledge reuse** 
- ❌ **Tribal knowledge loss** → ✅ **Persistent operational memory**
- ❌ **Random troubleshooting** → ✅ **Evidence-based problem solving**

## 🏗️ **Architecture Overview**

```
LLM Client (Claude/LM Studio/Qwen)
         ↓
    MCP Router (Smart Workflow Engine)
    ├── Panic detection & prevention
    ├── Diagnostic workflow enforcement  
    ├── Cross-domain memory coordination
    └── Context-aware tool presentation
         ↓
    MCP-ocs (OpenShift Operations)
    ├── Read-only diagnostics (oc get, describe, logs)
    ├── Write operations (oc apply, scale, restart) 
    ├── Health checks & recommendations
    └── Incident pattern recognition
         ↓
   Shared Memory System (ChromaDB + JSON)
   ├── Operational incident database
   ├── Cross-session conversation context
   ├── Diagnostic workflow templates
   └── Root cause analysis patterns
```

## 🎯 **Target Market Evolution**

### **Phase 1: Telco OpenShift** (Current Focus)
- Heavy OpenShift users with complex networking
- Regulatory compliance requirements
- 24/7 operations teams needing structured guidance

### **Phase 2: Enterprise Mixed K8s**
- Hybrid OpenShift + vanilla Kubernetes environments
- Multi-cloud operations (EKS, GKE, AKS)
- DevOps teams scaling operations

### **Phase 3: Universal Kubernetes**
- Any CNCF-certified Kubernetes distribution
- SMB to enterprise market expansion
- Cloud-native operations standardization

## 🛠️ **Technical Implementation**

### **Deployment Phases**

#### **Phase 1: Laptop Development** (Current)
```
Developer Laptop (macOS/Linux)
├── MCP-ocs server (Node.js/TypeScript)
├── `oc` CLI → OpenShift cluster (AWS/Azure/GCP)
├── ChromaDB (local vector database)
└── LLM client (Claude/LM Studio)
```

#### **Phase 2: Containerized Deployment**
```
OpenShift Cluster
├── MCP-ocs Pod (containerized server)
│   ├── ServiceAccount with RBAC constraints
│   ├── Network policies for security
│   └── Resource limits and monitoring
├── ChromaDB StatefulSet (persistent storage)
└── Ingress/Route for LLM client access
```

#### **Phase 3: GitOps Integration**
```
GitOps Workflow
├── Configuration as Code (Helm charts)
├── ArgoCD for deployment automation  
├── Policy enforcement (OPA/Gatekeeper)
└── Multi-cluster federation
```

### **Platform Abstraction Strategy**

```typescript
// Universal container platform interface
interface ContainerPlatform {
  getPods(): Promise<Pod[]>;
  getNetworkResources(): Promise<NetworkResource[]>;
  getSecurityContexts(): Promise<SecurityContext[]>;
  getDiagnosticLogs(): Promise<LogEntry[]>;
  checkHealth(): Promise<HealthStatus>;
}

// Platform-specific implementations
class OpenShiftPlatform implements ContainerPlatform {
  // OpenShift-specific: Routes, ImageStreams, SCCs
}

class KubernetesPlatform implements ContainerPlatform {
  // Standard K8s: Ingress, Deployments, PSPs
}
```

## 🔄 **Development Methodology**

### **Sprint-Based Development**
- **Sprint Duration:** 1-2 days per feature
- **Git Workflow:** Feature branches with immediate testing
- **Test Environment:** Real AWS OpenShift cluster
- **Definition of Done:** Works against production-like environment

### **Sprint Roadmap**

#### **Week 1: Foundation**
- **Sprint 1.1:** Basic MCP server skeleton + health check
- **Sprint 1.2:** First read-only tool (`oc_get_pods`)  
- **Sprint 1.3:** Shared memory integration

#### **Week 2: Core Diagnostics**
- **Sprint 2.1:** Pod diagnostics (`oc_describe_pod`, `oc_get_pod_logs`)
- **Sprint 2.2:** Event analysis and correlation
- **Sprint 2.3:** Health checking with actionable recommendations

#### **Week 3: Router Intelligence**
- **Sprint 3.1:** Basic router with tool aggregation
- **Sprint 3.2:** Context-aware tool presentation  
- **Sprint 3.3:** Panic detection and workflow enforcement

#### **Week 4: Write Operations & Safety**
- **Sprint 4.1:** State management (cluster context, sessions)
- **Sprint 4.2:** Write operations with approval workflows
- **Sprint 4.3:** GitOps integration planning

## 🔒 **Safety & Security Framework**

### **Environment Classification**
```typescript
ENVIRONMENT_CLASSES = {
  "dev": { 
    risk_level: "low", 
    auto_apply: true,
    approval_required: false
  },
  "test": { 
    risk_level: "medium", 
    auto_apply: true,
    approval_required: false 
  },
  "staging": { 
    risk_level: "high", 
    auto_apply: false,
    approval_required: true
  },
  "prod": { 
    risk_level: "critical", 
    auto_apply: false,
    requires_senior_approval: true,
    red_light_warnings: true
  }
}
```

### **Red Light Scenarios** 
Operations requiring senior approval + extensive audit:
- Resource deletions in staging/production
- Cross-namespace operations  
- Large-scale changes (>10 pods affected)
- Critical service modifications
- Any production write operation during business hours

### **Authentication Evolution**
- **Phase 1:** Laptop kubeconfig + user credentials
- **Phase 2:** ServiceAccount with least-privilege RBAC
- **Phase 3:** User impersonation + per-operation attribution

## 🧠 **Shared Memory Architecture**

### **Memory Types**

#### **Conversation Memory**
```typescript
interface ConversationMemory {
  sessionId: string;
  domain: string; // 'openshift', 'kubernetes', 'files'
  userMessage: string;
  assistantResponse: string;
  context: string[]; // Auto-extracted technical terms
  tags: string[]; // Categorization labels
  timestamp: number;
}
```

#### **Operational Memory**
```typescript
interface OperationalMemory {
  incidentId: string;
  domain: string;
  symptoms: string[]; // Observable problems
  rootCause?: string; // Determined cause
  resolution?: string; // Applied solution
  environment: 'dev' | 'test' | 'staging' | 'prod';
  affectedResources: string[]; // Pods, services, etc.
  diagnosticSteps: string[]; // Investigation process
  tags: string[]; // Problem categorization
}
```

### **Cross-Domain Learning**
- **Pattern Recognition:** "This OpenShift Route issue is similar to previous Ingress problems"
- **Knowledge Transfer:** Solutions from dev environment applicable to staging
- **Incident Correlation:** Multiple related incidents grouped automatically
- **Preventive Recommendations:** "Teams often see this after deploying configuration X"

## 🛡️ **Operational Hardening**

### **Panic Prevention System**
```typescript
enum DiagnosticState {
  GATHERING = 'gathering',     // Only read operations allowed
  ANALYZING = 'analyzing',     // Pattern matching against memory
  HYPOTHESIZING = 'hypothesizing', // Guided evidence collection  
  TESTING = 'testing',         // Targeted investigation tools
  RESOLVING = 'resolving'      // Write operations unlocked with approval
}
```

### **Workflow Enforcement**
- **No fixes without evidence** - Diagnostic steps must be completed
- **Structured investigation** - Follow proven troubleshooting templates
- **Memory-guided decisions** - "Similar incidents were resolved by..."
- **Approval gates** - Senior engineer sign-off for high-risk operations

### **Audit Trail**
- **Every operation logged** with user attribution and context
- **Decision rationale captured** - Why this action was chosen
- **Memory references** - Which past incidents influenced decisions
- **Approval chains recorded** - Who authorized what operations

## 📊 **Success Metrics**

### **Operational KPIs**
- **MTTR Reduction:** Time from incident detection to resolution
- **Panic Prevention:** Reduction in destructive/random actions
- **Knowledge Reuse:** % of incidents matched to existing patterns
- **Workflow Compliance:** % of incidents following structured process

### **Learning Metrics**  
- **Memory Effectiveness:** Accuracy of similar incident matching
- **Pattern Recognition:** Discovery of recurring operational issues
- **Knowledge Transfer:** Cross-team learning and best practice sharing
- **Preventive Impact:** Reduction in repeat incidents

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- OpenShift CLI (`oc`) configured with cluster access
- ChromaDB server running locally or accessible endpoint
- LLM client (Claude, LM Studio, or compatible MCP client)

### **Quick Start**
```bash
# Clone and install
git clone [repository-url]
cd MCP-ocs
npm install

# Build shared memory library
cd ../MCP-router/src/memory
npm run build

# Start development server
cd ../../MCP-ocs
npm run dev

# Test against your cluster
oc get pods # Verify cluster access
npm test
```

### **Development Setup**
```bash
# Start unified environment (from MCP-files directory)
./start-unified.sh

# This starts:
# - ChromaDB on port 8000
# - MCP File Server on port 8080  
# - All directories accessible
# - Memory system initialized
```

## 🤝 **Contributing**

### **Development Workflow**
1. **Create feature branch:** `git checkout -b feature/sprint-name`
2. **Develop incrementally:** Small commits with clear messages
3. **Test against real cluster:** Validate with AWS OpenShift environment
4. **Memory integration:** Store learnings and patterns
5. **Pull request:** Code review and merge to main

### **Sprint Guidelines**
- **Maximum 2-day sprints** for rapid iteration
- **Real cluster testing** required for completion
- **Memory integration** in every feature
- **Non-breaking changes** to existing functionality
- **Documentation updated** with each sprint

## 📝 **Documentation**

- **[Architecture Decision Records](./docs/architecture/)** - Technical decisions and rationale
- **[API Documentation](./docs/api/)** - Tool interfaces and schemas  
- **[Workflow Guides](./docs/workflows/)** - Diagnostic procedures and templates
- **[Deployment Guide](./docs/deployment/)** - Installation and configuration

## 🔗 **Related Projects**

- **[MCP-files](../MCP-files/)** - File system operations and shared memory foundation
- **[MCP-router](../MCP-router/)** - Smart routing and workflow orchestration
- **[Shared Memory Library](../MCP-router/src/memory/)** - Cross-domain memory management

## 📄 **License**

MIT License - See [LICENSE](./LICENSE) for details

## 📞 **Support**

- **Issues:** GitHub Issues for bug reports and feature requests
- **Discussions:** GitHub Discussions for architecture and usage questions  
- **Documentation:** Comprehensive guides in `/docs` directory

---

**Built for operations teams who refuse to accept 4 AM chaos as normal.** 🌟

*Transform your OpenShift operations from reactive firefighting to proactive, AI-assisted excellence.*
