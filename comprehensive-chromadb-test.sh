#!/bin/bash

echo "🚀 Comprehensive ChromaDB Test..."

cd /Users/kevinbrown/MCP-ocs

# Clean everything first
echo "🧹 Cleaning build artifacts..."
rm -rf dist/
rm -rf node_modules/.cache/

# Force clean compilation
echo "📦 Force rebuilding with clean slate..."

# Build with explicit settings
npx tsc \
  src/lib/memory/shared-memory.ts \
  src/lib/memory/chromadb-client-fixed.ts \
  --outDir dist \
  --declaration \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --allowSyntheticDefaultImports \
  --strict false

if [ $? -ne 0 ]; then
  echo "❌ Compilation failed. Checking TypeScript errors..."
  npx tsc --noEmit src/lib/memory/chromadb-client-fixed.ts
  exit 1
fi

echo "✅ Clean compilation successful!"

# Check if ChromaDB is running
echo "🔍 Checking if ChromaDB is running..."
if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB is running on port 8000"
  USE_EXTERNAL=1
elif curl -s http://127.0.0.1:8000/api/v2/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB v2 is running on port 8000"
  USE_EXTERNAL=1
else
  echo "⚠️ ChromaDB not running, attempting to start..."
  
  # Try to start ChromaDB with docker
  if command -v docker > /dev/null 2>&1; then
    echo "🐳 Starting ChromaDB with Docker..."
    docker run -d --name chromadb-test -p 8000:8000 \
      -e ALLOW_RESET=TRUE \
      -e IS_PERSISTENT=FALSE \
      chromadb/chroma:latest
    
    # Wait for startup
    echo "⏳ Waiting for ChromaDB to start..."
    for i in {1..30}; do
      if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
        echo "✅ ChromaDB started successfully!"
        USE_EXTERNAL=1
        break
      fi
      sleep 1
    done
    
    if [ "$USE_EXTERNAL" != "1" ]; then
      echo "❌ ChromaDB failed to start with Docker"
      USE_EXTERNAL=0
    fi
  else
    echo "❌ Docker not available and ChromaDB not running"
    USE_EXTERNAL=0
  fi
fi

# Set environment variables
if [ "$USE_EXTERNAL" = "1" ]; then
  export CHROMA_EXTERNAL=1
  export CHROMA_HOST=127.0.0.1
  export CHROMA_PORT=8000
  echo "🎯 Using external ChromaDB at 127.0.0.1:8000"
else
  export TESTCONTAINERS=1
  echo "🐳 Will use testcontainers mode"
fi

# Run the test
echo ""
echo "🧪 Running ChromaDB Integration Test..."
echo "=================================================="

npm test -- \
  --testPathPattern="chroma-integration" \
  --testNamePattern="stores operational memory in ChromaDB" \
  --verbose \
  --forceExit

echo "=================================================="

# Cleanup
if [ "$USE_EXTERNAL" = "1" ] && command -v docker > /dev/null 2>&1; then
  echo "🧹 Cleaning up test ChromaDB container..."
  docker stop chromadb-test > /dev/null 2>&1
  docker rm chromadb-test > /dev/null 2>&1
fi

echo "📋 Test completed!"
