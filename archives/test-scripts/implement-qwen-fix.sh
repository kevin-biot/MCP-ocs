#!/bin/bash

# Fix the Jest type definitions issue identified by Qwen's analysis
echo "🔧 Implementing Qwen's Fix Plan"
echo "==============================="
echo

echo "📋 Qwen identified root cause: Missing @types/jest dependency"
echo

# Step 1: Install missing Jest types
echo "1. Installing @types/jest dependency..."
npm install --save-dev @types/jest

# Step 2: Update tsconfig.json to include jest types
echo "2. Checking tsconfig.json for jest types..."

# Check if jest is already in types array
if grep -q '"jest"' tsconfig.json; then
    echo "   ✅ jest already in tsconfig.json types"
else
    echo "   📝 Adding jest to tsconfig.json types..."
    # Backup original
    cp tsconfig.json tsconfig.json.backup
    
    # Add jest to types array
    sed -i '' 's/"types": \[\([^]]*\)\]/"types": [\1, "jest"]/' tsconfig.json
    
    echo "   ✅ Added jest to tsconfig.json"
fi

echo
echo "3. Verifying fixes with Qwen's enhanced analysis..."
scripts/test/granular/error-grouping-enhanced.sh

echo
echo "4. Testing individual unit tests..."
scripts/test/test-status.sh

echo
echo "✅ Fix plan implemented! Check results above."
echo "   If errors persist, run individual tests with test-selector.sh"
