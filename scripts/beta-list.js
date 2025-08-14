#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const asJson = process.argv.includes('--json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '..', 'config', 'beta-tools.json');

try {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const tools = (data.tools || []).slice().sort((a, b) => a.name.localeCompare(b.name));

  const counts = tools.reduce((acc, t) => {
    acc.total += 1;
    acc.byMaturity[t.maturity] = (acc.byMaturity[t.maturity] || 0) + 1;
    return acc;
  }, { total: 0, byMaturity: {} });

  if (asJson) {
    console.log(JSON.stringify({ count: counts.total, byMaturity: counts.byMaturity, tools }, null, 2));
    process.exit(0);
  }

  console.log('MCP-OCS Beta Tool List (validated)');
  console.log('-----------------------------------');
  for (const t of tools) {
    console.log(`- ${t.name} [${t.maturity}] (validated: ${t.lastValidated})`);
  }
  console.log('');
  console.log(`Total: ${counts.total}`);
  console.log('By maturity:', JSON.stringify(counts.byMaturity));
} catch (err) {
  console.error('Failed to load beta tool list:', err.message);
  process.exit(1);
}
