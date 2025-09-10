# Daily Repeatable Task Template (Process v3.3.2)

Use this checklist every sprint day to keep Claude (AI Scrum Master) + Codex (coder) aligned.

## Morning
- [ ] Review CONTROL.md and sprint.json
- [ ] Claude: run kickoff/standup prompts (prompts/standup.md)
- [ ] Codex: run protocol smoke (sequential/beta, stdout=0)
- [ ] Codex: run memory smoke (JSON-only)

## During Day
- [ ] Update execution logs (AI + developer)
- [ ] Keep CONTROL.md checklist current
- [ ] Keep scope bounded; reference role guardrails

## EOD
- [ ] Summarize progress in execution-log-ai.md
- [ ] Codex: `npm run process:sync-docs` (on beta → main)
- [ ] Verify archives indices + registry refreshed on main
- [ ] Prep next standup outline
