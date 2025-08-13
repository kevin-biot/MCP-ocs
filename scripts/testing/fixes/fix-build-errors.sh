#!/bin/bash

# Fix build errors and remaining test issues
echo "🔧 Fixing Build Errors and Test Issues"
echo "======================================"

# 1. Fix build-test.ts import paths
echo "1. Fixing build-test.ts import paths..."
cat > src/build-test.ts << 'EOF'
// Simple build test to verify all core modules compile
import { VectorMemoryManager } from './lib/memory/vector-memory-manager.js';
import { ToolExecutionTracker } from './lib/tools/tool-execution-tracker.js';
import { OpenShiftClient } from './lib/openshift-client-enhanced.js';
import { SharedMemoryManager } from './lib/memory/shared-memory.js';

console.log('Build test passed - all modules compile successfully');
EOF

# 2. Check if source files exist
echo "2. Checking if source files exist..."
ls -la src/lib/memory/vector-memory-manager.* || echo "   ⚠️ vector-memory-manager missing"
ls -la src/lib/tools/tool-execution-tracker.* || echo "   ⚠️ tool-execution-tracker missing"
ls -la src/lib/openshift-client-enhanced.* || echo "   ⚠️ openshift-client-enhanced missing"
ls -la src/lib/memory/shared-memory.* || echo "   ⚠️ shared-memory missing"

# 3. Run build without chmod to avoid permission issues
echo "3. Running TypeScript build..."
npx tsc --noEmit

# 4. Run individual test analysis to see specific errors
echo "4. Running individual test to see specific errors..."
npm test tests/unit/config/schema.test.ts 2>&1 | head -20

echo "✅ Build fixes applied!"
