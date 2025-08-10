#!/usr/bin/env node

/**
 * MCP-ocs: OpenShift Container Platform Operations and Diagnostics Server
 * 
 * Architecture follows ADRs:
 * - ADR-001: OpenShift CLI wrapper approach (Phase 1)
 * - ADR-003: ChromaDB + JSON hybrid memory system  
 * - ADR-004: Tool namespace management with context-aware filtering
 * - ADR-005: Workflow state machine with panic detection
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { OpenShiftClient } from "./lib/openshift-client.js";
import { SharedMemoryManager } from "./lib/memory/shared-memory.js";
import { ToolNamespaceManager } from "./lib/tools/namespace-manager.js";
import { WorkflowEngine } from "./lib/workflow/workflow-engine.js";
import { ConfigManager } from "./lib/config/config-manager.js";
import { ToolRegistry } from "./lib/tools/tool-registry.js";

// Core tool implementations
import { DiagnosticTools } from "./tools/diagnostics/index.js";
import { ReadOpsTools } from "./tools/read-ops/index.js";
import { WriteOpsTools } from "./tools/write-ops/index.js";
import { StateMgmtTools } from "./tools/state-mgmt/index.js";

const server = new Server(
  {
    name: "mcp-ocs",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Global instances
let configManager: ConfigManager;
let memoryManager: SharedMemoryManager;
let openshiftClient: OpenShiftClient;
let namespaceManager: ToolNamespaceManager;
let workflowEngine: WorkflowEngine;
let toolRegistry: ToolRegistry;

/**
 * Initialize the MCP server with all architectural components
 */
async function initialize(): Promise<void> {
  try {
    // 1. Load configuration
    configManager = new ConfigManager();
    await configManager.load();
    
    // 2. Initialize memory system (ADR-003)
    memoryManager = new SharedMemoryManager({
      domain: 'openshift',
      namespace: configManager.get('memory.namespace', 'mcp-ocs'),
      chromaHost: configManager.get('memory.chromaHost', '127.0.0.1'),
      chromaPort: configManager.get('memory.chromaPort', 8000),
      memoryDir: configManager.get('memory.jsonDir', './logs/memory'),
      enableCompression: configManager.get('memory.compression', true)
    });
    
    await memoryManager.initialize();
    
    // 3. Initialize OpenShift client (ADR-001)
    openshiftClient = new OpenShiftClient({
      ocPath: configManager.get('openshift.ocPath', 'oc'),
      kubeconfig: configManager.get('openshift.kubeconfig'),
      context: configManager.get('openshift.context'),
      namespace: configManager.get('openshift.defaultNamespace'),
      timeout: configManager.get('openshift.timeout', 30000)
    });
    
    await openshiftClient.validateConnection();
    
    // 4. Initialize tool namespace management (ADR-004)
    namespaceManager = new ToolNamespaceManager({
      mode: configManager.get('tools.mode', 'single'), // single | team | router
      enabledDomains: configManager.get('tools.enabledDomains', ['cluster', 'filesystem', 'knowledge']),
      contextFiltering: configManager.get('tools.contextFiltering', true)
    });
    
    // 5. Initialize workflow engine (ADR-005)
    workflowEngine = new WorkflowEngine({
      enablePanicDetection: configManager.get('workflow.panicDetection', true),
      enforcementLevel: configManager.get('workflow.enforcement', 'guidance'), // guidance | blocking
      memoryManager,
      minEvidenceThreshold: configManager.get('workflow.minEvidence', 2)
    });
    
    // 6. Initialize and register tools
    // Create tool instances first
    const diagnosticTools = new DiagnosticTools(openshiftClient, memoryManager);
    const readOpsTools = new ReadOpsTools(openshiftClient, memoryManager);
    const writeOpsTools = new WriteOpsTools(openshiftClient, memoryManager, workflowEngine);
    const stateMgmtTools = new StateMgmtTools(memoryManager, workflowEngine);
    
    toolRegistry = new ToolRegistry(diagnosticTools, readOpsTools, writeOpsTools, stateMgmtTools);
    // Tools are registered automatically in constructor
    
    console.error('✅ MCP-ocs initialized successfully');
    console.error(`📁 Memory system: ${memoryManager.isChromaAvailable() ? 'ChromaDB + JSON' : 'JSON fallback'}`);
    console.error(`🔧 Tool mode: ${namespaceManager.getCurrentMode()}`);
    console.error(`🔄 Workflow enforcement: ${workflowEngine.getEnforcementLevel()}`);
    
  } catch (error) {
    console.error('❌ Failed to initialize MCP-ocs:', error);
    process.exit(1);
  }
}

// Tool registration now handled in ToolRegistry constructor

/**
 * List available tools (filtered by namespace and context)
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  try {
    const availableTools = toolRegistry.getAvailableTools();
    
    // Store tool listing in memory for analytics
    await memoryManager.storeOperational({
      incidentId: `tool-list-${Date.now()}`,
      domain: 'system',
      timestamp: Date.now(),
      symptoms: ['tool_discovery_request'],
      affectedResources: [],
      diagnosticSteps: [`Listed ${availableTools.length} available tools`],
      tags: ['tool_discovery', 'system_health'],
      environment: configManager.get('environment', 'dev') as any
    });
    
    return {
      tools: availableTools.map((tool: any) => ({
        name: tool.fullName,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  } catch (error) {
    console.error('Error listing tools:', error);
    throw error;
  }
});

/**
 * Execute tool calls with workflow enforcement and memory storage
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name: toolName, arguments: args } = request.params;
  const sessionId: string = (args?.sessionId as string) || `session-${Date.now()}`;
  
  try {
    // 1. Workflow enforcement check (ADR-005)
    const workflowResponse = await workflowEngine.processToolRequest(sessionId, {
      name: toolName,
      arguments: args,
      timestamp: new Date(),
      domain: 'cluster'
    });
    
    // 2. Handle workflow blocking/guidance
    if (workflowResponse.blocked) {
      return {
        content: [{
          type: "text",
          text: `🛑 Operation blocked by workflow engine\\n\\n${workflowResponse.interventionMessage}`
        }]
      };
    }
    
    if (workflowResponse.warning) {
      console.error(`⚠️ Workflow warning: ${workflowResponse.cautionMessage}`);
    }
    
    // 3. Execute the tool
    const toolResult = await toolRegistry.executeTool(toolName, args);
    
    // 4. Store conversation memory (ADR-003)
    await memoryManager.storeConversation({
      sessionId: sessionId,
      domain: 'openshift',
      timestamp: Date.now(),
      userMessage: `Tool call: ${toolName}`,
      assistantResponse: JSON.stringify(toolResult, null, 2),
      context: await extractContext(toolName, args, toolResult),
      tags: await generateTags(toolName, args, toolResult)
    });
    
    // 5. Format response with workflow guidance
    const responseText = formatToolResponse(toolResult, workflowResponse);
    
    return {
      content: [{
        type: "text", 
        text: responseText
      }]
    };
    
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    
    // Store error in memory for pattern analysis
    await memoryManager.storeOperational({
      incidentId: `error-${sessionId}-${Date.now()}`,
      domain: 'system',
      timestamp: Date.now(),
      symptoms: [`Tool execution error: ${toolName}`],
      rootCause: error instanceof Error ? error.message : 'Unknown error',
      affectedResources: [],
      diagnosticSteps: [`Failed to execute ${toolName} with args: ${JSON.stringify(args)}`],
      tags: ['tool_error', 'system_issue', toolName],
      environment: configManager.get('environment', 'dev') as any
    });
    
    return {
      content: [{
        type: "text",
        text: `❌ Error executing ${toolName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
});

/**
 * List available resources (cluster state, memory, etc.)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const resources = [];
    
    // OpenShift cluster resources
    const clusterInfo = await openshiftClient.getClusterInfo();
    resources.push({
      uri: "cluster://info",
      name: "Cluster Information",
      description: "Current OpenShift cluster status and metadata",
      mimeType: "application/json"
    });
    
    // Memory resources
    const memoryStats = await memoryManager.getStats();
    resources.push({
      uri: "memory://stats",
      name: "Memory System Statistics", 
      description: "Current memory system status and usage",
      mimeType: "application/json"
    });
    
    // Workflow state
    resources.push({
      uri: "workflow://state",
      name: "Current Workflow State",
      description: "Active workflow sessions and states",
      mimeType: "application/json"
    });
    
    return { resources };
  } catch (error) {
    console.error('Error listing resources:', error);
    return { resources: [] };
  }
});

/**
 * Read resource content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  try {
    if (uri === "cluster://info") {
      const clusterInfo = await openshiftClient.getClusterInfo();
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(clusterInfo, null, 2)
        }]
      };
    }
    
    if (uri === "memory://stats") {
      const memoryStats = await memoryManager.getStats();
      return {
        contents: [{
          uri,
          mimeType: "application/json", 
          text: JSON.stringify(memoryStats, null, 2)
        }]
      };
    }
    
    if (uri === "workflow://state") {
      const workflowState = await workflowEngine.getActiveStates();
      return {
        contents: [{
          uri,
          mimeType: "application/json",
          text: JSON.stringify(workflowState, null, 2)
        }]
      };
    }
    
    throw new Error(`Unknown resource: ${uri}`);
    
  } catch (error) {
    console.error(`Error reading resource ${uri}:`, error);
    throw error;
  }
});

/**
 * Helper functions
 */

async function extractContext(toolName: string, args: any, result: any): Promise<string[]> {
  const context: string[] = [toolName];
  
  // Extract OpenShift-specific context
  if (args.namespace) context.push(args.namespace);
  if (args.name) context.push(args.name);
  if (args.selector) context.push(args.selector);
  
  // Extract resource types from tool name
  const resourceTypes = ['pod', 'deployment', 'service', 'route', 'configmap', 'secret'];
  resourceTypes.forEach(type => {
    if (toolName.toLowerCase().includes(type)) {
      context.push(type);
    }
  });
  
  return context;
}

async function generateTags(toolName: string, args: any, result: any): Promise<string[]> {
  const tags: string[] = [];
  
  // Operation type tags
  if (toolName.includes('get') || toolName.includes('list') || toolName.includes('describe')) {
    tags.push('read_operation');
  } else if (toolName.includes('apply') || toolName.includes('create') || toolName.includes('update')) {
    tags.push('write_operation');
  } else if (toolName.includes('delete')) {
    tags.push('delete_operation');
  }
  
  // Domain tags
  tags.push('openshift', 'kubernetes');
  
  // Environment tag
  const environment = configManager.get('environment', 'dev');
  tags.push(environment);
  
  return tags;
}

function formatToolResponse(toolResult: any, workflowResponse: any): string {
  let response = '';
  
  // Add workflow guidance if present
  if (workflowResponse.workflowGuidance) {
    response += `🧭 **Workflow Guidance**: ${workflowResponse.workflowGuidance}\\n\\n`;
  }
  
  // Add current workflow state
  if (workflowResponse.currentState) {
    response += `📊 **Current State**: ${workflowResponse.currentState}\\n\\n`;
  }
  
  // Add tool result
  if (typeof toolResult === 'string') {
    response += toolResult;
  } else {
    response += JSON.stringify(toolResult, null, 2);
  }
  
  // Add next recommended actions
  if (workflowResponse.nextRecommendedActions?.length > 0) {
    response += '\\n\\n🎯 **Next Recommended Actions**:\\n';
    workflowResponse.nextRecommendedActions.forEach((action: string, index: number) => {
      response += `${index + 1}. ${action}\\n`;
    });
  }
  
  return response;
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  await initialize();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('🚀 MCP-ocs server running on stdio');
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.error('\\n🛑 Received SIGINT, shutting down gracefully...');
  
  if (memoryManager) {
    await memoryManager.close();
  }
  
  if (openshiftClient) {
    await openshiftClient.close();
  }
  
  console.error('✅ Shutdown complete');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
