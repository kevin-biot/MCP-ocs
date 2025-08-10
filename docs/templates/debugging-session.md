# Debugging/Issue Resolution Session Template

**Date:** [Current Date]  
**Session Type:** Debugging/Issue Resolution  
**Issue Priority:** [Low/Medium/High/Critical]

## 🚨 **Problem Analysis**

### 1. Issue Description
**Problem Summary:** [concise description of what's broken/not working]

**Severity Impact:**
- **User Impact:** [how users are affected]
- **System Impact:** [which parts of system affected]
- **Business Impact:** [operational/business consequences]

### 2. Symptoms Observed
**Specific Behaviors:**
- [symptom_1]: [detailed_description]
- [symptom_2]: [detailed_description] 
- [symptom_3]: [detailed_description]

**Error Messages:**
```
[paste_actual_error_messages_here]
```

**System Logs:**
```
[relevant_log_entries_with_timestamps]
```

### 3. Affected Components
**Primary Components:**
- [component_1]: [how_affected]
- [component_2]: [how_affected]

**Secondary/Downstream Components:**
- [component_3]: [potential_impact]
- [component_4]: [potential_impact]

### 4. Reproduction Steps
**Consistent Reproduction:**
1. [step_1]
2. [step_2]
3. [step_3]
4. **Expected Result:** [what_should_happen]
5. **Actual Result:** [what_actually_happens]

**Environment Details:**
- **OS/Platform:** [operating_system_version]
- **Software Versions:** [relevant_software_versions]
- **Configuration:** [relevant_config_settings]

## 🔍 **Context Research**

### 1. Memory Search for Similar Issues
**Search Terms:** [technical_keywords_for_this_issue]

**MCP Memory Search Results:**
- **Previous Similar Issues:** [session_ids_or_descriptions]
- **Known Solutions:** [what_worked_before]
- **Patterns Identified:** [recurring_themes_or_causes]
- **Workarounds Applied:** [temporary_fixes_used]

### 2. ADR Review for Constraints
**Relevant ADRs:**
- [adr_id]: [architectural_constraint_that_might_apply]
- [adr_id]: [design_decision_affecting_debugging_approach]

**Architectural Context:**
- **Design Assumptions:** [relevant_assumptions_that_might_be_violated]
- **Known Limitations:** [documented_system_limitations]
- **Dependencies:** [external_dependencies_that_might_cause_issues]

### 3. Recent Changes Analysis
**Git History Review:**
```bash
git log --oneline --since="1 week ago" -- [affected_files]
```

**Recent Changes:**
- [commit_hash]: [change_description] - [potential_impact]
- [commit_hash]: [change_description] - [potential_impact]

**Configuration Changes:**
- [config_change_1]: [when_changed] - [potential_impact]
- [config_change_2]: [when_changed] - [potential_impact]

## 🔬 **Investigation Process**

### 1. Hypothesis Formation
**Primary Hypothesis:** [most_likely_root_cause]
- **Supporting Evidence:** [why_this_is_likely]
- **Test Approach:** [how_to_validate_this_hypothesis]

**Alternative Hypotheses:**
- **Hypothesis A:** [alternative_cause]
  - **Evidence:** [supporting_data]
  - **Test:** [validation_method]
- **Hypothesis B:** [alternative_cause]
  - **Evidence:** [supporting_data]
  - **Test:** [validation_method]

### 2. Diagnostic Commands/Tools
**Information Gathering:**
```bash
# System state commands
[command_1_to_check_system_state]
[command_2_to_gather_diagnostics]

# Application-specific diagnostics
[app_specific_command_1]
[app_specific_command_2]
```

**Results:**
```
[paste_command_outputs_here]
```

### 3. Testing Approach
**Test Plan:**
- [ ] [test_1]: [what_this_validates]
- [ ] [test_2]: [what_this_validates]
- [ ] [test_3]: [what_this_validates]

**Test Results:**
- [test_1]: [result] - [conclusion]
- [test_2]: [result] - [conclusion]
- [test_3]: [result] - [conclusion]

## 🎯 **Resolution Approach**

### 1. Root Cause Identified
**Confirmed Root Cause:** [actual_cause_determined]

**Evidence Supporting This Conclusion:**
- [evidence_1]: [how_this_proves_root_cause]
- [evidence_2]: [how_this_proves_root_cause]

### 2. Solution Strategy
**Immediate Fix:** [short_term_solution_to_resolve_issue]
- **Steps:** [detailed_fix_steps]
- **Risk Assessment:** [potential_risks_of_this_fix]
- **Rollback Plan:** [how_to_undo_if_fix_causes_problems]

**Long-term Solution:** [permanent_fix_or_improvement]
- **Implementation Plan:** [how_to_implement_permanent_fix]
- **Prevention Measures:** [how_to_prevent_recurrence]

### 3. Impact Assessment
**Fix Impact Analysis:**
- [ ] **Performance impact:** [none/positive/negative_with_details]
- [ ] **Security implications:** [none/improved/concerns_with_details]
- [ ] **Compatibility concerns:** [none/backward_compatible/breaking_changes]
- [ ] **Dependencies affected:** [list_affected_systems_or_components]

### 4. Testing Strategy
**Pre-deployment Testing:**
- [ ] [test_scenario_1]: [expected_outcome]
- [ ] [test_scenario_2]: [expected_outcome]
- [ ] [regression_test]: [ensure_no_new_issues]

**Monitoring Plan:**
- **Metrics to Watch:** [specific_metrics_to_monitor_post_fix]
- **Success Criteria:** [how_to_know_fix_is_working]
- **Failure Indicators:** [signs_that_fix_isnt_working]

## 📝 **Implementation Notes**

### 1. Fix Applied
**Changes Made:**
- [file_1]: [changes_description]
- [file_2]: [changes_description]
- [config_change]: [what_was_modified]

**Commands Executed:**
```bash
[command_1_applied]
[command_2_applied]
```

### 2. Validation Results
**Post-Fix Testing:**
- [test_1]: [result] ✅/❌
- [test_2]: [result] ✅/❌
- [reproduction_test]: [can_no_longer_reproduce_issue] ✅/❌

**System Behavior:**
- **Issue Resolved:** [yes/no/partially]
- **Side Effects:** [none_or_describe_any_unexpected_behavior]
- **Performance Impact:** [measured_performance_changes]

## 📚 **Knowledge Capture**

### 1. Solution Pattern Documentation
**Issue Pattern:** [general_pattern_this_issue_represents]
**Solution Pattern:** [reusable_approach_for_similar_issues]
**Prevention Pattern:** [how_to_avoid_this_type_of_issue]

### 2. Lessons Learned
**What Worked Well:**
- [approach_1]: [why_this_was_effective]
- [approach_2]: [why_this_was_effective]

**What Could Be Improved:**
- [improvement_1]: [how_to_do_this_better_next_time]
- [improvement_2]: [how_to_do_this_better_next_time]

**Process Improvements:**
- [process_change_1]: [to_prevent_or_faster_resolution]
- [process_change_2]: [to_prevent_or_faster_resolution]

## 📤 **Session Handoff**

### 1. Resolution Summary
**Issue Status:** [resolved/partially_resolved/escalated]
**Final Root Cause:** [confirmed_cause]
**Solution Applied:** [brief_summary_of_fix]

### 2. Follow-up Actions Required
- [ ] [action_1]: [owner] by [date]
- [ ] [action_2]: [owner] by [date]
- [ ] **Monitor system for:** [specific_things_to_watch]
- [ ] **Document in KB:** [knowledge_base_updates_needed]

### 3. Prevention Measures
**Immediate Prevention:**
- [preventive_measure_1]: [implementation_plan]
- [preventive_measure_2]: [implementation_plan]

**Long-term Prevention:**
- [systematic_improvement_1]: [how_to_implement]
- [systematic_improvement_2]: [how_to_implement]

### 4. Memory Storage
```typescript
{
  sessionType: 'debugging',
  projectPhase: 'production_support',
  component: '[affected_component]',
  issuePattern: '[issue_type_or_category]',
  rootCause: '[confirmed_root_cause]',
  solutionApplied: '[fix_description]',
  preventionMeasures: ['[measure_1]', '[measure_2]'],
  lessonsLearned: ['[lesson_1]', '[lesson_2]'],
  diagnosticCommands: ['[useful_command_1]', '[useful_command_2]'],
  relatedIncidents: ['[similar_issue_1]', '[similar_issue_2]']
}
```

### 5. Documentation Updates
- [ ] **Update troubleshooting guide** with new solution pattern
- [ ] **Update monitoring alerts** if new failure mode discovered
- [ ] **Update ADRs** if architectural assumptions were wrong
- [ ] **Update deployment procedures** if process improvements identified

---

**Template Usage:** Use this template when debugging production issues, investigating system problems, or resolving technical incidents. The structured approach ensures thorough investigation and knowledge capture for future reference.
