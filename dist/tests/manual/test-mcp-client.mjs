#!/usr/bin/env node
/**
 * Simple MCP Client Test for MCP-ocs
 * Tests the running MCP-ocs server via stdio protocol
 */
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
console.log('🧪 MCP-ocs Client Test');
console.log('======================');
// Start MCP-ocs server as child process
const server = spawn('node', ['dist/index.js'], {
    cwd: '/Users/kevinbrown/MCP-ocs',
    stdio: ['pipe', 'pipe', 'inherit']
});
let messageId = 1;
// Function to send MCP message
function sendMCPMessage(method, params = {}) {
    const message = {
        jsonrpc: "2.0",
        id: messageId++,
        method: method,
        params: params
    };
    console.log(`📤 Sending: ${method}`);
    server.stdin.write(JSON.stringify(message) + '\n');
}
// Listen for responses
server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log(`📥 Response: ${response}`);
});
server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
});
// Test sequence
async function runTests() {
    try {
        console.log('🚀 Starting MCP protocol tests...\n');
        // Wait for server to initialize
        await setTimeout(2000);
        // Test 1: Initialize
        console.log('🔧 Test 1: Initialize connection');
        sendMCPMessage('initialize', {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "test-client", version: "1.0.0" }
        });
        await setTimeout(1000);
        // Test 2: List tools
        console.log('🔧 Test 2: List available tools');
        sendMCPMessage('tools/list');
        await setTimeout(1000);
        // Test 3: Call a diagnostic tool
        console.log('🔧 Test 3: Execute cluster health diagnostic');
        sendMCPMessage('tools/call', {
            name: 'oc_diagnostic_cluster_health',
            arguments: { sessionId: 'test-session-123' }
        });
        await setTimeout(2000);
        console.log('\n✅ Test sequence completed');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    finally {
        server.kill();
        process.exit(0);
    }
}
// Start tests
runTests();
