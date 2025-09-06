#!/bin/bash

# Weekly Quality Sweep Runner with LLM Selection
# Usage: ./run-weekly-sweep.sh <domain-name> [--llm=codex|qwen] [--chunk-size=N] [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/.."

# Parse arguments
DOMAIN_NAME="$1"
LLM="codex"  # Default to codex
CHUNK_SIZE="0"  # 0 = no chunking
DRY_RUN=""

# Parse optional arguments
shift
while [[ $# -gt 0 ]]; do
    case $1 in
        --llm=*)
            LLM="${1#*=}"
            shift
            ;;
        --chunk-size=*)
            CHUNK_SIZE="${1#*=}"
            shift
            ;;
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Weekly Quality Sweep - Review Process 1.0 ===${NC}"
echo "Domain: $DOMAIN_NAME"
echo "LLM: $LLM $([ "$CHUNK_SIZE" -gt 0 ] && echo "(chunked: $CHUNK_SIZE files)" || echo "(full scan)")"
echo "Repository: $REPO_ROOT"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"

# Validation
if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}Error: Domain name required${NC}"
    echo "Usage: $0 <domain-name> [--llm=codex|qwen] [--chunk-size=N] [--dry-run]"
    echo "Available domains:"
    ls "$LIB_DIR/domains/" 2>/dev/null || echo "  No domains found"
    exit 1
fi

# Validate LLM selection
case "$LLM" in
    "codex"|"qwen")
        ;; # Valid LLM
    *)
        echo -e "${RED}Error: Unsupported LLM '$LLM'${NC}"
        echo "Supported LLMs: codex, qwen"
        exit 1
        ;;
esac

# LLM-specific recommendations
if [[ "$LLM" == "qwen" && "$CHUNK_SIZE" -eq 0 ]]; then
    echo -e "${YELLOW}⚠️  RECOMMENDATION: Qwen works better with chunking${NC}"
    echo "   Consider: ./run-weekly-sweep.sh $DOMAIN_NAME --llm=qwen --chunk-size=5"
    echo "   Continue with full scan anyway? (y/N)"
    if [[ "$DRY_RUN" != "--dry-run" ]]; then
        read -r response
        [[ "$response" =~ ^[Yy]$ ]] || exit 1
    else
        echo "   (Skipping prompt in dry-run mode)"
    fi
fi

if [[ "$LLM" == "codex" && "$CHUNK_SIZE" -gt 0 ]]; then
    echo -e "${YELLOW}ℹ️  INFO: Codex typically handles full scans well${NC}"
    echo "   You requested chunking - this will work but may be unnecessary"
fi

DOMAIN_DIR="$LIB_DIR/domains/$DOMAIN_NAME"
if [ ! -d "$DOMAIN_DIR" ]; then
    echo -e "${RED}Error: Domain '$DOMAIN_NAME' not found${NC}"
    echo "Expected directory: $DOMAIN_DIR"
    exit 1
fi

# Check required files
REQUIRED_FILES=(
    "$DOMAIN_DIR/review-prompt-v1.0.md"
    "$DOMAIN_DIR/domain-specification.yaml"
    "$DOMAIN_DIR/historical/finding-registry.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}Error: Required file missing: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Domain validation passed${NC}"

# Create scan results filename with LLM identifier
SCAN_DATE=$(date +%Y-%m-%d)
if [[ "$CHUNK_SIZE" -gt 0 ]]; then
    SCAN_RESULTS_FILE="$DOMAIN_DIR/historical/$SCAN_DATE-${LLM}-chunked-${CHUNK_SIZE}-scan-results.json"
else
    SCAN_RESULTS_FILE="$DOMAIN_DIR/historical/$SCAN_DATE-${LLM}-scan-results.json"
fi

echo -e "${YELLOW}Step 1: Preparing scan environment${NC}"
cd "$REPO_ROOT"

# Extract file patterns from YAML (simplified - assumes basic patterns)
echo -e "${YELLOW}Step 2: Identifying files to scan${NC}"

# For now, use basic patterns - TODO: Parse YAML properly
FILE_PATTERNS="src/**/*.ts"
EXCLUDE_PATTERNS="*.test.ts *.spec.ts *.mock.ts"

# Find files to scan
TEMP_FILE_LIST="/tmp/quality-sweep-files-$$.txt"
find src -name "*.ts" \
    ! -name "*.test.ts" \
    ! -name "*.spec.ts" \
    ! -name "*.mock.ts" \
    ! -path "*/node_modules/*" \
    ! -path "*/__tests__/*" > "$TEMP_FILE_LIST" 2>/dev/null || true

FILE_COUNT=$(wc -l < "$TEMP_FILE_LIST" 2>/dev/null || echo "0")
echo "Files to scan: $FILE_COUNT"

if [ "$FILE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}Warning: No files found to scan${NC}"
    echo "This might be normal if no TypeScript files exist in src/"
fi

echo -e "${YELLOW}Step 3: Review prompt preparation${NC}"
PROMPT_FILE="$DOMAIN_DIR/review-prompt-v1.0.md"
echo "Using prompt: $PROMPT_FILE"

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo -e "${BLUE}DRY RUN MODE - Would execute review but stopping here${NC}"
    echo "Would scan $FILE_COUNT files using prompt: $PROMPT_FILE"
    echo "Would save results to: $SCAN_RESULTS_FILE"
    rm -f "$TEMP_FILE_LIST"
    exit 0
fi

echo -e "${YELLOW}Step 4: Executing LLM review${NC}"
echo -e "${RED}NOTE: This is a placeholder - LLM integration not yet implemented${NC}"
echo "Would run LLM with:"
echo "  - Prompt: $PROMPT_FILE"
echo "  - Files: $(head -3 "$TEMP_FILE_LIST" | tr '\n' ' ')..."
echo "  - Output: $SCAN_RESULTS_FILE"

# Create placeholder results for testing
echo -e "${YELLOW}Creating placeholder scan results for testing...${NC}"
cat > "$SCAN_RESULTS_FILE" << EOF
{
  "scan_metadata": {
    "domain": "$DOMAIN_NAME",
    "date": "$SCAN_DATE",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "llm": "$LLM",
    "chunked": $([ "$CHUNK_SIZE" -gt 0 ] && echo "true" || echo "false"),
    "chunk_size": $CHUNK_SIZE,
    "files_scanned": $FILE_COUNT,
    "prompt_version": "v1.0"
  },
  "findings": [
    {
      "fingerprint": "$DOMAIN_NAME:src/example.ts:42:unawaited-promise",
      "severity": "P1",
      "category": "unawaited-promise",
      "file": "src/example.ts",
      "line": 42,
      "description": "PLACEHOLDER ($LLM): Example finding for testing",
      "evidence": "// PLACEHOLDER CODE\\nasync function test() {\\n  someAsync(); // Missing await\\n}",
      "recommendation": "PLACEHOLDER: Add await keyword"
    }
  ]
}
EOF

echo -e "${GREEN}✓ Scan results saved: $SCAN_RESULTS_FILE${NC}"

echo -e "${YELLOW}Step 5: Processing findings against historical registry${NC}"
node "$SCRIPT_DIR/process-findings.cjs" "$DOMAIN_NAME" "$SCAN_RESULTS_FILE"

echo -e "${YELLOW}Step 6: Cleanup${NC}"
rm -f "$TEMP_FILE_LIST"

echo -e "${GREEN}=== Weekly Quality Sweep Complete ===${NC}"
echo "Next steps:"
echo "1. Review findings in: $SCAN_RESULTS_FILE"
echo "2. Check backlog integration results"
echo "3. Execute backlog actions if needed"
