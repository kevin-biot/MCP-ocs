#!/usr/bin/env node

/**
 * Quick test of the fixed ChromaDB client
 */

import { ChromaDBClientFixed } from './src/lib/memory/chromadb-client-fixed.js';

async function testChromaDBClient() {
  console.log('🧪 Testing ChromaDB Official Client...');
  
  const client = new ChromaDBClientFixed('127.0.0.1', 8000);
  
  try {
    await client.initialize();
    
    if (client.isChromaAvailable()) {
      console.log('✅ ChromaDB client initialization successful!');
      
      // Test creating a collection
      await client.createCollection('test_collection');
      console.log('✅ Collection creation successful!');
      
      // Test adding documents
      const testDocs = [{
        content: 'This is a test document for storage verification',
        metadata: { test: true, timestamp: Date.now() }
      }];
      
      await client.addDocuments('test_collection', testDocs);
      console.log('✅ Document storage successful!');
      
      // Test querying
      const results = await client.queryCollection('test_collection', 'test document', 1);
      console.log('✅ Query successful! Results:', results.length);
      
      console.log('🎉 All ChromaDB operations successful!');
    } else {
      console.log('❌ ChromaDB not available - check if server is running');
    }
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error);
  }
}

testChromaDBClient().catch(console.error);
