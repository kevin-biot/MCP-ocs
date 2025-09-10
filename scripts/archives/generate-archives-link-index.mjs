#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function lsDirs(ref, dir) {
  try {
    const out = execSync(`git ls-tree -d --name-only ${ref} -- ${dir}`, { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch { return []; }
}

async function writeLinkIndex(localDir, mainDir) {
  const items = lsDirs('origin/main', mainDir).map(p => path.basename(p));
  const lines = [];
  lines.push(`# Archives Links (main)`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  if (items.length === 0) {
    lines.push('_No archives found on main._');
  } else {
    for (const name of items) {
      const url = `https://github.com/kevin-biot/MCP-ocs/tree/main/${mainDir}/${name}`;
      lines.push(`- [${name}](${url})`);
    }
  }
  lines.push('');
  await fs.mkdir(localDir, { recursive: true });
  await fs.writeFile(path.join(localDir, 'INDEX.LINKS.md'), lines.join('\n'));
}

async function main() {
  await writeLinkIndex('sprint-management/features/archives', 'sprint-management/features/archives');
  await writeLinkIndex('sprint-management/maintenance/archives', 'sprint-management/maintenance/archives');
  console.error(JSON.stringify({ subsystem: 'process', event: 'archives_link_index_generated' }));
}

main().catch(err => { console.error(err?.message || String(err)); process.exit(1); });
