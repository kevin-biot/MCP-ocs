#!/bin/bash

echo "🎯 Final Build Test - All Fixes Applied"
echo "======================================="

cd /Users/kevinbrown/MCP-ocs

echo "🔧 Running TypeScript compilation..."
npm run build

BUILD_STATUS=$?

echo ""
if [ $BUILD_STATUS -eq 0 ]; then
    echo "🎉 SUCCESS! Build completed successfully!"
    echo ""
    echo "📦 Checking dist directory..."
    ls -la dist/ | head -10
    
    echo ""
    echo "🧪 Ready for testing!"
    echo "Next step: npm test -- --testPathPattern=basic"
else
    echo "❌ Build failed. Error count:"
    npm run build 2>&1 | grep -c "error TS" || echo "0"
    
    echo ""
    echo "📋 Remaining errors:"
    npm run build 2>&1 | grep "error TS" | head -10
fi

echo ""
echo "🏁 Build test complete!"
