/**
 * Tool Registry - Central registry for all MCP-ocs tools
 * Implements ADR-004: Tool namespace management
 */

import { ToolCapability } from '../types/common.js';
import { DiagnosticToolsV2 as DiagnosticTools } from '../../tools/diagnostics/index.js';
import { ReadOpsTools } from '../../tools/read-ops/index.js';
import { WriteOpsTools } from '../../tools/write-ops/index.js';
import { StateMgmtTools } from '../../tools/state-mgmt/index.js';

export interface RegisteredTool {
  name: string;
  namespace: string;
  domain: string;
  capability: ToolCapability;
  handler: Function;
  description: string;
  inputSchema: any;
}

export class ToolRegistry {
  private tools = new Map<string, RegisteredTool>();
  private diagnosticTools: DiagnosticTools;
  private readOpsTools: ReadOpsTools;
  private writeOpsTools: WriteOpsTools;
  private stateMgmtTools: StateMgmtTools;

  constructor(
    diagnosticTools: DiagnosticTools,
    readOpsTools: ReadOpsTools, 
    writeOpsTools: WriteOpsTools,
    stateMgmtTools: StateMgmtTools
  ) {
    this.diagnosticTools = diagnosticTools;
    this.readOpsTools = readOpsTools;
    this.writeOpsTools = writeOpsTools;
    this.stateMgmtTools = stateMgmtTools;
    
    this.registerAllTools();
  }

  private registerAllTools(): void {
    // Register enhanced diagnostic tools (v2)
    this.registerTool('oc_diagnostic_cluster_health', 'mcp-openshift', 'cluster', 
      { type: 'diagnostic', level: 'basic', riskLevel: 'safe' },
      this.diagnosticTools.executeTool.bind(this.diagnosticTools, 'oc_diagnostic_cluster_health'),
      'Enhanced cluster health analysis with intelligent issue detection',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          includeNamespaceAnalysis: { type: 'boolean' },
          maxNamespacesToAnalyze: { type: 'number' }
        },
        required: ['sessionId']
      }
    );

    this.registerTool('oc_diagnostic_namespace_health', 'mcp-openshift', 'cluster',
      { type: 'diagnostic', level: 'basic', riskLevel: 'safe' },
      this.diagnosticTools.executeTool.bind(this.diagnosticTools, 'oc_diagnostic_namespace_health'),
      'Comprehensive namespace health analysis with pod, PVC, and route diagnostics',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string' },
          includeIngressTest: { type: 'boolean' },
          deepAnalysis: { type: 'boolean' }
        },
        required: ['sessionId', 'namespace']
      }
    );

    this.registerTool('oc_diagnostic_pod_health', 'mcp-openshift', 'cluster',
      { type: 'diagnostic', level: 'basic', riskLevel: 'safe' },
      this.diagnosticTools.executeTool.bind(this.diagnosticTools, 'oc_diagnostic_pod_health'),
      'Enhanced pod health diagnostics with dependency analysis',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string' },
          podName: { type: 'string' },
          includeDependencies: { type: 'boolean' },
          includeResourceAnalysis: { type: 'boolean' }
        },
        required: ['sessionId', 'namespace', 'podName']
      }
    );

    // Register read-ops tools
    this.registerTool('oc_read_get_pods', 'mcp-openshift', 'cluster',
      { type: 'read', level: 'basic', riskLevel: 'safe' },
      this.readOpsTools.executeTool.bind(this.readOpsTools, 'oc_read_get_pods'),
      'Get pods from a namespace',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          namespace: { type: 'string' }
        },
        required: ['sessionId', 'namespace']
      }
    );

    // Register state management tools
    this.registerTool('core_workflow_state', 'mcp-core', 'system',
      { type: 'read', level: 'basic', riskLevel: 'safe' },
      this.stateMgmtTools.executeTool.bind(this.stateMgmtTools, 'core_workflow_state'),
      'Get current workflow state',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' }
        },
        required: ['sessionId']
      }
    );

    this.registerTool('memory_store_incident', 'mcp-memory', 'knowledge',
      { type: 'write', level: 'basic', riskLevel: 'safe' },
      this.stateMgmtTools.executeTool.bind(this.stateMgmtTools, 'memory_store_incident'),
      'Store incident in operational memory',
      {
        type: 'object',
        properties: {
          sessionId: { type: 'string' },
          incident: { type: 'object' }
        },
        required: ['sessionId', 'incident']
      }
    );
  }

  private registerTool(
    name: string,
    namespace: string,
    domain: string,
    capability: ToolCapability,
    handler: Function,
    description: string,
    inputSchema: any
  ): void {
    const tool: RegisteredTool = {
      name,
      namespace,
      domain,
      capability,
      handler,
      description,
      inputSchema
    };
    
    this.tools.set(name, tool);
  }

  getAvailableTools(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  getToolsByNamespace(namespace: string): RegisteredTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.namespace === namespace);
  }

  getToolsByDomain(domain: string): RegisteredTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.domain === domain);
  }

  /**
   * Register a new tool (public method for v2 tools)
   */
  registerExternalTool(toolDefinition: {
    name: string;
    description: string;
    inputSchema: any;
    handler: Function;
  }): void {
    this.registerTool(
      toolDefinition.name,
      'mcp-v2', // v2 namespace
      'cluster', // default domain
      { type: 'diagnostic', level: 'advanced', riskLevel: 'safe' },
      toolDefinition.handler,
      toolDefinition.description,
      toolDefinition.inputSchema
    );
  }

  async executeTool(name: string, args: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      return await tool.handler(args);
    } catch (error) {
      throw new Error(`Tool execution failed: ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
