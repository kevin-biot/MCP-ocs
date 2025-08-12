#!/usr/bin/env node

/**
 * MCP-ocs Main Entry Point - Complete Tool Suite
 * Registers ALL tools: diagnostics, read-ops, state-mgmt, write-ops
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';

import { DiagnosticToolsV2 } from './tools/diagnostics/index.js';
import { ReadOpsTools } from './tools/read-ops/index.js';
import { StateMgmtTools } from './tools/state-mgmt/index.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
import { WorkflowEngine } from './lib/workflow/workflow-engine.js';
import { AutoMemorySystem } from './lib/memory/auto-memory-system.js';
import { KnowledgeSeedingSystem } from './lib/memory/knowledge-seeding-system.js';
import { KnowledgeSeedingTool, KnowledgeToolsSuite } from './tools/memory/knowledge-seeding-tool-v2.js';
import { UnifiedToolRegistry } from './lib/tools/tool-registry.js';

console.error('🚀 Starting MCP-ocs server...');

// Initialize core components
const openshiftClient = new OpenShiftClient({
  ocPath: 'oc',
  timeout: 30000
});

const sharedMemory = new SharedMemoryManager({
  domain: 'mcp-ocs',
  namespace: 'default',
  memoryDir: './memory',
  enableCompression: true,
  retentionDays: 30,
  chromaHost: '127.0.0.1',
  chromaPort: 8000
});

const workflowEngine = new WorkflowEngine({
  enablePanicDetection: true,
  enforcementLevel: 'guidance',
  memoryManager: sharedMemory,
  minEvidenceThreshold: 2
});

// Initialize auto-memory system for intelligent tool tracking
const autoMemory = new AutoMemorySystem(sharedMemory);

// Initialize knowledge seeding system
const knowledgeSeedingSystem = new KnowledgeSeedingSystem(sharedMemory, autoMemory);
const knowledgeSeedingTool = new KnowledgeSeedingTool(knowledgeSeedingSystem);

// Initialize unified tool registry
const toolRegistry = new UnifiedToolRegistry();

// Create ALL tool suites
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);
const readOpsTools = new ReadOpsTools(openshiftClient, sharedMemory);
const stateMgmtTools = new StateMgmtTools(sharedMemory, workflowEngine);
const knowledgeTools = new KnowledgeToolsSuite(knowledgeSeedingTool);

// Register all suites with unified registry
toolRegistry.registerSuite(diagnosticTools);
toolRegistry.registerSuite(readOpsTools);
toolRegistry.registerSuite(stateMgmtTools);
toolRegistry.registerSuite(knowledgeTools);

// Get all tools for MCP registration
const allTools = toolRegistry.getMCPTools();

console.error(`✅ Registered ${allTools.length} tools from all suites`);

// Print registry statistics
const stats = toolRegistry.getStats();
console.error('📈 Registry Stats:', JSON.stringify(stats, null, 2));
console.error('🔧 Debug - Tool names:', allTools.map(t => t.name));

// Create MCP server
const server = new Server(
  {
    name: "mcp-ocs",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools/list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('📋 Listing all available tools...');
  return {
    tools: allTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

// Register tools/call handler with auto-memory integration
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const startTime = Date.now();
  
  console.error(`🔧 Executing tool: ${name}`);
  
  // Check for relevant past context before execution
  const relevantContext = await autoMemory.retrieveRelevantContext(name, args || {});
  if (relevantContext.length > 0) {
    console.error(`🧠 Found ${relevantContext.length} relevant past experiences`);
  }
  
  let result: string;
  let success = true;
  let error: string | undefined;
  
  try {
    // UNIFIED ROUTING - No more prefix checking!
    result = await toolRegistry.executeTool(name, args || {});
    
  } catch (toolError) {
    success = false;
    error = toolError instanceof Error ? toolError.message : 'Unknown error';
    console.error(`❌ Tool execution failed: ${error}`);
    throw new Error(`Tool execution failed: ${error}`);
    
  } finally {
    // Auto-capture this tool execution for future reference
    const duration = Date.now() - startTime;
    const sessionId = (args as any)?.sessionId || `auto-session-${Date.now()}`;
    
    await autoMemory.captureToolExecution({
      toolName: name,
      arguments: args || {},
      result: result!,
      sessionId: sessionId as string,
      timestamp: startTime,
      duration,
      success,
      error
    });
  }
  
  return {
    content: [
      {
        type: 'text',
        text: result!
      }
    ]
  };
});

// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('✅ MCP-ocs server connected and ready!');
