#!/bin/bash

echo "🎯 BYPASS MODULE ISSUES - Test ChromaDB Fix Directly"
cd /Users/kevinbrown/MCP-ocs

# Build with ES modules
echo "📦 Building with ES module output..."
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

echo "✅ Build complete!"

# Create a simple test that uses dynamic import
cat > test-chromadb-dynamic.mjs << 'EOF'
async function testChromaDB() {
  console.log('🔥 Dynamic Import ChromaDB Test...');
  
  try {
    // Dynamic import to handle module issues
    const { SharedMemoryManager } = await import('./dist/shared-memory.js');
    
    const config = {
      domain: 'test',
      namespace: `test-${Date.now()}`,
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory'
    };

    console.log('📦 Creating memory manager...');
    const manager = new SharedMemoryManager(config);
    
    console.log('🔌 Initializing...');
    await manager.initialize();
    
    console.log('✅ ChromaDB available:', manager.isChromaAvailable());
    
    if (manager.isChromaAvailable()) {
      console.log('💾 Testing operational memory storage...');
      
      const testMemory = {
        incidentId: 'test-001',
        domain: 'test',
        timestamp: Date.now(),
        symptoms: ['Test symptom'],
        rootCause: 'Test cause',
        resolution: 'Test resolution',
        environment: 'test',
        affectedResources: ['test-resource'],
        diagnosticSteps: ['Test step'],
        tags: ['test']
      };

      const id = await manager.storeOperational(testMemory);
      console.log('✅ Stored with ID:', id);
      
      console.log('🎉 CHROMADB FIX WORKS! 🚀');
    } else {
      console.log('❌ ChromaDB not available');
    }
    
    await manager.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testChromaDB();
EOF

echo ""
echo "🧪 Running dynamic import test..."
echo "=================================="
node test-chromadb-dynamic.mjs
echo "=================================="
echo "📋 Test completed!"
