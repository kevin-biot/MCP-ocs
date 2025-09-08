#!/bin/bash

echo "🔧 Test Clean Build with Path Aliases"
cd /Users/kevinbrown/MCP-ocs

# Clean build
echo "📦 Clean rebuild with path aliases..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo "🧪 Running Jest ChromaDB test..."
  echo "=================================="
  
  CHROMA_EXTERNAL=1 npm test -- \
    --testPathPattern="chroma-integration" \
    --testNamePattern="stores operational memory in ChromaDB" \
    --verbose
    
  echo "=================================="
  echo "📋 Jest test completed!"
else
  echo "❌ Build failed - checking specific errors..."
  npx tsc --noEmit
fi
