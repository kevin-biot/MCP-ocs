/**
 * MCP-ocs Main Entry Point
 * 
 * Initializes the Model Context Protocol server for OpenShift operations and diagnostics.
 */

import express from 'express';
import { createServer } from 'http';
import { MCPServer } from '@modelcontextprotocol/sdk/server.js';
import { VectorMemoryManager } from './lib/memory/vector-memory-manager.js';
import { ToolExecutionTracker } from './lib/tools/tool-execution-tracker.js';
import { DiagnosticToolsV2 } from './tools/diagnostics/index.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';

// Initialize core components
const memoryManager = new VectorMemoryManager();
const toolTracker = new ToolExecutionTracker(memoryManager);
const openshiftClient = new OpenShiftClient();
const sharedMemory = new SharedMemoryManager();

// Create the main diagnostic tools system
const diagnosticTools = new DiagnosticToolsV2(
  openshiftClient,
  sharedMemory
);

// Setup Express server with MCP protocol
const app = express();
const server = createServer(app);

// Initialize MCP server with our diagnostic tools
const mcpServer = new MCPServer({
  server,
  tools: diagnosticTools.getTools(),
  toolExecutionTracker: toolTracker
});

// Start the server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Initialize the memory system
    console.log('Initializing MCP-ocs memory system...');
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 MCP-ocs server running on port ${PORT}`);
      console.log('📊 Tool memory system initialized with vector storage');
      console.log('🔍 All tool executions will be automatically stored and tagged');
    });
    
    // Setup cleanup on shutdown
    process.on('SIGINT', async () => {
      console.log('Shutting down MCP-ocs server...');
      await toolTracker.cleanupOldExecutions(1); // Cleanup memories from last day
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start MCP-ocs server:', error);
    process.exit(1);
  }
}

// Start the application
startServer();

export { mcpServer, memoryManager, toolTracker };