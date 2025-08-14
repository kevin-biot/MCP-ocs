#!/bin/bash

echo "🔧 Testing ChromaDB fix with minimal build..."

cd /Users/kevinbrown/MCP-ocs

# Build just the memory components
echo "📦 Building core memory components..."
npx tsc src/lib/memory/*.ts --outDir dist/lib/memory --declaration

if [ $? -eq 0 ]; then
  echo "✅ Core build successful!"
  
  # Test the ChromaDB client directly
  echo "🧪 Testing ChromaDB client..."
  node quick-chromadb-test.mjs
  
else
  echo "❌ Core build failed!"
  # Try minimal memory-only build
  echo "🔄 Trying memory-only build..."
  npx tsc src/lib/memory/shared-memory.ts src/lib/memory/chromadb-client-fixed.ts --outDir dist/lib/memory --declaration --target es2020 --module esnext --moduleResolution node
fi

echo "📋 Test completed!"
