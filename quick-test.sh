#!/bin/bash

echo "🔨 MCP-ocs Quick Build & Test Script"
echo "====================================="

cd /Users/kevinbrown/MCP-ocs

echo ""
echo "📦 Step 1: Building TypeScript source..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo ""
    echo "📁 Checking dist directory..."
    ls -la dist/
    
    echo ""
    echo "🧪 Step 2: Running basic tests..."
    npm test -- --testPathPattern=basic.test.ts
    TEST_STATUS=$?
    
    if [ $TEST_STATUS -eq 0 ]; then
        echo "✅ Basic tests passed!"
        
        echo ""
        echo "🎯 Step 3: Running all unit tests..."
        npm run test:unit
        UNIT_STATUS=$?
        
        if [ $UNIT_STATUS -eq 0 ]; then
            echo "✅ All unit tests passed!"
            echo ""
            echo "🚀 System is ready for development!"
        else
            echo "⚠️  Some unit tests failed, but basic functionality works"
        fi
    else
        echo "❌ Basic tests failed"
    fi
else
    echo "❌ Build failed!"
    echo ""
    echo "🔍 Checking for TypeScript errors..."
    npx tsc --noEmit
fi

echo ""
echo "🏁 Test complete! Check output above for results."
