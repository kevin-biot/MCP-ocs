# ADR-028: Pre-search Enrichment Bounds

**Status:** Accepted  
**Date:** September 11, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

The MCP-ocs instrumentation middleware includes a pre-search enrichment capability that injects relevant operational context before tool execution. This feature must balance:

- **Operational Value** - Providing relevant context to enhance tool decision-making
- **Performance Bounds** - Preventing enrichment from degrading tool responsiveness
- **Safety Constraints** - Ensuring enrichment failures don't disrupt tool execution
- **Resource Limits** - Controlling memory and computation overhead
- **Security Boundaries** - Preventing information leakage across domains

### Current Challenges
- Tool execution lacks historical operational context
- No systematic way to inject relevant incident patterns
- Risk of unbounded memory system queries degrading performance
- Potential for enrichment failures to cascade to tool failures

### Enrichment Requirements
1. **Bounded Performance** - Hard limits on enrichment time and resource usage
2. **Graceful Degradation** - Tool execution continues if enrichment fails
3. **Allowlist Control** - Only approved tools receive enrichment
4. **Content Limits** - Bounded enrichment content size
5. **Safety Isolation** - Enrichment operates independently of tool logic

## Decision

**Bounded Pre-search Enrichment with Allowlist Gating and Hard Timeouts**

### Core Architecture:
```typescript
interface PreSearchEnrichment {
  enabled: boolean;                     // Feature flag control
  allowlist: string[];                  // Approved tool identifiers
  bounds: {
    timeoutMs: number;                  // Hard timeout (400ms)
    topK: number;                       // Maximum results (3)
    maxContentLength: number;           // Content size limit (1.5KB)
  };
  fallback: {
    onTimeout: 'empty';                 // Fallback behavior
    onError: 'empty';                   // Error handling
    onUnavailable: 'empty';             // Service unavailable handling
  };
}
```

### Implementation Strategy:
1. **Feature Flag Gating** - `ENABLE_PRESEARCH=false` by default
2. **Allowlist Control** - `INSTRUMENT_ALLOWLIST` environment variable
3. **Hard Timeouts** - 400ms maximum with race condition handling
4. **Size Bounds** - 1.5KB maximum enrichment content
5. **Error Isolation** - Enrichment failures never propagate to tools

## Implementation

### Pre-search Enrichment Engine:
```typescript
class PreSearchEnrichment {
  private config: EnrichmentConfig;
  private memoryAdapter: UnifiedMemoryAdapter;
  
  constructor(config: EnrichmentConfig) {
    this.config = config;
    this.memoryAdapter = new UnifiedMemoryAdapter();
  }
  
  async enrich(toolId: string, args: any, context: ExecutionContext): Promise<EnrichmentResult> {
    // Check if enrichment is enabled and allowed for this tool
    if (!this.isEligible(toolId)) {
      return { content: '', metadata: { hits: 0, ms: 0, reason: 'not-eligible' } };
    }
    
    const startTime = Date.now();
    
    try {
      // Execute bounded pre-search with race condition
      const searchResult = await Promise.race([
        this.performSearch(toolId, args, context),
        this.createTimeoutPromise(this.config.bounds.timeoutMs)
      ]);
      
      const elapsedMs = Date.now() - startTime;
      
      return {
        content: this.synthesizeContent(searchResult),
        metadata: {
          hits: searchResult.length,
          ms: elapsedMs,
          reason: 'success'
        }
      };
      
    } catch (error) {
      const elapsedMs = Date.now() - startTime;
      
      if (error instanceof TimeoutError) {
        return {
          content: '',
          metadata: { hits: 0, ms: elapsedMs, reason: 'timeout' }
        };
      }
      
      console.error('Pre-search enrichment failed:', error);
      return {
        content: '',
        metadata: { hits: 0, ms: elapsedMs, reason: 'error' }
      };
    }
  }
  
  private isEligible(toolId: string): boolean {
    if (!this.config.enabled) return false;
    
    return this.config.allowlist.length === 0 || 
           this.config.allowlist.includes(toolId) ||
           this.config.allowlist.includes('*');
  }
  
  private async performSearch(
    toolId: string, 
    args: any, 
    context: ExecutionContext
  ): Promise<SearchResult[]> {
    // Build search query from tool context
    const query = this.buildSearchQuery(toolId, args);
    
    // Search with bounded parameters
    const results = await this.memoryAdapter.search(query, {
      kind: ['operational', 'tool_exec'],
      limit: this.config.bounds.topK,
      where: {
        domain: this.detectDomain(toolId),
        environment: context.environment || 'prod'
      }
    });
    
    return results;
  }
}
```

### Query Construction:
```typescript
class QueryBuilder {
  buildSearchQuery(toolId: string, args: any): string {
    const parts: string[] = [];
    
    // Tool context
    parts.push(toolId);
    
    // Resource type extraction
    const resourceType = this.extractResourceType(toolId, args);
    if (resourceType) {
      parts.push(resourceType);
    }
    
    // Namespace context
    const namespace = this.extractNamespace(args);
    if (namespace) {
      parts.push(namespace);
    }
    
    // Operation type
    const opType = this.detectOperationType(toolId);
    parts.push(opType);
    
    return parts.join(' ');
  }
  
  private extractResourceType(toolId: string, args: any): string | null {
    // Extract from tool name patterns
    const resourcePatterns = [
      /oc_read_get_(\w+)/,     // oc_read_get_pods -> pods
      /cluster_(\w+)/,         // cluster_health -> health
      /namespace_(\w+)/        // namespace_status -> status
    ];
    
    for (const pattern of resourcePatterns) {
      const match = toolId.match(pattern);
      if (match) return match[1];
    }
    
    // Extract from arguments
    if (args.resourceType) return args.resourceType;
    if (args.kind) return args.kind;
    
    return null;
  }
  
  private extractNamespace(args: any): string | null {
    return args.namespace || args.project || args.ns || null;
  }
  
  private detectOperationType(toolId: string): string {
    if (toolId.includes('read') || toolId.includes('get')) return 'read';
    if (toolId.includes('health') || toolId.includes('status')) return 'diagnostic';
    if (toolId.includes('describe') || toolId.includes('logs')) return 'troubleshoot';
    return 'operation';
  }
}
```

### Content Synthesis:
```typescript
class ContentSynthesizer {
  private static readonly MAX_CONTENT_LENGTH = 1536; // 1.5KB
  
  synthesizeContent(searchResults: SearchResult[]): string {
    if (searchResults.length === 0) {
      return '';
    }
    
    const sections: string[] = [];
    
    // Recent incidents section
    const incidents = searchResults.filter(r => r.metadata.kind === 'operational');
    if (incidents.length > 0) {
      sections.push(this.buildIncidentsSection(incidents));
    }
    
    // Performance patterns section
    const toolExecs = searchResults.filter(r => r.metadata.kind === 'tool_exec');
    if (toolExecs.length > 0) {
      sections.push(this.buildPerformanceSection(toolExecs));
    }
    
    const content = sections.join('\n\n');
    
    // Enforce size bounds
    return content.length > ContentSynthesizer.MAX_CONTENT_LENGTH
      ? content.substring(0, ContentSynthesizer.MAX_CONTENT_LENGTH) + '...'
      : content;
  }
  
  private buildIncidentsSection(incidents: SearchResult[]): string {
    const lines = ['Recent Incidents:'];
    
    incidents.slice(0, 2).forEach(incident => {
      const summary = this.extractIncidentSummary(incident.content);
      const timestamp = this.formatTimestamp(incident.metadata.timestamp);
      lines.push(`- ${timestamp}: ${summary}`);
    });
    
    return lines.join('\n');
  }
  
  private buildPerformanceSection(toolExecs: SearchResult[]): string {
    const lines = ['Performance Patterns:'];
    
    const avgLatency = this.calculateAverageLatency(toolExecs);
    const errorRate = this.calculateErrorRate(toolExecs);
    
    lines.push(`- Avg Latency: ${avgLatency}ms`);
    lines.push(`- Error Rate: ${(errorRate * 100).toFixed(1)}%`);
    
    return lines.join('\n');
  }
}
```

### Safety Constraints:
```typescript
class SafetyConstraints {
  private static readonly HARD_TIMEOUT_MS = 400;
  private static readonly MAX_MEMORY_MB = 10;
  private static readonly MAX_QUERIES_PER_MINUTE = 60;
  
  private queryCounter = new Map<string, number>();
  
  async enforceConstraints<T>(
    operation: () => Promise<T>,
    context: SafetyContext
  ): Promise<T> {
    // Rate limiting
    this.enforceRateLimit(context.toolId);
    
    // Memory monitoring
    const memoryBefore = process.memoryUsage().heapUsed;
    
    try {
      // Timeout enforcement with race condition
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise(SafetyConstraints.HARD_TIMEOUT_MS)
      ]);
      
      // Memory usage check
      const memoryAfter = process.memoryUsage().heapUsed;
      const memoryDelta = (memoryAfter - memoryBefore) / 1024 / 1024; // MB
      
      if (memoryDelta > SafetyConstraints.MAX_MEMORY_MB) {
        console.warn(`Pre-search memory usage exceeded limit: ${memoryDelta.toFixed(2)}MB`);
      }
      
      return result;
      
    } catch (error) {
      if (error instanceof TimeoutError) {
        console.warn(`Pre-search timeout after ${SafetyConstraints.HARD_TIMEOUT_MS}ms`);
        throw error;
      }
      
      // Log and re-throw other errors
      console.error('Pre-search constraint violation:', error);
      throw error;
    }
  }
  
  private enforceRateLimit(toolId: string): void {
    const minute = Math.floor(Date.now() / 60000);
    const key = `${toolId}:${minute}`;
    
    const count = this.queryCounter.get(key) || 0;
    if (count >= SafetyConstraints.MAX_QUERIES_PER_MINUTE) {
      throw new RateLimitError(`Rate limit exceeded for ${toolId}`);
    }
    
    this.queryCounter.set(key, count + 1);
    
    // Cleanup old entries
    for (const [k, v] of this.queryCounter.entries()) {
      const [_, keyMinute] = k.split(':');
      if (parseInt(keyMinute) < minute - 1) {
        this.queryCounter.delete(k);
      }
    }
  }
  
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new TimeoutError(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });
  }
}
```

### Integration with Instrumentation Middleware:
```typescript
class InstrumentationMiddleware {
  private enrichment: PreSearchEnrichment;
  
  async pre(toolFullName: string, args: any, context: ExecutionContext): Promise<PreContext> {
    const baseContext = {
      toolId: this.normalizeToolId(toolFullName),
      opType: this.detectOpType(toolFullName, args),
      mode: this.determineMode(),
      sessionId: context.sessionId || 'default',
      startTime: Date.now(),
      flags: this.captureRelevantFlags(),
      inputHash: this.hashSafeInputs(args)
    };
    
    // Attempt enrichment (non-blocking)
    let enrichmentResult: EnrichmentResult = {
      content: '',
      metadata: { hits: 0, ms: 0, reason: 'disabled' }
    };
    
    try {
      enrichmentResult = await this.enrichment.enrich(
        baseContext.toolId,
        args,
        context
      );
    } catch (error) {
      // Enrichment failure should never block tool execution
      console.error('Enrichment failed, continuing without context:', error);
      enrichmentResult.metadata.reason = 'failed';
    }
    
    return {
      ...baseContext,
      enrichment: enrichmentResult
    };
  }
}
```

## Configuration Management

### Feature Flags:
```typescript
interface EnrichmentConfig {
  enabled: boolean;                     // Master enable/disable
  allowlist: string[];                  // Tool allowlist
  bounds: {
    timeoutMs: number;                  // 400ms hard timeout
    topK: number;                       // 3 max results
    maxContentLength: number;           // 1.5KB max content
  };
  rateLimit: {
    queriesPerMinute: number;           // 60 queries/minute
    memoryLimitMB: number;              // 10MB memory limit
  };
  fallback: {
    onTimeout: 'empty' | 'cache';       // Timeout behavior
    onError: 'empty' | 'cache';         // Error behavior
  };
}

class EnrichmentConfigManager {
  static loadConfig(): EnrichmentConfig {
    return {
      enabled: env.get('ENABLE_PRESEARCH', false),
      allowlist: env.get('INSTRUMENT_ALLOWLIST', '').split(',').filter(Boolean),
      bounds: {
        timeoutMs: env.get('PRESEARCH_TIMEOUT_MS', 400),
        topK: env.get('PRESEARCH_TOP_K', 3),
        maxContentLength: env.get('PRESEARCH_MAX_CONTENT', 1536)
      },
      rateLimit: {
        queriesPerMinute: env.get('PRESEARCH_RATE_LIMIT', 60),
        memoryLimitMB: env.get('PRESEARCH_MEMORY_LIMIT_MB', 10)
      },
      fallback: {
        onTimeout: env.get('PRESEARCH_TIMEOUT_FALLBACK', 'empty') as 'empty' | 'cache',
        onError: env.get('PRESEARCH_ERROR_FALLBACK', 'empty') as 'empty' | 'cache'
      }
    };
  }
}
```

### Environment Variables:
```bash
# Pre-search enrichment feature flag
ENABLE_PRESEARCH=false

# Tool allowlist (comma-separated)
INSTRUMENT_ALLOWLIST=oc_read_get_pods,cluster_health,namespace_health

# Performance bounds
PRESEARCH_TIMEOUT_MS=400
PRESEARCH_TOP_K=3
PRESEARCH_MAX_CONTENT=1536

# Rate limiting
PRESEARCH_RATE_LIMIT=60
PRESEARCH_MEMORY_LIMIT_MB=10

# Fallback behavior
PRESEARCH_TIMEOUT_FALLBACK=empty
PRESEARCH_ERROR_FALLBACK=empty
```

## Performance Monitoring

### Enrichment Metrics:
```typescript
class EnrichmentMetrics {
  private metrics = {
    totalRequests: 0,
    successfulEnrichments: 0,
    timeouts: 0,
    errors: 0,
    totalLatency: 0,
    maxLatency: 0,
    contentSize: {
      total: 0,
      max: 0,
      average: 0
    }
  };
  
  recordEnrichment(result: EnrichmentResult): void {
    this.metrics.totalRequests++;
    this.metrics.totalLatency += result.metadata.ms;
    this.metrics.maxLatency = Math.max(this.metrics.maxLatency, result.metadata.ms);
    
    switch (result.metadata.reason) {
      case 'success':
        this.metrics.successfulEnrichments++;
        this.recordContentSize(result.content.length);
        break;
      case 'timeout':
        this.metrics.timeouts++;
        break;
      case 'error':
      case 'failed':
        this.metrics.errors++;
        break;
    }
  }
  
  getPerformanceReport(): EnrichmentPerformanceReport {
    const avgLatency = this.metrics.totalRequests > 0
      ? this.metrics.totalLatency / this.metrics.totalRequests
      : 0;
    
    const successRate = this.metrics.totalRequests > 0
      ? this.metrics.successfulEnrichments / this.metrics.totalRequests
      : 0;
    
    return {
      totalRequests: this.metrics.totalRequests,
      successRate: successRate,
      timeoutRate: this.metrics.timeouts / this.metrics.totalRequests,
      errorRate: this.metrics.errors / this.metrics.totalRequests,
      performance: {
        averageLatency: avgLatency,
        maxLatency: this.metrics.maxLatency,
        p95Latency: this.calculateP95Latency()
      },
      contentStats: {
        averageSize: this.metrics.contentSize.average,
        maxSize: this.metrics.contentSize.max,
        totalSize: this.metrics.contentSize.total
      }
    };
  }
}
```

### Alert Thresholds:
```typescript
class EnrichmentAlerting {
  private thresholds = {
    maxLatency: 500,        // Alert if >500ms
    maxErrorRate: 0.1,      // Alert if >10% error rate
    maxTimeoutRate: 0.05,   // Alert if >5% timeout rate
    maxMemoryUsage: 20      // Alert if >20MB memory usage
  };
  
  checkThresholds(metrics: EnrichmentPerformanceReport): Alert[] {
    const alerts: Alert[] = [];
    
    if (metrics.performance.maxLatency > this.thresholds.maxLatency) {
      alerts.push({
        severity: 'warning',
        message: `Pre-search latency exceeded threshold: ${metrics.performance.maxLatency}ms`
      });
    }
    
    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      alerts.push({
        severity: 'error',
        message: `Pre-search error rate exceeded threshold: ${(metrics.errorRate * 100).toFixed(1)}%`
      });
    }
    
    if (metrics.timeoutRate > this.thresholds.maxTimeoutRate) {
      alerts.push({
        severity: 'warning',
        message: `Pre-search timeout rate exceeded threshold: ${(metrics.timeoutRate * 100).toFixed(1)}%`
      });
    }
    
    return alerts;
  }
}
```

## Rationale

### Why Bounded Enrichment:

✅ **Performance Protection** - Hard timeouts prevent enrichment from degrading tool performance  
✅ **Graceful Degradation** - Tools continue working even if enrichment fails  
✅ **Resource Control** - Memory and computation limits prevent resource exhaustion  
✅ **Operational Safety** - Enrichment failures never cascade to tool failures  
✅ **Gradual Rollout** - Allowlist enables controlled deployment  

### Why 400ms Timeout:

✅ **User Experience** - Fast enough to not impact perceived tool responsiveness  
✅ **Memory System Performance** - Reasonable time for vector search operations  
✅ **Safety Margin** - Allows for network latency and query processing time  
✅ **Operational Tolerance** - Short enough to prevent accumulating delays  

### Why topK=3 Limit:

✅ **Content Quality** - Small number ensures only most relevant results  
✅ **Processing Speed** - Fewer results means faster synthesis  
✅ **Memory Efficiency** - Bounded result set prevents memory bloat  
✅ **Decision Support** - 3 results provide context without overwhelming  

### Why 1.5KB Content Limit:

✅ **Token Efficiency** - Reasonable size for LLM context injection  
✅ **Performance** - Small content minimizes processing overhead  
✅ **Memory Usage** - Bounded content prevents memory accumulation  
✅ **Readability** - Concise content is more actionable  

## Security Considerations

### Information Isolation:
```typescript
class SecurityBoundaries {
  enforceIsolation(query: string, context: ExecutionContext): SearchFilter {
    return {
      where: {
        // Enforce tenant isolation
        tenant: context.tenant,
        
        // Domain isolation
        domain: this.detectAllowedDomain(context.toolId),
        
        // Environment isolation
        environment: context.environment,
        
        // Exclude sensitive data
        sensitivity: { $ne: 'high' }
      }
    };
  }
  
  sanitizeContent(content: string): string {
    // Remove potential sensitive patterns
    return content
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]');
  }
}
```

### Access Control:
```typescript
class EnrichmentAccessControl {
  checkPermissions(toolId: string, context: ExecutionContext): boolean {
    // Check if tool is on allowlist
    if (!this.isToolAllowed(toolId)) {
      return false;
    }
    
    // Check if user has enrichment permissions
    if (!this.hasEnrichmentPermission(context.userId)) {
      return false;
    }
    
    // Check rate limits
    if (this.isRateLimited(context.userId)) {
      return false;
    }
    
    return true;
  }
}
```

## Consequences

### Benefits:
- **Enhanced Tool Intelligence** - Relevant context improves tool decision-making
- **Incident Correlation** - Historical patterns inform current operations
- **Performance Awareness** - Tools aware of past performance issues
- **Safety Compliance** - Bounded operations prevent system disruption
- **Gradual Deployment** - Allowlist enables safe rollout

### Costs:
- **Complexity Overhead** - Additional system complexity for enrichment
- **Resource Usage** - Memory and computation overhead for searches
- **Latency Impact** - Additional 50-400ms per tool execution
- **Monitoring Requirements** - Need for comprehensive enrichment monitoring

### Risks:
- **Performance Degradation** - Enrichment could slow down tool execution
- **Information Leakage** - Cross-domain information could leak via enrichment
- **Resource Exhaustion** - Unbounded enrichment could exhaust system resources
- **Cascading Failures** - Enrichment failures could impact tool reliability

## Review and Evolution

### Performance Monitoring:
- **Enrichment Latency** - Track P50, P95, P99 latencies
- **Success Rates** - Monitor enrichment success vs. timeout/error rates  
- **Content Quality** - Measure relevance and usefulness of enriched content
- **Resource Usage** - Monitor memory and CPU impact

### Success Metrics:
- **Tool Effectiveness** - Improved tool success rates with enrichment
- **Incident Resolution** - Faster MTTR with context-aware tools
- **User Satisfaction** - Operator feedback on enriched tool responses
- **System Stability** - No degradation in overall system performance

### Future Enhancements:
- **Adaptive Timeouts** - Dynamic timeout adjustment based on query complexity
- **Content Caching** - Cache frequent enrichment results for performance
- **ML-Driven Relevance** - Machine learning to improve content relevance
- **Cross-Domain Enrichment** - Controlled sharing of context across domains
