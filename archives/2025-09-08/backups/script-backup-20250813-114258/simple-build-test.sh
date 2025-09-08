#!/bin/bash

# Simple build test to show current errors
echo "Running TypeScript build to see current errors..."
npx tsc --noEmit 2>&1 | head -50