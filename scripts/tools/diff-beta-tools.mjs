#!/usr/bin/env node

// Diff two beta tools JSON files with color and fail-safe behavior
// Usage: node scripts/tools/diff-beta-tools.mjs <beta9.json> <beta8.json>

import fs from 'node:fs';
import path from 'node:path';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

function safeRead(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const j = JSON.parse(txt);
    const names = Array.isArray(j.tools) ? j.tools.map(t => t.name).filter(Boolean) : [];
    return { ok: true, names: names.sort(), raw: j };
  } catch (e) {
    return { ok: false, names: [], err: e };
  }
}

function main() {
  const [,, beta9File, beta8File] = process.argv;
  if (!beta9File || !beta8File) {
    console.log(yellow('Usage: node scripts/tools/diff-beta-tools.mjs <beta9.json> <beta8.json>'));
    process.exit(0); // help path: success
  }
  const r9 = safeRead(beta9File);
  const r8 = safeRead(beta8File);
  if (!r9.ok || !r8.ok) {
    console.log(red('Failed to read one or both files.'));
    if (!r9.ok) console.log(red(`  beta9: ${beta9File} (${r9.err?.message || 'unknown error'})`));
    if (!r8.ok) console.log(red(`  beta8: ${beta8File} (${r8.err?.message || 'unknown error'})`));
    process.exit(0); // fail-safe: do not hard-fail pipelines
  }
  const set9 = new Set(r9.names);
  const set8 = new Set(r8.names);
  const only9 = r9.names.filter(n => !set8.has(n));
  const only8 = r8.names.filter(n => !set9.has(n));
  console.log('beta8 count:', r8.names.length);
  console.log('beta9 count:', r9.names.length);
  if (only8.length === 0) {
    console.log(green('No tools missing from beta9 compared to beta8.'));
  } else {
    console.log(red('Missing in beta9:'));
    for (const n of only8) console.log(red(`  - ${n}`));
  }
  if (only9.length === 0) {
    console.log(yellow('No new tools in beta9 compared to beta8.'));
  } else {
    console.log(green('New in beta9:'));
    for (const n of only9) console.log(green(`  + ${n}`));
  }
  process.exit(0);
}

main();

