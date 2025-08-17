import type { GuardsRubric } from '../rubric-registry.js';

// Memory store safety rubric
// Inputs: ttlDays:number, scopeValid:boolean
export const MEMORY_STORE_SAFETY_V1: GuardsRubric = {
  id: 'memory.store.safety.v1',
  kind: 'guards',
  guards: [
    'ttlDays <= 365',
    'scopeValid == true'
  ],
  decision: { allowAuto: 'all guards true' }
};

