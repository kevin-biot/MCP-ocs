# Contributing to MCP-ocs

Thank you for your interest in contributing to MCP-ocs! This guide will help you get started.

## 🚀 Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd MCP-ocs
   npm install
   npm run build
   ```

2. **Development Workflow**:
   ```bash
   npm run dev     # Development mode with auto-rebuild
   npm run test    # Run tests (when available)
   npm run lint    # Code quality checks
   ```

## 📋 Development Guidelines

### Code Quality Standards
- **TypeScript Strict Mode**: All code must pass strict TypeScript compilation
- **No `as any`**: Use proper type guards and type definitions
- **Error Handling**: Comprehensive try/catch with structured logging
- **Documentation**: JSDoc comments for all public methods and complex logic

### Architecture Principles
- **ADR Compliance**: All changes must align with architectural decision records (ADR-001 through ADR-005)
- **Namespace Management**: Follow tool naming conventions (`oc_*`, `memory_*`, `core_*`)
- **Memory Integration**: Store relevant operations in conversation/operational memory
- **Workflow Enforcement**: Respect panic detection and structured diagnostic workflows

### Production Requirements
- **Structured Logging**: Use the structured logger for all output
- **Health Checks**: Update health checks for new components
- **Configuration**: Add new config options to centralized schema
- **Graceful Shutdown**: Register shutdown handlers for new services

## 🛠️ Development Process

### 1. Issue Creation
- **Bug Reports**: Include reproduction steps, expected vs actual behavior
- **Feature Requests**: Explain use case, proposed solution, impact assessment
- **Documentation**: Identify gaps or improvements needed

### 2. Development Workflow
1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Follow ADR Guidelines**: Ensure changes align with architectural decisions
3. **Add Tests**: Include unit tests for new functionality
4. **Update Documentation**: README, CHANGELOG, and relevant docs
5. **Code Review**: Submit PR with clear description and testing notes

### 3. Code Review Criteria
- **Functionality**: Does it work as intended?
- **Architecture**: Does it follow ADR principles?
- **Quality**: Is it well-structured and maintainable?
- **Performance**: Are there any performance implications?
- **Security**: Are inputs validated and outputs sanitized?

## 🔧 Technical Contributions

### Adding New Tools
1. **Choose Namespace**: Select appropriate prefix (`oc_*`, `memory_*`, etc.)
2. **Implement Interface**: Follow `ToolDefinition` interface requirements
3. **Add to Category**: Place in appropriate tool group (diagnostics, read-ops, etc.)
4. **Memory Integration**: Store tool executions in memory for learning
5. **Documentation**: Update tool lists in README and documentation

### Enhancing Components
- **OpenShift Client**: Add new `oc` command wrappers with proper sanitization
- **Memory System**: Enhance search algorithms or storage efficiency
- **Workflow Engine**: Add new panic detection patterns or state transitions
- **Configuration**: Extend schema with validation rules

### Infrastructure Improvements
- **Logging**: Enhance structured logging with new context types
- **Health Checks**: Add monitoring for new components
- **Performance**: Add caching, optimization, or benchmarking
- **Security**: Strengthen validation, sanitization, or access controls

## 📊 Testing Guidelines

### Unit Testing (Planned)
- **Coverage Target**: >90% code coverage
- **Test Structure**: `tests/` directory mirroring `src/` structure
- **Mock Strategy**: Mock external dependencies (OpenShift CLI, ChromaDB)
- **Edge Cases**: Test error conditions and boundary cases

### Integration Testing (Planned)
- **End-to-End**: Full workflow testing with real OpenShift cluster
- **Memory Integration**: Test conversation and operational memory storage
- **Configuration**: Test various configuration scenarios
- **Error Handling**: Verify graceful degradation and recovery

## 📚 Documentation Standards

### Code Documentation
- **JSDoc Comments**: All public methods and complex algorithms
- **Type Definitions**: Comprehensive TypeScript interfaces
- **Architecture Notes**: Explain design decisions and trade-offs
- **Examples**: Include usage examples for new features

### User Documentation
- **README Updates**: Keep architecture overview current
- **Configuration Guide**: Document new environment variables and options
- **Tool Reference**: Maintain accurate tool lists and descriptions
- **Troubleshooting**: Add common issues and solutions

## 🎯 Contribution Areas

### High Priority
- **ChromaDB Integration**: Replace placeholder with real ChromaDB client
- **Enhanced Tool Execution**: Complete OpenShift client method implementations
- **Testing Suite**: Comprehensive unit and integration tests
- **Performance Optimization**: Response time and throughput improvements

### Medium Priority
- **Circuit Breaker Pattern**: Resilient component integration
- **Dynamic Tool Discovery**: Plugin-based tool registration
- **Advanced Panic Detection**: Domain jumping, permission escalation patterns
- **Caching Strategy**: Intelligent caching for frequently accessed data

### Documentation & Examples
- **User Guides**: Step-by-step operational procedures
- **API Reference**: Complete method and interface documentation
- **Deployment Guides**: Production deployment best practices
- **Tutorial Content**: Getting started guides and examples

## 🤝 Community Guidelines

### Communication
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Code Review**: Provide constructive, specific feedback
- **Documentation**: Ask questions if anything is unclear

### Collaboration
- **Respect**: Treat all contributors with respect and professionalism
- **Patience**: Allow time for review and response
- **Learning**: Help others learn and grow
- **Quality**: Maintain high standards while being supportive

## 📞 Getting Help

- **Architecture Questions**: Review ADR documents in `docs/architecture/`
- **Development Setup**: Check README.md quick start section
- **Code Examples**: Examine existing tool implementations
- **Issues**: Create GitHub issue with detailed description

Thank you for contributing to MCP-ocs! Your efforts help make OpenShift operations safer and more efficient. 🚀
