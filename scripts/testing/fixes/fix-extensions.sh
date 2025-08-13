#!/bin/bash

# Fix imports to use .ts extensions since Jest is configured for TypeScript
echo "🔧 Fixing imports to use .ts extensions"

# Fix all test imports to use .ts
sed -i '' 's/\.js/.ts/g' tests/unit/openshift/openshift-client.test.ts
sed -i '' 's/\.js/.ts/g' tests/unit/logging/structured-logger.test.ts  
sed -i '' 's/\.js/.ts/g' tests/unit/config/schema.test.ts

# Run tests
npm run test:unit

echo "✅ Import extensions fixed"