#!/bin/bash
# 
# Run integration tests for MCP-ocs project  
# Usage: ./scripts/test/integration-tests.sh

echo "🧪 Running integration tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:integration
