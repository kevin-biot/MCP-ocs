import type { MappingRubric } from '../rubric-registry.js';

// SLO Impact Classification (v1)
// Inputs are scenario flags: ingressPending, route5xx, pvcBinding, crashloop, apiDegraded
export const SLO_IMPACT_V1: MappingRubric = {
  id: 'slo-impact.v1',
  kind: 'mapping',
  inputs: ['ingressPending','route5xx','pvcBinding','crashloop','apiDegraded','clusterHealthDegraded'],
  mapping: {
    CRITICAL: 'ingressPending==1 || apiDegraded==1',
    HIGH: 'route5xx==1 || pvcBinding==1 || clusterHealthDegraded==1',
    MEDIUM: 'crashloop==1',
    LOW: 'otherwise'
  }
};
