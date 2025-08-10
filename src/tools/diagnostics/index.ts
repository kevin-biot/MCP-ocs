/**
 * Diagnostic Tools - OpenShift Health and Status Checks
 * 
 * Following ADR-004 namespace conventions: oc_diagnostic_*
 * Safe read-only operations for cluster health assessment
 */

import { ToolDefinition } from '../../lib/tools/namespace-manager.js';
import { OpenShiftClient } from '../../lib/openshift-client.js';
import { SharedMemoryManager } from '../../lib/memory/shared-memory.js';

export class DiagnosticTools {
  constructor(
    private openshiftClient: OpenShiftClient,
    private memoryManager: SharedMemoryManager
  ) {}

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'cluster_health',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_cluster_health',
        domain: 'cluster',
        capabilities: [
          { type: 'diagnostic', level: 'basic', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Check overall OpenShift cluster health and status',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          }
        },
        priority: 100
      },
      {
        name: 'pod_health_check',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_pod_health',
        domain: 'cluster',
        capabilities: [
          { type: 'diagnostic', level: 'detailed', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Comprehensive health check for pods in a namespace',
        inputSchema: {
          type: 'object',
          properties: {
            namespace: {
              type: 'string',
              description: 'Kubernetes namespace to check (optional, uses default if not specified)'
            },
            selector: {
              type: 'string',
              description: 'Label selector to filter pods (optional)'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          }
        },
        priority: 90
      },
      {
        name: 'resource_utilization',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_resource_usage',
        domain: 'cluster',
        capabilities: [
          { type: 'diagnostic', level: 'advanced', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Analyze resource utilization across cluster nodes and namespaces',
        inputSchema: {
          type: 'object',
          properties: {
            scope: {
              type: 'string',
              enum: ['cluster', 'namespace', 'node'],
              description: 'Scope of resource analysis'
            },
            target: {
              type: 'string',
              description: 'Specific namespace or node name (if scope is not cluster)'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          },
          required: ['scope']
        },
        priority: 80
      },
      {
        name: 'event_analysis',
        namespace: 'mcp-openshift',
        fullName: 'oc_diagnostic_events',
        domain: 'cluster',
        capabilities: [
          { type: 'diagnostic', level: 'detailed', riskLevel: 'safe' }
        ],
        dependencies: [],
        contextRequirements: [],
        description: 'Analyze recent cluster events for issues and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            namespace: {
              type: 'string',
              description: 'Filter events by namespace (optional)'
            },
            timeRange: {
              type: 'string',
              description: 'Time range for events (e.g., "1h", "30m", "24h")',
              default: '1h'
            },
            eventType: {
              type: 'string',
              enum: ['Warning', 'Normal', 'all'],
              description: 'Filter by event type',
              default: 'all'
            },
            sessionId: {
              type: 'string',
              description: 'Session ID for workflow tracking'
            }
          }
        },
        priority: 85
      }
    ];
  }

  /**
   * Execute diagnostic tool (placeholder implementation)
   * In real implementation, this would call the actual OpenShift client methods
   */
  async executeTool(toolName: string, args: any): Promise<any> {
    const sessionId = args.sessionId || `diagnostic-${Date.now()}`;
    
    try {
      switch (toolName) {
        case 'oc_diagnostic_cluster_health':
          return await this.checkClusterHealth(sessionId);
          
        case 'oc_diagnostic_pod_health':
          return await this.checkPodHealth(args.namespace, args.selector, sessionId);
          
        case 'oc_diagnostic_resource_usage':
          return await this.analyzeResourceUsage(args.scope, args.target, sessionId);
          
        case 'oc_diagnostic_events':
          return await this.analyzeEvents(args.namespace, args.timeRange, args.eventType, sessionId);
          
        default:
          throw new Error(`Unknown diagnostic tool: ${toolName}`);
      }
    } catch (error) {
      // Store diagnostic failure in memory for pattern analysis
      await this.memoryManager.storeOperational({
        incidentId: `diagnostic-error-${sessionId}-${Date.now()}`,
        domain: 'system',
        timestamp: Date.now(),
        symptoms: [`Diagnostic tool ${toolName} failed: ${error.message}`],
        diagnosticSteps: [`Attempted ${toolName} with args: ${JSON.stringify(args)}`],
        tags: ['diagnostic_error', 'tool_failure', toolName],
        environment: 'dev'
      });
      
      throw error;
    }
  }

  private async checkClusterHealth(sessionId: string): Promise<any> {
    console.error(`🏥 Checking cluster health for session ${sessionId}`);
    
    // Get cluster info
    const clusterInfo = await this.openshiftClient.getClusterInfo();
    
    // Check node status (placeholder - would use real oc commands)
    const healthSummary = {
      clusterStatus: clusterInfo.status,
      version: clusterInfo.version,
      currentUser: clusterInfo.currentUser,
      serverUrl: clusterInfo.serverUrl,
      timestamp: new Date().toISOString(),
      overallHealth: 'healthy', // Would be calculated from actual checks
      issues: [] as string[],
      recommendations: [] as string[]
    };
    
    // Store successful diagnostic in memory
    await this.memoryManager.storeOperational({
      incidentId: `cluster-health-${sessionId}`,
      domain: 'cluster',
      timestamp: Date.now(),
      symptoms: [`Cluster health check completed`],
      diagnosticSteps: ['Retrieved cluster info', 'Analyzed cluster status'],
      tags: ['cluster_health', 'diagnostic', 'routine_check'],
      environment: 'dev'
    });
    
    return healthSummary;
  }

  private async checkPodHealth(namespace?: string, selector?: string, sessionId?: string): Promise<any> {
    console.error(`🔍 Checking pod health in namespace: ${namespace || 'default'}`);
    
    // Get pods
    const pods = await this.openshiftClient.getPods(namespace, selector);
    
    // Analyze pod health
    const healthAnalysis = {
      namespace: namespace || 'default',
      totalPods: pods.length,
      healthyPods: pods.filter(p => p.status === 'Running' && p.ready === '1/1').length,
      unhealthyPods: pods.filter(p => p.status !== 'Running' || p.ready !== '1/1'),
      highRestartPods: pods.filter(p => p.restarts > 5),
      recommendations: [] as string[],
      timestamp: new Date().toISOString()
    };
    
    // Generate recommendations
    if (healthAnalysis.unhealthyPods.length > 0) {
      healthAnalysis.recommendations.push('Investigate unhealthy pods');
    }
    if (healthAnalysis.highRestartPods.length > 0) {
      healthAnalysis.recommendations.push('Check pods with high restart counts');
    }
    
    return healthAnalysis;
  }

  private async analyzeResourceUsage(scope: string, target?: string, sessionId?: string): Promise<any> {
    console.error(`📊 Analyzing resource usage - scope: ${scope}, target: ${target}`);
    
    // Placeholder implementation
    return {
      scope,
      target,
      analysis: 'Resource analysis would be implemented with real oc commands',
      timestamp: new Date().toISOString(),
      recommendations: ['Monitor resource usage patterns', 'Consider scaling if needed']
    };
  }

  private async analyzeEvents(namespace?: string, timeRange?: string, eventType?: string, sessionId?: string): Promise<any> {
    console.error(`📋 Analyzing events - namespace: ${namespace}, timeRange: ${timeRange}, type: ${eventType}`);
    
    // Get events
    const events = await this.openshiftClient.getEvents(namespace);
    
    // Filter and analyze events
    const filteredEvents = eventType === 'all' ? events : 
                          events.filter(e => e.type === eventType);
    
    const eventAnalysis = {
      namespace: namespace || 'all',
      timeRange: timeRange || '1h',
      eventType: eventType || 'all',
      totalEvents: filteredEvents.length,
      warningEvents: filteredEvents.filter(e => e.type === 'Warning').length,
      recentPatterns: this.identifyEventPatterns(filteredEvents),
      timestamp: new Date().toISOString()
    };
    
    return eventAnalysis;
  }

  private identifyEventPatterns(events: any[]): any[] {
    // Simple pattern identification
    const patterns = [];
    const reasonCounts = new Map();
    
    events.forEach(event => {
      const count = reasonCounts.get(event.reason) || 0;
      reasonCounts.set(event.reason, count + 1);
    });
    
    // Identify frequent reasons
    reasonCounts.forEach((count, reason) => {
      if (count > 3) {
        patterns.push({
          type: 'frequent_event',
          reason,
          count,
          significance: count > 10 ? 'high' : 'medium'
        });
      }
    });
    
    return patterns;
  }
}
