#!/bin/bash

# Granular test for: tests/unit/config/schema.test.ts
echo "🔬 Testing: tests/unit/config/schema.test.ts"
echo "========================="

# Run single test file with detailed output
npm run test:unit -- "tests/unit/config/schema.test.ts" --verbose --no-coverage

if [ $? -eq 0 ]; then
    echo "✅ tests/unit/config/schema.test.ts PASSED"
else
    echo "❌ tests/unit/config/schema.test.ts FAILED"
    echo ""
    echo "🔧 To debug this test:"
    echo "   npm run test:unit -- \"tests/unit/config/schema.test.ts\" --verbose"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/config/schema.test.ts"
fi
