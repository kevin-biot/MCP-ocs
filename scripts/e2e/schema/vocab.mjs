// Evidence vocabulary per template/scenario
// Controls allowed values for `evidence_keys` in strict JSON outputs

export const EVIDENCE_VOCAB = {
  'ingress-pending': [
    'router_pods_pending',
    'no_evidence',
    'ingress_controller_degraded',
    'scheduling_failed'
  ],
  'route-5xx': [
    'endpoints_empty',
    'route_tls_mismatch',
    'backend_pods_failing',
    'service_selector_mismatch',
    'no_evidence'
  ],
  'pvc-binding': [
    'pvc_pending',
    'storage_class_missing',
    'quota_exceeded',
    'zone_mismatch',
    'no_evidence'
  ],
  'pvc-storage-affinity': [
    'wffc',
    'topology_mismatch',
    'provisioner_slow',
    'recent_scale_event',
    'no_evidence'
  ],
  'scheduling-failures': [
    'failed_scheduling',
    'node_taints',
    'machineset_zone_skew',
    'no_evidence'
  ],
  'cluster-health': [
    'operators_degraded',
    'operator_degraded',
    'ingress_controller_degraded',
    'monitoring_stack_degraded',
    'version_operator_degraded',
    'network_degraded',
    'storage_degraded',
    'control_plane_unhealthy',
    'no_evidence'
  ]
};

export function getScenarioId(nameOrTemplate) {
  // Normalize names like `ingress-pending-demo` or template ids to scenario key
  const s = String(nameOrTemplate || '').toLowerCase();
  if (s.includes('ingress-pending')) return 'ingress-pending';
  if (s.includes('route-5xx')) return 'route-5xx';
  if (s.includes('pvc-storage-affinity')) return 'pvc-storage-affinity';
  if (s.includes('pvc-binding')) return 'pvc-binding';
  if (s.includes('scheduling-failures')) return 'scheduling-failures';
  if (s.includes('cluster-health')) return 'cluster-health';
  return null;
}

export function allowedKeysText(scenario) {
  const keys = EVIDENCE_VOCAB[scenario] || [];
  return keys.length ? keys.map(k => `"${k}"`).join(', ') : '';
}
