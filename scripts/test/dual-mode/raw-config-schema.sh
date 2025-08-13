#!/bin/bash

# RAW MODE - Complete error visibility for: tests/unit/config/schema.test.ts
echo "🔴 RAW MODE: tests/unit/config/schema.test.ts"
echo "============================================="
echo

# Run single test with full verbose output
echo "Running raw test with complete error output..."
npm run test:unit -- "tests/unit/config/schema.test.ts" --verbose --no-coverage

test_result=$?

echo ""
echo "📊 RAW TEST RESULT:"
if [ $test_result -eq 0 ]; then
    echo "✅ tests/unit/config/schema.test.ts PASSED"
else
    echo "❌ tests/unit/config/schema.test.ts FAILED"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Run enhanced mode: scripts/test/dual-mode/enhanced-config-schema.sh"
    echo "   2. Or run summary for all tests: scripts/test/dual-mode/enhanced-all-summary.sh"
fi

echo ""
echo "🎯 Test file: tests/unit/config/schema.test.ts"

