#!/bin/bash

echo "🔧 Testing ChromaDB fix with official client..."

cd /Users/kevinbrown/MCP-ocs

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  # Run the specific failing test
  echo "🧪 Running ChromaDB integration test..."
  npm run test:integration -- --testNamePattern="stores operational memory in ChromaDB" --verbose --detectOpenHandles
  
  echo "📋 Test completed!"
else
  echo "❌ Build failed!"
  exit 1
fi
