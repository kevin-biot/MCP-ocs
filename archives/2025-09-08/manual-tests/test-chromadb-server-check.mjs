#!/usr/bin/env node

// Quick test to check ChromaDB server configuration and memory storage
import { ChromaClient } from 'chromadb';

async function testChromaDBSetup() {
  console.log('🔍 Testing ChromaDB server configuration...');
  
  try {
    // Create ChromaClient instance
    const client = new ChromaClient({
      host: '127.0.0.1',
      port: 8000
    });
    
    console.log('✓ ChromaDB client created successfully');
    
    // Test heartbeat
    console.log('📡 Testing server connection...');
    const heartbeat = await client.heartbeat();
    console.log('✓ Server heartbeat successful:', heartbeat);
    
    // Test collection creation (without embedding function)
    console.log('📁 Testing collection creation...');
    const collectionName = 'test_memory_collection';
    
    // Try to get existing collection first
    try {
      const existingCollection = await client.getCollection({ name: collectionName });
      console.log('✓ Found existing collection:', existingCollection.name);
    } catch (error) {
      console.log('ℹ No existing collection found, creating new one...');
      const newCollection = await client.createCollection({
        name: collectionName,
        metadata: {
          "hnsw:space": "cosine"
        }
      });
      console.log('✓ Created new collection:', newCollection.name);
    }
    
    // Test adding a simple document (this should trigger embedding generation if server supports it)
    console.log('📝 Testing document storage...');
    
    const testDocument = "This is a test conversation document for memory storage";
    
    const collection = await client.getCollection({ name: collectionName });
    
    // Add document - this should work if server handles embeddings
    await collection.add({
      ids: ['test_123'],
      documents: [testDocument],
      metadatas: [{
        test_id: 'test_123',
        timestamp: Date.now()
      }]
    });
    
    console.log('✓ Successfully stored test document');
    
    // Try querying
    console.log('🔍 Testing query functionality...');
    const results = await collection.query({
      queryTexts: ['test conversation'],
      nResults: 1
    });
    
    console.log('✓ Query successful with', results.documents[0]?.length || 0, 'results');
    
    // Clean up test collection
    console.log('🗑️ Cleaning up test collection...');
    await client.deleteCollection({ name: collectionName });
    
    console.log('✅ All tests passed - ChromaDB server is properly configured');
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error.message);
    console.error('Error details:', error);
    
    // Provide more specific debugging info
    if (error.message.includes('Embedding function must be defined')) {
      console.log('\n🚨 Root cause identified:');
      console.log('The ChromaDB server does not appear to be configured for automatic embeddings');
      console.log('You need to either:');
      console.log('1. Configure the ChromaDB server to handle embeddings automatically');
      console.log('2. Use client-side embedding functions');
    }
    
    return false;
  }
  
  return true;
}

// Run the test
testChromaDBSetup().catch(console.error);