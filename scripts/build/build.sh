#!/bin/bash
# 
# Main build process for MCP-ocs project
# Usage: ./scripts/build/build.sh

echo "🏗️ Building MCP-ocs..."
cd /Users/kevinbrown/MCP-ocs

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run typecheck

# Build project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📦 Build artifacts available in: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi
