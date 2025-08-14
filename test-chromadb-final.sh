#!/bin/bash

echo "🎯 Final ChromaDB Test - Fixed Import Path"

cd /Users/kevinbrown/MCP-ocs

# Build first
echo "📦 Building..."
npx tsc \
  src/lib/memory/chromadb-client-fixed.ts \
  src/lib/memory/shared-memory.ts \
  --outDir dist \
  --target es2020 \
  --module commonjs \
  --moduleResolution node \
  --esModuleInterop \
  --skipLibCheck

echo "✅ Build complete!"

# Run test
echo "🧪 Testing ChromaDB fix..."
node direct-chromadb-test.mjs

echo "🏁 Done!"
