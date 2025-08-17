#!/usr/bin/env node
import { execSync } from 'node:child_process';

function gitLsFiles(){
  try { return execSync('git ls-files', { stdio:['ignore','pipe','ignore'] }).toString('utf8').trim().split(/\n/); }
  catch { return []; }
}

function main(){
  const files = gitLsFiles();
  const offenders = files.filter(f => /(^|\/)CODEX_.*\.md$/.test(f) || /(^|\/)BETA_TOOL_IMPLEMENTATION_PLAN\.md$/.test(f))
    .filter(f => !f.startsWith('docs/planning/'));
  if (offenders.length){
    console.error('Planning docs must live under docs/planning/. Offenders:');
    offenders.forEach(f=>console.error(' -', f));
    process.exit(1);
  }
  console.log('Planning docs location: OK');
}

main();

