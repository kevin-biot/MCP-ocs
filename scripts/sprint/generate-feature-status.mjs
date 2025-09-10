#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const statusPath = path.join(root, 'sprint-management', 'features', 'status.json');
const readmePath = path.join(root, 'README.md');
const adrDir = path.join(root, 'docs', 'architecture');

function emojiForStatus(status) {
  switch ((status || '').toLowerCase()) {
    case 'complete': return '✅ Complete';
    case 'in_progress': return '🚧 In Progress';
    case 'partial': return '🚧 Partial';
    case 'designed': return '📋 Designed';
    default: return status || '';
  }
}

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function validateADRs(entries) {
  const missing = [];
  for (const entry of entries) {
    const adrs = entry.adrs || [];
    for (const adr of adrs) {
      const adrPath = path.join(adrDir, adr);
      if (!fs.existsSync(adrPath)) {
        missing.push({ entry: entry.id || entry.component, adr });
      }
    }
  }
  return missing;
}

function renderFeatureEpics(epics) {
  const sorted = [...epics].sort((a,b) => (a.id || '').localeCompare(b.id || ''));
  const lines = [
    '<!-- BEGIN:FEATURE_EPICS -->',
    'Our development follows structured feature epics with clear dependencies:',
    ''
  ];
  for (const e of sorted) {
    const status = (e.status || '').toLowerCase();
    let badge = '📋 DESIGNED';
    if (status === 'complete') badge = '✅ COMPLETE';
    else if (status === 'in_progress') badge = '🚧 IN PROGRESS';
    else if (status === 'partial') badge = '🚧 PARTIAL';
    else if (status === 'designed') badge = '📋 DESIGNED';
    lines.push(`- **${e.id}**: ${e.name} → **${badge}**`);
  }
  lines.push('', '<!-- END:FEATURE_EPICS -->');
  return lines.join('\n');
}

function renderCoreStatus(core, beta) {
  const lines = ['<!-- BEGIN:CORE_STATUS -->'];
  // Core systems
  lines.push('', '### **Core Systems (Production Ready)** ✅');
  lines.push('| Component | Status | Implementation | Quality |');
  lines.push('|-----------|--------|----------------|---------|');
  for (const c of core) {
    lines.push(`| ${c.component} | ${emojiForStatus(c.status)} | ${c.impl}% | ${c.quality} |`);
  }
  // Beta features
  lines.push('', '### **Beta Features (Active Development)** 🚧');
  lines.push('| Component | Status | Implementation | Priority |');
  lines.push('|-----------|--------|----------------|----------|');
  for (const b of beta) {
    lines.push(`| ${b.component} | ${emojiForStatus(b.status)} | ${b.impl}% | ${b.priority} |`);
  }
  lines.push('', '<!-- END:CORE_STATUS -->');
  return lines.join('\n');
}

function replaceBetweenMarkers(content, begin, end, replacement) {
  const re = new RegExp(`<!--\\s*${begin}\\s*-->[\\s\\S]*?<!--\\s*${end}\\s*-->`, 'm');
  if (!re.test(content)) return content; // markers missing
  return content.replace(re, replacement);
}

function main() {
  if (!fs.existsSync(statusPath)) {
    console.error(`Missing status file: ${statusPath}`);
    process.exit(1);
  }
  const status = loadJSON(statusPath);
  const readme = fs.readFileSync(readmePath, 'utf8');

  const epicSection = renderFeatureEpics(status.epics || []);
  const coreSection = renderCoreStatus(status.coreSystems || [], status.betaFeatures || []);

  let out = readme;
  out = replaceBetweenMarkers(out, 'BEGIN:FEATURE_EPICS', 'END:FEATURE_EPICS', epicSection);
  out = replaceBetweenMarkers(out, 'BEGIN:CORE_STATUS', 'END:CORE_STATUS', coreSection);

  if (out !== readme) {
    fs.writeFileSync(readmePath, out, 'utf8');
    console.log('README updated from status.json');
  } else {
    console.log('No markers found or no changes needed');
  }

  // Validation report
  const adrMissing = [
    ...validateADRs(status.epics || []),
    ...validateADRs(status.coreSystems || []),
    ...validateADRs(status.betaFeatures || []),
  ];
  if (adrMissing.length) {
    console.warn('ADR references missing:', adrMissing);
  } else {
    console.log('All ADR references resolved.');
  }
}

main();

