# Claude Daily Standup Assistant

This tool integrates with your sprint management framework to provide AI-enhanced daily standup decisions.

## How It Works

### 1. **Morning Standup Analysis (Claude)**
```bash
# You would run this in Claude (not Codex):
# "Analyze yesterday's sprint progress and recommend today's task assignments"
```

**Claude reads:**
- Yesterday's completion logs (`completion-logs/*-YYYY-MM-DD.md`)
- Current sprint status (`tasks-current.md`)
- Memory of previous sprint decisions
- Git status and recent commits

**Claude provides:**
- **Progress Assessment**: What was completed vs. planned
- **Blocker Analysis**: What issues were encountered
- **Task Recommendations**: Which tasks should be prioritized today
- **Role Assignments**: How to distribute work across DEVELOPER/TESTER/REVIEWER
- **Risk Factors**: What to watch out for today

### 2. **Human Decision Making**
Based on Claude's analysis, you make final decisions:
- Primary task for today
- Secondary task (if time permits)  
- Special focus areas (bugs, performance, testing)
- Session time allocation
- Any scope adjustments

### 3. **Dynamic Content Generation**
The enhanced setup script then generates role-context files with:
- **Specific task assignments** from your decisions
- **Previous day context** from completion logs
- **Implementation guidance** tailored to today's tasks
- **Success criteria** based on current priorities

## Example Daily Standup Flow

### **Step 1: Claude Analysis**
**Prompt to Claude:**
```
Analyze our MCP-ocs sprint progress and recommend today's tasks.

Review:
- Yesterday's completion logs
- Sprint objectives (Template Hygiene Sweep)
- Current task status
- Any blockers or issues

Recommend:
- Primary task for DEVELOPER today
- Secondary tasks if time permits
- Testing focus for TESTER role
- Review priorities for REVIEWER role
- Any risks or special considerations
```

**Claude responds with:**
```markdown
## Sprint Progress Analysis - 2025-08-29

### Yesterday's Achievements
✅ TASK-001 (Dynamic Resource Selection) - 80% complete
⚠️ TASK-002 (Evidence Completeness) - Blocked by test failures
❌ TASK-003 (Output Parsing) - Not started

### Today's Recommendations

**DEVELOPER Priority:**
- **Primary**: Complete TASK-001 (finish remaining 20%)
- **Secondary**: Debug TASK-002 test failures (estimated 1 hour)
- **Avoid**: Don't start TASK-003 until TASK-002 is solid

**Focus Areas:**
- Test coverage for dynamic resource selection
- Integration testing with existing templates
- Pattern consistency validation

**Risks:**
- TASK-002 test failures might indicate deeper issues
- Sprint timeline pressure - may need to defer TASK-004
```

### **Step 2: Human Decisions**
Based on Claude's analysis, you decide:
```bash
# Your standup decisions:
DEVELOPER_PRIMARY_TASK="TASK-001"
DEVELOPER_SECONDARY_TASK="TASK-002"  
DAILY_FOCUS="Test coverage and integration testing"
SESSION_DURATION="3 hours"
SPECIAL_NOTES="Focus on fixing test failures before new features"
```

### **Step 3: Enhanced Setup Generation**
```bash
bash scripts/setup-sprint-day-enhanced.sh
```

This generates role-context files with:
- Your specific task assignments
- Claude's analysis incorporated as guidance
- Previous day's context included
- Success criteria aligned with decisions

## Integration with Memory System

The standup assistant can leverage our memory system:

### **Memory Queries Claude Can Use:**
```bash
# Search sprint history
search_conversation_memory(query="sprint progress TASK-001 completion status")

# Review previous blockers
search_conversation_memory(query="template hygiene issues blockers")

# Check implementation patterns
search_conversation_memory(query="ingress template pattern implementation")
```

### **Memory Storage After Standup:**
```bash
# Store standup decisions
store_conversation_memory(
    session="daily-standup-2025-08-29",
    userMessage="Daily standup decisions for Template Hygiene Sweep",
    assistantResponse="Recommended TASK-001 completion + TASK-002 debugging...",
    tags=["daily-standup", "task-assignments", "sprint-planning"]
)
```

## Benefits of This Approach

### **1. Context Continuity**
- Claude remembers previous days' issues and progress
- Decisions build on actual completion status, not assumptions
- Blockers are tracked and addressed systematically

### **2. Intelligent Prioritization**
- Task recommendations based on dependency analysis
- Risk-aware scheduling (don't start complex tasks with little time)
- Quality gates enforced (finish testing before new features)

### **3. Dynamic Role Assignment**
- DEVELOPER gets tasks matched to current sprint state
- TESTER focuses on areas that need validation  
- REVIEWER priorities align with what was actually built

### **4. Learning and Improvement**
- Sprint patterns recognized and optimized
- Common blockers anticipated and prevented
- Velocity tracking improves estimation accuracy

## Future Enhancement: Fully Automated Standup

Eventually, this could become:

```bash
# Fully automated daily setup
bash scripts/ai-standup-and-setup.sh

# Which would:
# 1. Claude analyzes previous day automatically
# 2. Generates recommendations
# 3. Presents options to human for quick approval
# 4. Creates all daily files with personalized content
# 5. Starts DEVELOPER session immediately
```

This transforms the daily setup from **static template generation** to **intelligent, context-aware task orchestration** based on real progress and human strategic decisions.
