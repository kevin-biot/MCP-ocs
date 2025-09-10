#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';

const domains = [
  { name: 'features', dir: 'sprint-management/features/archives' },
  { name: 'maintenance', dir: 'sprint-management/maintenance/archives' }
];

function parseDateFromName(name) {
  const m = name.match(/(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : null;
}

function parseSprintId(name) {
  // take leading token like f-010 or d-002 or fix-001
  const m = name.match(/^(fix-[0-9]{3}|f-[0-9]{3}|d-[0-9]{3})/i);
  return m ? m[1].toLowerCase() : 'unknown';
}

async function listDirs(dir) {
  try { return (await fs.readdir(dir, { withFileTypes: true })).filter(e=>e.isDirectory()).map(e=>e.name); } catch { return []; }
}

function cmpByDateDesc(a, b) {
  const da = parseDateFromName(a);
  const db = parseDateFromName(b);
  if (da && db) return db.localeCompare(da);
  if (da && !db) return -1;
  if (!da && db) return 1;
  return a.localeCompare(b);
}

async function main() {
  const rows = [];
  for (const d of domains) {
    const names = (await listDirs(d.dir)).sort(cmpByDateDesc);
    for (const name of names) {
      const date = parseDateFromName(name) || 'undated';
      const sid = parseSprintId(name);
      const relPath = path.join(d.dir, name);
      rows.push({ domain: d.name, sprint_id: sid, name, date, path: relPath });
    }
  }
  const iso = new Date().toISOString().slice(0,10);
  const outCsv = `docs/reports/technical/process/archive-registry-${iso}.csv`;
  const outMd = `docs/reports/technical/process/archive-registry-${iso}.md`;
  // CSV
  const csv = ['domain,sprint_id,name,date,path'].concat(rows.map(r=>[r.domain,r.sprint_id,r.name,r.date,r.path].join(','))).join('\n');
  await fs.writeFile(outCsv, csv);
  // MD
  const lines = [];
  lines.push(`# Archive Registry — ${iso}`); lines.push('');
  for (const dom of ['features','maintenance']) {
    lines.push(`## ${dom.charAt(0).toUpperCase()+dom.slice(1)}`); lines.push('');
    for (const r of rows.filter(x=>x.domain===dom)) {
      lines.push(`- [${r.name}](/${r.path}) — ${r.date} (${r.sprint_id})`);
    }
    lines.push('');
  }
  await fs.writeFile(outMd, lines.join('\n'));
  console.error(JSON.stringify({ subsystem:'process', event:'archive_registry_generated', files:[outCsv,outMd], count: rows.length }));
}

main().catch(err => { console.error(err?.message || String(err)); process.exit(1); });
