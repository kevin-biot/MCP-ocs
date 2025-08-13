#!/bin/bash
# 
# Quick development build for MCP-ocs project
# Usage: ./scripts/build/quick-build.sh

echo "🔨 Quick build for development..."
cd /Users/kevinbrown/MCP-ocs
npm run build -- --watch
