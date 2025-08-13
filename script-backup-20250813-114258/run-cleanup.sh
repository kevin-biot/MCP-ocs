#!/bin/bash
# 
# Run the MCP-ocs script cleanup automation
# Execute this to organize all your scripts

echo "🚀 Running MCP-ocs Script Cleanup..."
echo "====================================="

# Make the cleanup script executable
chmod +x /Users/kevinbrown/MCP-ocs/cleanup-scripts.sh

# Run the cleanup
echo "Starting cleanup process..."
./cleanup-scripts.sh

echo ""
echo "✅ Cleanup process completed!"
echo "Your MCP-ocs scripts are now organized in the 'scripts' directory."