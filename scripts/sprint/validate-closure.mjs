#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: npm run sprint:validate-closure -- <archive-dir>');
  console.error('Example: npm run sprint:validate-closure -- sprint-management/maintenance/archives/d-009-date-time-safety-2025-09-06');
  process.exit(1);
}

const required = [
  'formal-closure-index.md',
  'session-report-codex.md',
  'scrum-master-assessment.md',
  'sprint-retrospective.md',
  'prompt-archive.md',
  'reviewer-role-closure-prompt.md',
  'completion-developer-handoff.md',
  'completion-final-closure.md',
  'completion-tester-verification.md',
  'execution-log-developer.md',
  'execution-log-reviewer.md',
  'execution-log-tester.md',
  '04-quality-assessment-report.md',
  '05-adr-impact-analysis.md',
  '06-memory-extract-report.md',
  '07-key-decisions-log.md',
  '08-technical-metrics-data.json'
];

const optional = [
  'execution-tester-verification-backup.md'
];

function exists(p) { return fs.existsSync(path.join(dir, p)); }

const missing = required.filter(f => !exists(f));
const missingOptional = optional.filter(f => !exists(f));

if (missing.length) {
  console.error('[FAIL] Missing required artifacts:', missing);
  process.exit(2);
}

console.log('[OK] Required artifacts present:', required.length);
if (missingOptional.length) {
  console.warn('[WARN] Optional artifacts missing:', missingOptional);
}
process.exit(0);

