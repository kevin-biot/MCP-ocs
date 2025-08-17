#!/usr/bin/env node
import crypto from 'node:crypto';
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';

function hash(obj){ return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex'); }

function fabricateExecForTarget(target, plan){
  // Create minimal results that satisfy evidence selectors per target
  const exec = [];
  const mk = (i, res) => ({ step: plan.steps[i] || plan.steps[plan.steps.length-1], result: res });
  switch (target) {
    case 'ingress-pending':
      exec.push(mk(0, { items: [ { metadata: { name: 'router-default-abc' } } ] }));
      exec.push(mk(1, 'Warning  FailedScheduling  default-scheduler'));
      exec.push(mk(2, { status: { conditions: [ { type:'DeploymentAvailable', status:'True', reason:'Valid', message:'ok' } ] } }));
      break;
    case 'pvc-binding':
      exec.push(mk(0, { spec: { resources: {} } }));
      exec.push(mk(1, { parameters: { provisioner: 'gp2' } }));
      exec.push(mk(2, { status: { hard: { 'requests.storage':'100Gi' } } }));
      break;
    case 'route-5xx':
      exec.push(mk(0, { subsets: [ { addresses: [ { ip: '10.0.0.1' } ] } ] }));
      exec.push(mk(1, { spec: { tls: {} } }));
      exec.push(mk(2, { spec: { containers: [ { readinessProbe: {} } ] } }));
      break;
    case 'scheduling-failures':
      exec.push(mk(0, 'FailedScheduling: 0/4 nodes available'));
      exec.push(mk(1, { status: { conditions: [ { type:'Progressing', status:'True' } ] } }));
      exec.push(mk(2, { spec: { taints: [ { key: 'node-role.kubernetes.io/master' } ] } }));
      break;
    case 'crashloopbackoff':
      exec.push(mk(0, { items: [ { metadata: { name:'pod-x' } } ] }));
      exec.push(mk(1, { logs: { tail: '...logs.tail...' } }));
      exec.push(mk(2, { spec: { containers: [ { livenessProbe: {} } ] } }));
      break;
    default:
      for (let i=0;i<plan.steps.length && i<3;i++) exec.push(mk(i,{ ok:true }));
  }
  return exec;
}

async function main(){
  const reg = new TemplateRegistry();
  await reg.load();
  const targets = ['ingress-pending','pvc-binding','route-5xx','scheduling-failures','crashloopbackoff'];
  const engine = new TemplateEngine();
  let allPass = true;

  for (const t of targets) {
    const sel = reg.selectByTarget(t);
    if (!sel) continue;
    const sessionId = `determinism-${t}`;
    const vars = { ns: 'ns-a', selector: 'app=x', pod: 'pod-x', container: 'c1', pendingRouterPod: 'router-default-xxxx', service: 'svc-a', route: 'route-a', backendPod: 'pod-a', pvc: 'pvc-a', sc: 'standard' };

    const runs = [];
    for (let i=0;i<3;i++) {
      const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 3, vars });
      const h = hash({ steps: plan.steps, boundaries: plan.boundaries });
      const exec = fabricateExecForTarget(t, plan);
      const ev = engine.evaluateEvidence(sel.template, exec);
      runs.push({ plan, hash: h, completeness: ev.completeness, threshold: sel.template?.evidenceContract?.completenessThreshold || 0 });
    }
    const same = runs.every(r => r.hash === runs[0].hash);
    allPass = allPass && same;

    const stepsList = runs[0].plan.steps.map(s=>s.tool);
    const completeness = runs[0].completeness;
    const threshold = runs[0].threshold;
    const status = same ? '✅' : '❌';
    console.log(`${status} Target: ${t}`);
    console.log(`   Steps: [${stepsList.join(', ')}]`);
    console.log(`   Evidence: ${completeness.toFixed(2)} completeness (threshold: ${threshold}) ${completeness >= threshold ? '✅' : '❌'}`);
    console.log(`   Hash: ${runs[0].hash}`);
    if (!same) {
      console.log('   Hashes by run:');
      runs.forEach((r, idx) => console.log(`     - run${idx+1}: ${r.hash}`));
    }
    console.log('');
  }

  console.log(`🎯 Determinism Status: ${allPass ? 'PASS' : 'FAIL'}`);
  if (!allPass) process.exit(1);
}

main().catch(e=>{ console.error(e); process.exit(1); });
