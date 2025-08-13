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

