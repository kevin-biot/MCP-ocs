import type { MappingRubric } from '../rubric-registry.js';

// Conversations search confidence rubric
// Inputs: contextRestorationConfidence (0..1)
export const MEMORY_CONVERSATIONS_CONFIDENCE_V1: MappingRubric = {
  id: 'memory.conversations.confidence.v1',
  kind: 'mapping',
  inputs: ['contextRestorationConfidence'],
  mapping: {
    High: 'contextRestorationConfidence>=0.8',
    Medium: 'contextRestorationConfidence>=0.6',
    Low: 'otherwise'
  }
};

