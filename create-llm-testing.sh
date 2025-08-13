#!/bin/bash

# LLM-Optimized Testing Framework - Dual Mode Approach
# Combines raw visibility with structured analysis for efficient LLM debugging

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"

echo "🤖 LLM-Optimized Testing Framework"
echo "=================================="
echo

cd "$PROJECT_ROOT"

# Create LLM-friendly test scripts
mkdir -p scripts/test/llm-optimized

# 1. Raw Test Mode - Complete visibility
cat > "scripts/test/llm-optimized/test-raw.sh" << 'EOF'
#!/bin/bash

# RAW MODE - Shows all errors for complete visibility
echo "🔴 RAW TEST MODE - Complete Error Visibility"
echo "==========================================="
echo

# Run full regression with all output
npm run test:unit -- --verbose --no-coverage 2>&1

echo ""
echo "📊 RAW MODE COMPLETE"
echo "Use test-summary.sh for structured analysis"

EOF

# 2. Summary Test Mode - LLM-friendly analysis  
cat > "scripts/test/llm-optimized/test-summary.sh" << 'EOF'
#!/bin/bash

# SUMMARY MODE - Structured analysis for LLM understanding
echo "🤖 SUMMARY MODE - Structured Error Analysis"
echo "=========================================="
echo

# Capture test output
test_output=$(npm run test:unit -- --verbose --no-coverage 2>&1)
exit_code=$?

# Analyze errors and create structured report
echo "OVERALL TEST STATUS"
if [ $exit_code -eq 0 ]; then
    echo "✅ All tests passing"
else
    echo "❌ Tests failing - see analysis below"
fi

echo ""
echo "🔍 ERROR CATEGORIZATION"

# Count error types
ts_errors=$(echo "$test_output" | grep -c "error TS" || echo "0")
jest_errors=$(echo "$test_output" | grep -c "Cannot find name 'jest'" || echo "0")
import_errors=$(echo "$test_output" | grep -c "Cannot find module" || echo "0")

echo "TypeScript compilation errors: $ts_errors"
echo "Jest configuration issues: $jest_errors"  
echo "Import/module errors: $import_errors"

echo ""
echo "📁 TEST SUITE FAILURES:"
failed_suites=$(echo "$test_output" | grep "FAIL" | wc -l)
echo "Failed test suites: $failed_suites"

# Show specific failing files
echo "$test_output" | grep "FAIL" | sed 's/.*FAIL /❌ /'

echo ""
echo "🎯 ROOT CAUSE ANALYSIS"
echo "====================="

if [ $jest_errors -gt 0 ]; then
    echo "🔧 PRIMARY ISSUE: Missing Jest type definitions"
    echo "   Fix: npm install --save-dev @types/jest"
    echo ""
fi

if [ $import_errors -gt 0 ]; then
    echo "🔧 SECONDARY ISSUE: Missing module imports"
    echo "   Check: Import paths and dependencies"
    echo ""
fi

if [ $ts_errors -gt 0 ]; then
    echo "🔧 COMPILATION ISSUES: TypeScript configuration"
    echo "   Check: tsconfig.json and type definitions"
    echo ""
fi

echo "📋 RECOMMENDED FIX ORDER:"
echo "1. Install missing dependencies (npm install --save-dev @types/jest)"
echo "2. Fix TypeScript configuration issues"
echo "3. Run individual tests to verify fixes"
echo "4. Re-run raw mode to confirm all errors resolved"

EOF

# 3. Fix Cycle Helper
cat > "scripts/test/llm-optimized/fix-cycle.sh" << 'EOF'
#!/bin/bash

# Fix Cycle Helper - Guides through systematic fixing
echo "🔄 Fix Cycle Helper"
echo "=================="
echo

echo "This script guides you through the systematic fix cycle:"
echo ""
echo "1. 🔴 RAW MODE - See all problems"
echo "   → scripts/test/llm-optimized/test-raw.sh"
echo ""
echo "2. 🤖 SUMMARY MODE - Get structured analysis"  
echo "   → scripts/test/llm-optimized/test-summary.sh"
echo ""
echo "3. 🔧 FIX ISSUES - Address specific problems from summary"
echo ""
echo "4. ✅ VERIFY - Re-run raw mode to confirm fixes"
echo ""

read -p "Run summary analysis now? (y/n): " run_summary

if [[ "$run_summary" == "y" ]]; then
    scripts/test/llm-optimized/test-summary.sh
fi

EOF

# Make scripts executable
chmod +x scripts/test/llm-optimized/*.sh

echo "✅ LLM-Optimized Testing Framework Created!"
echo "=========================================="
echo
echo "🎯 Usage Workflow:"
echo "  1. scripts/test/llm-optimized/test-summary.sh  # Get structured analysis"
echo "  2. Fix issues based on structured report"
echo "  3. scripts/test/llm-optimized/test-raw.sh     # Verify all errors gone"
echo
echo "🤖 LLM-Friendly Features:"
echo "  ✅ Structured error categorization"
echo "  ✅ Clear fix priorities"  
echo "  ✅ Actionable recommendations"
echo "  ✅ Systematic workflow"
echo
echo "🔄 Use: scripts/test/llm-optimized/fix-cycle.sh for guided process"
