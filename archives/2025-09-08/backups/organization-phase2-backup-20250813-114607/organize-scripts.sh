#!/bin/bash

# Smart Script Organizer - Safely move remaining scripts to organized structure
# Based on Claude's analysis but with safety checks and incremental approach

set -e  # Exit on any error

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"
BACKUP_DIR="$PROJECT_ROOT/script-backup-$(date +%Y%m%d-%H%M%S)"

echo "🎯 Smart Script Organization - MCP-ocs Project"
echo "=============================================="
echo

# Safety check - ensure we're in the right directory
if [[ ! -f "$PROJECT_ROOT/package.json" ]] || [[ ! -d "$PROJECT_ROOT/scripts" ]]; then
    echo "❌ Error: Not in MCP-ocs project root or scripts directory missing"
    echo "   Expected: $PROJECT_ROOT"
    echo "   Current:  $(pwd)"
    exit 1
fi

cd "$PROJECT_ROOT"

echo "📋 Current project state:"
echo "   Root shell scripts: $(find . -maxdepth 1 -name '*.sh' | wc -l)"
echo "   Scripts directory:  $(ls -1 scripts/ | wc -l) subdirectories"
echo

# Create backup directory
echo "💾 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Function to safely move scripts with logging
move_script() {
    local script="$1"
    local target_dir="$2"
    local description="$3"
    
    if [[ -f "$script" ]]; then
        echo "   📦 Moving $script → scripts/$target_dir/"
        # Create backup
        cp "$script" "$BACKUP_DIR/"
        # Move to organized location
        mv "$script" "scripts/$target_dir/"
        echo "      ✅ Moved ($description)"
    else
        echo "   ⚠️  $script not found (may already be organized)"
    fi
}

# Function to safely remove cleanup scripts
remove_cleanup_script() {
    local script="$1"
    
    if [[ -f "$script" ]]; then
        echo "   🗑️  Removing temporary script: $script"
        # Backup before removing
        cp "$script" "$BACKUP_DIR/"
        rm "$script"
        echo "      ✅ Removed (temporary cleanup script)"
    fi
}

echo "🏗️  Organizing Build Scripts..."
echo "--------------------------------"

# Build scripts that might still be in root
build_scripts=(
    "build-fix.sh"
    "build-status.sh" 
    "build-with-critical-fix.sh"
    "final-build-check.sh"
    "final-build-test.sh"
    "simple-build-fix.sh"
    "simple-build-test.sh"
)

for script in "${build_scripts[@]}"; do
    move_script "$script" "build" "Build and compilation related"
done

echo
echo "🧪 Organizing Test Scripts..."
echo "-----------------------------"

# Test scripts that might still be in root
test_scripts=(
    "test-aws-openshift.sh"
    "test-implementation-check.sh" 
    "test-imports.sh"
    "test-mcp-protocol.sh"
    "test-v2-api.sh"
    "validate-phase-2a1.sh"
    "validate-real-scenario.sh"
    "validate-tool-accuracy.sh"
    "validate-v2-tools.sh"
    "test-fixes.sh"
    "comprehensive-validation.sh"
    "complete-success-test.sh"
    "victory-test.sh"
    "quick-test-fix.sh"
)

for script in "${test_scripts[@]}"; do
    move_script "$script" "test" "Testing and validation related"
done

echo
echo "🔧 Organizing Utility Scripts..."
echo "--------------------------------"

# Utility scripts (commit, setup, debug, etc.)
utility_scripts=(
    "commit-critical-fix.sh"
    "commit-docs-cleanup.sh"
    "commit-knowledge-seeding-v0.3.1.sh"
    "commit-knowledge-seeding.sh"
    "commit-mcp-development-guide.sh" 
    "commit-production-enhanced.sh"
    "commit-production.sh"
    "commit-scale-down-enhancement.sh"
    "commit-skeleton.sh"
    "check-production-status.sh"
    "check-status.sh"
    "cleanup-docs.sh"
    "cleanup-scripts.sh"
    "cleanup-tests.sh"
    "debug-chroma-api.sh"
    "debug-chroma-connection.sh"
    "execute-validated-commit.sh"
    "final-fix.sh"
    "fix-and-test-chroma.sh"
    "fix-build-and-verify.sh"
    "fix-build.sh"
    "install-test-deps.sh"
    "make-scripts-executable.sh"
    "quick-chroma-test.sh"
    "quick-error-fix.sh"
    "quick-fix-typescript.sh"
    "setup-manual-integration.sh"
    "setup-minimal-testing.sh"
    "setup-scripts.sh"
    "comprehensive-fix.sh"
    "create-structure.sh"
    "final-clean.sh"
)

for script in "${utility_scripts[@]}"; do
    move_script "$script" "utils" "Utility and maintenance related"
done

echo
echo "🗑️  Removing Temporary Cleanup Scripts..."
echo "-----------------------------------------"

# Remove temporary cleanup scripts (these were just for organization)
cleanup_scripts=(
    "comprehensive-cleanup.sh"
    "execute-cleanup.sh"
    "final-cleanup.sh"
    "run-cleanup-manual.sh"
    "run-script-cleanup.sh"
    "complete-cleanup-report.sh"
    "final-script-organization.sh"
    "real-final-cleanup.sh"
    "run-cleanup.sh"
)

for script in "${cleanup_scripts[@]}"; do
    remove_cleanup_script "$script"
done

echo
echo "✅ Organization Complete!"
echo "========================"
echo

# Final status
remaining_scripts=$(find . -maxdepth 1 -name '*.sh' | wc -l)
organized_scripts=$(find scripts/ -name '*.sh' | wc -l)

echo "📊 Final Status:"
echo "   Scripts remaining in root:     $remaining_scripts"
echo "   Scripts in organized structure: $organized_scripts"
echo "   Backup created in:             $BACKUP_DIR"
echo

if [[ $remaining_scripts -gt 5 ]]; then
    echo "ℹ️  Some scripts remain in root - these may be:"
    find . -maxdepth 1 -name '*.sh' -exec basename {} \; | head -5
    echo "   (Check if these need special handling)"
    echo
fi

echo "🎯 Next Steps:"
echo "   1. Test that key scripts still work: npm run build, npm test"
echo "   2. Update any hard-coded script paths in CI/CD"
echo "   3. Review scripts/README.md for usage guidance"
echo "   4. Remove backup directory after confirming everything works"
echo
echo "✅ Script organization complete! Your project is now much cleaner."
