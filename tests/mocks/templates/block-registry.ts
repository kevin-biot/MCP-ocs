export const BlockRegistry = {
  infra: {
    events_scheduling: (sessionId: string, ns: string, pod: string) => [
      { tool: 'oc_read_events', params: { sessionId, ns, pod } }
    ],
    pod_constraints: (sessionId: string, ns: string, controller: string) => [
      { tool: 'oc_check_constraints', params: { sessionId, ns, controller } }
    ]
  }
} as const;

