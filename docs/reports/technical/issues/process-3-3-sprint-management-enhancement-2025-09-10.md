Title: Process 3.3: Sprint management refinement (post-sprint assessment and guardrails)

Type: enhancement
Labels: enhancement, process, scrum, sprint

Summary
Run the current sprint using the existing process (3.2), then capture gaps and codify a lean Process 3.3 that keeps momentum while adding guardrails for AI-led sprints (Claude Scrum Master + Codex Dev/Tester). Focus on templates and rituals that improve outcomes without slowing coding.

Context
- Avoid process paralysis: keep 3.3 short (1–2 pages), easy to adopt (< 90 min), and default to coding when inputs are sufficient.
- Use 3.2 for the next sprint as-is to generate real feedback; then refine.

Goals
- Define a crisp Sprint Charter + Inputs checklist that the AI Scrum Master can enforce at kickoff.
- Add guardrails for protocol safety, feature flags, and file-scope limits.
- Standardize plan updates (one in_progress step), preamble etiquette, and checkpoint summaries.
- Provide a tiny Exit Checklist (Definition of Done) and a Retro template to capture improvements.

Scope (deliverables)
1) PROCESS_3.3.md (1–2 pages):
   - Sprint Charter (Goal/Non-Goals/Timebox/WIP)
   - Inputs Checklist (Def. of Ready): issues, ACs, tests, rollback, flags, env/config, constraints
   - Roles: AI Scrum Master, AI Dev/Tester, Human PO/Reviewer
   - Kickoff script (10–15m): confirm scope, risks, exit criteria
   - Guardrails: protocol stdout ban, beta isolation, flags default-off, file scope
   - Execution workflow: update_plan usage, preambles, evidence logging
   - Exit Checklist: ACs, tests, smoke, docs, rollback
2) Kickoff checklist (one page) Claude reads/runs at sprint start
3) Scope-change ledger + decision log mini-templates
4) Retro form (brief, focused on impact over ceremony)

Non-Goals
- No heavy process framework or tooling migration
- No rigid ceremony that blocks coding; prefer defaults and checklists
- No change to current sprint (3.2) beyond capturing data for 3.3

Acceptance Criteria
- PROCESS_3.3.md, kickoff checklist, ledger/decision templates, and retro form drafted and merged
- Adopted in a pilot sprint; checkpoint and closeout summaries captured
- Retro outcomes feed a small backlog of process tweaks (label: process-debt)

Success Measures
- Time-to-first-PR ≤ same as 3.2
- Fewer scope drifts (tracked via scope-change ledger)
- Protocol violations reduced (stdout smoke always run)

References
- Readiness report: docs/reports/technical/mcp-ocs-memory-system-consolidation-report-2025-09-10.md
- Day‑1 TODO: docs/reports/technical/mcp-ocs-memory-system-consolidation-todo-2025-09-10.md
- Enrichment pilot: docs/reports/technical/memory-enrichment-pilot-design-2025-09-10.md
- Vector memory issues: #31, #32
- Config enhancement: #33

