#!/bin/bash

# Complete Dual-Mode Testing Framework for ALL Unit Tests
# Provides both RAW and ENHANCED modes for structured LLM-friendly debugging

set -e

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"
DUAL_MODE_DIR="$PROJECT_ROOT/scripts/test/dual-mode"

echo "🎯 Creating Complete Dual-Mode Testing Framework"
echo "==============================================="
echo

cd "$PROJECT_ROOT"

# Create dual-mode testing directory
mkdir -p "$DUAL_MODE_DIR"

echo "📋 Available Unit Tests:"
echo "----------------------"

# Find all unit test files
unit_tests=($(find tests/unit -name "*.test.ts" -o -name "*.test.js" | sort))

for i in "${!unit_tests[@]}"; do
    echo "  $((i+1)). ${unit_tests[i]}"
done
echo

echo "🏗️  Creating RAW Mode Scripts..."
echo "--------------------------------"

# Create individual RAW test scripts
for test_file in "${unit_tests[@]}"; do
    test_name=$(basename "$test_file" | sed 's/\.test\.[jt]s$//')
    test_path=$(dirname "$test_file" | sed 's|tests/unit/||' | sed 's|/|-|g')
    if [[ "$test_path" == "." ]]; then
        script_name="raw-${test_name}"
    else
        script_name="raw-${test_path}-${test_name}"
    fi
    
    cat > "$DUAL_MODE_DIR/${script_name}.sh" << EOF
#!/bin/bash

# RAW MODE - Complete error visibility for: $test_file
echo "🔴 RAW MODE: $test_file"
echo "============================================="
echo

# Run single test with full verbose output
echo "Running raw test with complete error output..."
npm run test:unit -- "$test_file" --verbose --no-coverage

test_result=\$?

echo ""
echo "📊 RAW TEST RESULT:"
if [ \$test_result -eq 0 ]; then
    echo "✅ $test_file PASSED"
else
    echo "❌ $test_file FAILED"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Run enhanced mode: scripts/test/dual-mode/enhanced-${script_name#raw-}.sh"
    echo "   2. Or run summary for all tests: scripts/test/dual-mode/enhanced-all-summary.sh"
fi

echo ""
echo "🎯 Test file: $test_file"

EOF

    chmod +x "$DUAL_MODE_DIR/${script_name}.sh"
    echo "   Created: ${script_name}.sh"
done

echo
echo "🤖 Creating ENHANCED Mode Scripts..."
echo "-----------------------------------"

# Create individual ENHANCED test scripts
for test_file in "${unit_tests[@]}"; do
    test_name=$(basename "$test_file" | sed 's/\.test\.[jt]s$//')
    test_path=$(dirname "$test_file" | sed 's|tests/unit/||' | sed 's|/|-|g')
    if [[ "$test_path" == "." ]]; then
        script_name="enhanced-${test_name}"
    else
        script_name="enhanced-${test_path}-${test_name}"
    fi
    
    cat > "$DUAL_MODE_DIR/${script_name}.sh" << EOF
#!/bin/bash

# ENHANCED MODE - Structured analysis for: $test_file
echo "🤖 ENHANCED MODE: $test_file"
echo "============================================="
echo

# Capture test output for analysis
echo "Running test and analyzing output..."
test_output=\$(npm run test:unit -- "$test_file" --verbose --no-coverage 2>&1)
test_result=\$?

echo "📊 STRUCTURED ANALYSIS REPORT"
echo "============================"
echo

# Basic test status
if [ \$test_result -eq 0 ]; then
    echo "✅ TEST STATUS: PASSED"
else
    echo "❌ TEST STATUS: FAILED"
fi

echo ""
echo "🔍 ERROR CATEGORIZATION"
echo "======================"

# Count specific error types
ts_errors=\$(echo "\$test_output" | grep -c "error TS" || echo "0")
jest_errors=\$(echo "\$test_output" | grep -c "Cannot find name" || echo "0")
import_errors=\$(echo "\$test_output" | grep -c "Cannot find module" || echo "0")
mock_errors=\$(echo "\$test_output" | grep -c "jest.mock\|jest.fn" || echo "0")

echo "TypeScript compilation errors: \$ts_errors"
echo "Jest configuration issues: \$jest_errors"
echo "Import/module errors: \$import_errors"
echo "Mock setup errors: \$mock_errors"

echo ""
echo "🎯 SPECIFIC ISSUES FOR: $(basename $test_file)"
echo "==========================================="

# Extract specific error lines
if [[ \$ts_errors -gt 0 ]]; then
    echo ""
    echo "🔧 TypeScript Errors:"
    echo "\$test_output" | grep "error TS" | head -3
fi

if [[ \$jest_errors -gt 0 ]]; then
    echo ""
    echo "🔧 Jest Configuration Issues:"
    echo "\$test_output" | grep "Cannot find name" | head -3
fi

if [[ \$import_errors -gt 0 ]]; then
    echo ""
    echo "🔧 Import/Module Issues:"
    echo "\$test_output" | grep "Cannot find module" | head -3
fi

echo ""
echo "📋 RECOMMENDED ACTIONS FOR THIS TEST:"
echo "======================================"

if [[ \$jest_errors -gt 0 ]]; then
    echo "1. Install Jest types: npm install --save-dev @types/jest"
    echo "2. Add 'jest' to tsconfig.json types array"
fi

if [[ \$import_errors -gt 0 ]]; then
    echo "3. Check import paths in $test_file"
    echo "4. Verify required dependencies are installed"
fi

if [[ \$mock_errors -gt 0 ]]; then
    echo "5. Fix Jest mock setup in $test_file"
fi

if [ \$test_result -eq 0 ]; then
    echo "✅ No actions needed - test is passing!"
fi

echo ""
echo "🔄 VERIFICATION STEPS:"
echo "====================="
echo "1. Apply recommended fixes above"
echo "2. Re-run raw mode: scripts/test/dual-mode/raw-${script_name#enhanced-}.sh"
echo "3. Re-run enhanced mode: scripts/test/dual-mode/${script_name}.sh"

EOF

    chmod +x "$DUAL_MODE_DIR/${script_name}.sh"
    echo "   Created: ${script_name}.sh"
done

echo
echo "🎛️  Creating Control Scripts..."
echo "------------------------------"

# Create ALL TESTS - RAW MODE
cat > "$DUAL_MODE_DIR/raw-all-tests.sh" << 'EOF'
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

EOF

# Create ALL TESTS - ENHANCED SUMMARY
cat > "$DUAL_MODE_DIR/enhanced-all-summary.sh" << 'EOF'
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

EOF

# Create Test Control Menu
cat > "$DUAL_MODE_DIR/test-control.sh" << 'EOF'
#!/bin/bash

# Test Control Menu - Choose execution mode
echo "🎛️  DUAL-MODE TEST CONTROL CENTER"
echo "================================="
echo

echo "Available execution modes:"
echo "  1. 🔴 RAW MODE - All Tests (complete error output)"
echo "  2. 🤖 ENHANCED MODE - All Tests Summary (structured analysis)"
echo "  3. 🔍 Individual Test Selection"
echo "  4. 📊 Test Status Overview"
echo "  0. Exit"
echo

read -p "Select mode (0-4): " choice

case $choice in
    1)
        echo "🔴 Running RAW MODE for all tests..."
        scripts/test/dual-mode/raw-all-tests.sh
        ;;
    2)
        echo "🤖 Running ENHANCED MODE summary..."
        scripts/test/dual-mode/enhanced-all-summary.sh
        ;;
    3)
        echo "🔍 Individual test selection..."
        echo ""
        echo "Available individual tests:"
        ls scripts/test/dual-mode/raw-*.sh | sed 's|scripts/test/dual-mode/raw-||' | sed 's|\.sh||' | nl
        echo ""
        read -p "Enter test name (or 'list' to see enhanced tests): " test_name
        
        if [[ "$test_name" == "list" ]]; then
            echo "Enhanced mode tests:"
            ls scripts/test/dual-mode/enhanced-*.sh | sed 's|scripts/test/dual-mode/||' | nl
        elif [[ -f "scripts/test/dual-mode/raw-${test_name}.sh" ]]; then
            scripts/test/dual-mode/raw-${test_name}.sh
        elif [[ -f "scripts/test/dual-mode/enhanced-${test_name}.sh" ]]; then
            scripts/test/dual-mode/enhanced-${test_name}.sh
        else
            echo "❌ Test not found: $test_name"
        fi
        ;;
    4)
        echo "📊 Running test status overview..."
        scripts/test/test-status.sh
        ;;
    0)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid selection"
        exit 1
        ;;
esac

EOF

# Make all control scripts executable
chmod +x "$DUAL_MODE_DIR"/*.sh

echo
echo "✅ Complete Dual-Mode Testing Framework Created!"
echo "==============================================="
echo

echo "📊 Framework Summary:"
echo "   Unit tests found: ${#unit_tests[@]}"
echo "   RAW mode scripts: $(ls $DUAL_MODE_DIR/raw-*.sh | wc -l)"
echo "   ENHANCED mode scripts: $(ls $DUAL_MODE_DIR/enhanced-*.sh | wc -l)"
echo "   Control scripts: 3"

echo
echo "🎛️  CONTROL CENTER USAGE:"
echo "========================"
echo "  scripts/test/dual-mode/test-control.sh          # Main control menu"
echo ""
echo "🔴 RAW MODE (Complete Error Output):"
echo "  scripts/test/dual-mode/raw-all-tests.sh         # All tests raw mode"
echo "  scripts/test/dual-mode/raw-[testname].sh        # Individual test raw"
echo ""
echo "🤖 ENHANCED MODE (Structured Analysis):"
echo "  scripts/test/dual-mode/enhanced-all-summary.sh  # All tests summary"
echo "  scripts/test/dual-mode/enhanced-[testname].sh   # Individual test enhanced"
echo ""
echo "🎯 START HERE:"
echo "  scripts/test/dual-mode/test-control.sh"
echo
echo "✅ Complete dual-mode framework ready for test staff control!"
