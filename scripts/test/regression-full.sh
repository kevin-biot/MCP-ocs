#!/bin/bash

# Master Regression Test Suite - Run all regression tests
# Prevents feature conflicts and maintains quality standards

set -e

echo "🚀 MCP-ocs Full Regression Test Suite"
echo "===================================="
echo

# Configuration
COVERAGE_THRESHOLD=90
PERFORMANCE_THRESHOLD=10  # Max 10% degradation allowed
START_TIME=$(date +%s)

echo "📊 Pre-Regression Environment Check..."
echo "------------------------------------"

# Verify test environment
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found - install Node.js"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ docker not found - required for integration tests"
    exit 1
fi

echo "✅ Test environment ready"
echo

# 1. Unit Test Regression
echo "🧪 Running Unit Test Regression..."
scripts/test/regression-unit.sh

# 2. Integration Test Regression  
echo "🔗 Running Integration Test Regression..."
scripts/test/regression-integration.sh

# 3. Security Regression Tests
echo "🔒 Running Security Regression Tests..."
scripts/test/regression-security.sh

# 4. Performance Regression Tests
echo "⚡ Running Performance Regression Tests..."
scripts/test/regression-performance.sh

# 5. E2E Workflow Regression Tests
echo "🌊 Running E2E Workflow Regression..."
scripts/test/regression-e2e.sh

# Generate comprehensive report
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo
echo "✅ Full Regression Test Suite Complete!"
echo "======================================"
echo "   Duration: ${DURATION}s"
echo "   All regression tests passed ✅"
echo "   Ready for deployment 🚀"
echo

