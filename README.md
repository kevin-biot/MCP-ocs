# MCP-OCS (OpenShift Container Storage Operations)

> **Systematic AI-Powered Diagnostic Framework for OpenShift Clusters**

[![Beta Development](https://img.shields.io/badge/status-active--beta-orange.svg)](https://github.com/kevin-biot/MCP-ocs)
[![ADR Coverage](https://img.shields.io/badge/architecture-22%20ADRs-brightgreen.svg)](#architecture)
[![Implementation](https://img.shields.io/badge/core%20features-53%25%20implemented-yellow.svg)](#development-status)
[![Foundation](https://img.shields.io/badge/architectural--foundation-complete-success.svg)](#architectural-foundation)

MCP-OCS is a systematic approach to AI-powered OpenShift cluster diagnostics built on comprehensive architectural documentation. Rather than claiming production readiness, we've focused on creating a solid foundation with 22 Architecture Decision Records covering complete operational scenarios.

## 🎯 **What MCP-ocs Actually Is**

### **Systematic Architectural Foundation** ✅
- **22 comprehensive ADRs** covering complete diagnostic workflows
- **Feature epic roadmap** with dependency-driven implementation
- **Proven development process** using bounded AI integration
- **89% architectural coverage** with systematic gap remediation

### **Beta Software with Rapid Evolution** ⚠️
- **Active development** with weekly architectural iterations
- **Core tools operational** but expect API changes
- **Comprehensive documentation** exceeds current implementation
- **Stepped evolution** approach over revolutionary claims

### **AI-Enhanced Operations (Not AI-Driven)** 🤖
- **Human decision making** with AI analysis and recommendations
- **Read-only diagnostic intelligence** with comprehensive cluster visibility
- **Memory-enhanced pattern recognition** learning from operational history
- **Crisis-ready prioritization** but requires human interpretation

## 🏗 **Architectural Foundation**

Our development follows the "slow is smooth, smooth is fast" principle. Instead of rushing to production claims, we've invested in systematic architectural documentation:

### **Complete ADR Coverage (22 Documents)**
```
✅ ADR-001: OpenShift vs Kubernetes API Strategy
✅ ADR-002: GitOps Integration Strategy  
✅ ADR-003: Memory Storage and Retrieval Patterns
✅ ADR-004: Tool Namespace Management
✅ ADR-005: Workflow State Machine Design
✅ ADR-006: Modular Tool Architecture
✅ ADR-007: Automatic Tool Memory Integration
✅ ADR-008: Production Operator Architecture
✅ ADR-009: RBAC Emergency Change Management
✅ ADR-010: Systemic Diagnostic Intelligence
✅ ADR-011: Fast RCA Framework
✅ ADR-012: Operational Intelligence Data Model
✅ ADR-013: Automated Runbook Execution
✅ ADR-014: Deterministic Template Engine
✅ ADR-015: GoLLM Provider Enhancement
✅ ADR-016: Multi-Tenancy Session Management
✅ ADR-017: AI War Room Commander Architecture
✅ ADR-018: kubectl AI Future Enhancement
✅ ADR-019: Multi-Tenancy Progressive Evolution
✅ ADR-020: Risk-Based Security Development
✅ ADR-021: Natural Language Input Normalization
✅ ADR-022: Normalized Fact Model Type System
```

**See**: [`docs/architecture/`](docs/architecture/) for complete architectural documentation

### **Feature Epic Implementation Roadmap**
Our development follows structured feature epics with clear dependencies:

- **F-001**: Memory System → **✅ COMPLETE**
- **F-003**: Template Engine → **✅ COMPLETE** 
- **F-006**: Workflow State Management → **✅ COMPLETE**
- **F-008**: Modular Tool Architecture → **🚧 IN PROGRESS**
- **F-009**: Fast RCA Framework → **🚧 IN PROGRESS**
- **F-002**: Production Operator Deployment → **📋 DESIGNED**

## 🔧 **Current Implementation Status**

### **Core Systems (Production Ready)** ✅
| Component | Status | Implementation | Quality |
|-----------|--------|----------------|---------|
| Memory System (ADR-003) | ✅ Complete | 100% | Excellent |
| Template Engine (ADR-014) | ✅ Complete | 100% | Excellent |
| Workflow State (ADR-005) | ✅ Complete | 85% | Good |
| Tool Memory Integration (ADR-007) | ✅ Complete | 100% | Excellent |
| CLI Wrapper (ADR-001) | ✅ Complete | 95% | High |

### **Beta Features (Active Development)** 🚧
| Component | Status | Implementation | Priority |
|-----------|--------|----------------|----------|
| Systemic Intelligence (ADR-010) | 🚧 Partial | 40% | High |
| Tool Namespace Management (ADR-004) | 🚧 Partial | 60% | Medium |
| GitOps Integration (ADR-002) | 🚧 Partial | 30% | Medium |
| RBAC Framework (ADR-009) | 🚧 Partial | 20% | High |

### **Designed but Not Implemented** 📋
- **Production Operator Architecture (ADR-008)** - 4-6 weeks
- **Fast RCA Framework (ADR-011)** - 3-4 weeks  
- **Natural Language Normalization (ADR-021)** - 6-8 weeks
- **Modular Plugin System (ADR-006)** - 2 weeks
- **Automated Runbook Execution (ADR-013)** - 3-4 weeks

**Architecture Health**: 53% implemented (9/17 ADRs have code), 29% production-ready

## 🛠 **Available Tools (Beta)**

### **Operational Tools**
- **Diagnostic Framework**: Cluster health, namespace analysis, pod lifecycle analysis
- **Memory Intelligence**: Operational pattern storage, incident search, conversation context
- **Read Operations**: Pod information, resource descriptions, log retrieval
- **Workflow State**: Session management, operational context tracking

### **Tool Maturity Levels**
- **Alpha**: Experimental, API changes expected
- **Beta**: Core functionality working, refinement ongoing
- **Production**: Stable API, comprehensive testing, performance validated

**Current Reality**: Most tools are in Beta status with core functionality working but APIs subject to change.

## 🚀 **Getting Started (Beta Users)**

### **Prerequisites**
- OpenShift CLI (`oc`) installed and authenticated
- Node.js 18+ for running the MCP server  
- KUBECONFIG pointing to your OpenShift cluster
- MCP-compatible AI client (Claude Desktop, LM Studio)

### **Installation**
```bash
# Clone repository
git clone https://github.com/kevin-biot/MCP-ocs.git
cd MCP-ocs

# Install dependencies
npm install

# Verify OpenShift access
export KUBECONFIG=/path/to/your/kubeconfig
oc whoami && oc cluster-info

# Start MCP server (beta)
npm run dev
```

### **MCP Client Configuration**

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "mcp-ocs": {
      "command": "npm",
      "args": ["run", "dev"],
      "cwd": "/path/to/MCP-ocs",
      "env": {
        "KUBECONFIG": "/path/to/your/kubeconfig"
      }
    }
  }
}
```

## ⚠️ **Beta Software Limitations**

### **What Works Well**
- Core diagnostic workflows for cluster health analysis
- Memory system stores and retrieves operational patterns
- Template-based consistency across different AI models  
- CLI integration with OpenShift clusters

### **Current Limitations**
- **API Stability**: Tool interfaces may change between versions
- **Performance**: Not optimized for very large clusters (>200 namespaces)
- **Security**: Basic authentication only, enterprise RBAC in development
- **Production Deployment**: Operator architecture designed but not implemented

### **Known Issues**
- Some diagnostic tools may timeout on clusters with >100 namespaces
- Memory search performance degrades with >1000 stored sessions
- Template engine requires manual updates for new OpenShift versions

## 📈 **Development Approach**

### **Systematic Evolution** 
Instead of marketing hype, we follow systematic architectural development:

1. **Comprehensive Design First** - ADRs before implementation
2. **Dependency-Driven Development** - Clear feature epic dependencies  
3. **Bounded AI Integration** - AI assists humans, doesn't replace decision making
4. **Real-World Validation** - Features tested against actual OpenShift clusters

### **"Slow is Smooth, Smooth is Fast"**
- Deliberate architectural foundation over rapid feature delivery
- Systematic gap remediation prevents technical debt
- Quality documentation enables reliable development velocity
- Realistic expectations prevent deployment disasters

## 🤝 **Contributing (Beta Program)**

### **We Welcome**
- **Beta testing feedback** on actual OpenShift environments
- **Architecture review** and improvement suggestions  
- **ADR implementation** following our established patterns
- **Documentation improvements** and gap identification

### **Development Process**
```bash
# Work with architectural context
git checkout develop
npm run dev

# Review ADRs before implementing features
ls docs/architecture/ADR-*.md

# Follow systematic development patterns
npm test && npm run build

# Document architectural decisions
# (See docs/templates/ for session templates)
```

### **Not Ready For**
- Production deployment consultation
- Performance optimization for massive clusters
- Custom enterprise integrations
- Feature requests (save for post-1.0)

## 🎯 **Roadmap to Production**

### **Phase 1: Core Implementation**
- Complete ADR-008: Production Operator Architecture
- Implement ADR-021: Natural Language Input Normalization  
- Finish ADR-011: Fast RCA Framework
- Production-ready security (ADR-009 RBAC)

### **Phase 2: Enterprise Features**
- Multi-cluster support with unified dashboards
- Advanced RBAC with audit trails
- Performance optimization for enterprise scale
- GitOps workflow automation

### **Phase 3: AI Enhancement**
- Predictive intelligence based on operational patterns
- Automated remediation with human approval workflows
- Cross-cluster correlation and analysis
- Integration with enterprise monitoring systems

## 📄 **Documentation**

### **Architecture Documentation**
- [`docs/architecture/`](docs/architecture/) - Complete ADR library
- [`docs/architecture/ADR-OVERVIEW.md`](docs/architecture/ADR-OVERVIEW.md) - Architecture summary
- [`docs/architecture/ADR-STATUS-DYNAMIC.md`](docs/architecture/ADR-STATUS-DYNAMIC.md) - Implementation tracking

### **Development Documentation**
- [`docs/development/`](docs/development/) - Development processes and templates
- [`docs/testing/`](docs/testing/) - Testing strategies and golden snapshots
- [`docs/templates/`](docs/templates/) - Session templates and workflows

## 🐛 **Beta Support**

### **Supported Issues**
- Installation and configuration problems
- Core diagnostic tool failures
- Memory system issues
- Documentation gaps or inaccuracies

### **Not Supported**
- Performance issues with very large clusters
- Custom tool development
- Production deployment planning
- Integration with non-standard OpenShift distributions

**Report Issues**: [GitHub Issues](https://github.com/kevin-biot/MCP-ocs/issues) with "Beta" label

## 📄 **License**

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 **Acknowledgments**

Built for OpenShift engineers who value systematic architectural development over marketing promises. Thanks to the beta testing community providing real-world validation and feedback.

---

**MCP-ocs: Systematic Architecture, Honest Beta Status, Real Value** 

*Ready to contribute to solid architectural foundation? Clone, explore our ADRs, and help build the future of AI-enhanced OpenShift operations.*