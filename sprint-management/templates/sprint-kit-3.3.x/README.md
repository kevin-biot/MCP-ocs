# Sprint Kit (Process v3.3.x)

This kit provides a consistent, file‑only starting point for a new sprint driven by Claude (AI Scrum Master) and Codex (coder).

## How to use (manual, no shell required)

1) Copy this folder to `sprint-management/active/<sprint-id>-<slug>/`.
2) In the copied folder:
   - Rename `sprint.json.template` → `sprint.json` and fill the fields.
   - Open `CONTROL.md.template` → save as `CONTROL.md` and check the boxes as you progress.
   - Use the role prompts in `prompts/` for kickoff, standup, and EOD.
   - Populate the required artifacts under `artifacts/` (20 artifact standard) as you execute.
3) Keep logs in `logs/sprint-execution.log` (already standardized by repo).
4) At EOD: follow the Template Guide EOD checklist (process:sync-docs on beta, indices/registry on main).

## Kit contents
- CONTROL.md.template — one‑page control panel + checklist
- sprint.json.template — sprint manifest consumed by humans + scripts
- prompts/ — canonical prompt scaffolds (Claude, Codex, standup, EOD)
- artifacts/ — placeholders for the 20 required closure artifacts (can be renamed/moved as needed)
- ROLE-GUARDRAILS.md — references to the key process guardrails and role docs

## Notes
- This kit is deliberately file‑only so Claude can operate via file tools (no shell access needed).
- Codex can assist by copying/renaming folders and updating the CONTROL.md checklist as tasks are completed.
- See `sprint-management/TEMPLATE-USAGE-GUIDE-PROCESS-V3.3.2.md` for the EOD checklist and branch discipline.
