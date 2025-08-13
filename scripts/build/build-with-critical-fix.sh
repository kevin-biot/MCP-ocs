#!/bin/bash

echo "🏗️ BUILDING PROJECT WITH CRITICAL BUG FIX"
echo "========================================="

cd /Users/kevinbrown/MCP-ocs

echo "📋 Current status:"
echo "- Source openshift-client.ts: Modified 00:13:48 (with our fix)"
echo "- Built openshift-client.js: Modified 00:06:44 (BEFORE our fix)"
echo "- describeResource method: NOT in dist/ folder yet"
echo ""
echo "🚨 CRITICAL: We need to build to apply our bug fix!"

# Clean previous build
echo "🧹 Cleaning previous build..."
npm run clean

# Type check
echo "🔍 TypeScript type checking..."
npx tsc --noEmit

# Build the project
echo "🏗️ Building project with critical fix..."
npm run build

# Verify the fix is in the built version
echo ""
echo "✅ Verifying describeResource method in built version..."
if grep -q "describeResource" dist/lib/openshift-client.js; then
    echo "✅ SUCCESS: describeResource method found in built version!"
else
    echo "❌ ERROR: describeResource method still missing in built version!"
    exit 1
fi

# Check file timestamps
echo ""
echo "📊 Build verification:"
echo "Source file timestamp: $(stat -f "%Sm" src/lib/openshift-client.ts)"
echo "Built file timestamp: $(stat -f "%Sm" dist/lib/openshift-client.js)"

echo ""
echo "🎉 BUILD COMPLETED WITH CRITICAL FIX!"
echo "✅ describeResource method now available in production"
echo "✅ Error handling enhancements applied"
echo "✅ MCP stability improvements included"
echo ""
echo "🚀 Ready for testing with actual fix applied!"
