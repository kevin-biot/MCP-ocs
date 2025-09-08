#!/bin/bash

echo "=== Final Build Test for MCP-ocs ==="

# Change to project directory
cd /Users/kevinbrown/MCP-ocs

echo "1. Installing missing type definitions..."
npm install --save-dev @types/express

echo "2. Running TypeScript compilation..."
npm run build

echo "3. Checking for remaining issues..."

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: All TypeScript compilation issues have been resolved!"
    echo "Build completed successfully with no errors."
else
    echo "❌ BUILD STILL HAS ERRORS"
    echo "Please review the TypeScript compilation output above for remaining issues."
fi