#!/bin/bash

# ENHANCED MODE - Structured analysis for: tests/unit/basic.test.ts
echo "🤖 ENHANCED MODE: tests/unit/basic.test.ts"
echo "============================================="
echo

# Capture test output for analysis
echo "Running test and analyzing output..."
test_output=$(npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1)
test_result=$?

echo "📊 STRUCTURED ANALYSIS REPORT"
echo "============================"
echo

# Basic test status
if [ $test_result -eq 0 ]; then
    echo "✅ TEST STATUS: PASSED"
else
    echo "❌ TEST STATUS: FAILED"
fi

echo ""
echo "🔍 ERROR CATEGORIZATION"
echo "======================"

# Count specific error types
ts_errors=$(echo "$test_output" | grep -c "error TS" || echo "0")
jest_errors=$(echo "$test_output" | grep -c "Cannot find name" || echo "0")
import_errors=$(echo "$test_output" | grep -c "Cannot find module" || echo "0")
mock_errors=$(echo "$test_output" | grep -c "jest.mock\|jest.fn" || echo "0")

echo "TypeScript compilation errors: $ts_errors"
echo "Jest configuration issues: $jest_errors"
echo "Import/module errors: $import_errors"
echo "Mock setup errors: $mock_errors"

echo ""
echo "🎯 SPECIFIC ISSUES FOR: basic.test.ts"
echo "==========================================="

# Extract specific error lines
if [[ $ts_errors -gt 0 ]]; then
    echo ""
    echo "🔧 TypeScript Errors:"
    echo "$test_output" | grep "error TS" | head -3
fi

if [[ $jest_errors -gt 0 ]]; then
    echo ""
    echo "🔧 Jest Configuration Issues:"
    echo "$test_output" | grep "Cannot find name" | head -3
fi

if [[ $import_errors -gt 0 ]]; then
    echo ""
    echo "🔧 Import/Module Issues:"
    echo "$test_output" | grep "Cannot find module" | head -3
fi

echo ""
echo "📋 RECOMMENDED ACTIONS FOR THIS TEST:"
echo "======================================"

if [[ $jest_errors -gt 0 ]]; then
    echo "1. Install Jest types: npm install --save-dev @types/jest"
    echo "2. Add 'jest' to tsconfig.json types array"
fi

if [[ $import_errors -gt 0 ]]; then
    echo "3. Check import paths in tests/unit/basic.test.ts"
    echo "4. Verify required dependencies are installed"
fi

if [[ $mock_errors -gt 0 ]]; then
    echo "5. Fix Jest mock setup in tests/unit/basic.test.ts"
fi

if [ $test_result -eq 0 ]; then
    echo "✅ No actions needed - test is passing!"
fi

echo ""
echo "🔄 VERIFICATION STEPS:"
echo "====================="
echo "1. Apply recommended fixes above"
echo "2. Re-run raw mode: scripts/test/dual-mode/raw-tests-unit-basic.sh"
echo "3. Re-run enhanced mode: scripts/test/dual-mode/enhanced-tests-unit-basic.sh"

