#!/bin/bash

echo "🏗️ Building MCP-OCS v2.0 with check_namespace_health tool"
echo "==========================================================="

cd /Users/kevinbrown/MCP-ocs

# Build the project
echo "📦 Building TypeScript..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🧪 Running validation tests..."
    ./validate-v2-tools.sh
else
    echo "❌ Build failed! Check errors above."
    exit 1
fi
