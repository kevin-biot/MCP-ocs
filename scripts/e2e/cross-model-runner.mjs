#!/usr/bin/env node
import { spawn } from 'node:child_process';

const MODELS = (process.env.LMSTUDIO_MODELS || 'ministral-8b-instruct-2410,qwen2.5-7b-instruct,mistralai/devstral-small-2507').split(',').map(s=>s.trim()).filter(Boolean);
const TARGETS = (process.env.TEMPLATE_TARGETS || 'ingress-pending,crashloopbackoff,route-5xx,pvc-binding').split(',').map(s=>s.trim()).filter(Boolean);

function runOne(model, target){
  return new Promise((resolve) => {
    const env = { ...process.env, LMSTUDIO_MODEL: model };
    const args = ['scripts/e2e/template-hygiene-tester.mjs', target];
    const proc = spawn('tsx', args, { env, stdio: ['ignore','pipe','pipe'] });
    let out=''; let err='';
    proc.stdout.on('data', d=> out+=d.toString());
    proc.stderr.on('data', d=> err+=d.toString());
    proc.on('close', (code)=>{
      resolve({ model, target, code, out, err });
    });
  });
}

async function main(){
  const results = [];
  for (const model of MODELS) {
    console.log(`\n=== Model: ${model} ===`);
    for (const target of TARGETS) {
      const r = await runOne(model, target);
      const pass = r.code === 0;
      console.log(`-- ${target}: ${pass ? 'PASS' : 'FAIL'} (exit ${r.code})`);
      if (!pass) {
        try {
          const json = JSON.parse(r.out || '{}');
          console.log(JSON.stringify(json, null, 2));
        } catch { console.log(r.out); }
        if (r.err) console.error(r.err);
      }
      results.push({ model, target, pass });
    }
  }
  const summary = results.reduce((acc, r)=>{ acc.total++; if(r.pass) acc.passed++; return acc; }, { total:0, passed:0 });
  console.log(`\nSummary: ${summary.passed}/${summary.total} passed`);
  if (summary.passed !== summary.total) process.exit(1);
}

main().catch(e=>{ console.error(e?.message || e); process.exit(1); });

