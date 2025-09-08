#!/bin/bash

# Quick fix for the enhanced summary script syntax error
echo "🔧 Fixing enhanced summary script..."

# Fix the syntax error in the enhanced-all-summary.sh script
sed -i '' 's/\[\[ \$import_errors -gt 0/[[ $import_errors -gt 0/' scripts/test/dual-mode/enhanced-all-summary.sh
sed -i '' 's/\[\[ \$ts_errors -gt 0/[[ $ts_errors -gt 0/' scripts/test/dual-mode/enhanced-all-summary.sh

echo "✅ Fixed syntax errors in enhanced summary script"

# Now implement the fix plan identified by the analysis
echo ""
echo "🎯 Implementing Fix Plan from Analysis..."
echo "========================================"

echo "1. Installing @types/jest dependency..."
npm install --save-dev @types/jest

echo ""
echo "2. Checking tsconfig.json for jest types..."
if grep -q '"jest"' tsconfig.json; then
    echo "   ✅ jest already in tsconfig.json types"
else
    echo "   📝 Adding jest to tsconfig.json types..."
    # Backup original
    cp tsconfig.json tsconfig.json.backup
    
    # Add jest to types array  
    if grep -q '"types"' tsconfig.json; then
        sed -i '' 's/"types": \[\([^]]*\)\]/"types": [\1, "jest"]/' tsconfig.json
    else
        # Add types array if it doesn't exist
        sed -i '' '/"compilerOptions": {/a\
    "types": ["node", "jest"],' tsconfig.json
    fi
    
    echo "   ✅ Added jest to tsconfig.json"
fi

echo ""
echo "3. Re-running enhanced analysis to verify fixes..."
scripts/test/dual-mode/enhanced-all-summary.sh
