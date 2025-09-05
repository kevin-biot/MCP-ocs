#!/bin/bash

# Test All Domains - Verify Scripts Work
# Usage: ./test-all-domains.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/.."

echo "🧪 Testing All Domains in Review-Prompt-Lib"
echo "============================================"

# Get all available domains
DOMAINS=($(ls "$LIB_DIR/domains/"))

echo "Found ${#DOMAINS[@]} domains:"
for domain in "${DOMAINS[@]}"; do
    echo "  ✓ $domain"
done

echo ""
echo "🔍 Testing each domain with dry-run..."

SUCCESS_COUNT=0
FAIL_COUNT=0

for domain in "${DOMAINS[@]}"; do
    echo ""
    echo "Testing: $domain"
    echo "----------------------------------------"
    
    if ./run-weekly-sweep.sh "$domain" --dry-run; then
        echo "✅ $domain: PASS"
        ((SUCCESS_COUNT++))
    else
        echo "❌ $domain: FAIL"
        ((FAIL_COUNT++))
    fi
done

echo ""
echo "🏁 Test Results Summary"
echo "============================================"
echo "✅ Passed: $SUCCESS_COUNT domains"
echo "❌ Failed: $FAIL_COUNT domains"
echo "📊 Total:  ${#DOMAINS[@]} domains"

if [ $FAIL_COUNT -eq 0 ]; then
    echo ""
    echo "🎉 ALL DOMAINS READY FOR PRODUCTION!"
    echo "Ready to run comprehensive baseline review."
else
    echo ""
    echo "⚠️  Fix failed domains before production use."
    exit 1
fi
