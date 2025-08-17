#!/usr/bin/env node
import fs from 'node:fs';

// Simple coverage checker for rubric IDs present in the repo vs required tool families
const REQUIRED = {
  core: ['triage-priority.v1','evidence-confidence.v1','remediation-safety.v1'],
  diagnostic: ['diagnostic.cluster-health.safety.v1','diagnostic.pod-health.safety.v1','diagnostic.pod-health.confidence.v1','diagnostic.namespace-health.confidence.v1','diagnostic.rca-checklist.mapping.v1'],
  memory: ['memory.search.confidence.v1','memory.store.safety.v1','memory.stats.safety.v1','memory.conversations.confidence.v1'],
  coreTools: ['workflow_state.safety.v1','sequential_thinking.safety.v1']
};

function scanRubricIds(){
  const ids = new Set();
  const root = 'src/lib/rubrics';
  function scan(dir){
    for (const f of fs.readdirSync(dir)){
      const p = `${dir}/${f}`;
      const st = fs.statSync(p);
      if (st.isDirectory()) scan(p);
      else if (/\.ts$/.test(f)) {
        const s = fs.readFileSync(p,'utf8');
        const m = s.match(/id:\s*'([^']+)'/g) || [];
        for (const mm of m){ const id = mm.split("'")[1]; ids.add(id); }
      }
    }
  }
  scan(root);
  return ids;
}

function main(){
  const ids = scanRubricIds();
  const missing = [];
  const present = [];
  for (const [group, list] of Object.entries(REQUIRED)){
    for (const id of list){
      if (ids.has(id)) present.push(id); else missing.push(id);
    }
  }
  const coverage = present.length / (present.length + missing.length);
  const out = { present, missing, coverage };
  console.log(JSON.stringify(out, null, 2));
  const min = Number(process.env.MIN_RUBRICS_COVERAGE || '0');
  if (coverage < min) process.exit(1);
}

main();
