#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';
import { BoundaryEnforcer } from '../../src/lib/enforcement/boundary-enforcer.js';

const TARGETS = ['ingress-pending','crashloopbackoff','route-5xx','pvc-binding'];

function determinism(){
  return {
    modelName: process.env.LMSTUDIO_MODEL || process.env.MODEL_NAME || 'none',
    system_fingerprint: process.env.SYSTEM_FINGERPRINT || process.env.LMSTUDIO_SYSTEM_FINGERPRINT || 'none',
    temperature: Number(process.env.LM_TEMPERATURE ?? 0),
    top_p: Number(process.env.LM_TOP_P ?? 1),
    seed: Number(process.env.LM_SEED ?? 42)
  };
}

function loadPositiveGolden(t){
  const file = path.join('docs','golden-templates',`${t}.json`);
  if (!fs.existsSync(file)) throw new Error(`Golden not found: ${file}`);
  return JSON.parse(fs.readFileSync(file,'utf8'));
}

async function actualNegative(t){
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(t);
  const engine = new TemplateEngine();
  const sessionId = `compare-neg-${t}`;
  const vars = { ns:'openshift-ingress', pendingRouterPod:'router-default-xxxx', selector:'app=x', pod:'pod-x', container:'c1', service:'svc-a', route:'route-a', backendPod:'pod-a', pvc:'pvc-a', sc:'standard' };
  const plan = engine.buildPlan(sel.template, { sessionId, bounded:true, stepBudget:3, vars });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  const exec = [];
  const mk=(i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  switch(t){
    case 'ingress-pending':
      exec.push(mk(0,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc'}]}));
      exec.push(mk(1,'No scheduling issues here'));
      exec.push(mk(2,{ status:{ conditions:[{ type:'DeploymentRollingOut', status:'True' }]}}));
      break;
    case 'crashloopbackoff':
      exec.push(mk(0,{ items:[{metadata:{name:'pod-x'}}]}));
      exec.push(mk(1,{ logs:{ tail:'...logs.tail...' } }));
      exec.push(mk(2,{ spec:{ containers:[{ }] } }));
      break;
    case 'route-5xx':
      exec.push(mk(0,{ subsets: [] }));
      exec.push(mk(1,{ spec:{ } }));
      exec.push(mk(2,{ spec:{ containers:[{ }] } }));
      break;
    case 'pvc-binding':
      exec.push(mk(0,{ spec:{ } }));
      exec.push(mk(1,{ parameters: { } }));
      exec.push(mk(2,{ status:{ } }));
      break;
  }
  const evidence = engine.evaluateEvidence(sel.template, exec);
  return { determinism: determinism(), steps: steps.map(s=>s.tool), evidence };
}

function diffPositiveAgainstNegative(g,a){
  const diffs=[];
  if (JSON.stringify(g.steps) === JSON.stringify(a.steps)) {
    // Even if steps match, evidence should be below threshold; compare presence
    const passGolden = Number(g?.evidence?.completeness ?? 0) >= Number(g?.evidenceThreshold ?? 0);
    const passActual = Number(a?.evidence?.completeness ?? 0) >= Number(g?.evidenceThreshold ?? 0);
    if (passActual) diffs.push({ path:'evidence.completeness', expected:'< threshold', actual:a?.evidence?.completeness, severity:'breaking' });
  } else {
    diffs.push({ path:'steps', expected:g.steps, actual:a.steps, severity:'breaking' });
  }
  // determinism envelope strict
  const de = ['modelName','system_fingerprint','temperature','top_p','seed'];
  for (const k of de){
    if (String(g?.determinism?.[k]) !== String(a?.determinism?.[k])) diffs.push({ path:`determinism.${k}`, expected:g?.determinism?.[k], actual:a?.determinism?.[k], severity:'breaking' });
  }
  return diffs;
}

async function main(){
  const results=[];
  let breaking=false;
  for (const t of TARGETS){
    const g = loadPositiveGolden(t);
    const a = await actualNegative(t);
    const d = diffPositiveAgainstNegative(g,a);
    results.push({ target:t, diffs:d });
    if (d.some(x=>x.severity==='breaking')) breaking=true;
  }
  console.log(JSON.stringify({ results }, null, 2));
  // This script is expected to fail in CI to demonstrate the gate
  if (!breaking) {
    console.error('Expected negative diffs but found none');
  }
  process.exit(1);
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });

