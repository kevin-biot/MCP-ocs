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
import { SLO_IMPACT_V1 } from '../../src/lib/rubrics/core/slo-impact.v1.ts';
import { STORAGE_AFFINITY_V1 } from '../../src/lib/rubrics/infrastructure/storage-affinity.v1.ts';

function determinism(){
  return {
    modelName: process.env.LMSTUDIO_MODEL || process.env.MODEL_NAME || 'none',
    system_fingerprint: process.env.SYSTEM_FINGERPRINT || process.env.LMSTUDIO_SYSTEM_FINGERPRINT || 'none',
    temperature: Number(process.env.LM_TEMPERATURE ?? 0),
    top_p: Number(process.env.LM_TOP_P ?? 1),
    seed: Number(process.env.LM_SEED ?? 42)
  };
}

function getEngineVersion(){
  try { return JSON.parse(fs.readFileSync('package.json','utf8'))?.version || '0.0.0'; } catch { return '0.0.0'; }
}

async function main(){
  const target = 'pvc-storage-affinity';
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(target);
  if (!sel) throw new Error('Template not found');
  const engine = new TemplateEngine();
  const sessionId = `smoke-${target}-${Date.now()}`;
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 4, vars: { ns:'ns-a', pvc:'pvc-a', sc:'standard' } });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  const exec = [];
  const mk=(i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  // Positive fixture: WFFC + topo hint + PV zone mismatch + recent scale + provisioning slow
  exec.push(mk(0,{ spec:{ accessModes:['ReadWriteOnce'], storageClassName:'standard' }, status:{ phase:'Pending' } }));
  exec.push(mk(1,{ spec:{ nodeAffinity:{ required:{ nodeSelectorTerms:[{ matchExpressions:[{ key:'topology.kubernetes.io/zone', operator:'In', values:['b'] }] }] } } } }));
  exec.push(mk(1,'no matching topology for requested zone'));
  exec.push(mk(2,{ volumeBindingMode:'WaitForFirstConsumer', parameters:{ type:'gp2' }, allowedTopologies:['topology.kubernetes.io/zone'] }));
  exec.push(mk(2,'provisioning failed: timed out waiting for PV'));
  exec.push(mk(3,{ sets:[{name:'ms-a',replicas:3,zone:'a'},{name:'ms-b',replicas:1,zone:'b'}], lastScaleEvent:'Scaled up 1 (5m ago)', autoscaler:true }));
  const evidence = engine.evaluateEvidence(sel.template, exec);
  const inputs = {
    evidenceCompleteness: Number(evidence?.completeness ?? 0),
    toolAgreement: 0.85,
    freshnessMin: 5,
    etcdHealthy: true,
    controlPlaneReadyRatio: 0.67,
    affectedNamespaces: 1,
    noCriticalAlerts: true,
    blastRadius: 0.7,
    customerPaths: 0.5,
    operatorsDegraded: 0.5,
    timeSinceFirstEventMin: 72,
    // storage-affinity rubric inputs approximated from signals
    wffc: true,
    noPvZoneMatch: true,
    provisionerSlow: true,
    bindingProgressing: false,
    recentScaleMin: 5
  };
  const core = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1, confidence: EVIDENCE_CONFIDENCE_V1, safety: REMEDIATION_SAFETY_V1, slo: SLO_IMPACT_V1 }, inputs);
  const infra = evaluateRubrics({ storageAffinity: STORAGE_AFFINITY_V1 }, inputs);
  const summary = {
    schemaVersion: '1.0.0', engineVersion: getEngineVersion(),
    templateId: sel.template.id, templateVersion: sel.template.version,
    determinism: determinism(),
    priority: { label: core?.triage?.label, score: Number(core?.triage?.score ?? 0) },
    confidence: { label: core?.confidence?.label, why: core?.confidence?.matched },
    safety: { allowAuto: Boolean(core?.safety?.allowAuto) },
    evidence: { completeness: Number(evidence?.completeness ?? 0), minThreshold: Number(sel.template?.evidenceContract?.completenessThreshold ?? 0), missing: evidence?.missing, present: evidence?.present },
    slo: core && core.slo ? { label: core.slo.label, why: core.slo.matched } : undefined,
    infra: { storageAffinity: infra?.storageAffinity?.label }
  };
  const outDir = path.join('logs','runs');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${Date.now()}-${sessionId}-${target}.summary.json`);
  fs.writeFileSync(file, JSON.stringify({ planId: sessionId, target, summary }, null, 2));
  console.error(`Saved summary: ${file}`);
  console.log(JSON.stringify({ steps: steps.map(s=>s.tool), evidence, rubrics: { core, infra } }, null, 2));
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
