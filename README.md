# MCP-ocs: OpenShift Container Platform Operations Server

⚠️ **DEVELOPMENT IN PROGRESS** - This repository is undergoing significant architectural changes and active development. Not recommended for production use at this time.

A Model Context Protocol (MCP) server for OpenShift operations and diagnostics, implementing structured workflows, memory-guided troubleshooting, and observability features.

## 🚧 Current Development Status

### ✅ Testing Infrastructure (Recently Completed)
- **4/5 Test Suites Passing**: Major testing milestone achieved
- **Jest Configuration**: TypeScript/Jest integration working
- **Organized Structure**: Complete testing documentation and scripts
- **Zero Jest Errors**: All configuration issues resolved

### ✅ Core Architecture Foundation
- **TypeScript Implementation**: Strict type safety throughout
- **Configuration Management**: Centralized schema with validation
- **Logging System**: Structured JSON logging with context preservation
- **OpenShift Integration**: CLI wrapper with error handling

### 🔄 Active Development Areas
- **Memory System**: Hybrid ChromaDB + JSON storage implementation
- **Tool Management**: Namespace-aware tool organization
- **Health Monitoring**: System health checks and observability
- **Workflow Engine**: Structured troubleshooting workflows

## Architecture Overview

This project implements a comprehensive architectural framework:

### OpenShift Integration (ADR-001)
- **OpenShiftClient**: Wraps `oc` commands with safety and validation
- **Command Sanitization**: Input validation and error handling
- **JSON Processing**: Type-safe OpenShift resource parsing
- **Future Migration Path**: Planned Kubernetes API client transition

### Memory System (ADR-003)
- **Hybrid Storage**: ChromaDB for vectors, JSON for reliability
- **Context Preservation**: Conversation and operational memory
- **Vector Search**: Similarity-based context retrieval
- **Graceful Fallback**: Automatic degradation handling

### Tool Organization (ADR-004)
- **Namespace Management**: Hierarchical tool organization (`oc_*`, `memory_*`)
- **Context Filtering**: Situation-aware tool availability
- **Workflow Integration**: Memory-guided tool recommendations

### Configuration & Logging (ADR-005)
- **Centralized Configuration**: Single source of truth with validation
- **Environment Support**: Development, test, staging configurations
- **Structured Logging**: JSON logs with automatic context and timing
- **Security**: Sensitive data protection and sanitization

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ with npm
- TypeScript 5.0+
- OpenShift CLI (`oc`) if using OpenShift features
- ChromaDB (optional - JSON fallback available)

### Quick Start
```bash
# Clone and install
git clone <repository>
cd MCP-ocs
npm install

# Run tests
npm run test:unit

# Development mode
npm run dev
```

### Testing
```bash
# Run all tests
npm run test:unit

# Enhanced test analysis
scripts/test/dual-mode/enhanced-clean.sh

# Individual test debugging
npm run test:unit -- tests/unit/basic.test.ts --verbose
```

## 📚 Documentation

### Testing Documentation
- [Testing Strategy](docs/testing/strategy/roadmap.md) - 5-phase testing evolution
- [Current Status](docs/testing/strategy/current-state.md) - Progress tracking
- [Standards](docs/testing/strategy/standards.md) - Testing conventions

### Architecture Documentation
- [ADR-001](docs/architecture/ADR-001-openshift-cli-wrapper.md) - OpenShift Integration
- [ADR-003](docs/architecture/ADR-003-hybrid-memory-system.md) - Memory Architecture  
- [ADR-004](docs/architecture/ADR-004-tool-namespace-management.md) - Tool Organization
- [ADR-005](docs/architecture/ADR-005-configuration-logging.md) - Config & Logging

## 🎯 Roadmap

### Phase 1: Foundation (80% Complete)
- [x] Core TypeScript architecture
- [x] Testing infrastructure 
- [x] Configuration system
- [x] Basic OpenShift integration
- [ ] Complete test suite (1 test remaining)

### Phase 2: Core Features (Planned)
- [ ] Memory system implementation
- [ ] Workflow engine
- [ ] Tool namespace management
- [ ] Health monitoring

### Phase 3: Production Readiness (Future)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Comprehensive monitoring
- [ ] Documentation completion

## ⚠️ Important Notes

- **Not Production Ready**: Active development with frequent breaking changes
- **Testing Focus**: Currently prioritizing test infrastructure completion
- **API Stability**: Interfaces may change significantly
- **Documentation**: Work in progress, may be incomplete

## 🤝 Contributing

This project is in active development. Please check the testing documentation and current issues before contributing.

---

**Development Status**: Foundation Phase (80% complete)  
**Last Updated**: August 13, 2025  
**Test Status**: 4/5 suites passing, Jest errors eliminated