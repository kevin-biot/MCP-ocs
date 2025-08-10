#!/bin/bash
# MCP-ocs Development Context Initialization Script
# Usage: ./docs/scripts/chat-context-init.sh
# Run this before starting any new chat session for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
echo -e "${PURPLE}=====================================================${NC}"
echo -e "${PURPLE}       MCP-ocs Development Context Report${NC}"
echo -e "${PURPLE}=====================================================${NC}"
echo

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "docs/architecture" ]; then
    echo -e "${RED}Error: Please run this script from the MCP-ocs root directory${NC}"
    echo "Expected: /Users/kevinbrown/MCP-ocs"
    echo "Current:  $(pwd)"
    exit 1
fi

# 1. REPOSITORY STATE
echo -e "${CYAN}1. REPOSITORY STATE${NC}"
echo -e "${CYAN}===================${NC}"

echo -e "${YELLOW}Current Branch:${NC} $(git branch --show-current)"
echo -e "${YELLOW}Repository Status:${NC}"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}  ⚠️  Uncommitted changes detected:${NC}"
    git status --short | sed 's/^/    /'
else
    echo -e "${GREEN}  ✅ Working directory clean${NC}"
fi

echo
echo -e "${YELLOW}Recent Commits (last 5):${NC}"
git log --oneline -5 | sed 's/^/  /'

echo
echo -e "${YELLOW}Active Branches:${NC}"
git branch --format='  %(if)%(HEAD)%(then)* %(else)  %(end)%(refname:short)' | head -10

echo

# 2. ADR STATUS
echo -e "${CYAN}2. ARCHITECTURAL DECISION RECORDS (ADRs)${NC}"
echo -e "${CYAN}=========================================${NC}"

if [ -d "docs/architecture" ]; then
    echo -e "${YELLOW}Available ADRs:${NC}"
    ls -la docs/architecture/ADR-*.md 2>/dev/null | while read -r line; do
        filename=$(echo "$line" | awk '{print $9}')
        if [ -n "$filename" ]; then
            # Extract ADR number and title from filename
            adr_info=$(echo "$filename" | sed 's/.*ADR-\([0-9]*\)-\(.*\)\.md/ADR-\1: \2/' | sed 's/-/ /g')
            size=$(echo "$line" | awk '{print $5}')
            echo "  📄 $adr_info ($size bytes)"
        fi
    done
    
    echo
    echo -e "${YELLOW}Most Recently Modified ADR:${NC}"
    most_recent=$(ls -t docs/architecture/ADR-*.md 2>/dev/null | head -1)
    if [ -n "$most_recent" ]; then
        echo "  📄 $most_recent"
        echo "  📅 $(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$most_recent")"
    fi
else
    echo -e "${RED}  ⚠️  No ADR directory found${NC}"
fi

echo

# 3. ACTIVE DEVELOPMENT ISSUES
echo -e "${CYAN}3. ACTIVE DEVELOPMENT ISSUES${NC}"
echo -e "${CYAN}============================${NC}"

echo -e "${YELLOW}TODOs and FIXMEs found in:${NC}"
todo_files=$(find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.js" -o -name "*.json" \) \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" \
    -exec grep -l "TODO\|FIXME\|BUG\|HACK" {} \; 2>/dev/null)

if [ -n "$todo_files" ]; then
    echo "$todo_files" | while read -r file; do
        count=$(grep -c "TODO\|FIXME\|BUG\|HACK" "$file" 2>/dev/null || echo "0")
        echo "  📝 $file ($count items)"
    done
    
    echo
    echo -e "${YELLOW}Recent TODO/FIXME items (sample):${NC}"
    find . -type f \( -name "*.md" -o -name "*.ts" -o -name "*.js" \) \
        -not -path "./node_modules/*" \
        -not -path "./.git/*" \
        -exec grep -Hn "TODO\|FIXME\|BUG" {} \; 2>/dev/null | head -5 | \
        sed 's/^/  🔍 /'
else
    echo -e "${GREEN}  ✅ No TODO/FIXME items found${NC}"
fi

echo

# 4. PROJECT STRUCTURE STATUS
echo -e "${CYAN}4. PROJECT STRUCTURE STATUS${NC}"
echo -e "${CYAN}============================${NC}"

echo -e "${YELLOW}Key Directories:${NC}"
for dir in "src" "docs" "tests" "config" "scripts"; do
    if [ -d "$dir" ]; then
        file_count=$(find "$dir" -type f | wc -l | xargs)
        echo -e "  📁 $dir/ (${file_count} files) ${GREEN}✅${NC}"
    else
        echo -e "  📁 $dir/ ${RED}❌ Missing${NC}"
    fi
done

echo
echo -e "${YELLOW}Recent File Changes (last 24 hours):${NC}"
recent_files=$(find . -type f -mtime -1 \
    -not -path "./node_modules/*" \
    -not -path "./.git/*" \
    -not -path "./dist/*" 2>/dev/null)

if [ -n "$recent_files" ]; then
    echo "$recent_files" | head -10 | while read -r file; do
        mod_time=$(stat -f "%Sm" -t "%m/%d %H:%M" "$file" 2>/dev/null || echo "unknown")
        echo "  📄 $file (modified: $mod_time)"
    done
else
    echo -e "  ${GREEN}✅ No recent file changes${NC}"
fi

echo

# 5. MEMORY SEARCH SUGGESTIONS
echo -e "${CYAN}5. MEMORY SEARCH SUGGESTIONS${NC}"
echo -e "${CYAN}============================${NC}"

echo -e "${YELLOW}For current development context, search MCP memory for:${NC}"
echo "  🔍 Recent architectural decisions"
echo "  🔍 Similar implementation patterns"
echo "  🔍 Previous debugging sessions"
echo "  🔍 Component-specific solutions"
echo "  🔍 Performance optimization approaches"
echo "  🔍 Integration patterns and workflows"

echo
echo -e "${YELLOW}Suggested memory search terms based on recent activity:${NC}"

# Generate search suggestions based on recent commits and file changes
recent_terms=""
if git log --oneline -5 --pretty=format:"%s" | grep -q -i "memory"; then
    recent_terms="$recent_terms memory system, "
fi
if git log --oneline -5 --pretty=format:"%s" | grep -q -i "adr\|architect"; then
    recent_terms="$recent_terms architectural decisions, "
fi
if git log --oneline -5 --pretty=format:"%s" | grep -q -i "tool\|namespace"; then
    recent_terms="$recent_terms tool management, "
fi
if git log --oneline -5 --pretty=format:"%s" | grep -q -i "workflow\|state"; then
    recent_terms="$recent_terms workflow patterns, "
fi

if [ -n "$recent_terms" ]; then
    echo "  💡 ${recent_terms%,*}"
else
    echo "  💡 general development patterns, troubleshooting approaches"
fi

echo

# 6. SESSION TEMPLATE RECOMMENDATIONS
echo -e "${CYAN}6. SESSION TEMPLATE RECOMMENDATIONS${NC}"
echo -e "${CYAN}====================================${NC}"

echo -e "${YELLOW}Choose appropriate session template:${NC}"
echo "  📋 docs/templates/development-session.md    - For feature development"
echo "  📋 docs/templates/architecture-review.md    - For design decisions"
echo "  📋 docs/templates/debugging-session.md      - For issue resolution"

echo
echo -e "${YELLOW}Quick template selection guide:${NC}"
echo "  ✨ Building new features          → development-session.md"
echo "  🏛️  Making architectural decisions → architecture-review.md"
echo "  🔧 Fixing bugs or issues          → debugging-session.md"

echo

# 7. READY FOR DEVELOPMENT
echo -e "${CYAN}7. DEVELOPMENT SESSION READY${NC}"
echo -e "${CYAN}=============================${NC}"

echo -e "${GREEN}✅ Context reconstruction complete!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. 📋 Copy appropriate session template from docs/templates/"
echo "  2. 🔍 Search MCP memory using suggested terms above"
echo "  3. 📖 Review relevant ADRs for architectural context"
echo "  4. 🎯 Define session goals and success criteria"
echo "  5. 🛠️  Begin architecture-first development process"

echo
echo -e "${PURPLE}=====================================================${NC}"
echo -e "${PURPLE}       Ready for productive development session!${NC}"
echo -e "${PURPLE}=====================================================${NC}"
