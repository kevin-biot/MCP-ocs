#!/bin/bash

# Sprint Quality Context Generator v3.3
# Usage: ./get-sprint-context.sh --domain=<domain> [--include-weekly-findings] [--target-files=<pattern>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REVIEW_LIB_DIR="$SCRIPT_DIR/../review-prompt-lib"

# Parse arguments
DOMAIN=""
INCLUDE_WEEKLY=""
TARGET_FILES=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --domain=*)
            DOMAIN="${1#*=}"
            shift
            ;;
        --include-weekly-findings)
            INCLUDE_WEEKLY="true"
            shift
            ;;
        --target-files=*)
            TARGET_FILES="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --domain=<domain> [--include-weekly-findings] [--target-files=<pattern>]"
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

echo -e "${BLUE}🎯 Sprint Quality Context Generator v3.3${NC}"
echo "Domain: $DOMAIN"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo ""

# Validate domain
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}Error: Domain required${NC}"
    echo "Available domains:"
    ls "$REVIEW_LIB_DIR/domains/" 2>/dev/null || echo "  No domains found"
    exit 1
fi

DOMAIN_DIR="$REVIEW_LIB_DIR/domains/$DOMAIN"
if [ ! -d "$DOMAIN_DIR" ]; then
    echo -e "${RED}Error: Domain '$DOMAIN' not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Quality Context for $DOMAIN Domain${NC}"
echo "=========================================="

# 1. Domain Overview
echo -e "${BLUE}Domain Overview:${NC}"
if [ -f "$DOMAIN_DIR/domain-specification.yaml" ]; then
    grep -E "^description:|^categories:|^severity_levels:" "$DOMAIN_DIR/domain-specification.yaml" | sed 's/^/  /'
else
    echo "  No domain specification found"
fi
echo ""

# 2. Recent Weekly Findings
if [[ "$INCLUDE_WEEKLY" == "true" ]]; then
    echo -e "${BLUE}Recent Weekly Findings:${NC}"
    
    # Find most recent scan results
    RECENT_SCAN=$(find "$DOMAIN_DIR/historical" -name "*-scan-results.json" -type f | sort | tail -1)
    
    if [ -n "$RECENT_SCAN" ] && [ -f "$RECENT_SCAN" ]; then
        echo "  Source: $(basename "$RECENT_SCAN")"
        
        # Extract findings summary
        TOTAL_FINDINGS=$(grep -o '"severity": "P[0-3]"' "$RECENT_SCAN" 2>/dev/null | wc -l || echo 0)
        P0_COUNT=$(grep -o '"severity": "P0"' "$RECENT_SCAN" 2>/dev/null | wc -l || echo 0)
        P1_COUNT=$(grep -o '"severity": "P1"' "$RECENT_SCAN" 2>/dev/null | wc -l || echo 0)
        
        echo "  Total findings: $TOTAL_FINDINGS (P0: $P0_COUNT, P1: $P1_COUNT)"
        
        # Show recent P0/P1 findings
        if [ "$P0_COUNT" -gt 0 ] || [ "$P1_COUNT" -gt 0 ]; then
            echo "  Critical issues (P0/P1):"
            grep -A 3 -B 1 '"severity": "P[01]"' "$RECENT_SCAN" 2>/dev/null | \
                grep -E '"description"|"file"|"line"' | \
                head -15 | sed 's/^/    /'
        fi
    else
        echo "  No recent scan results found"
    fi
    echo ""
fi

# 3. Historical Pattern Analysis
echo -e "${BLUE}Historical Patterns:${NC}"
REGISTRY_FILE="$DOMAIN_DIR/historical/finding-registry.json"

if [ -f "$REGISTRY_FILE" ]; then
    # Extract pattern statistics from registry
    TOTAL_EVER=$(grep -o '"total_findings_ever": [0-9]*' "$REGISTRY_FILE" | grep -o '[0-9]*' || echo 0)
    ACTIVE_FINDINGS=$(grep -o '"active_findings": [0-9]*' "$REGISTRY_FILE" | grep -o '[0-9]*' || echo 0)
    RESOLVED_FINDINGS=$(grep -o '"resolved_findings": [0-9]*' "$REGISTRY_FILE" | grep -o '[0-9]*' || echo 0)
    
    echo "  Historical tracking:"
    echo "    Total findings ever: $TOTAL_EVER"
    echo "    Currently active: $ACTIVE_FINDINGS"  
    echo "    Previously resolved: $RESOLVED_FINDINGS"
    
    # Show most common categories if available
    if [ "$TOTAL_EVER" -gt 0 ]; then
        echo "  Common patterns:"
        grep -o '".*": [0-9]*' "$REGISTRY_FILE" 2>/dev/null | \
            grep -v '"[0-9]"' | head -5 | sed 's/^/    /'
    fi
else
    echo "  No historical registry found (fresh domain)"
fi
echo ""

# 4. Related Domain Context
echo -e "${BLUE}Cross-Domain Context:${NC}"

# Determine which other domains might be relevant based on target files
if [ -n "$TARGET_FILES" ]; then
    echo "  Target files: $TARGET_FILES"
    
    # Use domain determination script to find related domains
    if [ -f "$REVIEW_LIB_DIR/scripts/determine-domains.sh" ]; then
        echo "  Related domains for target files:"
        # This would need the actual files to exist, so we'll simulate
        echo "    (Run determine-domains.sh on actual changes for precise results)"
    fi
else
    echo "  No specific target files specified"
    echo "  Related domains typically include:"
    
    # Show common domain relationships
    case "$DOMAIN" in
        "async-correctness")
            echo "    - error-taxonomy (error handling in async code)"
            echo "    - trust-boundaries (async input validation)"
            ;;
        "trust-boundaries")
            echo "    - security-patterns (authentication/authorization)"
            echo "    - api-contracts (input validation)"
            ;;
        "security-patterns")
            echo "    - trust-boundaries (input sanitization)"
            echo "    - error-taxonomy (secure error handling)"
            ;;
        *)
            echo "    - Check domain relationships in weekly sweep results"
            ;;
    esac
fi
echo ""

# 5. Problem-Resolution Context
echo -e "${BLUE}Problem-Resolution Context:${NC}"
echo "  Focus: Systematic elimination of $DOMAIN quality debt"
echo "  Approach: Pattern-based resolution, not individual task completion"
echo "  Success: Zero $DOMAIN issues remaining + evidence of systematic coverage"
echo ""

# 6. Verification Plan
echo -e "${BLUE}Quality Verification Plan:${NC}"
echo "  Self-verification during development:"
echo "    ./scripts/sprint-quality-check.sh --modified-files --quick-feedback"
echo ""
echo "  Comprehensive verification for closure:"
echo "    ./scripts/sprint-quality-check.sh --modified-files --comprehensive"
echo ""
echo "  Expected domain checks:"
echo "    - Primary: $DOMAIN"
echo "    - Related: (determined by file modifications)"
echo ""

# 7. Integration Points
echo -e "${BLUE}Integration with Weekly Process:${NC}"
echo "  This sprint will update:"
echo "    - $DOMAIN finding registry with resolved patterns"
echo "    - Weekly quality baseline for domain"
echo "    - Cross-domain implications and preventive measures"
echo ""

# 8. Templates and Resources
echo -e "${BLUE}Templates and Resources:${NC}"
echo "  Sprint template: ../templates/problem-resolution-sprint.md"
echo "  Domain specification: $DOMAIN_DIR/domain-specification.yaml"
echo "  Review prompt: $DOMAIN_DIR/review-prompt-v1.0.md"
echo "  Historical registry: $DOMAIN_DIR/historical/finding-registry.json"
echo ""

echo -e "${GREEN}✓ Sprint quality context generated${NC}"
echo -e "${YELLOW}Next: Execute problem-resolution sprint with this context${NC}"
