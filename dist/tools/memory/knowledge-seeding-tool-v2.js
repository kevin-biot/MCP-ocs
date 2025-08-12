/**
 * Knowledge Seeding Tool Suite - Unified Registration
 *
 * Wraps the KnowledgeSeedingTool in the new StandardTool interface
 * for consistent registration with the UnifiedToolRegistry
 */
import { KnowledgeSourceClass } from '../../lib/memory/knowledge-seeding-system.js';
export class KnowledgeSeedingTool {
    knowledgeSeedingSystem;
    name = 'knowledge_seed_pattern';
    fullName = 'knowledge_seed_pattern';
    description = `
Seed knowledge patterns into the vector memory system for future retrieval.

OPERATIONS:
- 'seed': Add custom knowledge with full control
- 'quick_seed': Use predefined templates for common patterns
- 'search': Search existing knowledge with filters
- 'stats': Get knowledge statistics by source class

QUICK TEMPLATES:
- PATTERN_DISCOVERY: Document discovered operational patterns
- TROUBLESHOOTING_SEQUENCE: Record troubleshooting steps and outcomes  
- FALSE_POSITIVE: Mark scenarios that look like issues but aren't
- INTERNET_KNOWLEDGE: Add external knowledge from internet sources

EXAMPLES:
// Quick pattern discovery
{
  "operation": "quick_seed",
  "templateType": "PATTERN_DISCOVERY", 
  "templateArgs": ["Student04 CI/CD Pattern", "Pods in Succeeded state with 0/1 ready", "student04 namespace runs CI/CD pipelines"]
}

// Custom knowledge seeding
{
  "operation": "seed",
  "title": "PVC Binding Issues in Lab Environment",
  "content": "Lab environment PVCs often fail to bind due to storage class configuration...",
  "sourceClass": "engineer_added",
  "tags": ["pvc", "storage", "lab_environment"],
  "cluster": "lab-cluster-01"
}
`;
    inputSchema = {
        type: 'object',
        properties: {
            operation: {
                type: 'string',
                enum: ['seed', 'search', 'stats', 'quick_seed'],
                description: 'Operation to perform'
            },
            // Quick seeding
            templateType: {
                type: 'string',
                enum: ['PATTERN_DISCOVERY', 'TROUBLESHOOTING_SEQUENCE', 'FALSE_POSITIVE', 'INTERNET_KNOWLEDGE'],
                description: 'Quick template type for predefined patterns'
            },
            templateArgs: {
                type: 'array',
                items: { type: 'string' },
                description: 'Arguments for the template (varies by template type)'
            },
            // Custom seeding
            title: { type: 'string', description: 'Knowledge title' },
            content: { type: 'string', description: 'Knowledge content' },
            sourceClass: {
                type: 'string',
                enum: Object.values(KnowledgeSourceClass),
                description: 'Source classification for the knowledge'
            },
            tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorizing the knowledge'
            },
            author: { type: 'string', description: 'Author of the knowledge' },
            reliabilityScore: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Reliability score (0-100)'
            },
            referenceUrls: {
                type: 'array',
                items: { type: 'string' },
                description: 'Reference URLs for the knowledge'
            },
            cluster: { type: 'string', description: 'Target cluster context' },
            namespace: { type: 'string', description: 'Target namespace context' },
            // Search
            searchQuery: { type: 'string', description: 'Search query' },
            searchSourceClasses: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: Object.values(KnowledgeSourceClass)
                },
                description: 'Filter by source classes'
            },
            searchTags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by tags'
            },
            searchLimit: {
                type: 'number',
                description: 'Maximum results to return'
            },
            reliabilityThreshold: {
                type: 'number',
                minimum: 0,
                maximum: 100,
                description: 'Minimum reliability score for results'
            }
        },
        required: ['operation']
    };
    constructor(knowledgeSeedingSystem) {
        this.knowledgeSeedingSystem = knowledgeSeedingSystem;
    }
    async execute(args) {
        try {
            let result;
            switch (args.operation) {
                case 'quick_seed':
                    result = await this.handleQuickSeed(args);
                    break;
                case 'seed':
                    result = await this.handleCustomSeed(args);
                    break;
                case 'search':
                    result = await this.handleSearch(args);
                    break;
                case 'stats':
                    result = await this.handleStats();
                    break;
                default:
                    throw new Error(`Unknown operation: ${args.operation}`);
            }
            // Return formatted string for MCP
            return JSON.stringify(result, null, 2);
        }
        catch (error) {
            const errorResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(errorResult, null, 2);
        }
    }
    async handleQuickSeed(args) {
        if (!args.templateType || !args.templateArgs) {
            throw new Error('templateType and templateArgs required for quick_seed operation');
        }
        const memoryId = await this.knowledgeSeedingSystem.quickSeed(args.templateType, ...args.templateArgs);
        return {
            success: true,
            operation: 'quick_seed',
            templateType: args.templateType,
            memoryId,
            timestamp: new Date().toISOString()
        };
    }
    async handleCustomSeed(args) {
        if (!args.title || !args.content) {
            throw new Error('title and content required for seed operation');
        }
        const memoryId = await this.knowledgeSeedingSystem.seedKnowledge({
            title: args.title,
            content: args.content,
            sourceClass: args.sourceClass || KnowledgeSourceClass.ENGINEER_ADDED,
            tags: args.tags || [],
            metadata: {
                author: args.author || 'engineer',
                reliabilityScore: args.reliabilityScore || 85,
                referenceUrls: args.referenceUrls || [],
                cluster: args.cluster,
                namespace: args.namespace
            }
        });
        return {
            success: true,
            operation: 'seed',
            title: args.title,
            memoryId,
            timestamp: new Date().toISOString()
        };
    }
    async handleSearch(args) {
        if (!args.searchQuery) {
            throw new Error('searchQuery required for search operation');
        }
        const results = await this.knowledgeSeedingSystem.searchKnowledge(args.searchQuery, {
            sourceClasses: args.searchSourceClasses,
            tags: args.searchTags,
            limit: args.searchLimit || 5,
            reliabilityThreshold: args.reliabilityThreshold || 70
        });
        return {
            success: true,
            operation: 'search',
            query: args.searchQuery,
            resultCount: results.length,
            results: results.map(result => ({
                memoryId: result.sessionId,
                content: result.assistantResponse.substring(0, 200) + '...',
                timestamp: result.timestamp,
                relevanceScore: result.distance
            })),
            timestamp: new Date().toISOString()
        };
    }
    async handleStats() {
        const stats = await this.knowledgeSeedingSystem.getKnowledgeStats();
        const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
        return {
            success: true,
            operation: 'stats',
            totalKnowledgeEntries: total,
            bySourceClass: stats,
            timestamp: new Date().toISOString()
        };
    }
}
/**
 * Knowledge Tools Suite - Unified Registration
 *
 * Implements ToolSuite interface for integration with UnifiedToolRegistry
 */
export class KnowledgeToolsSuite {
    knowledgeSeedingTool;
    category = 'knowledge';
    version = 'v1';
    metadata = {
        description: 'Conversational knowledge capture and retrieval system',
        maintainer: 'MCP-ocs Knowledge Team'
    };
    constructor(knowledgeSeedingTool) {
        this.knowledgeSeedingTool = knowledgeSeedingTool;
    }
    getTools() {
        return [
            {
                name: this.knowledgeSeedingTool.name,
                fullName: this.knowledgeSeedingTool.fullName,
                description: this.knowledgeSeedingTool.description,
                inputSchema: this.knowledgeSeedingTool.inputSchema,
                category: 'knowledge',
                version: 'v1',
                execute: async (args) => {
                    // Handle the type conversion for knowledge seeding
                    const knowledgeArgs = {
                        operation: 'seed',
                        ...args
                    };
                    return await this.knowledgeSeedingTool.execute(knowledgeArgs);
                },
                metadata: {
                    author: 'MCP-ocs Team',
                    experimental: false,
                    requiredPermissions: ['memory:write', 'vector:search']
                }
            }
        ];
    }
}
