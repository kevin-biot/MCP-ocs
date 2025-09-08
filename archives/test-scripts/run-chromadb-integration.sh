#!/bin/bash

echo "🔧 Running ChromaDB Integration Test..."

cd /Users/kevinbrown/MCP-ocs

# Set environment to use external ChromaDB
export CHROMA_EXTERNAL=1
export CHROMA_HOST=127.0.0.1
export CHROMA_PORT=8000

# Build only the memory components we need
echo "📦 Building memory system..."
npx tsc --build src/lib/memory/

if [ $? -ne 0 ]; then
  echo "❌ TypeScript compilation failed"
  echo "🔄 Trying direct compilation..."
  npx tsc src/lib/memory/shared-memory.ts --outDir dist/lib/memory --declaration --target es2020 --module commonjs --moduleResolution node --esModuleInterop --skipLibCheck
fi

# Run the specific ChromaDB integration test
echo "🧪 Running ChromaDB integration test..."
npm test -- --testPathPattern="chroma-integration" --testNamePattern="stores operational memory" --verbose

echo "📋 Test completed!"
