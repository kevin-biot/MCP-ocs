# TESTER Role Guardrails - Process v3.3.1-Enhanced Framework
**Template Version**: v3.3.1-enhanced (2025-09-06)  
**Process Framework**: Process v3.3 Enhanced with Aviation Safety Integration  
**Template Type**: Current/Active - TESTER Role Standards  
**Supersedes**: v3.2.x Enhanced Framework (archived)

**Role**: TESTER (Evidence Validator)  
**Framework**: Process v3.3.1-Enhanced with Aviation Safety Integration  
**Status**: Comprehensive Evidence Validation Standards  
**Last Updated**: 2025-09-06  

---

## SYSTEMATIC EVIDENCE VALIDATION FRAMEWORK

### Phase-by-Phase Evidence Validation Protocol

#### **PHASE 1: Evidence Baseline Verification** (15-20 minutes)
- [ ] **Elimination Claims Analysis**: Review DEVELOPER evidence and systematic elimination claims
- [ ] **Evidence Chain Validation**: Verify complete trail from problem identification to resolution
- [ ] **Risk Assessment**: Identify high-risk areas where elimination claims need intensive validation
- [ ] **Validation Strategy Planning**: Design comprehensive verification approach matching evidence complexity
- [ ] **Environment Setup**: Prepare validation environment with necessary scanning tools
- [ ] **Archive Preparation**: Initialize systematic documentation for landing protocol

#### **PHASE 2: Systematic Evidence Validation** (60-90 minutes)
- [ ] **Independent Verification**: Confirm zero problem instances through fresh scanning
- [ ] **Prevention Testing**: Validate safeguards work as claimed by DEVELOPER
- [ ] **Cross-Domain Impact**: Test for regressions in related quality domains
- [ ] **Evidence Completeness Scoring**: Rate evidence quality against ≥ 0.9 standard
- [ ] **Comprehensive Test Suite Creation**: Build regression prevention tests
- [ ] **Quality Baseline Verification**: Confirm measurable improvement demonstrated

#### **PHASE 3: Evidence Assessment and Archive Preparation** (20-30 minutes)
- [ ] **Validation Results Documentation**: Comprehensive evidence assessment compilation
- [ ] **Evidence Quality Classification**: Score completeness and identify any gaps
- [ ] **REVIEWER Handoff Preparation**: Create detailed validation summary with evidence scores
- [ ] **Archive Organization**: Prepare all validation artifacts for landing protocol
- [ ] **Quality Gate Assessment**: Determine overall validation outcome with evidence standards

---

## EVIDENCE VALIDATION STANDARDS (Process v3.3.1-Enhanced)

### Evidence Completeness Requirements

#### **Mandatory Evidence Validation (≥ 0.9 Completeness Score)**
- [ ] **Before State Verification**: Confirm baseline documentation matches actual prior state
- [ ] **Elimination Process Validation**: Verify systematic approach was actually executed
- [ ] **After State Confirmation**: Independent scanning confirms zero instances remain
- [ ] **Prevention Measure Testing**: Safeguards tested and proven functional
- [ ] **Cross-Domain Safety**: No regression introduced in related domains

#### **Evidence Quality Assessment Framework**
```typescript
// REQUIRED pattern for evidence scoring
interface ValidationEvidence {
    beforeStateAccuracy: number;      // 0.0-1.0 (baseline matches reality)
    eliminationCompleteness: number;  // 0.0-1.0 (zero instances confirmed)
    preventionEffectiveness: number;  // 0.0-1.0 (safeguards working)
    crossDomainSafety: number;       // 0.0-1.0 (no regression detected)
    documentationQuality: number;    // 0.0-1.0 (evidence clarity)
    overallScore: number;            // Weighted average ≥ 0.9 required
}

function calculateEvidenceScore(validation: ValidationResult): number {
    const weights = {
        beforeStateAccuracy: 0.15,
        eliminationCompleteness: 0.35,
        preventionEffectiveness: 0.25,
        crossDomainSafety: 0.15,
        documentationQuality: 0.10
    };
    
    return Object.entries(weights).reduce((score, [key, weight]) => {
        return score + (validation[key] * weight);
    }, 0);
}
```

### Problem-Resolution Validation Methodology

#### **Systematic Verification Approach**
- [ ] **Independent Problem Scanning**: Use Review-Prompt-Lib to confirm zero instances
- [ ] **Pattern-Based Validation**: Verify elimination consistency across similar instances
- [ ] **Boundary Testing**: Confirm elimination scope matches claimed boundaries
- [ ] **Prevention Validation**: Test safeguards against synthetic problem instances
- [ ] **Integration Testing**: Ensure elimination didn't break existing functionality

---

## VALIDATION COMPLEXITY TIERS (Process v3.3.1-Enhanced)

### Evidence Validation Requirements by Complexity

#### **TIER 1 Validation (1-2 SP - Focused Problem Elimination)**
- **Minimum Evidence**: Before/after scanning, basic prevention testing
- **Validation Types**: Independent scanning, safeguard verification
- **Time Allocation**: 45-60 minutes
- **Evidence Threshold**: ≥ 0.9 completeness score, zero instances confirmed

#### **TIER 2 Validation (3-5 SP - Systematic Problem Elimination)**
- **Minimum Evidence**: Comprehensive scanning, prevention testing, cross-domain validation
- **Validation Types**: Independent verification, comprehensive test suite creation, regression testing
- **Time Allocation**: 90-120 minutes
- **Evidence Threshold**: ≥ 0.9 completeness score, comprehensive prevention validation

#### **TIER 3 Validation (6+ SP - Domain-Wide Quality Transformation)**
- **Minimum Evidence**: Statistical validation, comprehensive prevention, framework impact assessment
- **Validation Types**: Domain-wide scanning, prevention test suites, cross-domain impact analysis
- **Time Allocation**: 120-180 minutes
- **Evidence Threshold**: ≥ 0.9 completeness score, measurable quality transformation validated

---

## SYSTEMATIC VALIDATION PATTERNS (Process v3.3 Proven)

### Independent Verification Methodology

#### **Problem Instance Scanning (Systematic Approach)**
```bash
# REQUIRED pattern for independent verification
# Systematic scanning to confirm zero instances remain

# Pattern 1: Direct problem scanning
grep -rn "problemPattern" src/ --exclude-dir=node_modules
find . -name "*.ts" -exec grep -l "antiPattern" {} \;

# Pattern 2: Domain-specific validation
./review-prompt-lib/scripts/scan-domain.sh [DOMAIN] [PROBLEM_CATEGORY]

# Pattern 3: Cross-cutting concern verification
./scripts/validate-elimination.sh [PROBLEM_CATEGORY] [SCOPE]

# Required: Document ALL scan results with timestamps
echo "VALIDATION: $(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)" >> validation-log.md
echo "Pattern: [PATTERN] | Results: [RESULTS]" >> validation-log.md
```

#### **Prevention Measure Testing (Systematic Validation)**
```typescript
// REQUIRED pattern for safeguard validation
async function validatePreventionMeasures(
    problemCategory: string,
    safeguards: PreventionMeasure[]
): Promise<PreventionValidationResult> {
    const results: PreventionTest[] = [];
    
    for (const safeguard of safeguards) {
        switch (safeguard.type) {
            case 'eslint-rule':
                const lintResult = await testESLintRule(safeguard);
                results.push(lintResult);
                break;
                
            case 'type-guard':
                const guardResult = await testTypeGuard(safeguard);
                results.push(guardResult);
                break;
                
            case 'test-requirement':
                const testResult = await runPreventionTests(safeguard);
                results.push(testResult);
                break;
        }
    }
    
    return {
        overallEffectiveness: calculateEffectiveness(results),
        individualResults: results,
        validated: results.every(r => r.effective)
    };
}
```

### Comprehensive Test Suite Creation (Enhanced from D009 Pattern)

#### **Regression Prevention Test Creation**
```javascript
// REQUIRED pattern for systematic regression prevention
describe(`${problemCategory} Prevention Tests`, () => {
    describe('Problem Elimination Validation', () => {
        test('zero instances of problem pattern remain', async () => {
            const instances = await scanForProblemInstances(problemCategory);
            expect(instances).toHaveLength(0);
        });
        
        test('prevention measures block problem reintroduction', async () => {
            const attempt = await attemptProblemReintroduction(problemCategory);
            expect(attempt.blocked).toBe(true);
            expect(attempt.safeguardTriggered).toBe(true);
        });
    });
    
    describe('Cross-Domain Safety Validation', () => {
        test('no regression in related domains', async () => {
            const relatedDomains = getRelatedDomains(problemCategory);
            for (const domain of relatedDomains) {
                const regressionScan = await scanForRegression(domain);
                expect(regressionScan.newIssues).toHaveLength(0);
            }
        });
    });
    
    describe('Quality Baseline Verification', () => {
        test('measurable improvement achieved', async () => {
            const baseline = await getQualityBaseline(problemCategory);
            const current = await getCurrentQualityMetrics(problemCategory);
            expect(current.score).toBeGreaterThan(baseline.score);
        });
    });
});
```

---

## AVIATION SAFETY INTEGRATION (Process v3.3.1-Enhanced)

### Landing Protocol Validation Requirements

#### **Archive Validation for Landing Protocol**
**Evidence Organization (Mandatory):**
- [ ] **Execution Log Completeness**: Systematic documentation with timestamps and evidence
- [ ] **Validation Results Documentation**: All verification results organized for archive
- [ ] **Test Suite Creation**: Regression prevention tests created and passing
- [ ] **Evidence Scoring Documentation**: Completeness scores ≥ 0.9 documented
- [ ] **Cross-Domain Impact Assessment**: Related domain safety verified

#### **Quality Gate Verification for Landing**
**Systematic Closure Preparation (Mandatory):**
- [ ] **Evidence Standards Met**: ≥ 0.9 completeness score achieved and documented
- [ ] **Prevention Measures Validated**: All safeguards tested and working
- [ ] **Archive Artifacts Organized**: All validation outputs ready for landing protocol
- [ ] **Framework Consistency Maintained**: v3.3.1-enhanced standards followed
- [ ] **Emergency Prevention Active**: No organizational debt created during validation

---

## VALIDATION FAILURE PROTOCOLS

### Evidence Insufficiency Response

#### **When Evidence Score < 0.9**
```typescript
// REQUIRED pattern for evidence insufficiency
interface EvidenceGap {
    category: 'baseline' | 'elimination' | 'prevention' | 'cross-domain';
    severity: 'critical' | 'major' | 'minor';
    description: string;
    recommendations: string[];
}

async function handleEvidenceInsufficiency(
    score: number,
    gaps: EvidenceGap[]
): Promise<ValidationDecision> {
    if (score < 0.7) {
        return {
            decision: 'REJECT',
            reason: 'Evidence critically insufficient',
            requiredActions: gaps.map(g => g.recommendations).flat()
        };
    }
    
    if (score < 0.9) {
        return {
            decision: 'CONDITIONAL',
            reason: 'Evidence needs enhancement',
            requiredActions: gaps
                .filter(g => g.severity !== 'minor')
                .map(g => g.recommendations)
                .flat()
        };
    }
    
    return { decision: 'APPROVE', reason: 'Evidence sufficient' };
}
```

#### **Prevention Failure Response**
**When Safeguards Don't Work (Escalation Required):**
- [ ] **Immediate Rejection**: Block progression to REVIEWER if prevention fails
- [ ] **Root Cause Analysis**: Identify why safeguards are ineffective
- [ ] **Enhanced Requirements**: Specify additional prevention measures needed
- [ ] **Re-validation Required**: Full validation cycle after prevention fixes

---

## HANDOFF REQUIREMENTS (Enhanced Process v3.3.1)

### REVIEWER Handoff Documentation

#### **Required Validation Artifacts**
- [ ] **Evidence Validation Report**: `[sprint-id]-tester-validation-v3.3.1.md`
- [ ] **Evidence Completeness Scoring**: `[sprint-id]-evidence-scoring-v3.3.1.md`
- [ ] **Prevention Test Suite**: `tests/unit/[problem-category]-prevention.test.js`
- [ ] **Cross-Domain Impact Assessment**: Regression testing results
- [ ] **Quality Gate Results**: Overall validation outcome with evidence support

#### **Evidence Validation Report Format**
```markdown
## TESTER EVIDENCE VALIDATION SUMMARY

**Problem Category**: [specific-quality-debt-type]
**Domain**: [primary-domain] + [secondary-domain]  
**Process Framework**: v3.3.1-Enhanced with Aviation Safety Integration
**Validation Duration**: [actual] minutes (estimated: [estimated])

**Evidence Validation Results**:
- **Before State Accuracy**: [score] / 1.0 (baseline verification)
- **Elimination Completeness**: [score] / 1.0 (zero instances confirmed)
- **Prevention Effectiveness**: [score] / 1.0 (safeguards tested)
- **Cross-Domain Safety**: [score] / 1.0 (no regression detected)
- **Overall Evidence Score**: [score] / 1.0 (≥ 0.9 REQUIRED)

**Independent Verification**:
- [ ] **Problem Scanning**: [METHOD] used, [RESULTS] found
- [ ] **Prevention Testing**: [SAFEGUARDS] tested, [EFFECTIVENESS] confirmed
- [ ] **Regression Testing**: [DOMAINS] checked, [ISSUES] found
- [ ] **Quality Improvement**: [METRICS] show [IMPROVEMENT]%

**Test Suite Created**:
- **File**: tests/unit/[problem-category]-prevention.test.js
- **Coverage**: [COMPREHENSIVE/ADEQUATE/INSUFFICIENT]
- **Passing**: [COUNT] / [TOTAL] tests
- **Prevention**: [SPECIFIC] prevention measures validated

**Validation Decision for REVIEWER**:
- **Evidence Quality**: [APPROVED/CONDITIONAL/REJECTED]
- **Evidence Score**: ≥ 0.9 [ACHIEVED/NOT_ACHIEVED]
- **Prevention Validation**: [EFFECTIVE/NEEDS_WORK]
- **Cross-Domain Safety**: [SAFE/REGRESSION_DETECTED]
- **Ready for REVIEWER**: [YES/NO] with [EVIDENCE_LEVEL] evidence

**Archive Preparation**: [COMPLETE/IN_PROGRESS]
**Landing Protocol Ready**: [YES/NO]
```

---

## CONTINUOUS IMPROVEMENT (Process v3.3.1-Enhanced)

### Validation Effectiveness Tracking
- [ ] **Evidence Quality Consistency**: Completeness scores achieved across problem categories
- [ ] **Prevention Validation Accuracy**: Safeguard effectiveness prediction vs actual performance
- [ ] **Cross-Domain Impact Detection**: Regression identification accuracy
- [ ] **Validation Efficiency**: Time spent vs evidence quality achieved

### Testing Methodology Evolution
- [ ] **Successful Validation Patterns**: Approaches consistently achieving ≥ 0.9 evidence scores
- [ ] **Prevention Testing Effectiveness**: Methods that accurately validate safeguards
- [ ] **Evidence Gap Identification**: Common insufficiency patterns and solutions
- [ ] **Framework Integration**: Process v3.3.1-enhanced validation effectiveness

---

## Template Evolution History
- **v3.3.1-enhanced (2025-09-06)**: Added aviation safety integration, evidence validation standards, prevention testing
- **v3.2.x (archived)**: Feature validation framework with quality gates
- **v3.1.x (archived)**: Basic testing role execution framework

## Usage Notes
- **Current Status**: Active guardrails for all Process v3.3.1-Enhanced TESTER role execution
- **Evidence Focus**: Systematic validation vs feature acceptance orientation
- **Evidence Standards**: Mandatory ≥ 0.9 completeness scoring with comprehensive validation
- **Aviation Safety**: Landing protocol validation integrated throughout

---
*Template Version: v3.3.1-enhanced*  
*Last Updated: 2025-09-06*  
*Framework Compatibility: Process v3.3.1-Enhanced (Aviation Safety Integration)*  
*Integration: Works with DEVELOPER-GUARDRAILS.md and REVIEWER-GUARDRAILS.md for systematic quality assurance*

**Framework Integration**: This guardrails file integrates with DEVELOPER-GUARDRAILS.md and REVIEWER-GUARDRAILS.md to provide systematic evidence validation throughout Process v3.3.1-enhanced execution with aviation safety landing protocol.

**Historical Context**: Validation requirements and methodologies derived from D-001 through D-014 domain analysis, enhanced with D-009 interface hygiene systematic validation patterns, ensure evidence-based problem resolution vs completion theater.

**Process Authority**: TESTER role maintains evidence validation autonomy while following systematic framework for verification, prevention testing, cross-domain safety, and organizational hygiene with aviation safety integration.
