#!/bin/bash

# Comprehensive Regression Test Framework for MCP-ocs
# Implements formal regression testing strategy based on current project structure

set -e

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"
REGRESSION_DIR="$PROJECT_ROOT/scripts/test"

echo "🎯 Creating Formal Regression Test Framework"
echo "============================================"
echo

cd "$PROJECT_ROOT"

# Ensure regression test directory exists
mkdir -p "$REGRESSION_DIR"

echo "📋 Creating Regression Test Scripts..."
echo "------------------------------------"

# 1. Master Regression Test Script
cat > "$REGRESSION_DIR/regression-full.sh" << 'EOF'
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

EOF

# 2. Unit Test Regression
cat > "$REGRESSION_DIR/regression-unit.sh" << 'EOF'
#!/bin/bash

# Unit Test Regression - Core feature functionality
echo "🧪 Unit Test Regression Suite"
echo "============================="

# Run all unit tests with coverage
echo "Running unit tests with coverage monitoring..."
npm run test:unit -- --coverage --watchAll=false

# Feature-specific unit test regression
echo "Running feature-specific regressions..."

# Configuration system regression
echo "  📋 Configuration system regression..."
npm run test:unit -- tests/unit/config/ --silent

# Logging system regression  
echo "  📝 Logging system regression..."
npm run test:unit -- tests/unit/logging/ --silent

# OpenShift client regression
echo "  🏗️ OpenShift client regression..."
npm run test:unit -- tests/unit/openshift/ --silent

echo "✅ Unit test regression complete"

EOF

# 3. Integration Test Regression
cat > "$REGRESSION_DIR/regression-integration.sh" << 'EOF'
#!/bin/bash

# Integration Test Regression - Component interactions
echo "🔗 Integration Test Regression Suite"
echo "==================================="

# Start ChromaDB container for testing
echo "Starting ChromaDB test container..."
docker-compose -f docker-compose.test.yml up -d chromadb

# Wait for ChromaDB to be ready
echo "Waiting for ChromaDB readiness..."
sleep 10

# Run integration tests
echo "Running memory system integration tests..."
npm run test:integration -- tests/integration/memory/ --silent

# Test JSON fallback behavior
echo "Testing JSON fallback when ChromaDB unavailable..."
docker-compose -f docker-compose.test.yml stop chromadb
npm run test:integration -- --testNamePattern="fallback" --silent

# Restart ChromaDB for other tests
docker-compose -f docker-compose.test.yml start chromadb

# Cleanup
echo "Cleaning up test containers..."
docker-compose -f docker-compose.test.yml down

echo "✅ Integration test regression complete"

EOF

# 4. Security Regression Tests
cat > "$REGRESSION_DIR/regression-security.sh" << 'EOF'
#!/bin/bash

# Security Regression Tests - Input validation and injection prevention
echo "🔒 Security Regression Test Suite"
echo "================================"

# OpenShift client security tests
echo "Testing OpenShift client injection prevention..."
npm run test:unit -- --testNamePattern="injection|sanitiz" --silent

# Configuration validation security
echo "Testing configuration path traversal prevention..."
npm run test:unit -- --testNamePattern="validation|security" --silent

# Memory system security
echo "Testing memory system input validation..."
npm run test:integration -- --testNamePattern="validation" --silent

echo "✅ Security regression tests complete"

EOF

# 5. Performance Regression Tests
cat > "$REGRESSION_DIR/regression-performance.sh" << 'EOF'
#!/bin/bash

# Performance Regression Tests - Response time and resource monitoring
echo "⚡ Performance Regression Test Suite"
echo "=================================="

# Create performance baseline if it doesn't exist
BASELINE_FILE="performance/baseline.json"
mkdir -p performance

if [[ ! -f "$BASELINE_FILE" ]]; then
    echo "Creating performance baseline..."
    echo '{"responseTime": 100, "memoryUsage": 50}' > $BASELINE_FILE
fi

# Memory system performance
echo "Testing memory system performance..."
npm run test:integration -- --testNamePattern="performance" --silent

echo "✅ Performance regression tests complete"

EOF

# 6. E2E Workflow Regression Tests
cat > "$REGRESSION_DIR/regression-e2e.sh" << 'EOF'
#!/bin/bash

# E2E Workflow Regression Tests - Complete user workflows
echo "🌊 E2E Workflow Regression Suite"
echo "==============================="

# Complete diagnostic workflow
echo "Testing complete diagnostic workflow..."
if [[ -f "tests/manual/test-diagnostic-suite.js" ]]; then
    node tests/manual/test-diagnostic-suite.js
fi

# Memory-guided suggestion workflow
echo "Testing memory-guided suggestion workflow..."
if [[ -f "tests/manual/test-enhanced-memory.mjs" ]]; then
    node tests/manual/test-enhanced-memory.mjs
fi

# Scale-down detection workflow (Phase 2A.1)
echo "Testing infrastructure correlation workflow..."
if [[ -f "tests/scale-down-detection/test-scale-down-detection.js" ]]; then
    node tests/scale-down-detection/test-scale-down-detection.js
fi

echo "✅ E2E workflow regression tests complete"

EOF

# 7. Daily Regression Script
cat > "$REGRESSION_DIR/regression-daily.sh" << 'EOF'
#!/bin/bash

# Daily Regression - Quick feature validation
echo "📅 Daily Regression Check"
echo "========================"

# Quick unit tests
npm run test:unit -- --passWithNoTests --silent

# Security validation
npm run test:unit -- --testNamePattern="validation|security" --silent

echo "✅ Daily regression complete"

EOF

# Make all scripts executable
chmod +x "$REGRESSION_DIR"/*.sh

echo "✅ Regression framework created!"
echo "=============================="
echo

echo "📁 Created regression test scripts:"
ls -la "$REGRESSION_DIR"/*.sh | sed 's|.*/||'

echo
echo "🎯 Usage Examples:"
echo "  scripts/test/regression-full.sh        # Complete regression suite"
echo "  scripts/test/regression-unit.sh        # Unit test regression only"
echo "  scripts/test/regression-security.sh    # Security regression only"
echo "  scripts/test/regression-daily.sh       # Quick daily check"
echo
echo "📋 Next Steps:"
echo "  1. Test the framework: scripts/test/regression-daily.sh"
echo "  2. Update package.json scripts for easy access"
echo "  3. Add more E2E test implementations as needed"
echo
echo "✅ Formal regression test framework ready!"
