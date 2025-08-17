import type { GuardsRubric } from '../rubric-registry.js';

// Diagnostic rubric: cluster health safety gate
// Inputs expected: etcdHealthy:boolean, controlPlaneReadyRatio:number (0..1), noCriticalAlerts:boolean, operatorsDegraded:number
export const DIAGNOSTIC_CLUSTER_HEALTH_SAFETY_V1: GuardsRubric = {
  id: 'diagnostic.cluster-health.safety.v1',
  kind: 'guards',
  guards: [
    'etcdHealthy == true',
    'controlPlaneReadyRatio >= 0.66',
    'noCriticalAlerts == true',
    'operatorsDegraded <= 3'
  ],
  decision: { allowAuto: 'all guards true' }
};

