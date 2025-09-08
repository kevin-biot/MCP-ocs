#!/bin/bash

# Quick ChromaDB Integration Test with Official Client

cd /Users/kevinbrown/MCP-ocs

echo "🔧 Testing fixed ChromaDB implementation..."

# Build the project
echo "📦 Building project..."
npm run build

# Run the specific failing test
echo "🧪 Running ChromaDB integration test..."
npm run test:integration -- --testNamePattern="ChromaDB.*stores.*operational" --verbose

echo "✅ Test completed!"
