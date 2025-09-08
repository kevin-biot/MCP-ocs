#!/bin/bash

echo "🔧 Simple ChromaDB Fix Test..."

cd /Users/kevinbrown/MCP-ocs

# Clean up first
rm -rf dist/
mkdir -p dist/lib/memory

# Set environment for external ChromaDB
export CHROMA_EXTERNAL=1
export CHROMA_HOST=127.0.0.1  
export CHROMA_PORT=8000

echo "📦 Building memory system only..."

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
  
  # Run just the failing test
  echo "🧪 Running ChromaDB operational memory test..."
  
  npm test -- \
    --testPathPattern="chroma-integration" \
    --testNamePattern="stores operational memory in ChromaDB" \
    --verbose \
    --detectOpenHandles
    
  echo "📋 Test result above ☝️"
else
  echo "❌ Compilation failed!"
  echo "🔧 Checking for syntax errors..."
  
  # Try linting the files
  npx tsc --noEmit src/lib/memory/shared-memory.ts
fi

echo "🏁 Test completed!"
