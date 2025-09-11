Sprint Log Extractor (codex-tui.log)

Location
- Script: `sprint-management/scripts/extract-sprint.cjs`
- Default input: `/Users/kevinbrown/.codex/log/codex-tui.log`
- Default output directory: `sprint-management/scripts/codex-logs/`

What it does
- Parses Codex CLI session logs and produces a concise Markdown sprint summary.
- Extracts: session/model, time window, tasks started, latest token counts, plan steps, agent messages (first 3), git activity, files changed (from patch blocks), top commands, warnings/errors.

Quick start
- Save to default output directory: `npm run sprint:extract`
- Last 2 hours shortcut: `npm run sprint:extract:last2h`
- Last 5 hours shortcut: `npm run sprint:extract:last5h`
- Today’s window shortcut: `npm run sprint:extract:today`
- Print to stdout: `node sprint-management/scripts/extract-sprint.cjs --stdout`

Time bounding
- `--from <ISO>` and/or `--to <ISO>`: e.g. `--from "2025-09-10T22:50:00Z" --to "2025-09-10T23:10:00Z"`
- `--on <YYYY-MM-DD>`: single local day
- `--last <N>[s|m|h|d|w]`: rolling window (e.g. `--last 2h`, `90m`, `1d`)

Output control
- `--stdout`: write summary to stdout instead of a file.
- `--out <path>`: explicit output file path (directories created as needed).
- Default filename (when not using `--stdout` or `--out`): `codex-logs/sprint-summary-<timestamp>.md`.

Examples
- Last 2 hours to default file: `node sprint-management/scripts/extract-sprint.cjs --last 2h`
- Specific window to custom file: `node sprint-management/scripts/extract-sprint.cjs --from "2025-09-10T22:50:00Z" --to "2025-09-10T23:10:00Z" --out sprint-management/scripts/codex-logs/summary-0910.md`
- Single day to stdout: `node sprint-management/scripts/extract-sprint.cjs --on 2025-09-10 --stdout`

EOD integration
- `npm run process:sync-docs` now runs `sprint:extract:last5h`, generating a summary for the last 5 hours into `codex-logs/`.

Notes
- Script is CommonJS (`.cjs`) to avoid ESM `type: module` constraints in `package.json`.
- No external dependencies; regex-based parser tolerant of ANSI color codes in logs.
