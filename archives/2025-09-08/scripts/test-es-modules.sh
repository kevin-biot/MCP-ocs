#!/bin/bash

echo "🎯 Fix ES Module Issue - Build and Test ChromaDB Properly"
cd /Users/kevinbrown/MCP-ocs

# Clean build
rm -rf dist/
mkdir -p dist

echo "📦 Building with ES modules (to match package.json type: module)..."
npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --target es2020 \
  --module esnext \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --declaration

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful with ES modules!"

# Create test with .mjs extension (explicit ES module)
cat > chromadb-test.mjs << 'EOF'
import { SharedMemoryManager } from './dist/shared-memory.js';

async function testChromaDBFix() {
  console.log('🔥 ChromaDB Integration Test - ES Modules');
  
  try {
    const config = {
      domain: 'test',
      namespace: `test-${Date.now()}`,
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory'
    };

    console.log('📦 Creating SharedMemoryManager...');
    const manager = new SharedMemoryManager(config);
    
    console.log('🔌 Initializing...');
    await manager.initialize();
    
    console.log('✅ ChromaDB available:', manager.isChromaAvailable());
    
    if (!manager.isChromaAvailable()) {
      console.log('❌ ChromaDB not available - check if running');
      return;
    }

    // Test the EXACT operation that was failing: storing operational memory
    console.log('💾 Testing operational memory storage (the failing test)...');
    const testOperationalMemory = {
      incidentId: 'test-chromadb-fix-001',
      domain: 'test',
      timestamp: Date.now(),
      symptoms: ['Pod not starting', 'ImagePullBackOff error'],
      rootCause: 'Invalid image tag',
      resolution: 'Updated image tag in deployment',
      environment: 'test',
      affectedResources: ['test-pod'],
      diagnosticSteps: ['Check pod logs', 'Verify image tag'],
      tags: ['pod', 'image', 'deployment']
    };

    const memoryId = await manager.storeOperational(testOperationalMemory);
    console.log('✅ SUCCESS! Stored operational memory with ID:', memoryId);

    // Test search too
    console.log('🔍 Testing search...');
    const searchResults = await manager.searchOperational('pod not starting', 1);
    console.log('✅ Search results:', searchResults.length);

    if (searchResults.length > 0) {
      console.log('✅ Found memory:', searchResults[0].memory.incidentId);
    }

    await manager.close();
    
    console.log('');
    console.log('🎉 CHROMADB FIX CONFIRMED WORKING! 🚀');
    console.log('✅ Official ChromaDB client successfully replaced manual HTTP calls!');
    
  } catch (error) {
    console.error('❌ ChromaDB test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testChromaDBFix();
EOF

echo ""
echo "🧪 Testing ChromaDB fix with proper ES modules..."
echo "================================================="

node chromadb-test.mjs

echo "================================================="
echo "📋 Test completed!"
