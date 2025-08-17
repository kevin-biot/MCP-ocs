import type { MappingRubric } from "../../rubric-registry.js";

// Scheduling Confidence (v1)
// Inputs:
//  - nodeAvailability: 0..1 (ready nodes / total nodes eligible)
//  - resourceCapacity: 0..1 (schedulable capacity headroom for target workload)
//  - constraintSatisfaction: 0..1 (fraction of nodes satisfying taints/affinity/spread)
export const SCHEDULING_CONFIDENCE_V1: MappingRubric = {
  id: 'scheduling-confidence.v1',
  kind: 'mapping',
  inputs: ['nodeAvailability','resourceCapacity','constraintSatisfaction'],
  mapping: {
    High: 'nodeAvailability>=0.8 && resourceCapacity>=0.8 && constraintSatisfaction>=0.8',
    Medium: 'nodeAvailability>=0.6 && resourceCapacity>=0.6',
    Low: 'otherwise'
  }
};

