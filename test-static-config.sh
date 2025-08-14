#!/bin/bash

echo "🚀 Test ChromaDB with Static Production Config"
cd /Users/kevinbrown/MCP-ocs

echo "📦 Building latest code..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo ""
  echo "🧪 Running simplified ChromaDB test (no env variables)..."
  echo "======================================================="
  
  npm test -- \
    --testPathPattern="chroma-integration-simple" \
    --testNamePattern="should store operational memory in ChromaDB" \
    --verbose
    
  echo "======================================================="
  echo "📋 Test completed!"
else
  echo "❌ Build failed!"
fi
