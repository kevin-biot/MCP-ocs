# DAILY STANDUP v3 ACCELERATED PROCESS - Memory Template

**TRIGGER PHRASE**: "Claude we are doing daily standup sprint planning" OR "daily standup"

## AUTOMATED RESPONSE SEQUENCE:

### PHASE 1: CONTEXT RECONSTRUCTION (File Evidence Analysis)

**Completion Status Analysis:**
- Read `sprint-management/completion-logs/[yesterday].md` for yesterday's work
- Check recent git commits for actual implementation progress
- Scan `sprint-management/tasks-current.md` for active work status
- Assess any blockers or issues from previous session

**Priority Assessment:**
- Read `sprint-management/backlog/backlog-overview.md` for domain status
- Scan individual domain READMEs in `/domains/d-001-*` through `/domains/d-014-*`
- Check `docs/architecture/ADR-STATUS-DYNAMIC.md` for ADR alignment
- Apply security risk assessment (P0/P1/P2 classification)

**Pattern Recognition:**
- Analyze historical completion logs for velocity patterns
- Assess task complexity vs completion time trends
- Review security validation success rates from previous implementations
- Identify recurring blockers or efficient implementation patterns

### PHASE 2: TASK SELECTION RECOMMENDATION

**Output Format:**
```
STANDUP v3 ANALYSIS COMPLETE - [DATE]

CONTEXT RECONSTRUCTION:
Yesterday: [specific completion status from logs]
Current Priority: [domain focus based on backlog analysis]
Security Status: [P0/P1 critical items remaining]
Velocity Pattern: [implementation speed and quality observations]

RECOMMENDED TASK SELECTION:
Primary: [TASK-ID] from [DOMAIN] - [reasoning with security context and file paths]
Secondary: [TASK-ID] from [DOMAIN] - [alternative if primary blocked]
Focus Level: [P0/P1/P2] requiring [mandatory/advisory/guidance] security validation

IMPLEMENTATION CONTEXT:
Files Affected: [specific file paths from domain README]
Security Requirements: [mandatory checklist items or advisory guidance]
Estimated Complexity: [based on historical patterns]
Dependencies: [any prerequisite tasks or blockers]

AGREEMENT CHECK: Does this selection align with your priorities and capacity?
```

### PHASE 3: CODEX PROMPT GENERATION (After Agreement)

**Complete Implementation Prompt Structure:**
```bash
# MCP-ocs DAILY SPRINT TASK: [TASK-ID]
# SECURITY CLASSIFICATION: [P0/P1/P2] - [mandatory/advisory/guidance]
# DOMAIN: [Domain Name and Epic Context]
# ESTIMATED DURATION: [based on complexity analysis]

## SECURITY CHECKLIST (if P0):
- [ ] Input validation schemas defined and implemented
- [ ] Authentication requirements identified and coded  
- [ ] Rate limiting considerations addressed
- [ ] Error boundaries with proper HTTP status codes
- [ ] Trust boundary analysis complete

## FILES TO MODIFY:
[Exact file paths from domain analysis]

## IMPLEMENTATION PATTERN:
[Code examples and patterns from domain README]

## VALIDATION REQUIREMENTS:
[Testing and security validation steps]

## GIT COMMIT FORMAT:
feat(domain): [specific change description]

[Detailed implementation instructions with line numbers, before/after examples, and validation steps]
```

## MEMORY STORAGE KEYS:

**File Location**: `/sprint-management/DAILY-STANDUP-v3-ACCELERATED.md`  
**Vector Memory Tags**: ['daily-standup-v3', 'accelerated-process', 'security-integrated', 'backlog-extraction', 'codex-prompt-generation']  
**Retrieval Phrase**: "daily standup sprint planning process v3"

## PROCESS OPTIMIZATION NOTES:

**Efficiency Gains:**
- No human file reading required - automated evidence gathering
- Parallel context reconstruction while human formulates trigger
- Single agreement checkpoint before final prompt generation
- Complete copy-paste Codex prompt ready for terminal execution

**Quality Assurance:**
- Security risk assessment integrated into every task selection
- Historical pattern recognition for realistic complexity estimation
- ADR alignment verification for architectural consistency
- Dependency checking to prevent blocked implementations

**Continuous Improvement:**
- Process effectiveness tracked through completion log analysis
- Task selection accuracy measured against actual completion patterns
- Security validation effectiveness monitored for guideline refinement
- Velocity observations inform future task complexity assessment

---

**CRITICAL SUCCESS FACTORS:**
1. Reliable file evidence reconstruction without human input gathering
2. Accurate task prioritization based on security risk and backlog status
3. Complete Codex prompts requiring no additional context hunting
4. Seamless daily execution with minimal human cognitive overhead
5. Security-integrated workflow preventing architectural debt accumulation

**UPDATE FREQUENCY**: Process memory updated based on weekly security review findings and continuous improvement observations.
