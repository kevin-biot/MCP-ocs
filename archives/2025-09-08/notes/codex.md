# Codex Guardrails — MCP-ocs (TARGET, write-enabled)

## 🎯 Mission
Rebuild MCP-ocs memory system using proven MCP-files foundation while maintaining stability.

## 📁 Scope
- **Allowed (read/write)**: `src/lib/memory/**`, `tests/unit/memory/**`, `codex-docs/**`, `scripts/codex/**`, `metrics/**`
- **Allowed (limited)**: `src/index.ts` (exports only), `package.json` (dependency updates only with approval)
- **Forbidden**: `dist/**`, `node_modules/**`, `organization-phase2-backup-*/**`, `logs/**`, any MCP-files modifications

## 🛡️ Safety Rules
- **MUST** request approval before executing ANY shell commands
- **MUST** request approval before modifying `package.json` or running `npm install`
- **MUST** follow `codex-task-strategy.md` and `codex-docs/memory_rebuild_plan.md` strictly, one phase at a time
- **MUST** stop at every **Checkpoint** and report status before proceeding
- **MUST** create minimal, reviewable diffs
- **MUST** backup files before major changes

## 📋 Key Reference Files
- **Strategy**: `codex-task-strategy.md` (main implementation guide)
- **Plan**: `codex-docs/memory_rebuild_plan.md` (detailed phases)
- **Status**: `metrics/phase_status.txt` (progress tracking)

## 📊 Reporting Requirements
- Update `metrics/phase_status.txt` after each checkpoint
- If tests run, update `metrics/coverage.txt` with `TOTAL NN%`
- Produce concise status report at end of each phase
- Log any errors or unexpected behavior immediately

## 🚫 Prohibited Actions
- Network calls or external API access
- Modifying working MCP-files code
- Installing new dependencies without approval
- Running tests that require ChromaDB server
- Making changes outside approved scope
