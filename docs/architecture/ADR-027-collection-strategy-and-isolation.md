# ADR-027: Collection Strategy and Isolation

**Status:** Accepted  
**Date:** September 11, 2025  
**Decision Makers:** Kevin Brown, Claude (Technical Advisor)

## Context

The MCP-ocs memory system requires a strategic approach to organizing vector collections in ChromaDB to support operational intelligence, performance analytics, and incident correlation. The system must balance:

- **Data Isolation** - Logical separation of different data types and domains
- **Query Performance** - Efficient retrieval across collection boundaries
- **Operational Safety** - Prevent data contamination and ensure consistent tagging
- **Scalability** - Support growth in data volume and organizational complexity
- **Migration Flexibility** - Evolution from unified to specialized collections

### Current Challenges
- Mixed data types in single collections reduce query efficiency
- Lack of isolation between operational and conversational data
- Difficulty in applying domain-specific policies and retention
- Unclear collection lifecycle management and governance

### Collection Types and Requirements
1. **Conversation Memory** - Cross-session context and learning
2. **Operational Memory** - Incident patterns and resolutions  
3. **Tool Execution** - Performance analytics and pattern recognition
4. **Evidence Collections** - Audit trails and compliance data

## Decision

**Phased Collection Strategy: Unified → Separate with Strict Isolation**

### Phase 1: Unified Collection with Kind Tagging
- **Single Collection** - All data types in unified collection
- **Strict Tagging** - `kind:` metadata enforces logical separation
- **Migration Readiness** - Schema supports future collection splitting

### Phase 2: Separate Collections with Domain Isolation
- **Per-Kind Collections** - Dedicated collections for each data type
- **Prefix Isolation** - Tenant-based naming prevents contamination
- **Domain Boundaries** - Clear separation by operational domain

### Collection Architecture:

```typescript
// Phase 1: Unified Strategy
interface UnifiedCollectionStrategy {
  collection: string;                    // Single collection name
  isolation: 'kind-tags';               // Isolation via metadata tags
  naming: 'CHROMA_COLLECTION';          // Environment variable control
}

// Phase 2: Separate Strategy  
interface SeparateCollectionStrategy {
  collections: {
    conversations: string;               // Conversation memory
    operational: string;                 // Incident and operational data
    tool_exec: string;                   // Tool execution analytics
    evidence: string;                    // Audit and compliance data
  };
  isolation: 'collection-boundaries';   // Physical collection separation
  naming: 'CHROMA_COLLECTION_PREFIX';   // Prefix-based naming
}

// Configuration-Driven Strategy Selection
interface CollectionConfig {
  strategy: 'unified' | 'separate';
  tenant: string;                       // Tenant identifier
  database: string;                     // ChromaDB database
  prefix?: string;                      // Collection prefix (separate strategy)
  collection?: string;                  // Collection name (unified strategy)
}
```

## Implementation

### Collection Manager:
```typescript
class CollectionManager {
  private config: CollectionConfig;
  private client: ChromaClient;
  
  constructor(config: CollectionConfig) {
    this.config = config;
    this.client = new ChromaClient({
      host: config.chromaHost || "127.0.0.1",
      port: config.chromaPort || 8000
    });
  }
  
  async getCollection(kind: 'conversation' | 'operational' | 'tool_exec' | 'evidence'): Promise<Collection> {
    if (this.config.strategy === 'unified') {
      return this.getUnifiedCollection();
    } else {
      return this.getSeparateCollection(kind);
    }
  }
  
  private async getUnifiedCollection(): Promise<Collection> {
    const collectionName = this.config.collection || 'ocs_memory_v2';
    return this.client.getOrCreateCollection({
      name: collectionName,
      metadata: {
        strategy: 'unified',
        tenant: this.config.tenant,
        database: this.config.database,
        created: new Date().toISOString()
      }
    });
  }
  
  private async getSeparateCollection(kind: string): Promise<Collection> {
    const prefix = this.config.prefix || 'mcp-ocs-';
    const collectionName = `${prefix}${kind}`;
    
    return this.client.getOrCreateCollection({
      name: collectionName,
      metadata: {
        strategy: 'separate',
        kind: kind,
        tenant: this.config.tenant,
        database: this.config.database,
        created: new Date().toISOString()
      }
    });
  }
}
```

### Unified Collection Implementation:
```typescript
class UnifiedCollectionStrategy {
  private collection: Collection;
  
  async store(document: MemoryDocument): Promise<void> {
    // Enforce strict kind tagging
    const metadata = {
      ...document.metadata,
      kind: this.validateKind(document.metadata.kind),
      tenant: this.config.tenant,
      database: this.config.database
    };
    
    await this.collection.add({
      ids: [document.id],
      documents: [document.content],
      metadatas: [metadata]
    });
  }
  
  async query(query: string, filter: CollectionFilter): Promise<QueryResult[]> {
    // Always include kind filter for isolation
    const whereClause = {
      ...filter.where,
      kind: filter.kind,
      tenant: this.config.tenant
    };
    
    return this.collection.query({
      queryTexts: [query],
      nResults: filter.limit || 10,
      where: whereClause
    });
  }
  
  private validateKind(kind: string): string {
    const validKinds = ['conversation', 'operational', 'tool_exec', 'evidence'];
    if (!validKinds.includes(kind)) {
      throw new Error(`Invalid kind: ${kind}. Must be one of: ${validKinds.join(', ')}`);
    }
    return kind;
  }
}
```

### Separate Collections Implementation:
```typescript
class SeparateCollectionStrategy {
  private collections: Map<string, Collection> = new Map();
  
  async store(document: MemoryDocument): Promise<void> {
    const collection = await this.getKindCollection(document.metadata.kind);
    
    // Kind is implicit in collection choice, but kept for consistency
    const metadata = {
      ...document.metadata,
      tenant: this.config.tenant,
      database: this.config.database
    };
    
    await collection.add({
      ids: [document.id],
      documents: [document.content],
      metadatas: [metadata]
    });
  }
  
  async query(query: string, filter: CollectionFilter): Promise<QueryResult[]> {
    const collection = await this.getKindCollection(filter.kind);
    
    const whereClause = {
      ...filter.where,
      tenant: this.config.tenant
      // Kind filter unnecessary - implicit in collection
    };
    
    return collection.query({
      queryTexts: [query],
      nResults: filter.limit || 10,
      where: whereClause
    });
  }
  
  private async getKindCollection(kind: string): Promise<Collection> {
    if (!this.collections.has(kind)) {
      const collection = await this.collectionManager.getCollection(kind as any);
      this.collections.set(kind, collection);
    }
    return this.collections.get(kind)!;
  }
}
```

## Rationale

### Why Phased Strategy:

✅ **Risk Mitigation** - Start unified, evolve to separate as needs clarify  
✅ **Operational Learning** - Understand usage patterns before optimizing  
✅ **Migration Flexibility** - Support both strategies during transition  
✅ **Performance Testing** - Compare strategies with real workloads  
✅ **Gradual Complexity** - Avoid premature optimization  

### Why Collection Isolation:

✅ **Query Performance** - Targeted collections reduce search space  
✅ **Policy Enforcement** - Different retention and access rules per type  
✅ **Operational Safety** - Prevent data contamination between domains  
✅ **Scalability** - Independent scaling of different data types  
✅ **Maintenance** - Easier backup, recovery, and optimization  

### Why Tenant-Based Naming:

✅ **Multi-tenancy Support** - Clean separation between organizations  
✅ **Namespace Protection** - Prevent accidental data mixing  
✅ **Audit Compliance** - Clear ownership and access trails  
✅ **Migration Safety** - Obvious collection boundaries during moves  

## Deployment Configuration

### Environment Variables:
```bash
# Unified Strategy
CHROMA_COLLECTION_STRATEGY=unified
CHROMA_COLLECTION=ocs_memory_v2
CHROMA_TENANT=mcp-ocs
CHROMA_DATABASE=prod

# Separate Strategy  
CHROMA_COLLECTION_STRATEGY=separate
CHROMA_COLLECTION_PREFIX=mcp-ocs-
CHROMA_TENANT=mcp-ocs
CHROMA_DATABASE=prod

# ChromaDB Connection
CHROMA_HOST=127.0.0.1
CHROMA_PORT=8000
```

## Consequences

### Benefits:
- **Strategic Flexibility** - Support for both unified and separate approaches
- **Performance Optimization** - Collection-specific tuning and indexing
- **Operational Safety** - Strong isolation and access control
- **Migration Support** - Tools for strategy evolution
- **Audit Compliance** - Complete collection governance and tracking

### Costs:
- **Configuration Complexity** - Multiple strategy options to manage
- **Migration Overhead** - Strategy transitions require careful planning
- **Storage Duplication** - Potential data duplication during migrations
- **Operational Complexity** - Different collection strategies require different management approaches

### Risks:
- **Strategy Lock-in** - Difficult to change strategies once data accumulates
- **Performance Degradation** - Incorrect strategy choice could impact query performance
- **Data Inconsistency** - Migration processes could introduce data integrity issues
- **Access Control Gaps** - Complex multi-collection permissions increase security risks

## Review and Evolution

### Performance Monitoring:
- **Query Performance** - Track response times across collection strategies
- **Storage Efficiency** - Monitor disk usage and growth patterns
- **Migration Success** - Validate data integrity during strategy transitions
- **Access Patterns** - Analyze usage to optimize collection organization

### Success Metrics:
- **Query Latency** - <100ms for 95th percentile queries
- **Storage Growth** - Predictable growth patterns within capacity planning
- **Migration Reliability** - Zero data loss during strategy transitions
- **Isolation Effectiveness** - No cross-tenant data leakage incidents

### Decision Points:
- **Unified → Separate** - When query performance degrades due to collection size
- **Collection Splitting** - When specific data types require different optimization
- **Tenant Separation** - When multi-tenancy requirements become critical
- **Archive Strategy** - When long-term retention policies differ by data type

### Future Enhancements:
- **Automated Strategy Selection** - ML-driven collection strategy recommendations
- **Dynamic Collection Scaling** - Auto-scaling based on usage patterns
- **Cross-Collection Search** - Federated search across collection boundaries
- **Advanced Isolation** - Row-level security and encryption within collections
