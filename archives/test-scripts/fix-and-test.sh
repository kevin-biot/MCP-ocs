#!/bin/bash

echo "🔧 Fix Import Path and Test ChromaDB"
cd /Users/kevinbrown/MCP-ocs

# Clean build
rm -rf dist/
mkdir -p dist

echo "📦 Rebuilding with fixed import paths..."
npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --target es2020 \
  --module esnext \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful!"

# Check what was built
echo "📁 Built files:"
ls -la dist/

echo ""
echo "🧪 Testing ChromaDB fix..."
echo "=========================="

# Simple direct test
cat > test-simple.mjs << 'EOF'
async function test() {
  try {
    console.log('🔥 Testing ChromaDB integration...');
    
    const { SharedMemoryManager } = await import('./dist/shared-memory.js');
    
    const config = {
      domain: 'test',
      namespace: 'test-simple',
      chromaHost: '127.0.0.1',
      chromaPort: 8000,
      memoryDir: './test-memory'
    };

    const manager = new SharedMemoryManager(config);
    await manager.initialize();
    
    console.log('✅ ChromaDB available:', manager.isChromaAvailable());
    
    if (manager.isChromaAvailable()) {
      // Test the exact operation that was failing
      const testMemory = {
        incidentId: 'test-001',
        domain: 'test', 
        timestamp: Date.now(),
        symptoms: ['Test symptom'],
        environment: 'test',
        affectedResources: [],
        diagnosticSteps: [],
        tags: ['test']
      };

      const result = await manager.storeOperational(testMemory);
      console.log('✅ SUCCESS! Stored operational memory:', result);
      console.log('🎉 CHROMADB FIX CONFIRMED WORKING! 🚀');
    }
    
    await manager.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
EOF

node test-simple.mjs

echo "=========================="
echo "📋 Test completed!"
