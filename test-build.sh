#!/bin/bash

# Run TypeScript compilation to test for errors
echo "Testing build..."
npm run build 2>&1 | head -30