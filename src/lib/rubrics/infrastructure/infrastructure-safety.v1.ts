import type { GuardsRubric } from "../rubric-registry.js";

// Infrastructure Safety (v1)
// Inputs:
//  - clusterStability: boolean (operators healthy, no critical alerts)
//  - nodeReadiness: 0..1 (ready / total)
//  - storageHealth: boolean (SC/provisioner healthy, PVCs binding)
export const INFRASTRUCTURE_SAFETY_V1: GuardsRubric = {
  id: 'infrastructure-safety.v1',
  kind: 'guards',
  guards: [
    'clusterStability == true',
    'nodeReadiness >= 0.66',
    'storageHealth == true'
  ],
  decision: { allowAuto: 'all guards true' }
};
