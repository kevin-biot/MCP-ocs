#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Defaults per request:
// - Input source: this current log directory's codex-tui.log
// - Output: codex-logs under this script's directory
const DEFAULT_LOG = '/Users/kevinbrown/.codex/log/codex-tui.log';

// ---------- args ----------
const args = process.argv.slice(2);
let logPath = DEFAULT_LOG;
let fromISO = null, toISO = null;
let toStdout = false;
let outPath = null;

function toISODate(x) {
  if (!x) return null;
  const d = new Date(x);
  if (isNaN(d)) return null;
  return d.toISOString();
}
function parseLast(s) {
  const m = String(s || '').trim().match(/^(\d+(?:\.\d*)?)([smhdw])$/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mul = unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : unit === 'd' ? 86400 : 604800;
  return n * mul * 1000;
}
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--from') fromISO = toISODate(args[++i]);
  else if (a === '--to') toISO = toISODate(args[++i]);
  else if (a === '--on') {
    const d = new Date(args[++i]);
    if (!isNaN(d)) {
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start.getTime() + 24 * 3600 * 1000 - 1);
      fromISO = start.toISOString();
      toISO = end.toISOString();
    }
  } else if (a === '--last') {
    const ms = parseLast(args[++i]);
    if (ms != null) {
      const now = new Date();
      fromISO = new Date(now.getTime() - ms).toISOString();
      toISO = now.toISOString();
    }
  } else if (a === '--stdout') {
    toStdout = true;
  } else if (a === '--out') {
    outPath = args[++i];
  } else if (!a.startsWith('--')) {
    logPath = a;
  }
}
function inWindow(ts) {
  if (!ts) return false;
  if (fromISO && ts < fromISO) return false;
  if (toISO && ts > toISO) return false;
  return true;
}

// ---------- helpers ----------
function stripAnsi(s) {
  return s.replace(/\x1B\[[0-9;]*[A-Za-z]/g, '');
}
function parseIsoTs(line) {
  const m = line.match(/^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d+Z)/);
  return m ? m[1] : null;
}

// ---------- state ----------
const state = {
  sessionId: null,
  model: null,
  startedAt: null,
  endedAt: null,
  tasksStarted: 0,
  agentMessages: [],
  planSteps: [],
  shellCommands: [],
  fileChanges: [],
  git: { checkouts: [], commits: [], pushes: [] },
  tokens: { input: null, output: null, total: null, lastAt: null },
  warnings: [],
  errors: []
};

function addFileChangesFromCommand(cmd) {
  const re = /\*\*\* (Add|Update|Delete) File: ([^\n\r]+)/g;
  let m;
  while ((m = re.exec(cmd)) !== null) {
    state.fileChanges.push({ action: m[1], file: m[2].trim() });
  }
}
function categorizeGit(cmd) {
  if (/^git\s+checkout\s+/.test(cmd)) state.git.checkouts.push(cmd);
  if (/^git\s+commit\b/.test(cmd)) state.git.commits.push(cmd);
  if (/^git\s+push\b/.test(cmd)) state.git.pushes.push(cmd);
}

(async () => {
  try {
    if (!fs.existsSync(logPath)) {
      console.error(`Log not found: ${logPath}`);
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: fs.createReadStream(logPath, { encoding: 'utf8' }),
      crlfDelay: Infinity
    });

    for await (const raw of rl) {
      const line = stripAnsi(raw);
      const ts = parseIsoTs(line);
      if (!ts) continue; // only consider timestamped lines
      if (fromISO || toISO) {
        if (!inWindow(ts)) continue;
      }
      if (!state.startedAt) state.startedAt = ts;
      state.endedAt = ts;

      if (line.includes('SessionConfiguredEvent')) {
        const id = line.match(/session_id:\s*([0-9a-f-]{36})/i);
        const model = line.match(/model:\s*\"([^\"]+)\"/);
        if (id) state.sessionId = id[1];
        if (model) state.model = model[1];
      }

      if (line.includes('TaskStarted')) {
        state.tasksStarted += 1;
      }

      if (line.includes('AgentMessage(AgentMessageEvent')) {
        const msg = line.match(/message:\s*\"([\s\S]*)\"\s*\}\)/);
        if (msg) state.agentMessages.push(msg[1].replace(/\\\"/g, '"'));
      }

      if (line.includes('PlanUpdate(')) {
        const steps = [...line.matchAll(/step:\s*\"([^\"]+)\"/g)].map(m => m[1]);
        if (steps.length) state.planSteps = steps;
      }

      if (line.includes('TokenCount(')) {
        const m = line.match(/input_tokens:\s*(\d+)[\s\S]*?output_tokens:\s*(\d+)[\s\S]*?total_tokens:\s*(\d+)/);
        if (m) state.tokens = { input: +m[1], output: +m[2], total: +m[3], lastAt: ts };
      }

      if (line.includes('FunctionCall: shell(')) {
        const m = line.match(/\"command\"\s*:\s*\[([\s\S]*?)\]/);
        if (m) {
          const arrRaw = m[1];
          const parts = [...arrRaw.matchAll(/\"((?:[^\"\\]|\\.)*)\"/g)].map(mm => mm[1].replace(/\\\"/g, '"'));
          if (parts.length) {
            const cmd = parts[parts.length - 1];
            state.shellCommands.push(cmd);
            addFileChangesFromCommand(cmd);
            categorizeGit(cmd);
          }
        }
      }

      if (/\bWARN\b/.test(line)) state.warnings.push(line.trim());
      if (/\bERROR\b/.test(line)) state.errors.push(line.trim());
    }

    const unique = arr => Array.from(new Set(arr));
    const fileSummary = Object.values(
      state.fileChanges.reduce((acc, c) => {
        if (!acc[c.file]) acc[c.file] = { file: c.file, actions: new Set() };
        acc[c.file].actions.add(c.action);
        return acc;
      }, {})
    ).map(e => ({ file: e.file, actions: Array.from(e.actions).sort() }))
     .sort((a, b) => a.file.localeCompare(b.file));

    // Build Markdown
    const lines = [];
    lines.push(`# Sprint Summary from ${path.basename(logPath)}`);
    if (state.sessionId || state.model) lines.push(`- Session: ${state.sessionId || 'n/a'}  •  Model: ${state.model || 'n/a'}`);
    const windowLine = (fromISO || toISO)
      ? `- Window: ${fromISO || 'start'} → ${toISO || 'end'}`
      : (state.startedAt || state.endedAt)
        ? `- Window (observed): ${state.startedAt || 'n/a'} → ${state.endedAt || 'n/a'}`
        : null;
    if (windowLine) lines.push(windowLine);
    lines.push(`- Tasks Started: ${state.tasksStarted}`);
    lines.push(`- Shell Commands: ${state.shellCommands.length}`);
    if (state.tokens.total != null) lines.push(`- Tokens (last): in=${state.tokens.input} out=${state.tokens.output} total=${state.tokens.total}`);

    if (state.planSteps.length) {
      lines.push('', '## Plan Steps (latest)');
      state.planSteps.forEach(s => lines.push(`- ${s}`));
    }
    if (state.git.checkouts.length || state.git.commits.length || state.git.pushes.length) {
      lines.push('', '## Git Activity');
      if (state.git.checkouts.length) lines.push(`- Checkouts: ${unique(state.git.checkouts).length}`);
      if (state.git.commits.length) lines.push(`- Commits: ${unique(state.git.commits).length}`);
      if (state.git.pushes.length) lines.push(`- Pushes: ${unique(state.git.pushes).length}`);
    }
    if (fileSummary.length) {
      lines.push('', '## Files Changed (from patches)');
      fileSummary.forEach(e => lines.push(`- ${e.file} (${e.actions.join(', ')})`));
    }
    if (state.agentMessages.length) {
      lines.push('', '## Agent Messages (first 3)');
      state.agentMessages.slice(0, 3).forEach(m => {
        const oneLine = m.replace(/\s+/g, ' ').trim();
        lines.push(`- ${oneLine.slice(0, 180)}${oneLine.length > 180 ? '…' : ''}`);
      });
    }
    const uniqWarn = unique(state.warnings);
    const uniqErr = unique(state.errors);
    if (uniqWarn.length) {
      lines.push('', '## Warnings (unique, up to 5)');
      uniqWarn.slice(0, 5).forEach(w => lines.push(`- ${w}`));
    }
    if (uniqErr.length) {
      lines.push('', '## Errors (unique, up to 5)');
      uniqErr.slice(0, 5).forEach(e => lines.push(`- ${e}`));
    }
    if (state.shellCommands.length) {
      lines.push('', '## Top Commands (unique, up to 10)');
      unique(state.shellCommands).slice(0, 10).forEach(c => lines.push(`- ${c}`));
    }

    const md = lines.join('\n');

    // Output destination
    const scriptDir = __dirname;
    const defaultOutDir = path.join(scriptDir, 'codex-logs');
    if (!outPath && !toStdout) {
      // timestamped filename
      const now = new Date();
      const ts = now.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T','-');
      outPath = path.join(defaultOutDir, `sprint-summary-${ts}.md`);
    }

    if (toStdout) {
      process.stdout.write(md + '\n');
    } else {
      const destDir = path.dirname(outPath);
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(outPath, md, 'utf8');
      console.error(`Wrote summary → ${outPath}`);
    }
  } catch (err) {
    console.error('Error:', err && err.stack || err);
    process.exit(1);
  }
})();

