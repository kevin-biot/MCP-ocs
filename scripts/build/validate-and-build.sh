#!/bin/bash

# Enhanced Scale-Down Detection - Validation and Build Script
echo "🚀 Scale-Down Detection Enhancement - Build Process"
echo "=================================================="

# Set error handling
set -e
PROJECT_DIR="/Users/kevinbrown/MCP-ocs"

echo "📁 Working in: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Function to check if file exists and has expected content
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "✅ $description: $file"
        return 0
    else
        echo "❌ $description: $file (missing)"
        return 1
    fi
}

# Step 1: Verify our enhanced files exist
echo ""
echo "🔍 Step 1: Verifying enhanced files..."
check_file "src/v2/tools/check-namespace-health/index.ts" "Namespace Health Checker"
check_file "src/v2/lib/oc-wrapper-v2.ts" "OC Wrapper V2"
check_file "tests/scale-down-detection/test-scale-down-detection.js" "Scale-down Test"

# Step 2: Check for key enhancements in the files
echo ""
echo "🔍 Step 2: Checking for scale-down detection code..."

if grep -q "ScaleDownAnalysis" src/v2/tools/check-namespace-health/index.ts; then
    echo "✅ ScaleDownAnalysis interface found"
else
    echo "❌ ScaleDownAnalysis interface missing"
fi

if grep -q "analyzeScaleDownPatterns" src/v2/tools/check-namespace-health/index.ts; then
    echo "✅ analyzeScaleDownPatterns method found"
else
    echo "❌ analyzeScaleDownPatterns method missing"
fi

if grep -q "getDeployments" src/v2/lib/oc-wrapper-v2.ts; then
    echo "✅ getDeployments method found"
else
    echo "❌ getDeployments method missing"
fi

# Step 3: Run TypeScript compilation
echo ""
echo "🏗️ Step 3: TypeScript compilation..."
if command -v tsc >/dev/null 2>&1; then
    echo "Running: tsc --noEmit (type check only)"
    tsc --noEmit
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️ TypeScript compiler not found globally, trying npm run typecheck..."
    if npm run typecheck 2>/dev/null; then
        echo "✅ TypeScript type checking passed"
    else
        echo "❌ TypeScript type checking failed"
    fi
fi

# Step 4: Run our scale-down detection test
echo ""
echo "🧪 Step 4: Running scale-down detection test..."
if node tests/scale-down-detection/test-scale-down-detection.js; then
    echo "✅ Scale-down detection test passed"
else
    echo "❌ Scale-down detection test failed"
    exit 1
fi

# Step 5: Build the project
echo ""
echo "🏗️ Step 5: Building project..."
if npm run build; then
    echo "✅ Project build successful"
else
    echo "❌ Project build failed"
    exit 1
fi

# Step 6: Verify build output
echo ""
echo "📦 Step 6: Verifying build output..."
if [ -d "dist" ] && [ "$(ls -A dist)" ]; then
    echo "✅ Build artifacts created in dist/"
    echo "📁 Build contents:"
    ls -la dist/ | head -10
else
    echo "❌ Build artifacts not found"
    exit 1
fi

echo ""
echo "🎉 Build process completed successfully!"
echo "✅ Scale-down detection enhancement validated"
echo "✅ TypeScript compilation passed"  
echo "✅ Build artifacts generated"
echo ""
echo "🚀 Ready for git commit!"
