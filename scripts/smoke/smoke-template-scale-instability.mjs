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
import { SCALE_INSTABILITY_V1 } from '../../src/lib/rubrics/infrastructure/scale-instability.v1.ts';
import { CAPACITY_TRIAGE_V1 } from '../../src/lib/rubrics/infrastructure/capacity-triage.v1.ts';

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
  const target = 'scale-instability';
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(target);
  if (!sel) throw new Error('Template not found');
  const engine = new TemplateEngine();
  const sessionId = `smoke-${target}-${Date.now()}`;
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 2, vars: { } });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  const exec = [];
  const mk=(i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  // Positive fixture
  exec.push(mk(0,{ schemaVersion:'v1', sets:[{name:'ms-a',replicas:3,zone:'a'},{name:'ms-b',replicas:1,zone:'b'}], replicasDesired:4, replicasCurrent:3, replicasReady:3, lastScaleEvent:'Scaled up 1 (5m ago)', autoscaler:true }));
  exec.push(mk(1,{ schemaVersion:'v1', zones:['a','b'], nodes:[{name:'n1',zone:'a',ready:true},{name:'n2',zone:'b',ready:false}], ready:1, total:2, conditions:{ MemoryPressure:true, DiskPressure:false, PIDPressure:false, NetworkUnavailable:false }, capacity:{ utilization:0.85 }, allocatable:{ cpu:'8', memory:'32Gi' } }));
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
    // infra
    desiredMinusCurrentAbs: 1,
    capacityUtilization: 0.85,
    memoryPressure: true,
    pidPressure: false,
    diskPressure: false
  };
  const core = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1, confidence: EVIDENCE_CONFIDENCE_V1, safety: REMEDIATION_SAFETY_V1, slo: SLO_IMPACT_V1 }, inputs);
  const infra = evaluateRubrics({ scaleInstability: SCALE_INSTABILITY_V1, capacityTriage: CAPACITY_TRIAGE_V1 }, inputs);
  const summary = {
    schemaVersion: '1.0.0', engineVersion: getEngineVersion(),
    templateId: sel.template.id, templateVersion: sel.template.version,
    determinism: determinism(),
    priority: { label: core?.triage?.label, score: Number(core?.triage?.score ?? 0) },
    confidence: { label: core?.confidence?.label, why: core?.confidence?.matched },
    safety: { allowAuto: Boolean(core?.safety?.allowAuto) },
    evidence: { completeness: Number(evidence?.completeness ?? 0), minThreshold: Number(sel.template?.evidenceContract?.completenessThreshold ?? 0), missing: evidence?.missing, present: evidence?.present },
    slo: core && core.slo ? { label: core.slo.label, why: core.slo.matched } : undefined,
    infra: { scale: infra?.scaleInstability?.label, capacity: infra?.capacityTriage?.label }
  };
  const outDir = path.join('logs','runs');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${Date.now()}-${sessionId}-${target}.summary.json`);
  fs.writeFileSync(file, JSON.stringify({ planId: sessionId, target, summary }, null, 2));
  console.error(`Saved summary: ${file}`);
  console.log(JSON.stringify({ steps: steps.map(s=>s.tool), evidence, rubrics: { core, infra } }, null, 2));
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
