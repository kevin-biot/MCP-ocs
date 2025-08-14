#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const validatedTs = path.join(__dirname, '..', 'src', 'registry', 'validated-tools.ts');
const outJson = path.join(__dirname, '..', 'config', 'beta-tools.json');

function extractObjectLiteral(ts) {
  const anchor = 'export const VALIDATED_TOOLS';
  const start = ts.indexOf(anchor);
  if (start === -1) throw new Error('VALIDATED_TOOLS not found');
  const braceStart = ts.indexOf('{', start);
  if (braceStart === -1) throw new Error('Object literal start not found');
  let i = braceStart;
  let depth = 0;
  for (; i < ts.length; i++) {
    const ch = ts[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        // include closing brace
        return ts.slice(braceStart, i + 1);
      }
    }
  }
  throw new Error('Object literal end not found');
}

function main() {
  const ts = fs.readFileSync(validatedTs, 'utf8');
  const objLiteral = extractObjectLiteral(ts);

  // Minimal enum shim so evaluation resolves to strings
  const ToolMaturity = {
    PRODUCTION: 'production',
    BETA: 'beta',
    ALPHA: 'alpha',
    DEVELOPMENT: 'development'
  };

  // eslint-disable-next-line no-new-func
  const build = new Function('ToolMaturity', `return (${objLiteral});`);
  const data = build(ToolMaturity);

  const tools = Object.entries(data)
    .map(([name, meta]) => ({
      name,
      maturity: meta.maturity,
      lastValidated: meta.lastValidated
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const json = { tools };
  fs.writeFileSync(outJson, JSON.stringify(json, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${tools.length} tools to ${path.relative(process.cwd(), outJson)}`);
}

try {
  main();
} catch (err) {
  console.error('Failed to generate beta-tools.json:', err.message);
  process.exit(1);
}

