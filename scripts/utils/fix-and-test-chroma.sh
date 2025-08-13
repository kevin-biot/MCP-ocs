#!/bin/bash

echo "🔧 ChromaDB Integration Fix Complete!"
echo "==================================="

cd /Users/kevinbrown/MCP-ocs

echo "📦 Rebuilding with ChromaDB integration..."
npm run build

BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🧪 Testing ChromaDB connectivity first..."
    ./debug-chroma-connection.sh
    
    echo ""
    echo "🚀 Now restart MCP-ocs to see ChromaDB connection:"
    echo "   node dist/index.js"
    echo ""
    echo "You should now see:"
    echo "   ✅ ChromaDB connected successfully at 127.0.0.1:8000"
    echo "   📁 Memory system: ChromaDB + JSON"
    
else
    echo "❌ Build failed!"
    npm run build 2>&1 | grep "error TS"
fi
