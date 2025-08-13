#!/bin/bash

# Phase 2 Organization - Clean up remaining root directory clutter
# Focus on documentation, test files, and miscellaneous items

set -e

PROJECT_ROOT="/Users/kevinbrown/MCP-ocs"
BACKUP_DIR="$PROJECT_ROOT/organization-phase2-backup-$(date +%Y%m%d-%H%M%S)"

echo "🎯 Phase 2 Root Directory Cleanup - MCP-ocs Project"
echo "=================================================="
echo

cd "$PROJECT_ROOT"

# Create backup
echo "💾 Creating Phase 2 backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Create additional organization directories
echo "📁 Creating additional organization directories..."
mkdir -p docs/{guides,reports,analysis}
mkdir -p tests/{manual,diagnostic}
mkdir -p tools/{debug,validation}

# Function to safely move files with logging
move_file() {
    local file="$1"
    local target_dir="$2"
    local description="$3"
    
    if [[ -f "$file" ]]; then
        echo "   📦 Moving $file → $target_dir/"
        # Create backup
        cp "$file" "$BACKUP_DIR/"
        # Move to organized location
        mv "$file" "$target_dir/"
        echo "      ✅ Moved ($description)"
    else
        echo "   ⚠️  $file not found"
    fi
}

echo
echo "📚 Organizing Documentation Files..."
echo "-----------------------------------"

# Core project docs (keep in root)
core_docs=(
    "README.md"
    "CHANGELOG.md"  
    "CONTRIBUTING.md"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "tsconfig.test.json"
    "jest.config.js"
    "Dockerfile.test"
    "docker-compose.test.yml"
)

# Detailed documentation to docs/guides/
guide_docs=(
    "IMPLEMENTATION_PLAN.md"
    "PRODUCTION_DEPLOYMENT_GUIDE.md"
    "TESTING_STRATEGY.md"
    "TESTING_QUICKSTART.md"
    "KNOWLEDGE_SEEDING_DEPLOYMENT_ROADMAP.md"
    "MCP_TOOL_COMMAND_MAPPING.md"
    "OPENSHIFT_CLIENT_IMPROVEMENTS.md"
    "OPENSHIFT_CLIENT_SUMMARY.md"
    "TOOL_BEHAVIOR_REQUIREMENTS.md"
    "VECTOR_MEMORY_INTEGRATION.md"
    "MINIMAL_TESTING.md"
    "README-BUILD-SOLUTION.md"
    "README-COMPLETION.md"
)

for doc in "${guide_docs[@]}"; do
    move_file "$doc" "docs/guides" "Project guide documentation"
done

# Analysis and reports to docs/reports/
report_docs=(
    "COMMIT_SUMMARY.md"
    "COMPILATION_STATUS.md" 
    "DETAILED_REVIEW.md"
    "ISSUE_REPORT.md"
    "QWEN_REVIEW_RESPONSE.md"
    "SESSION_CONTEXT_V2.md"
    "SESSION_CONTINUATION_SUMMARY.md"
    "STORAGE_DIAGNOSTIC_FLAW_ANALYSIS.md"
    "TYPESCRIPT_FIXES_SUMMARY.md"
    "ocs-cluster-cost-optimization-report.md"
    "ocs-cost-optimization-summary.md"
    "ocs-technical-optimization-report.md"
)

for report in "${report_docs[@]}"; do
    move_file "$report" "docs/reports" "Analysis and status reports"
done

# Analysis files to docs/analysis/
analysis_docs=(
    "script-analysis.md"
    "final-compilation-fixes.md"
    "fix-directory-structure.md"
    "git-init-commands.md"
    "github-setup.md"
)

for analysis in "${analysis_docs[@]}"; do
    move_file "$analysis" "docs/analysis" "Technical analysis documentation"
done

echo
echo "🧪 Organizing Test Files..."
echo "---------------------------"

# Manual test files to tests/manual/
manual_tests=(
    "test-aws-integration.mjs"
    "test-diagnostic-suite.js"
    "test-enhanced-memory.mjs"
    "test-http-server.mjs"
    "test-knowledge-seeding.mjs"
    "test-mcp-client.mjs"
    "test-mcp-stdio.mjs"
    "test-memory-functions.mjs"
    "validate-comprehensive.mjs"
)

for test in "${manual_tests[@]}"; do
    move_file "$test" "tests/manual" "Manual test scripts"
done

# Diagnostic files to tests/diagnostic/
diagnostic_files=(
    "diagnostic-suite-ready.js"
    "run-diagnostic-test.js"
)

for diag in "${diagnostic_files[@]}"; do
    move_file "$diag" "tests/diagnostic" "Diagnostic test tools"
done

echo
echo "🔧 Organizing Development Tools..."
echo "---------------------------------"

# Debug tools to tools/debug/
debug_tools=(
    "check-chromadb.mjs"
)

for tool in "${debug_tools[@]}"; do
    move_file "$tool" "tools/debug" "Debug and diagnostic tools"
done

# Build tools (keep build-test.ts in root or move to appropriate location)
echo "   📦 Moving build-test.ts → src/"
if [[ -f "build-test.ts" ]]; then
    cp "build-test.ts" "$BACKUP_DIR/"
    mv "build-test.ts" "src/"
    echo "      ✅ Moved (TypeScript build test)"
fi

echo
echo "🗂️  Organizing Remaining Scripts..."
echo "----------------------------------"

# Move the remaining shell script to appropriate location
if [[ -f "quick-build-test.sh" ]]; then
    echo "   📦 Moving quick-build-test.sh → scripts/build/"
    cp "quick-build-test.sh" "$BACKUP_DIR/"
    mv "quick-build-test.sh" "scripts/build/"
    echo "      ✅ Moved (Build test script)"
fi

echo
echo "🗑️  Organizing Log Files..."
echo "---------------------------"

# Move validation logs to logs directory
validation_logs=(
    "validation-20250811-095242.log"
    "validation-20250811-100359.log"
)

for log in "${validation_logs[@]}"; do
    move_file "$log" "logs" "Validation log files"
done

echo
echo "🧹 Final Cleanup..."
echo "------------------"

# Remove the organizer scripts now that organization is complete
organizer_scripts=(
    "organize-scripts.sh"
    "make-organizer-executable.sh"
)

for script in "${organizer_scripts[@]}"; do
    if [[ -f "$script" ]]; then
        echo "   🗑️  Removing organizer script: $script"
        cp "$script" "$BACKUP_DIR/"
        rm "$script"
        echo "      ✅ Removed (organization complete)"
    fi
done

echo
echo "✅ Phase 2 Organization Complete!"
echo "================================"
echo

# Final status
remaining_files=$(find . -maxdepth 1 -type f | grep -v "^\./\." | wc -l)

echo "📊 Final Root Directory Status:"
echo "   Files remaining in root: $remaining_files"
echo "   Backup created in: $BACKUP_DIR"
echo

echo "📁 New Organization Structure:"
echo "   docs/guides/    - Project documentation and guides"
echo "   docs/reports/   - Analysis and status reports"  
echo "   docs/analysis/  - Technical analysis files"
echo "   tests/manual/   - Manual test scripts"
echo "   tests/diagnostic/ - Diagnostic tools"
echo "   tools/debug/    - Debug utilities"
echo

echo "🎯 Expected Clean Root Directory:"
echo "   ├── README.md"
echo "   ├── CHANGELOG.md"
echo "   ├── CONTRIBUTING.md"
echo "   ├── package.json"
echo "   ├── package-lock.json"
echo "   ├── tsconfig.json"
echo "   ├── tsconfig.test.json"
echo "   ├── jest.config.js"
echo "   ├── Dockerfile.test"
echo "   ├── docker-compose.test.yml"
echo "   ├── mcp-server.mjs"
echo "   └── [core directories: src/, scripts/, tests/, docs/, etc.]"
echo

echo "✅ Root directory is now professionally organized!"
echo "🎯 Ready for regression testing framework implementation!"
