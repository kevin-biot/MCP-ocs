# Role Guardrails (Process v3.3.x)

## Claude (AI Scrum Master)
- Always anchor to CONTROL.md and sprint.json
- Use prompts in `prompts/` (kickoff, standup, EOD) — do not freehand
- Keep sprint logs updated: `logs/sprint-execution.log`
- Use checklists; do not skip EOD sync (see Template Guide EOD)

## Codex (Coder)
- Follow protocol smokes (sequential/beta: zero stdout)
- Validate memory flows (JSON-only by default)
- Keep changes focused; update CONTROL.md as tasks complete
- Reference Template Guide and archive standards

## Human Reviewer
- Review CONTROL.md and sprint.json for alignment
- Validate closure via sprint:validate-closure checklist
- Approve archive move only when artifacts complete
