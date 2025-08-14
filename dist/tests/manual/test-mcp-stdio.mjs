#!/usr/bin/env node
/**
 * Simple MCP Server Test - Proper stdio Protocol
 * This shows how MCP should work with stdin/stdout
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
console.error('🚀 Starting MCP stdio server...');
// Create MCP server
const server = new Server({
    name: "test-mcp-ocs",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Add a simple test tool
server.setRequestHandler('tools/list', async () => {
    return {
        tools: [
            {
                name: 'test_tool',
                description: 'A simple test tool',
                inputSchema: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        ]
    };
});
server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;
    if (name === 'test_tool') {
        return {
            content: [
                {
                    type: 'text',
                    text: `Hello! You sent: ${args.message || 'no message'}`
                }
            ]
        };
    }
    throw new Error(`Unknown tool: ${name}`);
});
// Connect to stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('✅ MCP server connected and ready!');
