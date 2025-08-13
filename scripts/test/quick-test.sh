#!/bin/bash

# Quick Test Runner - Test specific file by pattern
if [ $# -eq 0 ]; then
    echo "🔬 Quick Test Runner"
    echo "==================="
    echo "Usage: $0 <test-pattern>"
    echo ""
    echo "Examples:"
    echo "  $0 config           # Test config-related tests"
    echo "  $0 logging          # Test logging-related tests"
    echo "  $0 openshift        # Test openshift-related tests"
    echo "  $0 basic            # Test basic.test.ts"
    echo ""
    exit 1
fi

pattern="$1"
echo "🔍 Running tests matching pattern: $pattern"
echo "==========================================="

npm run test:unit -- --testNamePattern="$pattern" --verbose

