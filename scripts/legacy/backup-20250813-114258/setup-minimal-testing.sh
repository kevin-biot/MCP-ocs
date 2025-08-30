#!/bin/bash

# Quick test setup - minimal but effective
echo "🧪 Setting up minimal testing..."

# Create minimal test directories if they don't exist
mkdir -p tests/tmp

# Quick test commands
echo ""
echo "📋 Available Test Commands:"
echo "npm test                    # Run all unit tests"
echo "npm run test:unit          # Unit tests only"  
echo "npm run test:coverage      # With coverage report"
echo ""

# Test if basic setup works
echo "🔍 Testing basic setup..."

# Check if Jest is installed
if command -v npx jest >/dev/null 2>&1; then
    echo "✅ Jest testing framework ready"
else
    echo "❌ Jest not found - run 'npm install' first"
    exit 1
fi

# Check if TypeScript compiles
echo "🔧 Checking TypeScript compilation..."
if npm run typecheck >/dev/null 2>&1; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️ TypeScript compilation issues - check with 'npm run typecheck'"
fi

# Run a quick test to verify setup
echo "🧪 Running quick test verification..."
if npm test -- --testTimeout=5000 --bail >/dev/null 2>&1; then
    echo "✅ Test framework working"
else
    echo "⚠️ Some tests failing - check with 'npm test'"
fi

echo ""
echo "🎯 Minimal testing setup complete!"
echo "Run 'npm test' to execute all unit tests"
echo "Run 'npm run test:coverage' for coverage report"
