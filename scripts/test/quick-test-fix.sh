#!/bin/bash

echo "🧪 Quick TypeScript Build Test"
echo "==============================="

cd /Users/kevinbrown/MCP-ocs

echo "🔧 Step 1: Try building current state..."
npm run build 2>&1 | head -20

echo ""
echo "📊 Error count before fixes:"
npm run build 2>&1 | grep -c "error TS"

echo ""
echo "🔨 Step 2: Applying targeted fixes..."

# Fix the most critical remaining issues
echo "Fixing environment variable typing..."
if grep -q "return env;" src/lib/openshift-client-enhanced.ts; then
    sed -i '' 's/return env;/return env as Record<string, string>;/' src/lib/openshift-client-enhanced.ts
    echo "✅ Fixed environment variable typing"
fi

echo "Fixing logger.warn parameter issue..."
if grep -q 'logger\.warn.*error, { duration }' src/lib/health/graceful-shutdown.ts; then
    sed -i '' 's/logger\.warn(`Non-critical shutdown handler failed: ${handler\.name}`, error, { duration });/logger.warn(`Non-critical shutdown handler failed: ${handler.name}: ${error instanceof Error ? error.message : String(error)}`);/' src/lib/health/graceful-shutdown.ts
    echo "✅ Fixed logger.warn parameter issue"
fi

echo "Fixing array typing in diagnostics..."
if grep -q 'const patterns = \[\];' src/tools/diagnostics/index.ts; then
    sed -i '' 's/const patterns = \[\];/const patterns: any[] = [];/' src/tools/diagnostics/index.ts
    echo "✅ Fixed array typing"
fi

echo ""
echo "🧪 Step 3: Testing build after fixes..."
npm run build 2>&1 | head -20

echo ""
echo "📊 Error count after fixes:"
npm run build 2>&1 | grep -c "error TS"

echo ""
echo "✅ Quick fix test complete!"
