# Problem-Resolution Sprint Template

## Sprint Identification
- **Sprint ID**: {sprint_id}
- **Date**: {date}
- **Target Problem Category**: {problem_category}
- **Domain Focus**: {primary_domains}

---

## Problem Context & Quality Intelligence

### **Problem Statement**
**Category**: {problem_category}  
**Scope**: {target_scope}  
**Success Criteria**: Zero {problem_category} issues remaining + evidence of systematic coverage

### **Quality Intelligence Context**
```markdown
Recent Weekly Findings:
{weekly_findings_summary}

Historical Patterns:
{historical_pattern_analysis}

Related Domain Issues:
{cross_domain_context}

Risk Assessment:
{potential_complications}
```

### **Systematic Approach**
```markdown
Pattern Recognition Strategy:
{how_to_identify_all_instances}

Elimination Methodology:
{systematic_resolution_approach}

Verification Plan:
{how_to_prove_elimination}
```

---

## DEVELOPER Phase Documentation

### **Problem Analysis**
```markdown
Patterns Identified:
- Pattern 1: {description} - Found in: {locations}
- Pattern 2: {description} - Found in: {locations}
- Pattern 3: {description} - Found in: {locations}

Root Cause Analysis:
{underlying_cause_of_problem_category}

Systematic Resolution Strategy:
{approach_to_eliminate_all_instances}
```

### **Resolution Execution**
```markdown
Files Modified:
- {file_1}: {changes_made}
- {file_2}: {changes_made}
- {file_3}: {changes_made}

Patterns Eliminated:
- {pattern_1}: {how_eliminated}
- {pattern_2}: {how_eliminated}
- {pattern_3}: {how_eliminated}

Additional Issues Found & Fixed:
- {related_issue_1}: {resolution}
- {related_issue_2}: {resolution}
```

### **Self-Verification Results**
```bash
Quality Check Results:
$ ./scripts/sprint-quality-check.sh --modified-files --quick-feedback

Domain Check Results:
- async-correctness: {findings_count} issues
- trust-boundaries: {findings_count} issues
- interface-hygiene: {findings_count} issues

Resolution Confidence: {high/medium/low}
```

### **Evidence Package for TESTER**
```markdown
What Was Eliminated:
{comprehensive_list_of_patterns_fixed}

How to Verify:
{specific_verification_steps}

Expected Quality Check Results:
{what_domain_checks_should_show}

Areas to Expand Verification:
{suggested_additional_scope}
```

---

## TESTER Phase Documentation

### **Evidence Validation Approach**
```markdown
Validation Strategy:
{how_to_verify_systematic_elimination}

Verification Scope:
- Developer claims: {scope_to_verify}
- Additional areas: {expanded_verification}
- Quality domains: {domains_to_check}

Evidence Requirements:
{what_constitutes_sufficient_proof}
```

### **Systematic Verification Results**
```bash
Pattern Search Results:
$ ./scripts/pattern-search.sh --category={problem_category} --full-codebase
Results: {remaining_instances_found}

Quality Domain Verification:
$ ./scripts/sprint-quality-check.sh --modified-files --evidence-mode
- async-correctness: {verification_result}
- trust-boundaries: {verification_result}
- {other_domains}: {verification_results}

Regression Check Results:
$ ./scripts/regression-check.sh --adjacent-domains
Results: {no_regressions_found}
```

### **Evidence Assessment**
```markdown
Developer Claims Verified:
- [ ] Claimed patterns eliminated: {verified/not_verified}
- [ ] Comprehensive scope coverage: {verified/not_verified}
- [ ] Quality domain checks passed: {verified/not_verified}
- [ ] No remaining instances: {verified/not_verified}

Additional Evidence Discovered:
{any_additional_findings_or_issues}

Verification Confidence: {high/medium/low}
Validation Decision: {pass/conditional/fail}

Rationale:
{evidence_based_reasoning}
```

---

## REVIEWER Phase Documentation

### **Quality Integration Verification**
```bash
Domain Determination:
$ ./scripts/determine-domains.sh --modified-files
Relevant domains: {domains_list}

Comprehensive Quality Check:
$ ./scripts/sprint-quality-check.sh --modified-files --comprehensive
Results summary: {domain_check_results}

Finding Registry Updates:
$ ./scripts/update-finding-registry.sh --resolved-patterns={patterns}
Updates: {registry_changes}
```

### **Systematic Resolution Assessment**
```markdown
Resolution Evaluation:
- [ ] Pattern-based elimination vs individual fixes: {assessment}
- [ ] Comprehensive scope vs narrow task completion: {assessment}
- [ ] Preventive measures vs reactive fixes: {assessment}
- [ ] Quality intelligence integration: {assessment}

Evidence Quality Assessment:
- Documentation completeness: {high/medium/low}
- Verification thoroughness: {high/medium/low}
- Systematic approach confidence: {high/medium/low}
- Quality integration effectiveness: {high/medium/low}
```

### **Evidence-Based Closure Decision**
```markdown
## Sprint Resolution Verification

### Problem Elimination Status:
- **Category**: {problem_category}
- **Approach**: {systematic/superficial}
- **Evidence Quality**: {high/medium/low}
- **Scope Coverage**: {comprehensive/partial/narrow}

### Quality Intelligence Integration:
- [ ] Finding registries updated appropriately
- [ ] Weekly quality baseline impact documented
- [ ] Cross-domain implications addressed
- [ ] Preventive measures documented

### Closure Decision: {APPROVED/CONDITIONAL/REJECTED}

### Rationale:
{evidence_based_reasoning_for_decision}

### Quality Intelligence Updates:
- Patterns resolved: {list}
- Baseline impact: {description}
- Preventive measures: {documented_approaches}
- Integration verification: {completed/pending}
```

### **Preventive Measures Documentation**
```markdown
Prevention Strategy:
{how_to_prevent_this_problem_category_in_future}

Quality Intelligence Enhancements:
{improvements_to_weekly_sweep_or_daily_process}

Process Improvements:
{lessons_learned_for_future_sprints}

Monitoring Requirements:
{what_to_watch_for_in_future_quality_sweeps}
```

---

## Sprint Completion Metrics

### **Quantitative Results**
- **Files Modified**: {count}
- **Patterns Eliminated**: {count}
- **Quality Checks Passed**: {domain_results}
- **Evidence Confidence**: {high/medium/low}
- **Resolution Scope**: {comprehensive/partial/narrow}

### **Qualitative Assessment**
- **Systematic vs Superficial**: {assessment}
- **Preventive vs Reactive**: {assessment}
- **Integration Effectiveness**: {assessment}
- **Process Improvement Impact**: {assessment}

### **Quality Intelligence Impact**
- **Weekly Baseline Changes**: {impact_description}
- **Finding Registry Updates**: {changes_made}
- **Cross-Domain Effects**: {implications}
- **Prevention Measures Added**: {new_safeguards}

---

## Next Sprint Context

### **Quality Debt Remaining**
```markdown
Related Categories to Address:
{other_problem_categories_discovered}

Scope for Future Sprints:
{areas_needing_attention}

Priority Recommendations:
{suggested_next_focus_areas}
```

### **Lessons Learned**
```markdown
Process Effectiveness:
{what_worked_well_in_v3.3_approach}

Improvement Opportunities:
{what_could_be_enhanced}

Quality Intelligence Gaps:
{where_weekly_sweep_could_be_improved}

Template Updates Needed:
{improvements_to_this_template}
```

---

**Template Version**: v3.3.1  
**Last Updated**: {date}  
**Usage**: Problem-resolution sprints with evidence-based closure  
**Integration**: Process v3.3 + Review-Prompt-Lib 1.0
