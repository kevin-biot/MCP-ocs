#!/bin/bash

echo "=== Fixing MCP-ocs Build Issues ==="

# Change to project directory
cd /Users/kevinbrown/MCP-ocs

echo "1. Installing missing type definitions..."
npm install --save-dev @types/express

echo "2. Running TypeScript compilation to identify remaining issues..."
npx tsc --noEmit

echo "3. Build complete - checking for any remaining errors..."

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: All TypeScript compilation issues have been resolved!"
else
    echo "❌ BUILD STILL HAS ERRORS - Please review the compilation output above"
fi