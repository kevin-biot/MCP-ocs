# DAILY STANDUP PRE-FLIGHT CHECKLIST - Process v3.3
## PROBLEM-RESOLUTION AVIATION MODEL WITH QUALITY INTELLIGENCE

**MANDATORY EXECUTION ORDER - EVIDENCE-BASED PROBLEM ELIMINATION**

---

## PRE-FLIGHT INSPECTION (10-15 minutes) 
### TIMING PROTOCOL START: [CAPTURE TIMESTAMP]

### PROBLEM CONTEXT & QUALITY INTELLIGENCE RESTORATION
- [ ] **Git State Verification**: `git branch` and `git status`
- [ ] **TIMESTAMP CAPTURE**: PRE-FLIGHT START - [ISO_TIMESTAMP]
- [ ] **Quality Intelligence Loading**: `./scripts/get-sprint-context.sh --domain={target_domain} --include-weekly-findings`
- [ ] **Problem Definition**: What specific quality debt category are we eliminating?
- [ ] **Weekly Findings Review**: Recent Review-Prompt-Lib findings in target domain
- [ ] **Historical Pattern Analysis**: Previous problem resolution outcomes in this domain
- [ ] **TIMESTAMP CAPTURE**: CONTEXT COMPLETE - [DURATION_MINUTES]

### PROBLEM SCOPE DEFINITION (NEW - V3.3 Problem Resolution)
- [ ] **Problem Category**: Specific quality debt type (async-correctness, interface-hygiene, etc.)
- [ ] **Evidence Requirements**: How will we prove systematic elimination?
- [ ] **Success Criteria**: Zero {problem_category} issues + prevention measures
- [ ] **Baseline Assessment**: Current state before problem resolution begins
- [ ] **Cross-Domain Impact**: Related domains that may be affected

### SYSTEM READINESS  
- [ ] **Process v3.3 Framework Files**:
  - [ ] `/sprint-management/PROCESS-V3.3-PROBLEM-RESOLUTION.md` accessible
  - [ ] Template files in `/sprint-management/templates/` V3.3 versions available
  - [ ] Quality domain context: `/sprint-management/review-prompt-lib/domains/{domain}/` current
  - [ ] **Review-Prompt-Lib Integration**: Domain specifications and historical findings loaded

### ARCHITECTURE & QUALITY BASELINE CHECK
- [ ] **ADR Alignment**: Which architectural decisions does this problem resolution advance?
- [ ] **Quality Baseline**: Current quality score/metrics in target domain
- [ ] **Integration Points**: Dependencies with other quality domains
- [ ] **Risk Assessment**: Potential complications or scope expansion risks

---

## FLIGHT PLAN: HUMAN DECISION PROTOCOL (5-10 minutes)

### HUMAN + CLAUDE PROBLEM SELECTION
- [ ] **Available Problems**: Review domains where problems have been identified
- [ ] **Priority Assessment**: Impact vs effort analysis for problem categories
- [ ] **Resource Planning**: Time allocation, complexity tier assessment
- [ ] **Evidence Planning**: How will we measure and prove systematic elimination?

### COMPLEXITY & SCOPE BOUNDARIES  
- [ ] **TIER Assessment**: 
  - **TIER 1 (30-60min)**: Single, well-defined problem category
  - **TIER 2 (2-4hr)**: Problem category with cross-cutting concerns  
  - **TIER 3 (4hr+)**: Domain-wide quality transformation
- [ ] **Scope Boundaries**: Clear definition of what's in/out of scope
- [ ] **Success Gates**: Specific evidence required for problem resolution completion
- [ ] **Emergency Procedures**: Abort conditions and scope reduction plans

### SESSION HANDOFF PREPARATION
- [ ] **Role Context Generation**: Create V3.3 role contexts with problem focus
- [ ] **Quality Intelligence Briefing**: Prepare domain-specific context for Codex
- [ ] **Evidence Framework**: Set up measurement and validation approach
- [ ] **Git Safety Protocol**: Commit current state before problem resolution work

---

## IN-FLIGHT: ENHANCED ROLE EXECUTION (CODEX)

### DEVELOPER ROLE - PROBLEM SOLVER
```
PROBLEM FOCUS: Eliminate {specific_problem_category} systematically
- NOT: "Complete async-correctness task"  
- YES: "Eliminate async race conditions and memory leaks in server code"

QUALITY INTELLIGENCE CONTEXT:
{domain_specific_weekly_findings}
{historical_problem_patterns}
{baseline_quality_metrics}

EVIDENCE REQUIREMENTS:
- Document specific problems found and eliminated
- Capture before/after evidence with metrics
- Prove systematic resolution across codebase
- Implement preventive measures

GUARDRAILS: Enhanced role-specific guardrails with quality focus
ADR COMPLIANCE: {active_adr_requirements}
```

### TESTER ROLE - EVIDENCE VALIDATOR  
```
VALIDATION FOCUS: Prove problems are actually resolved systematically
- Evidence completeness scoring ≥ 0.9
- No regression in resolved problem areas
- Systematic verification across entire codebase
- Validation of preventive measures

QUALITY INTEGRATION: 
- Run domain-specific checks from Review-Prompt-Lib
- Validate against quality baseline improvements
- Cross-domain impact assessment
- Evidence quality and completeness verification
```

### REVIEWER ROLE - RESOLUTION VERIFIER
```
RESOLUTION VERIFICATION: Confirm problem category elimination with quality gates
- Problems genuinely eliminated (not hidden or moved)
- Preventive measures documented and validated
- Quality baseline demonstrably improved
- Integration with quality intelligence updated

QUALITY INTELLIGENCE FEED:
- Update domain findings for weekly process
- Document resolution patterns for future sprints
- Capture lessons learned for framework improvement
```

---

## POST-FLIGHT: PROBLEM RESOLUTION VALIDATION (15-20 minutes)

### EVIDENCE-BASED CLOSURE PROTOCOL
- [ ] **Problem Elimination Evidence**: Before/after artifacts proving systematic elimination
- [ ] **Evidence Completeness Scoring**: Achieve ≥ 0.9 evidence completeness score
- [ ] **Regression Prevention**: Confirm no new problems introduced during resolution
- [ ] **Quality Baseline Update**: Document measurable improvement in domain quality
- [ ] **Cross-Domain Validation**: Verify no negative impact on related domains

### SYSTEMATIC CLOSURE INTEGRATION
- [ ] **Sprint Metrics Collection**: `./scripts/collect-sprint-metrics.sh --problem-category={category}`
- [ ] **Problem Resolution Registry**: Update problem resolution database
- [ ] **Quality Intelligence Update**: Feed results to weekly Review-Prompt-Lib process
- [ ] **Framework Evolution**: Document lessons learned for process improvement

### PERFORMANCE & CALIBRATION CAPTURE
- [ ] **Duration Analysis**: Problem resolution time vs complexity tier
- [ ] **Evidence Quality**: Validation of systematic elimination approach
- [ ] **Process Effectiveness**: V3.3 framework performance vs V3.2 baseline
- [ ] **Next Session Preparation**: Identify follow-up problems or new domain focus

---

## EMERGENCY PROCEDURES - V3.3 SPECIFIC

### SCOPE CREEP DETECTION
- **Signal**: Task completion focus replacing problem resolution focus
- **Action**: IMMEDIATE STOP, reassess problem definition, refocus on systematic elimination
- **Recovery**: Return to evidence-based problem resolution approach

### EVIDENCE INADEQUACY ALERT
- **Signal**: Cannot demonstrate clear problem elimination with metrics
- **Action**: Extend evidence collection phase, enhance validation approach
- **Escalation**: Request human guidance on evidence requirements

### QUALITY REGRESSION EMERGENCY
- **Signal**: New problems introduced while solving target problems
- **Action**: IMMEDIATE ROLLBACK, analyze root cause, adjust resolution approach
- **Prevention**: Enhanced testing and cross-domain impact assessment

### PROBLEM SCOPE EXPLOSION
- **Signal**: Problem category expanding beyond defined boundaries
- **Action**: Pause resolution, reassess scope, potentially split into multiple sessions
- **Containment**: Focus on core problem, defer related issues to future sprints

---

## COMPLEXITY TIER ADAPTATIONS - V3.3

### TIER 1 (1-2 SP, 30-60 min): Focused Problem Resolution
- **Problem Scope**: Single, well-defined quality debt category
- **Evidence Approach**: Quick before/after demonstration with metrics
- **Quality Integration**: Basic quality intelligence updates
- **Success Criteria**: Specific problem type eliminated with prevention

### TIER 2 (3-5 SP, 2-4 hr): Systematic Problem Elimination  
- **Problem Scope**: Problem category with cross-cutting concerns
- **Evidence Approach**: Comprehensive testing and systematic validation
- **Quality Integration**: Full quality intelligence workflow integration
- **Success Criteria**: Problem category eliminated with cross-domain validation

### TIER 3 (6+ SP, 4hr+): Domain-Wide Quality Transformation
- **Problem Scope**: Fundamental quality debt elimination across domain
- **Evidence Approach**: Statistical improvement demonstration with baselines
- **Quality Integration**: Multiple domain coordination and updating
- **Success Criteria**: Measurable quality transformation with framework evolution

---

## HUMAN OVERSIGHT PROTOCOL - V3.3

### HUMAN DECISION POINTS (Critical for Problem Resolution)
- **Problem Scope Definition**: What specific quality debt to eliminate
- **Priority Assessment**: Risk vs benefit analysis for complex changes
- **Evidence Standards**: What constitutes adequate proof of elimination
- **Resource Allocation**: Time and complexity boundaries for session

### HUMAN MONITORING DURING EXECUTION
- **Problem Resolution Focus**: Ensure systematic elimination vs quick fixes
- **Evidence Quality**: Validate proof of systematic problem resolution
- **Scope Adherence**: Prevent scope creep and maintain problem focus
- **Quality vs Velocity**: Guide trade-offs between thoroughness and speed

### HUMAN VALIDATION AT CLOSURE
- **Problem Elimination Confirmation**: Verify problems genuinely resolved
- **Evidence Adequacy**: Approve quality and completeness of proof
- **Preventive Measures**: Validate long-term problem prevention approach
- **Quality Baseline Improvement**: Confirm measurable quality advancement

---

## PROCESS MEMORY & EVOLUTION INTEGRATION

### SESSION CONTINUITY & QUALITY INTELLIGENCE
- **Problem Resolution Registry**: Each session updates systematic elimination database
- **Quality Intelligence Flow**: Results feed weekly Review-Prompt-Lib process
- **Historical Pattern Learning**: Problem resolution approaches inform future sessions
- **Cross-Domain Coordination**: Resolution in one domain informs related domains

### FRAMEWORK EVOLUTION & CALIBRATION
- **Process Effectiveness Measurement**: V3.3 problem resolution vs V3.2 task completion
- **Evidence Standards Evolution**: Continuous improvement of proof requirements
- **Quality Intelligence Enhancement**: Feedback loop for Review-Prompt-Lib improvement
- **Problem Resolution Patterns**: Document successful elimination approaches

---

**PROCESS V3.3 READY**: Evidence-based problem resolution with quality intelligence integration
**AVIATION MODEL**: Systematic safety and clarity for human-AI problem elimination collaboration  
**QUALITY FOCUS**: Genuine problem resolution vs completion theater
**FRAMEWORK EVOLUTION**: V3.2 task completion → V3.3 systematic quality engineering
