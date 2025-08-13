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
    
    # Show categorized error types from the test run
    echo "Error Categories Found:"
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "(FAIL|ERROR|TypeError|ReferenceError|SyntaxError|AssertionError)" | \
        head -10
    
    echo ""
    
    # Show source files with issues  
    echo "Source Files with Issues:"
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "src/.*\.ts" | \
        sort | uniq
    
    echo ""
    
    # Provide structured fix guidance
    echo "🔧 Fix Planning Guidance"
    echo "------------------------"
    echo "1. Most Common Error Types Detected:"
    
    # Count error types in the output
    npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1 | \
        grep -E "(ERROR|FAIL)" | \
        awk '{print "   - " $0}' | \
        head -5
    
    echo ""
    echo "2. Next Steps for Fixing:"
    echo "   - Review the specific error messages above"
    echo "   - Focus on root causes first"
    echo "   - Use the source file mapping to identify problem areas"
    
    echo ""
    echo "🔧 To debug this test in detail:"
    echo "   npm run test:unit -- \"tests/unit/basic.test.ts\" --verbose --no-coverage"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/basic.test.ts"
fi

echo ""
echo "🧪 Enhanced Test Analysis Complete"