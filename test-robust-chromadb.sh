#!/bin/bash

echo "🛡️ Test Robust ChromaDB Implementation"
cd /Users/kevinbrown/MCP-ocs

echo "🏗️ Building with robust ChromaDB client..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Start ChromaDB if not running
  if ! curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "⚠️ ChromaDB not running - please start it:"
    echo "   chroma run --host 127.0.0.1 --port 8000"
    exit 1
  fi
  
  echo "✅ ChromaDB is running"
  
  echo ""
  echo "🧪 Testing robust ChromaDB implementation..."
  echo "==========================================="
  
  npm test -- \
    --testPathPattern="chroma-integration-simple" \
    --testNamePattern="should store operational memory in ChromaDB" \
    --verbose
    
  echo "==========================================="
  echo "📋 Robust implementation test completed!"
  
  echo ""
  echo "🎯 Expected result:"
  echo "✅ Either ChromaDB works (embedding function OK)"
  echo "✅ Or graceful fallback to JSON (embedding incompatible)" 
  echo "✅ No more cryptic tensor errors - clear error messages"
else
  echo "❌ Build failed!"
fi
