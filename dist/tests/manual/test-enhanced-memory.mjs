#!/usr/bin/env node
/**
 * ChromaDB + MCP-ocs Integration Test
 * Tests the enhanced memory capabilities
 */
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
console.log('🧠 ChromaDB + MCP-ocs Integration Test');
console.log('=====================================');
// Start MCP-ocs server (should now detect ChromaDB)
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
server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    if (response.includes('ChromaDB')) {
        console.log(`🧠 Memory System: ${response}`);
    }
});
async function testEnhancedMemory() {
    try {
        console.log('🚀 Testing enhanced memory system...\n');
        await setTimeout(3000); // Wait for initialization
        // Test enhanced memory capabilities
        console.log('🔧 Test: Store operational memory');
        sendMCPMessage('tools/call', {
            name: 'memory_store_operational',
            arguments: {
                sessionId: 'enhanced-test',
                incidentId: 'test-incident-001',
                symptoms: ['Pod crashlooping', 'High memory usage', 'Connection timeouts'],
                environment: 'dev',
                affectedResources: ['frontend-pod', 'backend-service']
            }
        });
        await setTimeout(2000);
        console.log('🔧 Test: Search similar incidents');
        sendMCPMessage('tools/call', {
            name: 'memory_search_operational',
            arguments: {
                query: 'pod crashes memory issues',
                limit: 5
            }
        });
        await setTimeout(2000);
        console.log('🔧 Test: Memory statistics');
        sendMCPMessage('tools/call', {
            name: 'memory_get_stats',
            arguments: { detailed: true }
        });
        await setTimeout(2000);
        console.log('\n✅ Enhanced memory tests completed');
    }
    catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    finally {
        server.kill();
        process.exit(0);
    }
}
testEnhancedMemory();
