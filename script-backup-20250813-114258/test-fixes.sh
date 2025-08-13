#!/bin/bash

echo "Testing TypeScript compilation fixes..."

# Check if we can compile the project
cd /Users/kevinbrown/MCP-ocs

# Run TypeScript compilation to check for errors
echo "Running TypeScript compiler..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo "Fixes applied successfully!"