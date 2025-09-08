export const workloadBlocks = {
    pod_logs_previous: (sessionId, ns, pod, container) => [
        { tool: 'oc_read_logs', params: { sessionId, namespace: ns, podName: pod, container, since: '2h', lines: 2000 }, rationale: 'Last crashes logs' }
    ],
    pod_probe_config: (sessionId, ns, pod) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pod', namespace: ns, name: pod }, rationale: 'Probe settings & conditions' }
    ]
};
