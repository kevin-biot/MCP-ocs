#!/usr/bin/env node

/**
 * MCP-ocs Main Entry Point - JavaScript Version
 * Bypassing TypeScript issues entirely
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { DiagnosticToolsV2 } from './dist/tools/diagnostics/index.js';
import { OpenShiftClient } from './dist/lib/openshift-client.js';
import { SharedMemoryManager } from './dist/lib/memory/shared-memory.js';

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
  retentionDays: 30
});

// Create the main diagnostic tools system
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);

// Get the tools from our diagnostic suite
const tools = diagnosticTools.getTools();

// Create MCP server using the EXACT same pattern as the working test server
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

// Use the EXACT same setRequestHandler pattern that works in test-mcp-stdio.mjs
server.setRequestHandler('tools/list', async () => {
  console.error('📋 Listing available tools...');
  return {
    tools: tools.map(tool => ({
      name: tool.fullName,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`🔧 Executing tool: ${name}`);
  
  try {
    const result = await diagnosticTools.executeTool(name, args || {});
    
    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Tool execution failed: ${errorMessage}`);
    
    throw new Error(`Tool execution failed: ${errorMessage}`);
  }
});

// Connect to stdio transport using the EXACT same pattern
const transport = new StdioServerTransport();
await server.connect(transport);

console.error('✅ MCP-ocs server connected and ready!');
