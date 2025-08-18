import type { MappingRubric } from '../rubric-registry.js';

// Meta-Dispatch Confidence (v1)
// Inputs: ingressSignal (0|1), pvcSignal (0|1), churnSignal (0|1)
// High: exactly one strong signal (unambiguous)
// Medium: multiple signals or weak/noisy signal set
// Low: no signals
export const META_DISPATCH_CONFIDENCE_V1: MappingRubric = {
  id: 'meta-dispatch-confidence.v1',
  kind: 'mapping',
  inputs: ['ingressSignal','pvcSignal','churnSignal'],
  mapping: {
    High: '(ingressSignal + pvcSignal + churnSignal) == 1',
    Medium: '(ingressSignal + pvcSignal + churnSignal) > 1',
    Low: 'otherwise'
  }
};

