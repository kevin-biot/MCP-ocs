import type { MappingRubric } from '../rubric-registry.js';

// Namespace health confidence rubric
// Inputs: pendingRatio (0..1), crashLoopRatio (0..1), quotaPressure (0..1)
// Goal: High confidence when low pending/crash ratios and quota pressure below 90%
export const DIAGNOSTIC_NAMESPACE_HEALTH_CONFIDENCE_V1: MappingRubric = {
  id: 'diagnostic.namespace-health.confidence.v1',
  kind: 'mapping',
  inputs: ['pendingRatio','crashLoopRatio','quotaPressure'],
  mapping: {
    High: 'pendingRatio<=0.05 && crashLoopRatio<=0.05 && quotaPressure<=0.9',
    Medium: 'pendingRatio<=0.15 && crashLoopRatio<=0.15 && quotaPressure<=0.95',
    Low: 'otherwise'
  }
};

