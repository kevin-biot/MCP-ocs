#!/bin/bash
echo "🔨 Building Infrastructure Correlation Engine..."
echo "Checking for compilation errors..."
npm run build 2>&1 | tee build.log

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Generated files in dist/ directory"
else
    echo "❌ Build failed. Check errors above."
    exit 1
fi
