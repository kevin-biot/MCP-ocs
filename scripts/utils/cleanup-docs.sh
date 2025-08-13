#!/bin/bash

echo "📁 EXECUTING DOCUMENTATION CLEANUP PLAN"
echo "======================================="

cd /Users/kevinbrown/MCP-ocs

echo "🔍 Starting documentation reorganization..."

# Step 1: Create new organized directories
echo ""
echo "📂 Step 1: Creating organized directory structure..."
mkdir -p docs/implementation
mkdir -p docs/guides
mkdir -p docs/reference

echo "✅ Created: docs/implementation/"
echo "✅ Created: docs/guides/" 
echo "✅ Created: docs/reference/"

# Step 2: Move ADR-007 to join its siblings
echo ""
echo "🔄 Step 2: Moving ADR-007 to architecture directory..."
if [ -f "docs/decisions/ADR-007-automatic-tool-memory-integration.md" ]; then
    mv docs/decisions/ADR-007-automatic-tool-memory-integration.md \
       docs/architecture/ADR-007-automatic-tool-memory-integration.md
    echo "✅ Moved ADR-007 to docs/architecture/"
else
    echo "⚠️ ADR-007 not found in docs/decisions/"
fi

# Step 3: Move implementation docs
echo ""
echo "📋 Step 3: Moving implementation docs..."
mv docs/PHASE_2A_IMPLEMENTATION_GUIDE.md docs/implementation/ 2>/dev/null && echo "✅ Moved PHASE_2A_IMPLEMENTATION_GUIDE.md"
mv docs/DEVELOPMENT_PLAN_V2.md docs/implementation/ 2>/dev/null && echo "✅ Moved DEVELOPMENT_PLAN_V2.md"
mv docs/DEVELOPMENT_PROCESS.md docs/implementation/ 2>/dev/null && echo "✅ Moved DEVELOPMENT_PROCESS.md"
mv docs/DIAGNOSTIC_ROADMAP.md docs/implementation/ 2>/dev/null && echo "✅ Moved DIAGNOSTIC_ROADMAP.md"
mv docs/REQUIREMENTS_V2.md docs/implementation/ 2>/dev/null && echo "✅ Moved REQUIREMENTS_V2.md"
mv docs/TEST_CASES_V2.md docs/implementation/ 2>/dev/null && echo "✅ Moved TEST_CASES_V2.md"
mv docs/VALIDATION_FRAMEWORK.md docs/implementation/ 2>/dev/null && echo "✅ Moved VALIDATION_FRAMEWORK.md"

# Step 4: Move guide docs  
echo ""
echo "📖 Step 4: Moving guide docs..."
mv docs/DEVELOPER_REUSE_GUIDE.md docs/guides/ 2>/dev/null && echo "✅ Moved DEVELOPER_REUSE_GUIDE.md"
mv docs/MCP_TOOL_DEVELOPMENT_GUIDE.md docs/guides/ 2>/dev/null && echo "✅ Moved MCP_TOOL_DEVELOPMENT_GUIDE.md"
mv docs/engineer-workflow-guide.md docs/guides/ 2>/dev/null && echo "✅ Moved engineer-workflow-guide.md"
mv docs/operational-tooling-goals-benefits.md docs/guides/ 2>/dev/null && echo "✅ Moved operational-tooling-goals-benefits.md"

# Step 5: Move reference docs
echo ""
echo "📚 Step 5: Moving reference docs..."
mv docs/MEMORY_TAGGING.md docs/reference/ 2>/dev/null && echo "✅ Moved MEMORY_TAGGING.md"

# Step 6: Clean up empty directories
echo ""
echo "🧹 Step 6: Cleaning up empty directories..."
if [ -d "docs/decisions" ] && [ -z "$(ls -A docs/decisions)" ]; then
    rmdir docs/decisions
    echo "✅ Removed empty docs/decisions/"
fi

# Step 7: Show final structure
echo ""
echo "📊 Step 7: Final documentation structure:"
echo ""
echo "docs/"
echo "├── architecture/     (ADRs and architecture overview)"
find docs/architecture -name "*.md" -exec basename {} \; | sort | sed 's/^/│   ├── /'
echo "├── implementation/   (Implementation specs and guides)"
find docs/implementation -name "*.md" -exec basename {} \; | sort | sed 's/^/│   ├── /'
echo "├── guides/          (User and developer guides)"
find docs/guides -name "*.md" -exec basename {} \; | sort | sed 's/^/│   ├── /'
echo "├── reference/       (Reference materials)"
find docs/reference -name "*.md" -exec basename {} \; | sort | sed 's/^/│   ├── /'
echo "└── [other dirs]     (api, deployment, scripts, etc.)"

echo ""
echo "🎉 DOCUMENTATION CLEANUP COMPLETED!"
echo "✅ All ADRs consolidated in docs/architecture/"
echo "✅ Implementation docs organized in docs/implementation/"
echo "✅ User guides organized in docs/guides/"
echo "✅ Reference materials in docs/reference/"
echo ""
echo "🚀 Ready for git commit!"
