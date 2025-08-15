#!/usr/bin/env node
/**
 * MCP-ocs Beta Entry Point - Validated Tool Subset
 * Registers only production-ready (PRODUCTION/BETA) tools for stable deployments
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { DiagnosticToolsV2 } from './tools/diagnostics/index.js';
import { ReadOpsTools } from './tools/read-ops/index.js';
import { StateMgmtTools } from './tools/state-mgmt/index.js';
import { OpenShiftClient } from './lib/openshift-client.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';
import { WorkflowEngine } from './lib/workflow/workflow-engine.js';
import { AutoMemorySystem } from './lib/memory/auto-memory-system.js';
import { UnifiedToolRegistry } from './lib/tools/tool-registry.js';
import { ToolMaturity } from './types/tool-maturity.js';
console.error('🚀 Starting MCP-ocs server (beta)...');
// Initialize core components
const openshiftClient = new OpenShiftClient({ ocPath: 'oc', timeout: 30000 });
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
const autoMemory = new AutoMemorySystem(sharedMemory);
// Registry and suites
const toolRegistry = new UnifiedToolRegistry();
const diagnosticTools = new DiagnosticToolsV2(openshiftClient, sharedMemory);
const readOpsTools = new ReadOpsTools(openshiftClient, sharedMemory);
const stateMgmtTools = new StateMgmtTools(sharedMemory, workflowEngine);
toolRegistry.registerSuite(diagnosticTools);
toolRegistry.registerSuite(readOpsTools);
toolRegistry.registerSuite(stateMgmtTools);
// Filter to production-ready tools
const betaToolsMCP = toolRegistry.getMCPToolsByMaturity([ToolMaturity.PRODUCTION, ToolMaturity.BETA]);
console.error(`✅ Beta toolset size: ${betaToolsMCP.length}`);
// Create MCP server
const server = new Server({ name: 'mcp-ocs-beta', version: '0.8.0-beta' }, { capabilities: { tools: {} } });
// List only beta tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('📋 Listing beta toolset...');
    return { tools: betaToolsMCP };
});
// Execute tools (routing remains unified)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`🔧 [beta] Executing tool: ${name}`);
    // Note: beta listing ensures only validated tools are exposed to clients
    const result = await toolRegistry.executeTool(name, args || {});
    return { content: [{ type: 'text', text: result }] };
});
// Connect
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('✅ MCP-ocs beta server connected and ready!');
