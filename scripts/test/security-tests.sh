#!/bin/bash
# 
# Run security tests for MCP-ocs project
# Usage: ./scripts/test/security-tests.sh

echo "🛡️ Running security tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:security
