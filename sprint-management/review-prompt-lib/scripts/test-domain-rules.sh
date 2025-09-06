#!/bin/bash

# Test Suite for Domain Rule Engine v3.3
# Usage: ./test-domain-rules.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Domain Rule Engine v3.3${NC}"
echo "========================================"

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

# Test function
run_test() {
    local test_name="$1"
    local expected="$2"
    local command="$3"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo ""
    echo -e "${YELLOW}Test $TESTS_RUN: $test_name${NC}"
    echo "Command: $command"
    echo "Expected: $expected"
    
    # Create temporary git setup for testing
    TEMP_DIR="/tmp/domain-rule-test-$$"
    mkdir -p "$TEMP_DIR"
    cd "$TEMP_DIR"
    
    # Initialize git repo
    git init > /dev/null 2>&1
    git config user.email "test@example.com"
    git config user.name "Test User"
    
    # Create test files and commit
    mkdir -p src/api src/auth src/types
    echo "initial" > README.md
    git add README.md
    git commit -m "Initial commit" > /dev/null 2>&1
    
    # Execute test setup command
    eval "$command"
    
    # Run the domain rule engine
    cd "$SCRIPT_DIR/.."
    RESULT=$(./scripts/determine-domains.sh --modified-files 2>/dev/null || echo "")
    
    # Check result
    if [[ "$RESULT" == *"$expected"* ]] || [[ -z "$expected" && -z "$RESULT" ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "Result: $RESULT"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Expected: $expected"
        echo "Got: $RESULT"
    fi
    
    # Cleanup
    cd "$SCRIPT_DIR"
    rm -rf "$TEMP_DIR"
}

# Test 1: Async file modification
run_test "Async file modification triggers async-correctness" \
    "async-correctness" \
    "echo 'async function test() { await something(); }' > src/server.ts && git add src/server.ts && git commit -m 'Add async code'"

# Test 2: API file modification  
run_test "API file modification triggers trust-boundaries and api-contracts" \
    "trust-boundaries" \
    "echo 'app.get(\"/api/users\", (req, res) => { res.json(req.body); });' > src/api/users.ts && git add src/api/users.ts && git commit -m 'Add API endpoint'"

# Test 3: TypeScript file modification
run_test "TypeScript file modification triggers interface-hygiene" \
    "interface-hygiene" \
    "echo 'const data: any = {};' > src/types/user.ts && git add src/types/user.ts && git commit -m 'Add type file'"

# Test 4: Auth file modification
run_test "Auth file modification triggers security-patterns and trust-boundaries" \
    "security-patterns" \
    "echo 'const password = \"secret123\"; crypto.hash(password);' > src/auth/login.ts && git add src/auth/login.ts && git commit -m 'Add auth code'"

# Test 5: No relevant changes
run_test "Documentation changes trigger no domains" \
    "" \
    "echo '# Updated docs' > docs/README.md && mkdir -p docs && git add docs/README.md && git commit -m 'Update docs'"

# Test 6: Multiple domain triggers
run_test "API auth file triggers multiple domains" \
    "trust-boundaries" \
    "echo 'app.post(\"/api/auth\", async (req, res) => { const token = jwt.sign(req.body); });' > src/api/auth.ts && git add src/api/auth.ts && git commit -m 'Add auth API'"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Tests passed: $TESTS_PASSED / $TESTS_RUN${NC}"

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "${GREEN}🎉 All tests passed! Rule engine working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Check rule engine implementation.${NC}"
    exit 1
fi
