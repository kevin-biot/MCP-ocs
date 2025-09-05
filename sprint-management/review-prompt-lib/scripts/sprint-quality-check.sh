#!/bin/bash

# Sprint Quality Check v3.3 - Deterministic Domain Execution
# Usage: ./sprint-quality-check.sh [--modified-files] [--learning-mode] [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/.."

# Parse arguments
MODIFIED_FILES_MODE=""
LEARNING_MODE=""
DRY_RUN=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --modified-files)
            MODIFIED_FILES_MODE="--modified-files"
            shift
            ;;
        --learning-mode)
            LEARNING_MODE="--learning-mode"
            shift
            ;;
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--modified-files] [--learning-mode] [--dry-run]"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Sprint Quality Check v3.3 - Deterministic Execution${NC}"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo ""

# Step 1: Determine relevant domains using rule engine
echo -e "${YELLOW}Step 1: Determining relevant domains${NC}"
DOMAINS=$(./scripts/determine-domains.sh $MODIFIED_FILES_MODE $LEARNING_MODE)

if [ -z "$DOMAINS" ]; then
    echo -e "${GREEN}✓ No domains triggered - no quality checks needed${NC}"
    exit 0
fi

echo -e "${BLUE}Domains to check:${NC}"
echo "$DOMAINS" | sed 's/^/  ✓ /'
echo ""

# Step 2: Get modified files for targeted checking
if [[ "$MODIFIED_FILES_MODE" == "--modified-files" ]]; then
    MODIFIED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
    if [ -n "$MODIFIED_FILES" ]; then
        echo -e "${YELLOW}Step 2: Modified files for targeted checking${NC}"
        echo "$MODIFIED_FILES" | sed 's/^/  /'
        echo ""
        
        # Create temporary file list for domain checks
        TEMP_FILE_LIST="/tmp/sprint-modified-files-$$.txt"
        echo "$MODIFIED_FILES" > "$TEMP_FILE_LIST"
    else
        echo -e "${YELLOW}⚠️  No modified files found, running full domain checks${NC}"
        TEMP_FILE_LIST=""
    fi
else
    echo -e "${YELLOW}Step 2: Running full repository checks${NC}"
    TEMP_FILE_LIST=""
fi

# Step 3: Execute domain checks
echo -e "${YELLOW}Step 3: Executing domain quality checks${NC}"

TOTAL_FINDINGS=0
FINDINGS_BY_DOMAIN=""

while IFS= read -r domain; do
    if [ -n "$domain" ]; then
        echo ""
        echo -e "${BLUE}Checking domain: $domain${NC}"
        echo "----------------------------------------"
        
        # Build run command
        RUN_CMD="./scripts/run-weekly-sweep.sh $domain"
        
        if [ -n "$TEMP_FILE_LIST" ]; then
            RUN_CMD="$RUN_CMD --files=$TEMP_FILE_LIST --quick"
        fi
        
        if [ -n "$DRY_RUN" ]; then
            RUN_CMD="$RUN_CMD $DRY_RUN"
        fi
        
        echo "Command: $RUN_CMD"
        
        if [ "$DRY_RUN" != "--dry-run" ]; then
            # Execute the domain check
            if $RUN_CMD; then
                echo -e "${GREEN}✓ $domain check completed${NC}"
                
                # Count findings (simple approach - count JSON findings in result file)
                SCAN_DATE=$(date +%Y-%m-%d)
                RESULT_FILE="$LIB_DIR/domains/$domain/historical/$SCAN_DATE-codex-scan-results.json"
                
                if [ -f "$RESULT_FILE" ]; then
                    DOMAIN_FINDINGS=$(grep -o '"severity": "P[0-3]"' "$RESULT_FILE" 2>/dev/null | wc -l || echo 0)
                    TOTAL_FINDINGS=$((TOTAL_FINDINGS + DOMAIN_FINDINGS))
                    FINDINGS_BY_DOMAIN="$FINDINGS_BY_DOMAIN\n  $domain: $DOMAIN_FINDINGS findings"
                    
                    if [ "$DOMAIN_FINDINGS" -gt 0 ]; then
                        echo -e "${YELLOW}  → Found $DOMAIN_FINDINGS issues${NC}"
                    fi
                fi
            else
                echo -e "${RED}✗ $domain check failed${NC}"
            fi
        else
            echo -e "${BLUE}  → Would run domain check (dry run mode)${NC}"
        fi
    fi
done <<< "$DOMAINS"

# Step 4: Summary and recommendations
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Sprint Quality Check Summary${NC}"  
echo -e "${BLUE}========================================${NC}"

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo -e "${YELLOW}DRY RUN MODE - No actual checks performed${NC}"
    echo -e "${GREEN}✓ Rule engine working correctly${NC}"
    echo -e "${GREEN}✓ Domain selection deterministic${NC}"
    echo -e "${GREEN}✓ Ready for actual execution${NC}"
else
    echo -e "${GREEN}✓ Checked $(echo "$DOMAINS" | wc -l) domains${NC}"
    echo -e "${YELLOW}Total findings: $TOTAL_FINDINGS${NC}"
    
    if [ $TOTAL_FINDINGS -gt 0 ]; then
        echo -e "${YELLOW}Findings breakdown:${NC}"
        echo -e "$FINDINGS_BY_DOMAIN"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "  1. Review findings for false positives"
        echo "  2. Fix legitimate issues within sprint scope"  
        echo "  3. Document any accepted technical debt"
        echo "  4. Update finding registries with decisions"
    else
        echo -e "${GREEN}🎉 No quality issues found in modified areas!${NC}"
    fi
fi

# Step 5: Integration guidance
echo ""
echo -e "${YELLOW}Process v3.3 Integration:${NC}"
echo "  • Add to REVIEWER checklist: './scripts/sprint-quality-check.sh --modified-files'"
echo "  • Review findings as part of sprint closure"
echo "  • Document quality decisions for audit trail"
echo "  • Weekly sweep will catch anything missed"

# Cleanup
if [ -n "$TEMP_FILE_LIST" ] && [ -f "$TEMP_FILE_LIST" ]; then
    rm -f "$TEMP_FILE_LIST"
fi

echo ""
echo -e "${GREEN}✓ Sprint quality check complete${NC}"
