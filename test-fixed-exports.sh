#!/bin/bash

echo "🚀 ChromaDB Fix - FINAL TEST (Fixed Module Exports)"
cd /Users/kevinbrown/MCP-ocs

# Quick build to ensure latest code
echo "📦 Building latest version..."
npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful!"

# Check ChromaDB
if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB is running"
else
  echo "❌ ChromaDB not accessible - please ensure it's running"
  exit 1
fi

echo ""
echo "🧪 Testing ChromaDB fix with CommonJS import..."
echo "=============================================="

# Run the fixed test
node direct-chromadb-test-fixed.js

echo "=============================================="
echo "📋 Test completed!"
