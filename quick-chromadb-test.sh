#!/bin/bash

echo "🎯 Quick ChromaDB Fix Test..."

cd /Users/kevinbrown/MCP-ocs

# Clean build
rm -rf dist/lib/memory
mkdir -p dist/lib/memory

echo "📦 Building memory system (fixed initialization)..."

npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --declaration \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck \
  --allowSyntheticDefaultImports

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Check if ChromaDB is available
  echo "🔍 Checking ChromaDB availability..."
  if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1 || curl -s http://127.0.0.1:8000/api/v2/heartbeat > /dev/null 2>&1; then
    echo "✅ ChromaDB is running!"
    
    export CHROMA_EXTERNAL=1
    export CHROMA_HOST=127.0.0.1
    export CHROMA_PORT=8000
    
    echo "🧪 Running the specific test..."
    npm test -- \
      --testPathPattern="chroma-integration" \
      --testNamePattern="stores operational memory in ChromaDB" \
      --verbose
  else
    echo "⚠️ ChromaDB not running. Starting with Docker..."
    
    if command -v docker > /dev/null 2>&1; then
      docker run -d --name chromadb-quick-test -p 8000:8000 \
        -e ALLOW_RESET=TRUE \
        chromadb/chroma:latest
      
      echo "⏳ Waiting for ChromaDB startup..."
      sleep 10
      
      export CHROMA_EXTERNAL=1
      export CHROMA_HOST=127.0.0.1
      export CHROMA_PORT=8000
      
      echo "🧪 Running test with Docker ChromaDB..."
      npm test -- \
        --testPathPattern="chroma-integration" \
        --testNamePattern="stores operational memory in ChromaDB" \
        --verbose
      
      echo "🧹 Cleaning up..."
      docker stop chromadb-quick-test
      docker rm chromadb-quick-test
    else
      echo "❌ Docker not available and ChromaDB not running"
      echo "ℹ️ Please start ChromaDB manually:"
      echo "   docker run -p 8000:8000 chromadb/chroma:latest"
    fi
  fi
else
  echo "❌ Build failed!"
  npx tsc --noEmit src/lib/memory/chromadb-client-fixed.ts
fi

echo "🏁 Test completed!"
