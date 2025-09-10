#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const readmePath = path.join(root, 'README.md');
const srcDir = path.join(root, 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (st.isFile() && p.endsWith('.ts')) files.push(p);
  }
  return files;
}

function extractTools() {
  const files = walk(srcDir);
  const toolSet = new Set();
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const reFull = /fullName:\s*'([^']+)'/g;
    const reName = /name:\s*'([^']+)'/g;
    let m;
    while ((m = reFull.exec(text))) toolSet.add(m[1]);
    while ((m = reName.exec(text))) {
      const n = m[1];
      if (n.startsWith('oc_') || n.startsWith('memory_') || n === 'core_workflow_state') toolSet.add(n);
    }
  }
  return Array.from(toolSet).sort();
}

function categorize(names) {
  const cats = {
    diagnostics: [],
    readOps: [],
    memory: [],
    state: [],
    other: []
  };
  for (const n of names) {
    if (n.startsWith('oc_diagnostic_') || n.startsWith('oc_analyze_')) cats.diagnostics.push(n);
    else if (n.startsWith('oc_read_') || n.startsWith('oc_get_') || n.startsWith('oc_describe_')) cats.readOps.push(n);
    else if (n.startsWith('memory_')) cats.memory.push(n);
    else if (n === 'core_workflow_state') cats.state.push(n);
    else cats.other.push(n);
  }
  return cats;
}

function loadValidated() {
  const p = path.join(srcDir, 'registry', 'validated-tools.ts');
  if (!fs.existsSync(p)) return {};
  const text = fs.readFileSync(p, 'utf8');
  const map = {};
  const re = /'([^']+)':\s*{\s*\n\s*name:\s*'([^']+)'[\s\S]*?maturity:\s*ToolMaturity\.([A-Z_]+)/g;
  let m;
  while ((m = re.exec(text))) {
    map[m[1]] = m[3];
  }
  return map;
}

function renderTools(cats, validated) {
  const tag = (n) => validated[n] ? (validated[n] === 'PRODUCTION' ? ' (production)' : ' (beta)') : ' (beta)';
  const lines = ['<!-- BEGIN:TOOLS -->'];
  lines.push('\n### Available Tools (Auto-generated)');
  if (cats.diagnostics.length) {
    lines.push('\n- Diagnostics:');
    for (const n of cats.diagnostics) lines.push(`  - \`${n}\`${tag(n)}`);
  }
  if (cats.readOps.length) {
    lines.push('\n- Read Ops:');
    for (const n of cats.readOps) lines.push(`  - \`${n}\`${tag(n)}`);
  }
  if (cats.memory.length) {
    lines.push('\n- Memory:');
    for (const n of cats.memory) lines.push(`  - \`${n}\`${tag(n)}`);
  }
  if (cats.state.length) {
    lines.push('\n- State:');
    for (const n of cats.state) lines.push(`  - \`${n}\`${tag(n)}`);
  }
  if (cats.other.length) {
    lines.push('\n- Other:');
    for (const n of cats.other) lines.push(`  - \`${n}\`${tag(n)}`);
  }
  lines.push('', '<!-- END:TOOLS -->');
  return lines.join('\n');
}

function replaceBetweenMarkers(content, begin, end, replacement) {
  const re = new RegExp(`<!--\\s*${begin}\\s*-->[\\s\\S]*?<!--\\s*${end}\\s*-->`, 'm');
  if (!re.test(content)) return content + `\n\n${replacement}\n`;
  return content.replace(re, replacement);
}

const names = extractTools();
const cats = categorize(names);
const validated = loadValidated();
let readme = fs.readFileSync(readmePath, 'utf8');
const rendered = renderTools(cats, validated);
readme = replaceBetweenMarkers(readme, 'BEGIN:TOOLS', 'END:TOOLS', rendered);
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('README tools section updated.');

