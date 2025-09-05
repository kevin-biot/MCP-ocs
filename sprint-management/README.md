# Sprint Management Framework - Usage Guide

## Overview
This framework provides structured, role-based AI agent coordination for MCP-ocs development with daily task management, progress tracking, and quality assurance.

## Daily Workflow

### 1. Morning Setup (Human + Claude)
```bash
# Load sprint context with quality intelligence
bash scripts/get-sprint-context.sh --domain={target_domain} --include-weekly-findings

# Collect current sprint metrics
bash scripts/collect-sprint-metrics.sh
```

### 2. Development Execution (Agent Sessions)

#### DEVELOPER Session (Codex) - Process v3.3
```bash
# Start with problem-resolution role context
codex --context sprint-management/templates/role-context-developer-v3.3-template.md

# Or manually reference:
# Read: sprint-management/templates/DAILY_STANDUP_CHECKLIST_V3.3.md
# Read: sprint-management/templates/CODEX_SYSTEMATIC_TEMPLATE_V3.3.md
# Create: sprint-management/execution-logs/problem-resolution-log-YYYY-MM-DD.md
```

#### TESTER Session (Codex) - Process v3.3
```bash
# Start after DEVELOPER problem-resolution completion
codex --context sprint-management/templates/role-context-tester-v3.3-template.md

# Or manually reference:
# Read: sprint-management/execution-logs/problem-resolution-log-YYYY-MM-DD.md
# Create: sprint-management/completion-logs/evidence-validation-v3.3-YYYY-MM-DD.md
```

#### REVIEWER Session (Codex) - Process v3.3
```bash
# Start after TESTER evidence validation completion
codex --context sprint-management/templates/role-context-reviewer-v3.3-template.md

# Or manually reference:
# Read: both problem-resolution and evidence-validation logs
# Create: sprint-management/completion-logs/quality-gate-assessment-v3.3-YYYY-MM-DD.md
```

### 3. Evening Review (Human + Claude)
```bash
# Review all completion logs
ls sprint-management/completion-logs/*-$(date +%Y-%m-%d).md

# Archive completed day (if sprint complete)
mkdir sprint-management/archive/$(date +%Y-%m-%d)
mv sprint-management/active-tasks/*-$(date +%Y-%m-%d).md sprint-management/archive/$(date +%Y-%m-%d)/
```

## File Structure

```
sprint-management/
├── tasks-current.md                    # Master task definitions (human-owned)
├── active-tasks/                       # Today's working files
│   ├── task-status-YYYY-MM-DD.md      # Task progress tracking
│   ├── task-changelog-YYYY-MM-DD.md   # Change log entries
│   ├── role-context-developer-YYYY-MM-DD.md   # DEVELOPER daily assignment  
│   ├── role-context-tester-YYYY-MM-DD.md      # TESTER daily assignment
│   └── role-context-reviewer-YYYY-MM-DD.md    # REVIEWER daily assignment
├── completion-logs/                    # Session output logs
│   ├── dev-completion-log-YYYY-MM-DD.md       # DEVELOPER session results
│   ├── test-completion-log-YYYY-MM-DD.md      # TESTER session results
│   └── review-completion-log-YYYY-MM-DD.md    # REVIEWER session results
├── archive/                           # Historical records
│   └── YYYY-MM-DD/                   # Previous day's complete files
├── templates/                         # File generation templates
├── roles/                            # Role definition files
└── scripts/                          # Automation scripts
```

## Role Responsibilities

### DEVELOPER Role
- **Focus**: Implement assigned tasks efficiently within sprint timeline
- **Boundaries**: Use existing patterns, don't over-engineer, maintain test coverage
- **Output**: Working implementations with tests and clear handoff notes

### TESTER Role  
- **Focus**: Validate implementations meet acceptance criteria and quality standards
- **Boundaries**: Test only what was implemented, identify issues clearly
- **Output**: Pass/fail determinations with specific reproduction steps

### REVIEWER Role
- **Focus**: Assess code quality, architecture alignment, and release readiness  
- **Boundaries**: Review only tested implementations, provide actionable feedback
- **Output**: Approval decisions with rationale and improvement recommendations

## Key Features

### 1. Bounded Role Responsibility
Each role has specific files to read/write, preventing scope creep and ensuring focus.

### 2. Git Commit Traceability
All completion logs must reference specific git commits for verification.

### 3. Daily File Rotation
Clean daily setup prevents file bloat and maintains clear session boundaries.

### 4. Multi-LLM Review Pipeline
Framework supports review by different AI models for comprehensive quality assessment.

### 5. Human Oversight Gates
Human review at sprint planning, daily wrap-up, and final approval stages.

## Task Definition Format

```markdown
### TASK-XXX: [Task Name]
**Priority**: HIGH/MEDIUM/LOW
**Assigned Role**: DEVELOPER/TESTER/REVIEWER
**Estimated Effort**: X hours
**Status**: NOT_STARTED/IN_PROGRESS/COMPLETED/BLOCKED

**Description**: [Clear description of what needs to be done]

**Acceptance Criteria**:
- [ ] Specific criterion 1
- [ ] Specific criterion 2
- [ ] Specific criterion 3

**Technical Details**:
- **Files to Modify**: [List of files]
- **Dependencies**: [Any dependencies]
- **ADR References**: [Relevant ADRs]

**Definition of Done**:
- [Clear completion criteria]
```

## Quality Gates

### DEVELOPER Gates:
- [ ] All assigned tasks implemented with working code
- [ ] All commits include tests and pass existing test suite
- [ ] Code follows existing patterns and conventions
- [ ] Clear handoff information for TESTER

### TESTER Gates:
- [ ] All implemented features thoroughly tested
- [ ] Clear pass/fail determination with evidence
- [ ] Issues documented with reproduction steps
- [ ] Handoff information complete for REVIEWER

### REVIEWER Gates:  
- [ ] Comprehensive quality assessment completed
- [ ] Architecture alignment verified
- [ ] Security implications assessed
- [ ] Clear recommendation with rationale

## Troubleshooting

### Common Issues:

**Daily files not created**:
```bash
bash scripts/setup-sprint-day.sh
```

**Validation failures**:
```bash
bash scripts/validate-sprint.sh
# Fix any missing files or directories
```

**Git conflicts**:
- Each role works on different files to minimize conflicts
- Use frequent commits with clear messages
- Reference commits in completion logs for traceability

**Role confusion**:
- Each role has a specific definition file in `sprint-management/roles/`
- Daily context files provide specific assignments
- Stick to assigned boundaries, escalate scope questions

## Success Metrics

### Daily Success:
- All assigned tasks completed within role boundaries
- Quality gates passed for each role
- Clear handoff between roles achieved

### Sprint Success:
- Sprint objectives achieved (e.g., template hygiene completion)
- Quality maintained throughout (all tests passing)
- Technical debt reduced, not increased
- Clear documentation and knowledge transfer

---

*This framework transforms ad-hoc AI assistance into systematic, accountable development with clear roles, boundaries, and quality assurance.*
