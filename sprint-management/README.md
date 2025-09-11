# Sprint Management Framework - Usage Guide

## Operator One‑Pager (Process 3.3.x)

Use this as a daily memory refresh to run the sprint with minimal friction.

1) Working Truth vs Archives
- Work on: `release/v0.9.0-beta`
- Docs/archives: `main` (receive docs from beta at EOD)

2) Daily Flow (beta)
- Update status/tools if scope changed:
  - Edit: `sprint-management/features/status.json`, `sprint-management/features/planned-tools.json`
  - Generate tables: `npm run sprint:status` and `npm run sprint:tools`
- EOD export (one shot): `npm run process:sync-docs`
- Push beta: `git push origin release/v0.9.0-beta`
- Manually update main: open a docs‑only PR from beta → main (your call)

3) Sprint Close (3.3.2 standard = 20 artifacts)
- Prepare archive dir under features/archives or maintenance/archives
- Validate presence: `npm run sprint:validate-closure -- <archive-dir>`
- Open PR to main: title suggestion `docs(archives): <sprint-id> closure + daily sync`

4) Quick Commands
- Status tables → `npm run sprint:status`
- Tool inventory → `npm run sprint:tools`
- Indices/registry → `npm run archives:index`
- All EOD docs → `npm run process:sync-docs`
- Closure gate → `npm run sprint:validate-closure -- <archive-dir>`

### Optional Context Layer (Manual, Non‑Blocking)
- When the 17 required artifacts are done, you may trigger a verbose context report for richer history.
- Store under the sprint archive at `process-artifacts/verbose-context.md` and optionally `process-artifacts/context-index.json`.
- Must be evidence‑anchored (link to artifacts/logs/commits/ADRs) and include timeline + tool/flag inventory.
- Helper: `npm run sprint:context:skeleton -- <archive-dir>` seeds the files from the template.

### Selective Enrichment Pilot (Optional, v3.3.3)
- After deterministic closure (17 artifacts validated), a selective enrichment step can be run (timebox 45–90 min total).
- Targets: 09‑outstanding‑work‑analysis.md (actionable packages), sprint‑retrospective.md (Context Abstract), 07‑key‑decisions‑log.md (Why/Impact).
- Edits must be confined to <!-- ENRICHMENT: begin/end --> zones and remain evidence‑anchored (artifacts/logs/ADRs/commits/code).
- Guide: `sprint-management/process/ENRICHMENT-PILOT-V3.3.3.md`.

Claude Prompt (copy/paste)
```
You are the AI Scrum Master (Selective Enrichment Pilot, v3.3.3 add‑on).
Use vector memory first to gather added context: search sprint memory/logs for relevant evidence before edits.

Targets (Phase‑1), edit only within ENRICHMENT zones:
- sprint‑retrospective.md → Add/enhance Context Abstract (≤10 bullets), with ≥1 evidence anchor.
- analytical‑artifacts/07‑key‑decisions‑log.md → Add/enhance Why/Impact pairs, with ≥1 evidence anchor.
- analytical‑artifacts/09‑outstanding‑work‑analysis.md → If needed, refine work packages (test paths/metrics schema), with ≥1 evidence anchor.

Rules:
- Edit only between <!-- ENRICHMENT: begin/end --> markers; do not change baseline outside zones.
- Append at end of each zone: “Section updated by Claude (AI Scrum Master) based on baseline Codex findings and deterministic artifacts”.
- Timebox: 45–90 minutes total; keep concise and evidence‑anchored.

Evidence anchors to use:
- logs/sprint‑execution.log; docs/reports/technical/mcp‑ocs‑memory‑acceptance‑<date>.md; docs/ops/memory‑ops‑guide.md; ADR‑003/014/006/010/024; relevant code/commit refs.

Summary:
- Update or create process‑artifacts/enrichment‑summary‑YYYY‑MM‑DD.md with: targets edited, anchors used, elapsed time (est), and zone‑only confirmation.
```

5) Version Standards (clarity)
- v3.3.2: 20‑artifact closure is current (preferred)
- v3.3.1: 11‑artifact minimum is legacy; upgrade when possible
- See: `sprint-management/docs/VERSION-STANDARDS.md`

6) Kick off Claude (AI Scrum Master)
- Goal: start standup/kickoff with current context and files
- Copy/paste this into Claude (adjust sprint id as needed):

```
You are the AI Scrum Master for Process v3.3.2. Help run a problem‑resolution sprint today.

Working branch: release/v0.9.0-beta
Repository root: /Users/kevinbrown/MCP-ocs

Read these for process context:
- sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.2.md
- sprint-management/templates/current/role-context-developer.md
- sprint-management/templates/current/role-context-tester.md
- sprint-management/templates/current/role-context-reviewer.md

Read current status sources and summarize plan of day:
- sprint-management/features/status.json
- sprint-management/features/planned-tools.json

Constraints:
- Keep changes on release/v0.9.0-beta; docs go to main via my manual PR at EOD
- Use npm scripts for status/tools generation when proposing EOD actions

Tasks now:
1) Propose today’s sprint focus from status.json
2) List the 2–3 highest‑value tools/workflows to exercise
3) Confirm the minimal artifacts we’ll produce today toward 20‑artifact closure
```

—


## Overview
This framework provides structured, role-based AI agent coordination for MCP-ocs development with daily task management, progress tracking, and quality assurance.

## Daily Workflow

### 1. Morning Setup (Human + Claude)
```bash
# Validate framework readiness
bash scripts/validate-sprint.sh

# Create today's files
bash scripts/setup-sprint-day.sh
```

### 2. Development Execution (Agent Sessions)

#### DEVELOPER Session (Codex)
```bash
# Start with today's role context
codex --context sprint-management/active-tasks/role-context-developer-$(date +%Y-%m-%d).md

# Or manually reference:
# Read: sprint-management/active-tasks/role-context-developer-YYYY-MM-DD.md
# Update: sprint-management/active-tasks/task-status-YYYY-MM-DD.md
# Create: sprint-management/completion-logs/dev-completion-log-YYYY-MM-DD.md
```

#### TESTER Session (Codex)
```bash
# Start after DEVELOPER completion
codex --context sprint-management/active-tasks/role-context-tester-$(date +%Y-%m-%d).md

# Or manually reference:
# Read: sprint-management/completion-logs/dev-completion-log-YYYY-MM-DD.md
# Update: sprint-management/active-tasks/task-status-YYYY-MM-DD.md  
# Create: sprint-management/completion-logs/test-completion-log-YYYY-MM-DD.md
```

#### REVIEWER Session (Codex)
```bash
# Start after TESTER completion
codex --context sprint-management/active-tasks/role-context-reviewer-$(date +%Y-%m-%d).md

# Or manually reference:
# Read: both dev and test completion logs
# Update: sprint-management/active-tasks/task-status-YYYY-MM-DD.md
# Create: sprint-management/completion-logs/review-completion-log-YYYY-MM-DD.md
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
