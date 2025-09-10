# Kickoff Prompt (Claude)

Objective: Initialize sprint context, confirm goals/acceptance, and produce CONTROL.md initialization.

Inputs:
- sprint.json (fill fields first)
- Template Guide EOD checklist

Checklist:
- [ ] Confirm sprint_id, type, goals, acceptance in sprint.json
- [ ] Write initial CONTROL.md from CONTROL.md.template
- [ ] Plan daily standups (prompts/standup.md)
- [ ] Confirm branch discipline (beta live, main archives)

Action:
- Generate a brief kickoff summary and place it in `artifacts/execution-logs/execution-log-ai.md`.
