// Intent normalization + mapping (stub) for ADR-023

export type CanonicalIntent =
  | 'pvc-binding'
  | 'crashloop-analysis'
  | 'ingress-pending'
  | 'pvc-storage-affinity'
  | 'scheduling-failures'
  | 'route-5xx'
  | 'api-degraded'
  | 'cluster-health'
  | 'scale-instability'
  | 'zone-conflict';

const synonyms: Record<CanonicalIntent, string[]> = {
  'pvc-binding': ['pvc', 'pvc binding', 'persistentvolumeclaim pending', 'wffc', 'wait for first consumer'],
  'crashloop-analysis': ['crashloop', 'crashloopbackoff', 'pod restart loop'],
  'ingress-pending': ['ingress pending', 'router pending', 'ingress stuck'],
  'pvc-storage-affinity': ['storage affinity', 'pv zone mismatch', 'topology mismatch'],
  'scheduling-failures': ['scheduling', 'unschedulable', 'failedscheduling', 'no nodes fit'],
  'route-5xx': ['5xx', 'route 5xx', 'http 500', 'gateway error'],
  'api-degraded': ['api slow', 'apiserver degraded', 'k8s api degraded'],
  'cluster-health': ['cluster health', 'overall health', 'operators degraded'],
  'scale-instability': ['scale flapping', 'replicas oscillating', 'scaling instability'],
  'zone-conflict': ['zone conflict', 'zonal skew', 'az mismatch'],
};

export function normalizeIntent(input?: string): CanonicalIntent | undefined {
  if (!input) return undefined;
  const s = input.toLowerCase().trim();
  for (const [canon, words] of Object.entries(synonyms) as [CanonicalIntent, string[]][]) {
    if (s === canon) return canon;
    if (words.some((w) => s.includes(w))) return canon;
  }
  return undefined;
}

export function mapIntentToTemplateTarget(intent: CanonicalIntent): string {
  // In most cases the canonical intent equals the template triageTarget
  switch (intent) {
    case 'crashloop-analysis':
      return 'crashloopbackoff';
    default:
      return intent;
  }
}

