#!/bin/bash

echo "🎯 Use Working MCP-files ChromaDB Implementation"
cd /Users/kevinbrown/MCP-ocs

echo "🏗️ Building with MCP-files adapter..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo ""
  echo "🧪 Testing with proven working ChromaDB from MCP-files..."
  echo "======================================================="
  
  npm test -- \
    --testPathPattern="memory-resilience" \
    --verbose
    
  echo "======================================================="
  echo "📋 MCP-files adapter test completed!"
  
  echo ""
  echo "🎯 This should work because:"
  echo "✅ Uses exact same ChromaDB code as working MCP-files"
  echo "✅ No reimplementation - proven working code"
  echo "✅ Same environment, same dependencies, same logic"
else
  echo "❌ Build failed!"
fi
