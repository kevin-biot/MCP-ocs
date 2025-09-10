# Sprint Management Framework — Process 3.3.x Usage Guide

## Overview
Process 3.3.x runs file‑only sprints with Claude (AI Scrum Master) and Codex (coder). Beta is the live work branch; main is canonical for archives. The Sprint Kit provides a cockpit (CONTROL.md, sprint.json, prompts) so you never lose context.

## Daily Flow (beta)
1) Start a sprint with the Sprint Kit
   - Copy `sprint-management/templates/sprint-kit-3.3.x/` to `sprint-management/active/<sprint-id>-<slug>/`
   - Rename `sprint.json.template` → `sprint.json` and fill fields
   - Save `CONTROL.md.template` → `CONTROL.md` and use it as the checklist
   - Use prompts in `prompts/` (kickoff-claude.md, kickoff-codex.md, standup.md, eod.md)

2) Execute and log
   - Claude/Codex update execution logs under `artifacts/`
   - Keep CONTROL.md checkboxes current
   - Codex runs protocol/memory smokes as needed

3) End‑of‑Day (EOD)
   - On beta: `npm run process:sync-docs` (syncs to main and auto‑refreshes archive indices + registry)
   - On beta: `npm run archives:index:links` (refresh link indices to main archives)

## Branch Discipline
- `release/*` (beta): code + daily active docs/logs; EOD sync to main
- `main`: documentation + sprint management; canonical home for archives

## Directory Layout (high‑level)
```
sprint-management/
├── features/
│   ├── backlog/   ├── active/   └── archives/
├── maintenance/
│   ├── backlog/   ├── active/   └── archives/
├── templates/
│   ├── current/           # curated role templates (v3.3.1)
│   ├── sprint-kit-3.3.x/  # file‑only sprint cockpit (Claude‑friendly)
│   └── archives/          # historical templates (date‑stamped)
└── logs/sprint-execution.log
```

## Active Templates (use these)
- `sprint-management/templates/current/`
  - role-context-developer.md, role-context-reviewer.md, role-context-tester.md (v3.3.1)
  - DAILY_STANDUP_CHECKLIST_V3.3.1-ENHANCED.md
  - daily-repeatable-task-template-v3.3.2.md
- `sprint-management/templates/sprint-kit-3.3.x/`
  - CONTROL.md.template, sprint.json.template, ROLE-GUARDRAILS.md
  - prompts/ (kickoff-claude, kickoff-codex, standup, eod)
  - artifacts/ placeholders

## Quick Commands
- EOD sync (beta → main): `npm run process:sync-docs`
- Refresh link indices (beta): `npm run archives:index:links`
- Refresh local archive indices (main): `npm run archives:index`
- Generate consolidated registry (main): `node scripts/archives/generate-archive-registry.mjs`
- Sprint status summary (writes STATUS.md): `npm run sprint:status`
- Validate closure essentials: `npm run sprint:validate-closure`

## Closure & Archives
- Before archiving, ensure CONTROL.md is complete and the 20 artifacts are present (use `sprint:validate-closure`).
- Archives live under domain folders on main:
  - `sprint-management/features/archives/{sprint-id}-{name}-{YYYY-MM-DD}/`
  - `sprint-management/maintenance/archives/{sprint-id}-{name}-{YYYY-MM-DD}/`
- Indices and registry are auto‑refreshed at EOD via `process:sync-docs`.

## Links
- Template Guide (3.3.2): `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.2.md`
- Template Infra Index: `sprint-management/templates/TEMPLATE-INFRASTRUCTURE-INDEX.md`
- Archives Indices: `sprint-management/features/archives/INDEX.md`, `sprint-management/maintenance/archives/INDEX.md`
- Template Registry: `sprint-management/templates/registry.json`

This readme reflects the simplified 3.3.x process: one cockpit (Sprint Kit), clear branch roles, and automated EOD archival hygiene.
