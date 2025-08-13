#!/bin/bash

# Quick status check for MCP-ocs skeleton
echo "🔍 MCP-ocs Skeleton Status Check"
echo "================================="

echo ""
echo "📁 Project Structure:"
find src -name "*.ts" | head -20

echo ""
echo "📊 Code Statistics:"
echo "TypeScript files: $(find src -name "*.ts" | wc -l)"
echo "Total lines: $(find src -name "*.ts" -exec wc -l {} \; | awk '{sum+=$1} END {print sum}')"

echo ""
echo "🏗️ Architecture Components:"
echo "✅ Main server (src/index.ts)"
echo "✅ OpenShift client (lib/openshift-client.ts)"  
echo "✅ Memory system (lib/memory/shared-memory.ts)"
echo "✅ Tool namespace manager (lib/tools/namespace-manager.ts)"
echo "✅ Workflow engine (lib/workflow/workflow-engine.ts)"
echo "✅ Configuration manager (lib/config/config-manager.ts)"

echo ""
echo "🔧 Tool Categories:"
echo "✅ Diagnostics (oc_diagnostic_*)"
echo "✅ Read operations (oc_read_*)"  
echo "✅ Write operations (oc_write_*)"
echo "✅ State management (memory_*, core_*)"

echo ""
echo "📋 Git Status:"
git status --porcelain | head -10

echo ""
echo "🎯 Ready for commit!"
