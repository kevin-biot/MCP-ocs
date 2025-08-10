#!/bin/bash
# ADR Creation Helper Script
# Usage: ./docs/scripts/create-adr.sh <number> <title>
# Example: ./docs/scripts/create-adr.sh 006 "Database Connection Pooling Strategy"

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -ne 2 ]; then
    echo -e "${RED}Usage: $0 <adr_number> <title>${NC}"
    echo -e "${YELLOW}Example: $0 006 'Database Connection Pooling Strategy'${NC}"
    exit 1
fi

# Validate we're in the right directory
if [ ! -d "docs/architecture" ]; then
    echo -e "${RED}Error: Please run this script from the MCP-ocs root directory${NC}"
    echo "Expected: /Users/kevinbrown/MCP-ocs"
    echo "Current:  $(pwd)"
    exit 1
fi

ADR_NUM=$(printf "%03d" $1)
TITLE="$2"
SAFE_TITLE=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
FILENAME="docs/architecture/ADR-$ADR_NUM-$SAFE_TITLE.md"

# Check if ADR already exists
if [ -f "$FILENAME" ]; then
    echo -e "${RED}Error: ADR-$ADR_NUM already exists: $FILENAME${NC}"
    exit 1
fi

# Create ADR from template
cat > "$FILENAME" << 'EOF'
# ADR-$ADR_NUM: $TITLE

**Status:** Draft  
**Date:** $(date +"%B %d, %Y")  
**Decision Makers:** Kevin Brown, [Additional Stakeholders]

## Context

[Describe the situation, problem, or opportunity that requires a decision]

### Current Situation
- [What is the current state?]
- [What challenges are we facing?]
- [What constraints do we have?]

### Requirements
- [Functional requirement 1]
- [Functional requirement 2]
- [Non-functional requirement 1]
- [Non-functional requirement 2]

### Constraints
- [Technical constraint 1]
- [Business constraint 1]
- [Timeline constraint]
- [Resource constraint]

## Decision

[State the decision that was made clearly and concisely]

### Chosen Approach
[Describe the selected solution in detail]

### Implementation Strategy
[How this decision will be implemented]

## Rationale

### Alternatives Considered

#### **Option A:** [Alternative 1 Name]
- **Description:** [What this option involves]
- **Pros:** 
  - [Benefit 1]
  - [Benefit 2]
- **Cons:** 
  - [Drawback 1]
  - [Drawback 2]
- **Effort:** [Implementation complexity/time]

#### **Option B:** [Alternative 2 Name]
- **Description:** [What this option involves]
- **Pros:** 
  - [Benefit 1]
  - [Benefit 2]
- **Cons:** 
  - [Drawback 1]
  - [Drawback 2]
- **Effort:** [Implementation complexity/time]

#### **Option C:** [Alternative 3 Name] (if applicable)
- **Description:** [What this option involves]
- **Pros:** 
  - [Benefit 1]
  - [Benefit 2]
- **Cons:** 
  - [Drawback 1]
  - [Drawback 2]
- **Effort:** [Implementation complexity/time]

### Why This Decision

**Primary Reasons:**
1. [Key reason 1 for choosing this approach]
2. [Key reason 2 for choosing this approach]
3. [Key reason 3 for choosing this approach]

**Trade-offs Accepted:**
- [Trade-off 1]: [Justification]
- [Trade-off 2]: [Justification]

## Implementation

### Phase 1: [Phase Name]
- **Timeline:** [Duration estimate]
- **Dependencies:** [What must be completed first]
- **Deliverables:** 
  - [Deliverable 1]
  - [Deliverable 2]

### Phase 2: [Phase Name] (if applicable)
- **Timeline:** [Duration estimate]
- **Dependencies:** [What must be completed first]
- **Deliverables:** 
  - [Deliverable 1]
  - [Deliverable 2]

### Phase 3: [Phase Name] (if applicable)
- **Timeline:** [Duration estimate]
- **Dependencies:** [What must be completed first]
- **Deliverables:** 
  - [Deliverable 1]
  - [Deliverable 2]

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Consequences

### Benefits
✅ **[Benefit Category 1]** - [Specific benefit description]  
✅ **[Benefit Category 2]** - [Specific benefit description]  
✅ **[Benefit Category 3]** - [Specific benefit description]  

### Costs
- **[Cost Category 1]** - [Specific cost description]
- **[Cost Category 2]** - [Specific cost description]
- **[Cost Category 3]** - [Specific cost description]

### Risks
- **[Risk 1]** - [Impact and mitigation strategy]
- **[Risk 2]** - [Impact and mitigation strategy]
- **[Risk 3]** - [Impact and mitigation strategy]

### Assumptions
- [Assumption 1 that this decision depends on]
- [Assumption 2 that this decision depends on]
- [Assumption 3 that this decision depends on]

## Integration with Other ADRs

**Related ADRs:**
- **ADR-001:** [How this relates to OpenShift vs Kubernetes API decision]
- **ADR-002:** [How this relates to GitOps strategy]
- **ADR-003:** [How this relates to memory patterns]
- **ADR-004:** [How this relates to tool namespace management]
- **ADR-005:** [How this relates to workflow state machine]

**Conflicts or Dependencies:**
- [Any conflicts with existing ADRs and how they're resolved]
- [Dependencies on other architectural decisions]

## Monitoring and Review

### Success Metrics
- **[Metric 1]:** [Target value and measurement method]
- **[Metric 2]:** [Target value and measurement method]
- **[Metric 3]:** [Target value and measurement method]

### Review Schedule
- **30-day review:** [What to assess after 30 days]
- **90-day review:** [What to assess after 90 days]
- **6-month review:** [Comprehensive review criteria]

### Decision Reversal Criteria
- [Condition 1 that would trigger reconsidering this decision]
- [Condition 2 that would trigger reconsidering this decision]
- [Process for revisiting this ADR]

## Review Date

**Next Review:** [Date - typically 3-6 months from creation]

**Review Criteria:**
- [Specific things to evaluate during review]
- [Success/failure indicators to assess]
- [Market or technical changes that might affect this decision]

---

**Instructions:**
1. Fill in all bracketed placeholders with specific information
2. Remove any sections that don't apply to your decision
3. Update status from "Draft" to "Accepted" when complete
4. Ensure all stakeholders have reviewed and approved
5. Link this ADR from other relevant documentation
EOF

# Replace template variables
sed -i.bak "s/\$ADR_NUM/$ADR_NUM/g" "$FILENAME"
sed -i.bak "s/\$TITLE/$TITLE/g" "$FILENAME"
sed -i.bak "s/\$(date +\"%B %d, %Y\")/$(date +"%B %d, %Y")/g" "$FILENAME"
rm "$FILENAME.bak"

echo -e "${GREEN}✅ Created ADR: $FILENAME${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. 📝 Edit the template and fill in all bracketed placeholders"
echo "  2. 🔍 Review with stakeholders and gather feedback"
echo "  3. ✅ Update status from 'Draft' to 'Accepted' when complete"
echo "  4. 📋 Add to project documentation and link from relevant files"
echo "  5. 💾 Commit to git with: git add $FILENAME && git commit -m 'feat: Add ADR-$ADR_NUM $TITLE'"
echo
echo -e "${YELLOW}Template sections included:${NC}"
echo "  📋 Context and requirements analysis"
echo "  🎯 Clear decision statement"
echo "  ⚖️  Detailed alternatives comparison"
echo "  🛠️  Implementation phases and timeline"
echo "  📊 Success criteria and metrics"
echo "  🔗 Integration with existing ADRs"
echo "  📈 Monitoring and review schedule"
