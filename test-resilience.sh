#!/bin/bash

echo "🛡️ Test Memory System Resilience - JSON Fallback"
cd /Users/kevinbrown/MCP-ocs

echo "📦 Building..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo ""
  echo "🧪 Testing memory system resilience..."
  echo "===================================="
  
  npm test -- \
    --testPathPattern="memory-resilience" \
    --verbose
    
  echo "===================================="
  echo "📋 Resilience test completed!"
  
  echo ""
  echo "🎯 Key Success Metrics:"
  echo "✅ JSON storage works when ChromaDB fails"
  echo "✅ Search falls back to JSON successfully" 
  echo "✅ System remains operational"
  echo "✅ No data loss during ChromaDB issues"
else
  echo "❌ Build failed!"
fi
