# Weekly Scrum Master Review Process - Security Quality Analysis

**Purpose**: Process human weekly security analysis findings into structured backlog updates and priority adjustments for daily sprint resumption.

**Timing**: After human evening review session, before daily sprint resumption  
**Role**: Claude as Scrum Master analyzing quality and priority patterns

---

## Human Weekly Analysis Session Structure

**Your Evening Review Focus:**
- Review completion logs from `sprint-management/completion-logs/` 
- Assess git commits against security implementation quality
- Evaluate ADR-020 compliance (P0 mandatory vs P1 advisory adherence)
- Identify new backlog items or priority shifts based on implementation discoveries
- Document security technical debt patterns or emerging risks
- Note development velocity and security validation effectiveness

**Output for Handoff:**
- Security quality assessment summary
- New backlog items discovered during implementation
- Priority adjustment recommendations  
- Process improvement observations
- Technical debt or pattern concerns

---

## Claude Scrum Master Processing Framework

### 1. Weekly Findings Analysis

**Security Implementation Quality Review:**
- Parse completion logs for security validation completeness
- Assess P0 task mandatory checklist adherence rates
- Evaluate P1 advisory guideline adoption patterns
- Identify consistent security implementation gaps

**Velocity and Quality Correlation:**
- Analyze task completion time vs security quality
- Identify security bottlenecks or efficient patterns
- Assess risk classification accuracy (over/under-classification)
- Track security technical debt accumulation/reduction

**Pattern Recognition:**
- Identify recurring security implementation challenges
- Recognize successful security patterns for template integration
- Detect emerging security risks not covered by existing guidelines
- Assess ADR-020 effectiveness and potential improvements

### 2. Backlog Priority Updates

**Critical Priority Adjustments:**
- Promote tasks if weekly review reveals higher security risk
- Demote tasks if implementation shows lower actual risk
- Resequence based on discovered task dependencies
- Add new tasks discovered through implementation learnings

**Domain Priority Rebalancing:**
- Shift domain focus based on implementation difficulty patterns
- Adjust P0/P1/P2 balance based on actual risk discoveries  
- Prioritize domains showing implementation momentum
- Address domains with consistent implementation challenges

**Cross-Domain Dependencies:**
- Identify task dependencies discovered during implementation
- Sequence tasks to minimize rework or conflict
- Group related security improvements for efficiency
- Plan validation dependencies between domains

### 3. Process Improvement Recommendations

**ADR-020 Guideline Updates:**
- Recommend mandatory vs advisory classification adjustments
- Suggest new security patterns based on implementation experience
- Identify guideline gaps or unclear requirements
- Propose template updates for common security patterns

**Standup Process v3 Adjustments:**
- Refine security risk assessment accuracy
- Adjust task extraction patterns based on velocity observations
- Optimize security validation integration
- Improve role-specific prompt effectiveness

**Development Tool Integration:**
- Recommend Codex prompt improvements based on implementation quality
- Suggest automation opportunities for recurring security validation
- Identify template needs for common security patterns
- Propose quality gate adjustments for effectiveness

### 4. Next Sprint Planning Preparation

**Daily Task Selection Strategy:**
- Generate prioritized task recommendations for next sprint cycle
- Prepare security-integrated Codex prompts with lessons learned
- Adjust enforcement levels (mandatory/advisory) based on experience
- Plan validation approaches for updated priority tasks

**Resource Allocation:**
- Balance P0 critical tasks vs P1/P2 for sustainable progress
- Account for security validation overhead in task estimation
- Plan review cycles for complex security implementations
- Prepare contingency tasks for blocked or complex implementations

---

## Scrum Master Analysis Templates

### Weekly Quality Assessment Template:
```markdown
## Weekly Security Quality Assessment - [Date Range]

**Completed Tasks**: [P0: X, P1: Y, P2: Z]

**Security Compliance Rates**:
- P0 Mandatory Checklist: X% completion rate
- P1 Advisory Guidelines: Y% adherence rate  
- P2 Best Practices: Z% adoption rate

**Quality Patterns Observed**:
- [Successful security implementations]
- [Consistent challenge areas]
- [Emerging risk patterns]

**Priority Adjustments Recommended**:
- [Tasks requiring risk reclassification]
- [New dependencies discovered]
- [Sequence changes for efficiency]

**Process Improvements**:
- [ADR-020 guideline adjustments needed]
- [Standup process refinements]
- [Template or automation opportunities]
```

### Sprint Preparation Template:
```markdown  
## Next Sprint Preparation - Security-Integrated Planning

**Recommended Daily Task Selection**:
1. **Primary Focus**: [Domain] - [Specific tasks with security context]
2. **Secondary Options**: [Alternative tasks if primary blocked]
3. **Validation Requirements**: [Security checks needed for each task]

**Security Context for Codex Prompts**:
- **Mandatory Requirements**: [P0 checklist items for selected tasks]
- **Advisory Guidance**: [P1 patterns and warnings]  
- **Lessons Learned Integration**: [Specific patterns from weekly review]

**Risk Adjustments**:
- [Tasks moved to different risk classifications]
- [New security validation requirements]
- [Dependencies requiring sequence changes]
```

---

## Integration Points

### Pre-Sprint Standup Enhancement:
- Weekly analysis findings inform standup v3 security risk assessment
- Priority adjustments update daily task selection algorithms
- Process improvements modify Codex prompt generation
- Quality patterns influence enforcement level decisions

### Continuous Improvement Feedback:
- Weekly findings contribute to ADR-020 evolution
- Implementation patterns inform security template updates
- Velocity observations optimize task estimation and sequencing
- Quality correlation data improves risk classification accuracy

### Documentation and Knowledge Management:
- Weekly analysis summaries stored in `completion-logs/weekly-reviews/`
- Process improvement recommendations tracked in `sprint-management/process-evolution/`
- Security pattern discoveries integrated into development templates
- Quality metrics maintained for long-term trend analysis

---

## Success Metrics for Scrum Master Role

**Analysis Quality**:
- Accuracy of priority adjustment recommendations
- Effectiveness of process improvement suggestions
- Quality of pattern recognition and trend identification
- Usefulness of sprint preparation guidance

**Process Integration**:
- Smooth transition from weekly review to daily sprint resumption
- Effective incorporation of lessons learned into ongoing development
- Successful backlog evolution based on implementation discoveries
- Maintained development velocity with improved security quality

**Continuous Improvement**:
- Regular refinement of analysis templates and frameworks
- Evolution of scrum master capabilities based on feedback
- Integration of new security patterns into process framework
- Adaptation to changing development needs and priorities

---

**Storage Location**: `/sprint-management/WEEKLY-SCRUM-MASTER-PROCESS.md`  
**Integration**: Standup Process v3, ADR-020, Backlog Management System  
**Review Cycle**: Process effectiveness evaluated monthly, templates updated quarterly
