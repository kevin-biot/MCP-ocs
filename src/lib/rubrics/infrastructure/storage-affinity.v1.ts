import type { MappingRubric } from "../../rubric-registry.js";

// Storage Affinity (v1)
// Inputs:
//  - wffc: boolean (WaitForFirstConsumer)
//  - noPvZoneMatch: boolean (no matching topology / zone mismatch)
//  - recentScaleMin: number (minutes since last scale)
//  - provisionerSlow: boolean
//  - bindingProgressing: boolean
export const STORAGE_AFFINITY_V1: MappingRubric = {
  id: 'storage-affinity.v1',
  kind: 'mapping',
  inputs: ['wffc','noPvZoneMatch','recentScaleMin','provisionerSlow','bindingProgressing'],
  mapping: {
    CRITICAL: 'wffc==true && noPvZoneMatch==true && (recentScaleMin <= 15)',
    HIGH: 'wffc==true && noPvZoneMatch==true',
    MEDIUM: 'provisionerSlow==true || bindingProgressing==false',
    LOW: 'otherwise'
  }
};

