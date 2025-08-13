#!/bin/bash

# Quick diagnostic to find the exact testUtils usage
echo "🔍 Searching for testUtils usage in failing tests..."

echo "📁 Looking for testUtils in openshift-client.test.ts around line 128..."
sed -n '125,135p' tests/unit/openshift/openshift-client.test.ts

echo ""
echo "📁 Searching for all testUtils references..."
grep -n "testUtils" tests/unit/openshift/openshift-client.test.ts || echo "No testUtils found"

echo ""
echo "📁 Checking if raw test scripts exist..."
ls -la scripts/test/dual-mode/raw-* | head -5

echo ""
echo "📁 Available raw test scripts:"
find scripts/test/dual-mode -name "raw-*" | head -5

echo ""
echo "🔧 Let's run a simple individual test to see the actual error..."
npm run test:unit -- tests/unit/openshift/openshift-client.test.ts --verbose | head -30
