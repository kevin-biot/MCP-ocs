export const infraBlocks = {
    nodes_analysis: (sessionId) => [],
    events_scheduling: (sessionId, ns, pod) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pod', namespace: ns, name: pod }, rationale: 'Pod events (FailedScheduling predicates)' }
    ],
    pod_constraints: (sessionId, ns, controller) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'deployment', namespace: ns, name: controller }, rationale: 'Tolerations & (anti)affinity from controller' }
    ],
    endpoints_describe: (sessionId, ns, svc) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'endpoints', namespace: ns, name: svc }, rationale: 'Service endpoints availability' }
    ],
    route_describe: (sessionId, ns, route) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'route', namespace: ns, name: route }, rationale: 'Route spec and TLS details' }
    ],
    pvc_describe: (sessionId, ns, pvc) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'pvc', namespace: ns, name: pvc }, rationale: 'PVC spec and events' }
    ],
    storageclass_describe: (sessionId, sc) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'storageclass', name: sc }, rationale: 'StorageClass parameters' }
    ],
    resourcequota_describe: (sessionId, ns) => [
        { tool: 'oc_read_describe', params: { sessionId, resourceType: 'resourcequota', namespace: ns }, rationale: 'Namespace quota' }
    ]
};
