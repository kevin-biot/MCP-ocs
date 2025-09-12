#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function sh(cmd) {
  try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }); } catch (e) { return e.stdout?.toString?.() || ''; }
}

function listFiles(globs) {
  const args = globs.map(g => `'${g}'`).join(' ');
  const out = sh(`rg -n --no-heading ${args} | cut -d: -f1 | sort -u`);
  return out.split('\n').filter(Boolean);
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

// 1) ADR Inventory (IDs in docs and sprint-management)
const adrLines = sh("rg -n --no-heading 'ADR-[0-9]+' docs sprint-management || true");
const adrMatches = adrLines.split('\n').filter(Boolean).map(l => {
  const [file, line, ...rest] = l.split(':');
  const text = rest.join(':');
  const m = text.match(/ADR-([0-9]+)/);
  return m ? { id: `ADR-${m[1]}`, file, line: Number(line), text: text.trim() } : null;
}).filter(Boolean);
// derive unique ADR IDs
const adrIds = [...new Set(adrMatches.map(x => x.id))];

// 2) Reference scan in code/docs (explicit ADR refs)
const codeRefsLines = sh("rg -n --no-heading 'ADR-[0-9]+' src docs sprint-management || true");
const codeRefs = codeRefsLines.split('\n').filter(Boolean).map(l => {
  const [file, line, ...rest] = l.split(':');
  return { file, line: Number(line), text: rest.join(':').trim() };
});

// Policy patterns (D-009, zero-stdout) in new modules
const keyModules = [
  'src/lib/tools/instrumentation-middleware.ts',
  'src/lib/tools/metrics-writer.ts',
  'src/lib/tools/vector-writer.ts',
  'src/lib/memory/unified-memory-adapter.ts',
  'src/tools/state-mgmt/index.ts',
  'src/cli/memory-audit.ts',
  'src/lib/tools/tool-registry.ts',
  'src/lib/memory/chroma-memory-manager.ts'
];

function grep(pattern, files) {
  const args = files.map(f => `'${f}'`).join(' ');
  const out = sh(`rg -n --no-heading "${pattern}" ${args} || true`);
  return out.split('\n').filter(Boolean).map(l => {
    const [file, line, ...rest] = l.split(':');
    return { file, line: Number(line), text: rest.join(':').trim() };
  });
}

const d009Refs = grep('now(Epoch|Iso)\(', keyModules);
const stderrRefs = grep('console\.error\(', keyModules);

// Build coverage matrix (ADR IDs referenced by key modules)
const matrix = {};
for (const id of adrIds) matrix[id] = { referencedBy: [], missingIn: [] };
for (const m of keyModules) {
  const refs = grep('ADR-[0-9]+', [m]);
  const ids = [...new Set(refs.flatMap(r => (r.text.match(/ADR-[0-9]+/g) || [])))];
  for (const id of adrIds) {
    if (ids.includes(id)) matrix[id].referencedBy.push(m);
  }
}
for (const id of adrIds) {
  const present = new Set(matrix[id].referencedBy);
  matrix[id].missingIn = keyModules.filter(m => !present.has(m));
}

// Score: modules referencing at least one ADR / total modules
const modulesWithAnyRef = new Set();
for (const id of adrIds) matrix[id].referencedBy.forEach(f => modulesWithAnyRef.add(f));
const score = keyModules.length === 0 ? 1 : modulesWithAnyRef.size / keyModules.length;

const report = {
  generatedAt: new Date().toISOString(),
  keyModules,
  adrs: adrIds,
  adrOccurrences: adrMatches,
  explicitRefs: codeRefs,
  policyEvidence: { d009Refs, stderrRefs },
  matrix,
  score
};

const outDir = 'sprint-management/process';
ensureDir(outDir);
const jsonPath = path.join(outDir, 'adr-coverage-report.json');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

// Markdown summary
const md = [];
md.push('# ADR Coverage Report');
md.push(`Generated: ${report.generatedAt}`);
md.push('');
md.push('## Key Modules');
keyModules.forEach(m => md.push(`- ${m}`));
md.push('');
md.push('## ADR Inventory');
report.adrs.forEach(id => md.push(`- ${id}`));
md.push('');
md.push('## Coverage Matrix');
for (const id of report.adrs) {
  md.push(`- ${id}`);
  md.push(`  - referencedBy: ${matrix[id].referencedBy.length ? matrix[id].referencedBy.join(', ') : '(none)'}`);
  md.push(`  - missingIn: ${matrix[id].missingIn.length ? matrix[id].missingIn.join(', ') : '(none)'}`);
}
md.push('');
md.push(`## Score: ${(score*100).toFixed(1)}% of key modules reference at least one ADR`);
md.push('');
md.push('## Policy Evidence (D-009, stderr)');
md.push(`- D-009 refs in key modules: ${d009Refs.length}`);
md.push(`- stderr usages in key modules: ${stderrRefs.length}`);

const mdPath = path.join(outDir, 'adr-coverage-report.md');
fs.writeFileSync(mdPath, md.join('\n'));

console.log(jsonPath);
console.log(mdPath);

