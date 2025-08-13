#!/bin/bash
# 
# Run unit tests for MCP-ocs project
# Usage: ./scripts/test/unit-tests.sh

echo "🧪 Running unit tests..."
cd /Users/kevinbrown/MCP-ocs
npm run test:unit -- --coverage
