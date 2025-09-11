#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: npm run sprint:validate-closure -- <archive-dir>');
  console.error('Example: npm run sprint:validate-closure -- sprint-management/maintenance/archives/d-009-date-time-safety-2025-09-06');
  process.exit(1);
}

// Process v3.3.2 required artifacts (17 total)
const requiredTop = [
  'formal-closure-index.md',
  'prompt-archive.md',
  'session-report-codex.md',
  'scrum-master-assessment.md',
  'sprint-retrospective.md'
];
const requiredExec = [
  'execution-logs/execution-log-developer.md',
  'execution-logs/execution-log-codex.md',
  'execution-logs/execution-log-tester.md',
  'execution-logs/execution-log-reviewer.md'
];
const requiredCompletion = [
  'completion-reports/completion-developer-handoff.md',
  'completion-reports/completion-tester-verification.md',
  'completion-reports/completion-final-closure.md'
];
const requiredAnalytical = [
  'analytical-artifacts/04-quality-assessment-report.md',
  'analytical-artifacts/05-adr-impact-analysis.md',
  'analytical-artifacts/06-memory-extract-report.md',
  'analytical-artifacts/07-key-decisions-log.md',
  'analytical-artifacts/08-technical-metrics-data.json',
  'analytical-artifacts/09-outstanding-work-analysis.md'
];
const required = [
  ...requiredTop,
  ...requiredExec,
  ...requiredCompletion,
  ...requiredAnalytical
];

const optional = [
  'execution-logs/execution-tester-verification-backup.md'
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
