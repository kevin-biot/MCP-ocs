# Architecture Review Session Template

**Date:** [Current Date]  
**Session Type:** Architecture Review  
**Review Scope:** [component/system/decision]

## 🏛️ **Pre-Implementation Review**

### 1. Proposed Changes
**What we want to build:**
- [proposed_change_1]: [description]
- [proposed_change_2]: [description]
- [proposed_change_3]: [description]

**Motivation:**
- [why_these_changes_are_needed]
- [business_technical_drivers]

### 2. ADR Implications
**Affected ADRs:**
- [ ] ADR-001: OpenShift vs Kubernetes API Client Decision
- [ ] ADR-002: GitOps Integration Strategy
- [ ] ADR-003: Memory Storage and Retrieval Patterns
- [ ] ADR-004: Tool Namespace Management
- [ ] ADR-005: Workflow State Machine Design

**Impact Analysis:**
- [adr_id]: [how_proposal_affects_this_decision]
- [adr_id]: [consistency_concerns_or_validation]

### 3. Design Alternatives Considered
**Option A:** [alternative_1]
- **Pros:** [benefits]
- **Cons:** [drawbacks]
- **Effort:** [implementation_complexity]

**Option B:** [alternative_2]  
- **Pros:** [benefits]
- **Cons:** [drawbacks]
- **Effort:** [implementation_complexity]

**Option C:** [alternative_3]
- **Pros:** [benefits]
- **Cons:** [drawbacks]
- **Effort:** [implementation_complexity]

### 4. Recommended Approach
**Selected Option:** [chosen_alternative]

**Decision Rationale:**
- [reason_1]: [explanation]
- [reason_2]: [explanation]
- [reason_3]: [explanation]

## 🔍 **Architecture Validation**

### System Impact Assessment
- [ ] **Consistency with existing ADRs**
  - Validates against: [adr_list]
  - Potential conflicts: [none_or_describe]

- [ ] **Impact on other components assessed**
  - Affected components: [component_list]
  - Integration points: [interface_changes]
  - Backward compatibility: [yes_no_details]

- [ ] **Performance implications considered**
  - Performance impact: [positive_negative_neutral]
  - Scalability concerns: [none_or_describe]
  - Resource requirements: [cpu_memory_storage]

- [ ] **Security considerations reviewed**
  - Security impact: [none_positive_negative]
  - Authentication/authorization changes: [yes_no_details]
  - Data protection implications: [none_or_describe]

- [ ] **Deployment implications understood**
  - Deployment complexity: [simple_moderate_complex]
  - Migration requirements: [none_or_describe]
  - Rollback strategy: [approach_description]

### Quality Attributes Review
**Maintainability:**
- Code complexity impact: [simple_moderate_complex]
- Documentation requirements: [list_required_docs]
- Long-term support implications: [considerations]

**Reliability:**
- Failure modes introduced: [none_or_list]
- Error handling strategy: [approach]
- Testing requirements: [test_strategy]

**Extensibility:**
- Future enhancement support: [good_limited_complex]
- Plugin/integration points: [available_extensions]
- API stability: [stable_evolving_breaking]

## 📋 **Decision Documentation**

### ADR Requirements
- [ ] **Create new ADR required:** [yes_no]
  - **ADR Title:** [proposed_title]
  - **Decision Scope:** [what_decision_covers]
  - **Stakeholder Impact:** [who_is_affected]

- [ ] **Update existing ADRs:** [adr_list_to_update]
  - **ADR-xxx:** [what_changes_needed]
  - **ADR-xxx:** [what_changes_needed]

### Trade-offs Documentation
**Benefits Gained:**
- [benefit_1]: [impact_description]
- [benefit_2]: [impact_description]

**Costs Accepted:**
- [cost_1]: [impact_description]  
- [cost_2]: [impact_description]

**Risks Accepted:**
- [risk_1]: [mitigation_strategy]
- [risk_2]: [mitigation_strategy]

## 🎯 **Implementation Planning**

### Development Phases
**Phase 1:** [phase_description]
- Duration: [time_estimate]
- Dependencies: [what_must_be_complete_first]
- Deliverables: [specific_outputs]

**Phase 2:** [phase_description]
- Duration: [time_estimate]
- Dependencies: [what_must_be_complete_first]
- Deliverables: [specific_outputs]

**Phase 3:** [phase_description]
- Duration: [time_estimate]
- Dependencies: [what_must_be_complete_first]
- Deliverables: [specific_outputs]

### Success Criteria
- [ ] [measurable_outcome_1]
- [ ] [measurable_outcome_2]
- [ ] [measurable_outcome_3]

### Monitoring and Review
**Review Points:**
- [milestone_1]: [review_criteria]
- [milestone_2]: [review_criteria]

**Success Metrics:**
- [metric_1]: [target_value]
- [metric_2]: [target_value]

## 📝 **Review Session Notes**

### Participants
- [name_1]: [role]
- [name_2]: [role]

### Key Discussions
- [topic_1]: [summary_of_discussion]
- [topic_2]: [summary_of_discussion]

### Decisions Made
- [decision_1]: [rationale]
- [decision_2]: [rationale]

### Action Items
- [ ] [action_1]: [owner] by [date]
- [ ] [action_2]: [owner] by [date]
- [ ] [action_3]: [owner] by [date]

## 📤 **Session Handoff**

### Architecture Decisions Finalized:
- [decision_1]: [brief_summary]
- [decision_2]: [brief_summary]

### Documentation Tasks:
- [ ] Create ADR-xxx: [title]
- [ ] Update ADR-xxx: [changes_needed]
- [ ] Update architecture diagrams
- [ ] Update API documentation

### Next Steps:
- **Immediate Actions:** [what_happens_next]
- **Development Ready:** [yes_no_what_is_needed]
- **Follow-up Reviews:** [scheduled_review_points]

### Memory Storage:
```typescript
{
  sessionType: 'architecture',
  projectPhase: 'design',
  component: '[component_name]',
  architecturalDecisions: ['[decision_1]', '[decision_2]'],
  implementationNotes: ['[approach_1]', '[approach_2]'],
  nextActions: ['[create_adr]', '[begin_implementation]'],
  adrReferences: ['[affected_adr_1]', '[affected_adr_2]'],
  tradeOffs: ['[tradeoff_1]', '[tradeoff_2]']
}
```

---

**Template Usage:** Use this template when reviewing architectural decisions before implementation, when evaluating design alternatives, or when significant system changes are proposed.
