import { PlannedStep } from '../template-engine.js';

export const infraBlocks = {
  nodes_analysis: (sessionId: string): PlannedStep[] => [],
  events_scheduling: (sessionId: string, ns: string, pod: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pod', namespace: ns, name: pod }, rationale: 'Pod events (FailedScheduling predicates)' }
  ],
  pod_constraints: (sessionId: string, ns: string, controller: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'deployment', namespace: ns, name: controller }, rationale: 'Tolerations & (anti)affinity from controller' }
  ],
  endpoints_describe: (sessionId: string, ns: string, svc: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'endpoints', namespace: ns, name: svc }, rationale: 'Service endpoints availability' }
  ],
  route_describe: (sessionId: string, ns: string, route: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'route', namespace: ns, name: route }, rationale: 'Route spec and TLS details' }
  ],
  pvc_describe: (sessionId: string, ns: string, pvc: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pvc', namespace: ns, name: pvc }, rationale: 'PVC spec and events' }
  ],
  storageclass_describe: (sessionId: string, sc: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'storageclass', name: sc }, rationale: 'StorageClass parameters' }
  ],
  resourcequota_describe: (sessionId: string, ns: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'resourcequota', namespace: ns }, rationale: 'Namespace quota' }
  ]
};
