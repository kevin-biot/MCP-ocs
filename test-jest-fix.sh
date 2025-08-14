#!/bin/bash

echo "🔧 Fix Import Path for Jest and Test"
cd /Users/kevinbrown/MCP-ocs

# Clean rebuild
echo "📦 Rebuilding..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo "🧪 Running Jest integration test..."
  echo "=================================="
  
  CHROMA_EXTERNAL=1 npm test -- \
    --testPathPattern="chroma-integration" \
    --testNamePattern="stores operational memory in ChromaDB" \
    --verbose
    
  echo "=================================="
else
  echo "❌ Build failed!"
fi

echo "📋 Test completed!"
