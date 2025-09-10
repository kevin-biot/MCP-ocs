#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ACTIVE_DIR = 'sprint-management/active';

async function listDirs(dir) {
  try { return (await fs.readdir(dir, { withFileTypes: true })).filter(e=>e.isDirectory()).map(e=>e.name); } catch { return []; }
}

async function readJson(p) { try { return JSON.parse(await fs.readFile(p,'utf8')); } catch { return null; } }
async function readText(p) { try { return await fs.readFile(p,'utf8'); } catch { return ''; } }

function checkboxSummary(md) {
  const total = (md.match(/\- \[ \]/g) || []).length + (md.match(/\- \[x\]/gi) || []).length;
  const done = (md.match(/\- \[x\]/gi) || []).length;
  return { total, done };
}

async function main() {
  const target = process.argv[2];
  let sprintDir;
  if (target) sprintDir = target; else {
    const actives = (await listDirs(ACTIVE_DIR)).sort();
    if (actives.length === 0) { console.error('No active sprints.'); process.exit(2); }
    sprintDir = path.join(ACTIVE_DIR, actives[actives.length-1]);
  }
  const manifest = await readJson(path.join(sprintDir, 'sprint.json')) || {};
  const controlMd = await readText(path.join(sprintDir, 'CONTROL.md'));
  const control = checkboxSummary(controlMd);
  const out = {
    sprint: path.basename(sprintDir),
    id: manifest.sprint_id || 'unknown',
    type: manifest.type || 'unknown',
    status: manifest.status || 'unknown',
    goals: manifest.goals || [],
    acceptance: manifest.acceptance || [],
    controlChecklist: control,
    paths: {
      control: path.join(sprintDir, 'CONTROL.md'),
      manifest: path.join(sprintDir, 'sprint.json')
    }
  };
  const statusPath = path.join(sprintDir, 'STATUS.md');
  const lines = [];
  lines.push(`# STATUS — ${out.sprint}`);
  lines.push('');
  lines.push(`ID: ${out.id}`);
  lines.push(`Type: ${out.type}`);
  lines.push(`Status: ${out.status}`);
  lines.push('');
  lines.push(`Goals:`); for (const g of out.goals) lines.push(`- ${g}`);
  lines.push('');
  lines.push(`Acceptance:`); for (const a of out.acceptance) lines.push(`- ${a}`);
  lines.push('');
  lines.push(`CONTROL.md checklist: ${out.controlChecklist.done}/${out.controlChecklist.total} done`);
  lines.push('');
  lines.push(`Manifest: ${out.paths.manifest}`);
  lines.push(`Control: ${out.paths.control}`);
  lines.push('');
  await fs.writeFile(statusPath, lines.join('\n'));
  console.log(JSON.stringify(out, null, 2));
}

main().catch(err => { console.error(err?.message || String(err)); process.exit(1); });

