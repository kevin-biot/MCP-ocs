#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const archiveDir = process.argv[2];
if (!archiveDir) {
  console.error('Usage: npm run sprint:context:skeleton -- <archive-dir>');
  process.exit(1);
}
const destDir = path.join(root, archiveDir, 'process-artifacts');
const destFile = path.join(destDir, 'verbose-context.md');
const indexFile = path.join(destDir, 'context-index.json');
const templatePath = path.join(root, 'sprint-management', 'templates', 'current', 'verbose-context-template.md');

fs.mkdirSync(destDir, { recursive: true });
if (fs.existsSync(templatePath)) {
  fs.copyFileSync(templatePath, destFile);
  console.log('Wrote', destFile);
} else {
  fs.writeFileSync(destFile, '# Verbose Context (template missing)\n');
}
if (!fs.existsSync(indexFile)) {
  fs.writeFileSync(indexFile, JSON.stringify({ sprintId: '', start: '', end: '', keyDecisions: [], adrImpacts: [], risks: [], followUps: [] }, null, 2));
  console.log('Wrote', indexFile);
}
