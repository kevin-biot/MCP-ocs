import { PlannedStep } from '../template-engine.js';

export const infraBlocks = {
  nodes_analysis: (sessionId: string): PlannedStep[] => [],
  events_scheduling: (sessionId: string, ns: string, pod: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pod', namespace: ns, name: pod }, rationale: 'Pod events (FailedScheduling predicates)' }
  ],
  pod_constraints: (sessionId: string, ns: string, controller: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'deployment', namespace: ns, name: controller }, rationale: 'Tolerations & (anti)affinity from controller' }
  ]
};

