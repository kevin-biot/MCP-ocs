#!/usr/bin/env node

/**
 * Test Script: ChromaDB Server-Side Embeddings Configuration
 * Based on CODEX's ensureServerSideEmbeddings function
 */

async function ensureServerSideEmbeddings(name, host = '127.0.0.1', port = 8000) {
  const base = `http://${host}:${port}/api/v2`;
  
  console.log(`🔧 Testing server-side embeddings for collection: ${name}`);
  console.log(`📡 ChromaDB server: ${base}`);
  
  try {
    const payload = {
      name,
      embedding_function: {
        type: 'known',
        name: 'sentence-transformers',
        config: { model: 'all-MiniLM-L6-v2' }
      }
    };
    
    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
    
    // FIXED: Use correct API path with tenant/database
    const res = await fetch(`${base}/tenants/default/databases/default/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log(`📥 Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok && res.status !== 409) {
      const txt = await res.text().catch(() => '');
      console.log(`⚠️  Server-side embedding config not applied: ${res.status} ${txt}`);
      return false;
    } else if (res.status === 409) {
      console.log('ℹ️  Collection already exists - checking configuration...');
      
      // Check existing collection configuration
      const checkRes = await fetch(`${base}/tenants/default/databases/default/collections`);
      const collections = await checkRes.json();
      const targetCollection = collections.find(c => c.name === name);
      
      if (targetCollection) {
        console.log('📋 Existing collection config:', JSON.stringify(targetCollection.configuration_json, null, 2));
        const hasEmbedding = targetCollection.configuration_json?.embedding_function !== null;
        console.log(hasEmbedding ? '✅ Collection has embedding function' : '❌ Collection missing embedding function');
        return hasEmbedding;
      }
    } else {
      const responseData = await res.json().catch(() => ({}));
      console.log('✅ Server-side embedding function ensured for collection');
      console.log('📋 Response data:', JSON.stringify(responseData, null, 2));
      return true;
    }
  } catch (e) {
    console.log('❌ Could not reach Chroma v2 API for embedding config:', e.message);
    return false;
  }
}

async function testMultipleCollections() {
  console.log('🧪 Testing ChromaDB Server-Side Embeddings Configuration');
  console.log('=' .repeat(60));
  
  const testCollections = [
    'test_embedding_new',
    'llm_conversation_memory', 
    'operational',
    'conversations'
  ];
  
  for (const collectionName of testCollections) {
    console.log(`\n🔍 Testing collection: ${collectionName}`);
    console.log('-'.repeat(40));
    
    const success = await ensureServerSideEmbeddings(collectionName);
    console.log(`Result: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  
  console.log('\n📊 Final ChromaDB Collections Status:');
  console.log('=' .repeat(60));
  
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v2/tenants/default/databases/default/collections');
    const collections = await res.json();
    
    collections.forEach(collection => {
      const hasEmbedding = collection.configuration_json?.embedding_function !== null;
      const embeddingType = hasEmbedding ? 
        collection.configuration_json.embedding_function.name : 
        'NONE';
      
      console.log(`📋 ${collection.name}: ${hasEmbedding ? '✅' : '❌'} (${embeddingType})`);
    });
  } catch (error) {
    console.error('❌ Failed to get final status:', error.message);
  }
}

// Run the test
testMultipleCollections()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
