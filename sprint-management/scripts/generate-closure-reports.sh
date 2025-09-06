#!/bin/bash

# Sprint Closure Report Generator v3.3
# Usage: ./generate-closure-reports.sh --sprint-id=<id> --metrics-file=<path> [--output-dir=<dir>]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPRINT_MGMT_DIR="$SCRIPT_DIR/.."

# Parse arguments
SPRINT_ID=""
METRICS_FILE=""
OUTPUT_DIR=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --sprint-id=*)
            SPRINT_ID="${1#*=}"
            shift
            ;;
        --metrics-file=*)
            METRICS_FILE="${1#*=}"
            shift
            ;;
        --output-dir=*)
            OUTPUT_DIR="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 --sprint-id=<id> --metrics-file=<path> [--output-dir=<dir>]"
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

echo -e "${BLUE}📋 Sprint Closure Report Generator v3.3${NC}"
echo "Sprint ID: $SPRINT_ID"
echo "Generation Time: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
echo ""

# Validation
if [ -z "$SPRINT_ID" ] || [ -z "$METRICS_FILE" ]; then
    echo -e "${RED}Error: Sprint ID and metrics file required${NC}"
    echo "Usage: $0 --sprint-id=<id> --metrics-file=<path>"
    exit 1
fi

if [ ! -f "$METRICS_FILE" ]; then
    echo -e "${RED}Error: Metrics file not found: $METRICS_FILE${NC}"
    exit 1
fi

# Set default output directory
if [ -z "$OUTPUT_DIR" ]; then
    OUTPUT_DIR="/tmp/sprint-reports-$SPRINT_ID"
fi

mkdir -p "$OUTPUT_DIR"

echo "Metrics source: $METRICS_FILE"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Function to extract JSON values (simple grep approach)
extract_json_value() {
    local file="$1"
    local key="$2"
    grep -o "\"$key\": \"[^\"]*\"" "$file" 2>/dev/null | cut -d'"' -f4 || echo "unknown"
}

extract_json_number() {
    local file="$1" 
    local key="$2"
    grep -o "\"$key\": [0-9]*" "$file" 2>/dev/null | cut -d':' -f2 | tr -d ' ' || echo "0"
}

# Extract key metrics
DURATION=$(extract_json_number "$METRICS_FILE" "total_duration_minutes")
FILES_MODIFIED=$(extract_json_number "$METRICS_FILE" "files_modified")
COMMITS_MADE=$(extract_json_number "$METRICS_FILE" "commits_made")
LINES_CHANGED=$(extract_json_number "$METRICS_FILE" "lines_changed")
FINDINGS_COUNT=$(extract_json_number "$METRICS_FILE" "total_findings")
FRAMEWORK_VERSION=$(extract_json_value "$METRICS_FILE" "framework_version")
TOKENS_ESTIMATED=$(extract_json_number "$METRICS_FILE" "tokens_estimated")

echo -e "${YELLOW}Extracted metrics:${NC}"
echo "  Duration: $DURATION minutes"
echo "  Files: $FILES_MODIFIED, Commits: $COMMITS_MADE, Lines: $LINES_CHANGED"
echo "  Framework: $FRAMEWORK_VERSION"
echo "  Findings: $FINDINGS_COUNT"
echo ""

# Generate Technical Metrics Report
echo -e "${BLUE}Generating Technical Metrics Report...${NC}"

TECHNICAL_REPORT="$OUTPUT_DIR/technical-metrics-report.md"

cat > "$TECHNICAL_REPORT" << EOF
# Sprint $SPRINT_ID Technical Metrics Report

**Generated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Framework**: Process $FRAMEWORK_VERSION  
**Data Source**: Automated metrics collection + manual verification

---

## 📊 Execution Performance

### Duration Analysis
- **Total Sprint Duration**: ${DURATION} minutes ($(echo "scale=2; $DURATION/60" | bc 2>/dev/null || echo "$(($DURATION/60))")h $(($DURATION%60))m)
- **Estimated vs Actual**: *Manual input required*
- **Variance**: *To be calculated after estimation comparison*

### Development Activity
- **Files Modified**: $FILES_MODIFIED
- **Commits Made**: $COMMITS_MADE  
- **Lines Changed**: $LINES_CHANGED
- **Change Velocity**: $(echo "scale=1; $LINES_CHANGED/$DURATION" | bc 2>/dev/null || echo "N/A") lines/minute

---

## 🔧 Resource Consumption

### Token Usage Analysis
- **Estimated Token Usage**: $TOKENS_ESTIMATED tokens
- **Actual Token Usage**: *Manual input required*
- **Efficiency Ratio**: *To be calculated*
- **Token Velocity**: $(echo "scale=1; $TOKENS_ESTIMATED/$DURATION" | bc 2>/dev/null || echo "N/A") tokens/minute

### Phase Distribution
- **DEVELOPER Phase**: *Manual timing required*
- **TESTER Phase**: *Manual timing required*  
- **REVIEWER Phase**: *Manual timing required*
- **Quality Integration**: *Manual assessment required*

---

## 🎯 Quality Achievement

### Problem Resolution Metrics
- **Target Problem Category**: *Manual input required*
- **Quality Findings Identified**: $FINDINGS_COUNT issues
- **Resolution Rate**: *Manual verification required*
- **Evidence Quality**: *Manual assessment required*

### Domain Verification
- **Domains Checked**: *Extract from quality scan results*
- **Regression Analysis**: *Manual verification required*
- **Quality Gate Status**: *Manual assessment required*

---

## ⚙️ Process Effectiveness

### Framework Adherence
- **Process Version**: $FRAMEWORK_VERSION
- **Problem-Resolution Approach**: *Manual verification required*
- **Role Execution Quality**: *Manual assessment required*
- **Evidence-Based Closure**: *Manual verification required*

### Quality Integration Success
- **Weekly Findings Integration**: *Manual assessment required*
- **Domain Rule Engine Usage**: *Manual verification required*
- **Historical Registry Updates**: *Manual verification required*

---

## 📈 Calibration Data

### Performance Multipliers
- **Domain Complexity Factor**: *Calculate based on problem category*
- **Framework Efficiency**: *Calculate based on actual vs estimated*
- **Quality Integration Overhead**: *Assess additional time for quality checks*

### Future Estimation Inputs
\`\`\`json
{
  "sprint_pattern": "*manual input required*",
  "complexity_tier": "*assess based on difficulty*", 
  "actual_metrics": {
    "duration_minutes": $DURATION,
    "tokens_consumed": "*manual input*",
    "files_modified": $FILES_MODIFIED,
    "problems_resolved": "*manual count*"
  },
  "estimation_multipliers": {
    "domain_factor": "*calculate*",
    "framework_efficiency": "*calculate*",
    "quality_overhead": "*calculate*"
  }
}
\`\`\`

---

## 🔍 Lessons Learned

### Process Improvements
- *Manual input required: What worked well?*
- *Manual input required: What could be improved?*
- *Manual input required: Framework effectiveness assessment*

### Quality Intelligence Insights  
- *Manual input required: Weekly findings integration effectiveness*
- *Manual input required: Domain rule engine accuracy*
- *Manual input required: Evidence collection improvements*

### Calibration Adjustments
- *Manual input required: Estimation accuracy assessment*
- *Manual input required: Resource consumption patterns*
- *Manual input required: Framework efficiency observations*

---

**Report Status**: Automated base + Manual enhancement required  
**Next Actions**: 
1. Fill in manual assessment sections
2. Calculate variance metrics  
3. Update sprint registry with calibration data
4. Generate executive summary
EOF

echo "✓ Technical report: $TECHNICAL_REPORT"

# Generate Executive Summary Report
echo -e "${BLUE}Generating Executive Summary Report...${NC}"

EXECUTIVE_REPORT="$OUTPUT_DIR/executive-summary-report.md"

cat > "$EXECUTIVE_REPORT" << EOF
# Sprint $SPRINT_ID Executive Summary

**Sprint Completion**: $(date -u +"%Y-%m-%d")  
**Framework**: Process $FRAMEWORK_VERSION  
**Duration**: ${DURATION} minutes ($(echo "scale=1; $DURATION/60" | bc 2>/dev/null || echo "$(($DURATION/60))")h)

---

## 🎯 Sprint Objective & Status

**Objective**: *Manual input required: What problem category was targeted?*  
**Status**: *Manual input required: ✅ COMPLETED / ⚠️ PARTIAL / ❌ INCOMPLETE*  
**Impact**: *Manual input required: Quantified business/technical impact*

---

## 🏆 Key Achievements

### Problem Resolution Success
- **Target Problem Category**: *Manual input required*
- **Resolution Approach**: Systematic problem elimination (Process $FRAMEWORK_VERSION)
- **Quality Verification**: $FINDINGS_COUNT issues identified and addressed
- **Evidence Standard**: *Manual assessment: High/Medium/Low confidence closure*

### Technical Accomplishments
- **Code Changes**: $FILES_MODIFIED files modified, $LINES_CHANGED lines changed
- **Development Velocity**: $(echo "scale=1; $LINES_CHANGED/$DURATION" | bc 2>/dev/null || echo "N/A") lines per minute
- **Quality Integration**: *Manual assessment: Successful domain verification*
- **Zero Technical Debt**: *Manual verification: v3.3 policy maintained*

---

## 📊 Performance Metrics

### Execution Efficiency
- **Delivery Time**: ${DURATION} minutes
- **Estimated vs Actual**: *Manual input: % variance*
- **Resource Efficiency**: *Manual calculation: % of budgeted tokens used*
- **Quality Overhead**: *Manual assessment: Additional time for quality checks*

### Process Effectiveness
- **Framework Adherence**: Process $FRAMEWORK_VERSION problem-resolution approach
- **Quality Integration**: *Manual assessment: Weekly findings integration success*
- **Evidence Collection**: *Manual assessment: Closure confidence level*
- **Team Coordination**: *Manual assessment: Role execution effectiveness*

---

## 🎯 Business Impact

### Quality Improvement
- **Problem Category Addressed**: *Manual input required*
- **Risk Reduction**: *Manual assessment: Security/stability/maintainability improvements*
- **Technical Debt**: *Manual calculation: Debt eliminated vs accumulated*
- **Future Prevention**: *Manual input: Preventive measures implemented*

### Development Velocity Impact
- **Immediate**: *Manual assessment: Sprint completion efficiency*
- **Medium-term**: *Manual assessment: Reduced debugging/maintenance overhead*
- **Long-term**: *Manual assessment: Quality baseline improvement impact*

---

## 🔄 Process Intelligence

### Framework Evolution
- **Process $FRAMEWORK_VERSION Effectiveness**: *Manual assessment: High/Medium/Low*
- **Problem-Resolution Approach**: *Manual assessment: vs traditional task completion*
- **Quality Intelligence Integration**: *Manual assessment: Weekly → Daily flow effectiveness*

### Systematic Improvements
- **Evidence-Based Closure**: *Manual verification: Achieved/Partial/Missing*
- **Domain Verification**: *Manual assessment: Regression prevention effectiveness*
- **Historical Integration**: *Manual verification: Quality baseline updates*

---

## 🚀 Next Sprint Context

### Quality Intelligence Updates
- **Problem Categories Identified**: *Manual input: New categories discovered*
- **Domain Patterns**: *Manual input: Cross-domain implications*
- **Preventive Measures**: *Manual input: Future issue prevention*

### Process Calibration
- **Estimation Accuracy**: *Manual calculation: Actual vs estimated variance*
- **Resource Planning**: *Manual input: Token/time budgeting improvements*
- **Framework Refinements**: *Manual input: Process improvement opportunities*

### Team Effectiveness
- **Role Execution**: *Manual assessment: DEVELOPER/TESTER/REVIEWER effectiveness*
- **Quality Integration**: *Manual assessment: Daily/weekly process coordination*
- **Knowledge Transfer**: *Manual input: Lessons learned for team*

---

## 📋 Stakeholder Communications

### Key Messages
1. **Objective Achievement**: *Manual input: Problem resolution success*
2. **Quality Assurance**: Systematic verification with evidence-based closure
3. **Process Maturity**: Process $FRAMEWORK_VERSION delivering measurable improvements
4. **Risk Management**: Proactive quality engineering preventing future issues

### Metrics Summary
- **Delivery**: ${DURATION}-minute sprint with $FILES_MODIFIED files improved
- **Quality**: $FINDINGS_COUNT issues systematically addressed
- **Efficiency**: *Manual input: % improvement over estimated time/resources*
- **Innovation**: Problem-resolution approach vs traditional task completion

---

**Report Status**: Executive overview with manual enhancement required  
**Audience**: Project stakeholders, management, team leads  
**Next Review**: *Schedule follow-up based on sprint cycle*
EOF

echo "✓ Executive summary: $EXECUTIVE_REPORT"

# Generate Calibration Data Export
echo -e "${BLUE}Generating Calibration Data Export...${NC}"

CALIBRATION_EXPORT="$OUTPUT_DIR/calibration-data-export.json"

cat > "$CALIBRATION_EXPORT" << EOF
{
  "sprint_metadata": {
    "sprint_id": "$SPRINT_ID",
    "completion_date": "$(date -u +%Y-%m-%d)",
    "framework_version": "$FRAMEWORK_VERSION",
    "report_generation": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
  },
  "execution_metrics": {
    "total_duration_minutes": $DURATION,
    "development_activity": {
      "files_modified": $FILES_MODIFIED,
      "commits_made": $COMMITS_MADE,
      "lines_changed": $LINES_CHANGED,
      "change_velocity_per_minute": $(echo "scale=3; $LINES_CHANGED/$DURATION" | bc 2>/dev/null || echo 0)
    },
    "phase_breakdown": {
      "developer_minutes": "manual_input_required",
      "tester_minutes": "manual_input_required", 
      "reviewer_minutes": "manual_input_required",
      "quality_integration_minutes": "manual_input_required"
    }
  },
  "resource_consumption": {
    "tokens_estimated": $TOKENS_ESTIMATED,
    "tokens_actual": "manual_input_required",
    "token_velocity_per_minute": $(echo "scale=1; $TOKENS_ESTIMATED/$DURATION" | bc 2>/dev/null || echo 0),
    "efficiency_ratio": "calculated_after_manual_input"
  },
  "quality_metrics": {
    "problem_category": "manual_input_required",
    "findings_identified": $FINDINGS_COUNT,
    "findings_resolved": "manual_input_required",
    "resolution_rate": "calculated_after_manual_input",
    "domain_checks_executed": "manual_input_required",
    "regression_prevention": "manual_assessment_required"
  },
  "process_effectiveness": {
    "framework_adherence_score": "manual_assessment_required",
    "problem_resolution_vs_task_completion": "manual_assessment_required",
    "evidence_based_closure_achieved": "manual_verification_required",
    "quality_integration_success": "manual_assessment_required"
  },
  "estimation_calibration": {
    "estimated_duration_minutes": "manual_input_required",
    "estimated_tokens": "manual_input_required",
    "duration_variance_percent": "calculated_after_manual_input",
    "token_variance_percent": "calculated_after_manual_input",
    "estimation_accuracy": "calculated_after_manual_input"
  },
  "future_planning_data": {
    "complexity_tier": "manual_assessment_required",
    "domain_difficulty_factor": "manual_calculation_required",
    "framework_efficiency_multiplier": "calculated_after_manual_input",
    "quality_overhead_factor": "manual_assessment_required"
  },
  "integration_ready_fields": {
    "jira_story_points": "manual_input_required",
    "jira_epic_progress": "manual_calculation_required",
    "velocity_trend": "calculated_from_historical_data",
    "technical_debt_delta": "manual_assessment_required",
    "quality_score": "calculated_from_resolution_rate"
  },
  "data_completeness": {
    "automated_collection": "partial",
    "manual_input_required": true,
    "calculation_pending": true,
    "ready_for_historical_analysis": false
  }
}
EOF

echo "✓ Calibration export: $CALIBRATION_EXPORT"

# Generate report index
echo -e "${BLUE}Generating Report Index...${NC}"

REPORT_INDEX="$OUTPUT_DIR/report-index.md"

cat > "$REPORT_INDEX" << EOF
# Sprint $SPRINT_ID Closure Reports

**Generated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")  
**Framework**: Process $FRAMEWORK_VERSION  
**Status**: Base reports generated, manual enhancement required

---

## 📋 Report Suite

### 1. Technical Metrics Report
**File**: [technical-metrics-report.md](./technical-metrics-report.md)  
**Purpose**: Process calibration and framework effectiveness analysis  
**Audience**: Engineering team, process improvement  
**Status**: Automated base + manual enhancement required

### 2. Executive Summary Report  
**File**: [executive-summary-report.md](./executive-summary-report.md)  
**Purpose**: Stakeholder communication and business impact summary  
**Audience**: Management, project stakeholders  
**Status**: Executive template + manual completion required

### 3. Calibration Data Export
**File**: [calibration-data-export.json](./calibration-data-export.json)  
**Purpose**: Machine-readable metrics for historical analysis  
**Audience**: Automated systems, trend analysis  
**Status**: Partial data + manual input required for completion

---

## 🔧 Manual Enhancement Required

### Critical Data Points Needed:
- [ ] **Problem Category**: What quality debt category was targeted?
- [ ] **Resolution Success**: How many issues were actually resolved?
- [ ] **Estimation Data**: What were the original time/resource estimates?
- [ ] **Phase Timing**: Actual DEVELOPER/TESTER/REVIEWER duration breakdown
- [ ] **Quality Assessment**: Evidence confidence and closure verification

### Enhancement Process:
1. **Review automated metrics** for accuracy and completeness
2. **Fill in manual assessment** sections throughout reports
3. **Calculate variance metrics** between estimated and actual
4. **Validate quality achievements** with evidence verification
5. **Update sprint registry** with completed calibration data

---

## 📊 Key Metrics Summary

- **Duration**: ${DURATION} minutes
- **Development Activity**: $FILES_MODIFIED files, $LINES_CHANGED lines changed
- **Quality Findings**: $FINDINGS_COUNT issues identified
- **Framework**: Process $FRAMEWORK_VERSION problem-resolution approach
- **Resource Estimate**: $TOKENS_ESTIMATED tokens

---

## 🚀 Next Actions

1. **Manual Enhancement**: Complete all "manual_input_required" sections
2. **Calculation Update**: Compute variance and efficiency metrics
3. **Historical Integration**: Add to sprint registry for trend analysis
4. **Archive Preparation**: Include in standardized sprint closure package

**Report Generation**: Automated collection + human verification model  
**Integration Ready**: After manual enhancement completion
EOF

echo "✓ Report index: $REPORT_INDEX"

echo ""
echo -e "${GREEN}✓ Sprint closure reports generated successfully${NC}"
echo ""
echo -e "${YELLOW}Generated reports:${NC}"
echo "  Technical Metrics: $TECHNICAL_REPORT"
echo "  Executive Summary: $EXECUTIVE_REPORT" 
echo "  Calibration Data: $CALIBRATION_EXPORT"
echo "  Report Index: $REPORT_INDEX"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review and enhance reports with manual input"
echo "  2. Calculate variance metrics between estimated and actual"
echo "  3. Validate quality achievements with evidence"
echo "  4. Use ./finalize-sprint.sh for complete archive closure"
echo ""

# Output the report directory for script chaining
echo "$OUTPUT_DIR"
