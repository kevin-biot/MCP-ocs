#!/bin/bash

# Test Status Tracker - See which tests are working/broken
echo "📊 Unit Test Status Report"
echo "=========================="
echo

working_tests=0
broken_tests=0

# Check each granular test
granular_tests=($(find scripts/test/granular -name "*.sh" | sort))

for test_script in "${granular_tests[@]}"; do
    test_name=$(basename "$test_script" .sh)
    
    # Run test silently to check status
    if "$test_script" &>/dev/null; then
        echo "✅ $test_name"
        ((working_tests++))
    else
        echo "❌ $test_name"
        ((broken_tests++))
    fi
done

echo ""
echo "📈 Summary:"
echo "   Working tests: $working_tests"
echo "   Broken tests:  $broken_tests"
echo "   Total tests:   $((working_tests + broken_tests))"

if [ $broken_tests -gt 0 ]; then
    echo ""
    echo "🔧 To fix broken tests one by one:"
    echo "   scripts/test/test-selector.sh"
fi

