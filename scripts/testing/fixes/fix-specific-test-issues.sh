#!/bin/bash

# Fix the specific test file issues identified
echo "🔧 Fixing Specific Test File Issues"
echo "=================================="
echo

echo "📋 Issues identified:"
echo "   1. Missing testUtils in openshift-client.test.ts"
echo "   2. Jest mock type assertions"
echo ""

# 1. Check what testUtils should be
echo "🔍 Checking test setup and utilities..."

# Look for test utilities or setup files
if [ -f "tests/setup.ts" ]; then
    echo "   ✅ Found tests/setup.ts"
    echo "   Content preview:"
    head -10 tests/setup.ts
else
    echo "   ⚠️  No tests/setup.ts found"
fi

# Check if there are any existing test utilities
if [ -d "tests/utils" ]; then
    echo "   ✅ Found tests/utils directory:"
    ls tests/utils/
else
    echo "   ⚠️  No tests/utils directory"
fi

# 2. Create missing test utilities
echo ""
echo "🛠️  Creating missing test utilities..."

# Create test utilities if they don't exist
mkdir -p tests/utils

cat > tests/utils/test-helpers.ts << 'EOF'
/**
 * Test Utilities for MCP-ocs Unit Tests
 * Provides mock responses and test helpers
 */

export const testUtils = {
  mockOcResponse: (command: string, stdout: string, stderr: string = '') => {
    return {
      stdout,
      stderr,
      duration: 100,
      cached: false
    };
  },

  mockOpenShiftClient: () => {
    return {
      executeOc: jest.fn(),
      isAuthenticated: jest.fn().mockResolvedValue(true),
      getCurrentContext: jest.fn().mockResolvedValue('test-context')
    };
  },

  mockConfigSchema: () => {
    return {
      validateConfig: jest.fn(),
      getDefaultConfig: jest.fn(),
      mergeConfig: jest.fn()
    };
  }
};

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
EOF

echo "   ✅ Created tests/utils/test-helpers.ts"

# 3. Fix the openshift client test file
echo ""
echo "🔧 Fixing openshift-client.test.ts imports..."

# Add the missing import to the test file
if ! grep -q "testUtils" tests/unit/openshift/openshift-client.test.ts; then
    # Add import at the top of the file (after existing imports)
    sed -i '' '/import.*{/a\
import { testUtils } from "../../utils/test-helpers";
' tests/unit/openshift/openshift-client.test.ts
    
    echo "   ✅ Added testUtils import to openshift-client.test.ts"
else
    echo "   ⚠️  testUtils import already exists"
fi

# 4. Update tsconfig to include tests
echo ""
echo "📝 Updating tsconfig.json to include test files..."

# Ensure tests are included in TypeScript compilation
if ! grep -q '"tests/\*\*/\*"' tsconfig.json; then
    sed -i '' 's/"src\/\*\*\/\*"/"src\/\*\*\/\*", "tests\/\*\*\/\*"/' tsconfig.json
    echo "   ✅ Added tests/**/* to tsconfig.json include"
else
    echo "   ✅ tests/**/* already in tsconfig.json"
fi

# 5. Run enhanced analysis to see improvement
echo ""
echo "📊 Running enhanced analysis to check improvement..."
scripts/test/dual-mode/enhanced-all-summary-fixed.sh

echo ""
echo "✅ Specific fixes applied!"
echo "========================"
echo "🎯 Next steps:"
echo "   1. Check if errors reduced further"
echo "   2. Run individual failing tests to see remaining issues"
echo "   3. Use test-control.sh → Option 3 for individual test analysis"
