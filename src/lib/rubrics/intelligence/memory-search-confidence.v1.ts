import type { MappingRubric } from '../rubric-registry.js';

// Memory search confidence rubric
// Inputs: recallTop1 (0..1), freshnessDaysTop1 (days), relevanceAgreement (0..1)
export const MEMORY_SEARCH_CONFIDENCE_V1: MappingRubric = {
  id: 'memory.search.confidence.v1',
  kind: 'mapping',
  inputs: ['recallTop1','freshnessDaysTop1','relevanceAgreement'],
  mapping: {
    High: 'recallTop1>=0.75 && relevanceAgreement>=0.7 && freshnessDaysTop1<=90',
    Medium: 'recallTop1>=0.5 && freshnessDaysTop1<=180',
    Low: 'otherwise'
  }
};

