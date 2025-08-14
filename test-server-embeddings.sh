#!/bin/bash

echo "🔧 Fix Embedding Issue - Let ChromaDB Server Handle Embeddings"
cd /Users/kevinbrown/MCP-ocs

echo "📦 Building with server-side embeddings..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo ""
  echo "🧪 Testing with server-side embeddings..."
  echo "========================================"
  
  npm test -- \
    --testPathPattern="chroma-integration-simple" \
    --testNamePattern="should store operational memory in ChromaDB" \
    --verbose
    
  echo "========================================"
  echo "📋 Server-side embedding test completed!"
else
  echo "❌ Build failed!"
fi
