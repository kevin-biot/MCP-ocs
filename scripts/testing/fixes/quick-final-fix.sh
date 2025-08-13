#!/bin/bash

# Quick final fix for remaining issues
echo "🎯 Final Test Fixes"

# Fix build-test.ts import paths
sed -i '' 's|./src/lib/|./lib/|g' src/build-test.ts

# Run one test to see actual errors
echo "🔍 Testing one file to see real errors:"
npm run test:unit -- tests/unit/config/schema.test.ts --verbose

echo "✅ Done"