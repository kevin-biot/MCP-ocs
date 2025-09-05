# Process v3.3: Problem-Resolution Framework
# Human-AI Systematic Quality Engineering with Evidence-Based Closure

## FRAMEWORK EVOLUTION: V3.2 → V3.3

### **CORE PARADIGM SHIFT:**
- **V3.2**: Task-completion orientation ("Complete these 6 items")
- **V3.3**: Problem-resolution orientation ("Eliminate this category of quality debt")

### **CRITICAL DISCOVERY DRIVING V3.3:**
D-005 showed task marked "complete" (6/6 tasks) but **13 P0/P1 async issues remained**. Current v3.2 prompts optimize for **task completion theater** vs **actual problem resolution**.

---

## PROCESS V3.3 ARCHITECTURE

### **ENHANCED ROLE FRAMEWORK WITH QUALITY INTELLIGENCE:**

```
DEVELOPER (Problem Solver) → TESTER (Evidence Validator) → REVIEWER (Resolution Verifier)
     ↑                              ↑                            ↑
Quality Context              Systematic Validation         Evidence-Based Closure
```

### **INTEGRATION WITH REVIEW-PROMPT-LIB 1.0:**
- **Daily Process v3.3**: Problem-focused sprints with quality intelligence
- **Weekly Review Process 1.0**: Systematic domain sweeps for baseline maintenance
- **Seamless Integration**: Weekly findings inform daily problem-resolution context

---

## ROLE 1: DEVELOPER (PROBLEM SOLVER)

### **PARADIGM SHIFT:**
```
V3.2: "Complete async-correctness improvements task"
V3.3: "Systematically eliminate async-correctness quality debt"
```

### **ENHANCED DEVELOPER CHECKLIST:**

#### **Phase 1: Problem Context & Quality Intelligence** ⏱️ 10 minutes
- [ ] **Load sprint context with quality intelligence**
```bash
# Historical quality context
./scripts/get-sprint-context.sh --domain={target_domain} --include-weekly-findings

# Recent findings in target areas
./scripts/get-quality-context.sh --files="$(git diff --name-only main)"
```

- [ ] **Understand problem scope, not task scope**
```markdown
Problem Statement: "Eliminate {category} quality debt in {target_area}"
Success Criteria: "Zero {category} issues remaining + evidence of systematic coverage"
Quality Intelligence: "{findings_from_weekly_sweep}"
```

- [ ] **Determine quality verification approach**
```bash
# What domains will verify our work?
./scripts/determine-domains.sh --target-files="src/target/area/**"
Expected domains: async-correctness, trust-boundaries, etc.
```

#### **Phase 2: Systematic Problem Resolution** ⏱️ 60-90 minutes
- [ ] **Execute comprehensive problem elimination**
```markdown
Focus: Systematic resolution of {problem_category} across ALL affected areas
Approach: Pattern-based elimination, not individual task completion
Scope: Related files and similar patterns, not just explicitly listed files
```

- [ ] **Evidence collection during resolution**
```markdown
Document: 
- Patterns eliminated
- Files modified  
- Related issues found and fixed
- Verification approach planned
```

- [ ] **Self-verification using quality checks**
```bash
# Continuous verification during development
./scripts/sprint-quality-check.sh --modified-files --quick-feedback
```

#### **Phase 3: Comprehensive Documentation** ⏱️ 15 minutes
- [ ] **Problem resolution documentation**
```markdown
## Problem Resolution Summary

### Problem Eliminated:
- Category: {problem_category}
- Scope: {actual_scope_covered}
- Pattern: {systematic_approach_used}

### Evidence of Resolution:
- Files modified: {list}
- Patterns eliminated: {specific_patterns}
- Quality checks passed: {domain_results}

### Verification Plan:
- Target domains: {expected_domains}  
- Test coverage: {test_approach}
- Evidence requirements: {what_tester_should_verify}
```

### **DEVELOPER PROMPT TEMPLATE:**
```markdown
# DEVELOPER ROLE: Problem Resolution Sprint

## CONTEXT:
You are executing a problem-resolution sprint focusing on **{problem_category}** quality debt elimination.

**Quality Intelligence:**
{weekly_findings_context}
{historical_patterns}
{related_domain_findings}

## MISSION:
**Systematically eliminate {problem_category} quality debt** across the codebase, with evidence-based verification that the problem category is resolved.

## SUCCESS CRITERIA:
- [ ] Zero {problem_category} issues remaining in target scope
- [ ] Systematic pattern elimination (not just individual fixes)
- [ ] Evidence of comprehensive coverage
- [ ] Quality verification passes for relevant domains

## APPROACH:
1. **Pattern Recognition**: Identify all instances of {problem_category}
2. **Systematic Elimination**: Apply consistent resolution approach  
3. **Scope Expansion**: Fix related issues discovered during resolution
4. **Evidence Collection**: Document patterns eliminated and verification approach

## DELIVERABLES:
- [ ] Code changes with systematic problem elimination
- [ ] Evidence documentation of patterns resolved
- [ ] Self-verification using sprint quality checks
- [ ] Handoff package for TESTER role with verification plan

**Focus on problem resolution, not task completion. Prove the problem category is eliminated.**
```

---

## ROLE 2: TESTER (EVIDENCE VALIDATOR)

### **PARADIGM SHIFT:**
```
V3.2: "Test that requirements are met"
V3.3: "Validate that problem category is actually eliminated"
```

### **ENHANCED TESTER CHECKLIST:**

#### **Phase 1: Evidence-Based Validation Setup** ⏱️ 10 minutes
- [ ] **Review problem resolution documentation**
```markdown
Understand:
- What problem category was targeted
- What systematic approach was used
- What evidence was provided
- What verification is needed
```

- [ ] **Execute systematic quality verification**
```bash
# Run relevant domain checks to verify problem elimination
./scripts/sprint-quality-check.sh --modified-files --evidence-mode

# Verify claimed patterns are actually eliminated
./scripts/verify-pattern-elimination.sh --category={problem_category}
```

#### **Phase 2: Comprehensive Evidence Validation** ⏱️ 30-45 minutes
- [ ] **Validate systematic elimination claims**
```markdown
Evidence Review:
- [ ] Are claimed patterns actually eliminated?
- [ ] Are there remaining instances of the problem category?
- [ ] Was the scope comprehensive or narrow?
- [ ] Do quality domain checks confirm elimination?
```

- [ ] **Expand verification scope beyond developer changes**
```bash
# Check for similar patterns in related areas
./scripts/pattern-search.sh --category={problem_category} --full-codebase

# Verify no regression in adjacent areas
./scripts/regression-check.sh --adjacent-domains
```

- [ ] **Evidence-based test execution**
```markdown
Test Focus: Problem category elimination, not just feature functionality
Test Scope: Systematic coverage, not just happy path
Evidence Collection: Proof of elimination, not just "tests pass"
```

#### **Phase 3: Validation Documentation** ⏱️ 15 minutes
- [ ] **Evidence validation report**
```markdown
## Evidence Validation Report

### Problem Elimination Verified:
- [ ] Claimed patterns eliminated: {verified/not_verified}
- [ ] Comprehensive scope coverage: {verified/not_verified}  
- [ ] Quality domain checks passed: {domain_results}
- [ ] No remaining instances found: {verified/not_verified}

### Additional Evidence:
- Related issues discovered and addressed: {list}
- Verification scope expanded beyond claimed changes: {details}
- Regression testing in adjacent areas: {results}

### Validation Confidence: {High/Medium/Low}
### Recommendation: {PASS/CONDITIONAL/FAIL}
```

### **TESTER PROMPT TEMPLATE:**
```markdown
# TESTER ROLE: Evidence-Based Problem Validation

## CONTEXT:
Validate that **{problem_category}** quality debt has been systematically eliminated, with evidence-based verification.

**Developer Claims:**
{problem_resolution_documentation}
{systematic_approach_used}
{evidence_provided}

## MISSION:
**Validate through evidence that {problem_category} has been actually eliminated**, not just that individual tasks were completed.

## VALIDATION REQUIREMENTS:
- [ ] Systematic pattern elimination verified
- [ ] Comprehensive scope coverage confirmed
- [ ] Quality domain checks validate elimination
- [ ] No remaining instances of problem category
- [ ] No regression in adjacent areas

## APPROACH:
1. **Evidence Review**: Analyze provided documentation and claims
2. **Systematic Verification**: Use quality checks and pattern searches
3. **Scope Validation**: Verify comprehensive vs narrow coverage
4. **Evidence Collection**: Document validation confidence and gaps

## DELIVERABLES:
- [ ] Evidence validation report with confidence assessment
- [ ] Quality verification results from domain checks
- [ ] Scope expansion recommendations if needed
- [ ] PASS/CONDITIONAL/FAIL recommendation with rationale

**Focus on evidence of problem elimination, not just test passing.**
```

---

## ROLE 3: REVIEWER (RESOLUTION VERIFIER)

### **PARADIGM SHIFT:**
```
V3.2: "Review requirements completion and approve"
V3.3: "Verify evidence-based problem resolution and systematic quality"
```

### **ENHANCED REVIEWER CHECKLIST:**

#### **Phase 1: Integrated Quality Verification** ⏱️ 15 minutes
- [ ] **Quality intelligence integration**
```bash
# Determine quality domains relevant to changes
./scripts/determine-domains.sh --modified-files

# Execute targeted quality checks
./scripts/sprint-quality-check.sh --modified-files --comprehensive
```

- [ ] **Evidence-based closure verification**
```markdown
Review Evidence:
- [ ] Problem resolution documentation comprehensive
- [ ] Evidence validation confirms systematic elimination  
- [ ] Quality domain checks pass for relevant areas
- [ ] No remaining instances of target problem category
```

#### **Phase 2: Systematic Resolution Assessment** ⏱️ 20 minutes
- [ ] **Systematic vs superficial resolution evaluation**
```markdown
Assessment Criteria:
- [ ] Pattern-based elimination vs individual fixes
- [ ] Comprehensive scope vs narrow task completion
- [ ] Preventive measures vs reactive fixes
- [ ] Quality intelligence integration vs isolated work
```

- [ ] **Integration with quality baseline**
```bash
# Update finding registries with resolution evidence
./scripts/update-finding-registry.sh --resolved-patterns={patterns}

# Verify integration with weekly quality tracking
./scripts/verify-quality-baseline-impact.sh
```

#### **Phase 3: Resolution Verification & Closure** ⏱️ 10 minutes
- [ ] **Evidence-based closure decision**
```markdown
## Resolution Verification Decision

### Problem Elimination Verified:
- Category: {problem_category}
- Approach: {systematic/superficial}
- Evidence Quality: {high/medium/low}
- Quality Integration: {verified/needs_work}

### Closure Decision: {APPROVED/CONDITIONAL/REJECTED}

### Rationale:
{evidence_based_reasoning}

### Quality Intelligence Updated:
- [ ] Finding registries updated
- [ ] Weekly quality baseline impact documented
- [ ] Preventive measures documented for future
```

### **REVIEWER PROMPT TEMPLATE:**
```markdown
# REVIEWER ROLE: Evidence-Based Resolution Verification

## CONTEXT:
Verify evidence-based resolution of **{problem_category}** quality debt with systematic quality integration.

**Evidence Package:**
{problem_resolution_documentation}
{evidence_validation_report}
{quality_domain_check_results}

## MISSION:
**Verify through evidence that {problem_category} has been systematically resolved** with quality intelligence integration and preventive measures.

## VERIFICATION REQUIREMENTS:
- [ ] Evidence-based problem elimination confirmed
- [ ] Systematic vs superficial resolution assessment
- [ ] Quality domain integration verified
- [ ] Finding registries updated appropriately
- [ ] Preventive measures documented

## INTEGRATED QUALITY GATES:
- [ ] **Determine quality domains**: ./scripts/determine-domains.sh --modified-files
- [ ] **Run targeted quality checks**: ./scripts/sprint-quality-check.sh --modified-files
- [ ] **Review quality findings**: Human judgment on domain check results
- [ ] **Document quality decisions**: Evidence trail for resolution

## APPROVAL CRITERIA:
1. **Evidence Quality**: Comprehensive documentation of systematic elimination
2. **Verification Confidence**: High confidence in problem resolution
3. **Quality Integration**: Proper integration with quality intelligence systems
4. **Systematic Approach**: Pattern-based elimination, not just task completion

## DELIVERABLES:
- [ ] Evidence-based closure decision with rationale
- [ ] Quality intelligence system updates
- [ ] Preventive measures documentation
- [ ] Integration verification for weekly quality baseline

**Focus on evidence-based systematic resolution, not task completion approval.**
```

---

## PROCESS V3.3 INTEGRATION POINTS

### **Daily Process v3.3 ↔ Weekly Review Process 1.0:**
```
Weekly Quality Intelligence → Daily Problem Context
Daily Problem Resolution → Weekly Baseline Updates
Systematic Integration → Preventive Quality Engineering
```

### **Template Requirements:**

#### **Sprint Context Template:**
```bash
# scripts/get-sprint-context.sh
# Provides quality intelligence context for problem-resolution sprints
```

#### **Problem Resolution Template:**  
```markdown
# templates/problem-resolution-sprint.md
# Standard template for problem-focused sprint documentation
```

#### **Evidence Validation Template:**
```markdown  
# templates/evidence-validation-report.md
# Standard template for systematic evidence validation
```

#### **Quality Integration Template:**
```bash
# scripts/update-quality-baseline.sh  
# Updates quality intelligence systems with resolution evidence
```

### **Quality Gate Integration:**
- **Pre-Sprint**: Quality intelligence context loading
- **During Sprint**: Continuous quality verification  
- **Post-Sprint**: Evidence-based closure with quality integration

---

## SUCCESS METRICS

### **Process v3.3 Effectiveness:**
- **Problem Resolution Rate**: % of quality debt categories systematically eliminated
- **Evidence Quality**: Verification confidence levels
- **Integration Effectiveness**: Quality intelligence system updates and usage
- **Preventive Impact**: Reduction in similar issues over time

### **Vs V3.2 Comparison:**
- **V3.2**: Task completion rate, requirements met
- **V3.3**: Problem elimination evidence, systematic coverage, quality integration

---

**Status**: Complete Process v3.3 framework with problem-resolution orientation  
**Next**: Implement templates and scripts for quality intelligence integration  
**Evolution**: Systematic quality engineering with evidence-based closure
