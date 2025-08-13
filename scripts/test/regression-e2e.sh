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

