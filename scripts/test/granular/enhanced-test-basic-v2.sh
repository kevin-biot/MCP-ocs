#!/bin/bash

# Enhanced Granular Test for: tests/unit/basic.test.ts
# Provides improved error grouping and structured output for systematic debugging

echo "🔬 Enhanced Testing: tests/unit/basic.test.ts"
echo "============================================"

# Run single test file with detailed output
echo "Running test with verbose output..."
npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage

# Capture the exit code
EXIT_CODE=$?

echo ""
echo "📊 Test Execution Summary"
echo "======================="

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ tests/unit/basic.test.ts PASSED"
    echo ""
    echo "🎉 All tests passed successfully!"
    echo "   No issues detected in basic functionality"
else
    echo "❌ tests/unit/basic.test.ts FAILED"
    echo ""
    
    # Enhanced error analysis - capture full output for better categorization
    echo "🔍 Detailed Error Analysis"
    echo "-------------------------"
    
    # Capture full test output to analyze errors
    TEST_OUTPUT=$(npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1)
    
    # Show categorized error types
    echo "Error Categories Found:"
    echo "$TEST_OUTPUT" | \
        grep -E "(FAIL|ERROR|TypeError|ReferenceError|SyntaxError|AssertionError|Cannot read property)" | \
        awk '{print "   - " $0}' | \
        head -10
    
    echo ""
    
    # Show source files with issues (more reliable extraction)
    echo "Source Files with Issues:"
    echo "$TEST_OUTPUT" | \
        grep -E "src/.*\.ts" | \
        awk '{print "   - " $0}' | \
        sort | uniq
    
    echo ""
    
    # Provide structured fix guidance based on actual errors found
    echo "🔧 Fix Planning Guidance"
    echo "------------------------"
    
    # Count and report most common error types
    ERROR_COUNTS=$(echo "$TEST_OUTPUT" | \
        grep -E "(ERROR|FAIL)" | \
        awk '{print $1}' | \
        sort | uniq -c)
    
    if [ -n "$ERROR_COUNTS" ]; then
        echo "Most Frequent Error Types:"
        echo "$ERROR_COUNTS" | head -5
    else
        echo "No specific error counts available"
    fi
    
    echo ""
    echo "2. Next Steps:"
    echo "   - Analyze the detailed error output above"
    echo "   - Focus on root causes first"
    echo "   - Use the source file mapping to target specific areas"
    
    echo ""
    echo "🔧 To debug this test in detail:"
    echo "   npm run test:unit -- \"tests/unit/basic.test.ts\" --verbose --no-coverage"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/basic.test.ts"
fi

echo ""
echo "🧪 Enhanced Test Analysis Complete"