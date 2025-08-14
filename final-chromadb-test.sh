#!/bin/bash

echo "🔧 Final ChromaDB Test..."

cd /Users/kevinbrown/MCP-ocs

export CHROMA_EXTERNAL=1
export CHROMA_HOST=127.0.0.1  
export CHROMA_PORT=8000

echo "📦 Compiling memory system..."

npx tsc \
  src/lib/memory/shared-memory.ts \
  src/lib/memory/chromadb-client-fixed.ts \
  --outDir dist \
  --declaration \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

if [ $? -eq 0 ]; then
  echo "✅ Compilation successful!"
  
  echo ""
  echo "🧪 Running ChromaDB Integration Test..."
  echo "=================================================="
  
  npm test -- \
    --testPathPattern="chroma-integration" \
    --testNamePattern="stores operational memory in ChromaDB" \
    --verbose
    
  echo "=================================================="
  echo "📋 Test completed! Check results above ☝️"
  
else
  echo "❌ Compilation failed"
  echo "Checking specific TypeScript errors..."
  npx tsc --noEmit --strict src/lib/memory/chromadb-client-fixed.ts
fi
