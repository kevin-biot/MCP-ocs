#!/bin/bash

# Quick fix for the persistent syntax error in enhanced summary
echo "🔧 Fixing the persistent syntax error..."

# The issue is with the grep output having newlines
# Let's create a completely clean version

cat > scripts/test/dual-mode/enhanced-clean.sh << 'EOF'
#!/bin/bash

# ENHANCED MODE - Clean Version Without Syntax Errors
echo "🤖 ENHANCED MODE: ALL UNIT TESTS SUMMARY (CLEAN VERSION)"
echo "======================================================="
echo

# Run tests and capture output
echo "Analyzing all unit tests..."
test_output=$(npm run test:unit -- --verbose --no-coverage 2>&1)
exit_code=$?

echo "📊 TEST ANALYSIS RESULTS"
echo "========================"
echo

# Overall status
if [ $exit_code -eq 0 ]; then
    echo "✅ OVERALL STATUS: ALL TESTS PASSED"
else
    echo "❌ OVERALL STATUS: SOME TESTS FAILED"
fi

echo ""
echo "🔍 ERROR ANALYSIS"
echo "=================="

# Count errors more safely
ts_error_count=$(echo "$test_output" | grep -c "error TS" 2>/dev/null || true)
jest_error_count=$(echo "$test_output" | grep -c "Cannot find name" 2>/dev/null || true)
import_error_count=$(echo "$test_output" | grep -c "Cannot find module" 2>/dev/null || true)
failed_count=$(echo "$test_output" | grep -c "FAIL " 2>/dev/null || true)
passed_count=$(echo "$test_output" | grep -c "PASS " 2>/dev/null || true)

echo "📈 SUMMARY:"
echo "   ✅ Passed test suites: $passed_count"
echo "   ❌ Failed test suites: $failed_count"
echo "   🔴 TypeScript errors: $ts_error_count"
echo "   🟡 Jest errors: $jest_error_count"
echo "   🟠 Import errors: $import_error_count"

echo ""
echo "📁 FAILED TEST FILES:"
echo "===================="
if [ $failed_count -gt 0 ]; then
    echo "$test_output" | grep "FAIL " | sed 's/.*FAIL /❌ /'
else
    echo "✅ No failed test files"
fi

echo ""
echo "🎯 SPECIFIC ERROR SAMPLES:"
echo "=========================="
if [ $jest_error_count -gt 0 ]; then
    echo "🔧 Jest Configuration Errors (first 3):"
    echo "$test_output" | grep "Cannot find name" | head -3 | sed 's/^/   /'
    echo ""
fi

if [ $ts_error_count -gt 0 ]; then
    echo "🔧 TypeScript Errors (first 3):"
    echo "$test_output" | grep "error TS" | head -3 | sed 's/^/   /'
    echo ""
fi

echo "📋 RECOMMENDED ACTIONS:"
echo "======================"
if [ $jest_error_count -gt 0 ]; then
    echo "1. Run individual test analysis:"
    echo "   scripts/test/dual-mode/raw-openshift-client.sh"
    echo "   scripts/test/dual-mode/raw-config-schema.sh"
    echo "   scripts/test/dual-mode/raw-structured-logger.sh"
    echo ""
fi

echo "2. Try rebuilding TypeScript:"
echo "   npm run build"
echo ""

echo "3. Check specific test file issues with raw mode"

EOF

chmod +x scripts/test/dual-mode/enhanced-clean.sh

echo "✅ Created clean enhanced script without syntax errors"
echo ""
echo "🧪 Testing the clean script..."
scripts/test/dual-mode/enhanced-clean.sh
