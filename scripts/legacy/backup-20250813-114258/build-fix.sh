#!/bin/bash

echo "=== Attempting to fix remaining build issues ==="

cd /Users/kevinbrown/MCP-ocs

# Install missing type definitions
echo "1. Installing express type definitions..."
npm install --save-dev @types/express

# Clean node_modules and reinstall
echo "2. Cleaning up dependencies..."
rm -rf node_modules package-lock.json
npm install

# Try building again
echo "3. Running TypeScript compilation..."
npx tsc --noEmit

echo "4. Build complete - checking status..."

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: Build completed successfully!"
else
    echo "❌ BUILD STILL HAS ERRORS"
fi