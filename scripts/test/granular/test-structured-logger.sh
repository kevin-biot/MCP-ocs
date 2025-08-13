#!/bin/bash

# Granular test for: tests/unit/logging/structured-logger.test.ts
echo "🔬 Testing: tests/unit/logging/structured-logger.test.ts"
echo "========================="

# Run single test file with detailed output
npm run test:unit -- "tests/unit/logging/structured-logger.test.ts" --verbose --no-coverage

if [ $? -eq 0 ]; then
    echo "✅ tests/unit/logging/structured-logger.test.ts PASSED"
else
    echo "❌ tests/unit/logging/structured-logger.test.ts FAILED"
    echo ""
    echo "🔧 To debug this test:"
    echo "   npm run test:unit -- \"tests/unit/logging/structured-logger.test.ts\" --verbose"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/logging/structured-logger.test.ts"
fi
