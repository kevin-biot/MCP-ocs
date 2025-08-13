#!/bin/bash

# ENHANCED MODE - All Unit Tests Summary Analysis
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

# Count all error types across all tests
ts_errors=$(echo "$all_test_output" | grep -c "error TS" || echo "0")
jest_errors=$(echo "$all_test_output" | grep -c "Cannot find name" || echo "0")
import_errors=$(echo "$all_test_output" | grep -c "Cannot find module" || echo "0")
failed_suites=$(echo "$all_test_output" | grep -c "FAIL " || echo "0")
passed_suites=$(echo "$all_test_output" | grep -c "PASS " || echo "0")

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
    echo "🔧 PRIMARY ISSUE: Jest type definitions missing"
    echo "   Impact: Affects $jest_errors instances across test files"
    echo "   Fix: npm install --save-dev @types/jest"
    echo ""
fi

if [[ $import_errors -gt 0 ]]; then
    echo "🔧 SECONDARY ISSUE: Import/module resolution"
    echo "   Impact: $import_errors import errors detected"
    echo "   Fix: Check import paths and dependencies"
    echo ""
fi

if [[ $ts_errors -gt 0 ]]; then
    echo "🔧 COMPILATION ISSUES: TypeScript configuration"
    echo "   Impact: $ts_errors TypeScript compilation errors"
    echo "   Fix: Review tsconfig.json and type definitions"
    echo ""
fi

echo "📋 PRIORITY FIX PLAN FOR ALL TESTS:"
echo "===================================="
echo "1. Install missing dependencies:"
echo "   npm install --save-dev @types/jest"
echo ""
echo "2. Update TypeScript configuration:"
echo "   Add 'jest' to types array in tsconfig.json"
echo ""
echo "3. Run individual enhanced tests for failing suites:"
if [[ $failed_suites -gt 0 ]]; then
    echo "$all_test_output" | grep "FAIL " | sed 's/.*FAIL /   scripts\/test\/dual-mode\/enhanced-/' | sed 's/\.test\.[jt]s/.sh/'
fi
echo ""
echo "4. Verify fixes with raw mode:"
echo "   scripts/test/dual-mode/raw-all-tests.sh"

