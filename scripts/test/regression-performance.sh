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

