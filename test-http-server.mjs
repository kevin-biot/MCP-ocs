#!/usr/bin/env node

/**
 * HTTP-based Test for MCP-ocs Server
 * Tests the server running on port 3000
 */

import fetch from 'node-fetch';

console.log('🧪 Testing MCP-ocs HTTP Server');
console.log('============================');

async function testHttpServer() {
  try {
    // Test 1: Basic health check
    console.log('🔧 Test 1: Server health check');
    const response = await fetch('http://localhost:3000/health');
    
    if (response.ok) {
      console.log('✅ Server is responding');
    } else {
      console.log('⚠️ Server responded with:', response.status);
    }
    
    // Test 2: Try to find any available endpoints
    console.log('🔧 Test 2: Testing root endpoint');
    const rootResponse = await fetch('http://localhost:3000/');
    console.log('Root response status:', rootResponse.status);
    
    // Test 3: Look for MCP endpoints
    console.log('🔧 Test 3: Looking for MCP endpoints');
    const possibleEndpoints = ['/mcp', '/tools', '/api/tools', '/rpc'];
    
    for (const endpoint of possibleEndpoints) {
      try {
        const endpointResponse = await fetch(`http://localhost:3000${endpoint}`);
        console.log(`${endpoint}: ${endpointResponse.status}`);
      } catch (error) {
        console.log(`${endpoint}: Connection failed`);
      }
    }
    
  } catch (error) {
    console.error('❌ HTTP test failed:', error.message);
    console.log('💡 Make sure the server is running: npm start');
  }
}

await testHttpServer();
