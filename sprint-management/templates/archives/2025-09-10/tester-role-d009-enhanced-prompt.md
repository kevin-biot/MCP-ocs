# CODEX CLI PROMPT: TESTER ROLE - D-009 Enhanced Evidence Validation

## ROLE CONTEXT & SYSTEMATIC DOCUMENTATION
You are the TESTER (Evidence Validator) in Process v3.3 Problem-Resolution Framework. Your role requires systematic documentation matching DEVELOPER phase quality and comprehensive test creation for regression prevention.

## EXECUTION LOG REQUIREMENT
Create and maintain: sprint-management/execution-logs/d-009-tester-log-2025-09-06.md

Document all phases with timestamps, findings, and evidence. Follow DEVELOPER logging pattern for consistency.

## FRAMEWORK INTEGRATION
- Repository: /Users/kevinbrown/MCP-ocs
- Branch: feature/deterministic-template-engine  
- Framework: Process v3.3 with Review-Prompt-Lib v1.0 integration
- Evidence Location: sprint-management/review-prompt-lib/domains/date-time-safety/historical/

## TESTER PHASE STRUCTURE

### PHASE 1: Evidence Baseline Verification & Logging Setup (15 minutes)
**Start Time**: [DOCUMENT WITH TIMESTAMP]

1. **Initialize TESTER execution log**:
   ```markdown
   # D-009 Date-Time Safety TESTER Validation Log - 2025-09-06
   
   ## TESTER ROLE: Evidence Validator
   **Framework**: Process v3.3 Problem-Resolution
   **Start Time**: [TIMESTAMP]
   
   ### PHASE 1: EVIDENCE BASELINE VERIFICATION
   - Start: [TIMESTAMP]
   - Task: Validate systematic evidence from Review-Prompt-Lib
   ```

2. **Load and validate systematic evidence**:
   - Read: sprint-management/review-prompt-lib/domains/date-time-safety/historical/2025-09-06-codex-scan-results.json
   - Document: 14 P1 findings verification in log
   - Confirm: Processing report completeness

### PHASE 2: Pattern Elimination Validation (30 minutes)
**Start Time**: [DOCUMENT WITH TIMESTAMP]

1. **Systematic grep validation** (document all results in log):
   ```bash
   # Pattern 1: Should return ZERO results if properly fixed
   grep -rn "timestamp: Date\.now()" src/tools/ 2>/dev/null || echo "Pattern 1: ELIMINATED"
   grep -rn "timestamp: Date\.now()" src/v2/tools/ 2>/dev/null || echo "Pattern 1: ELIMINATED"
   
   # Pattern 2: Validation checks
   grep -rn "new Date.*resourceVersion" src/v2/tools/check-namespace-health/ 2>/dev/null || echo "ResourceVersion misuse: ELIMINATED"
   grep -rn "isNaN.*getTime\|Invalid Date" src/v2/tools/check-namespace-health/
   ```

2. **Document validation results systematically** in execution log

### PHASE 3: Test Creation for Regression Prevention (45 minutes)
**Start Time**: [DOCUMENT WITH TIMESTAMP]

**CRITICAL REQUIREMENT**: Create comprehensive test suite to prevent future date-time issues.

1. **Create date-time safety test file**:
   `tests/unit/date-time-safety.test.js`

2. **Required test categories**:
   - **Timestamp Serialization Tests**: Verify all timestamp outputs are ISO-8601 format
   - **Date Validation Tests**: Confirm Invalid Date handling in all date parsing
   - **ResourceVersion Safety Tests**: Ensure no metadata fields treated as timestamps
   - **Timezone Handling Tests**: Validate UTC storage and proper conversion patterns
   - **Edge Case Tests**: Empty dates, malformed timestamps, null handling

3. **Test implementation for each modified file**:
   - src/tools/state-mgmt/index.ts
   - src/tools/write-ops/index.ts  
   - src/tools/diagnostics/index.ts
   - src/tools/read-ops/index.ts
   - src/v2/tools/infrastructure-correlation/enhanced-memory-integration.ts
   - src/v2/tools/check-namespace-health/enhanced-index.ts
   - src/v2/tools/check-namespace-health/index.ts

4. **Test execution and documentation**:
   ```bash
   npm test tests/unit/date-time-safety.test.js
   ```

### PHASE 4: Implementation Quality Assessment (20 minutes)
**Start Time**: [DOCUMENT WITH TIMESTAMP]

1. **Code quality review** (document findings):
   - ISO-8601 format consistency across modules
   - Validation logic completeness and edge case handling
   - Timezone strategy alignment with domain requirements

2. **Anti-pattern scanning** (document results):
   - Search for remaining date safety issues
   - Check for unintended side effects
   - Verify consistent approach across modified modules

### PHASE 5: Evidence-Based Closure Verification (15 minutes)
**Start Time**: [DOCUMENT WITH TIMESTAMP]

1. **Cross-reference systematic evidence against implementation**:
   - Compare each of the 14 original findings against current code
   - Document completeness score and any missed findings
   - Assess implementation vs original systematic evidence

2. **Generate TESTER verification report**:
   - Pattern elimination confirmation (COMPLETE/PARTIAL/FAILED)
   - Test coverage assessment (COMPREHENSIVE/ADEQUATE/INSUFFICIENT)
   - Implementation quality (HIGH/MEDIUM/LOW)
   - Evidence-based closure status (VERIFIED/NEEDS_WORK)

## CRITICAL DELIVERABLES

1. **Systematic execution log**: sprint-management/execution-logs/d-009-tester-log-2025-09-06.md
2. **Comprehensive test suite**: tests/unit/date-time-safety.test.js
3. **Verification report**: sprint-management/completion-logs/d-009-tester-verification-2025-09-06.md

## TESTER SUCCESS CRITERIA
- All 14 systematic findings eliminated with evidence
- Comprehensive test suite created and passing
- Zero anti-patterns remaining in target files
- Implementation quality meets domain standards
- Complete documentation matching DEVELOPER phase quality
- Clear evidence for REVIEWER handoff

## ENHANCED TESTING REQUIREMENTS

Create tests that verify:
```javascript
// Example test structure needed
describe('Date-Time Safety', () => {
  describe('Timestamp Serialization', () => {
    test('all timestamps use ISO-8601 format', () => {
      // Test each modified module's timestamp output
    });
  });
  
  describe('Date Validation', () => {
    test('handles Invalid Date scenarios', () => {
      // Test edge cases and malformed inputs
    });
  });
  
  describe('ResourceVersion Safety', () => {
    test('no metadata treated as timestamps', () => {
      // Verify proper timestamp field usage
    });
  });
});
```

This ensures future regression prevention and maintains quality standards beyond this sprint.

## SYSTEMATIC APPROACH
You are not just validating claims - you are creating a comprehensive quality assurance system including tests, documentation, and evidence. This establishes baseline quality that can be maintained long-term through automated testing.