#!/bin/bash

echo "🚀 Creating Shared MCP Memory Infrastructure"
echo "=========================================="

# 1. Create shared memory structure
echo "📁 Creating shared directory structure..."
mkdir -p /Users/kevinbrown/memory/{consolidated,shared-chromadb,config}

# 2. Consolidate all existing memories
echo "📁 Gathering memories from all MCP servers..."

# From MCP-files
if [ -d "/Users/kevinbrown/MCP-files/.mcp-memory" ]; then
    echo "  ✅ Copying MCP-files memories..."
    cp /Users/kevinbrown/MCP-files/.mcp-memory/*.json /Users/kevinbrown/memory/consolidated/ 2>/dev/null || echo "    (No JSON files found)"
fi

# From MCP-ocs
if [ -d "/Users/kevinbrown/MCP-ocs/memory" ]; then
    echo "  ✅ Copying MCP-ocs memories..."
    find /Users/kevinbrown/MCP-ocs/memory -name "*.json" -not -path "*/test/*" -exec cp {} /Users/kevinbrown/memory/consolidated/ \; 2>/dev/null
fi

# From deployment-ocs
if [ -d "/Users/kevinbrown/deployment-ocs/.mcp-memory" ]; then
    echo "  ✅ Copying deployment-ocs memories..."
    cp /Users/kevinbrown/deployment-ocs/.mcp-memory/*.json /Users/kevinbrown/memory/consolidated/ 2>/dev/null || echo "    (No JSON files found)"
fi

# From servers
if [ -d "/Users/kevinbrown/servers/.mcp-memory" ]; then
    echo "  ✅ Copying servers memories..."
    cp /Users/kevinbrown/servers/.mcp-memory/*.json /Users/kevinbrown/memory/consolidated/ 2>/dev/null || echo "    (No JSON files found)"
fi

# 3. Create shared configuration
echo "⚙️  Creating shared memory configuration..."
cat > /Users/kevinbrown/memory/config/memory-config.json << 'EOF'
{
  "memoryVersion": "1.0.0",
  "sharedMemoryDir": "/Users/kevinbrown/memory/consolidated",
  "chromadb": {
    "host": "127.0.0.1",
    "port": 8000,
    "dataPath": "/Users/kevinbrown/memory/shared-chromadb"
  },
  "collections": {
    "unified": "llm_conversation_memory"
  },
  "embedding": {
    "model": "Xenova/all-MiniLM-L6-v2",
    "provider": "client-side"
  },
  "clients": {
    "mcp-files": {
      "description": "File operations and analysis memories"
    },
    "mcp-ocs": {
      "description": "OpenShift/Kubernetes operations memories"
    },
    "mcp-deployment": {
      "description": "Deployment and infrastructure memories"
    },
    "mcp-servers": {
      "description": "Server management memories"
    }
  }
}
EOF

# 4. Count consolidated memories
MEMORY_COUNT=$(ls /Users/kevinbrown/memory/consolidated/*.json 2>/dev/null | wc -l)
echo "🎯 Consolidated $MEMORY_COUNT memory files"

# 5. List the treasures
echo ""
echo "📋 Consolidated Memory Files:"
if [ $MEMORY_COUNT -gt 0 ]; then
    ls -la /Users/kevinbrown/memory/consolidated/ | head -20
    if [ $MEMORY_COUNT -gt 15 ]; then
        echo "   ... and $(($MEMORY_COUNT - 15)) more files"
    fi
else
    echo "   No memory files found"
fi

# 6. Set proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 755 /Users/kevinbrown/memory

# 7. Check for existing ChromaDB processes
echo ""
echo "🔍 Checking for existing ChromaDB processes..."
EXISTING_CHROMA=$(ps aux | grep -v grep | grep chroma | wc -l)
if [ $EXISTING_CHROMA -gt 0 ]; then
    echo "⚠️  Found existing ChromaDB process:"
    ps aux | grep -v grep | grep chroma
    echo ""
    echo "🛑 Stopping existing ChromaDB..."
    pkill -f chroma
    sleep 2
fi

# 8. Start shared ChromaDB service
echo "🚀 Starting shared ChromaDB service..."
cd /Users/kevinbrown/memory
echo "   Starting ChromaDB in background..."
nohup chroma run --host 127.0.0.1 --port 8000 --path ./shared-chromadb > chromadb.log 2>&1 &
CHROMA_PID=$!
echo "   ChromaDB started with PID: $CHROMA_PID"

# 9. Wait a moment for startup
echo "⏱️  Waiting for ChromaDB to start..."
sleep 3

# 10. Test ChromaDB connection
echo "🧪 Testing ChromaDB connection..."
if curl -s http://127.0.0.1:8000/api/v2/heartbeat > /dev/null; then
    echo "✅ ChromaDB is responding!"
else
    echo "❌ ChromaDB not responding (may need more time to start)"
fi

# 11. Summary
echo ""
echo "🎉 Shared Memory Infrastructure Complete!"
echo "========================================"
echo "📁 Shared memory directory: /Users/kevinbrown/memory/consolidated"
echo "🗄️  ChromaDB data directory: /Users/kevinbrown/memory/shared-chromadb"
echo "⚙️  Configuration file: /Users/kevinbrown/memory/config/memory-config.json"
echo "📊 Total memories: $MEMORY_COUNT files"
echo "🌐 ChromaDB endpoint: http://127.0.0.1:8000"
echo ""
echo "📝 Next steps:"
echo "   1. Update CODEX to use shared memory paths"
echo "   2. Run: cd /Users/kevinbrown/MCP-ocs && npm run memory:reload /Users/kevinbrown/memory/consolidated"
echo "   3. Test: npm run memory:health"
echo ""
echo "🏆 THE VICTORY MEMORY IS NOW IN THE SHARED SYSTEM! 🏆"
