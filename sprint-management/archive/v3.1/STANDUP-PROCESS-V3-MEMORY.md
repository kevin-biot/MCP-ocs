# STANDUP PROCESS v3 - Security-Integrated ADR-Aware Morning Protocol

**TRIGGER**: Human says "Let's do our daily standup" or "Morning standup for MCP-ocs"

## PROCESS STEPS (Enhanced for Security Guardrails):

1. **SEARCH MEMORY**: Retrieve this process (standup-process-memory-v3) for latest version
2. **READ ADR STATUS**: docs/architecture/ADR-STATUS-DYNAMIC.md (get active ADRs and implementation status)
3. **READ BACKLOG STATUS**: sprint-management/backlog/backlog-overview.md (get current domain priorities)
4. **SECURITY BOUNDARY ANALYSIS**: Assess P0/P1/P2 security requirements for available tasks
5. **IDENTIFY EPIC**: Determine which ADR/Epic the current sprint serves
6. **READ TASKS**: sprint-management/tasks-current.md (get available tasks with security alignment)
7. **READ YESTERDAY**: sprint-management/completion-logs/*-$(yesterday).md (check previous results)
8. **SEARCH PATTERNS**: Previous standup decisions and implementation outcomes
9. **ANALYZE WITH SECURITY CONTEXT**: Task priorities based on security risk assessment
10. **GENERATE SECURITY-INTEGRATED CODEX PROMPT**: Role-specific prompt with mandatory/advisory guardrails

## ENHANCED ANALYSIS (v3 Security Integration):

### Security Risk Assessment:
- **P0 Tasks (Hard Gates)**: Trust boundaries, async correctness - Mandatory security validation
- **P1 Tasks (Advisory Gates)**: Interface hygiene, API contracts - Strong guidance with warnings
- **P2 Tasks (Guidance)**: Module hygiene, date/time safety - Best practices recommendations

### Task Selection from 86-Task Backlog:
- Extract 2-4 tasks daily from backlog domains (D-001 through D-014)
- Prioritize P0 domains first: D-001 (Trust Boundaries), D-005 (Async Correctness)
- Map tasks to ADR requirements (e.g., TASK-001-A → ADR-020 security patterns)
- Consider task dependencies and security validation requirements

### Security Validation Requirements:
- Check ADR implementation status to identify security gaps
- Prioritize tasks that address critical security boundaries
- Evaluate security debt vs hygiene progress
- Consider architectural security dependencies between tasks

## RECOMMENDATION FORMAT v3 (Security-Enhanced):

- **Active ADR/Epic**: [ADR-XXX] driving current sprint objectives
- **Security Priority**: [P0/P1/P2] based on risk assessment
- **Primary Task**: [TASK-ID] from backlog because [security alignment + ADR requirements]
- **Secondary Task**: [TASK-ID] from backlog because [architectural security value]
- **Daily Focus**: [security domain] based on [backlog priorities + critical findings]
- **Session Duration**: [time] based on [complexity + security validation needs]
- **Security Guardrails**: [mandatory/advisory requirements from ADR-020]
- **Validation Requirements**: [specific security tests/checks needed]
- **Risks to Watch**: [security boundary concerns + previous implementation issues]

## SECURITY-INTEGRATED CODEX PROMPT GENERATION:

### For DEVELOPER:
- **Mandatory Security Checklist** (P0 tasks):
  - [ ] Input validation schemas defined and implemented
  - [ ] Authentication requirements identified and coded
  - [ ] Rate limiting considerations addressed
  - [ ] Error boundary implementation with proper HTTP status codes
  - [ ] Trust boundary analysis complete and validated
- **ADR-020 Compliance Requirements** from active security guidelines
- **Technical patterns** to follow (e.g., Zod validation, structured errors)
- **Testing requirements** including negative security tests

### For TESTER:
- **Security Validation Criteria**: 
  - Malformed input testing for all trust boundaries
  - Authentication bypass attempt validation
  - Rate limiting effectiveness verification
- **ADR validation criteria** (determinism, security completeness scores)
- **Regression testing** based on security patterns from backlog domains
- **Weekly security review preparation** requirements

### For REVIEWER:
- **Security Compliance Assessment**: Validation that mandatory security requirements met
- **ADR-020 adherence evaluation**: Risk-based enforcement verification
- **Architectural security consistency**: Alignment with security patterns
- **Technical debt evaluation**: Security improvements vs new security risks

## CONTEXT SOURCES v3 (Security-Enhanced):

- **Security Risk Assessment**: Backlog domain priorities and P0/P1/P2 categorization
- **ADR-020 Requirements**: Security guideline mandatory vs advisory requirements  
- **Epic-to-security mapping**: Task alignment with security architectural goals
- **Sprint objectives** tied to security hygiene sweep goals
- **Current task specifications** with security acceptance criteria
- **Yesterday's completion status** including security validation results
- **Historical patterns** of security implementation complexity
- **Security boundary dependencies** between domains and tasks

## WEEKLY SECURITY REVIEW INTEGRATION:

- **Pre-Weekly Review**: Compile security validation metrics for human analysis
- **Post-Weekly Review**: Process human security findings into backlog priority updates
- **Scrum Master Analysis**: Pattern recognition in security implementation quality
- **Priority Adjustments**: Update daily task selection based on weekly security discoveries

## OUTPUT: 

Security-integrated architecture-aligned standup with:
- Risk-based security validation requirements
- ADR-020 compliant task prioritization  
- Mandatory vs advisory security enforcement based on P0/P1/P2 classification
- Role-specific Codex prompts with integrated security guardrails
- Ready for copy-paste execution with built-in security validation

---

**Memory Storage Key**: standup-process-memory-v3  
**Integration Points**: ADR-020, backlog domains D-001 through D-014, weekly security review cycle  
**Last Updated**: 2025-08-30
