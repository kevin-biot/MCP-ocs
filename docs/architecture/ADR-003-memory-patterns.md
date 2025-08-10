# ADR-003: Memory Storage and Retrieval Patterns

**Status:** Accepted  
**Date:** August 10, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

MCP-ocs requires persistent memory for operational knowledge, incident patterns, and cross-session learning. The memory system must support:

- **Cross-Domain Learning** - Knowledge sharing between MCP servers
- **Vector Similarity Search** - Find similar incidents and patterns
- **Persistent Storage** - Survive server restarts and redeployments
- **Performance** - Fast retrieval during incident response
- **Scalability** - Handle growing operational knowledge base

### Available Options
1. **ChromaDB + JSON Fallback** - Vector database with local backup
2. **Pure Vector Database** - ChromaDB, Weaviate, or Pinecone
3. **Traditional Database** - PostgreSQL with pgvector extension
4. **File-Based Storage** - JSON files with search indexing

## Decision

**Hybrid ChromaDB + JSON Fallback Architecture**

### Primary Storage: ChromaDB
- **Vector embeddings** for semantic similarity search
- **Metadata filtering** for domain, environment, timeframe
- **Collection separation** for different memory types
- **High performance** retrieval and similarity matching

### Fallback Storage: JSON Files
- **Automatic backup** of all memory operations
- **Disaster recovery** if ChromaDB unavailable
- **Human-readable** format for manual inspection
- **Simple deployment** in environments without ChromaDB

### Memory Types and Collections:

```typescript
// Conversation Memory - Cross-session context
interface ConversationMemory {
  sessionId: string;
  domain: string;           // 'openshift', 'files', 'router'
  timestamp: number;
  userMessage: string;
  assistantResponse: string;
  context: string[];        // Auto-extracted technical terms
  tags: string[];          // Categorization labels
}

// Operational Memory - Incident patterns and resolutions
interface OperationalMemory {
  incidentId: string;
  domain: string;
  timestamp: number;
  symptoms: string[];       // Observable problems
  rootCause?: string;       // Determined cause
  resolution?: string;      // Applied solution
  environment: 'dev' | 'test' | 'staging' | 'prod';
  affectedResources: string[];
  diagnosticSteps: string[];
  tags: string[];
}
```

## Implementation

### Shared Memory Manager Architecture:
```typescript
class SharedMemoryManager {
  private chromaClient: ChromaClient | null;
  private conversationCollection: Collection;
  private operationalCollection: Collection;
  private fallbackDir: string;
  private domain: string;

  constructor(config: SharedMemoryConfig) {
    this.domain = config.domain;
    this.fallbackDir = config.memoryDir;
    
    try {
      this.chromaClient = new ChromaClient({
        host: config.chromaHost || "127.0.0.1",
        port: config.chromaPort || 8000
      });
    } catch (error) {
      console.warn('ChromaDB unavailable, using JSON fallback');
      this.chromaClient = null;
    }
  }

  async storeConversation(memory: ConversationMemory): Promise<string> {
    // Store in JSON immediately (always)
    await this.storeAsJson(memory, 'conversations');
    
    // Store in ChromaDB if available
    if (this.chromaClient && this.conversationCollection) {
      const content = `User: ${memory.userMessage}\nAssistant: ${memory.assistantResponse}`;
      await this.conversationCollection.add({
        ids: [memory.sessionId + '_' + memory.timestamp],
        documents: [content],
        metadatas: [{
          sessionId: memory.sessionId,
          domain: memory.domain,
          timestamp: memory.timestamp,
          tags: memory.tags,
          context: memory.context
        }]
      });
    }
    
    return memory.sessionId + '_' + memory.timestamp;
  }

  async searchSimilar(query: string, options: SearchOptions): Promise<MemorySearchResult[]> {
    if (this.chromaClient) {
      // Use vector similarity search
      return await this.vectorSearch(query, options);
    } else {
      // Fallback to JSON text search
      return await this.jsonTextSearch(query, options);
    }
  }
}
```

### Collection Strategy:
```typescript
// Namespace-based collection separation
const collectionName = `${namespace}_${type}`;

// Examples:
// "operations_team_conversations"
// "operations_team_operational"
// "dev_team_conversations"
// "dev_team_operational"
```

### Auto-Extraction Patterns:
```typescript
class ContextExtractor {
  extractTechnicalTags(text: string): string[] {
    const patterns = [
      /\b(kubernetes|k8s|openshift|docker|container)\b/gi,
      /\b(pod|deployment|service|ingress|route|configmap|secret)\b/gi,
      /\b(cpu|memory|storage|network|dns|tls)\b/gi,
      /\b(error|warning|failure|timeout|crash|oom)\b/gi,
      /\b(dev|test|staging|prod|production)\b/gi
    ];
    
    return this.extractMatches(text, patterns);
  }
  
  extractResourceNames(text: string): string[] {
    const patterns = [
      /\b[\w-]+\.[\w-]+\.[\w-]+\b/g,    // K8s resource names
      /\b[\w-]+-\w{8,}\b/g,             // Generated names
      /\/[\w\/-]+/g                      // File paths
    ];
    
    return this.extractMatches(text, patterns);
  }
}
```

## Rationale

### Why ChromaDB + JSON Hybrid:

✅ **Best of Both Worlds** - Vector search performance + reliability  
✅ **Graceful Degradation** - Functions without ChromaDB dependency  
✅ **Developer Experience** - JSON files are human-readable and debuggable  
✅ **Production Ready** - ChromaDB provides high-performance retrieval  
✅ **Cross-Domain Search** - Find patterns across different MCP servers  
✅ **Deployment Flexibility** - Works in simple and complex environments  

### Why Not Alternatives:

❌ **Pure Vector DB** - Single point of failure, deployment complexity  
❌ **Traditional DB** - Less optimized for similarity search, more overhead  
❌ **File-Only** - Poor performance for large-scale similarity search  

## Storage Patterns

### Memory Lifecycle:
1. **Immediate JSON Storage** - Always persisted locally
2. **ChromaDB Storage** - If available, for performance
3. **Automatic Cleanup** - Configurable retention policies
4. **Bulk Operations** - Efficient batch storage and retrieval

### Search Strategies:
```typescript
// Primary: Vector similarity with metadata filtering
const results = await collection.query({
  queryTexts: [query],
  nResults: limit,
  where: {
    domain: "openshift",
    environment: "prod",
    timestamp: { $gt: lastWeek }
  }
});

// Fallback: Text-based search with scoring
const fallbackResults = await this.jsonTextSearch(query, {
  domain: "openshift",
  scoreThreshold: 0.3
});
```

### Memory Namespacing:
```typescript
// Multi-tenant support
interface MemoryNamespace {
  team: string;           // "operations", "development", "platform"
  environment: string;    // "dev", "staging", "prod"
  domain: string;         // "openshift", "aws", "networking"
}

// Collection naming: team_environment_domain_type
// Example: "ops_prod_openshift_operational"
```

## Performance Considerations

### ChromaDB Optimization:
- **Embedding Model** - Default embedding function for consistency
- **Collection Size** - Monitor and archive old memories
- **Index Optimization** - Periodic reindexing for performance
- **Connection Pooling** - Efficient connection management

### JSON Fallback Optimization:
- **File Structure** - Time-based directory organization
- **Indexing** - In-memory search indexes for active data
- **Compression** - Gzip for archived memory files
- **Cleanup** - Automatic removal of old files

### Memory Usage:
```
Active Memory (Last 30 days): ChromaDB + JSON
Archived Memory (>30 days): JSON only (compressed)
Search Performance: <100ms for recent, <500ms for archived
Storage Growth: ~100MB per team per month estimated
```

## Data Privacy and Security

### PII Protection:
```typescript
class MemorySanitizer {
  sanitizeContent(content: string): string {
    // Remove IP addresses, credentials, personal info
    return content
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP_REDACTED]')
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]');
  }
}
```

### Access Control:
- **Namespace Isolation** - Teams can only access their memories
- **Role-Based Access** - Different permissions for read/write/admin
- **Audit Logging** - All memory operations logged
- **Encryption** - JSON files encrypted at rest (optional)

## Disaster Recovery

### Backup Strategy:
```bash
# Daily backup of ChromaDB data
chroma backup --output /backup/chroma/$(date +%Y%m%d)

# JSON files already serve as backup
tar -czf /backup/json/memories-$(date +%Y%m%d).tar.gz /path/to/json/memories
```

### Recovery Procedures:
1. **ChromaDB Failure** - Automatic fallback to JSON search
2. **Data Corruption** - Rebuild ChromaDB from JSON files
3. **Complete Loss** - Restore from backup archives
4. **Migration** - Tools to move between storage backends

## Consequences

### Benefits:
- **High Performance** - Vector similarity search for incident correlation
- **Reliability** - JSON fallback ensures no memory loss
- **Scalability** - ChromaDB handles large operational knowledge bases
- **Flexibility** - Works in various deployment scenarios
- **Debuggability** - JSON files enable manual inspection

### Costs:
- **Storage Overhead** - Dual storage increases disk usage
- **Complexity** - Managing two storage systems
- **Consistency** - Ensuring JSON and ChromaDB stay synchronized
- **Dependencies** - ChromaDB adds deployment complexity

### Risks:
- **Data Drift** - JSON and ChromaDB could become inconsistent
- **ChromaDB Dependency** - Performance degradation in fallback mode
- **Storage Growth** - Unbounded growth requires management
- **Privacy Leaks** - Operational data might contain sensitive information

## Review and Evolution

### Performance Monitoring:
- **Search Latency** - <100ms for 95th percentile queries
- **Storage Growth** - Monitor disk usage and growth rates
- **Memory Effectiveness** - Track similarity match accuracy
- **Fallback Usage** - Frequency of JSON-only operations

### Future Enhancements:
- **Smart Archiving** - Automatic migration of old memories
- **Advanced Embeddings** - Domain-specific embedding models
- **Cross-Memory Search** - Search across conversation and operational memories
- **Memory Analytics** - Insights into operational patterns and learning

## Migration Path

### Current State (Validated):
- ✅ ChromaDB integration working
- ✅ JSON fallback implemented
- ✅ 43+ active sessions stored
- ✅ Cross-session persistence confirmed

### Next Steps:
1. **Implement auto-extraction** - Enhanced tag and context detection
2. **Add operational memory** - Incident pattern storage
3. **Optimize search** - Improve similarity matching accuracy
4. **Add namespacing** - Multi-team support
5. **Performance tuning** - Optimize for operational workloads
