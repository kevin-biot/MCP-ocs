#!/usr/bin/env node
// Offline template coverage check: fabricate exec per template and assert evidence >= threshold
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';

const INFRA_LIVE_READS = String(process.env.INFRA_LIVE_READS || '').toLowerCase() === 'true';
if (INFRA_LIVE_READS) console.error('[template-coverage] INFRA_LIVE_READS=true (placeholder) — using fabricated exec for determinism');

const TARGETS = ['ingress-pending','crashloopbackoff','route-5xx','pvc-binding','api-degraded','zone-conflict','scheduling-failures','scale-instability'];

function fabricateExec(target, plan){
  const mk = (i,res)=>({ step: plan.steps[Math.min(i, plan.steps.length-1)], result: res });
  const exec=[];
  switch(target){
    case 'ingress-pending':
      exec.push(mk(0, { items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc'}] }));
      exec.push(mk(1, 'Warning  FailedScheduling  default-scheduler'));
      exec.push(mk(2, { status:{ conditions:[{ type:'DeploymentRollingOut', status:'True' }] } }));
      break;
    case 'crashloopbackoff':
      exec.push(mk(0, { items:[{metadata:{name:'pod-x'}}] }));
      exec.push(mk(1, { logs:{ tail:'...CrashLoopBackOff... OOMKilled ...' } }));
      exec.push(mk(2, { spec:{ containers:[{ livenessProbe:{} }] } }));
      break;
    case 'route-5xx':
      exec.push(mk(0, { subsets:[{ addresses:[{ ip:'10.0.0.1' }] }] }));
      exec.push(mk(1, { spec:{ tls:{} } }));
      exec.push(mk(2, { spec:{ containers:[{ readinessProbe:{} }] } }));
      break;
    case 'pvc-binding':
      exec.push(mk(0, { spec:{ accessModes:['ReadWriteOnce'] } }));
      exec.push(mk(1, { parameters:{ provisioner: 'kubernetes.io/aws-ebs' } }));
      exec.push(mk(2, { status:{ hard:{ 'requests.storage':'100Gi' } } }));
      exec.push(mk(2, 'WaitForFirstConsumer; allowedTopologies: topology.kubernetes.io/zone; no matching topology'));
      break;
    case 'api-degraded':
      exec.push(mk(0, 'kube-apiserver Degraded True'));
      exec.push(mk(1, 'timeout connecting to etcd'));
      break;
    case 'zone-conflict':
      exec.push(mk(0, { sets:[{name:'ms-a', replicas:3, zone:'a'},{name:'ms-b', replicas:1, zone:'b'}] }));
      exec.push(mk(1, { zones:['a','b'], skew:0.85, capacity:{ utilization:0.8 } }));
      exec.push(mk(2, 'Warning  FailedScheduling  Insufficient resources on zone a'));
      break;
    case 'scheduling-failures':
      // Step 0: pod describe text with FailedScheduling
      exec.push(mk(0, 'Warning  FailedScheduling  default-scheduler: 0/2 nodes are available'));
      // Step 1: ingresscontroller describe-like JSON (conditions array)
      exec.push(mk(1, { status:{ conditions:[{ type:'DeploymentRollingOut', status:'True', reason:'DeploymentRollingOut' }] } }));
      // Step 2: node describe-like JSON containing taints and a labels text field
      exec.push(mk(2, { spec:{ taints:[{ key:'node-role.kubernetes.io/master' }] }, labelsText:'Labels: topology.kubernetes.io/zone=a' }));
      // Step 3: machinesets with zones
      exec.push(mk(3, { sets:[{ name:'ms-a', replicas:3, zone:'a' }, { name:'ms-b', replicas:0, zone:'b' }] }));
      break;
    case 'scale-instability':
      exec.push(mk(0, { schemaVersion:'v1', sets:[{ name:'ms-a', replicas:3, zone:'a' }, { name:'ms-b', replicas:1, zone:'b' }], replicasDesired:4, replicasCurrent:3, replicasReady:3, lastScaleEvent:'Scaled up 1 (5m ago)', autoscaler:true }));
      exec.push(mk(1, { schemaVersion:'v1', zones:['a','b'], nodes:[{name:'n1',zone:'a',ready:true},{name:'n2',zone:'b',ready:false}], ready:1, total:2, conditions:{ MemoryPressure:true, DiskPressure:false, PIDPressure:false, NetworkUnavailable:false }, capacity:{ utilization:0.85 }, allocatable:{ cpu:'8', memory:'32Gi' } }));
      break;
  }
  return exec;
}

async function main(){
  const reg = new TemplateRegistry();
  await reg.load();
  const engine = new TemplateEngine();
  const failures=[];
  for (const t of TARGETS){
    const sel = reg.selectByTarget(t);
    if (!sel){ failures.push({ target:t, error:'no template' }); continue; }
    const plan = engine.buildPlan(sel.template, { sessionId:`cov-${t}`, bounded:true, stepBudget: sel.template.boundaries.maxSteps || 3, vars:{ ns:'demo-ns', route:'route-a', service:'svc-a', backendPod:'pod-a', pod:'pod-x', container:'c1', pvc:'pvc-a', sc:'standard' } });
    const exec = fabricateExec(t, plan);
    const ev = engine.evaluateEvidence(sel.template, exec);
    const thr = Number(sel.template?.evidenceContract?.completenessThreshold || 0);
    if (!(ev.completeness >= thr)) failures.push({ target:t, completeness:ev.completeness, threshold:thr });
  }
  if (failures.length){
    console.error(JSON.stringify({ failures }, null, 2));
    process.exit(1);
  } else {
    console.log(JSON.stringify({ ok:true, targets: TARGETS }, null, 2));
  }
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
