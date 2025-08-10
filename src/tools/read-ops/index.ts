/**
 * Read Operations Tools - Safe data retrieval operations
 * 
 * Following ADR-004 namespace conventions: oc_read_*
 * Read-only operations for information gathering
 */

import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';

export class ReadOpsTools {
  constructor(
    private openshiftClient: OpenShiftClient,
    private memoryManager: SharedMemoryManager
  ) {}

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_pods',
        namespace: 'mcp-openshift',
        fullName: 'oc_read_get_pods',
        domain: 'cluster',
        capabilities: [
          { type: 'read', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'List pods in a namespace with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            namespace: {
              type: 'string',
              description: 'Target namespace (optional)'
            },
            selector: {
              type: 'string', 
              description: 'Label selector (optional)'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          }
        },
        priority: 95
      },
      {
        name: 'describe_resource',
        namespace: 'mcp-openshift',
        fullName: 'oc_read_describe',
        domain: 'cluster',
        capabilities: [
          { type: 'read', level: 'detailed', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Get detailed information about a specific resource',
        inputSchema: {
          type: 'object',
          properties: {
            resourceType: {
              type: 'string',
              description: 'Type of resource (pod, deployment, service, etc.)'
            },
            name: {
              type: 'string',
              description: 'Name of the resource'
            },
            namespace: {
              type: 'string',
              description: 'Target namespace (optional)'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['resourceType', 'name']
        },
        priority: 90
      },
      {
        name: 'get_logs',
        namespace: 'mcp-openshift',
        fullName: 'oc_read_logs',
        domain: 'cluster',
        capabilities: [
          { type: 'read', level: 'detailed', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Retrieve logs from a pod or container',
        inputSchema: {
          type: 'object',
          properties: {
            podName: {
              type: 'string',
              description: 'Name of the pod'
            },
            namespace: {
              type: 'string',
              description: 'Target namespace (optional)'
            },
            container: {
              type: 'string',
              description: 'Specific container name (optional)'
            },
            lines: {
              type: 'number',
              description: 'Number of lines to retrieve (default: 100)',
              default: 100
            },
            since: {
              type: 'string',
              description: 'Time range (e.g., "1h", "30m")'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['podName']
        },
        priority: 85
      },
      {
        name: 'search_memory',
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
        priority: 80
      }
    ];
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    const sessionId = args.sessionId || `read-${Date.now()}`;
    
    try {
      switch (toolName) {
        case 'oc_read_get_pods':
          return await this.getPods(args.namespace, args.selector, sessionId);
          
        case 'oc_read_describe':
          return await this.describeResource(args.resourceType, args.name, args.namespace, sessionId);
          
        case 'oc_read_logs':
          return await this.getLogs(args.podName, args.namespace, args.container, args.lines, args.since, sessionId);
          
        case 'memory_search_operational':
          return await this.searchMemory(args.query, args.limit, sessionId);
          
        default:
          throw new Error(`Unknown read operation tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`❌ Read operation ${toolName} failed:`, error);
      throw error;
    }
  }

  private async getPods(namespace?: string, selector?: string, sessionId?: string): Promise<any> {
    console.error(`📋 Getting pods - namespace: ${namespace}, selector: ${selector}`);
    
    const pods = await this.openshiftClient.getPods(namespace, selector);
    
    const result = {
      namespace: namespace || 'default',
      selector: selector || 'none',
      totalPods: pods.length,
      pods: pods,
      summary: {
        running: pods.filter(p => p.status === 'Running').length,
        pending: pods.filter(p => p.status === 'Pending').length,
        failed: pods.filter(p => p.status === 'Failed').length,
        unknown: pods.filter(p => !['Running', 'Pending', 'Failed'].includes(p.status)).length
      },
      timestamp: new Date().toISOString()
    };
    
    // Store in memory for future reference
    await this.memoryManager.storeConversation({
      sessionId: sessionId || 'unknown',
      domain: 'openshift',
      timestamp: Date.now(),
      userMessage: `Get pods in ${namespace || 'default'} namespace`,
      assistantResponse: `Found ${pods.length} pods: ${result.summary.running} running, ${result.summary.pending} pending, ${result.summary.failed} failed`,
      context: ['pods', 'namespace', namespace || 'default'],
      tags: ['read_operation', 'pods', 'cluster_state']
    });
    
    return result;
  }

  private async describeResource(resourceType: string, name: string, namespace?: string, sessionId?: string): Promise<any> {
    console.error(`🔍 Describing ${resourceType}/${name} in namespace: ${namespace}`);
    
    const description = await this.openshiftClient.describeResource(resourceType, name, namespace);
    
    const result = {
      resourceType,
      name,
      namespace: namespace || 'default',
      description,
      timestamp: new Date().toISOString()
    };
    
    // Store in memory
    await this.memoryManager.storeConversation({
      sessionId: sessionId || 'unknown',
      domain: 'openshift',
      timestamp: Date.now(),
      userMessage: `Describe ${resourceType} ${name}`,
      assistantResponse: `Retrieved detailed information for ${resourceType}/${name}`,
      context: [resourceType, name, namespace || 'default'],
      tags: ['read_operation', 'describe', resourceType]
    });
    
    return result;
  }

  private async getLogs(podName: string, namespace?: string, container?: string, lines?: number, since?: string, sessionId?: string): Promise<any> {
    console.error(`📄 Getting logs from pod: ${podName}, container: ${container}, lines: ${lines}`);
    
    const logs = await this.openshiftClient.getLogs(podName, namespace, {
      container,
      lines: lines || 100,
      since
    });
    
    const result = {
      podName,
      namespace: namespace || 'default',
      container: container || 'default',
      lines: lines || 100,
      since,
      logs,
      logLines: logs.split('\\n').length,
      timestamp: new Date().toISOString()
    };
    
    // Store in memory
    await this.memoryManager.storeConversation({
      sessionId: sessionId || 'unknown',
      domain: 'openshift',
      timestamp: Date.now(),
      userMessage: `Get logs from pod ${podName}`,
      assistantResponse: `Retrieved ${result.logLines} lines of logs from ${podName}`,
      context: ['logs', podName, namespace || 'default'],
      tags: ['read_operation', 'logs', 'troubleshooting']
    });
    
    return result;
  }

  private async searchMemory(query: string, limit?: number, sessionId?: string): Promise<any> {
    console.error(`🧠 Searching operational memory for: ${query}`);
    
    const results = await this.memoryManager.searchOperational(query, limit || 5);
    
    const searchResult = {
      query,
      limit: limit || 5,
      resultsFound: results.length,
      results: results.map(r => ({
        similarity: r.similarity,
        relevance: r.relevance,
        incidentId: r.memory.incidentId,
        symptoms: r.memory.symptoms,
        resolution: r.memory.resolution,
        timestamp: r.memory.timestamp
      })),
      timestamp: new Date().toISOString()
    };
    
    // Store search in memory for analytics
    await this.memoryManager.storeConversation({
      sessionId: sessionId || 'unknown',
      domain: 'knowledge',
      timestamp: Date.now(),
      userMessage: `Search memory for: ${query}`,
      assistantResponse: `Found ${results.length} relevant incidents in operational memory`,
      context: ['memory_search', query],
      tags: ['memory_operation', 'knowledge_retrieval', 'pattern_matching']
    });
    
    return searchResult;
  }
}
