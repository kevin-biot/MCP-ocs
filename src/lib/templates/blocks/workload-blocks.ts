import { PlannedStep } from '../template-engine.js';

export const workloadBlocks = {
  pod_logs_previous: (sessionId: string, ns: string, pod: string, container?: string): PlannedStep[] => [
    { tool: 'oc_read_logs', params: { sessionId, namespace: ns, podName: pod, container, since: '2h', lines: 2000 }, rationale: 'Last crashes logs' }
  ],
  pod_probe_config: (sessionId: string, ns: string, pod: string): PlannedStep[] => [
    { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pod', namespace: ns, name: pod }, rationale: 'Probe settings & conditions' }
  ]
};

