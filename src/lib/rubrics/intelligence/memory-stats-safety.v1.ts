import type { GuardsRubric } from '../rubric-registry.js';

// Memory statistics safety rubric
// Inputs: healthOk:boolean
export const MEMORY_STATS_SAFETY_V1: GuardsRubric = {
  id: 'memory.stats.safety.v1',
  kind: 'guards',
  guards: [
    'healthOk == true'
  ],
  decision: { allowAuto: 'all guards true' }
};

