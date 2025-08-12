#!/bin/bash

echo "🔨 Building MCP-ocs with Knowledge Seeding fix..."

# Build the project
echo "📦 Running npm run build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "🧪 Running Knowledge Seeding test..."
    node test-knowledge-seeding.mjs
    
    if [ $? -eq 0 ]; then
        echo "🎉 All tests passed! Ready to start MCP server."
        echo ""
        echo "To start the server:"
        echo "npm start"
        echo ""
        echo "Expected debug output should include:"
        echo "🔧 Debug - Tool names: [..., 'knowledge_seed_pattern', ...]"
    else
        echo "❌ Tests failed. Check the output above."
    fi
else
    echo "❌ Build failed. Check TypeScript errors above."
fi
