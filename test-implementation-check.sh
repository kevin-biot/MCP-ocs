#!/bin/bash
echo "🧪 Testing Knowledge Seeding Framework Implementation"
echo "📁 Current directory: $(pwd)"
echo "📋 Files to check:"

# Check if our implementation files exist
if [ -f "src/lib/memory/knowledge-seeding-system.ts" ]; then
    echo "✅ Knowledge Seeding System - Found"
else
    echo "❌ Knowledge Seeding System - Missing"
fi

if [ -f "src/tools/memory/knowledge-seeding-tool.ts" ]; then
    echo "✅ Knowledge Seeding Tool - Found"  
else
    echo "❌ Knowledge Seeding Tool - Missing"
fi

if [ -d "docs/knowledge-seeding" ]; then
    echo "✅ Documentation Directory - Found"
    echo "   📖 Files: $(ls docs/knowledge-seeding/)"
else
    echo "❌ Documentation Directory - Missing"
fi

# Check TypeScript compilation
echo ""
echo "🔨 Testing TypeScript compilation..."
if command -v npm &> /dev/null; then
    npm run build 2>&1 | head -20
else
    echo "⚠️ npm not found, skipping build test"
fi

echo ""
echo "🎯 Ready to test the Knowledge Seeding System!"
echo "Next step: Run 'node test-knowledge-seeding.mjs' to test functionality"
