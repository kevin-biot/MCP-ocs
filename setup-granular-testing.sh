#!/bin/bash
echo "🔬 Setting up granular testing framework..."
chmod +x create-granular-tests.sh
./create-granular-tests.sh
echo ""
echo "📊 Checking current test status..."
scripts/test/test-status.sh
