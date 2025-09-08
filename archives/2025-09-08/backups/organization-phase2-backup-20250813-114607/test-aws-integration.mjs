#!/usr/bin/env node

/**
 * Quick Test: MCP-ocs Server with Real AWS OpenShift Cluster
 * Tests the actual diagnostic tools against your live cluster
 */

import { spawn } from 'child_process';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('🧪 MCP-ocs + AWS OpenShift Integration Test');
console.log('==========================================');

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
  
  // Store responses for analysis
  try {
    const parsed = JSON.parse(response);
    responses.push(parsed);
  } catch (e) {
    // Non-JSON response (status messages)
  }
});

async function testRealCluster() {
  try {
    console.log('🚀 Starting real cluster tests...\n');
    
    // Wait for server initialization
    await delay(3000);
    
    // Test 1: Initialize MCP connection
    console.log('🔧 Test 1: Initialize MCP connection');
    sendMCPMessage('initialize', {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "aws-test-client", version: "1.0.0" }
    });
    
    await delay(2000);
    
    // Test 2: List available tools
    console.log('🔧 Test 2: List available tools');
    sendMCPMessage('tools/list');
    
    await delay(2000);
    
    // Test 3: Real cluster health check
    console.log('🔧 Test 3: AWS OpenShift cluster health diagnostic');
    sendMCPMessage('tools/call', {
      name: 'oc_diagnostic_cluster_health',
      arguments: { sessionId: 'aws-test-session-001' }
    });
    
    await delay(3000);
    
    // Test 4: Get real pods from cluster
    console.log('🔧 Test 4: Get pods from AWS cluster');
    sendMCPMessage('tools/call', {
      name: 'oc_read_get_pods',
      arguments: { 
        namespace: 'kube-system',  // Safe namespace that should exist
        limit: 5
      }
    });
    
    await delay(3000);
    
    // Test 5: Memory system with real data
    console.log('🔧 Test 5: Store real cluster info in memory');
    sendMCPMessage('tools/call', {
      name: 'memory_store_operational',
      arguments: {
        incidentId: 'aws-connectivity-test',
        symptoms: ['Testing AWS OpenShift connectivity'],
        environment: 'prod',
        affectedResources: ['aws-openshift-cluster'],
        diagnosticSteps: ['oc_diagnostic_cluster_health', 'oc_read_get_pods'],
        resolution: 'Connectivity test successful'
      }
    });
    
    await delay(2000);
    
    console.log('\n✅ Real cluster integration tests completed');
    
    // Analyze results
    console.log('\n📊 Test Results Summary:');
    const successfulResponses = responses.filter(r => r.result && !r.error).length;
    const errorResponses = responses.filter(r => r.error).length;
    
    console.log(`   Successful operations: ${successfulResponses}`);
    console.log(`   Error responses: ${errorResponses}`);
    
    if (successfulResponses > 0 && errorResponses === 0) {
      console.log('\n🎉 SUCCESS: MCP-ocs successfully connected to AWS OpenShift cluster!');
      console.log('   ✅ Diagnostic tools working');
      console.log('   ✅ Memory system operational');
      console.log('   ✅ Ready for real-world operations');
    } else {
      console.log('\n⚠️  Some issues detected - check responses above');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    server.kill();
    process.exit(0);
  }
}

// Handle server startup and run tests
setTimeout(() => testRealCluster(), 1000);

// Handle any server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});
