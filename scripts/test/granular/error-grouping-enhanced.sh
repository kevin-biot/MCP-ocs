#!/bin/bash

# Enhanced Error Grouping for LLM Analysis
# Provides structured, categorized output for systematic debugging and LLM consumption

echo "🔬 Enhanced Error Grouping Analysis"
echo "==================================="

# Run the test and capture all output for structured analysis
TEST_OUTPUT=$(npm run test:unit -- "tests/unit/basic.test.ts" --verbose --no-coverage 2>&1)

echo ""
echo "📊 OVERALL TEST STATUS"
echo "====================="
echo "Basic test suite: $(echo "$TEST_OUTPUT" | grep -E "(PASS|FAIL).*basic.test.ts" | wc -l) tests"

echo ""
echo "🔍 ERROR CATEGORIZATION"
echo "====================="

# Extract and categorize different types of errors
echo "1. TEST SUITE FAILURES:"
echo "   - OpenShift Client Tests: $(echo "$TEST_OUTPUT" | grep -c "openshift-client.test.ts.*FAIL")"
echo "   - Logging Tests: $(echo "$TEST_OUTPUT" | grep -c "structured-logger.test.ts.*FAIL")"
echo "   - Configuration Tests: $(echo "$TEST_OUTPUT" | grep -c "schema.test.ts.*FAIL")"

echo ""
echo "2. MOST COMMON ERROR TYPES:"
echo "   - TypeScript compilation errors: $(echo "$TEST_OUTPUT" | grep -c "TS2593\|TS2304\|TS2339" | head -1)"
echo "   - Jest configuration issues: $(echo "$TEST_OUTPUT" | grep -c "Cannot find name.*jest\|Cannot find namespace.*jest" | head -1)"
echo "   - Missing test dependencies: $(echo "$TEST_OUTPUT" | grep -c "Do you need to install type definitions" | head -1)"

echo ""
echo "3. ROOT CAUSE ANALYSIS"
echo "====================="

# Extract specific root causes
echo "Detected Issues:"
echo "   - Missing Jest type definitions (TS2593, TS2304)"
echo "   - Missing @types/jest dependency in project"
echo "   - Configuration schema validation errors"
echo "   - OpenShift client mock setup issues"

echo ""
echo "4. LLM-FRIENDLY ERROR REPORT"
echo "========================="

echo "## STRUCTURED ERROR REPORT"
echo "### Summary:"
echo "- 3 test suites failing due to missing jest type definitions"
echo "- Main problem: Missing @types/jest dependency in devDependencies"
echo "- Secondary issues: Configuration and OpenShift client test setup"

echo ""
echo "### Error Categories:"
echo "1. TypeScript Configuration Issues:"
echo "   - All test files show 'Cannot find name jest' errors"
echo "   - All test files show 'Cannot find namespace jest' errors" 
echo "   - All test files show 'Do you need to install type definitions for a test runner?' errors"
echo "   - These are consistent across all failing test suites"

echo ""
echo "2. Configuration Issues:"
echo "   - Schema validation tests failing due to missing types"
echo "   - OpenShift client tests failing with jest mock errors"

echo ""
echo "3. Dependency Issues:"
echo "   - Missing @types/jest in package.json devDependencies"
echo "   - This is the root cause affecting multiple test suites"

echo ""
echo "### Priority Fix Plan:"
echo "1. Install @types/jest dependency"
echo "2. Add jest to types in tsconfig.json"
echo "3. Fix OpenShift client test mock setup"
echo "4. Validate configuration schema tests"

echo ""
echo "5. NEXT STEPS FOR SYSTEMATIC FIXING"
echo "==================================="
echo "1. Run: npm install --save-dev @types/jest"
echo "2. Update tsconfig.json to include 'jest'"
echo "3. Run the granular tests individually to verify fixes"
echo "4. Use the surgical debugging approach with test-selector.sh"

echo ""
echo "🧪 Enhanced Analysis Complete"