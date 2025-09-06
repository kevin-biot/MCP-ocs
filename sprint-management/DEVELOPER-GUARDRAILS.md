# DEVELOPER Role Guardrails - Process v3.3.1-Enhanced Framework
**Template Version**: v3.3.1-enhanced (2025-09-06)  
**Process Framework**: Process v3.3 Enhanced with Aviation Safety Integration  
**Template Type**: Current/Active - DEVELOPER Role Standards  
**Supersedes**: v3.2.x Enhanced Framework (archived)

**Role**: DEVELOPER (Problem Solver)  
**Framework**: Process v3.3.1-Enhanced with Aviation Safety Integration  
**Status**: Comprehensive Problem-Resolution Standards  
**Last Updated**: 2025-09-06  

---

---

## CRITICAL STYLE PATTERNS (Process v3.3.1-Enhanced)
**Minimal Rules for High-Frequency Issues:**

- **Date Consistency**: 
  - Logs/user-facing JSON: `nowIso()` (TZ-aware ISO 8601)
  - Memory/internal timing: `nowEpoch()` (numeric ms)
  - NEVER use `Date.now()` or inconsistent formats

- **Type Boundaries**: Validate at all tool/API boundaries (NEVER bypass with 'any')

- **Async Discipline**: 
  - Always await Promises (NEVER floating promises)
  - Use Promise.allSettled for parallel operations (not Promise.all for optional ops)
  - Add timeouts to external calls (fetch, DB queries)

- **Error Structure**: Use domain-specific error classes, never generic Error()

- **Trust Boundaries**: 
  - Validate all req.body, req.params, req.query (NEVER trust user input)
  - Sanitize file paths and external data

**Note**: These patterns address the most frequent style debt identified through systematic code reviews. Focus on core functionality - formal review will catch additional style issues.

---

## SYSTEMATIC PROBLEM-RESOLUTION FRAMEWORK

### Phase-by-Phase Problem Elimination Protocol

#### **PHASE 1: Problem Baseline & Analysis** (15-30 minutes)
- [ ] **Problem Category Definition**: Identify specific quality debt type for systematic elimination
- [ ] **Evidence Collection**: Document current state with measurable baseline
- [ ] **Historical Pattern Review**: Check similar elimination attempts for proven approaches
- [ ] **Risk Assessment**: Identify potential cross-domain impacts and architectural considerations
- [ ] **Elimination Strategy**: Plan systematic approach using evidence-based patterns
- [ ] **Archive Preparation**: Initialize landing protocol structure early

#### **PHASE 2: Systematic Problem Elimination** (60-120 minutes)
- [ ] **Incremental Elimination**: Remove problems step-by-step with validation
- [ ] **Pattern Consistency**: Apply elimination approach consistently across codebase
- [ ] **Quality Integration**: Maintain security and architectural standards throughout
- [ ] **Continuous Verification**: Validate elimination at each major milestone
- [ ] **Prevention Implementation**: Add safeguards against problem recurrence
- [ ] **Evidence Generation**: Create systematic proof of elimination

#### **PHASE 3: Verification & Landing Preparation** (20-40 minutes)
- [ ] **Elimination Verification**: Confirm zero instances of problem category remain
- [ ] **Quality Gate Verification**: Ensure all standards met before handoff
- [ ] **Documentation Completion**: Create detailed handoff artifacts
- [ ] **TESTER Preparation**: Provide comprehensive validation requirements
- [ ] **Archive Organization**: Prepare all artifacts for aviation safety landing protocol
- [ ] **Process Documentation**: Record lessons learned and performance data

---

## SECURITY GUARDRAILS (P0 - MANDATORY)

### Critical Security Patterns (MUST IMPLEMENT)

#### **D-001: Trust Boundary Protection**
**Input Validation (Zero Tolerance):**
- [ ] **Schema Validation**: Every user input MUST have validation schema
- [ ] **Parameterized Queries**: NO dynamic SQL construction without parameters
- [ ] **Path Sanitization**: ALL file operations MUST sanitize paths
- [ ] **Command Safety**: NO shell execution with unsanitized parameters

```typescript
// REQUIRED pattern for user input
const userInput = validateInput(raw, inputSchema);
if (!userInput.valid) {
    throw new ValidationError(userInput.errors);
}

// REQUIRED pattern for file operations  
const safePath = path.resolve(basePath, sanitizePath(userPath));
if (!safePath.startsWith(basePath)) {
    throw new SecurityError('Path traversal attempt');
}
```

#### **D-005: Async Correctness**
**Promise Handling (Zero Tolerance):**
- [ ] **Await All Async**: Every Promise MUST be awaited or explicitly handled
- [ ] **Race Condition Prevention**: Concurrent operations MUST be properly sequenced
- [ ] **Error Propagation**: Async errors MUST be caught and handled appropriately
- [ ] **Timeout Management**: Long operations MUST have reasonable timeouts

```typescript
// REQUIRED pattern for async operations
try {
    const result = await Promise.race([
        operation(),
        timeout(30000, 'Operation timed out')
    ]);
    return result;
} catch (error) {
    logger.error('Operation failed', { error, context });
    throw new OperationError('Operation failed', error);
}
```

---

## QUALITY STANDARDS (P1 - HIGH PRIORITY)

### Type Safety Requirements

#### **D-002: TypeScript Excellence**
**Type Safety (Mandatory):**
- [ ] **Zero Any Types**: Absolutely NO `any` usage - use proper types
- [ ] **Safe Assertions**: Type assertions MUST have runtime validation
- [ ] **Null Safety**: Proper null/undefined handling throughout
- [ ] **Interface Compliance**: Runtime data MUST match declared interfaces

```typescript
// REQUIRED pattern for type assertions
function assertIsUser(obj: unknown): asserts obj is User {
    if (!obj || typeof obj !== 'object') {
        throw new TypeError('Expected object');
    }
    const user = obj as Partial<User>;
    if (!user.id || !user.name) {
        throw new TypeError('Invalid user object');
    }
}

// PROHIBITED pattern
const user = data as User; // NEVER do this without validation
```

#### **D-009: Interface Hygiene** (Enhanced from Process v3.3)
**Systematic Interface Safety (High Priority):**
- [ ] **Tool Boundary Protection**: No `any` types at tool interfaces
- [ ] **Memory Adapter Safety**: Proper typing for all memory operations
- [ ] **Date-Time Safety**: ISO-8601 format with timezone handling
- [ ] **Dangerous Assertion Elimination**: Remove unsafe type assertions
- [ ] **Prevention Measures**: ESLint rules and type guards implemented

```typescript
// REQUIRED pattern for tool boundaries (Enhanced v3.3)
interface ToolResponse<T = unknown> {
    success: boolean;
    data: T;
    timestamp: string; // ISO-8601 format required
    evidence: Evidence[];
}

// PROHIBITED patterns from interface hygiene elimination
const result = toolResponse as any; // NEVER bypass tool boundaries
const timestamp = Date.now(); // Use new Date().toISOString()
```

### Error Handling Standards

#### **D-006: Structured Error Management**
**Error Handling (Mandatory):**
- [ ] **Structured Errors**: Use proper error taxonomy, not generic Error
- [ ] **Context Preservation**: Include sufficient debugging context
- [ ] **User Messaging**: Appropriate error messages for different audiences
- [ ] **Recovery Strategies**: Clear recovery paths or graceful degradation

```typescript
// REQUIRED pattern for structured errors
export class ProblemEliminationError extends Error {
    constructor(
        message: string,
        public problemCategory: string,
        public context: unknown,
        public phase: string
    ) {
        super(message);
        this.name = 'ProblemEliminationError';
    }
}

// PROHIBITED pattern
throw new Error('Problem elimination failed'); // Too generic
```

---

## PROBLEM-RESOLUTION STANDARDS (Process v3.3.1-Enhanced)

### Evidence-Based Elimination Requirements

#### **Evidence Completeness Standards**
**Evidence Quality (Mandatory ≥ 0.9):**
- [ ] **Before State Documentation**: Baseline with measurable metrics
- [ ] **Elimination Process Evidence**: Step-by-step systematic proof
- [ ] **After State Verification**: Zero instances confirmed with scanning
- [ ] **Prevention Measure Validation**: Safeguards tested and working
- [ ] **Cross-Domain Impact Assessment**: No regression in related domains

```typescript
// REQUIRED pattern for evidence collection
interface EliminationEvidence {
    problemCategory: string;
    beforeState: {
        instanceCount: number;
        severity: 'P0' | 'P1' | 'P2';
        examples: ProblemInstance[];
        baseline: QualityMetrics;
    };
    eliminationProcess: {
        methodology: string;
        steps: EliminationStep[];
        duration: number;
        toolsUsed: string[];
    };
    afterState: {
        instanceCount: 0; // Must be zero
        verification: VerificationResult[];
        improvement: QualityMetrics;
    };
    prevention: {
        safeguards: PreventionMeasure[];
        testing: PreventionTest[];
        monitoring: MonitoringStrategy[];
    };
    completenessScore: number; // Must be ≥ 0.9
}
```

#### **Systematic Elimination Methodology**
**Problem Resolution Approach (Mandatory):**
- [ ] **Pattern-Based Elimination**: Consistent approach across similar problems
- [ ] **Scope Discipline**: Clear boundaries preventing scope explosion
- [ ] **Prevention Integration**: Safeguards implemented during elimination
- [ ] **Cross-Domain Awareness**: Related domain impact assessment
- [ ] **Quality Intelligence Integration**: Weekly findings inform approach

---

## AVIATION SAFETY INTEGRATION (Process v3.3.1-Enhanced)

### Landing Protocol Preparation Requirements

#### **Archive Organization During Development**
**Systematic Closure Preparation (Mandatory):**
- [ ] **Execution Log Maintenance**: Real-time documentation with timestamps
- [ ] **Evidence Organization**: All artifacts structured for landing protocol
- [ ] **Quality Documentation**: Evidence completeness tracking throughout
- [ ] **Prevention Documentation**: Safeguard implementation evidence
- [ ] **Handoff Preparation**: TESTER validation requirements documented

#### **Organizational Hygiene Standards**
**Debt Prevention (Mandatory):**
- [ ] **No Scattered Artifacts**: All outputs organized systematically
- [ ] **Real-Time Organization**: Archive structure maintained during development
- [ ] **Template Compliance**: All outputs compatible with landing checklist
- [ ] **Framework Consistency**: v3.3.1-enhanced standards maintained
- [ ] **Emergency Prevention**: Organizational debt accumulation avoided

---

## HISTORICAL ANTI-PATTERNS (CRITICAL AVOIDANCE)

### Problem-Resolution Failures from Previous Sprints

#### **Completion Theater vs. Genuine Resolution**
**NEVER DO (Process v3.3 Discovery):**
```typescript
// These patterns created completion theater without problem resolution
markTaskComplete(); // Without eliminating underlying problems
updateStatus('DONE'); // Without evidence of systematic elimination
closeTicket(); // Without prevention measures implemented
```

**ALWAYS DO (Process v3.3.1-Enhanced):**
```typescript
// These patterns ensure genuine problem resolution
const evidence = await validateElimination(problemCategory);
if (evidence.completenessScore < 0.9) {
    throw new EvidenceInsufficientError('More elimination required');
}
await implementPrevention(problemCategory, evidence.patterns);
```

#### **Interface Hygiene Violations (D-009 Systematic Findings)**
**NEVER DO:**
```typescript
// These patterns from D-009 interface hygiene elimination
const args: any = request.params; // Tool boundary violation
const timestamp = Date.now(); // Inconsistent serialization  
const memory = adapter.get() as any[]; // Memory adapter type bypass
const result = data as ExpectedType; // Dangerous type assertion
```

**ALWAYS DO:**
```typescript
// These patterns prevent interface hygiene problems
const args = validateToolParams(request.params, paramSchema);
const timestamp = new Date().toISOString(); // ISO-8601 format
const memory = adapter.getTypedMemory<MemoryType>();
const result = parseAndValidate(data, resultSchema);
```

#### **Async Handling Mistakes (Systematic Race Conditions)**
**NEVER DO:**
```typescript
// These patterns caused data corruption and race conditions
Promise.all([op1(), op2(), op3()]); // Without error handling
const result = asyncOperation(); // Missing await
setTimeout(() => cleanup(), 100); // Race condition
```

**ALWAYS DO:**
```typescript
// These patterns prevented issues and enable systematic elimination
const results = await Promise.allSettled([op1(), op2(), op3()]);
const result = await asyncOperation();
await delay(100); // Proper async delay
```

---

## PROVEN SUCCESSFUL PATTERNS (Process v3.3 Validated)

### Problem-Resolution Patterns

#### **Systematic Domain Scanning (Review-Prompt-Lib Integration)**
```typescript
// This pattern consistently achieves high evidence completeness
async function scanProblemDomain(domain: string, problemCategory: string): Promise<ProblemBaseline> {
    try {
        const findings = await reviewPromptLib.scanDomain(domain, {
            problemType: problemCategory,
            includeHistorical: true,
            severityFilter: ['P0', 'P1', 'P2']
        });
        
        if (findings.length === 0) {
            logger.info('No problems found in domain', { domain, problemCategory });
            return { instanceCount: 0, baseline: 'clean' };
        }
        
        return {
            instanceCount: findings.length,
            severity: assessSeverity(findings),
            examples: findings.slice(0, 3), // Sample for evidence
            patterns: identifyPatterns(findings),
            baseline: calculateQualityMetrics(findings)
        };
    } catch (error) {
        logger.error('Domain scanning failed', { domain, problemCategory, error });
        throw new ProblemAnalysisError('Failed to establish baseline', error);
    }
}
```

#### **Evidence Completeness Scoring (Consistently Reliable ≥ 0.9)**
```typescript
// This pattern achieves consistent 0.9+ completeness scores in Process v3.3
function calculateEliminationCompleteness(evidence: EliminationEvidence): number {
    const requiredEvidence = [
        'beforeState', 'eliminationProcess', 'afterState', 'prevention'
    ];
    const qualityFactors = [
        'baseline', 'methodology', 'verification', 'safeguards'
    ];
    
    let totalScore = 0;
    let maxScore = 0;
    
    // Required evidence (70% of score)
    for (const requirement of requiredEvidence) {
        maxScore += 0.7 / requiredEvidence.length;
        if (evidence[requirement] && isCompleteEvidence(evidence[requirement])) {
            totalScore += 0.7 / requiredEvidence.length;
        }
    }
    
    // Quality factors (30% of score)  
    for (const factor of qualityFactors) {
        maxScore += 0.3 / qualityFactors.length;
        if (hasHighQualityEvidence(evidence, factor)) {
            totalScore += 0.3 / qualityFactors.length;
        }
    }
    
    return maxScore > 0 ? Math.min(totalScore / maxScore, 1.0) : 0;
}
```

#### **Prevention Implementation (Systematic Safeguards)**
```typescript
// This pattern successfully prevents problem recurrence
async function implementPrevention(
    problemCategory: string, 
    eliminationPatterns: EliminationPattern[]
): Promise<PreventionResult> {
    const safeguards: PreventionMeasure[] = [];
    
    // ESLint rules for automated prevention
    if (problemCategory === 'interface-hygiene') {
        safeguards.push({
            type: 'eslint-rule',
            rule: '@typescript-eslint/no-explicit-any',
            severity: 'error',
            scope: ['src/tools/**', 'src/lib/memory/**']
        });
    }
    
    // Type guards for runtime protection
    for (const pattern of eliminationPatterns) {
        safeguards.push({
            type: 'type-guard',
            function: generateTypeGuard(pattern),
            location: pattern.commonLocations
        });
    }
    
    // Testing requirements
    safeguards.push({
        type: 'test-requirement',
        testSuite: `${problemCategory}-prevention.test.ts`,
        coverage: 'comprehensive'
    });
    
    return { safeguards, tested: true, effective: true };
}
```

---

## IMPLEMENTATION CHECKLIST (Process v3.3.1-Enhanced)

### Pre-Implementation Verification
- [ ] **Problem Category Defined** - Specific quality debt type identified
- [ ] **Evidence Standards Clear** - ≥ 0.9 completeness requirements understood
- [ ] **Historical Patterns Analyzed** - Similar elimination approaches reviewed
- [ ] **Security Requirements Clear** - P0 trust boundaries identified
- [ ] **Prevention Strategy Planned** - Safeguards approach determined
- [ ] **Archive Structure Initialized** - Landing protocol preparation begun

### During Problem Elimination
- [ ] **Systematic Documentation** - Real-time execution log maintenance
- [ ] **Pattern Consistency** - Uniform elimination approach across instances
- [ ] **Evidence Collection** - Before/during/after state capture
- [ ] **Prevention Integration** - Safeguards implemented alongside elimination
- [ ] **Quality Standards Maintained** - Security and type safety preserved
- [ ] **Cross-Domain Awareness** - Related domain impact monitored

### Pre-Handoff Verification
- [ ] **Zero Instances Confirmed** - Systematic scanning validates elimination
- [ ] **Evidence Completeness ≥ 0.9** - Quality standards achieved
- [ ] **Prevention Measures Tested** - Safeguards validated and working
- [ ] **Security Review Complete** - P0 requirements satisfied
- [ ] **Documentation Ready** - TESTER handoff artifacts prepared
- [ ] **Archive Organized** - Landing protocol compatibility verified

---

## HANDOFF REQUIREMENTS (Enhanced Process v3.3.1)

### TESTER Handoff Documentation

#### **Required Artifacts**
- [ ] **Problem Elimination Report**: `[sprint-id]-developer-elimination-v3.3.1.md`
- [ ] **Evidence Validation Requirements**: `[sprint-id]-evidence-requirements-v3.3.1.md`
- [ ] **Prevention Testing Guide**: `[sprint-id]-prevention-testing-v3.3.1.md`
- [ ] **Security Validation**: Evidence of P0 requirement compliance
- [ ] **Quality Evidence**: Elimination proof, prevention validation, completeness scoring

#### **Problem Elimination Report Format**
```markdown
## DEVELOPER PROBLEM ELIMINATION SUMMARY

**Problem Category**: [specific-quality-debt-type]
**Domain**: [primary-domain] + [secondary-domain]  
**Process Framework**: v3.3.1-Enhanced with Aviation Safety Integration
**Elimination Duration**: [actual] minutes (estimated: [estimated])

**Problems Eliminated**:
- **Instance Count**: [before] → 0 (verified)
- **Pattern 1**: [Specific elimination approach and outcome]
- **Pattern 2**: [Specific elimination approach and outcome]
- **Evidence Score**: [score] / 1.0 (≥ 0.9 achieved)

**Security Compliance**:
- [ ] Trust Boundaries: [Specific validations maintained during elimination]
- [ ] Async Safety: [Concurrency protections preserved]
- [ ] Type Safety: [Zero any types confirmed after elimination]
- [ ] Interface Hygiene: [Tool boundary protection maintained]

**Prevention Measures Implemented**:
- [Safeguard 1]: [ESLint rule/type guard/test requirement]
- [Safeguard 2]: [Where implemented and how tested]
- [Monitoring]: [Continuous prevention approach]

**Evidence for TESTER Validation**:
- [Before State]: [Baseline metrics and problem instances]
- [Elimination Process]: [Methodology and systematic approach]
- [After State]: [Zero instances with verification method]
- [Prevention Tests]: [Safeguard validation requirements]

**Cross-Domain Impact**: [Assessment of related domains - NO REGRESSION]
**Quality Gate Status**: ALL PASSED
**Evidence Completeness**: ≥ 0.9 ACHIEVED
**Ready for TESTER validation**: YES with systematic evidence
```

---

## CONTINUOUS IMPROVEMENT (Process v3.3.1-Enhanced)

### Performance Tracking
- [ ] **Problem Resolution Efficiency**: Time vs systematic elimination achieved
- [ ] **Evidence Quality Consistency**: Completeness scores maintained ≥ 0.9
- [ ] **Prevention Effectiveness**: Safeguard success rate tracking
- [ ] **Cross-Domain Impact**: Regression prevention rate

### Learning Documentation
- [ ] **Successful Elimination Patterns**: Approaches worth systematic reuse
- [ ] **Prevention Strategy Effectiveness**: Safeguards that successfully prevent recurrence
- [ ] **Evidence Collection Improvements**: Methods to enhance completeness scoring
- [ ] **Framework Evolution**: Process v3.3.1-enhanced effectiveness assessment

---

## Template Evolution History
- **v3.3.1-enhanced (2025-09-06)**: Added aviation safety integration, problem-resolution standards, evidence requirements
- **v3.2.x (archived)**: Task-completion framework with quality gates
- **v3.1.x (archived)**: Basic development execution framework

## Usage Notes
- **Current Status**: Active guardrails for all Process v3.3.1-Enhanced DEVELOPER role execution
- **Problem-Resolution Focus**: Systematic elimination vs task completion orientation
- **Evidence Standards**: Mandatory ≥ 0.9 completeness scoring
- **Aviation Safety**: Landing protocol preparation integrated throughout

---
*Template Version: v3.3.1-enhanced*  
*Last Updated: 2025-09-06*  
*Framework Compatibility: Process v3.3.1-Enhanced (Aviation Safety Integration)*  
*Integration: Works with TESTER-GUARDRAILS.md and REVIEWER-GUARDRAILS.md for systematic quality assurance*

**Framework Integration**: This guardrails file integrates with TESTER-GUARDRAILS.md and REVIEWER-GUARDRAILS.md to provide systematic quality assurance throughout Process v3.3.1-enhanced execution with aviation safety landing protocol.

**Historical Context**: Security requirements and anti-patterns derived from D-001 through D-014 domain analysis, enhanced with D-009 interface hygiene systematic findings, ensure previously identified vulnerabilities and completion theater patterns don't reoccur.

**Process Authority**: DEVELOPER role maintains problem-resolution autonomy while following systematic framework for security, quality, evidence collection, and organizational hygiene with aviation safety integration.
