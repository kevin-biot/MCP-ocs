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
    
    # Enhanced error analysis
    echo "🔍 Detailed Error Analysis"
    echo "-------------------------"
    
    # Extract and categorize errors from the test run
    echo "Error Categories Found:"
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "(FAIL|ERROR|TypeError|ReferenceError|SyntaxError|AssertionError)" | \
        awk '{print "   - " $0}' | \
        head -10
    
    echo ""
    
    # Show source file information
    echo "Source Files with Issues:"
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "src/.*\.ts" | \
        awk '{print "   - " $0}' | \
        sort | uniq
    
    echo ""
    
    # Provide structured fix guidance
    echo "🔧 Fix Planning Guidance"
    echo "------------------------"
    echo "1. Most Common Error Types:"
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "(ERROR|FAIL)" | \
        awk '{print "   - " $0}' | \
        head -5
    
    echo ""
    echo "2. Next Steps:"
    echo "   - Run with --verbose to see detailed test output"
    echo "   - Focus on fixing the most frequent error patterns first"
    echo "   - Use the structured report to prioritize fixes"
    
    echo ""
    echo "🔧 To debug this test in detail:"
    echo "   npm run test:unit -- \"tests/unit/basic.test.ts\" --verbose --no-coverage"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/basic.test.ts"
fi

echo ""
echo "🧪 Enhanced Test Analysis Complete"