# ADR-025: Instrumentation Middleware Architecture

**Status:** Accepted  
**Date:** September 11, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs requires comprehensive instrumentation of tool execution to enable operational intelligence, performance monitoring, and incident correlation. The system must capture:

- **Tool Execution Metrics** - Performance, success/failure rates, and resource usage
- **Evidence Collection** - Links to logs, artifacts, and operational context
- **Safety Compliance** - Zero-stdout discipline and input redaction
- **Performance Bounds** - Timeout enforcement and graceful degradation

### Current Challenges
- Tool executions are not systematically tracked
- No standardized performance metrics collection
- Limited correlation between tool usage and operational outcomes
- Safety constraints need enforcement at execution layer

### Available Options
1. **Aspect-Oriented Programming** - Decorators around tool methods
2. **Proxy Pattern** - Intercepting proxy around tool registry
3. **Middleware Pattern** - Pre/post hooks in execution pipeline
4. **Event System** - Tool execution events with listeners

## Decision

**Middleware Pattern with Pre/Post Hook Architecture**

### Core Architecture:
```typescript
// Tool Gateway → [PRE] middleware → Tool execute → [POST] middleware → Dual write
class InstrumentationMiddleware {
  async pre(toolFullName: string, args: any, context: ExecutionContext): Promise<PreContext> {
    return {
      toolId: this.normalizeToolId(toolFullName),
      opType: this.detectOpType(toolFullName, args),
      mode: this.determineMode(),
      sessionId: context.sessionId || 'default',
      startTime: Date.now(),
      flags: this.captureRelevantFlags(),
      inputHash: this.hashSafeInputs(args)
    };
  }

  async post(pre: PreContext, resultJson: string): Promise<void> {
    const metrics = this.buildMetrics(pre, resultJson, 'ok');
    const anchors = await this.collectEvidenceAnchors(pre);
    
    await Promise.allSettled([
      this.writeJsonMetrics(metrics, anchors),
      this.writeVectorMetadata(metrics, anchors, resultJson)
    ]);
  }

  async postError(pre: PreContext, error: unknown): Promise<void> {
    const metrics = this.buildMetrics(pre, null, 'error', error);
    const anchors = await this.collectEvidenceAnchors(pre);
    
    await Promise.allSettled([
      this.writeJsonMetrics(metrics, anchors),
      // Vector write optional on errors
      this.writeVectorMetadataIfEnabled(metrics, anchors, error)
    ]);
  }
}
```

### Integration Point:
```typescript
// Hook into UnifiedToolRegistry.executeTool()
export class UnifiedToolRegistry {
  async executeTool(toolName: string, args: any, context: ExecutionContext): Promise<any> {
    const middleware = new InstrumentationMiddleware();
    const preContext = await middleware.pre(toolName, args, context);
    
    try {
      // Execute with existing timeout and safety constraints
      const result = await this.timeoutWrapper(
        () => this.getToolExecutor(toolName).execute(args),
        TOOL_TIMEOUT_MS
      );
      
      await middleware.post(preContext, JSON.stringify(result));
      return result;
    } catch (error) {
      await middleware.postError(preContext, error);
      throw error; // Preserve original error handling
    }
  }
}
```

## Implementation

### Module Structure:
```
src/lib/tools/
├── instrumentation-middleware.ts    # Core middleware logic
├── metrics-writer.ts                # JSON analytics appender
├── vector-writer.ts                 # Vector metadata writer
├── evidence-anchors.ts              # Evidence collection helper
└── execution-context.ts             # Context type definitions
```

### Metrics Writer (JSON Analytics):
```typescript
interface AnalyticsMetrics {
  toolId: string;                     // Normalized tool identifier
  opType: 'read' | 'diagnostic' | 'memory' | 'workflow' | 'other';
  mode: 'json' | 'vector';           // Storage path taken
  elapsedMs: number;                 // Execution duration
  outcome: 'ok' | 'error';           // Success/failure
  errorSummary: string | null;       // Redacted error message
  cleanupCheck: boolean;             // Post-execution validation
  anchors: string[];                 // Evidence references
  timestamp: string;                 // ISO8601
  sessionId: string;                 // Session identifier
  flags: Record<string, any>;        // Feature flag snapshot
  vector: {                          // Vector storage identifiers
    tenant?: string;
    database?: string;
    collection?: string;
  };
}

class MetricsWriter {
  async appendMetrics(metrics: AnalyticsMetrics, anchors: string[]): Promise<void> {
    const record = { ...metrics, anchors };
    const content = JSON.stringify(record) + '\n';
    
    // Atomic append to analytical-artifacts/08-technical-metrics-data.json
    await this.atomicAppend(this.metricsFilePath, content);
  }
  
  private async atomicAppend(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.appendFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
  }
}
```

### Vector Writer (Memory Integration):
```typescript
class VectorWriter {
  constructor(private memoryAdapter: UnifiedMemoryAdapter) {}

  async writeVectorMetadata(
    metrics: AnalyticsMetrics, 
    anchors: string[], 
    resultContent: string
  ): Promise<void> {
    if (!this.isVectorEnabled()) {
      return; // Respect MCP_OCS_FORCE_JSON
    }

    const document = this.synthesizeDocument(metrics, anchors, resultContent);
    const metadata = this.buildVectorMetadata(metrics);
    
    try {
      await this.memoryAdapter.store({
        id: `tool_exec_${metrics.sessionId}_${metrics.timestamp}`,
        content: document,
        metadata: metadata
      });
    } catch (error) {
      console.error('Vector write failed, falling back to JSON-only:', error);
      // Metrics already written, continue gracefully
    }
  }

  private buildVectorMetadata(metrics: AnalyticsMetrics): Record<string, any> {
    return {
      kind: 'tool_exec',
      domain: this.detectDomain(metrics.toolId),
      environment: process.env.NODE_ENV || 'dev',
      tool: metrics.toolId,
      opType: metrics.opType,
      outcome: metrics.outcome,
      elapsedMs: metrics.elapsedMs,
      sessionId: metrics.sessionId,
      timestamp: metrics.timestamp
    };
  }
}
```

### Evidence Anchors Collection:
```typescript
class EvidenceAnchors {
  async collectAnchors(preContext: PreContext): Promise<string[]> {
    const anchors: string[] = [];
    
    // Log references (if available)
    const logRef = await this.findLogReference(preContext.startTime);
    if (logRef) anchors.push(`log:${logRef}`);
    
    // Artifact references (04-09 series)
    const artifactRefs = await this.findArtifactReferences();
    anchors.push(...artifactRefs.map(ref => `artifact:${ref}`));
    
    // ADR references (if mentioned in context)
    const adrRefs = this.detectADRReferences(preContext.toolId);
    anchors.push(...adrRefs.map(ref => `adr:${ref}`));
    
    // Commit references (if available)
    const commitRef = await this.getCurrentCommitHash();
    if (commitRef) anchors.push(`commit:${commitRef}`);
    
    return anchors.slice(0, 10); // Bounded collection
  }
  
  private async findLogReference(startTime: number): Promise<string | null> {
    const logPath = 'logs/sprint-execution.log';
    if (!await fs.pathExists(logPath)) return null;
    
    // Find approximate log line based on timestamp
    const timeWindow = 30000; // 30 second window
    return `${logPath}:${startTime}-${startTime + timeWindow}`;
  }
}
```

### Feature Flags and Configuration:
```typescript
// Extended feature flag support
interface InstrumentationConfig {
  ENABLE_INSTRUMENTATION: boolean;      // Master switch (default: true)
  ENABLE_VECTOR_WRITES: boolean;        // Vector path (default: true)
  ENABLE_PRESEARCH: boolean;            // Pre-search enrichment (default: false)
  INSTRUMENT_ALLOWLIST: string[];       // Tool allowlist (CSV env var)
  MCP_OCS_FORCE_JSON: boolean;          // Vector kill-switch
  INSTRUMENTATION_TIMEOUT_MS: number;   // Middleware timeout (default: 100ms)
}

class InstrumentationConfig {
  static load(): InstrumentationConfig {
    return {
      ENABLE_INSTRUMENTATION: env.get('ENABLE_INSTRUMENTATION', true),
      ENABLE_VECTOR_WRITES: env.get('ENABLE_VECTOR_WRITES', true),
      ENABLE_PRESEARCH: env.get('ENABLE_PRESEARCH', false),
      INSTRUMENT_ALLOWLIST: env.get('INSTRUMENT_ALLOWLIST', '').split(',').filter(Boolean),
      MCP_OCS_FORCE_JSON: env.get('MCP_OCS_FORCE_JSON', false),
      INSTRUMENTATION_TIMEOUT_MS: env.get('INSTRUMENTATION_TIMEOUT_MS', 100)
    };
  }
}
```

## Rationale

### Why Middleware Pattern:

✅ **Clean Separation** - Business logic unaware of instrumentation  
✅ **Centralized Control** - Single point for all execution monitoring  
✅ **Performance Isolation** - Instrumentation failures don't break tools  
✅ **Feature Flags** - Easy enable/disable and gradual rollout  
✅ **Existing Integration** - Minimal changes to UnifiedToolRegistry  
✅ **Safety Preservation** - Existing timeout and zero-stdout maintained  

### Why Not Alternatives:

❌ **AOP Decorators** - Requires modifying every tool class  
❌ **Proxy Pattern** - Complex implementation, potential performance overhead  
❌ **Event System** - Loose coupling makes debugging harder  

## Safety Constraints

### Input Redaction:
```typescript
class SafetyProcessor {
  hashSafeInputs(args: any): string {
    // Create hash of inputs without storing raw values
    const safeArgs = this.redactSensitiveFields(args);
    return createHash('sha256').update(JSON.stringify(safeArgs)).digest('hex');
  }
  
  redactErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]')
      .substring(0, 200); // Bounded length
  }
}
```

### Zero-Stdout Discipline:
```typescript
class StdioGuard {
  enforceZeroStdout(): void {
    // All middleware logging to stderr or files only
    const originalLog = console.log;
    console.log = (...args) => {
      console.error('[MIDDLEWARE]', ...args); // Redirect to stderr
    };
  }
}
```

### Performance Bounds:
- **Middleware Overhead** - Target <5ms per tool execution
- **Timeout Enforcement** - Hard timeout for middleware operations (100ms)
- **Memory Limits** - Bounded anchor collection and content synthesis
- **Graceful Degradation** - Continue tool execution even if instrumentation fails

## Performance Considerations

### Instrumentation Overhead:
```typescript
class PerformanceMonitor {
  private static readonly MAX_MIDDLEWARE_MS = 100;
  
  async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      this.createTimeoutPromise(PerformanceMonitor.MAX_MIDDLEWARE_MS)
    ]);
  }
  
  measureMiddlewareImpact(startTime: number): number {
    const elapsed = Date.now() - startTime;
    if (elapsed > 50) {
      console.error(`Middleware overhead: ${elapsed}ms`);
    }
    return elapsed;
  }
}
```

### Async Processing:
- **Non-blocking writes** - Metrics and vector writes don't block tool response
- **Error isolation** - Instrumentation failures logged but don't propagate
- **Batch operations** - Group multiple metrics writes when possible

## Data Schema

### JSON Metrics Schema (v2):
```json
{
  "toolId": "oc_read_get_pods",
  "opType": "read",
  "mode": "vector",
  "elapsedMs": 1250,
  "outcome": "ok",
  "errorSummary": null,
  "cleanupCheck": true,
  "anchors": [
    "log:logs/sprint-execution.log:1694455200000-1694455230000",
    "artifact:04-quality-assessment-report.md",
    "adr:ADR-003"
  ],
  "timestamp": "2025-09-11T19:30:00.000Z",
  "sessionId": "f-011-vector-collections-v2",
  "flags": {
    "ENABLE_INSTRUMENTATION": true,
    "ENABLE_VECTOR_WRITES": true,
    "ENABLE_PRESEARCH": false
  },
  "vector": {
    "tenant": "mcp-ocs",
    "database": "prod",
    "collection": "tool_exec"
  }
}
```

### Vector Metadata Schema:
```typescript
interface VectorMetadata {
  kind: 'tool_exec';
  domain: string;          // 'openshift', 'kubernetes', 'system'
  environment: string;     // 'dev', 'test', 'staging', 'prod'
  tool: string;           // Tool identifier
  opType: string;         // Operation type
  outcome: string;        // Success/failure
  elapsedMs: number;      // Performance metric
  sessionId: string;      // Session correlation
  timestamp: string;      // Execution time
}
```

## Rollout Strategy

### Phase 1: Core Instrumentation (Implemented)
- ✅ Middleware framework with pre/post hooks
- ✅ JSON metrics collection
- ✅ Vector metadata storage
- ✅ Evidence anchors collection
- ✅ Safety constraints and performance bounds

### Phase 2: Enhanced Analytics
- Collection strategy optimization
- Advanced evidence correlation
- Performance analytics dashboard
- Alert thresholds and monitoring

### Phase 3: Operational Intelligence
- Pattern detection across tool executions
- Predictive failure analysis
- Automated optimization recommendations
- Cross-session correlation analysis

## Consequences

### Benefits:
- **Operational Visibility** - Complete tool execution transparency
- **Performance Monitoring** - Systematic performance tracking
- **Incident Correlation** - Evidence trails for root cause analysis
- **Safety Compliance** - Enforced input redaction and zero-stdout
- **Gradual Rollout** - Feature-flagged deployment with allowlists

### Costs:
- **Storage Overhead** - Dual-write storage requirements
- **Performance Impact** - 5-100ms overhead per tool execution
- **Complexity** - Additional middleware layer to maintain
- **Resource Usage** - ChromaDB and JSON storage growth

### Risks:
- **Instrumentation Failures** - Potential tool execution disruption
- **Data Explosion** - Unbounded metrics growth
- **Privacy Concerns** - Operational data may contain sensitive information
- **Performance Degradation** - Middleware overhead affecting tool responsiveness

## Review and Evolution

### Performance Monitoring:
- **Middleware Latency** - <5ms median, <100ms 99th percentile
- **Storage Growth** - Monitor JSON and vector storage usage
- **Tool Coverage** - Track allowlist expansion and effectiveness
- **Error Rates** - Monitor instrumentation failure frequency

### Success Metrics:
- **MTTR Improvement** - Faster incident resolution with evidence trails
- **Pattern Recognition** - Successful correlation of tool patterns with incidents
- **Performance Optimization** - Data-driven tool optimization decisions
- **Operational Intelligence** - Enhanced understanding of system behavior

### Future Enhancements:
- **Predictive Analytics** - Machine learning on tool execution patterns
- **Auto-optimization** - Self-tuning performance parameters
- **Cross-domain Correlation** - Multi-system pattern recognition
- **Real-time Dashboards** - Live operational intelligence visualization
