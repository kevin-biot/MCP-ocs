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
import { ZONE_CONFLICT_SEVERITY_V1 } from '../../src/lib/rubrics/infrastructure/zone-conflict-severity.v1.ts';
import { SCHEDULING_CONFIDENCE_V1 } from '../../src/lib/rubrics/infrastructure/scheduling-confidence.v1.ts';
import { INFRASTRUCTURE_SAFETY_V1 } from '../../src/lib/rubrics/infrastructure/infrastructure-safety.v1.ts';

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

function sloInputsFor(t){
  const base = { ingressPending:0, route5xx:0, pvcBinding:0, crashloop:0, apiDegraded:0 };
  switch(t){
    case 'scheduling-failures': return base; // not mapped to CRITICAL/HIGH in v1
    default: return base;
  }
}

async function main(){
  const target = 'scheduling-failures';
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(target);
  if (!sel) throw new Error('Template not found');
  const engine = new TemplateEngine();
  const sessionId = `smoke-${target}-${Date.now()}`;
  const vars = { ns: 'openshift-ingress', pendingPod: 'router-default-xxxx' };
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 4, vars });
  const steps = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs }).filterSteps(plan.steps);
  const exec = [];
  const mk=(i,res)=>({ step: steps[Math.min(i, steps.length-1)], result: res });
  exec.push(mk(0,'Warning  FailedScheduling  default-scheduler: 0/2 nodes are available'));
  exec.push(mk(1,{ status:{ conditions:[{ type:'DeploymentRollingOut', status:'True' }] } }));
  exec.push(mk(2,{ spec:{ taints:[{ key:'node-role.kubernetes.io/master' }] }, labelsText:'Labels: topology.kubernetes.io/zone=a' }));
  exec.push(mk(3,{ sets:[{ name:'ms-a', replicas:3, zone:'a' }, { name:'ms-b', replicas:0, zone:'b' }] }));
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
    timeSinceFirstEventMin: 72
  };
  // Preset mapping to force specific badge levels without manual tuning
  const preset = String(process.env.SMOKE_PRESET || '').toUpperCase();
  const infraInputs = {
    zoneSkew: 0.75,
    capacityUtilization: 0.2,
    constraintViolations: 1,
    nodeAvailability: 0.8,
    resourceCapacity: 0.8,
    constraintSatisfaction: 0.8,
    clusterStability: true,
    nodeReadiness: 0.8,
    storageHealth: true
  };
  if (preset === 'SCHED_HIGH') {
    infraInputs.nodeAvailability = 0.9;
    infraInputs.resourceCapacity = 0.9;
    infraInputs.constraintSatisfaction = 0.9;
  } else if (preset === 'SCHED_MEDIUM') {
    infraInputs.nodeAvailability = 0.65;
    infraInputs.resourceCapacity = 0.65;
    infraInputs.constraintSatisfaction = 0.6;
  } else if (preset === 'SCHED_LOW') {
    infraInputs.nodeAvailability = 0.4;
    infraInputs.resourceCapacity = 0.4;
    infraInputs.constraintSatisfaction = 0.4;
  }
  const core = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1, confidence: EVIDENCE_CONFIDENCE_V1, safety: REMEDIATION_SAFETY_V1 }, inputs);
  const slo = evaluateRubrics({ slo: SLO_IMPACT_V1 }, sloInputsFor(target));
  const infra = evaluateRubrics({ zoneConflict: ZONE_CONFLICT_SEVERITY_V1, schedulingConfidence: SCHEDULING_CONFIDENCE_V1, infrastructureSafety: INFRASTRUCTURE_SAFETY_V1 }, infraInputs);
  const rubrics = { ...core, slo: slo.slo, infra };
  // Optional label-only assertion for CI
  const expected = process.env.EXPECTED_LABEL;
  if (expected) {
    const actual = String(infra?.schedulingConfidence?.label || 'Unknown');
    const ok = actual.toUpperCase() === String(expected).toUpperCase();
    if (!ok) {
      console.error(`Label assertion failed for SchedulingConfidence: expected=${expected}, actual=${actual}`);
      process.exit(1);
    }
  }
  const summary = {
    schemaVersion: '1.0.0',
    engineVersion: getEngineVersion(),
    templateId: sel.template.id,
    templateVersion: sel.template.version,
    determinism: determinism(),
    priority: { label: core?.triage?.label, score: Number(core?.triage?.score ?? 0) },
    confidence: { label: core?.confidence?.label, why: core?.confidence?.matched },
    safety: { allowAuto: Boolean(core?.safety?.allowAuto) },
    evidence: { completeness: Number(evidence?.completeness ?? 0), minThreshold: Number(sel.template?.evidenceContract?.completenessThreshold ?? 0), missing: evidence?.missing, present: evidence?.present },
    slo: slo?.slo ? { label: slo.slo.label, why: slo.slo.matched } : undefined,
    infra: { zoneConflict: infra?.zoneConflict?.label, schedulingConfidence: infra?.schedulingConfidence?.label, infrastructureSafety: { allowAuto: Boolean(infra?.infrastructureSafety?.allowAuto) } }
  };
  const outDir = path.join('logs','runs');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${Date.now()}-${sessionId}-${target}.summary.json`);
  fs.writeFileSync(file, JSON.stringify({ planId: sessionId, target, summary }, null, 2));
  console.error(`Saved summary: ${file}`);
  console.log(JSON.stringify({ steps: steps.map(s=>s.tool), evidence, rubrics }, null, 2));
}

main().catch(e=>{ console.error(e?.message||e); process.exit(1); });
