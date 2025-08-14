#!/bin/bash

echo "🔧 Force Jest Test to Run (Bypass Environment Check)"
cd /Users/kevinbrown/MCP-ocs

# Temporarily modify the test to force it to run
echo "📝 Temporarily forcing test to run..."

# Create a backup and modify the test file
cp tests/integration/memory/chroma-integration.test.ts tests/integration/memory/chroma-integration.test.ts.backup

# Replace the skip logic with force run
sed -i '' 's/const RUN_MODE = .*/const RUN_MODE = "external"; \/\/ FORCED FOR TESTING/' tests/integration/memory/chroma-integration.test.ts

echo "✅ Modified test to force run"

echo ""
echo "🧪 Running forced Jest test..."
echo "=================================="

npm test -- \
  --testPathPattern="chroma-integration" \
  --testNamePattern="stores operational memory in ChromaDB" \
  --verbose

echo "=================================="

# Restore the original file
echo "🔄 Restoring original test file..."
mv tests/integration/memory/chroma-integration.test.ts.backup tests/integration/memory/chroma-integration.test.ts

echo "✅ Original test file restored"
echo "📋 Forced test completed!"
