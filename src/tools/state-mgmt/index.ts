/**
 * State Management Tools - Memory and workflow state operations
 * 
 * Following ADR-004 namespace conventions: oc_state_*
 * Tools for managing workflow state and operational memory
 */

import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { nowIso, nowEpoch } from '../../utils/time.js';
import { ToolSuite, StandardTool } from '../../lib/tools/tool-registry.js';
import { isOperationalMemory } from '../../lib/type-guards/index.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';
import { WorkflowEngine } from '../../lib/workflow/workflow-engine.js';

export class StateMgmtTools implements ToolSuite {
  category = 'workflow';
  version = 'v2';
  constructor(
    private memoryManager: SharedMemoryManager,
    private workflowEngine: WorkflowEngine
  ) {}

  getTools(): StandardTool[] {
    const toolDefinitions = this.getToolDefinitions();
    return toolDefinitions.map(tool => this.convertToStandardTool(tool));
  }

  private getToolDefinitions(): ToolDefinition[] {
    return [
      {
        name: 'store_incident',
        namespace: 'mcp-memory',
        fullName: 'memory_store_operational',
        domain: 'knowledge',
        capabilities: [
          { type: 'memory', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Store an incident resolution in operational memory for future reference',
        inputSchema: {
          type: 'object',
          properties: {
            incidentId: {
              type: 'string',
              description: 'Unique identifier for the incident'
            },
            symptoms: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of observed symptoms'
            },
            rootCause: {
              type: 'string',
              description: 'Identified root cause of the incident'
            },
            resolution: {
              type: 'string',
              description: 'How the incident was resolved'
            },
            affectedResources: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of affected resources'
            },
            environment: {
              type: 'string',
              enum: ['dev', 'test', 'staging', 'prod'],
              description: 'Environment where incident occurred'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['incidentId', 'symptoms', 'environment']
        },
        priority: 70
      },
      {
        name: 'search_operational',
        namespace: 'mcp-memory',
        fullName: 'memory_search_operational',
        domain: 'knowledge',
        capabilities: [
          { type: 'memory', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Search operational memory for similar incidents and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for finding similar incidents'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 5)',
              default: 5
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['query']
        },
        priority: 75
      },
      {
        name: 'get_workflow_state',
        namespace: 'mcp-core',
        fullName: 'core_workflow_state',
        domain: 'system',
        capabilities: [
          { type: 'state', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Get current workflow state for a session',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID to query'
            }
          },
          required: ['sessionId']
        },
        priority: 75
      },
      {
        name: 'memory_stats',
        namespace: 'mcp-memory',
        fullName: 'memory_get_stats',
        domain: 'knowledge',
        capabilities: [
          { type: 'memory', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Get memory system statistics and health information',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: {
              type: 'boolean',
              description: 'Include detailed breakdown of memory usage',
              default: false
            }
          }
        },
        priority: 65
      },
      {
        name: 'search_conversations',
        namespace: 'mcp-memory',
        fullName: 'memory_search_conversations',
        domain: 'knowledge',
        capabilities: [
          { type: 'memory', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Search conversation memory for relevant context',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for finding relevant conversations'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 5)',
              default: 5
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['query']
        },
        priority: 65
      }
    ];
  }

  private convertToStandardTool(toolDef: ToolDefinition): StandardTool {
    return {
      name: toolDef.name,
      fullName: toolDef.fullName,
      description: toolDef.description,
      inputSchema: toolDef.inputSchema,
      category: 'workflow' as const,
      version: 'v2' as const,
      execute: async (args: unknown) => this.executeTool(toolDef.fullName, args)
      };
  }

  private async storeIncident(args: import('@/lib/types/tool-inputs').StoreIncidentArgs): Promise<string> {
    console.error(`💾 Storing incident: ${args.incidentId}`);
    
    await this.memoryManager.storeOperational({
      incidentId: args.incidentId,
      domain: 'operations',
      timestamp: nowEpoch(),
      symptoms: args.symptoms || [],
      rootCause: args.rootCause || '',
      resolution: args.resolution || '',
      affectedResources: args.affectedResources || [],
      diagnosticSteps: ['Manual incident storage'],
      tags: ['incident_storage', 'manual_entry', args.environment],
      environment: args.environment
    });

    // Store conversation for tracking
    if (args.sessionId) {
      await this.memoryManager.storeConversation({
        sessionId: args.sessionId,
        domain: 'operations',
        timestamp: nowEpoch(),
        userMessage: `Store incident: ${args.incidentId}`,
        assistantResponse: 'Incident stored successfully',
        context: ['incident_storage'],
        tags: ['memory_operation', 'incident_storage']
      });
    }

    return JSON.stringify({
      operation: 'store_incident',
      incidentId: args.incidentId,
      memoryId: `${args.incidentId}_${Date.now()}`,
      status: 'success',
      timestamp: new Date().toISOString()
    }, null, 2);
  }

  private async searchOperational(query: string, limit?: number, sessionId?: string): Promise<import('@/lib/types/tool-inputs').OperationalSearchResult> {
    console.error(`🔍 Searching operational memory for: ${query}`);
    
    const results = await this.memoryManager.searchOperational(query, limit || 5);
    
    return {
      query,
      limit: limit || 5,
      resultsFound: results.length,
      results: results.map(r => {
        const mem = (r && typeof r === 'object' && 'memory' in r) ? (r as any).memory : undefined;
        if (isOperationalMemory(mem)) {
          return {
            similarity: Number((r as any).similarity ?? 0),
            incidentId: mem.incidentId || 'unknown',
            symptoms: mem.symptoms || [],
            rootCause: mem.rootCause || 'not specified',
            resolution: mem.resolution || 'not specified',
            environment: mem.environment || 'unknown',
            timestamp: mem.timestamp
          };
        }
        return {
          similarity: Number((r as any)?.similarity ?? 0),
          incidentId: 'unknown',
          symptoms: [],
          rootCause: 'not specified',
          resolution: 'not specified',
          environment: 'unknown',
          timestamp: undefined
        };
      }),
      timestamp: new Date().toISOString()
    };
  }

  private async getWorkflowState(sessionId: string): Promise<any> {
    console.error(`🔄 Getting workflow state for session: ${sessionId}`);
    
    // For now, return a basic state since getSessionState might not exist
    // TODO: Implement proper workflow state retrieval
    
    return {
      sessionId,
      currentState: 'unknown',
      evidence: [],
      hypotheses: [],
      panicSignals: [],
      startTime: null,
      lastStateChange: null,
      timestamp: nowIso(),
      note: 'Workflow state tracking not fully implemented yet'
    };
  }

  private async getMemoryStats(detailed?: boolean): Promise<import('@/lib/types/tool-inputs').MemoryStatsSummary> {
    console.error(`📈 Getting memory system statistics (detailed: ${detailed})`);
    
    const stats = await this.memoryManager.getStats();
    
    const result: import('@/lib/types/tool-inputs').MemoryStatsSummary = {
      totalConversations: stats.totalConversations,
      totalOperational: stats.totalOperational,
      chromaAvailable: stats.chromaAvailable,
      storageUsed: stats.storageUsed,
      lastCleanup: stats.lastCleanup,
      namespace: stats.namespace,
      detailed: detailed || false,
      timestamp: new Date().toISOString()
    };

    if (detailed) {
      const tenant = process.env.CHROMA_TENANT || 'mcp-ocs';
      const database = process.env.CHROMA_DATABASE || 'prod';
      const prefix = process.env.CHROMA_COLLECTION_PREFIX || (process.env.CHROMA_COLLECTION ? String(process.env.CHROMA_COLLECTION) : 'mcp-ocs-');
      const collections = [
        `${prefix}conversations`,
        `${prefix}operational`,
        `${prefix}tool_exec`
      ].join(', ');
      const backendStr = stats.chromaAvailable
        ? `ChromaDB + JSON (tenant=${tenant}, db=${database}, collections=${collections})`
        : 'JSON only';
      result.details = {
        memoryBreakdown: {
          conversationMemory: `${stats.totalConversations} entries`,
          operationalMemory: `${stats.totalOperational} incidents`,
          storageBackend: backendStr
        },
        systemHealth: {
          chromaStatus: stats.chromaAvailable ? 'available' : 'unavailable',
          storageLocation: stats.namespace,
          lastCleanup: stats.lastCleanup
        }
      };
    }
    
    return result;
  }

  private async searchConversations(query: string, limit?: number, sessionId?: string): Promise<any> {
    console.error(`🔍 Searching conversation memory for: ${query}`);
    
    const results = await this.memoryManager.searchConversations(query, limit || 5);
    
    const searchResult = {
      query,
      limit: limit || 5,
      resultsFound: results.length,
      results: results.map(r => ({
        similarity: r.similarity,
        relevance: r.relevance,
        sessionId: 'sessionId' in r.memory ? r.memory.sessionId : '',
        domain: r.memory.domain,
        userMessage: 'userMessage' in r.memory ? r.memory.userMessage : '',
        assistantResponse: 'assistantResponse' in r.memory ? r.memory.assistantResponse : '',
        timestamp: r.memory.timestamp,
        tags: r.memory.tags
      })),
      timestamp: new Date().toISOString()
    };
    
    // Store search in memory for analytics
    if (sessionId) {
      await this.memoryManager.storeConversation({
        sessionId,
        domain: 'knowledge',
        timestamp: nowEpoch(),
        userMessage: `Search conversations for: ${query}`,
        assistantResponse: `Found ${results.length} relevant conversations`,
        context: ['conversation_search', query],
        tags: ['memory_operation', 'conversation_search']
      });
    }
    
    return searchResult;
  }

  async executeTool(toolName: string, args: any): Promise<string> {
    const { sessionId } = args;

    try {
      switch (toolName) {
        case 'memory_store_operational':
          return await this.storeIncident(args);
          
        case 'memory_search_operational':
          const operationalResults = await this.searchOperational(args.query, args.limit, sessionId);
          return JSON.stringify(operationalResults, null, 2);
          
        case 'core_workflow_state':
          const workflowState = await this.getWorkflowState(sessionId);
          return JSON.stringify(workflowState, null, 2);
          
        case 'memory_get_stats':
          const stats = await this.getMemoryStats(args.detailed);
          return JSON.stringify(stats, null, 2);
          
        case 'memory_search_conversations':
          const conversationResults = await this.searchConversations(args.query, args.limit, sessionId);
          return JSON.stringify(conversationResults, null, 2);
          
        default:
          throw new Error(`Unknown state management tool: ${toolName}`);
      }
    } catch (error) {
      // Store error for analysis
      await this.memoryManager.storeOperational({
        incidentId: `state-mgmt-error-${sessionId}-${Date.now()}`,
        domain: 'system',
        timestamp: nowEpoch(),
        symptoms: [`State management tool error: ${toolName}`],
        rootCause: error instanceof Error ? error.message : 'Unknown error',
        affectedResources: [],
        diagnosticSteps: [`Failed to execute ${toolName}`],
        tags: ['state_mgmt_error', 'tool_failure', toolName],
        environment: 'prod'
      });

      console.error(`❌ State management operation ${toolName} failed:`, error);
      throw error;
    }
  }
}
