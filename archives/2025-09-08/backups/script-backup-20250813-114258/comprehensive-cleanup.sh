#!/bin/bash
# 
# Comprehensive MCP-ocs Project Cleanup
# This will clean up the chaos in your root directory

echo "🚀 COMPREHENSIVE MCP-ocs PROJECT CLEANUP"
echo "======================================="

cd /Users/kevinbrown/MCP-ocs

echo "📁 Working in: $(pwd)"

# First, let's check what we have in the root directory
echo ""
echo "📋 Files in root directory before cleanup:"
ls -la | grep -E "\.(sh|ts|js|md|json|yml|yaml|txt)$" | head -20

echo ""
echo "🧹 CLEANING UP ROOT DIRECTORY..."

# Remove all the old script files that we've already organized
echo "Removing duplicated or redundant script files..."

# Remove the files that were moved to scripts/ directory
files_to_remove=(
    "build-and-test-scale-down.sh"
    "build-and-test-v2.sh" 
    "build-fix.sh"
    "build-status.sh"
    "build-test.ts"
    "build-with-critical-fix.sh"
    "check-chromadb.mjs"
    "check-production-status.sh"
    "check-status.sh"
    "cleanup-docs.sh"
    "cleanup-scripts.sh"
    "cleanup-tests.sh"
    "commit-critical-fix.sh"
    "commit-docs-cleanup.sh"
    "commit-knowledge-seeding-v0.3.1.sh"
    "commit-knowledge-seeding.sh"
    "commit-mcp-development-guide.sh"
    "commit-production-enhanced.sh"
    "commit-production.sh"
    "commit-scale-down-enhancement.sh"
    "commit-skeleton.sh"
    "complete-success-test.sh"
    "comprehensive-fix.sh"
    "comprehensive-validation.sh"
    "create-structure.sh"
    "debug-chroma-api.sh"
    "debug-chroma-connection.sh"
    "diagnostic-suite-ready.js"
    "execute-validated-commit.sh"
    "final-build-and-commit.sh"
    "final-build-check.sh"
    "final-build-test.sh"
    "final-build.sh"
    "final-compilation-fixes.md"
    "final-fix.sh"
    "final-test.sh"
    "fix-and-test-chroma.sh"
    "fix-build-and-verify.sh"
    "fix-build.sh"
    "fix-directory-structure.md"
    "git-init-commands.md"
    "github-setup.md"
    "install-test-deps.sh"
    "make-scripts-executable.sh"
    "manual-integration"
    "mcp-server.mjs"
    "ocs-cluster-cost-optimization-report.md"
    "ocs-cost-optimization-summary.md"
    "ocs-technical-optimization-report.md"
    "package-lock.json"
    "quick-build-and-test.sh"
    "quick-build-test.sh"
    "quick-build.sh"
    "quick-chroma-test.sh"
    "quick-error-fix.sh"
    "quick-fix-typescript.sh"
    "quick-test-fix.sh"
    "quick-test.sh"
    "run-cleanup-manual.sh"
    "run-cleanup.sh"
    "run-diagnostic-test.js"
    "setup-manual-integration.sh"
    "setup-minimal-testing.sh"
    "setup-scripts.sh"
    "simple-build-fix.sh"
    "simple-build-test.sh"
    "test-aws-integration.mjs"
    "test-aws-openshift.sh"
    "test-build.sh"
    "test-diagnostic-suite.js"
    "test-enhanced-memory.mjs"
    "test-fixes.sh"
    "test-http-server.mjs"
    "test-implementation-check.sh"
    "test-imports.sh"
    "test-knowledge-seeding.mjs"
    "test-mcp-client.mjs"
    "test-mcp-protocol.sh"
    "test-mcp-stdio.mjs"
    "test-memory-functions.mjs"
    "test-v2-api.sh"
    "validate-and-build.sh"
    "validate-comprehensive.mjs"
    "validate-phase-2a1.sh"
    "validate-real-scenario.sh"
    "validate-tool-accuracy.sh"
    "validate-v2-tools.sh"
    "victory-test.sh"
)

# Remove files that were moved or are duplicates
for file in "${files_to_remove[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "✅ Removed: $file"
    fi
done

# Also remove the cleanup scripts that were created
echo ""
echo "Removing temporary cleanup files..."
rm -f run-script-cleanup.sh final-cleanup.sh run-cleanup-manual.sh comprehensive-cleanup.sh 2>/dev/null

echo ""
echo "✅ Root directory cleanup completed!"

# Show the final state
echo ""
echo "📁 Final directory structure:"
echo "Scripts directory (organized):"
ls -la scripts/

echo ""
echo "Other files in root (cleaned up):"
ls -la | grep -E "\.(sh|ts|js|md|json|yml|yaml|txt)$" | wc -l " files remaining"