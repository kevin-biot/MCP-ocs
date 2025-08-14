#!/bin/bash

echo "🚀 Test ChromaDB Integration - Fixed Types"
cd /Users/kevinbrown/MCP-ocs

echo "📦 Building with type fixes..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo ""
  echo "🧪 Running ChromaDB integration test..."
  echo "======================================"
  
  npm test -- \
    --testPathPattern="chroma-integration-simple" \
    --verbose
    
  echo "======================================"
  echo "📋 Basic test completed!"
else
  echo "❌ Build failed!"
fi
