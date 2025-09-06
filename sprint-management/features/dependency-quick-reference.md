# Feature Dependency Quick Reference

**Purpose**: Visual guide for sprint planning - shows dependency order, not feature numbers  
**Usage**: Check this before selecting features for sprint planning  

---

## 🎯 Dependency-Driven Implementation Flow

```
                    ┌─────────┐
                    │  F-001  │◄── START HERE (Core Platform)
                    │ ACTIVE  │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼────┐ ┌───▼───┐ ┌────▼────┐
         │  F-003  │ │ F-006 │ │  F-008  │◄── CAN RUN PARALLEL
         │P1-CRIT  │ │P2-HIGH│ │P2-MED   │
         └─────────┘ └───┬───┘ └─────────┘
                         │
                    ┌────▼────┐
                    │  F-009  │
                    │P2-HIGH  │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  F-002  │
                    │P1-HIGH  │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  F-007  │◄── OPTIONAL
                    │P3-MED   │
                    └─────────┘
                         
    ┌─────────────────────────────────────────┐
    │  F-004 & F-005 can run parallel with   │
    │  multiple features after F-001 stable  │
    └─────────────────────────────────────────┘
```

---

## 🚦 Sprint Planning Rules

### **Rule 1: Dependencies Block Everything**
```yaml
F-001_NOT_STABLE:
  blocked_features: [F-003, F-006, F-008, F-004]
  
F-006_NOT_COMPLETE:
  blocked_features: [F-009, F-007]
  
F-009_NOT_COMPLETE:
  reduced_value: [F-002]  # F-002 works but gets less value
```

### **Rule 2: Parallel Development Opportunities**
```yaml
when_f001_stable:
  parallel_options:
    - [F-003, F-006]     # Production + Input Processing
    - [F-008, F-005]     # Tool Architecture + Tool Maturity
    - [F-004]            # Template Quality (foundation for others)

when_f006_complete:
  parallel_options:
    - [F-009, F-008]     # RCA + Tool Architecture
    - [F-007, F-005]     # NFM + Tool Maturity (if needed)
```

### **Rule 3: Value Multipliers**
```yaml
# These features multiply the value of others when implemented first:
F-001: enables_everything
F-006: multiplies_value_of: [F-009, F-007, F-002]
F-009: multiplies_value_of: [F-002]
F-008: multiplies_value_of: [F-005, F-002]
```

---

## 📋 Sprint Planning Checklist

### **Before Starting Any Feature Sprint**
- [ ] Check dependency status in this diagram
- [ ] Verify prerequisite features are stable (not just complete)
- [ ] Consider parallel development opportunities  
- [ ] Validate that team has required skills for dependencies
- [ ] Confirm no blocking issues in prerequisite features

### **During Sprint Planning**
- [ ] Reference dependency graph, not feature numbers
- [ ] Plan parallel work when dependencies allow
- [ ] Include dependency validation tasks in sprint
- [ ] Set up integration points between parallel features
- [ ] Plan for dependency completion gates

### **Sprint Success Criteria**
- [ ] All planned dependencies are met or maintained
- [ ] Parallel features don't create integration conflicts
- [ ] Feature completion enables downstream dependencies
- [ ] No blocking issues introduced for future sprints
- [ ] Clear handoff criteria for dependent features

---

## ⚠️ Common Sprint Planning Mistakes

### **❌ What NOT to Do**
```yaml
# DON'T select features by number sequence
BAD_SPRINT: [F-001, F-002, F-003]  # F-002 depends on F-009!

# DON'T ignore dependencies  
BAD_SPRINT: [F-009]  # F-009 depends on F-006!

# DON'T miss parallel opportunities
INEFFICIENT: [F-003] then [F-006]  # Could run parallel after F-001
```

### **✅ What TO Do**
```yaml
# DO follow dependency order
GOOD_SPRINT: [F-001] → [F-003, F-006] → [F-009] → [F-002]

# DO leverage parallel development
EFFICIENT_SPRINT: 
  week_1: [F-001_completion]
  week_2: [F-003_start, F-006_start]  # Parallel
  week_3: [F-008_start, F-005_start]  # Parallel

# DO plan integration points
SMART_SPRINT:
  features: [F-006, F-009]
  integration_tasks: ["F-009 pattern recognition uses F-006 normalization"]
```

---

## 🎯 Success Patterns

### **Most Efficient Implementation Sequences**
1. **Linear Critical Path**: F-001 → F-003 → F-006 → F-009 → F-002
2. **Parallel Optimized**: F-001 → [F-003 + F-006] → [F-009 + F-008] → F-002  
3. **Value-First**: F-001 → F-006 → F-009 → [F-002 + F-008] (RCA value early)

### **Resource Allocation Patterns**
- **Single Team**: Follow linear critical path
- **Two Teams**: Core team on critical path, second team on parallel features
- **Three+ Teams**: Critical path + parallel features + quality/documentation

---

**Quick Reference Owner**: Sprint Planning Team  
**Update Trigger**: When feature dependencies change  
**Review Frequency**: Before each sprint planning session  
**Validation**: Check against actual feature epic specifications for dependency accuracy
