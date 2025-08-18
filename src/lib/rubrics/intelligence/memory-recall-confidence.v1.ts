import type { MappingRubric } from '../rubric-registry.js';

// Memory Recall Confidence (v1)
// Inputs: recallSimilarity (0..1), recallFreshnessMin (minutes)
// Labels:
//  - High: strong match and fresh (>=0.85 similarity and <= 24h)
//  - Medium: decent match or reasonably recent (>=0.6 similarity OR <= 7d)
//  - Low: otherwise
export const MEMORY_RECALL_CONFIDENCE_V1: MappingRubric = {
  id: 'memory-recall-confidence.v1',
  kind: 'mapping',
  inputs: ['recallSimilarity','recallFreshnessMin'],
  mapping: {
    High: 'recallSimilarity>=0.85 && recallFreshnessMin<=1440',
    Medium: 'recallSimilarity>=0.6 || recallFreshnessMin<=10080',
    Low: 'otherwise'
  }
};

