#!/bin/bash
echo "🧪 Testing basic imports..."
npx tsc --noEmit src/v2/tools/infrastructure-correlation/test-imports.ts --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports