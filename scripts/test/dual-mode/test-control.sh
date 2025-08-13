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

