// Mapping between LLM-facing evidence vocab and template evidenceContract keys
// This lets us cross-check engine evidence completeness against LLM outputs

export const LLM_TO_CONTRACT = {
  'ingress-pending': {
    router_pods_pending: 'routerPods',
    scheduling_failed: 'schedulingEvents',
    ingress_controller_degraded: 'controllerStatus',
    no_evidence: null
  },
  'route-5xx': {
    endpoints_empty: 'endpoints',
    route_tls_mismatch: 'routeSpec',
    backend_pods_failing: 'routeSpec',
    service_selector_mismatch: 'endpoints',
    no_evidence: null
  },
  'pvc-binding': {
    pvc_pending: 'pvcSpec',
    storage_class_missing: 'scInfo',
    quota_exceeded: 'quota',
    zone_mismatch: 'topologyMismatch',
    no_evidence: null
  },
  'pvc-storage-affinity': {
    wffc: 'waitForFirstConsumer',
    topology_mismatch: 'pvZoneMismatch',
    provisioner_slow: 'provisionerErrors',
    recent_scale_event: 'recentScaleEvents',
    no_evidence: null
  },
  'scheduling-failures': {
    failed_scheduling: 'schedulingEvents',
    node_taints: 'nodeTaints',
    machineset_zone_skew: 'machinesetZoneDistribution',
    no_evidence: null
  },
  'cluster-health': {
    operators_degraded: 'operators',
    operator_degraded: 'operatorDegraded',
    ingress_controller_degraded: 'ingress',
    monitoring_stack_degraded: 'monitoring',
    version_operator_degraded: 'clusterversion',
    network_degraded: 'network',
    storage_degraded: 'storage',
    control_plane_unhealthy: 'controlPlane',
    no_evidence: null
  }
};

export function mapLlmKeysToContract(scenario, llmKeys) {
  const map = LLM_TO_CONTRACT[scenario] || {};
  return (Array.isArray(llmKeys) ? llmKeys : []).map(k => map[k]).filter(Boolean);
}

export function mapContractToLlm(scenario, contractKeys) {
  const map = LLM_TO_CONTRACT[scenario] || {};
  const inv = Object.entries(map).reduce((acc,[llm,contract])=>{ if (contract) acc[contract]=llm; return acc; },{});
  const arr = Array.isArray(contractKeys) ? contractKeys : [];
  return arr.map(k => inv[k]).filter(Boolean);
}
