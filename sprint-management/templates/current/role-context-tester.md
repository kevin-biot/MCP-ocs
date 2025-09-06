# Role Context Template - TESTER
**Template Version**: v3.3.1-enhanced (2025-09-06)  
**Process Framework**: Process v3.3 Enhanced with Aviation Safety Integration  
**Template Type**: Current/Active - Evidence Validation Framework  
**Supersedes**: v3.3.0, v3.2.x, v3.1.x (archived to legacy/)

---

**Date**: YYYY-MM-DD  
**Sprint**: [Problem-Resolution Sprint Name]  
**Role**: TESTER (Evidence Validator)  

## Today's Mission - Evidence-Based Validation
**Problem Elimination Validation**: Verify systematic [PROBLEM_CATEGORY] elimination in [DOMAIN]
**Evidence Standards**: Achieve ≥ 0.9 completeness score with comprehensive proof
**Archive Integration**: All validation results must support landing protocol

## Role Assignment Boundaries
**Validation Philosophy**: Prove problems genuinely eliminated, not just hidden or moved  
**Scope**: Validate systematic elimination claimed by DEVELOPER role  
**Time Box**: [Estimated session duration]  
**Evidence Goal**: Comprehensive proof of zero [PROBLEM_CATEGORY] instances + working prevention
**Landing Preparation**: Evidence organized for archive validation phase

## Quality Intelligence Context for Validation

### Weekly Findings Baseline
[Reference context from Review-Prompt-Lib]
- **Pre-Elimination State**: [BASELINE_PROBLEMS] identified in weekly scans
- **Historical Patterns**: [PROBLEM_RECURRENCE] patterns to verify prevention
- **Cross-Domain Connections**: [RELATED_ISSUES] requiring validation
- **Previous Validation Lessons**: [TESTING_INSIGHTS] from past elimination efforts

### Problem-Resolution Scope to Validate
- **Claimed Elimination**: [DEVELOPER_CLAIMS] requiring verification
- **Evidence Provided**: [DEVELOPER_EVIDENCE] needing validation
- **Prevention Measures**: [SAFEGUARDS] requiring functional testing
- **Quality Improvement**: [BASELINE_CLAIMS] needing measurement

## Execution Log Protocol (Enhanced from D009 Analysis)

### Systematic Documentation Requirement
**Mandatory Execution Log**: Create and maintain detailed execution log following pattern:
`sprint-management/execution-logs/[sprint-id]-tester-log-[yyyy-mm-dd].md`

Document all phases with timestamps, findings, and evidence. Match DEVELOPER documentation quality for consistency and complete audit trail.

### Comprehensive Test Suite Creation (Enhanced Pattern)
**Systematic Regression Prevention**: Create comprehensive test suite to prevent future recurrence:
- **Test File Creation**: `tests/unit/[problem-category]-safety.test.js`
- **Coverage Requirements**: Test each modified module's functionality
- **Edge Case Validation**: Comprehensive boundary condition testing
- **Prevention Verification**: Safeguard mechanism testing

## Tasks Assigned for Evidence Validation

### Primary Validation Tasks
- **VALIDATION-001**: [Specific elimination claim from DEVELOPER log]
  - **Elimination Claim**: [SPECIFIC_DEVELOPER_CLAIM]
  - **Evidence Provided**: [DEVELOPER_EVIDENCE_ARTIFACTS]
  - **Validation Method**: [SYSTEMATIC_VERIFICATION_APPROACH]
  - **Completeness Target**: Evidence score ≥ 0.9

- **VALIDATION-002**: [Prevention measures validation]
  - **Prevention Claims**: [SAFEGUARDS_IMPLEMENTED]
  - **Functional Testing**: [PREVENTION_VERIFICATION_TESTS]
  - **Regression Validation**: [CROSS_DOMAIN_IMPACT_CHECKS]

### Secondary Validation (If Primary Complete)
- **Systematic Scanning**: Independent verification of zero [PROBLEM_CATEGORY] instances
- **Cross-Domain Testing**: Ensure no regression in related quality domains
- **Evidence Completeness**: Comprehensive scoring of elimination proof

## Validation Strategy - Evidence-Based Approach

### Systematic Elimination Verification
1. **Independent Scanning**: Verify zero [PROBLEM_CATEGORY] instances exist
2. **Evidence Validation**: Confirm before/after documentation accuracy
3. **Prevention Testing**: Validate safeguards work as claimed
4. **Completeness Scoring**: Rate evidence quality against v3.3 standards

### Quality Intelligence Integration
```bash
# Independent problem scanning for validation
./review-prompt-lib/scripts/run-weekly-sweep.sh [DOMAIN]

# Cross-domain impact validation
./review-prompt-lib/scripts/determine-domains.sh --modified-files

# Evidence completeness assessment
./scripts/validate-evidence-completeness.sh [PROBLEM_CATEGORY]
```

### Evidence Completeness Framework (Process v3.3 Enhanced)
- [ ] **Baseline Accuracy**: Before-state documentation matches actual state
- [ ] **Elimination Proof**: Zero instances verified through independent scanning
- [ ] **Prevention Validation**: Safeguards tested and working correctly
- [ ] **Quality Metrics**: Improvement demonstrated with quantifiable measures
- [ ] **Cross-Domain Safety**: No regression introduced in related domains
- [ ] **Archive Readiness**: All evidence organized for landing checklist

## Success Criteria for Evidence Validation
- [ ] **Execution Log**: Systematic documentation completed with timestamps and validation evidence
- [ ] **Test Suite Creation**: Comprehensive regression prevention tests created and passing
- [ ] Independent verification confirms zero [PROBLEM_CATEGORY] instances
- [ ] Before/after evidence accuracy validated with high confidence
- [ ] Prevention measures tested and confirmed working
- [ ] Evidence completeness score ≥ 0.9 achieved
- [ ] Cross-domain regression testing passed
- [ ] Quality baseline improvement verified with metrics
- [ ] **Systematic Verification**: Code inspection and pattern matching completed
- [ ] Validation results documented for REVIEWER role
- [ ] All evidence artifacts prepared for archive landing protocol

## Evidence Validation Checklist

### For Each Elimination Claim:
- [ ] **Independent Verification**: Can you find zero instances through fresh scanning?
- [ ] **Evidence Accuracy**: Does before/after documentation match reality?
- [ ] **Prevention Effectiveness**: Do safeguards actually prevent recurrence?
- [ ] **Completeness Assessment**: Does evidence meet Process v3.3 standards?
- [ ] **Quality Improvement**: Is baseline enhancement measurable and real?
- [ ] **Cross-Domain Safety**: No unintended impacts on related domains?

### Documentation Requirements:
- [ ] **Validation Results**: Clear evidence supporting or refuting claims
- [ ] **Evidence Scoring**: Numerical assessment against completeness criteria
- [ ] **Recommendations**: Specific guidance for any evidence gaps
- [ ] **Quality Assessment**: Overall elimination effectiveness evaluation

## Aviation Safety Integration (v3.3 Enhanced)

### Landing Protocol Preparation:
- **Evidence Organization**: All validation results structured for archive
- **Quality Documentation**: Completeness scores ready for reviewer assessment
- **Archive Artifacts**: Validation logs prepared for systematic closure

### Cross-Domain Validation Requirements:
- **Related Quality Domains**: [DOMAIN_LIST] requiring regression testing
- **Prevention Verification**: [SAFEGUARD_LIST] functional validation
- **Integration Testing**: [COMPONENT_LIST] cross-system verification

## Role Chain Context
**Your Input From**: DEVELOPER role (elimination claims and evidence)  
**Your Output Feeds**: REVIEWER role (who assesses overall problem-resolution quality)  
**Evidence Standards**: Process v3.3 requires ≥ 0.9 completeness score  
**Archive Integration**: All validation feeds systematic landing protocol

## Escalation Criteria - Evidence Validation
- **Elimination Incomplete**: Independent verification finds remaining [PROBLEM_CATEGORY] instances
- **Evidence Insufficient**: Cannot achieve ≥ 0.9 completeness score
- **Prevention Failures**: Safeguards not working as claimed
- **Regression Detection**: Cross-domain impacts discovered during validation
- **Quality Decline**: Baseline appears worse despite elimination claims

---

## Template Evolution History
- **v3.3.1-enhanced (2025-09-06)**: Added aviation safety integration and archive preparation
- **v3.3.0 (2025-09-XX)**: Evidence validation paradigm introduction
- **v3.2.x (archived)**: Feature validation framework with quality gates
- **v3.1.x (archived)**: Basic testing role execution framework

## Usage Notes
- **Current Status**: Active template for all Process v3.3 Enhanced sprints
- **Archive Integration**: Compatible with systematic landing checklist
- **Evidence Standards**: Maintains systematic validation approach
- **Framework Alignment**: Supports aviation safety protocol integration

---
*Template Version: v3.3.1-enhanced*  
*Last Updated: 2025-09-06*  
*Framework Compatibility: Process v3.3 Enhanced (Aviation Safety Integration)*
