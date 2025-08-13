#!/bin/bash

# Quick Build Test for Scale-Down Detection Enhancement
echo "🏗️ Quick Build Test - Scale-Down Detection Enhancement"
echo "==================================================="

cd /Users/kevinbrown/MCP-ocs

# Test 1: Check TypeScript compilation
echo ""
echo "🔍 Test 1: TypeScript compilation check..."
if npx tsc --noEmit; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Test 2: Run our scale-down detection test
echo ""
echo "🧪 Test 2: Scale-down detection functionality test..."
if node tests/scale-down-detection/test-scale-down-detection.js; then
    echo "✅ Scale-down detection test passed"
else
    echo "❌ Scale-down detection test failed"
    exit 1
fi

# Test 3: Build the project
echo ""
echo "🏗️ Test 3: Full project build..."
if npm run build; then
    echo "✅ Project build successful"
    echo "📦 Build output:"
    ls -la dist/ | head -5
else
    echo "❌ Project build failed"
    exit 1
fi

echo ""
echo "🎉 All build tests passed!"
echo "✅ TypeScript compilation: OK"
echo "✅ Scale-down detection test: OK"
echo "✅ Project build: OK"
echo ""
echo "🚀 Ready for git commit!"
