#!/bin/bash

# RAW MODE - All Unit Tests with Complete Error Output
echo "🔴 RAW MODE: ALL UNIT TESTS"
echo "=========================="
echo

echo "Running all unit tests with complete error visibility..."
echo "⚠️  WARNING: This may produce extensive output!"
echo

read -p "Continue with raw mode for all tests? (y/n): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "Cancelled."
    exit 0
fi

npm run test:unit -- --verbose --no-coverage

test_result=$?

echo ""
echo "📊 RAW ALL TESTS RESULT:"
if [ $test_result -eq 0 ]; then
    echo "✅ ALL TESTS PASSED"
else
    echo "❌ SOME TESTS FAILED"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Run enhanced summary: scripts/test/dual-mode/enhanced-all-summary.sh"
    echo "   2. Or run individual enhanced tests for specific files"
fi

