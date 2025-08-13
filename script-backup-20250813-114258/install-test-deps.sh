#!/bin/bash

echo "📦 Installing minimal testing dependencies..."

# Install only the essential testing dependencies
echo "Installing Jest and TypeScript testing tools..."

npm install --save-dev \
  jest@^29.7.0 \
  ts-jest@^29.1.1 \
  @types/jest@^29.5.14 \
  @types/node@^22 \
  typescript@^5.8.3

echo ""
echo "✅ Essential testing dependencies installed!"
echo ""
echo "🧪 Testing the setup..."

# Test basic functionality
echo "Checking Jest..."
if npx jest --version >/dev/null 2>&1; then
    echo "✅ Jest $(npx jest --version) ready"
else
    echo "❌ Jest installation failed"
    exit 1
fi

echo "Checking TypeScript..."
if npx tsc --version >/dev/null 2>&1; then
    echo "✅ TypeScript $(npx tsc --version) ready"
else
    echo "❌ TypeScript installation failed"
    exit 1
fi

echo ""
echo "🎯 Ready to test!"
echo "Run: npm test"
