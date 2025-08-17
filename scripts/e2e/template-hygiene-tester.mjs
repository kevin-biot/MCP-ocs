#!/usr/bin/env node
import { LMStudioConnector } from './test-harness-connector.js';
import { TemplateRegistry } from '../../src/lib/templates/template-registry.js';
import { TemplateEngine } from '../../src/lib/templates/template-engine.js';
import { BoundaryEnforcer } from '../../src/lib/enforcement/boundary-enforcer.js';
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { TRIAGE_PRIORITY_V1 } from '../../src/lib/rubrics/core/triage-priority.v1.ts';
import { EVIDENCE_CONFIDENCE_V1 } from '../../src/lib/rubrics/core/evidence-confidence.v1.ts';
import { REMEDIATION_SAFETY_V1 } from '../../src/lib/rubrics/core/remediation-safety.v1.ts';

const TARGET_ALIASES = {
  'cluster-health': 'ingress-pending', // placeholder mapping for now
  'monitoring': 'crashloopbackoff',
  'networking': 'route-5xx',
  'storage': 'pvc-binding'
};

const TEST_PROMPTS = {
  'cluster-health': 'Analyze cluster health issues with dynamic node discovery',
  'monitoring': 'Investigate API latency with evidence scoring',
  'networking': 'Debug service connectivity with robust error handling',
  'storage': 'Analyze PVC binding with mixed JSON/text parsing'
};

function pickTarget(arg){
  const key = (arg || '').toLowerCase();
  return TARGET_ALIASES[key] || key || 'ingress-pending';
}

async function execPlan(templateId){
  const reg = new TemplateRegistry();
  await reg.load();
  const sel = reg.selectByTarget(templateId);
  if (!sel) throw new Error(`Template not found for target: ${templateId}`);
  const engine = new TemplateEngine();
  const sessionId = `hygiene-${templateId}-${Date.now()}`;
  // Provide broad default vars that work across templates
  const vars = { ns: 'openshift-ingress', pendingRouterPod: 'router-default-xxxx', selector: 'app=x', pod: 'pod-x', container: 'c1', service: 'svc-a', route: 'route-a', backendPod: 'pod-a', pvc: 'pvc-a', sc: 'standard' };
  const plan = engine.buildPlan(sel.template, { sessionId, bounded: true, stepBudget: 3, vars });
  const enforcer = new BoundaryEnforcer({ maxSteps: plan.boundaries.maxSteps, timeoutMs: plan.boundaries.timeoutMs });
  const steps = enforcer.filterSteps(plan.steps);
  // Fabricate execution results that satisfy evidence selectors per template
  function fabricateExecForTarget(target, plan){
    const exec = [];
    const mk = (i, res) => ({ step: plan.steps[Math.min(i, plan.steps.length-1)], result: res });
    switch (target) {
      case 'ingress-pending':
        exec.push(mk(0, { items: [ { metadata: { name: 'router-default-abc' } } ], pods: [ { name: 'router-default-abc' } ] }));
        exec.push(mk(1, 'Warning  FailedScheduling  default-scheduler'));
        exec.push(mk(2, { status: { conditions: [ { type:'DeploymentRollingOut', status:'True', reason:'DeploymentRollingOut', message:'...' } ] } }));
        break;
      case 'crashloopbackoff':
        exec.push(mk(0, { items: [ { metadata: { name:'pod-x' } } ] }));
        exec.push(mk(1, { logs: { tail: '...logs.tail...' } }));
        exec.push(mk(2, { spec: { containers: [ { livenessProbe: {} } ] } }));
        break;
      case 'route-5xx':
        exec.push(mk(0, { subsets: [ { addresses: [ { ip: '10.0.0.1' } ] } ] }));
        exec.push(mk(1, { spec: { tls: {} } }));
        exec.push(mk(2, { spec: { containers: [ { readinessProbe: {} } ] } }));
        break;
      case 'pvc-binding':
        exec.push(mk(0, { spec: { accessModes: ['ReadWriteOnce'] } }));
        exec.push(mk(1, { parameters: { provisioner: 'kubernetes.io/aws-ebs' } }));
        exec.push(mk(2, { status: { hard: { 'requests.storage':'100Gi' } } }));
        break;
      case 'scheduling-failures':
        exec.push(mk(0, 'FailedScheduling: 0/4 nodes available'));
        exec.push(mk(1, { status: { conditions: [ { type:'Progressing', status:'True' } ] } }));
        exec.push(mk(2, { spec: { taints: [ { key: 'node-role.kubernetes.io/master' } ] } }));
        break;
      default:
        for (let i=0;i<plan.steps.length && i<3;i++) exec.push(mk(i,{ ok:true }));
    }
    return exec;
  }
  const exec = fabricateExecForTarget(templateId, { steps });
  const evidence = engine.evaluateEvidence(sel.template, exec);
  const threshold = Number(sel.template?.evidenceContract?.completenessThreshold || 0.9);
  const rubrics = evaluateRubrics({
    triage: TRIAGE_PRIORITY_V1,
    confidence: EVIDENCE_CONFIDENCE_V1,
    safety: REMEDIATION_SAFETY_V1
  }, fabricateRubricInputs(templateId, evidence));
  return { target: templateId, steps: steps.map(s=>s.tool), evidence, threshold, rubrics };
}

async function main(){
  const arg = process.argv[2];
  const target = pickTarget(arg);
  const conn = new LMStudioConnector();
  const prompt = TEST_PROMPTS[arg] || `Evaluate template ${target}`;
  const lm = await conn.sendDiagnosticPrompt(prompt);
  if (process.env.DEBUG === 'true') {
    console.error('[DEBUG] LM Studio response:', JSON.stringify(lm, null, 2));
  }
  const local = await execPlan(target);
  const rubricExpected = expectedRubricLabels(target, local.evidence);
  const out = {
    target,
    lmStudio: lm,
    localPlan: local,
    status: {
      evidencePass: local.evidence.completeness >= local.threshold,
      rubricPass: Boolean(local.rubrics && local.rubrics.triage?.label === rubricExpected.triage && local.rubrics.confidence?.label === rubricExpected.confidence && local.rubrics.safety?.allowAuto === rubricExpected.allowAuto),
      steps: local.steps
    }
  };
  console.log(JSON.stringify(out, null, 2));
  if (!out.status.evidencePass || out.status.rubricPass === false) process.exit(1);
}

main().catch(e=>{ console.error(e?.message || e); process.exit(1); });

function fabricateRubricInputs(target, evidence){
  return {
    evidenceCompleteness: Number(evidence?.completeness ?? 0),
    toolAgreement: 0.85,
    freshnessMin: 5,
    etcdHealthy: true,
    controlPlaneReadyRatio: 0.67,
    affectedNamespaces: 1,
    noCriticalAlerts: true,
    blastRadius: target === 'ingress-pending' ? 1 : 0.7,
    customerPaths: target === 'ingress-pending' ? 1 : 0.5,
    operatorsDegraded: 0.5,
    timeSinceFirstEventMin: 72
  };
}

function expectedRubricLabels(target, evidence){
  const triage = (target === 'ingress-pending') ? 'P1' : 'P2';
  const conf = Number(evidence?.completeness ?? 0) >= 0.9 ? 'High' : 'Low';
  return { triage, confidence: conf, allowAuto: true };
}
