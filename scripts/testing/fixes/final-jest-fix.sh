#!/bin/bash

# Fix remaining issues after initial success
echo "🔧 Fixing Remaining Test Issues"
echo "==============================="
echo

echo "📊 Current Status: 334 → 11 Jest errors (97% improvement!)"
echo "🎯 Addressing remaining 11 Jest configuration errors..."
echo

# 1. Fix the syntax error in enhanced script first
echo "1. Fixing script syntax errors..."

# More robust fix for the syntax error
cat > scripts/test/dual-mode/enhanced-all-summary-fixed.sh << 'EOF'
#!/bin/bash

# ENHANCED MODE - All Unit Tests Summary Analysis (Fixed Version)
echo "🤖 ENHANCED MODE: ALL UNIT TESTS SUMMARY"
echo "========================================"
echo

# Capture all test output for comprehensive analysis
echo "Analyzing all unit tests..."
all_test_output=$(npm run test:unit -- --verbose --no-coverage 2>&1)
test_result=$?

echo "📊 COMPREHENSIVE TEST ANALYSIS"
echo "============================="
echo

# Overall status
if [ $test_result -eq 0 ]; then
    echo "✅ OVERALL STATUS: ALL TESTS PASSED"
else
    echo "❌ OVERALL STATUS: SOME TESTS FAILED"
fi

echo ""
echo "🔍 COMPREHENSIVE ERROR CATEGORIZATION"
echo "===================================="

# Count all error types across all tests (fixed syntax)
ts_errors=$(echo "$all_test_output" | grep -c "error TS" 2>/dev/null || echo "0")
jest_errors=$(echo "$all_test_output" | grep -c "Cannot find name\|jest" 2>/dev/null || echo "0")
import_errors=$(echo "$all_test_output" | grep -c "Cannot find module" 2>/dev/null || echo "0")
failed_suites=$(echo "$all_test_output" | grep -c "FAIL " 2>/dev/null || echo "0")
passed_suites=$(echo "$all_test_output" | grep -c "PASS " 2>/dev/null || echo "0")

echo "📈 SUMMARY STATISTICS:"
echo "   Passed test suites: $passed_suites"
echo "   Failed test suites: $failed_suites"
echo "   TypeScript errors: $ts_errors"
echo "   Jest configuration errors: $jest_errors"
echo "   Import/module errors: $import_errors"

echo ""
echo "📁 FAILED TEST SUITES:"
echo "====================="
if [[ $failed_suites -gt 0 ]]; then
    echo "$all_test_output" | grep "FAIL " | sed 's/.*FAIL /❌ /'
else
    echo "✅ No failed test suites"
fi

echo ""
echo "🎯 ROOT CAUSE ANALYSIS"
echo "====================="

if [[ $jest_errors -gt 0 ]]; then
    echo "🔧 REMAINING JEST ISSUES: $jest_errors instances"
    echo "   Possible causes:"
    echo "   - Jest types not fully loaded"
    echo "   - Test files using deprecated Jest syntax"
    echo "   - Mock setup issues"
    echo ""
fi

if [[ $import_errors -gt 0 ]]; then
    echo "🔧 IMPORT/MODULE ISSUES: $import_errors instances"
    echo "   Check import paths and dependencies"
    echo ""
fi

if [[ $ts_errors -gt 0 ]]; then
    echo "🔧 TYPESCRIPT ISSUES: $ts_errors instances"
    echo "   Check TypeScript configuration"
    echo ""
fi

echo "📋 NEXT STEPS TO RESOLVE REMAINING ISSUES:"
echo "=========================================="

if [[ $jest_errors -gt 0 ]]; then
    echo "1. Restart TypeScript service to reload types:"
    echo "   - VS Code: Ctrl+Shift+P → 'TypeScript: Restart TS Server'"
    echo "   - Or rebuild: npm run build"
    echo ""
    echo "2. Check individual failing tests:"
    echo "   scripts/test/dual-mode/test-control.sh → Option 3"
    echo ""
fi

echo "3. Run individual raw tests to see specific errors:"
if [[ $failed_suites -gt 0 ]]; then
    echo "$all_test_output" | grep "FAIL " | sed 's/.*FAIL /   scripts\/test\/dual-mode\/raw-/' | sed 's|tests/unit/||' | sed 's|/|-|g' | sed 's|\.test\.[jt]s|.sh|'
fi

echo ""
echo "4. Verify all fixes with:"
echo "   scripts/test/dual-mode/test-control.sh"

EOF

chmod +x scripts/test/dual-mode/enhanced-all-summary-fixed.sh

echo "   ✅ Created fixed enhanced summary script"

# 2. Check what specific Jest errors remain
echo ""
echo "2. Analyzing remaining Jest configuration issues..."

# Run a quick test to see the specific errors
echo "   Running quick diagnostic on one failing test..."
test_output=$(npm run test:unit -- tests/unit/config/schema.test.ts --verbose 2>&1 || true)

echo ""
echo "🔍 SPECIFIC REMAINING ERRORS:"
echo "=============================="
echo "$test_output" | grep -A2 -B2 "Cannot find name\|error TS" | head -10

echo ""
echo "3. Potential additional fixes needed..."

# Check if types are properly configured
echo "   📋 Checking TypeScript configuration..."
echo "   Current tsconfig.json types:"
grep -A5 -B5 '"types"' tsconfig.json || echo "   ⚠️ No types array found"

echo ""
echo "🎯 RECOMMENDED NEXT ACTIONS:"
echo "==========================="
echo "1. Use the fixed enhanced script:"
echo "   scripts/test/dual-mode/enhanced-all-summary-fixed.sh"
echo ""
echo "2. Try rebuilding TypeScript to reload types:"
echo "   npm run build"
echo ""
echo "3. Run individual test analysis:"
echo "   scripts/test/dual-mode/test-control.sh → Option 3"
echo ""
echo "4. Check specific Jest syntax in failing test files"

EOF

chmod +x final-jest-fix.sh

echo "✅ Created comprehensive fix script: final-jest-fix.sh"
echo ""
echo "🎯 Run this to address remaining issues:"
echo "   ./final-jest-fix.sh"
