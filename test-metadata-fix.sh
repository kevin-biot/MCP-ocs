#!/bin/bash

echo "🔧 Fix ChromaDB Metadata Issue and Test"
cd /Users/kevinbrown/MCP-ocs

# Rebuild with the metadata fix
echo "📦 Rebuilding with metadata fix..."
npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --target es2020 \
  --module esnext \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

echo "✅ Build complete!"

echo ""
echo "🧪 Testing ChromaDB fix with corrected metadata..."
echo "=================================================="

node chromadb-test.mjs

echo "=================================================="
echo "📋 Test completed!"
