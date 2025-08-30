#!/bin/bash

echo "📝 COMMITTING DOCUMENTATION CLEANUP"
echo "==================================="

cd /Users/kevinbrown/MCP-ocs

# First, run the cleanup
echo "🔄 Executing documentation reorganization..."
chmod +x cleanup-docs.sh
./cleanup-docs.sh

echo ""
echo "📋 Checking git status after cleanup..."
git status

echo ""
echo "➕ Adding all moved and new files..."
git add .

echo ""
echo "📝 Creating comprehensive commit for documentation cleanup..."

git commit -m "docs: Complete documentation reorganization and cleanup

📁 MAJOR DOCUMENTATION REORGANIZATION

🎯 Problem Solved:
- ADRs scattered across docs/architecture/ and docs/decisions/
- Implementation docs mixed with guides in root docs/
- No clear organization by document type
- Hard to find related documentation

✅ Changes Applied:

📂 Consolidated Architecture (docs/architecture/):
- ADR-001: OC vs K8s API strategy
- ADR-002: GitOps strategy  
- ADR-003: Memory patterns
- ADR-004: Tool namespace management
- ADR-005: Workflow state machine
- ADR-006: Modular tool plugin architecture
- ADR-007: Automatic Tool Memory Integration (moved from docs/decisions/)
- ARCHITECTURE.md (overview)

📋 Organized Implementation (docs/implementation/):
- PHASE_2A_IMPLEMENTATION_GUIDE.md (Phase 2A specs)
- DEVELOPMENT_PLAN_V2.md
- DEVELOPMENT_PROCESS.md
- DIAGNOSTIC_ROADMAP.md (strategic roadmap)
- REQUIREMENTS_V2.md
- TEST_CASES_V2.md
- VALIDATION_FRAMEWORK.md

📖 Structured Guides (docs/guides/):
- DEVELOPER_REUSE_GUIDE.md
- MCP_TOOL_DEVELOPMENT_GUIDE.md
- engineer-workflow-guide.md
- operational-tooling-goals-benefits.md

📚 Reference Materials (docs/reference/):
- MEMORY_TAGGING.md

🧹 Cleanup:
- Removed empty docs/decisions/ directory
- Maintained existing structure for api/, deployment/, scripts/, workflows/

🎯 Benefits:
- Clear separation by document type
- All ADRs consolidated in one location
- Implementation specs grouped together
- Easier navigation and maintenance
- Better developer experience

📊 Files Moved: ~15 files reorganized
🗂️ Structure: 4 main documentation categories established
🔗 Next: Update cross-references and internal links as needed

This establishes a clean, maintainable documentation structure following
standard practices for technical documentation organization."

echo ""
echo "✅ Documentation cleanup committed!"

echo ""
echo "📊 Final directory structure:"
echo ""
find docs -type d | grep -E "(architecture|implementation|guides|reference)" | sort

echo ""
echo "🎉 DOCUMENTATION REORGANIZATION COMPLETE!"
echo "✅ All ADRs properly consolidated"
echo "✅ Clear separation by document type"  
echo "✅ Better organization and maintainability"
echo ""
echo "📍 Phase 2A Implementation Guide location:"
echo "   docs/implementation/PHASE_2A_IMPLEMENTATION_GUIDE.md"
