#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { TemplateEngine } from '../../src/lib/templates/template-engine.ts';
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { EVIDENCE_CONFIDENCE_V1 } from '../../src/lib/rubrics/core/evidence-confidence.v1.ts';
import { TRIAGE_PRIORITY_V1 } from '../../src/lib/rubrics/core/triage-priority.v1.ts';
import { SLO_IMPACT_V1 } from '../../src/lib/rubrics/core/slo-impact.v1.ts';
import { executeTool } from './tool-bridge.mjs';
import { getScenarioId } from './schema/vocab.mjs';
import { mapContractToLlm } from './schema/mapping.mjs';

function ensureDir(p){ fs.mkdirSync(p,{recursive:true}); }
function safe(s){ return String(s).replace(/[^A-Za-z0-9._-]/g,'_'); }

async function main(){
  const name = process.argv[2] || 'ingress-pending-demo';
  const scenario = getScenarioId(name) || 'ingress-pending';
  const tmplPath = path.join('src','lib','templates','templates', `${scenario}.json`);
  const sessionId = `engine-${scenario}-${Date.now()}`;
  if (!fs.existsSync(tmplPath)) throw new Error(`Template not found: ${tmplPath}`);
  const template = JSON.parse(fs.readFileSync(tmplPath,'utf8'));
  const model = process.env.LMS_MODEL || 'unknown-model';
  // Vars from env for realistic runs
  const NS = process.env.E2E_NS || 'default';
  const PVC = process.env.E2E_PVC || 'shared-pvc';
  const POD = process.env.E2E_POD || 'example-pod';
  const SC = process.env.E2E_SC || 'gp3-csi';
  const ROUTE = process.env.E2E_ROUTE || 'checkout';
  const SERVICE = process.env.E2E_SERVICE || ROUTE;
  const VARS = {
    sessionId,
    ns: NS,
    pvc: PVC,
    pod: POD,
    sc: SC,
    controller: 'deployment/placeholder',
    route: ROUTE,
    service: SERVICE,
    backendPod: process.env.E2E_BACKEND_POD || POD || 'example-backend-pod',
    pendingPod: process.env.E2E_POD || POD || 'example-pending-pod',
    nodeFromEvent: process.env.E2E_NODE || 'example-node'
  };
  const engine = new TemplateEngine();
  const plan = engine.buildPlan(template, { sessionId, vars: VARS });
  const executed = [];
  for (const step of plan.steps){
    try {
      const res = await executeTool(step.tool, step.params);
      executed.push({ step, result: res?.data });
    } catch (e) {
      executed.push({ step, result: { error: String(e?.message||e) } });
    }
  }
  // Evaluate evidence
  const ev = engine.evaluateEvidence(template, executed);
  const completeness = ev?.completeness ?? 0;
  const present = ev?.present || [];
  let evidence_keys = mapContractToLlm(scenario, present);
  // no_evidence normalization: drop if any specific key present
  if (evidence_keys.length > 1) evidence_keys = evidence_keys.filter(k => k !== 'no_evidence');
  const rub = evaluateRubrics({ confidence: EVIDENCE_CONFIDENCE_V1 }, { evidenceCompleteness: completeness, toolAgreement: 1, freshnessMin: 5 });
  let confidence = rub?.confidence?.label || 'Low';
  // Triage priority inputs (scenario heuristics for parity)
  let triageInputs = { blastRadius: 0.5, customerPaths: 0.5, operatorsDegraded: 0, timeSinceFirstEventMin: 15 };
  if (scenario === 'ingress-pending' || scenario === 'route-5xx') triageInputs = { blastRadius: 1.0, customerPaths: 1.0, operatorsDegraded: 0, timeSinceFirstEventMin: 5 };
  if (scenario === 'cluster-health') {
    const sev = (evidence_keys.includes('ingress_controller_degraded') || evidence_keys.includes('monitoring_stack_degraded') || evidence_keys.includes('operator_degraded'));
    triageInputs = {
      blastRadius: sev ? 1.0 : (evidence_keys.includes('operators_degraded') ? 0.9 : 0.7),
      customerPaths: sev ? 1.0 : 0.8,
      operatorsDegraded: sev ? 1 : (evidence_keys.includes('operators_degraded') ? 1 : 0),
      timeSinceFirstEventMin: 10
    };
  }
  const triageRes = evaluateRubrics({ triage: TRIAGE_PRIORITY_V1 }, triageInputs);
  const priority = triageRes?.triage?.label || 'P2';
  // SLO impact flags
  const sloInputs = {
    ingressPending: scenario === 'ingress-pending' ? 1 : 0,
    route5xx: scenario === 'route-5xx' ? 1 : 0,
    pvcBinding: scenario === 'pvc-binding' ? 1 : 0,
    crashloop: 0,
    apiDegraded: scenario === 'cluster-health' ? 0 : (scenario === 'api-degraded' ? 1 : 0),
    clusterHealthDegraded: scenario === 'cluster-health' && (evidence_keys.includes('ingress_controller_degraded') || evidence_keys.includes('monitoring_stack_degraded') || evidence_keys.includes('operator_degraded') || evidence_keys.includes('operators_degraded')) ? 1 : 0
  };
  const sloRes = evaluateRubrics({ slo: SLO_IMPACT_V1 }, sloInputs);
  const slo = sloRes?.slo?.label || 'LOW';
  // Deterministic confidence nudge based on strong signals per scenario
  const STRONG = {
    'route-5xx': new Set(['endpoints_empty','backend_pods_failing','route_tls_mismatch']),
    'pvc-binding': new Set(['pvc_pending','storage_class_missing','quota_exceeded','zone_mismatch']),
    'scheduling-failures': new Set(['failed_scheduling','node_taints','machineset_zone_skew']),
    'cluster-health': new Set(['operators_degraded','operator_degraded','ingress_controller_degraded','monitoring_stack_degraded','network_degraded','storage_degraded'])
  };
  const strongSet = STRONG[scenario] || new Set();
  const strongCount = (evidence_keys||[]).filter(k => strongSet.has(k)).length;
  const appliedRules = [];
  if (strongCount >= 2 && (evidence_keys||[]).some(k=>k!=='no_evidence')) {
    if (confidence === 'Low') { confidence = 'Medium'; appliedRules.push('nudge:2-strong->Low->Medium'); }
    else if (confidence === 'Medium') { confidence = 'High'; appliedRules.push('nudge:2-strong->Medium->High'); }
  }
  const notesBase = evidence_keys.length ? `evidence: ${evidence_keys.join(',')}` : 'no_evidence';
  const notes = notesBase.slice(0, 200);

  const out = { scenario, sessionId, plan, completeness: Number(completeness.toFixed(3)), result: { priority, confidence, slo, evidence_keys: evidence_keys.length?evidence_keys:['no_evidence'], notes }, debug: { evidence_fired: present, mapped_keys: evidence_keys, confidence_rules_applied: appliedRules } };
  const outDir = path.join('logs','robustness'); ensureDir(outDir);
  const file = path.join(outDir, `${safe(name)}__${safe(model)}__engine.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log('ENGINE RESULT:', out.result);
}

main().catch(e=>{ console.error(e); process.exit(1); });
