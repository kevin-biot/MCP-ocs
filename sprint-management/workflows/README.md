# Sprint Workflows - Process v3.2 High-Velocity Model

## Primary Sprint Initiation

### sprint-planning-interactive-checklist-v3.2.md ⭐ **MASTER WORKFLOW**
**Trigger Phrase**: `"Process v3.2 sprint planning"`
**Purpose**: Complete sprint planning and CODEX prompt generation
**Duration**: 8-item aviation checklist → generates CODEX CLI prompt
**Usage**: Any time you're ready for next focused sprint (multiple per day possible)

## High-Velocity Sprint Model

### Sprint Paradigm:
- **Focused 45-minute sprints** (TIER 1 complexity target)
- **Multiple sprints per day** when velocity is high
- **Complete archive cycle** after each sprint
- **"Standup" = Virtual concept** for sprint initialization, not time-bound

### Process Flow:
```
"Process v3.2 sprint planning" → Interactive Pilot Checklist → CODEX Sprint → Archive
[Repeat as capacity allows]
"Process v3.2 sprint planning" → Next Sprint → Archive
```

## Archive Naming Convention

### Multiple Daily Sprints:
```
sprint-YYYY-MM-DD-[sequence]-[domain-or-epic-name]/
└── final-sprint-status.md

Examples:
├── sprint-2025-09-02-01-architecture-validation/
├── sprint-2025-09-02-02-template-hygiene/
├── sprint-2025-09-02-03-security-review/
```

### Epic-Based Sprints:
```
d-002-epic-XXX-[description]/
└── final-sprint-status.md

Example:
├── d-002-epic-004-architecture-validation/
```

## Legacy Archive
- `../archive/legacy-v3.1/` contains old daily standup files from multi-day sprint model
- These files assumed ongoing sprints with daily check-ins (incorrect paradigm)
