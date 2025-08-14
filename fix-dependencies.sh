#!/bin/bash

echo "🗑️ Clean up unused files and fix imports"
cd /Users/kevinbrown/MCP-ocs

# Remove the unused robust client that's causing TypeScript errors
echo "🗑️ Removing unused robust client..."
rm -f src/lib/memory/chromadb-client-robust.ts

# Create a simple copy of the MCP-files memory extension locally
echo "📋 Creating local copy of working MCP-files ChromaMemoryManager..."
cp ../MCP-files/src/memory-extension.ts src/lib/memory/mcp-files-memory-extension.ts

echo "✅ Cleanup completed!"
echo "📝 Now we can fix the import path and interface issues..."
