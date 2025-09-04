# Feature Dependency Quick Reference (Updated with RFR Critical Path)

**Purpose**: Visual guide for sprint planning - shows dependency order including P0 BLOCKING RFR remediation  
**Usage**: Check this before selecting ANY development work - RFR blocks everything  
**Strategic Integration**: Supports [Unified Strategic Roadmap](../../docs/implementation/UNIFIED_STRATEGIC_ROADMAP.md) execution

---

## 🚨 CRITICAL: RFR REMEDIATION BLOCKS ALL DEVELOPMENT

**⚠️ DEVELOPMENT FREEZE POLICY**: ALL feature development FROZEN until RFR completion  
**Phase 0 Priority**: RFR-001/002/003 MUST complete before ANY other work  
**Timeline**: 5-8 sprints (40-60 days) for architectural debt remediation

---

## 🎯 Updated Dependency-Driven Implementation Flow

```
                    🚨 PHASE 0: CRITICAL REMEDIATION (P0 BLOCKING) 🚨
                    
                         ┌─────────────┐
                         │   RFR-001   │◄── START HERE (BLOCKING ALL OTHER WORK)
                         │Registry Infra│
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   RFR-002   │
                         │  Versioning │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   RFR-003   │◄── COMPLETE BEFORE ANY FEATURES
                         │  Coverage   │
                         └──────┬──────┘
                                │
    ════════════════════════════▼════════════════════════════
                    📋 PHASE 1: OPENSHIFT MCP DELIVERY
                    
                         ┌──────────┐
                         │  F-001   │◄── ONLY AFTER RFR COMPLETE
                         │ ACTIVE   │    (Core Platform)
                         └────┬─────┘
                              │
                   ┌──────────┼──────────┐
                   │          │          │
              ┌────▼────┐ ┌───▼───┐ ┌────▼────┐
              │  F-003  │ │ F-006 │ │  F-008  │◄── CAN RUN PARALLEL
              │P1-CRIT  │ │P2-HIGH│ │P2-MED   │    (Post RFR)
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
    ══════════════════════════▼══════════════════════════
                    📈 PHASE 2: DOP ENHANCEMENT
                    
                         ┌────▼────┐
                         │  F-007  │◄── OPTIONAL (Advanced)
                         │P3-MED   │
                         └─────────┘
                         
    ┌─────────────────────────────────────────┐
    │  F-004 & F-005 can run parallel with   │
    │  multiple features after RFR + F-001   │
    └─────────────────────────────────────────┘
```

---

## 🚦 Updated Sprint Planning Rules

### **Rule 0: RFR BLOCKS EVERYTHING (NEW - CRITICAL)**
```yaml
RFR_NOT_COMPLETE:
  blocked_features: [ALL_FEATURES]
  development_status: FROZEN
  priority_override: P0_BLOCKING
  
BEFORE_ANY_FEATURE_WORK:
  must_complete: [RFR-001, RFR-002, RFR-003]
  architecture_debt: RESOLVED
  framework_viability: ESTABLISHED
```

### **Rule 1: Dependencies Block Everything (Updated)**
```yaml
RFR_COMPLETE_AND_F001_NOT_STABLE:
  blocked_features: [F-003, F-006, F-008, F-004]
  
F-006_NOT_COMPLETE:
  blocked_features: [F-009, F-007]
  
F-009_NOT_COMPLETE:
  reduced_value: [F-002]  # F-002 works but gets less value
```

### **Rule 2: Parallel Development Opportunities (Post-RFR)**
```yaml
when_rfr_complete_and_f001_stable:
  parallel_options:
    - [F-003, F-006]     # Production + Input Processing
    - [F-008, F-005]     # Tool Architecture + Tool Maturity
    - [F-004]            # Template Quality (foundation for others)

when_rfr_complete_and_f006_complete:
  parallel_options:
    - [F-009, F-008]     # RCA + Tool Architecture
    - [F-007, F-005]     # NFM + Tool Maturity (if needed)
```

### **Rule 3: Value Multipliers (Post-RFR)**
```yaml
# These features multiply the value of others when implemented first:
RFR-Complete: enables_everything  # CRITICAL FOUNDATION
F-001: enables_all_features
F-006: multiplies_value_of: [F-009, F-007, F-002]
F-009: multiplies_value_of: [F-002]
F-008: multiplies_value_of: [F-005, F-002]
```

---

## 🚨 RFR Critical Path Planning

### **Phase 0: RFR Remediation (5-8 sprints)**
```yaml
Sprint_Sequence:
  Sprint_1-2: RFR-001 (Registry Infrastructure)
    - Minimal viable registry (register/evaluate/list)
    - Convert 4+ templates to consistent patterns
    - Template conversion dashboard
    
  Sprint_3: RFR-002 (Versioning & Evolution)
    - CHANGELOG.md with change tracking  
    - RDR (Rubric Design Record) templates
    - Version compatibility framework
    
  Sprint_4-5: RFR-003 (Coverage Expansion)
    - Core rubrics extended to ≥80% tools
    - Missing slo-impact.v1 rubric implementation
    - Coverage metrics dashboard

Success_Criteria:
  - 100% consistent rubric evaluation patterns
  - ≥80% tool coverage with systematic rubrics
  - Framework ready for commercial-grade platform
```

### **RFR Sprint Planning Checklist**
- [ ] **P0 Priority Verification**: RFR work takes precedence over ALL other development
- [ ] **Architecture Debt Focus**: Address fragmented rubric integration systematically  
- [ ] **Framework Viability**: Each RFR sprint advances commercial-grade platform readiness
- [ ] **Investment ROI**: RFR investment prevents 20+ sprints future technical debt
- [ ] **Phase Gate**: RFR completion gates ALL Phase 1 feature development

---

## 📋 Updated Sprint Planning Checklist

### **Before Starting ANY Development Work**
- [ ] **RFR STATUS CHECK**: Verify RFR-001/002/003 completion status
- [ ] **Development freeze respect**: Confirm no feature work until RFR complete
- [ ] **Phase alignment**: Understand which strategic phase work belongs to
- [ ] **Dependency validation**: Check prerequisite RFR domains complete
- [ ] **Architecture debt impact**: Assess how work affects framework viability

### **Phase 0: RFR Sprint Planning** 
- [ ] Focus exclusively on RFR remediation domains
- [ ] No feature development work permitted  
- [ ] Architecture debt reduction measurable
- [ ] Framework commercial-readiness advancement
- [ ] Clear RFR completion gates defined

### **Phase 1: Feature Sprint Planning (Post-RFR)**
- [ ] RFR-001/002/003 completion verified
- [ ] Check feature dependency status in updated diagram
- [ ] Verify prerequisite features are stable (not just complete)
- [ ] Consider parallel development opportunities  
- [ ] Validate team skills for feature dependencies

### **Sprint Success Criteria (Updated)**
- [ ] **Phase 0**: RFR remediation advancement toward framework viability
- [ ] **Phase 1+**: Feature dependencies met without compromising RFR foundation
- [ ] **Integration**: Parallel features don't conflict with RFR architecture  
- [ ] **Debt Prevention**: No new architectural debt introduced
- [ ] **Strategic Alignment**: Sprint advances unified roadmap phases

---

## ⚠️ Updated Common Sprint Planning Mistakes

### **❌ What NOT to Do (CRITICAL UPDATES)**
```yaml
# DON'T start ANY features before RFR completion
CRITICAL_ERROR: [F-001] while RFR incomplete  # BLOCKS FRAMEWORK VIABILITY

# DON'T ignore RFR P0 blocking priority
ARCHITECTURE_DEBT: [Any feature work] while RFR pending  # EXPONENTIAL COMPLEXITY

# DON'T skip phase alignment  
STRATEGIC_DRIFT: [F-007] without Phase 2 context  # Wrong phase timing

# DON'T select features by number sequence (still applies)
BAD_SPRINT: [F-001, F-002, F-003]  # F-002 depends on F-009!
```

### **✅ What TO Do (UPDATED)**
```yaml
# DO complete RFR first - CRITICAL FOUNDATION
PHASE_0_FIRST: [RFR-001] → [RFR-002] → [RFR-003] → [Feature work allowed]

# DO follow strategic phases
STRATEGIC_ALIGNMENT:
  Phase_0: [RFR remediation] 
  Phase_1: [F-001, F-003, F-004, F-002] # OpenShift MCP delivery
  Phase_2: [F-006, F-008, F-009] # DOP enhancement

# DO leverage parallel development (POST-RFR)
EFFICIENT_SPRINT_POST_RFR: 
  week_1: [F-001_completion]
  week_2: [F-003_start, F-006_start]  # Parallel
  week_3: [F-008_start, F-005_start]  # Parallel
```

---

## 🎯 Updated Success Patterns

### **Strategic Phase Implementation Sequences**
1. **Phase 0 Critical Path**: RFR-001 → RFR-002 → RFR-003 (MUST COMPLETE FIRST)
2. **Phase 1 Linear**: F-001 → F-003 → F-006 → F-009 → F-002  
3. **Phase 1 Parallel Optimized**: F-001 → [F-003 + F-006] → [F-009 + F-008] → F-002
4. **Phase 2 Value-First**: F-006 → F-009 → [F-002 + F-008] (DOP enhancement)

### **Resource Allocation Patterns (Updated)**
- **Phase 0**: ALL teams focus on RFR remediation - no parallel feature work
- **Phase 1 Single Team**: RFR complete → linear critical path  
- **Phase 1 Two Teams**: RFR complete → core team critical path, second team parallel features
- **Phase 2 Three+ Teams**: Advanced features + cross-domain framework work

---

## 📊 Strategic Roadmap Integration

### **Phase Alignment Reference**
```yaml
Phase_0_RFR_Remediation: [RFR-001, RFR-002, RFR-003]
  timeline: 5-8 sprints
  priority: P0_BLOCKING_ALL_OTHER_WORK
  outcome: Framework viability established

Phase_1_OpenShift_MCP: [F-001, F-002, F-003, F-004]  
  depends_on: [Phase_0_Complete]
  timeline: 3-4 months
  outcome: Working OpenShift diagnostic platform

Phase_2_DOP_Enhancement: [F-006, F-007, F-008, F-009]
  depends_on: [Phase_1_Success] 
  timeline: 6-8 months
  outcome: Regulatory-grade compliance platform

Phase_3_Framework_Extraction: [Multi-domain evolution]
  depends_on: [Phase_2_Complete]
  timeline: 12+ months  
  outcome: Commercial multi-domain framework
```

### **Daily Sprint Planning Integration**
- **Check strategic phase** before selecting any work
- **Validate phase dependencies** are met
- **Align sprint goals** with phase objectives
- **Cross-reference unified roadmap** for context
- **Prevent phase drift** through systematic validation

---

## 🔗 Strategic Planning Resources

### **Cross-Reference Documentation**
- **Master Planning**: [Unified Strategic Roadmap](../../docs/implementation/UNIFIED_STRATEGIC_ROADMAP.md)
- **RFR Details**: [ADR-023 Rubric Framework Remediation](../../docs/architecture/ADR-023-rubric-framework-remediation.md)
- **Feature Backlog**: [Feature Backlog with Strategic Integration](feature-backlog.md)
- **Quality Domains**: [Backlog Overview with Strategic Context](../backlog/backlog-overview.md)

### **Decision Support**
- **Phase 0 Decision**: Always choose RFR work over feature work
- **Phase 1 Decision**: Check feature dependencies after RFR complete
- **Phase 2 Decision**: Advanced features require Phase 1 operational success
- **Resource Allocation**: Phase determines team focus and parallel work options

---

**Quick Reference Owner**: Sprint Planning Team + Strategic Architecture  
**Update Trigger**: When RFR status or strategic phases change  
**Review Frequency**: Before EVERY sprint planning session (RFR critical)  
**Validation**: Check against unified strategic roadmap and RFR domain status  
**Critical Success Factor**: NO feature development until RFR remediation complete

**Last Updated**: 2025-09-04 - RFR P0 blocking priority and strategic roadmap integration  
**Next Review**: After each RFR domain completion milestone