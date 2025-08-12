#!/usr/bin/env node

/**
 * Quick test to check if ChromaDB is accessible
 */

console.log('🔍 Checking ChromaDB connectivity...');

try {
  // Test if we can reach ChromaDB HTTP endpoint
  const response = await fetch('http://127.0.0.1:8000/api/v1/heartbeat');
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ ChromaDB is running and accessible!');
    console.log('Heartbeat response:', data);
  } else {
    console.log('⚠️ ChromaDB responded but with error status:', response.status);
  }
} catch (error) {
  console.log('❌ ChromaDB not accessible on port 8000');
  console.log('Error:', error.message);
  console.log('\n🔧 To start ChromaDB:');
  console.log('Option 1: pip install chromadb && chroma run --host 127.0.0.1 --port 8000');
  console.log('Option 2: docker run -p 8000:8000 chromadb/chroma');
}
