export const REMEDIATION_SAFETY_V1 = {
    id: 'remediation-safety.v1',
    kind: 'guards',
    guards: [
        'etcdHealthy == true',
        'controlPlaneReadyRatio >= 0.66',
        'affectedNamespaces <= 3',
        'noCriticalAlerts == true'
    ],
    decision: { allowAuto: 'all guards true' }
};
