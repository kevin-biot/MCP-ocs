#!/usr/bin/env node
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 } from '../../src/lib/rubrics/diagnostic/namespace-health-confidence.v1.ts';
import { DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1, DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 } from '../../src/lib/rubrics/diagnostic/rca-checklist-rubrics.v1.ts';

function nsPos(){ return { pendingRatio:0.02, crashLoopRatio:0.01, quotaPressure:0.8 }; }
function nsMed(){ return { pendingRatio:0.1, crashLoopRatio:0.1, quotaPressure:0.9 }; }
function nsNeg(){ return { pendingRatio:0.3, crashLoopRatio:0.25, quotaPressure:0.98 }; }

function rcaPos(){ return { coverageRatio:0.92, infraFailed:false, netFailed:false, pvcFailed:false, controlPlaneReadyRatio:0.9 }; }
function rcaNeg(){ return { coverageRatio:0.6, infraFailed:true, netFailed:false, pvcFailed:false, controlPlaneReadyRatio:0.5 }; }

function run(){
  const out = {};
  out.namespace = {
    pos: evaluateRubrics({ confidence: DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 }, nsPos()),
    med: evaluateRubrics({ confidence: DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 }, nsMed()),
    neg: evaluateRubrics({ confidence: DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1 }, nsNeg()),
  };
  out.rca = {
    pos: evaluateRubrics({ mapping: DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1, safety: DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 }, rcaPos()),
    neg: evaluateRubrics({ mapping: DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1, safety: DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 }, rcaNeg()),
  };
  console.log(JSON.stringify(out, null, 2));
  const ok = out.namespace.pos.confidence?.label==='High' && out.namespace.med.confidence?.label==='Medium' && out.namespace.neg.confidence?.label==='Low'
    && out.rca.pos.mapping?.label==='High' && out.rca.pos.safety?.allowAuto===true
    && out.rca.neg.mapping?.label!=='High' && out.rca.neg.safety?.allowAuto===false;
  if (!ok) process.exit(1);
}

run();

