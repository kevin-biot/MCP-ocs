#!/bin/bash

echo "🔧 Testing ChromaDB Fix (Round 2)..."

cd /Users/kevinbrown/MCP-ocs

# Clean and rebuild
rm -rf dist/lib/memory
mkdir -p dist/lib/memory

# Set environment for external ChromaDB
export CHROMA_EXTERNAL=1
export CHROMA_HOST=127.0.0.1  
export CHROMA_PORT=8000

echo "📦 Building memory system (fixed TypeScript error)..."

# Compile just the memory system
npx tsc \
  src/lib/memory/shared-memory.ts \
  src/lib/memory/chromadb-client-fixed.ts \
  --outDir dist \
  --declaration \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --allowSyntheticDefaultImports

if [ $? -eq 0 ]; then
  echo "✅ Memory system compiled successfully!"
  
  echo "🧪 Running ChromaDB operational memory test..."
  
  npm test -- \
    --testPathPattern="chroma-integration" \
    --testNamePattern="stores operational memory in ChromaDB" \
    --verbose \
    --detectOpenHandles
    
else
  echo "❌ Compilation still failed - checking specific errors..."
  
  # Check the specific file
  npx tsc --noEmit src/lib/memory/chromadb-client-fixed.ts
fi

echo "🏁 Test completed!"
