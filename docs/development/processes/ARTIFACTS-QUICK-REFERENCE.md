# Process Artifacts Quick Reference

**Purpose**: Clear ownership and update responsibilities for all process artifacts  
**Context**: Who generates, who updates, who approves each document

---

## 📋 Artifact Hierarchy Summary

### **Daily Level (Operational)**
| Artifact | Owner | Updater | Frequency | Purpose |
|----------|-------|---------|-----------|---------|
| **tasks.md** | Human | AI (continuous) | Every session | Daily task tracking |
| **daily-session-brief** | AI (generate) | Human (approve) | Each morning | Session planning |
| **session-handoff** | AI (generate) | Human (validate) | Each evening | Context preservation |

### **Weekly Level (Tactical)**
| Artifact | Owner | Updater | Frequency | Purpose |
|----------|-------|---------|-----------|---------|
| **sprint-tasks** | Human | Human + AI | Mon→Fri cycle | Sprint planning |
| **sprint-status** | AI (generate) | Human (review) | Friday | Progress tracking |
| **architecture-decisions** | AI (generate) | Human (approve) | Weekly | ADR summaries |

### **Monthly Level (Strategic)**
| Artifact | Owner | Updater | Frequency | Purpose |
|----------|-------|---------|-----------|---------|
| **BIG-PLAN.md** | Human | Human + AI | Monthly | Project roadmap |
| **PROJECT-STATUS.md** | AI (generate) | Human (review) | Weekly/Monthly | Status dashboard |
| **ADR-OVERVIEW.md** | AI (maintain) | Human (approve) | As needed | Architecture catalog |

---

## 🔄 Update Flow Automation

### **Daily Automation**
```bash
Morning:  tasks.md → AI generates daily-session-brief → Human approves
Execution: AI updates tasks.md continuously with progress
Evening:  AI generates session-handoff → Human validates → Ready for next day
```

### **Weekly Automation**
```bash
Monday:   Human creates sprint-tasks for the week
Daily:    AI aggregates progress from session-handoffs
Friday:   AI generates sprint-status → Human reviews → Plan next sprint
```

### **Monthly Automation**
```bash
Weekly:   AI aggregates sprint-status reports
Monthly:  AI generates PROJECT-STATUS → Human strategic review
Monthly:  Human updates BIG-PLAN → AI tracks ADR evolution
```

---

## 👥 Responsibility Matrix

### **Human Responsibilities (Strategic)**
- **Strategic Planning**: Set sprint goals, project milestones, priorities
- **Quality Validation**: Review AI-generated work, approve architectural decisions
- **Business Alignment**: Ensure technical work supports business objectives
- **Team Coordination**: Communicate status to stakeholders

### **AI Responsibilities (Tactical)**
- **Context Restoration**: Read previous work, search memory, prepare briefings
- **Progress Tracking**: Update task status, aggregate metrics, identify patterns
- **Documentation Generation**: Create handoffs, status reports, summaries
- **Pattern Recognition**: Identify solutions from memory, suggest improvements

### **Shared Responsibilities (Collaborative)**
- **Sprint Management**: Human sets goals, AI tracks progress
- **Architecture Evolution**: Human approves decisions, AI tracks implementations
- **Process Improvement**: Human validates changes, AI identifies patterns
- **Knowledge Preservation**: Human provides context, AI structures memory

---

## 📁 File Structure

```
project-root/
├── tasks.md                           # Daily task tracking
├── docs/
│   ├── BIG-PLAN.md                   # Project roadmap
│   ├── PROJECT-STATUS.md             # Status dashboard
│   ├── sessions/
│   │   ├── daily/
│   │   │   └── brief-YYYY-MM-DD.md   # Daily session briefings
│   │   └── handoffs/
│   │       └── handoff-YYYY-MM-DD.md # Session context preservation
│   ├── sprints/
│   │   ├── sprint-tasks-YYYY-WW.md   # Weekly sprint planning
│   │   ├── status/
│   │   │   └── sprint-status-YYYY-WW.md # Weekly progress
│   │   └── architecture/
│   │       └── arch-decisions-YYYY-WW.md # ADR summaries
│   └── architecture/
│       ├── ADR-OVERVIEW.md           # Complete ADR catalog
│       └── ADR-*.md                  # Individual ADRs
```

---

## ⚡ Quick Start Checklist

### **For New Team Members**
- [ ] Read HUMAN-AI-DEVELOPMENT-PROCESS.md for complete framework
- [ ] Review current tasks.md to understand daily workflow
- [ ] Check latest sprint-tasks for weekly context
- [ ] Review PROJECT-STATUS.md for big picture understanding
- [ ] Use artifact templates for consistent formatting

### **For Daily Operations**
- [ ] Morning: Review daily-session-brief and approve scope
- [ ] Execution: Let AI update tasks.md with progress
- [ ] Evening: Validate session-handoff completeness
- [ ] Weekly: Review sprint-status and plan next sprint
- [ ] Monthly: Update BIG-PLAN with strategic adjustments

---

**Key Principle**: **Human strategic guidance, AI tactical execution, shared quality validation**

**Next Steps**: Implement artifact templates and automation scripts for seamless workflow
