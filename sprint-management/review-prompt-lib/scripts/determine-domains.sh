#!/bin/bash

# Domain Rule Engine v3.3 - Deterministic Domain Selection
# Usage: ./determine-domains.sh [--modified-files] [--learning-mode]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LIB_DIR="$SCRIPT_DIR/.."

# Parse arguments
MODIFIED_FILES_MODE=""
LEARNING_MODE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --modified-files)
            MODIFIED_FILES_MODE="true"
            shift
            ;;
        --learning-mode)
            LEARNING_MODE="true"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--modified-files] [--learning-mode]"
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

echo -e "${BLUE}🔍 Domain Rule Engine v3.3 - Deterministic Selection${NC}"

# Get modified files if in modified-files mode
if [[ "$MODIFIED_FILES_MODE" == "true" ]]; then
    MODIFIED_FILES=$(git diff --name-only HEAD~1 2>/dev/null || echo "")
    if [ -z "$MODIFIED_FILES" ]; then
        echo -e "${YELLOW}⚠️  No modified files found in git diff${NC}"
        echo "Are you in a git repository with commits?"
        exit 1
    fi
    echo -e "${YELLOW}Modified files:${NC}"
    echo "$MODIFIED_FILES" | sed 's/^/  /'
    echo ""
    
    # Get diff content for signal pattern matching
    DIFF_CONTENT=$(git diff HEAD~1 2>/dev/null || echo "")
else
    echo -e "${YELLOW}Running in full repository mode${NC}"
    MODIFIED_FILES=""
    DIFF_CONTENT=""
fi

# Domain tracking
TRIGGERED_DOMAINS=""
DOMAIN_REASONS=""

# Function to check path patterns
check_path_patterns() {
    local domain="$1"
    shift
    local patterns=("$@")
    
    if [[ "$MODIFIED_FILES_MODE" != "true" ]]; then
        return 0  # Always match in full mode
    fi
    
    for pattern in "${patterns[@]}"; do
        # Convert shell pattern to grep pattern
        grep_pattern=$(echo "$pattern" | sed 's/\*\*/.*/' | sed 's/\*/[^/]*/')
        if echo "$MODIFIED_FILES" | grep -E "$grep_pattern" > /dev/null; then
            return 0
        fi
    done
    return 1
}

# Function to check signal patterns  
check_signal_patterns() {
    local domain="$1"
    shift
    local patterns=("$@")
    
    if [[ "$MODIFIED_FILES_MODE" != "true" ]]; then
        return 0  # Always match in full mode
    fi
    
    for pattern in "${patterns[@]}"; do
        if echo "$DIFF_CONTENT" | grep -E "$pattern" > /dev/null; then
            return 0
        fi
    done
    return 1
}

# Function to trigger domain
trigger_domain() {
    local domain="$1"
    local reason="$2"
    
    if [[ ! " $TRIGGERED_DOMAINS " =~ " $domain " ]]; then
        TRIGGERED_DOMAINS="$TRIGGERED_DOMAINS $domain"
        DOMAIN_REASONS="$DOMAIN_REASONS\n  $domain: $reason"
    fi
}

echo -e "${BLUE}Evaluating domain rules...${NC}"

# async-correctness domain
if check_path_patterns "async-correctness" "**/server*" "**/api/**" "**/handler*" "**/worker*" "**/service*" "**/*async*"; then
    trigger_domain "async-correctness" "path pattern match"
elif check_signal_patterns "async-correctness" "await" "Promise" "async function" "setTimeout" "setInterval" "fetch" "AbortController" "AbortSignal"; then
    trigger_domain "async-correctness" "signal pattern match"
fi

# trust-boundaries domain
if check_path_patterns "trust-boundaries" "**/api/**" "**/auth/**" "**/middleware/**" "**/validation/**" "**/security/**"; then
    trigger_domain "trust-boundaries" "path pattern match"
elif check_signal_patterns "trust-boundaries" "req\.body" "req\.params" "req\.query" "input" "user" "validate" "sanitize" "escape"; then
    trigger_domain "trust-boundaries" "signal pattern match"
fi

# security-patterns domain
if check_path_patterns "security-patterns" "**/auth/**" "**/crypto/**" "**/security/**" "**/jwt/**" "**/oauth/**"; then
    trigger_domain "security-patterns" "path pattern match"
elif check_signal_patterns "security-patterns" "password" "token" "secret" "crypto" "hash" "encrypt" "decrypt" "jwt" "oauth" "auth"; then
    trigger_domain "security-patterns" "signal pattern match"
fi

# interface-hygiene domain
if check_path_patterns "interface-hygiene" "**/*.ts" "**/*.d.ts" "**/types/**" "**/interfaces/**"; then
    trigger_domain "interface-hygiene" "path pattern match"
elif check_signal_patterns "interface-hygiene" "any" "as " "unknown" "Object" "interface" "type " "Record<"; then
    trigger_domain "interface-hygiene" "signal pattern match"
fi

# api-contracts domain
if check_path_patterns "api-contracts" "**/api/**" "**/schema/**" "**/contract/**" "**/endpoint/**"; then
    trigger_domain "api-contracts" "path pattern match"
elif check_signal_patterns "api-contracts" "schema" "validate" "response" "request" "endpoint" "route" "swagger" "openapi"; then
    trigger_domain "api-contracts" "signal pattern match"
fi

# error-taxonomy domain
if check_path_patterns "error-taxonomy" "**/error/**" "**/exception/**" "**/handler/**" "**/middleware/**"; then
    trigger_domain "error-taxonomy" "path pattern match"
elif check_signal_patterns "error-taxonomy" "throw" "Error" "Exception" "catch" "status" "statusCode" "HttpStatus" "400" "401" "403" "404" "500"; then
    trigger_domain "error-taxonomy" "signal pattern match"
fi

# exhaustiveness-checking domain
if check_path_patterns "exhaustiveness-checking" "**/state/**" "**/reducer/**" "**/machine/**" "**/workflow/**"; then
    trigger_domain "exhaustiveness-checking" "path pattern match"
elif check_signal_patterns "exhaustiveness-checking" "switch" "case" "default" "assertNever" "exhaustive" "state" "reducer" "action"; then
    trigger_domain "exhaustiveness-checking" "signal pattern match"
fi

# date-time-safety domain
if check_path_patterns "date-time-safety" "**/date/**" "**/time/**" "**/schedule/**" "**/cron/**"; then
    trigger_domain "date-time-safety" "path pattern match"
elif check_signal_patterns "date-time-safety" "Date" "date" "time" "moment" "dayjs" "schedule" "cron" "timezone" "UTC" "ISO"; then
    trigger_domain "date-time-safety" "signal pattern match"
fi

# Results
echo -e "${GREEN}✓ Rule evaluation complete${NC}"
echo ""

if [ -n "$TRIGGERED_DOMAINS" ]; then
    echo -e "${BLUE}Triggered domains:${NC}$TRIGGERED_DOMAINS"
    echo -e "${YELLOW}Reasons:${NC}"
    echo -e "$DOMAIN_REASONS"
else
    echo -e "${YELLOW}No domains triggered by current changes${NC}"
fi

# AI Learning Mode (log only, don't act)
if [[ "$LEARNING_MODE" == "true" && -n "$MODIFIED_FILES" ]]; then
    echo ""
    echo -e "${BLUE}🧠 AI Learning Mode (Log Only)${NC}"
    
    # Simple AI suggestion simulation (would be real AI call in practice)
    AI_SUGGESTIONS=""
    
    # Example AI logic (this would be a real LLM call)
    if echo "$DIFF_CONTENT" | grep -E "config|database|connection" > /dev/null; then
        if [[ ! " $TRIGGERED_DOMAINS " =~ " security-patterns " ]]; then
            AI_SUGGESTIONS="$AI_SUGGESTIONS security-patterns"
        fi
    fi
    
    if echo "$DIFF_CONTENT" | grep -E "network|http|request" > /dev/null; then
        if [[ ! " $TRIGGERED_DOMAINS " =~ " async-correctness " ]]; then
            AI_SUGGESTIONS="$AI_SUGGESTIONS async-correctness"
        fi
    fi
    
    if [ -n "$AI_SUGGESTIONS" ]; then
        echo -e "${YELLOW}AI would suggest additional domains:${NC}$AI_SUGGESTIONS"
        echo "$(date): RULE-BASED=$TRIGGERED_DOMAINS AI-SUGGEST=$AI_SUGGESTIONS" >> "$LIB_DIR/ai-suggestions.log"
    else
        echo -e "${GREEN}AI agrees with rule-based selection${NC}"
    fi
fi

# Output for script consumption
if [ -n "$TRIGGERED_DOMAINS" ]; then
    echo "$TRIGGERED_DOMAINS" | tr ' ' '\n' | grep -v '^$'
fi
