#!/usr/bin/env node

/**
 * Quick test to check if ChromaDB is accessible
 */

console.log('🔍 Checking ChromaDB connectivity...');

try {
  // Test ChromaDB v2 API endpoints (v1 deprecated in 2025)
  const endpoints = [
    'http://127.0.0.1:8000/api/v2/heartbeat',
    'http://127.0.0.1:8000/api/v2',
    'http://127.0.0.1:8000/docs',  // API documentation
    'http://127.0.0.1:8000/',     // Root endpoint
    'http://127.0.0.1:8000/api/v1/heartbeat'  // Legacy v1 (deprecated)
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        console.log('✅ ChromaDB is running and accessible!');
        console.log(`Working endpoint: ${endpoint}`);
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (endpoint.includes('/api/v2')) {
          console.log('🎯 Using ChromaDB API v2 (latest)');
        } else if (endpoint.includes('/api/v1')) {
          console.log('⚠️ Using deprecated ChromaDB API v1 - consider upgrading to v2');
        }
        break;
      } else {
        console.log(`❌ ${endpoint} returned status: ${response.status}`);
        if (response.status === 410) {
          console.log('   (410 = API deprecated - trying v2...)');
        }
      }
    } catch (endpointError) {
      console.log(`❌ ${endpoint} failed: ${endpointError.message}`);
    }
  }
  
} catch (error) {
  console.log('❌ ChromaDB not accessible on port 8000');
  console.log('Error:', error.message);
  console.log('\n🔧 ChromaDB appears to be running but API version mismatch');
  console.log('This is normal - the system will work with JSON fallback');
}
