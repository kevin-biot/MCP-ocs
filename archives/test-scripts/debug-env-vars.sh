#!/bin/bash

echo "🔍 Debug Environment Variables in Jest"
cd /Users/kevinbrown/MCP-ocs

# Check environment variables
echo "🌍 Current environment variables:"
echo "CHROMA_EXTERNAL: '$CHROMA_EXTERNAL'"
echo "CHROMA_HOST: '$CHROMA_HOST'"
echo "CHROMA_PORT: '$CHROMA_PORT'"

# Test environment variables in Node
echo ""
echo "🧪 Testing environment in Node:"
node -e "
console.log('CHROMA_EXTERNAL:', process.env.CHROMA_EXTERNAL);
console.log('Type:', typeof process.env.CHROMA_EXTERNAL);
console.log('Strict comparison result:', process.env.CHROMA_EXTERNAL === '1');
console.log('RUN_MODE would be:', process.env.CHROMA_EXTERNAL === '1' ? 'external' : 'skip');
"

echo ""
echo "🎯 Running Jest with explicit environment in command:"
echo "=================================="

# Run Jest with inline environment variables
env CHROMA_EXTERNAL=1 CHROMA_HOST=127.0.0.1 CHROMA_PORT=8000 \
npm test -- \
  --testPathPattern="chroma-integration" \
  --testNamePattern="stores operational memory in ChromaDB" \
  --verbose

echo "=================================="
echo "📋 Test completed!"
