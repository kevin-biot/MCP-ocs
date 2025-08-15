# MCP-OCS Regression Testing Strategy

> **Comprehensive multi-layer testing approach ensuring reliability, performance, and contract compliance across development cycles.**

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Layer Architecture](#test-layer-architecture)
- [Contract Validation](#contract-validation)
- [Fixture Management](#fixture-management)
- [Memory Regression Testing](#memory-regression-testing)
- [Performance Guardrails](#performance-guardrails)
- [CI Pipeline Integration](#ci-pipeline-integration)
- [Flakiness Mitigation](#flakiness-mitigation)
- [Implementation Guidelines](#implementation-guidelines)

## Testing Philosophy

### Core Principles
- **Determinism First**: Predictable, reproducible results in controlled environments
- **Layered Validation**: Progressive complexity from unit → integration → real-world
- **Contract Enforcement**: Strict schema validation and API guarantees
- **Performance Awareness**: Built-in performance regression detection
- **Production Fidelity**: Real cluster validation without blocking development velocity

### Test Pyramid Structure
```
     /\     Real Integration (Manual/Nightly)
    /  \    ← Non-blocking, drift analysis
   /____\   
  /      \  Adapter Integration (Testcontainers)
 /        \ ← ChromaDB validation, opt-in
/__________\
Unit + Fixture Integration (Default CI)
← Fast, deterministic, comprehensive coverage
```

## Test Layer Architecture

### Layer 1: Unit Testing
**Scope**: Pure business logic without external dependencies

```typescript
// Example: RCA scoring logic
describe('RCAChecklistEngine - Scoring Logic', () => {
  it('should prioritize resource pressure over probe failures', () => {
    const findings = createTestFindings({
      resourcePressure: true,
      probeFailures: true
    });
    
    const rootCause = engine.deriveRootCause(findings, 'degraded');
    expect(rootCause.type).toBe('resource_pressure');
    expect(rootCause.confidence).toBeGreaterThan(0.8);
  });
});
```

**Components Covered**:
- Scoring algorithms in v2 checkers
- Summary generators and aggregation logic
- Error sanitizers and message formatting
- JSON serialization helpers
- Resource parsing (CPU millicores, memory units)

### Layer 2: Integration Testing with Fixtures
**Scope**: Tool execution against recorded cluster outputs

```typescript
// Example: Fixture-based cluster health test
describe('Cluster Health - Fixture Integration', () => {
  beforeEach(() => {
    mockOcWrapper.setFixture('get nodes -o json', 'fixtures/nodes-healthy.json');
    mockOcWrapper.setFixture('get clusteroperators', 'fixtures/operators-degraded.json');
  });

  it('should detect operator degradation in healthy cluster', async () => {
    const result = await clusterHealthTool.execute({
      sessionId: 'test-001',
      scope: 'all',
      depth: 'summary'
    });
    
    const parsed = JSON.parse(result);
    expect(parsed.overallHealth).toBe('degraded');
    expect(parsed.operators.failing).toContain('monitoring');
  });
});
```

### Layer 3: Adapter Integration Testing
**Scope**: Memory system integration with ChromaDB via Testcontainers

```typescript
describe('Memory Adapter Integration', () => {
  let chromaContainer: StartedTestContainer;
  let memoryAdapter: MCPOcsMemoryAdapter;

  beforeAll(async () => {
    chromaContainer = await new GenericContainer("chromadb/chroma:latest")
      .withExposedPorts(8000)
      .start();
    
    memoryAdapter = new MCPOcsMemoryAdapter({
      chromaHost: chromaContainer.getHost(),
      chromaPort: chromaContainer.getMappedPort(8000)
    });
  });

  it('should store and retrieve operational incidents with vector similarity', async () => {
    await seedTestIncidents(memoryAdapter);
    
    const results = await memoryAdapter.searchOperational(
      'storage provisioner unreachable'
    );
    
    expect(results).toHaveLength(3);
    expect(results[0].similarity).toBeGreaterThan(0.85);
    expect(results[0].incident.rootCause).toBe('storage_provisioner_unreachable');
  });
});
```

### Layer 4: Real Integration Testing
**Scope**: Live cluster validation (gated/manual execution)

```typescript
describe('Real Cluster Integration', () => {
  beforeEach(() => {
    if (!process.env.REAL_CLUSTER_ENABLED) {
      pending('Real cluster tests disabled');
    }
  });

  it('should analyze real namespace health', async () => {
    const result = await namespaceHealthTool.execute({
      sessionId: `real-test-${Date.now()}`,
      namespace: 'openshift-monitoring',
      includeIngressTest: false
    });
    
    await archiveTestResult('namespace-health', result);
    
    const parsed = JSON.parse(result);
    expect(parsed.namespace).toBe('openshift-monitoring');
    expect(['healthy', 'degraded', 'failing']).toContain(parsed.status);
  });
});
```

## Contract Validation

### Output Schema Enforcement

```typescript
import Ajv from 'ajv';

const clusterHealthSchema = {
  type: 'object',
  required: ['overallHealth', 'nodes', 'operators', 'timestamp'],
  properties: {
    overallHealth: { enum: ['healthy', 'degraded', 'failing'] },
    nodes: {
      type: 'object',
      required: ['total', 'ready', 'status'],
      properties: {
        total: { type: 'number', minimum: 0 },
        ready: { type: 'number', minimum: 0 },
        status: { type: 'string' }
      }
    },
    timestamp: { type: 'string', format: 'date-time' }
  }
};

describe('Cluster Health Contract', () => {
  const ajv = new Ajv({ formats: require('ajv-formats') });
  const validate = ajv.compile(clusterHealthSchema);

  it('should conform to output schema', async () => {
    const result = await clusterHealthTool.execute(testArgs);
    const parsed = JSON.parse(result);
    
    expect(validate(parsed)).toBe(true);
    expect(validate.errors).toBeNull();
  });
});
```

### Tool Registry Contract

```typescript
describe('Tool Registry Contract', () => {
  it('should maintain stable beta tool count and names', async () => {
    const tools = await getBetaTools();
    
    expect(tools).toHaveLength(13);
    expect(tools.map(t => t.name)).toEqual([
      'cluster_health', 'namespace_health', 'pod_health', 'rca_checklist',
      'get_pods', 'describe', 'logs', 'search_incidents',
      'store_operational', 'search_operational', 'workflow_state',
      'memory_stats', 'search_conversations'
    ]);
  });

  it('should validate tool maturity levels', async () => {
    const tools = await getBetaTools();
    const maturityLevels = tools.map(t => t.metadata?.maturity);
    
    expect(maturityLevels).not.toContain('alpha');
    expect(maturityLevels.filter(m => m === 'beta')).toHaveLength(13);
  });
});
```

## Performance Guardrails

### Time Budget Enforcement

```typescript
describe('Performance Guardrails', () => {
  it('should complete cluster health analysis within time budget', async () => {
    const startTime = Date.now();
    
    const result = await clusterHealthTool.execute({
      sessionId: 'perf-test',
      scope: 'all',
      maxNamespacesToAnalyze: 5,
      depth: 'summary'
    });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 second budget
    
    const parsed = JSON.parse(result);
    expect(parsed.overallHealth).toBeDefined();
    expect(parsed.totalNamespaces).toBeGreaterThan(0);
  });
});
```

## Implementation Guidelines

### Test Organization

```
tests/
├── unit/                          # Layer 1: Pure logic
│   ├── diagnostics/
│   ├── memory/
│   └── utils/
├── integration/
│   ├── fixtures/                  # Layer 2: Fixture-based
│   ├── adapter/                   # Layer 3: Testcontainers
│   └── real/                     # Layer 4: Live cluster
├── contracts/                     # Schema validation
├── performance/                   # Performance guardrails
└── fixtures/                     # Test data
    ├── healthy/
    ├── degraded/
    ├── failing/
    └── errors/
```

### Test Naming Conventions

```typescript
// Pattern: should [expected behavior] when [conditions] given [context]

describe('RCAChecklistEngine', () => {
  describe('Root Cause Detection', () => {
    it('should detect storage_provisioner_unreachable when PVCs pending and provisioner events present', () => {
      // Test implementation
    });
    
    it('should prioritize resource_pressure over probe_failures when both conditions exist', () => {
      // Test implementation  
    });
  });
});
```

## Conclusion

This regression testing strategy provides:

- **Confidence**: Multi-layer validation catches regressions at appropriate levels
- **Speed**: Fast feedback loop with fixture-based testing
- **Quality**: Contract enforcement and performance guardrails
- **Reliability**: Deterministic testing with flakiness mitigation
- **Scalability**: Clear patterns for adding new test categories
- **Production Fidelity**: Real cluster validation without blocking development

The strategy balances thorough validation with development velocity, ensuring that MCP-OCS maintains high quality while enabling rapid iteration and feature development.

---

**Implementation Priority:**
1. **Phase 1**: Unit tests + fixture integration (Weeks 1-2)
2. **Phase 2**: Contract validation + performance guardrails (Weeks 3-4)
3. **Phase 3**: Memory regression + adapter testing (Weeks 5-6)
4. **Phase 4**: CI pipeline + real integration (Weeks 7-8)
