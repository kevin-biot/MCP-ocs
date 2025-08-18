#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';
import { BoundaryEnforcer } from '../../src/lib/enforcement/boundary-enforcer.js';
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { SLO_IMPACT_V1 } from '../../src/lib/rubrics/core/slo-impact.v1.ts';
import { TRIAGE_PRIORITY_V1 } from '../../src/lib/rubrics/core/triage-priority.v1.ts';
import { EVIDENCE_CONFIDENCE_V1 } from '../../src/lib/rubrics/core/evidence-confidence.v1.ts';
import { REMEDIATION_SAFETY_V1 } from '../../src/lib/rubrics/core/remediation-safety.v1.ts';

const INFRA_LIVE_READS = String(process.env.INFRA_LIVE_READS || '').toLowerCase() === 'true';
if (INFRA_LIVE_READS) console.error('[golden-compare] INFRA_LIVE_READS=true (placeholder) — using fabricated exec for determinism');

const TARGETS = [
  'ingress-pending','crashloopbackoff','route-5xx','pvc-binding','pvc-storage-affinity','api-degraded','zone-conflict','scheduling-failures','scale-instability',
  'cluster-health-fanout-ingress','cluster-health-fanout-pvc','cluster-health-fanout-churn','cluster-health-negative',
  'cluster-health-ingress-degraded','cluster-health-monitoring-degraded','cluster-health-clean'
];
const SCORE_DELTA_TOL = Number(process.env.SCORE_DELTA_TOL ?? 0);

function loadGolden(t){
  const file = path.join('docs','golden-templates',`${t}.json`);
  if (!fs.existsSync(file)) throw new Error(`Golden not found: ${file}`);
  return JSON.parse(fs.readFileSync(file,'utf8'));
}

function determinism(){
  return {
    modelName: process.env.LMSTUDIO_MODEL || process.env.MODEL_NAME || 'none',
    system_fingerprint: process.env.SYSTEM_FINGERPRINT || process.env.LMSTUDIO_SYSTEM_FINGERPRINT || 'none',
    temperature: Number(process.env.LM_TEMPERATURE ?? 0),
    top_p: Number(process.env.LM_TOP_P ?? 1),
    seed: Number(process.env.LM_SEED ?? 42)
  };
}

function lookupTarget(t){ return t.startsWith('cluster-health') ? 'cluster-health' : t; }

async function actual(t){
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(lookupTarget(t));
  if (!sel) throw new Error(`Template not found: ${t}`);
  const engine = new TemplateEngine();
  const sessionId = `compare-${t}`;
  const vars = { ns: 'openshift-ingress', pendingRouterPod: 'router-default-xxxx', selector: 'app=x', pod: 'pod-x', container: 'c1', service: 'svc-a', route: 'route-a', backendPod: 'pod-a', pvc: 'pvc-a', sc: 'standard' };
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 3, vars });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  // mimic golden fabrication to ensure determinism
  const exec = [];
  const mk = (i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  switch(t){
    case 'ingress-pending':
      exec.push(mk(0,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc'}]}));
      exec.push(mk(1,'Warning  FailedScheduling  default-scheduler'));
      exec.push(mk(2,{ status:{ conditions:[{ type:'DeploymentRollingOut', status:'True', reason:'DeploymentRollingOut', message:'...' }]}}));
      break;
    case 'crashloopbackoff':
      exec.push(mk(0,{ items:[{metadata:{name:'pod-x'}}]}));
      exec.push(mk(1,{ logs:{ tail:'...logs.tail...' } }));
      exec.push(mk(2,{ spec:{ containers:[{ livenessProbe:{} }] } }));
      break;
    case 'route-5xx':
      exec.push(mk(0,{ subsets:[{ addresses:[{ ip:'10.0.0.1' }] }]}));
      exec.push(mk(1,{ spec:{ tls:{} } }));
      exec.push(mk(2,{ spec:{ containers:[{ readinessProbe:{} }] } }));
      break;
    case 'pvc-binding':
      exec.push(mk(0,{ spec:{ accessModes:['ReadWriteOnce'] } }));
      exec.push(mk(1,{ parameters:{ provisioner:'kubernetes.io/aws-ebs' } }));
      exec.push(mk(2,{ status:{ hard:{ 'requests.storage':'100Gi' } } }));
      exec.push(mk(2,'WaitForFirstConsumer; allowedTopologies: topology.kubernetes.io/zone; no matching topology'));
      break;
    case 'pvc-storage-affinity':
      exec.push(mk(0,{ spec:{ accessModes:['ReadWriteOnce'], storageClassName:'standard' }, status:{ phase:'Pending' } }));
      exec.push(mk(1,{ spec:{ nodeAffinity:{ required:{ nodeSelectorTerms:[{ matchExpressions:[{ key:'topology.kubernetes.io/zone', operator:'In', values:['b'] }] }] } } } }));
      exec.push(mk(1,'no matching topology for requested zone'));
      exec.push(mk(2,{ volumeBindingMode:'WaitForFirstConsumer', parameters:{ type:'gp2' }, allowedTopologies:['topology.kubernetes.io/zone'] }));
      exec.push(mk(2,'provisioning failed: timed out waiting for PV'));
      exec.push(mk(3,{ sets:[{name:'ms-a',replicas:3,zone:'a'},{name:'ms-b',replicas:1,zone:'b'}], lastScaleEvent:'Scaled up 1 (5m ago)', autoscaler:true }));
      break;
    case 'zone-conflict':
      exec.push(mk(0,{ sets:[{name:'ms-a', replicas:3, zone:'a'},{name:'ms-b', replicas:1, zone:'b'}]}));
      exec.push(mk(1,{ zones:['a','b'], skew:0.85, capacity:{ utilization:0.8 } }));
      exec.push(mk(2,'Warning  FailedScheduling  Insufficient resources on zone a'));
      break;
    case 'scheduling-failures':
      exec.push(mk(0,'Warning  FailedScheduling  default-scheduler: 0/2 nodes are available'));
      exec.push(mk(1,{ status:{ conditions:[{ type:'DeploymentRollingOut', status:'True' }] } }));
      exec.push(mk(2,{ spec:{ taints:[{ key:'node-role.kubernetes.io/master' }] }, labelsText:'Labels: topology.kubernetes.io/zone=a' }));
      exec.push(mk(3,{ sets:[{ name:'ms-a', replicas:3, zone:'a' }, { name:'ms-b', replicas:0, zone:'b' }] }));
      break;
    case 'scale-instability':
      exec.push(mk(0,{ schemaVersion:'v1', sets:[{name:'ms-a',replicas:3,zone:'a'},{name:'ms-b',replicas:1,zone:'b'}], replicasDesired:4, replicasCurrent:3, replicasReady:3, lastScaleEvent:'Scaled up 1 (5m ago)', autoscaler:true }));
      exec.push(mk(1,{ schemaVersion:'v1', zones:['a','b'], nodes:[{name:'n1',zone:'a',ready:true},{name:'n2',zone:'b',ready:false}], ready:1, total:2, conditions:{ MemoryPressure:true, DiskPressure:false, PIDPressure:false, NetworkUnavailable:false }, capacity:{ utilization:0.85 }, allocatable:{ cpu:'8', memory:'32Gi' } }));
      break;
    case 'cluster-health-fanout-ingress':
      exec.push(mk(0,'Degraded False; Available True'));
      exec.push(mk(1,{ total: 5, ready: 5 }));
      exec.push(mk(2,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc', ready:'0/1'}] }));
      exec.push(mk(2,'router pending'));
      break;
    case 'cluster-health-fanout-pvc':
      exec.push(mk(0,'Degraded False; Available True'));
      exec.push(mk(1,{ total: 5, ready: 5 }));
      exec.push(mk(2,'WaitForFirstConsumer; no matching topology'));
      break;
    case 'cluster-health-fanout-churn':
      exec.push(mk(0,'Progressing True'));
      exec.push(mk(1,{ total: 5, ready: 4 }));
      exec.push(mk(2,'Scaled up 1 (5m ago); replicas 3->4'));
      break;
    case 'cluster-health-negative':
      exec.push(mk(0,'All Operators Available True'));
      exec.push(mk(1,{ total: 5, ready: 5 }));
      exec.push(mk(2,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc', ready:'1/1'}] }));
      break;
    case 'cluster-health-ingress-degraded':
      exec.push(mk(0,'Degraded True; Available False; DeploymentReplicasAllAvailable: False'));
      exec.push(mk(1,{ total: 5, ready: 4 }));
      exec.push(mk(2,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc', ready:'0/1'}] }));
      exec.push(mk(2,'ingress pending; availableReplicas: 1\n...\nreplicas: 2\n\n type: DeploymentRollingOut\n status: True\n type: Degraded\n status: True'));
      break;
    case 'cluster-health-monitoring-degraded':
      exec.push(mk(0,'name: monitoring\nDegraded True; UpdatingPrometheusOperator'));
      exec.push(mk(1,{ total: 5, ready: 5 }));
      exec.push(mk(2,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc', ready:'1/1'}] }));
      exec.push(mk(2,'Scaled up 1 (5m ago)'));
      break;
    case 'cluster-health-clean':
      exec.push(mk(0,'All Operators Available True'));
      exec.push(mk(1,{ total: 5, ready: 5 }));
      exec.push(mk(2,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc', ready:'1/1'}] }));
      break;
    default:
      for (let i=0;i<steps.length && i<3;i++) exec.push(mk(i,{ ok:true }));
  }
  const evidence = engine.evaluateEvidence(sel.template, exec);
  const inputs = {
    evidenceCompleteness: Number(evidence?.completeness ?? 0),
    toolAgreement: 0.85,
    freshnessMin: 5,
    etcdHealthy: true,
    controlPlaneReadyRatio: 0.67,
    affectedNamespaces: 1,
    noCriticalAlerts: true,
    blastRadius: t==='ingress-pending' ? 1 : 0.7,
    customerPaths: t==='ingress-pending' ? 1 : 0.5,
    operatorsDegraded: 0.5,
    timeSinceFirstEventMin: 72
  };
  // Adjust cluster-health severity for new degraded/clean cases
  if (t === 'cluster-health-ingress-degraded' || t === 'cluster-health-monitoring-degraded') {
    inputs.blastRadius = 1;
    inputs.customerPaths = 1;
    inputs.operatorsDegraded = 1;
  }
  if (t === 'cluster-health-clean') {
    inputs.blastRadius = 0.5;
    inputs.customerPaths = 0.3;
    inputs.operatorsDegraded = 0;
  }
  const slo = sloInputsFor(t);
  const rubrics = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1, confidence: EVIDENCE_CONFIDENCE_V1, safety: REMEDIATION_SAFETY_V1, slo: SLO_IMPACT_V1 }, { ...inputs, ...slo });
  if (t.startsWith('cluster-health')) {
    const ingressSignal = t.includes('ingress') ? 1 : 0;
    const pvcSignal = t.includes('pvc') ? 1 : 0;
    const churnSignal = t.includes('churn') ? 1 : 0;
    const { META_DISPATCH_CONFIDENCE_V1 } = await import('../../src/lib/rubrics/meta/meta-dispatch-confidence.v1.ts');
    const meta = evaluateRubrics({ meta: META_DISPATCH_CONFIDENCE_V1 }, { ingressSignal, pvcSignal, churnSignal });
    (rubrics).meta = meta.meta;
  }
  return { target: t, steps: steps.map(s=>s.tool), evidence, rubrics, determinism: determinism() };
}

function sloInputsFor(t){
  const base = { ingressPending:0, route5xx:0, pvcBinding:0, crashloop:0, apiDegraded:0, clusterHealthDegraded:0 };
  switch(t){
    case 'ingress-pending': return { ...base, ingressPending:1 };
    case 'route-5xx': return { ...base, route5xx:1 };
    case 'pvc-binding': return { ...base, pvcBinding:1 };
    case 'crashloopbackoff': return { ...base, crashloop:1 };
    case 'api-degraded': return { ...base, apiDegraded:1 };
    case 'cluster-health-ingress-degraded': return { ...base, clusterHealthDegraded:1 };
    case 'cluster-health-monitoring-degraded': return { ...base, clusterHealthDegraded:1 };
    default: return base;
  }
}

function diff(g,a){
  const diffs=[];
  // determinism envelope strict
  const de = ['modelName','system_fingerprint','temperature','top_p','seed'];
  for (const k of de){
    if (String(g?.determinism?.[k]) !== String(a?.determinism?.[k])) {
      diffs.push({ path:`determinism.${k}`, expected:g?.determinism?.[k], actual:a?.determinism?.[k], severity:'breaking' });
    }
  }
  // strict: steps
  if (JSON.stringify(g.steps)!==JSON.stringify(a.steps)) diffs.push({ path:'steps', expected:g.steps, actual:a.steps, severity:'breaking' });
  // evidence: completeness exact in dry-run (fabricated), and presence of required keys
  if (g.evidence?.completeness !== a.evidence?.completeness) diffs.push({ path:'evidence.completeness', expected:g.evidence?.completeness, actual:a.evidence?.completeness, severity:'breaking' });
  if (JSON.stringify(g.evidence?.present)!==JSON.stringify(a.evidence?.present)) diffs.push({ path:'evidence.present', expected:g.evidence?.present, actual:a.evidence?.present, severity:'breaking' });
  // rubrics labels strict, scores can vary slightly but should match deterministically; keep strict here
  const gl = { triage:g.rubrics?.triage?.label, confidence:g.rubrics?.confidence?.label, safety:g.rubrics?.safety?.allowAuto, slo:g.rubrics?.slo?.label };
  const al = { triage:a.rubrics?.triage?.label, confidence:a.rubrics?.confidence?.label, safety:a.rubrics?.safety?.allowAuto, slo:a.rubrics?.slo?.label };
  if (JSON.stringify(gl)!==JSON.stringify(al)) diffs.push({ path:'rubrics.labels', expected:gl, actual:al, severity:'breaking' });
  // cosmetic: rubric score exact equality (still check but mark cosmetic)
  const gs = Number(g.rubrics?.triage?.score ?? 0);
  const as = Number(a.rubrics?.triage?.score ?? 0);
  if (gs !== as) {
    const delta = as - gs;
    const sev = Math.abs(delta) > SCORE_DELTA_TOL ? 'cosmetic' : 'info';
    diffs.push({ path:'rubrics.triage.score', expected:gs, actual:as, delta, severity: sev });
  }
  return diffs;
}

async function main(){
  const results=[];
  let breaking=false;
  for (const t of TARGETS){
    const g = loadGolden(t);
    const a = await actual(t);
    const d = diff(g,a);
    results.push({ target:t, diffs:d });
    if (d.some(x=>x.severity==='breaking')) breaking=true;
  }
  console.log(JSON.stringify({ results }, null, 2));
  if (breaking) process.exit(1);
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
