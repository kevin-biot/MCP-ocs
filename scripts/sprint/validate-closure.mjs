#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ACTIVE_DIR = 'sprint-management/active';

async function listDirs(dir) {
  try { return (await fs.readdir(dir, { withFileTypes: true })).filter(e=>e.isDirectory()).map(e=>e.name); } catch { return []; }
}

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function validateSprint(dir) {
  const reqFiles = [
    'CONTROL.md',
    'sprint.json',
    'artifacts/execution-logs',
    'artifacts/completion-reports',
    'artifacts/analytical-artifacts'
  ];
  const missing = [];
  for (const f of reqFiles) {
    const full = path.join(dir, f);
    const ok = f.endsWith('/') ? await exists(full) : await exists(full);
    if (!ok) missing.push(f);
  }
  // formal-closure-index.md is expected at the end; warn if missing
  const closure = await exists(path.join(dir, 'formal-closure-index.md'));
  return { dir, missing, closure };
}

async function main() {
  const target = process.argv[2];
  let sprintDir;
  if (target) {
    sprintDir = target;
  } else {
    const actives = (await listDirs(ACTIVE_DIR)).sort();
    if (actives.length === 0) {
      console.error('No active sprints found.');
      process.exit(2);
    }
    sprintDir = path.join(ACTIVE_DIR, actives[actives.length-1]);
  }
  const res = await validateSprint(sprintDir);
  if (res.missing.length > 0) {
    console.error(JSON.stringify({ subsystem:'process', event:'validate_closure', sprint: sprintDir, missing: res.missing }));
    process.exit(1);
  }
  console.error(JSON.stringify({ subsystem:'process', event:'validate_closure', sprint: sprintDir, missing: [], closurePresent: res.closure }));
}

main().catch(err => { console.error(err?.message || String(err)); process.exit(1); });

