# ADR-026: Analytics Schema v2 Design

**Status:** Accepted  
**Date:** September 11, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

The MCP-ocs instrumentation middleware requires a comprehensive data schema to capture tool execution analytics and operational intelligence. The system must support:

- **Dual Storage Strategy** - JSON metrics and vector metadata with different optimization goals
- **Evidence Correlation** - Links to logs, artifacts, ADRs, and operational context
- **Schema Evolution** - Backward compatibility and versioning
- **Performance Analytics** - Systematic performance tracking and optimization
- **Operational Intelligence** - Pattern recognition and incident correlation

### Current Challenges
- No standardized analytics schema for tool execution data
- Limited correlation between tool performance and operational outcomes
- Lack of evidence trails for incident investigation
- Inconsistent metadata across storage systems

### Schema Requirements
1. **Structured Metrics** - Quantitative performance and outcome data
2. **Evidence Anchors** - References to supporting operational context
3. **Metadata Consistency** - Aligned tagging across JSON and vector storage
4. **Privacy Compliance** - Input redaction and PII protection
5. **Performance Bounds** - Size limits and processing constraints

## Decision

**Dual Schema Architecture: JSON Analytics + Vector Metadata**

### Core Design Principles:
1. **Separation of Concerns** - JSON for metrics, vector for semantic search
2. **Evidence-Driven** - Every record includes operational context anchors
3. **Bounded Collections** - Size limits prevent unbounded growth
4. **Privacy by Design** - Redaction built into schema structure
5. **Schema Versioning** - Explicit version tracking for evolution

### JSON Analytics Schema (v2):
```typescript
interface AnalyticsMetricsV2 {
  // Core Identification
  toolId: string;                     // Normalized tool identifier (e.g., "oc_read_get_pods")
  opType: 'read' | 'diagnostic' | 'memory' | 'workflow' | 'other';
  mode: 'json' | 'vector';           // Storage path taken
  
  // Performance Metrics
  elapsedMs: number;                 // Execution duration
  outcome: 'ok' | 'error';           // Success/failure indicator
  errorSummary: string | null;       // Redacted error message (≤200 chars)
  cleanupCheck: boolean;             // Post-execution validation status
  
  // Evidence and Context
  anchors: string[];                 // Evidence references (≤10 items)
  timestamp: string;                 // ISO8601 execution timestamp
  sessionId: string;                 // Session correlation identifier
  
  // System Context
  flags: Record<string, boolean | string | number>; // Feature flag snapshot (bounded)
  vector: {                          // Vector storage metadata
    tenant?: string;                 // ChromaDB tenant
    database?: string;               // ChromaDB database
    collection?: string;             // ChromaDB collection
  };
  
  // Schema Versioning
  schemaVersion: '2.0';              // Explicit schema version
  inputHash?: string;                // SHA256 of redacted inputs (optional)
}
```

### Vector Metadata Schema (v2):
```typescript
interface VectorMetadataV2 {
  // Required Tags (stored as strings in ChromaDB metadata)
  kind: 'tool_exec';                 // Document type classifier
  domain: string;                    // 'openshift', 'kubernetes', 'system', 'files'
  environment: 'dev' | 'test' | 'staging' | 'prod';
  
  // Tool Classification
  tool: string;                      // Tool identifier (normalized)
  suite?: string;                    // Tool suite grouping (e.g., 'oc_read')
  resource?: string;                 // Resource type (e.g., 'pods', 'nodes')
  
  // Operational Context
  sessionId: string;                 // Session correlation
  timestamp: string;                 // ISO8601 timestamp
  outcome: 'ok' | 'error';           // Execution result
  elapsedMs: number;                 // Performance metric
  
  // Severity and Priority (optional)
  severity?: 'low' | 'medium' | 'high' | 'critical';
  priority?: number;                 // 1-5 scale
  
  // Evidence References (arrays stored as comma-joined strings)
  logRefs?: string;                  // "log1,log2,log3"
  artifactRefs?: string;             // "artifact1,artifact2"
  adrRefs?: string;                  // "ADR-003,ADR-007"
  
  // Schema Versioning
  metadataVersion: '2.0';            // Version tracking
}
```

## Implementation

### Evidence Anchor Specification:
```typescript
interface EvidenceAnchor {
  type: 'log' | 'artifact' | 'adr' | 'commit' | 'url';
  reference: string;
  description?: string;
}

// Anchor Format Examples:
const anchorFormats = {
  log: "log:logs/sprint-execution.log:1694455200000-1694455230000",
  artifact: "artifact:04-quality-assessment-report.md",
  adr: "adr:ADR-003",
  commit: "commit:a1b2c3d4",
  url: "url:https://docs.example.com/runbook/pod-recovery"
};

class EvidenceAnchorBuilder {
  build(type: string, reference: string, metadata?: any): string {
    const parts = [type, reference];
    if (metadata) {
      parts.push(JSON.stringify(metadata));
    }
    return parts.join(':');
  }
  
  parse(anchor: string): EvidenceAnchor {
    const [type, reference, metadataJson] = anchor.split(':');
    return {
      type: type as EvidenceAnchor['type'],
      reference,
      description: metadataJson ? JSON.parse(metadataJson) : undefined
    };
  }
}
```

### Schema Validation:
```typescript
class SchemaValidator {
  validateAnalyticsV2(data: any): AnalyticsMetricsV2 {
    // Required field validation
    if (!data.toolId || typeof data.toolId !== 'string') {
      throw new Error('Invalid toolId');
    }
    
    if (!['read', 'diagnostic', 'memory', 'workflow', 'other'].includes(data.opType)) {
      throw new Error('Invalid opType');
    }
    
    // Size constraints
    if (data.anchors && data.anchors.length > 10) {
      throw new Error('Too many anchors (max 10)');
    }
    
    if (data.errorSummary && data.errorSummary.length > 200) {
      throw new Error('Error summary too long (max 200 chars)');
    }
    
    // Set defaults
    return {
      ...data,
      schemaVersion: '2.0',
      anchors: data.anchors || [],
      vector: data.vector || {}
    };
  }
  
  validateVectorMetadataV2(data: any): VectorMetadataV2 {
    if (data.kind !== 'tool_exec') {
      throw new Error('Invalid kind for tool execution metadata');
    }
    
    if (!['dev', 'test', 'staging', 'prod'].includes(data.environment)) {
      throw new Error('Invalid environment');
    }
    
    return {
      ...data,
      metadataVersion: '2.0'
    };
  }
}
```

### Data Privacy and Redaction:
```typescript
class DataRedactor {
  redactInputs(args: any): any {
    const redacted = JSON.parse(JSON.stringify(args)); // Deep clone
    
    // Redact common sensitive patterns
    this.redactPasswords(redacted);
    this.redactTokens(redacted);
    this.redactIPAddresses(redacted);
    this.redactFileContents(redacted);
    
    return redacted;
  }
  
  private redactPasswords(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        if (/password|secret|key|token/i.test(key)) {
          obj[key] = '[REDACTED]';
        }
        obj[key] = value.replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]');
      } else if (typeof value === 'object' && value !== null) {
        this.redactPasswords(value);
      }
    }
  }
  
  createSafeHash(data: any): string {
    const redacted = this.redactInputs(data);
    const jsonString = JSON.stringify(redacted, Object.keys(redacted).sort());
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }
}
```

### Vector Content Synthesis:
```typescript
class VectorContentSynthesizer {
  private static readonly MAX_CONTENT_LENGTH = 1536; // ~1.5KB
  
  synthesizeDocument(
    metrics: AnalyticsMetricsV2, 
    anchors: string[], 
    resultContent: string
  ): string {
    const parts: string[] = [];
    
    // Tool execution summary
    parts.push(`Tool: ${metrics.toolId}`);
    parts.push(`Operation: ${metrics.opType}`);
    parts.push(`Duration: ${metrics.elapsedMs}ms`);
    parts.push(`Result: ${metrics.outcome}`);
    
    // Error context (if applicable)
    if (metrics.outcome === 'error' && metrics.errorSummary) {
      parts.push(`Error: ${metrics.errorSummary}`);
    }
    
    // Evidence context
    if (anchors.length > 0) {
      parts.push(`Evidence: ${anchors.slice(0, 3).join(', ')}`);
    }
    
    // Result summary (truncated)
    if (resultContent && metrics.outcome === 'ok') {
      const summary = this.extractResultSummary(resultContent);
      if (summary) {
        parts.push(`Output: ${summary}`);
      }
    }
    
    // Session context
    parts.push(`Session: ${metrics.sessionId}`);
    
    const document = parts.join('\n');
    return document.length > VectorContentSynthesizer.MAX_CONTENT_LENGTH
      ? document.substring(0, VectorContentSynthesizer.MAX_CONTENT_LENGTH) + '...'
      : document;
  }
  
  private extractResultSummary(content: string): string {
    // Extract key information from tool results
    const lines = content.split('\n').slice(0, 10); // First 10 lines
    return lines.join(' ').substring(0, 500); // Max 500 chars
  }
}
```

## Storage Implementation

### JSON Analytics Storage:
```typescript
class AnalyticsWriter {
  private readonly filePath = 'analytical-artifacts/08-technical-metrics-data.json';
  
  async appendMetrics(metrics: AnalyticsMetricsV2): Promise<void> {
    // Validate schema
    const validated = this.validator.validateAnalyticsV2(metrics);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(this.filePath));
    
    // Atomic append
    const line = JSON.stringify(validated) + '\n';
    await this.atomicAppend(this.filePath, line);
  }
  
  async queryMetrics(filter: MetricsFilter): Promise<AnalyticsMetricsV2[]> {
    if (!await fs.pathExists(this.filePath)) {
      return [];
    }
    
    const content = await fs.readFile(this.filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    return lines
      .map(line => JSON.parse(line) as AnalyticsMetricsV2)
      .filter(metrics => this.matchesFilter(metrics, filter));
  }
  
  private async atomicAppend(filePath: string, content: string): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    await fs.appendFile(tempPath, content, 'utf8');
    await fs.rename(tempPath, filePath);
  }
}
```

### Vector Metadata Storage:
```typescript
class VectorMetadataWriter {
  constructor(private memoryAdapter: UnifiedMemoryAdapter) {}
  
  async storeVectorDocument(
    metrics: AnalyticsMetricsV2,
    content: string,
    metadata: VectorMetadataV2
  ): Promise<void> {
    // Validate metadata
    const validatedMetadata = this.validator.validateVectorMetadataV2(metadata);
    
    // Convert arrays to comma-separated strings for ChromaDB
    const chromaMetadata = this.serializeArrayFields(validatedMetadata);
    
    // Generate consistent ID
    const id = `tool_exec_${metrics.sessionId}_${Date.parse(metrics.timestamp)}`;
    
    await this.memoryAdapter.store({
      id,
      content,
      metadata: chromaMetadata
    });
  }
  
  private serializeArrayFields(metadata: VectorMetadataV2): Record<string, any> {
    const serialized = { ...metadata };
    
    // Convert array fields to comma-separated strings
    if (Array.isArray(serialized.logRefs)) {
      serialized.logRefs = serialized.logRefs.join(',');
    }
    if (Array.isArray(serialized.artifactRefs)) {
      serialized.artifactRefs = serialized.artifactRefs.join(',');
    }
    if (Array.isArray(serialized.adrRefs)) {
      serialized.adrRefs = serialized.adrRefs.join(',');
    }
    
    return serialized;
  }
}
```

## Schema Evolution Strategy

### Version Migration:
```typescript
interface SchemaMigration {
  fromVersion: string;
  toVersion: string;
  migrate(data: any): any;
}

class SchemaEvolution {
  private migrations: SchemaMigration[] = [
    {
      fromVersion: '1.0',
      toVersion: '2.0',
      migrate: (v1Data: any) => ({
        ...v1Data,
        schemaVersion: '2.0',
        anchors: v1Data.anchors || [],
        vector: v1Data.vector || {},
        cleanupCheck: v1Data.cleanupCheck ?? true
      })
    }
  ];
  
  migrateToLatest(data: any): AnalyticsMetricsV2 {
    let current = data;
    const currentVersion = current.schemaVersion || '1.0';
    
    for (const migration of this.migrations) {
      if (migration.fromVersion === currentVersion) {
        current = migration.migrate(current);
      }
    }
    
    return current as AnalyticsMetricsV2;
  }
}
```

### Backward Compatibility:
```typescript
class BackwardCompatibility {
  readLegacyMetrics(filePath: string): Promise<AnalyticsMetricsV2[]> {
    // Read and migrate legacy schema v1 records
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    
    return lines.map(line => {
      const data = JSON.parse(line);
      return this.schemaEvolution.migrateToLatest(data);
    });
  }
  
  isLegacySchema(data: any): boolean {
    return !data.schemaVersion || data.schemaVersion !== '2.0';
  }
}
```

## Rationale

### Why Dual Schema Design:

✅ **Optimized Storage** - JSON for analytics queries, vectors for semantic search  
✅ **Performance** - Each format optimized for its use case  
✅ **Flexibility** - Independent evolution of metrics and metadata  
✅ **Query Efficiency** - JSON for structured queries, vectors for similarity  
✅ **Storage Efficiency** - Bounded content sizes prevent bloat  

### Why Evidence Anchors:

✅ **Traceability** - Complete audit trail for tool executions  
✅ **Incident Correlation** - Link tool usage to operational outcomes  
✅ **Root Cause Analysis** - Evidence chains for investigation  
✅ **Knowledge Preservation** - Maintain operational context  

### Why Schema Versioning:

✅ **Evolution Support** - Safe schema changes over time  
✅ **Backward Compatibility** - Legacy data remains accessible  
✅ **Migration Paths** - Automated conversion between versions  
✅ **Quality Control** - Explicit version tracking prevents confusion  

## Performance Considerations

### Size Constraints:
- **JSON Records** - Target ~1KB per metrics record
- **Vector Documents** - Limited to 1.5KB synthesized content
- **Anchor Collections** - Maximum 10 anchors per execution
- **Error Messages** - Truncated to 200 characters

### Storage Optimization:
```typescript
class StorageOptimizer {
  async rotateMetricsFile(): Promise<void> {
    const filePath = 'analytical-artifacts/08-technical-metrics-data.json';
    const stats = await fs.stat(filePath);
    
    // Rotate when file exceeds 5MB
    if (stats.size > 5 * 1024 * 1024) {
      const timestamp = new Date().toISOString().split('T')[0];
      const archivePath = `analytical-artifacts/archive/08-technical-metrics-${timestamp}.json`;
      
      await fs.ensureDir(path.dirname(archivePath));
      await fs.move(filePath, archivePath);
    }
  }
  
  async compressArchives(): Promise<void> {
    // Compress archived metrics files
    const archiveDir = 'analytical-artifacts/archive';
    const files = await fs.readdir(archiveDir);
    
    for (const file of files) {
      if (file.endsWith('.json') && !file.endsWith('.gz')) {
        await this.gzipFile(path.join(archiveDir, file));
      }
    }
  }
}
```

### Query Performance:
```typescript
class MetricsQuery {
  async getPerformanceStats(toolId: string, timeRange: TimeRange): Promise<PerformanceStats> {
    const metrics = await this.analyticsWriter.queryMetrics({
      toolId,
      timestamp: { $gte: timeRange.start, $lte: timeRange.end }
    });
    
    return {
      totalExecutions: metrics.length,
      successRate: metrics.filter(m => m.outcome === 'ok').length / metrics.length,
      averageLatency: metrics.reduce((sum, m) => sum + m.elapsedMs, 0) / metrics.length,
      errorPatterns: this.analyzeErrorPatterns(metrics.filter(m => m.outcome === 'error'))
    };
  }
}
```

## Consequences

### Benefits:
- **Comprehensive Analytics** - Complete tool execution intelligence
- **Evidence-Driven Operations** - Full traceability for incident response
- **Performance Optimization** - Data-driven tool improvement decisions
- **Schema Flexibility** - Support for evolving analytics requirements
- **Privacy Compliance** - Built-in redaction and data protection

### Costs:
- **Storage Overhead** - Dual storage increases disk usage
- **Schema Complexity** - More complex data model to maintain
- **Processing Overhead** - Schema validation and transformation costs
- **Migration Burden** - Schema evolution requires migration tooling

### Risks:
- **Schema Drift** - JSON and vector schemas could diverge
- **Performance Impact** - Large anchor collections could slow processing
- **Privacy Leaks** - Inadequate redaction could expose sensitive data
- **Storage Explosion** - Unbounded growth without proper rotation

## Review and Evolution

### Performance Monitoring:
- **Schema Processing Time** - <10ms for validation and transformation
- **Storage Growth Rate** - Monitor JSON and vector storage usage
- **Query Performance** - Track analytics query response times
- **Error Rates** - Monitor schema validation failure frequency

### Quality Metrics:
- **Evidence Coverage** - Percentage of executions with complete anchors
- **Data Completeness** - Missing or incomplete field analysis
- **Schema Compliance** - Validation success rates
- **Migration Success** - Schema evolution error rates

### Future Enhancements:
- **Automated Analytics** - Machine learning on execution patterns
- **Real-time Dashboards** - Live performance and error tracking
- **Advanced Correlation** - Cross-tool pattern recognition
- **Predictive Models** - Performance and failure prediction based on historical data
