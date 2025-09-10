# D-014: Regression Testing & Test Infrastructure

**Status**: Complete  
**Priority**: P1 - HIGH  
**Review Date**: 2025-08-30  
**Tasks Created**: 9  

---

## Executive Summary

Analysis of the `/tests` directory reveals critical gaps in regression testing infrastructure, particularly around LLM deterministic behavior validation, golden file identity testing, and manual test automation. The existing test suite provides good structural validation but lacks the deterministic guarantees needed for clean regression testing during architectural changes.

### Key Findings
- **Missing LLM deterministic validation** - No tests verify temperature=0.0, fixed seeds, or model version consistency
- **Golden file gaps** - Current tests validate structure but not identity (same inputs → identical outputs)
- **Manual test automation needed** - `/tests/manual/` scripts require human interaction, should be headless
- **Cross-execution inconsistency** - No validation that template execution produces identical results across runs
- **Test environment non-determinism** - Missing isolation from adaptive context and external state

### Risk Assessment
**HIGH**: Inability to validate clean regression during architectural changes (bounded APIs, deterministic templates, log sanitization) without proper deterministic test infrastructure.

---

## Current Test Infrastructure Analysis

### Existing Test Structure
```
/Users/kevinbrown/MCP-ocs/tests/
├── unit/                    ✅ Comprehensive component testing
│   ├── tools/              ✅ Tool execution validation
│   ├── diagnostics/        ✅ RCA and diagnostic logic
│   ├── memory/             ✅ Memory system testing
│   └── rubrics/            ✅ Rubric evaluation testing
├── integration/            ✅ System-level behavior testing
├── manual/                 ❌ Requires human interaction
│   ├── test-aws-integration.mjs
│   ├── test-diagnostic-suite.js
│   ├── test-enhanced-memory.mjs
│   └── test-http-server.mjs
└── e2e/                    ❌ Empty directory (no E2E tests)
```

### Current Testing Strengths
- **Unit test coverage** for core components (tools, diagnostics, memory, rubrics)
- **Integration tests** for sequential thinking and diagnostics
- **Golden file patterns** in `rca_golden_output.spec.ts`
- **Mock-based testing** with proper isolation

### Critical Gaps Identified
- **No identity validation** - Tests verify structure but not that identical inputs produce identical outputs
- **LLM non-determinism** - No validation of temperature=0.0, fixed seeds, consistent model versions
- **Manual test dependency** - Human-dependent tests in `/tests/manual/` directory
- **Missing E2E coverage** - Empty E2E directory indicates no end-to-end validation

---

## Epic Breakdown

### EPIC-017: LLM Deterministic Testing Framework
**Priority**: P1 - HIGH | **Estimated**: 16 hours | **Dependencies**: None

#### Tasks:
- **TASK-017-A**: Implement LLM configuration validation tests (temperature=0.0, fixed seeds) (4h)
- **TASK-017-B**: Create identity tests for LLM API calls (same prompt → identical response) (4h)
- **TASK-017-C**: Add context isolation tests to prevent adaptive behavior contamination (4h)
- **TASK-017-D**: Implement model version consistency validation across test runs (2h)
- **TASK-017-E**: Add gollm integration deterministic behavior tests (2h)

### EPIC-018: Golden File Enhancement & Identity Validation
**Priority**: P1 - HIGH | **Estimated**: 12 hours | **Dependencies**: EPIC-017

#### Tasks:
- **TASK-018-A**: Enhance golden file tests to validate identical inputs produce identical outputs (5h)
- **TASK-018-B**: Create template execution identity tests (same template + inputs → identical results) (4h)
- **TASK-018-C**: Add cross-execution consistency validation for diagnostic tools (3h)

### EPIC-019: Manual Test Automation (Mac M4 Headless)
**Priority**: P2 - MEDIUM | **Estimated**: 14 hours | **Dependencies**: None

#### Tasks:
- **TASK-019-A**: Convert manual HTTP server tests to headless automation (4h)
- **TASK-019-B**: Automate diagnostic suite tests with programmatic validation (5h)
- **TASK-019-C**: Create headless AWS integration tests with Docker containerization (5h)

---

## Implementation Patterns

### LLM Deterministic Testing Pattern
```typescript
describe('LLM Deterministic Behavior', () => {
  it('should enforce temperature=0.0 and fixed seeds for test consistency', async () => {
    const llmConfig = getLLMTestConfiguration();
    
    expect(llmConfig.temperature).toBe(0.0);
    expect(llmConfig.seed).toBeDefined();
    expect(typeof llmConfig.seed).toBe('number');
  });

  it('should produce identical outputs for identical LLM prompts', async () => {
    const prompt = "Analyze cluster health for namespace 'default'";
    const context = { namespace: 'default', timestamp: '2025-08-30T10:00:00Z' };
    
    // Multiple calls with identical inputs
    const result1 = await callLLM(prompt, context, { temperature: 0.0, seed: 12345 });
    const result2 = await callLLM(prompt, context, { temperature: 0.0, seed: 12345 });
    const result3 = await callLLM(prompt, context, { temperature: 0.0, seed: 12345 });
    
    // Must produce identical outputs
    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
    expect(JSON.stringify(result2)).toBe(JSON.stringify(result3));
  });

  it('should maintain context isolation between LLM calls', async () => {
    // Clear any adaptive context
    await clearLLMContext();
    
    const query = "Diagnose pod health issues";
    const result1 = await callLLM(query, {}, { temperature: 0.0, seed: 42 });
    
    // Make interfering call
    await callLLM("Different query with different context", {}, { temperature: 0.0 });
    
    // Original query should produce identical result
    const isolatedResult = await callLLM(query, {}, { temperature: 0.0, seed: 42 });
    
    expect(JSON.stringify(result1)).toBe(JSON.stringify(isolatedResult));
  });
});
```

### Golden File Identity Enhancement Pattern
```typescript
describe('Template Execution Identity Validation', () => {
  it('should produce identical outputs for identical template executions', async () => {
    const template = loadTemplate('cluster-health-diagnostic');
    const inputs = { 
      namespace: 'default',
      timestamp: '2025-08-30T10:00:00Z',
      sessionId: 'test-session-123'
    };
    
    // Execute template multiple times with identical inputs
    const executor1 = new DirectTemplateExecutor();
    const executor2 = new DirectTemplateExecutor();
    
    const result1 = await executor1.execute(template, inputs);
    const result2 = await executor2.execute(template, inputs);
    
    // Results must be byte-for-byte identical
    expect(JSON.stringify(result1, null, 2)).toBe(JSON.stringify(result2, null, 2));
  });

  it('should validate sequential thinking determinism', async () => {
    const thinkingParams = {
      prompt: "Analyze cluster resources",
      context: { cluster: 'test-cluster' },
      sessionId: 'determinism-test'
    };
    
    const thinking1 = new SequentialThinkingEngine();
    const thinking2 = new SequentialThinkingEngine();
    
    const result1 = await thinking1.process(thinkingParams);
    const result2 = await thinking2.process(thinkingParams);
    
    // Sequential thinking should be deterministic
    expect(result1.steps).toEqual(result2.steps);
    expect(result1.conclusion).toEqual(result2.conclusion);
  });
});
```

### Headless Manual Test Automation Pattern
```typescript
// Headless version of test-http-server.mjs
describe('HTTP Server Integration - Headless', () => {
  let server: HttpServer;
  
  beforeAll(async () => {
    // Start server programmatically without GUI
    server = new HttpServer();
    await server.start(3000);
    
    // Wait for server ready state
    await waitForServerReady('http://localhost:3000/health');
  });
  
  it('should handle concurrent diagnostic requests', async () => {
    // Replace manual browser testing with programmatic requests
    const requests = Array.from({ length: 10 }, (_, i) => 
      axios.post('http://localhost:3000/api/diagnostic', {
        tool: 'cluster_health',
        sessionId: `concurrent-test-${i}`
      })
    );
    
    const responses = await Promise.all(requests);
    
    // Validate all responses successful
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('result');
    });
  });
  
  afterAll(async () => {
    await server.stop();
  });
});
```

---

## Testing Strategy for Regression Prevention

### Phase 1: Deterministic Foundation (Days 1-2)
- Implement LLM deterministic configuration validation
- Create identity tests for all critical execution paths
- Establish baseline golden files with identity validation

### Phase 2: Manual Test Automation (Days 3-4)
- Convert `/tests/manual/` scripts to headless automation
- Create Docker-based test environments for consistency
- Implement programmatic validation replacing human verification

### Phase 3: Cross-Execution Validation (Day 5)
- Add template executor consistency tests
- Validate sequential thinking determinism
- Create comprehensive regression test suite

### Validation Metrics
- **LLM Consistency**: 100% identical outputs for identical inputs across 10 runs
- **Template Determinism**: Zero variance in template execution results
- **Manual Test Coverage**: 100% of `/tests/manual/` scripts automated
- **Identity Validation**: All golden file tests include identity checks

---

## Files Requiring Changes

### Primary Files
- `/tests/unit/diagnostics/rca_golden_output.spec.ts` - Enhanced identity validation
- `/tests/manual/` - All manual scripts need headless conversion
- `/tests/integration/sequential-thinking-integration.spec.ts` - Add determinism tests
- Create new `/tests/regression/` directory for comprehensive regression tests

### Supporting Files
- LLM configuration and client files for deterministic parameter enforcement
- Template executor files for identity validation
- Test utilities for golden file identity comparison
- Docker configuration for consistent test environments

---

## Success Criteria

### Phase 1 Completion
- [ ] All LLM calls in tests use temperature=0.0 and fixed seeds
- [ ] Identity tests pass for all critical execution paths
- [ ] Golden files enhanced with identity validation
- [ ] Model version consistency enforced across test runs

### Validation Requirements
- **Deterministic Guarantee**: Same inputs produce byte-identical outputs
- **Regression Safety**: Architectural changes don't break existing behavior
- **Test Automation**: Zero manual intervention required for test execution
- **Mac M4 Optimization**: Tests run efficiently on local development environment

---

**Domain Owner**: Test Infrastructure Team  
**Implementation Lead**: Codex (guided by deterministic patterns)  
**Review Required**: Full regression validation before architectural changes
