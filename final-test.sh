#!/bin/bash
cd /Users/kevinbrown/MCP-ocs

echo "Running TypeScript compilation test..."

# Run the TypeScript compiler to check our fixes
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ SUCCESS: All TypeScript compilation errors have been fixed!"
    echo "The MCP-ocs project should now build successfully."
else
    echo "❌ FAILURE: There are still compilation errors."
    exit 1
fi