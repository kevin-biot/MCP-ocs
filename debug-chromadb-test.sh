#!/bin/bash

echo "🔥 ChromaDB Integration Test - FINAL ATTEMPT"

cd /Users/kevinbrown/MCP-ocs

# Clean build
rm -rf dist/lib/memory
mkdir -p dist/lib/memory

echo "📦 Building memory system..."

npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --declaration \
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

# Set environment variables correctly (as strings!)
export CHROMA_EXTERNAL="1"
export CHROMA_HOST="127.0.0.1"
export CHROMA_PORT="8000"

echo "🎯 Environment set:"
echo "   CHROMA_EXTERNAL=$CHROMA_EXTERNAL"
echo "   CHROMA_HOST=$CHROMA_HOST"
echo "   CHROMA_PORT=$CHROMA_PORT"

# Verify ChromaDB is accessible
echo "🔍 Verifying ChromaDB connectivity..."
if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB v1 API accessible"
elif curl -s http://127.0.0.1:8000/api/v2/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB v2 API accessible"
else
  echo "❌ ChromaDB not accessible at 127.0.0.1:8000"
  echo "Please ensure ChromaDB is running!"
  exit 1
fi

echo ""
echo "🧪 Running ChromaDB Integration Test..."
echo "=========================================="

# Run with explicit environment
CHROMA_EXTERNAL="1" CHROMA_HOST="127.0.0.1" CHROMA_PORT="8000" \
npm test -- \
  --testPathPattern="chroma-integration" \
  --testNamePattern="stores operational memory in ChromaDB" \
  --verbose \
  --no-cache

echo "=========================================="
echo "📋 Test completed!"

# Also show what environment Jest sees
echo ""
echo "🔍 Debug: Environment check"
node -e "
console.log('CHROMA_EXTERNAL:', process.env.CHROMA_EXTERNAL);
console.log('Type:', typeof process.env.CHROMA_EXTERNAL);
console.log('Comparison result:', process.env.CHROMA_EXTERNAL === '1');
"
