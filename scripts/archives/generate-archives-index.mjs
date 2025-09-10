#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

async function listDirs(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch { return []; }
}

function parseDateFromName(name) {
  const m = name.match(/(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : null;
}

function cmpByDateDesc(a, b) {
  const da = parseDateFromName(a);
  const db = parseDateFromName(b);
  if (da && db) return db.localeCompare(da);
  if (da && !db) return -1;
  if (!da && db) return 1;
  return a.localeCompare(b);
}

async function writeIndex(root, rel) {
  const archiveDir = path.join(root, rel);
  const items = await listDirs(archiveDir);
  items.sort(cmpByDateDesc);
  const lines = [];
  lines.push(`# Archives Index`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  if (items.length === 0) {
    lines.push('_No archived sprints yet._');
  } else {
    for (const name of items) {
      const date = parseDateFromName(name) || 'undated';
      const link = `./${name}/`;
      lines.push(`- [${name}](${link}) — ${date}`);
    }
  }
  lines.push('');
  const outPath = path.join(archiveDir, 'INDEX.md');
  await fs.writeFile(outPath, lines.join('\n'));
  return outPath;
}

async function main() {
  const root = process.cwd();
  const targets = [
    'sprint-management/features/archives',
    'sprint-management/maintenance/archives'
  ];
  const written = [];
  for (const rel of targets) {
    const out = await writeIndex(root, rel);
    written.push(out);
  }
  console.error(JSON.stringify({ subsystem: 'process', event: 'archives_index_generated', files: written }));
}

main().catch(err => { console.error(err?.message || String(err)); process.exit(1); });
