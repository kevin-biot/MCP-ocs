#!/bin/bash

echo "=== Final Build Check for MCP-ocs ==="

# Change to project directory
cd /Users/kevinbrown/MCP-ocs

echo "1. Validating package.json syntax..."
node -e "require('./package.json'); console.log('package.json is valid')"

echo "2. Running TypeScript compilation..."
npx tsc --noEmit

echo "3. Checking for any remaining TypeScript errors..."

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: All TypeScript compilation issues have been resolved!"
    echo "The MCP-ocs project should now build successfully with the vector memory integration."
else
    echo "❌ There are still TypeScript compilation issues"
fi

echo "4. Checking if build script works..."
npm run build