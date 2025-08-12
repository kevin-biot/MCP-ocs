/**
 * MCP Tool: Knowledge Seeding for Engineers
 * Allows engineers to seed knowledge patterns directly into the vector memory system
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { KnowledgeSeedingSystem, KnowledgeSourceClass, KnowledgeSeedTemplate, ENGINEER_TEMPLATES } from '../../lib/memory/knowledge-seeding-system.js';

export interface KnowledgeSeedingToolArguments {
  // Quick template seeding
  templateType?: 'PATTERN_DISCOVERY' | 'TROUBLESHOOTING_SEQUENCE' | 'FALSE_POSITIVE' | 'INTERNET_KNOWLEDGE';
  templateArgs?: string[]; // Arguments for the template
  
  // Custom knowledge seeding
  title?: string;
  content?: string;
  sourceClass?: KnowledgeSourceClass;
  tags?: string[];
  author?: string;
  reliabilityScore?: number;
  referenceUrls?: string[];
  cluster?: string;
  namespace?: string;
  
  // Search functionality
  searchQuery?: string;
  searchSourceClasses?: KnowledgeSourceClass[];
  searchTags?: string[];
  searchLimit?: number;
  reliabilityThreshold?: number;
  
  // Operations
  operation: 'seed' | 'search' | 'stats' | 'quick_seed';
}

export class KnowledgeSeedingTool implements Tool {
  [x: string]: unknown;  // Index signature for Tool interface
  name = 'knowledge_seed_pattern';
  fullName = 'knowledge_seed_pattern';  // Add fullName property
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

// Search knowledge
{
  "operation": "search",
  "searchQuery": "pvc binding issues",
  "searchSourceClasses": ["engineer_added", "internet_knowledge"],
  "reliabilityThreshold": 80
}
`;

  inputSchema: any = {
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

  constructor(private knowledgeSeedingSystem: KnowledgeSeedingSystem) {}

  async execute(args: KnowledgeSeedingToolArguments): Promise<any> {
    try {
      switch (args.operation) {
        case 'quick_seed':
          return await this.handleQuickSeed(args);
        
        case 'seed':
          return await this.handleCustomSeed(args);
        
        case 'search':
          return await this.handleSearch(args);
        
        case 'stats':
          return await this.handleStats();
        
        default:
          throw new Error(`Unknown operation: ${args.operation}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async handleQuickSeed(args: KnowledgeSeedingToolArguments) {
    if (!args.templateType || !args.templateArgs) {
      throw new Error('templateType and templateArgs required for quick_seed operation');
    }

    const memoryId = await this.knowledgeSeedingSystem.quickSeed(
      args.templateType,
      ...args.templateArgs
    );

    return {
      success: true,
      operation: 'quick_seed',
      templateType: args.templateType,
      memoryId,
      message: `Knowledge seeded using ${args.templateType} template`,
      timestamp: new Date().toISOString()
    };
  }

  private async handleCustomSeed(args: KnowledgeSeedingToolArguments) {
    if (!args.title || !args.content || !args.sourceClass) {
      throw new Error('title, content, and sourceClass required for seed operation');
    }

    const template: KnowledgeSeedTemplate = {
      title: args.title,
      content: args.content,
      sourceClass: args.sourceClass as KnowledgeSourceClass,
      tags: args.tags || [],
      metadata: {
        author: args.author || 'Unknown',
        creationDate: new Date().toISOString(),
        reliabilityScore: args.reliabilityScore || 70,
        referenceUrls: args.referenceUrls || [],
        cluster: args.cluster,
        namespace: args.namespace
      }
    };

    const memoryId = await this.knowledgeSeedingSystem.seedKnowledge(template);

    return {
      success: true,
      operation: 'seed',
      memoryId,
      title: args.title,
      sourceClass: args.sourceClass,
      tags: args.tags,
      message: 'Knowledge successfully seeded',
      timestamp: new Date().toISOString()
    };
  }

  private async handleSearch(args: KnowledgeSeedingToolArguments) {
    if (!args.searchQuery) {
      throw new Error('searchQuery required for search operation');
    }

    const results = await this.knowledgeSeedingSystem.searchKnowledge(
      args.searchQuery,
      {
        sourceClasses: args.searchSourceClasses,
        tags: args.searchTags,
        limit: args.searchLimit || 10,
        reliabilityThreshold: args.reliabilityThreshold,
        cluster: args.cluster,
        namespace: args.namespace
      }
    );

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

  private async handleStats() {
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

// Example usage patterns for engineers
export const USAGE_EXAMPLES = {
  // Pattern Discovery
  studentNamespacePattern: {
    operation: 'quick_seed',
    templateType: 'PATTERN_DISCOVERY',
    templateArgs: [
      'Student04 CI/CD Artifacts',
      'Pods in Succeeded state with 0/1 ready in student04 namespace',
      'These are CI/CD pipeline artifacts, not broken applications'
    ]
  },

  // Troubleshooting Sequence  
  pvcBindingFix: {
    operation: 'quick_seed',
    templateType: 'TROUBLESHOOTING_SEQUENCE',
    templateArgs: [
      'PVC not binding in lab environment',
      '1. Check storage class\n2. Verify PV availability\n3. Check resource quotas\n4. Restart provisioner if needed',
      'PVC bound successfully after storage class update'
    ]
  },

  // False Positive
  normalCIActivity: {
    operation: 'quick_seed',
    templateType: 'FALSE_POSITIVE', 
    templateArgs: [
      'High pod churn in CI namespaces',
      'CI/CD pipelines naturally create and destroy many pods during builds. This is normal behavior, not a cluster issue.'
    ]
  },

  // Internet Knowledge
  kubernetesbestPractice: {
    operation: 'quick_seed',
    templateType: 'INTERNET_KNOWLEDGE',
    templateArgs: [
      'PVC Resize Best Practices',
      'Kubernetes Documentation',
      'PVC expansion is supported for most storage classes. Always backup data before resizing. Some filesystems require pod restart.',
      'https://kubernetes.io/docs/concepts/storage/persistent-volumes/#expanding-persistent-volumes-claims'
    ]
  },

  // Custom seeding with full control
  customPattern: {
    operation: 'seed',
    title: 'Lab Environment Storage Quirks',
    content: 'Lab storage systems have known issues with PVC binding during peak hours (2-4 PM). Workaround: retry after 4 PM or use alternative storage class.',
    sourceClass: 'engineer_added',
    tags: ['storage', 'lab_environment', 'workaround', 'peak_hours'],
    author: 'Lab Engineer',
    reliabilityScore: 85,
    cluster: 'lab-cluster-01'
  },

  // Advanced search
  searchStorageIssues: {
    operation: 'search',
    searchQuery: 'storage pvc binding',
    searchSourceClasses: ['engineer_added', 'internet_knowledge'],
    reliabilityThreshold: 80,
    searchLimit: 5
  }
};
