# MCP-ocs Testing Strategy

## 🎯 Testing Overview

Comprehensive testing strategy for a production-ready MCP server with OpenShift operations, memory systems, and workflow enforcement. The strategy covers unit, integration, end-to-end, security, and performance testing.

## 📋 Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ ← 5% (Critical workflows)
                    │   (Cypress)     │
                ┌───┴─────────────────┴───┐
                │  Integration Tests      │ ← 20% (Component interaction)
                │  (Jest + TestContainers)│
            ┌───┴─────────────────────────┴───┐
            │      Unit Tests                 │ ← 75% (Individual components)
            │   (Jest + TypeScript)           │
        └───────────────────────────────────────┘
```

## 🧪 Unit Testing Strategy (75% of tests)

### Framework: Jest + TypeScript
- **Target Coverage**: >90%
- **Focus**: Individual component logic, error handling, edge cases
- **Mocking**: External dependencies (oc CLI, ChromaDB, file system)

### Core Components to Test

#### 1. Configuration Management (`src/lib/config/`)
```typescript
// Test files: tests/unit/config/
- schema.test.ts - Configuration validation rules
- config-manager.test.ts - Multi-source configuration loading
```

**Test Cases**:
- ✅ Valid configuration parsing and type conversion
- ✅ Invalid configuration rejection with specific error messages
- ✅ Environment variable override precedence
- ✅ Default value application
- ✅ Security validation (path traversal, dangerous characters)

#### 2. Structured Logging (`src/lib/logging/`)
```typescript
// Test files: tests/unit/logging/
- structured-logger.test.ts - Log output formatting and filtering
```

**Test Cases**:
- ✅ JSON log format with required fields
- ✅ Log level filtering (debug/info/warn/error)
- ✅ Sensitive data redaction (passwords, tokens)
- ✅ Context enrichment and timing decorators
- ✅ Error object serialization

#### 3. OpenShift Client (`src/lib/openshift-client-enhanced.ts`)
```typescript
// Test files: tests/unit/openshift/
- openshift-client.test.ts - CLI wrapper with mocked commands
- circuit-breaker.test.ts - Resilience patterns
- input-sanitization.test.ts - Security validation
```

**Test Cases**:
- ✅ Command injection prevention (dangerous patterns)
- ✅ Circuit breaker state transitions
- ✅ Request deduplication and caching
- ✅ Error handling and graceful degradation
- ✅ Configuration validation
- ✅ Argument sanitization edge cases

#### 4. Memory System (`src/lib/memory/`)
```typescript
// Test files: tests/unit/memory/
- shared-memory.test.ts - Storage and retrieval operations
- context-extraction.test.ts - Auto-tagging functionality
```

**Test Cases**:
- ✅ ChromaDB fallback to JSON behavior
- ✅ Context extraction from conversations and operations
- ✅ Search similarity algorithms
- ✅ Memory cleanup and compression
- ✅ Operational memory pattern matching

#### 5. Workflow Engine (`src/lib/workflow/`)
```typescript
// Test files: tests/unit/workflow/
- workflow-engine.test.ts - State machine transitions
- panic-detection.test.ts - Danger pattern recognition
```

**Test Cases**:
- ✅ State transition validation (gathering → analyzing → resolving)
- ✅ Panic detection patterns (rapid-fire, bypassing diagnostics)
- ✅ Evidence requirement enforcement
- ✅ Memory-guided workflow suggestions
- ✅ Enforcement modes (guidance vs blocking)

#### 6. Health Checks (`src/lib/health/`)
```typescript
// Test files: tests/unit/health/
- health-check.test.ts - Component health monitoring
- graceful-shutdown.test.ts - Process lifecycle management
```

**Test Cases**:
- ✅ Individual health check implementations
- ✅ Overall health status calculation
- ✅ Kubernetes probe response formatting
- ✅ Shutdown handler registration and execution
- ✅ In-flight operation tracking

#### 7. Tool Management (`src/lib/tools/`)
```typescript
// Test files: tests/unit/tools/
- namespace-manager.test.ts - Tool filtering and context awareness
```

**Test Cases**:
- ✅ Context-based tool filtering
- ✅ Three-stream mode behavior (single/team/router)
- ✅ Tool conflict detection and resolution
- ✅ Priority-based tool selection

## 🔗 Integration Testing Strategy (20% of tests)

### Framework: Jest + TestContainers + Docker Compose
- **Focus**: Component interaction, external service integration
- **Real Dependencies**: ChromaDB, OpenShift test cluster, file system

### Integration Test Suites

#### 1. Memory System Integration
```typescript
// Test files: tests/integration/memory/
- chroma-integration.test.ts - Real ChromaDB operations
- json-fallback.test.ts - Fallback behavior testing
```

**Test Environment**:
```yaml
# docker-compose.test.yml
services:
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
  
  mcp-ocs-test:
    build: .
    environment:
      - MCP_CHROMA_HOST=chromadb
      - MCP_CHROMA_PORT=8000
    depends_on:
      - chromadb
```

**Test Cases**:
- ✅ ChromaDB connection and vector storage
- ✅ Graceful fallback when ChromaDB unavailable
- ✅ Memory persistence and retrieval across restarts
- ✅ Large conversation storage and search performance

#### 2. OpenShift Client Integration
```typescript
// Test files: tests/integration/openshift/
- real-cluster.test.ts - Against actual OpenShift cluster
- mock-cluster.test.ts - Against mock OpenShift API
```

**Test Environment**:
- **Option A**: Kind/Minikube cluster with OpenShift operators
- **Option B**: OpenShift Local (CRC) for development
- **Option C**: Mock OpenShift API server for CI/CD

**Test Cases**:
- ✅ Real `oc` command execution and parsing
- ✅ Authentication and context switching
- ✅ Pod listing, log retrieval, resource description
- ✅ Error handling for unreachable clusters
- ✅ Circuit breaker behavior under load

#### 3. End-to-End Workflow Integration
```typescript
// Test files: tests/integration/workflows/
- diagnostic-workflow.test.ts - Complete diagnostic scenarios
- panic-prevention.test.ts - Workflow enforcement testing
```

**Test Cases**:
- ✅ Complete diagnostic workflow: gathering → analyzing → resolving
- ✅ Memory-guided suggestions based on past incidents
- ✅ Panic detection and intervention
- ✅ Tool execution with workflow state enforcement

## 🌐 End-to-End Testing Strategy (5% of tests)

### Framework: Cypress + Real MCP Client
- **Focus**: Complete user workflows, MCP protocol compliance
- **Environment**: Full system with real dependencies

### E2E Test Scenarios

#### 1. MCP Protocol Compliance
```typescript
// Test files: tests/e2e/mcp/
- protocol-compliance.test.ts - MCP message format validation
- tool-discovery.test.ts - Tool listing and execution
```

**Test Cases**:
- ✅ MCP server initialization and tool discovery
- ✅ Tool execution with proper request/response formats
- ✅ Error handling and protocol error responses
- ✅ Resource URI handling and validation

#### 2. Critical User Workflows
```typescript
// Test files: tests/e2e/workflows/
- incident-response.test.ts - Complete incident resolution
- diagnostic-session.test.ts - Guided troubleshooting
```

**Test Cases**:
- ✅ New user diagnostic session (gathering evidence)
- ✅ Experienced user workflow (pattern recognition)
- ✅ Panic scenario intervention and guidance
- ✅ Memory learning from resolved incidents

## 🔒 Security Testing Strategy

### Framework: Custom security tests + OWASP ZAP
- **Focus**: Input validation, injection attacks, privilege escalation

### Security Test Categories

#### 1. Input Validation Testing
```typescript
// Test files: tests/security/
- injection-attacks.test.ts - Command injection attempts
- input-fuzzing.test.ts - Malformed input handling
```

**Test Cases**:
- ✅ Command injection via tool arguments
- ✅ Path traversal attempts
- ✅ JSON injection in configuration
- ✅ Environment variable injection
- ✅ Large payload handling (DoS prevention)

#### 2. Authentication & Authorization
```typescript
// Test files: tests/security/
- auth-bypass.test.ts - Authentication circumvention attempts
- privilege-escalation.test.ts - Unauthorized operation attempts
```

**Test Cases**:
- ✅ OpenShift authentication handling
- ✅ Workflow state bypass attempts
- ✅ Tool execution without proper context
- ✅ Memory access without authorization

## ⚡ Performance Testing Strategy

### Framework: K6 + Artillery
- **Focus**: Response times, throughput, resource usage

### Performance Test Scenarios

#### 1. Load Testing
```javascript
// Test files: tests/performance/
- tool-execution-load.js - Concurrent tool operations
- memory-search-performance.js - Search operation scaling
```

**Test Cases**:
- ✅ 100 concurrent tool executions
- ✅ Memory search with 10k+ stored incidents
- ✅ Circuit breaker behavior under load
- ✅ Cache effectiveness measurement

#### 2. Stress Testing
```javascript
// Test files: tests/performance/
- resource-exhaustion.js - Memory and CPU limits
- concurrent-sessions.js - Multiple workflow sessions
```

**Test Cases**:
- ✅ Memory usage under sustained load
- ✅ OpenShift API rate limiting behavior
- ✅ Graceful degradation under stress
- ✅ Recovery after resource exhaustion

## 🛠️ Test Infrastructure Setup

### 1. Local Development Testing
```bash
# package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "cypress run",
    "test:security": "jest tests/security",
    "test:performance": "k6 run tests/performance/load-test.js",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

### 2. CI/CD Pipeline Testing
```yaml
# .github/workflows/test.yml
name: Comprehensive Testing
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
  
  integration-tests:
    runs-on: ubuntu-latest
    services:
      chromadb:
        image: chromadb/chroma:latest
        ports:
          - 8000:8000
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
  
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:security
```

### 3. Test Data Management
```typescript
// tests/fixtures/
- sample-conversations.json - Test conversation data
- sample-operational-memories.json - Incident data
- mock-openshift-responses.json - oc command outputs
- test-configurations.json - Various config scenarios
```

## 📊 Test Metrics & Coverage Goals

### Coverage Targets
- **Unit Tests**: >90% code coverage
- **Integration Tests**: >80% API coverage
- **E2E Tests**: 100% critical user workflow coverage
- **Security Tests**: 100% input validation coverage

### Performance Targets
- **Tool Execution**: <100ms response time (95th percentile)
- **Memory Search**: <200ms for 10k+ stored incidents
- **Health Checks**: <50ms response time
- **Startup Time**: <5 seconds with all components

### Quality Gates
- ✅ All tests pass
- ✅ Coverage thresholds met
- ✅ No high/critical security vulnerabilities
- ✅ Performance targets achieved
- ✅ Memory leaks detection passed

## 🎯 Test Implementation Priority

### Phase 1: Foundation (Week 1)
1. **Unit Test Framework Setup** - Jest configuration and basic structure
2. **Core Component Unit Tests** - Configuration, logging, OpenShift client
3. **Mock Infrastructure** - oc command mocking, file system mocking

### Phase 2: Integration (Week 2)
4. **Memory System Integration** - ChromaDB + JSON fallback testing
5. **OpenShift Integration** - Real cluster or mock API testing
6. **Test Environment Setup** - Docker Compose, TestContainers

### Phase 3: Complete Coverage (Week 3)
7. **E2E Test Suite** - MCP protocol compliance and user workflows
8. **Security Testing** - Injection attacks and validation testing
9. **Performance Testing** - Load, stress, and endurance testing

### Phase 4: CI/CD Integration (Week 4)
10. **Pipeline Setup** - GitHub Actions with comprehensive testing
11. **Quality Gates** - Coverage enforcement and performance monitoring
12. **Documentation** - Test documentation and contribution guidelines

This comprehensive testing strategy ensures the MCP-ocs system is production-ready with high confidence in reliability, security, and performance.
