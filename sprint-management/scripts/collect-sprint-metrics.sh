#!/bin/bash

# Sprint Metrics Collector v3.3
# Usage: ./collect-sprint-metrics.sh --sprint-id=<id> [--start-time=<timestamp>] [--end-time=<timestamp>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPRINT_MGMT_DIR="$SCRIPT_DIR/.."

# Parse arguments
SPRINT_ID=""
START_TIME=""
END_TIME=""
AUTO_DETECT="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        --sprint-id=*)
            SPRINT_ID="${1#*=}"
            shift
            ;;
        --start-time=*)
            START_TIME="${1#*=}"
            shift
            ;;
        --end-time=*)
            END_TIME="${1#*=}"
            shift
            ;;
        --auto-detect)
            AUTO_DETECT="true"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --sprint-id=<id> [--start-time=<timestamp>] [--end-time=<timestamp>] [--auto-detect]"
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

echo -e "${BLUE}📊 Sprint Metrics Collector v3.3${NC}"
echo "Sprint ID: $SPRINT_ID"
echo "Collection Time: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo ""

# Validation
if [ -z "$SPRINT_ID" ]; then
    echo -e "${RED}Error: Sprint ID required${NC}"
    echo "Usage: $0 --sprint-id=<id>"
    exit 1
fi

# Auto-detect timing from active task if requested
if [[ "$AUTO_DETECT" == "true" ]]; then
    echo -e "${YELLOW}Auto-detecting sprint timing from execution logs...${NC}"
    
    # Look for execution logs in active-tasks
    ACTIVE_TASK_DIR="$SPRINT_MGMT_DIR/active-tasks"
    if [ -d "$ACTIVE_TASK_DIR" ]; then
        # Find recent sprint files
        RECENT_FILES=$(find "$ACTIVE_TASK_DIR" -name "*.md" -mtime -1 2>/dev/null | head -5)
        if [ -n "$RECENT_FILES" ]; then
            echo "  Found recent task files:"
            echo "$RECENT_FILES" | sed 's/^/    /'
        fi
    fi
    
    # Default to last 4 hours if no specific timing
    if [ -z "$START_TIME" ]; then
        START_TIME=$(date -d "4 hours ago" -u +%Y-%m-%dT%H:%M:%S.%3NZ)
        echo "  Estimated start time: $START_TIME"
    fi
fi

# Default end time to now
if [ -z "$END_TIME" ]; then
    END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
fi

echo "Start time: $START_TIME"
echo "End time: $END_TIME"
echo ""

# Create metrics output file
METRICS_FILE="/tmp/sprint-metrics-$SPRINT_ID-$$.json"

echo -e "${BLUE}Collecting sprint metrics...${NC}"

# Calculate duration if both times available
DURATION_MINUTES="unknown"
if [ -n "$START_TIME" ] && [ -n "$END_TIME" ]; then
    if command -v date >/dev/null 2>&1; then
        START_EPOCH=$(date -d "$START_TIME" +%s 2>/dev/null || echo "")
        END_EPOCH=$(date -d "$END_TIME" +%s 2>/dev/null || echo "")
        
        if [ -n "$START_EPOCH" ] && [ -n "$END_EPOCH" ]; then
            DURATION_SECONDS=$((END_EPOCH - START_EPOCH))
            DURATION_MINUTES=$((DURATION_SECONDS / 60))
            echo "  Calculated duration: $DURATION_MINUTES minutes"
        fi
    fi
fi

# Collect git metrics
echo -e "${YELLOW}Git Activity Analysis:${NC}"
cd "$SPRINT_MGMT_DIR/.." 2>/dev/null || cd "$SPRINT_MGMT_DIR"

FILES_MODIFIED=$(git diff --name-only HEAD~1 2>/dev/null | wc -l || echo 0)
COMMITS_MADE=$(git log --oneline --since="$START_TIME" --until="$END_TIME" 2>/dev/null | wc -l || echo 0)
LINES_CHANGED=$(git diff --stat HEAD~1 2>/dev/null | tail -1 | grep -o '[0-9]* insertions\|[0-9]* deletions' | grep -o '[0-9]*' | paste -sd+ | bc 2>/dev/null || echo 0)

echo "  Files modified: $FILES_MODIFIED"
echo "  Commits made: $COMMITS_MADE" 
echo "  Lines changed: $LINES_CHANGED"

# Collect quality metrics from recent domain checks
echo -e "${YELLOW}Quality Metrics Analysis:${NC}"
QUALITY_CHECKS_RUN=""
FINDINGS_COUNT="0"

# Look for recent quality check results
REVIEW_LIB_DIR="$SPRINT_MGMT_DIR/review-prompt-lib"
if [ -d "$REVIEW_LIB_DIR" ]; then
    # Find recent scan results
    RECENT_SCANS=$(find "$REVIEW_LIB_DIR/domains" -name "*$(date +%Y-%m-%d)*scan-results.json" -type f 2>/dev/null)
    
    if [ -n "$RECENT_SCANS" ]; then
        echo "  Recent quality scans found:"
        echo "$RECENT_SCANS" | sed 's/^/    /'
        
        # Count total findings
        for scan in $RECENT_SCANS; do
            if [ -f "$scan" ]; then
                SCAN_FINDINGS=$(grep -o '"severity": "P[0-3]"' "$scan" 2>/dev/null | wc -l || echo 0)
                FINDINGS_COUNT=$((FINDINGS_COUNT + SCAN_FINDINGS))
                
                # Extract domain name
                DOMAIN=$(echo "$scan" | sed 's/.*domains\/\([^\/]*\)\/.*/\1/')
                QUALITY_CHECKS_RUN="$QUALITY_CHECKS_RUN $DOMAIN"
            fi
        done
        
        echo "  Total findings across domains: $FINDINGS_COUNT"
        echo "  Domains checked:$QUALITY_CHECKS_RUN"
    else
        echo "  No recent quality scans found"
    fi
fi

# Estimate token usage (placeholder - would integrate with actual LLM usage tracking)
echo -e "${YELLOW}Resource Usage Estimation:${NC}"
ESTIMATED_TOKENS=$((DURATION_MINUTES * 500))  # Rough estimate: 500 tokens/minute
echo "  Estimated token usage: $ESTIMATED_TOKENS (based on duration)"

# Detect process framework used
FRAMEWORK_VERSION="v3.3"
PROBLEM_RESOLUTION_APPROACH="true"
if [ -f "$SPRINT_MGMT_DIR/active-tasks/current-sprint.md" ]; then
    if grep -q "problem-resolution" "$SPRINT_MGMT_DIR/active-tasks/current-sprint.md" 2>/dev/null; then
        PROBLEM_RESOLUTION_APPROACH="true"
    fi
fi

echo "  Framework used: Process $FRAMEWORK_VERSION"
echo "  Problem-resolution approach: $PROBLEM_RESOLUTION_APPROACH"

# Generate metrics JSON
echo -e "${BLUE}Generating metrics data...${NC}"

cat > "$METRICS_FILE" << EOF
{
  "sprint_metadata": {
    "sprint_id": "$SPRINT_ID",
    "collection_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "start_time": "$START_TIME",
    "end_time": "$END_TIME",
    "framework_version": "$FRAMEWORK_VERSION"
  },
  "execution_metrics": {
    "total_duration_minutes": $DURATION_MINUTES,
    "phase_breakdown": {
      "developer": "unknown",
      "tester": "unknown",
      "reviewer": "unknown"
    },
    "estimated_vs_actual": {
      "variance_percent": "unknown"
    }
  },
  "git_activity": {
    "files_modified": $FILES_MODIFIED,
    "commits_made": $COMMITS_MADE,
    "lines_changed": $LINES_CHANGED
  },
  "resource_consumption": {
    "tokens_estimated": $ESTIMATED_TOKENS,
    "tokens_actual": "unknown",
    "efficiency_ratio": "unknown"
  },
  "quality_metrics": {
    "domain_checks_run": "$QUALITY_CHECKS_RUN",
    "total_findings": $FINDINGS_COUNT,
    "resolution_rate": "unknown"
  },
  "process_effectiveness": {
    "framework_adherence": "unknown",
    "problem_resolution_approach": $PROBLEM_RESOLUTION_APPROACH,
    "evidence_based_closure": "unknown",
    "quality_integration_success": "unknown"
  },
  "collection_method": {
    "auto_detected": $AUTO_DETECT,
    "data_completeness": "partial",
    "manual_input_required": true
  }
}
EOF

echo "✓ Metrics collected to: $METRICS_FILE"
echo ""

# Display summary
echo -e "${GREEN}Sprint Metrics Summary:${NC}"
echo "  Duration: $DURATION_MINUTES minutes"
echo "  Files modified: $FILES_MODIFIED"
echo "  Quality findings: $FINDINGS_COUNT"
echo "  Framework: Process $FRAMEWORK_VERSION"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review and enhance metrics in: $METRICS_FILE"
echo "  2. Run: ./generate-closure-reports.sh --sprint-id=$SPRINT_ID --metrics-file=$METRICS_FILE"
echo "  3. Use: ./finalize-sprint.sh --sprint-id=$SPRINT_ID for complete closure"
echo ""

echo -e "${GREEN}✓ Sprint metrics collection complete${NC}"

# Output metrics file path for script chaining
echo "$METRICS_FILE"
