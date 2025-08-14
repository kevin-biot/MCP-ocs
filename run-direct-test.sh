#!/bin/bash

echo "🔥 Direct ChromaDB Integration Test (Bypass Jest)"

cd /Users/kevinbrown/MCP-ocs

# Ensure build is up to date
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

# Verify ChromaDB is running
if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB is accessible"
else
  echo "❌ ChromaDB not accessible at 127.0.0.1:8000"
  echo "Please ensure ChromaDB is running!"
  exit 1
fi

echo ""
echo "🧪 Running direct ChromaDB test..."
echo "=================================="

# Run the direct test
node direct-chromadb-test.mjs

echo "=================================="
echo "📋 Direct test completed!"

# If direct test works, let's see why Jest doesn't
echo ""
echo "🔍 Checking Jest environment..."
echo "CHROMA_EXTERNAL in current shell: $CHROMA_EXTERNAL"

# Try running Jest with explicit environment variables in the command
echo "🧪 Trying Jest with inline environment variables..."
CHROMA_EXTERNAL=1 CHROMA_HOST=127.0.0.1 CHROMA_PORT=8000 npm test -- \
  --testPathPattern="chroma-integration" \
  --testNamePattern="stores operational memory in ChromaDB" \
  --verbose \
  --runInBand
