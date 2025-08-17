#!/usr/bin/env node
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1 } from '../../src/lib/rubrics/diagnostic/cluster-health-safety.v1.ts';
import { DIAGNOSTIC_POD_HEALTH_SAFETY_V1, DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 } from '../../src/lib/rubrics/diagnostic/pod-health-rubrics.v1.ts';

function posClusterInputs(){
  return { etcdHealthy:true, controlPlaneReadyRatio:0.71, noCriticalAlerts:true, operatorsDegraded:2 };
}
function negClusterInputs(){
  return { etcdHealthy:true, controlPlaneReadyRatio:0.5, noCriticalAlerts:false, operatorsDegraded:5 };
}
function posPodInputs(){
  return { imagePullErrors:false, hasProbeIssues:false, probeEvidencePresent:true, lastLogsPresent:true };
}
function negPodInputs(){
  return { imagePullErrors:true, hasProbeIssues:true, probeEvidencePresent:false, lastLogsPresent:false };
}

function run(){
  const out = {};
  out.cluster = {
    pos: evaluateRubrics({ safety: DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1 }, posClusterInputs()),
    neg: evaluateRubrics({ safety: DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1 }, negClusterInputs())
  };
  out.pod = {
    pos: evaluateRubrics({ safety: DIAGNOSTIC_POD_HEALTH_SAFETY_V1, confidence: DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 }, posPodInputs()),
    neg: evaluateRubrics({ safety: DIAGNOSTIC_POD_HEALTH_SAFETY_V1, confidence: DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 }, negPodInputs())
  };
  console.log(JSON.stringify(out, null, 2));
  // Assertions
  const ok = out.cluster.pos.safety?.allowAuto===true && out.cluster.neg.safety?.allowAuto===false
    && out.pod.pos.safety?.allowAuto===true && out.pod.neg.safety?.allowAuto===false
    && out.pod.pos.confidence?.label==='High' && out.pod.neg.confidence?.label!=='High';
  if (!ok) process.exit(1);
}

run();

