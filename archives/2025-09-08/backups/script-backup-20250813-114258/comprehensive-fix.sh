#!/bin/bash

echo "🔧 Applying comprehensive TypeScript error fixes..."

cd /Users/kevinbrown/MCP-ocs

# Fix error.message patterns throughout the codebase
echo "Fixing error.message patterns..."
find src -name "*.ts" -exec sed -i '' 's/error\.message/error instanceof Error ? error.message : String(error)/g' {} \;

# Fix logger.error patterns with unknown error type
echo "Fixing logger.error patterns..."
find src -name "*.ts" -exec sed -i '' 's/logger\.error(\([^,]*\), error,/logger.error(\1, error instanceof Error ? error : new Error(String(error)),/g' {} \;

# Fix specific environment variable typing in openshift-client-enhanced.ts
echo "Fixing environment variable typing..."
sed -i '' 's/return env;/return env as Record<string, string>;/' src/lib/openshift-client-enhanced.ts

# Fix specific error properties
echo "Fixing error properties..."
find src -name "*.ts" -exec sed -i '' 's/error\.code/error instanceof Error \&\& "code" in error ? (error as any).code : undefined/g' {} \;
find src -name "*.ts" -exec sed -i '' 's/error\.stderr/error instanceof Error \&\& "stderr" in error ? (error as any).stderr : undefined/g' {} \;

# Fix logger.warn parameter issue in graceful-shutdown.ts
echo "Fixing logger.warn parameter count..."
sed -i '' 's/logger\.warn(`Non-critical shutdown handler failed: ${handler\.name}`, error, { duration });/logger.warn(`Non-critical shutdown handler failed: ${handler.name}: ${error instanceof Error ? error.message : String(error)}`);/' src/lib/health/graceful-shutdown.ts

# Fix array typing issue in diagnostics
echo "Fixing array typing issues..."
sed -i '' 's/const patterns = \[\];/const patterns: any[] = [];/' src/tools/diagnostics/index.ts

echo "✅ All comprehensive TypeScript fixes applied!"
echo "🧪 Running build to check if errors are resolved..."

npm run build
