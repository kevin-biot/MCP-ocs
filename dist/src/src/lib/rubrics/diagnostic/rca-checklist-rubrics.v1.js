// RCA checklist coverage mapping
// Inputs: coverageRatio (0..1), infraFailed:boolean, netFailed:boolean, pvcFailed:boolean
export const DIAGNOSTIC_RCA_CHECKLIST_MAPPING_V1 = {
    id: 'diagnostic.rca-checklist.mapping.v1',
    kind: 'mapping',
    inputs: ['coverageRatio', 'infraFailed', 'netFailed', 'pvcFailed'],
    mapping: {
        High: 'coverageRatio>=0.9',
        Medium: 'coverageRatio>=0.75',
        Low: 'otherwise'
    }
};
// RCA safety: if infraFailed and control plane not ready, block auto
// Inputs also require controlPlaneReadyRatio
export const DIAGNOSTIC_RCA_CHECKLIST_SAFETY_V1 = {
    id: 'diagnostic.rca-checklist.safety.v1',
    kind: 'guards',
    guards: [
        '!(infraFailed == true && controlPlaneReadyRatio < 0.66)'
    ],
    decision: { allowAuto: 'all guards true' }
};
