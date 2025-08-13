#!/bin/bash

# Granular Unit Test Framework - Test one file at a time for surgical debugging
# Prevents overwhelming error output and allows focused fixing

set -e

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"
TEST_DIR="$PROJECT_ROOT/tests/unit"

echo "🔬 Granular Unit Test Framework"
echo "==============================="
echo

cd "$PROJECT_ROOT"

# Create test-by-test scripts directory
mkdir -p scripts/test/granular

echo "📋 Analyzing available unit tests..."
echo "-----------------------------------"

# Find all unit test files
unit_tests=($(find tests/unit -name "*.test.ts" -o -name "*.test.js" | sort))

echo "Found ${#unit_tests[@]} unit test files:"
for i in "${!unit_tests[@]}"; do
    echo "  $((i+1)). ${unit_tests[i]}"
done
echo

# Create individual test scripts
echo "🛠️  Creating granular test scripts..."
echo "------------------------------------"

for i in "${!unit_tests[@]}"; do
    test_file="${unit_tests[i]}"
    test_name=$(basename "$test_file" .test.ts)
    test_name=$(basename "$test_name" .test.js)
    script_name="test-$(echo $test_name | tr '/' '-')"
    
    cat > "scripts/test/granular/${script_name}.sh" << EOF
#!/bin/bash

# Granular test for: $test_file
echo "🔬 Testing: $test_file"
echo "========================="

# Run single test file with detailed output
npm run test:unit -- "$test_file" --verbose --no-coverage

if [ \$? -eq 0 ]; then
    echo "✅ $test_file PASSED"
else
    echo "❌ $test_file FAILED"
    echo ""
    echo "🔧 To debug this test:"
    echo "   npm run test:unit -- \"$test_file\" --verbose"
    echo ""
    echo "🔍 Test file location:"
    echo "   $test_file"
fi
EOF

    chmod +x "scripts/test/granular/${script_name}.sh"
    echo "   Created: scripts/test/granular/${script_name}.sh"
done

# Create test selector menu
cat > "scripts/test/test-selector.sh" << 'EOF'
#!/bin/bash

# Interactive Test Selector - Choose which test to run
echo "🎯 Unit Test Selector"
echo "===================="
echo

# Find all granular test scripts
granular_tests=($(find scripts/test/granular -name "*.sh" | sort))

if [ ${#granular_tests[@]} -eq 0 ]; then
    echo "❌ No granular tests found. Run create-granular-tests.sh first."
    exit 1
fi

echo "Available unit tests:"
for i in "${!granular_tests[@]}"; do
    test_name=$(basename "${granular_tests[i]}" .sh)
    echo "  $((i+1)). $test_name"
done
echo "  0. Run all tests (sequential)"
echo

read -p "Select test to run (1-${#granular_tests[@]} or 0): " choice

if [[ "$choice" == "0" ]]; then
    echo "🚀 Running all tests sequentially..."
    for test_script in "${granular_tests[@]}"; do
        echo ""
        "$test_script"
        read -p "Press Enter to continue to next test, or Ctrl+C to stop..."
    done
elif [[ "$choice" =~ ^[1-9][0-9]*$ ]] && [ "$choice" -le "${#granular_tests[@]}" ]; then
    selected_test="${granular_tests[$((choice-1))]}"
    echo "🔬 Running: $(basename "$selected_test" .sh)"
    "$selected_test"
else
    echo "❌ Invalid selection"
    exit 1
fi

EOF

chmod +x "scripts/test/test-selector.sh"

# Create quick test runner for specific files
cat > "scripts/test/quick-test.sh" << 'EOF'
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

EOF

chmod +x "scripts/test/quick-test.sh"

# Create working/broken test tracker
cat > "scripts/test/test-status.sh" << 'EOF'
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

EOF

chmod +x "scripts/test/test-status.sh"

echo
echo "✅ Granular Unit Test Framework Created!"
echo "======================================="
echo
echo "📋 Available Commands:"
echo "   scripts/test/test-selector.sh    # Interactive test selection"
echo "   scripts/test/quick-test.sh config # Test specific pattern"
echo "   scripts/test/test-status.sh      # See working/broken tests"
echo
echo "🎯 Granular Test Scripts Created:"
ls scripts/test/granular/ | wc -l | xargs echo "   Total scripts:"
echo
echo "🔬 Start with: scripts/test/test-status.sh"
echo "   This will show you which tests work and which need fixing"
