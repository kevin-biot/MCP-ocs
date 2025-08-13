#!/bin/bash

# Granular test for: tests/unit/openshift/openshift-client.test.ts
echo "🔬 Testing: tests/unit/openshift/openshift-client.test.ts"
echo "========================="

# Run single test file with detailed output
npm run test:unit -- "tests/unit/openshift/openshift-client.test.ts" --verbose --no-coverage

if [ $? -eq 0 ]; then
    echo "✅ tests/unit/openshift/openshift-client.test.ts PASSED"
else
    echo "❌ tests/unit/openshift/openshift-client.test.ts FAILED"
    echo ""
    echo "🔧 To debug this test:"
    echo "   npm run test:unit -- \"tests/unit/openshift/openshift-client.test.ts\" --verbose"
    echo ""
    echo "🔍 Test file location:"
    echo "   tests/unit/openshift/openshift-client.test.ts"
fi
