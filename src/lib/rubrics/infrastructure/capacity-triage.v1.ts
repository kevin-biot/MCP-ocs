import type { MappingRubric } from "../../rubric-registry.js";

// Capacity Triage (v1): derive HIGH/MEDIUM/LOW from node pressure/headroom
// Inputs:
//  - memoryPressure, diskPressure, pidPressure: boolean
//  - headroom: number (0..1) where 0 is no headroom, 1 is full headroom
export const CAPACITY_TRIAGE_V1: MappingRubric = {
  id: 'capacity-triage.v1',
  kind: 'mapping',
  inputs: ['memoryPressure','diskPressure','pidPressure','headroom'],
  mapping: {
    HIGH: '(memoryPressure==true && diskPressure==true) || (memoryPressure==true && pidPressure==true) || (diskPressure==true && pidPressure==true) || (headroom < 0.10)',
    MEDIUM: 'memoryPressure==true || diskPressure==true || pidPressure==true || (headroom < 0.20)',
    LOW: 'otherwise'
  }
};

