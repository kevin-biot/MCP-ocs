import type { MappingRubric } from "../../rubric-registry.js";

// Scale Instability (v1)
// Inputs:
//  - desiredMinusCurrentAbs: number (>=0)
//  - recentScaleMin: number (minutes since last scale up/down)
export const SCALE_INSTABILITY_V1: MappingRubric = {
  id: 'scale-instability.v1',
  kind: 'mapping',
  inputs: ['desiredMinusCurrentAbs','recentScaleMin'],
  mapping: {
    UNSTABLE: '(desiredMinusCurrentAbs > 0) && (recentScaleMin <= 10)',
    STABLE: 'otherwise'
  }
};

