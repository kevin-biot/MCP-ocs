#!/bin/bash

echo "🔥 Direct ChromaDB Test - Fixed JavaScript Syntax"

cd /Users/kevinbrown/MCP-ocs

# Verify ChromaDB is running
if curl -s http://127.0.0.1:8000/api/v1/heartbeat > /dev/null 2>&1; then
  echo "✅ ChromaDB is accessible"
else
  echo "❌ ChromaDB not accessible at 127.0.0.1:8000"
  exit 1
fi

echo ""
echo "🧪 Running direct ChromaDB test (fixed syntax)..."
echo "=================================="

# Run the direct test
node direct-chromadb-test.mjs

echo "=================================="
echo "📋 Test completed!"
