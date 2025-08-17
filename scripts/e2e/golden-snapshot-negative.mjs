#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';
import { BoundaryEnforcer } from '../../src/lib/enforcement/boundary-enforcer.js';
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { TRIAGE_PRIORITY_V1 } from '../../src/lib/rubrics/core/triage-priority.v1.ts';
import { EVIDENCE_CONFIDENCE_V1 } from '../../src/lib/rubrics/core/evidence-confidence.v1.ts';
import { REMEDIATION_SAFETY_V1 } from '../../src/lib/rubrics/core/remediation-safety.v1.ts';

const TARGETS = ['ingress-pending','crashloopbackoff','route-5xx','pvc-binding'];

function getEngineVersion(){
  try { return JSON.parse(fs.readFileSync('package.json','utf8'))?.version || '0.0.0'; } catch { return '0.0.0'; }
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

async function planAndEvalNegative(templateId){
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(templateId);
  if (!sel) throw new Error(`Template not found: ${templateId}`);
  const engine = new TemplateEngine();
  const sessionId = `golden-neg-${templateId}`;
  const vars = { ns: 'openshift-ingress', pendingRouterPod: 'router-default-xxxx', selector: 'app=x', pod: 'pod-x', container: 'c1', service: 'svc-a', route: 'route-a', backendPod: 'pod-a', pvc: 'pvc-a', sc: 'standard' };
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 3, vars });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  const exec = [];
  const mk=(i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  switch(templateId){
    case 'ingress-pending':
      exec.push(mk(0,{ items:[{metadata:{name:'router-default-abc'}}], pods:[{name:'router-default-abc'}]}));
      exec.push(mk(1,'No scheduling issues here'));// missing FailedScheduling
      exec.push(mk(2,{ status:{ conditions:[{ type:'DeploymentRollingOut', status:'True' }]}}));
      break;
    case 'crashloopbackoff':
      exec.push(mk(0,{ items:[{metadata:{name:'pod-x'}}]}));
      exec.push(mk(1,{ logs:{ tail:'...logs.tail...' } }));
      exec.push(mk(2,{ spec:{ containers:[{ }] } })); // missing probe
      break;
    case 'route-5xx':
      exec.push(mk(0,{ subsets: [] })); // missing endpoints
      exec.push(mk(1,{ spec:{ } }));
      exec.push(mk(2,{ spec:{ containers:[{ }] } }));
      break;
    case 'pvc-binding':
      exec.push(mk(0,{ spec:{ } }));
      exec.push(mk(1,{ parameters: { } }));
      exec.push(mk(2,{ status:{ } }));
      break;
    default:
      for (let i=0;i<steps.length && i<3;i++) exec.push(mk(i,{ }));
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
    blastRadius: templateId==='ingress-pending' ? 1 : 0.7,
    customerPaths: templateId==='ingress-pending' ? 1 : 0.5,
    operatorsDegraded: 0.5,
    timeSinceFirstEventMin: 72
  };
  const rubrics = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1, confidence: EVIDENCE_CONFIDENCE_V1, safety: REMEDIATION_SAFETY_V1 }, inputs);
  return {
    schemaVersion:'1.0.0', engineVersion:getEngineVersion(), templateId: sel.template.id, templateVersion: sel.template.version,
    rubricVersions: { triage: TRIAGE_PRIORITY_V1.id, confidence: EVIDENCE_CONFIDENCE_V1.id, safety: REMEDIATION_SAFETY_V1.id },
    determinism: determinism(),
    target: templateId, steps: steps.map(s=>s.tool), evidence, rubricInputs: inputs, rubrics
  };
}

async function main(){
  const outDir = path.join('docs','golden-templates-negative');
  fs.mkdirSync(outDir, { recursive: true });
  for (const t of TARGETS) {
    const data = await planAndEvalNegative(t);
    const file = path.join(outDir, `${t}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.error(`Saved negative golden: ${file}`);
  }
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });

