#!/bin/bash

# Scale-Down Detection Enhancement - Build and Test Script
echo "🚀 Scale-Down Detection Enhancement - Build and Test"
echo "================================================="

set -e  # Exit on any error

# Change to project directory
cd /Users/kevinbrown/MCP-ocs

echo "📁 Current directory: $(pwd)"

# Step 1: Clean previous builds
echo ""
echo "🧹 Step 1: Cleaning previous builds..."
npm run clean

# Step 2: Type checking
echo ""
echo "🔍 Step 2: TypeScript type checking..."
npm run typecheck

# Step 3: Build
echo ""
echo "🏗️ Step 3: Building project..."
npm run build

# Step 4: Run our custom scale-down detection test
echo ""
echo "🧪 Step 4: Running scale-down detection test..."
node tests/scale-down-detection/test-scale-down-detection.js

# Step 5: Run unit tests (if they exist)
echo ""
echo "🧪 Step 5: Running unit tests..."
if [ -d "tests/unit" ] && [ "$(ls -A tests/unit)" ]; then
    npm run test:unit
else
    echo "ℹ️ No unit tests found, skipping..."
fi

# Step 6: Lint check
echo ""
echo "🔧 Step 6: Running linter..."
if npm run lint > /dev/null 2>&1; then
    echo "✅ Linting passed"
else
    echo "⚠️ Linting issues found, running auto-fix..."
    npm run lint:fix
fi

# Step 7: Format check
echo ""
echo "📝 Step 7: Checking code formatting..."
if npm run format:check > /dev/null 2>&1; then
    echo "✅ Code formatting is correct"
else
    echo "⚠️ Code formatting issues found, running auto-format..."
    npm run format
fi

echo ""
echo "🎉 Build and test process completed successfully!"
echo "📦 Build artifacts available in: dist/"
echo "🧪 Scale-down detection enhancement validated!"
