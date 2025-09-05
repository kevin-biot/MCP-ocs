#!/bin/bash

# LLM Comparison Tool
# Usage: ./compare-llm-results.sh <domain-name> [date]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/.."
DOMAIN_NAME="$1"
COMPARE_DATE="${2:-$(date +%Y-%m-%d)}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 LLM COMPARISON REPORT${NC}"
echo "=================================="
echo "Domain: $DOMAIN_NAME"
echo "Date: $COMPARE_DATE"
echo ""

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: Domain name required${NC}"
    echo "Usage: $0 <domain-name> [date]"
    echo "Available domains:"
    ls "$LIB_DIR/domains/" 2>/dev/null || echo "  No domains found"
    exit 1
fi

DOMAIN_DIR="$LIB_DIR/domains/$DOMAIN_NAME"
if [ ! -d "$DOMAIN_DIR" ]; then
    echo -e "${RED}Error: Domain '$DOMAIN_NAME' not found${NC}"
    exit 1
fi

# Find scan results for the date
CODEX_RESULTS=$(find "$DOMAIN_DIR/historical" -name "$COMPARE_DATE-codex-*.json" | head -1)
QWEN_RESULTS=$(find "$DOMAIN_DIR/historical" -name "$COMPARE_DATE-qwen-*.json" | head -1)

echo -e "${YELLOW}🤖 CODEX CLI RESULTS${NC}"
echo "-----------------------------------"
if [ -n "$CODEX_RESULTS" ] && [ -f "$CODEX_RESULTS" ]; then
    echo "✅ File: $(basename "$CODEX_RESULTS")"
    
    # Extract findings count by severity using basic tools
    CODEX_P0=$(grep -o '"severity": "P0"' "$CODEX_RESULTS" | wc -l | tr -d ' ')
    CODEX_P1=$(grep -o '"severity": "P1"' "$CODEX_RESULTS" | wc -l | tr -d ' ')
    CODEX_P2=$(grep -o '"severity": "P2"' "$CODEX_RESULTS" | wc -l | tr -d ' ')
    CODEX_P3=$(grep -o '"severity": "P3"' "$CODEX_RESULTS" | wc -l | tr -d ' ')
    CODEX_TOTAL=$((CODEX_P0 + CODEX_P1 + CODEX_P2 + CODEX_P3))
    
    echo "📊 Findings: $CODEX_TOTAL total ($CODEX_P0 P0, $CODEX_P1 P1, $CODEX_P2 P2, $CODEX_P3 P3)"
    
    # Check if chunked
    if grep -q '"chunked": true' "$CODEX_RESULTS"; then
        CHUNK_SIZE=$(grep -o '"chunk_size": [0-9]*' "$CODEX_RESULTS" | grep -o '[0-9]*')
        echo "🔄 Scan type: Chunked ($CHUNK_SIZE files per chunk)"
    else
        echo "📄 Scan type: Full codebase scan"
    fi
    
    FILES_SCANNED=$(grep -o '"files_scanned": [0-9]*' "$CODEX_RESULTS" | grep -o '[0-9]*')
    echo "📁 Files scanned: $FILES_SCANNED"
else
    echo "❌ No Codex results found for $COMPARE_DATE"
fi

echo ""
echo -e "${YELLOW}🧠 QWEN RESULTS${NC}"
echo "-----------------------------------"
if [ -n "$QWEN_RESULTS" ] && [ -f "$QWEN_RESULTS" ]; then
    echo "✅ File: $(basename "$QWEN_RESULTS")"
    
    # Extract findings count by severity
    QWEN_P0=$(grep -o '"severity": "P0"' "$QWEN_RESULTS" | wc -l | tr -d ' ')
    QWEN_P1=$(grep -o '"severity": "P1"' "$QWEN_RESULTS" | wc -l | tr -d ' ')
    QWEN_P2=$(grep -o '"severity": "P2"' "$QWEN_RESULTS" | wc -l | tr -d ' ')
    QWEN_P3=$(grep -o '"severity": "P3"' "$QWEN_RESULTS" | wc -l | tr -d ' ')
    QWEN_TOTAL=$((QWEN_P0 + QWEN_P1 + QWEN_P2 + QWEN_P3))
    
    echo "📊 Findings: $QWEN_TOTAL total ($QWEN_P0 P0, $QWEN_P1 P1, $QWEN_P2 P2, $QWEN_P3 P3)"
    
    # Check if chunked
    if grep -q '"chunked": true' "$QWEN_RESULTS"; then
        CHUNK_SIZE=$(grep -o '"chunk_size": [0-9]*' "$QWEN_RESULTS" | grep -o '[0-9]*')
        echo "🔄 Scan type: Chunked ($CHUNK_SIZE files per chunk)"
    else
        echo "📄 Scan type: Full codebase scan"
    fi
    
    FILES_SCANNED=$(grep -o '"files_scanned": [0-9]*' "$QWEN_RESULTS" | grep -o '[0-9]*')
    echo "📁 Files scanned: $FILES_SCANNED"
else
    echo "❌ No Qwen results found for $COMPARE_DATE"
fi

# Comparison summary if both exist
if [ -n "$CODEX_RESULTS" ] && [ -f "$CODEX_RESULTS" ] && [ -n "$QWEN_RESULTS" ] && [ -f "$QWEN_RESULTS" ]; then
    echo ""
    echo -e "${BLUE}⚖️  COMPARISON SUMMARY${NC}"
    echo "=================================="
    
    FINDING_DIFF=$((CODEX_TOTAL - QWEN_TOTAL))
    if [ $FINDING_DIFF -gt 0 ]; then
        echo -e "${GREEN}Codex found $FINDING_DIFF more issues than Qwen${NC}"
    elif [ $FINDING_DIFF -lt 0 ]; then
        echo -e "${YELLOW}Qwen found $((-FINDING_DIFF)) more issues than Codex${NC}"
    else
        echo -e "${BLUE}Both LLMs found the same number of issues${NC}"
    fi
    
    P0_DIFF=$((CODEX_P0 - QWEN_P0))
    if [ $P0_DIFF -ne 0 ]; then
        echo -e "${RED}⚠️  P0 Critical difference: Codex $CODEX_P0 vs Qwen $QWEN_P0${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 RECOMMENDATION${NC}"
    if [ $CODEX_TOTAL -gt $QWEN_TOTAL ]; then
        echo "Codex appears more thorough for this domain. Consider using Codex as primary reviewer."
    elif [ $QWEN_TOTAL -gt $CODEX_TOTAL ]; then
        echo "Qwen found more issues. Review both results to understand differences."
    else
        echo "Similar performance. Either LLM suitable for this domain."
    fi
fi

echo ""
echo -e "${GREEN}🔗 NEXT ACTIONS${NC}"
echo "• Review individual findings in the result files"
echo "• Run ./run-weekly-sweep.sh $DOMAIN_NAME --llm=<preferred> for production use"
echo "• Consider cross-validation with both LLMs for critical domains"
