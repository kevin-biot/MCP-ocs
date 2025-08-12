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
import { KnowledgeSeedingTool } from './tools/memory/knowledge-seeding-tool.js';

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

// Create ALL tool suites
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);
const readOpsTools = new ReadOpsTools(openshiftClient, sharedMemory);
const stateMgmtTools = new StateMgmtTools(sharedMemory, workflowEngine);

// Combine all tools including knowledge seeding
const allTools = [
  ...diagnosticTools.getTools(),
  ...readOpsTools.getTools(), 
  ...stateMgmtTools.getTools(),
  knowledgeSeedingTool  // Add knowledge seeding capability
];

console.error(`✅ Registered ${allTools.length} tools from all suites`);

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
      name: tool.fullName,
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
    // Route to appropriate tool suite
    if (name.startsWith('oc_diagnostic_')) {
      result = await diagnosticTools.executeTool(name, args || {});
    } else if (name.startsWith('oc_read_')) {
      result = await readOpsTools.executeTool(name, args || {});
    } else if (name.startsWith('memory_') || name.startsWith('core_')) {
      result = await stateMgmtTools.executeTool(name, args || {});
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
    
  } catch (toolError) {
    success = false;
    error = toolError instanceof Error ? toolError.message : 'Unknown error';
    console.error(`❌ Tool execution failed: ${error}`);
    throw new Error(`Tool execution failed: ${error}`);
    
  } finally {
    // Auto-capture this tool execution for future reference
    const duration = Date.now() - startTime;
    const sessionId = args?.sessionId || `auto-session-${Date.now()}`;
    
    await autoMemory.captureToolExecution({
      toolName: name,
      arguments: args || {},
      result: result!,
      sessionId,
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
