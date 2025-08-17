import type { GuardsRubric } from '../rubric-registry.js';

export const REMEDIATION_SAFETY_V1: GuardsRubric = {
  id: 'remediation-safety.v1',
  kind: 'guards',
  guards: [
    'etcdHealthy == true',
    'controlPlaneReadyRatio >= 0.66',
    'affectedNamespaces <= 3',
    'noCriticalAlerts == true'
  ],
  decision: { allowAuto: 'all guards true' }
};

