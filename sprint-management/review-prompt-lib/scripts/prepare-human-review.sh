#!/bin/bash

# Human-Assisted Review Runner
# Prepares everything needed for manual LLM review

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LIB_DIR="$SCRIPT_DIR/.."
DOMAIN_NAME="$1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Human-Assisted Review Preparation ===${NC}"
echo "Domain: $DOMAIN_NAME"
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"

DOMAIN_DIR="$LIB_DIR/domains/$DOMAIN_NAME"
PROMPT_FILE="$DOMAIN_DIR/review-prompt-v1.0.md"
SCAN_DATE=$(date +%Y-%m-%d)
SCAN_RESULTS_FILE="$DOMAIN_DIR/historical/$SCAN_DATE-scan-results.json"

echo -e "${YELLOW}Step 1: Preparing file list for review${NC}"
cd "$REPO_ROOT"

# Get files to scan
TEMP_FILE_LIST="/tmp/review-files-$$.txt"
find src -name "*.ts" \
    ! -name "*.test.ts" \
    ! -name "*.spec.ts" \
    ! -name "*.mock.ts" \
    ! -path "*/node_modules/*" \
    ! -path "*/__tests__/*" > "$TEMP_FILE_LIST" 2>/dev/null || true

FILE_COUNT=$(wc -l < "$TEMP_FILE_LIST" 2>/dev/null || echo "0")
echo "Files to review: $FILE_COUNT"

echo -e "${YELLOW}Step 2: Creating human review instructions${NC}"

cat > "/tmp/human-review-instructions-$$.md" << EOF
# Manual LLM Review Instructions

## Context
- **Domain**: $DOMAIN_NAME  
- **Date**: $SCAN_DATE
- **Files**: $FILE_COUNT TypeScript files
- **Repository**: $REPO_ROOT

## Files to Analyze
\`\`\`
$(cat "$TEMP_FILE_LIST")
\`\`\`

## Review Prompt
Copy the entire content from: \`$PROMPT_FILE\`

## LLM Instructions
1. **Read the review prompt** (contains patterns to detect and output format)
2. **Analyze the listed files** in the repository 
3. **Return findings in JSON format** as specified in the prompt
4. **Save the JSON output** to: \`$SCAN_RESULTS_FILE\`

## After LLM Review
Run the processing script:
\`\`\`bash
cd $REPO_ROOT
node sprint-management/review-prompt-lib/scripts/process-findings.cjs $DOMAIN_NAME $SCAN_RESULTS_FILE
\`\`\`

## Expected Output File
\`$SCAN_RESULTS_FILE\`

The JSON should follow this structure:
\`\`\`json
{
  "scan_metadata": {
    "domain": "$DOMAIN_NAME",
    "date": "$SCAN_DATE", 
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "files_scanned": $FILE_COUNT,
    "prompt_version": "v1.0"
  },
  "findings": [
    {
      "fingerprint": "async-correctness:src/file.ts:42:unawaited-promise",
      "severity": "P0|P1|P2|P3",
      "category": "unawaited-promise|missing-timeout|race-condition|promise-pattern|error-propagation",
      "file": "src/file.ts",
      "line": 42,
      "description": "Brief description",
      "evidence": "Code snippet",
      "recommendation": "How to fix"
    }
  ]
}
\`\`\`
EOF

echo -e "${GREEN}✓ Human review instructions created${NC}"
echo -e "${YELLOW}Instructions file: /tmp/human-review-instructions-$$.md${NC}"

echo -e "${YELLOW}Step 3: Quick reference${NC}"
echo "Review prompt: $PROMPT_FILE"
echo "Save results to: $SCAN_RESULTS_FILE"
echo "Process results: node sprint-management/review-prompt-lib/scripts/process-findings.cjs $DOMAIN_NAME $SCAN_RESULTS_FILE"

echo -e "${BLUE}=== Ready for Manual LLM Review ===${NC}"
echo -e "${GREEN}Next: Open the instructions file and follow the steps${NC}"

# Open instructions in default editor if available
if command -v open >/dev/null 2>&1; then
    open "/tmp/human-review-instructions-$$.md"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "/tmp/human-review-instructions-$$.md"
else
    echo -e "${YELLOW}Instructions ready at: /tmp/human-review-instructions-$$.md${NC}"
fi

# Cleanup
rm -f "$TEMP_FILE_LIST"
