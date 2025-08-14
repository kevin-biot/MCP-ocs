#!/usr/bin/env node
/**
 * Memory System Test - Check what's actually working
 */
import { spawn } from 'child_process';
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
console.log('🧪 Testing MCP-ocs Memory Functions');
console.log('===================================');
// Start MCP-ocs server
const server = spawn('node', ['dist/index.js'], {
    cwd: '/Users/kevinbrown/MCP-ocs',
    stdio: ['pipe', 'pipe', 'inherit']
});
let messageId = 1;
function sendMCPMessage(method, params = {}) {
    const message = {
        jsonrpc: "2.0",
        id: messageId++,
        method: method,
        params: params
    };
    console.log(`📤 ${method}`);
    server.stdin.write(JSON.stringify(message) + '\n');
}
let responses = [];
server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log(`📥 ${response}`);
    try {
        const parsed = JSON.parse(response);
        responses.push(parsed);
    }
    catch (e) {
        // Non-JSON response
    }
});
async function testMemoryFunctions() {
    try {
        console.log('🚀 Starting memory function tests...\n');
        // Wait for server initialization
        await delay(3000);
        // Test 1: Initialize MCP connection
        console.log('🔧 Test 1: Initialize MCP connection');
        sendMCPMessage('initialize', {
            protocolVersion: "2024-11-05",
            capabilities: {},
            clientInfo: { name: "memory-test-client", version: "1.0.0" }
        });
        await delay(2000);
        // Test 2: Store something in memory
        console.log('🔧 Test 2: Store operational memory');
        sendMCPMessage('tools/call', {
            name: 'memory_store_operational',
            arguments: {
                incidentId: 'memory-test-001',
                symptoms: ['Testing memory storage functionality'],
                environment: 'test',
                sessionId: 'memory-test-session'
            }
        });
        await delay(3000);
        // Test 3: Search for what we just stored
        console.log('🔧 Test 3: Search operational memory');
        sendMCPMessage('tools/call', {
            name: 'memory_search_operational',
            arguments: {
                query: 'memory storage functionality',
                sessionId: 'memory-test-session'
            }
        });
        await delay(3000);
        // Test 4: Get memory stats
        console.log('🔧 Test 4: Get memory statistics');
        sendMCPMessage('tools/call', {
            name: 'memory_get_stats',
            arguments: {
                detailed: true
            }
        });
        await delay(3000);
        // Test 5: Check workflow state
        console.log('🔧 Test 5: Check workflow state');
        sendMCPMessage('tools/call', {
            name: 'core_workflow_state',
            arguments: {
                sessionId: 'memory-test-session'
            }
        });
        await delay(2000);
        console.log('\n✅ Memory function tests completed');
        console.log('\n📊 Results Analysis:');
        const successfulResponses = responses.filter(r => r.result && !r.error).length;
        const errorResponses = responses.filter(r => r.error).length;
        console.log(`   Successful operations: ${successfulResponses}`);
        console.log(`   Error responses: ${errorResponses}`);
        if (successfulResponses >= 4) {
            console.log('\n🎉 MEMORY SYSTEM: Working well!');
        }
        else {
            console.log('\n⚠️  MEMORY SYSTEM: Needs attention');
            console.log('   Check if vector database is properly configured');
        }
    }
    catch (error) {
        console.error('❌ Memory test failed:', error.message);
    }
    finally {
        server.kill();
        process.exit(0);
    }
}
// Start memory function tests
setTimeout(() => testMemoryFunctions(), 1000);
// Handle any server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
});
