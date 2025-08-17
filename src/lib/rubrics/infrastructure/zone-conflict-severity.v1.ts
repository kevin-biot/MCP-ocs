import type { WeightedRubric } from "../../rubric-registry.js";

// Zone Conflict Severity (v1)
// Inputs:
//  - zoneSkew: 0..1 (1 means all replicas concentrated in one zone)
//  - capacityUtilization: 0..1 (max of CPU/mem pressure across zones)
//  - constraintViolations: count of FailedScheduling reasons related to topology/affinity/taints
export const ZONE_CONFLICT_SEVERITY_V1: WeightedRubric = {
  id: 'zone-conflict-severity.v1',
  kind: 'weighted',
  inputs: ['zoneSkew', 'capacityUtilization', 'constraintViolations'],
  weights: { zoneSkew: 0.5, capacityUtilization: 0.3, constraintViolations: 0.2 },
  normalize: { constraintViolations: 'clamp:0..10->0..1' },
  bands: {
    CRITICAL: '>=0.85',
    HIGH: '>=0.7',
    MEDIUM: '>=0.5',
    LOW: 'otherwise'
  }
};

