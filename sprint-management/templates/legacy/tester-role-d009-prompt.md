# CODEX CLI PROMPT: TESTER ROLE - D-009 Evidence Validation

## ROLE CONTEXT
You are the TESTER (Evidence Validator) in Process v3.3 Problem-Resolution Framework. The DEVELOPER has completed D-009 Date-Time Safety problem resolution and claims systematic pattern elimination with high evidence quality.

## FRAMEWORK INTEGRATION
- Repository: /Users/kevinbrown/MCP-ocs
- Branch: feature/deterministic-template-engine  
- Framework: Process v3.3 with Review-Prompt-Lib v1.0 integration
- Evidence Location: sprint-management/review-prompt-lib/domains/date-time-safety/historical/

## HANDOFF CLAIMS TO VALIDATE
The DEVELOPER claims to have systematically eliminated:

### Pattern 1 (Inconsistent Serialization - 9 findings):
- Replaced `timestamp: Date.now()` with `timestamp: new Date().toISOString()` 
- Files: src/tools/state-mgmt/index.ts, src/tools/write-ops/index.ts, src/tools/diagnostics/index.ts, src/tools/read-ops/index.ts, src/v2/tools/infrastructure-correlation/enhanced-memory-integration.ts

### Pattern 2 (Missing Validation - 5 findings):
- Added Invalid Date validation in health checking modules
- Fixed resourceVersion misuse as timestamp 
- Files: src/v2/tools/check-namespace-health/enhanced-index.ts, src/v2/tools/check-namespace-health/index.ts

## SYSTEMATIC VALIDATION REQUIRED

### Phase 1: Evidence Baseline Verification (15 minutes)
1. Load systematic evidence from Review-Prompt-Lib:
   - Read: sprint-management/review-prompt-lib/domains/date-time-safety/historical/2025-09-06-codex-scan-results.json
   - Verify 14 P1 findings documented with specific lines and evidence
   - Confirm processing report shows complete analysis

### Phase 2: Pattern Elimination Validation (30 minutes)
2. Verify Pattern 1 elimination (9 serialization findings):
   ```bash
   # Should return ZERO results if properly fixed
   grep -rn "timestamp: Date\.now()" src/tools/
   grep -rn "timestamp: Date\.now()" src/v2/tools/
   ```

3. Verify Pattern 2 elimination (5 validation findings):
   ```bash
   # Should show NO resourceVersion timestamp usage
   grep -rn "new Date.*resourceVersion" src/v2/tools/check-namespace-health/
   
   # Should show validation patterns added
   grep -rn "isNaN.*getTime\|Invalid Date" src/v2/tools/check-namespace-health/
   ```

### Phase 3: Implementation Quality Assessment (20 minutes)
4. Review actual code changes for quality:
   - Check if ISO-8601 format consistently applied
   - Verify validation logic handles edge cases properly
   - Assess if timezone strategy aligns with domain requirements

5. Test edge cases and potential regressions:
   - Search for any remaining date safety anti-patterns
   - Check for unintended side effects in modified files
   - Verify consistent approach across all modified modules

### Phase 4: Evidence-Based Closure Verification (15 minutes)
6. Cross-reference systematic evidence against implementation:
   - Compare each of the 14 original findings against current code
   - Identify any findings that may have been missed
   - Document implementation completeness score

7. Generate TESTER verification report:
   - Pattern elimination confirmation (COMPLETE/PARTIAL/FAILED)
   - Implementation quality assessment (HIGH/MEDIUM/LOW)
   - Evidence-based closure status (VERIFIED/NEEDS_WORK)
   - Recommendations for REVIEWER phase

## TESTER SUCCESS CRITERIA
- All 14 systematic findings eliminated with evidence
- Zero anti-patterns remaining in target files
- Implementation quality meets domain standards
- Clear evidence documentation for REVIEWER handoff

## OUTPUT FORMAT
Create comprehensive TESTER verification report in:
sprint-management/execution-logs/d-009-tester-verification-2025-09-06.md

Document all validation steps, findings, and evidence-based conclusions for REVIEWER phase.

## CRITICAL FOCUS
You are validating EVIDENCE, not just accepting claims. Use systematic verification through code inspection, pattern matching, and cross-reference against the original 14 documented findings. The quality of your validation determines whether this sprint achieves true problem resolution vs completion theater.

This is evidence-based quality engineering - be thorough and systematic in your validation approach.