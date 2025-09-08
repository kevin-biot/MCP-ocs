// Pod health safety: disallow auto if probe/image errors
// Inputs: imagePullErrors:boolean, hasProbeIssues:boolean
export const DIAGNOSTIC_POD_HEALTH_SAFETY_V1 = {
    id: 'diagnostic.pod-health.safety.v1',
    kind: 'guards',
    guards: [
        'imagePullErrors == false',
        'hasProbeIssues == false'
    ],
    decision: { allowAuto: 'all guards true' }
};
// Pod health confidence: require probe evidence + logs
// Inputs: probeEvidencePresent:boolean, lastLogsPresent:boolean
export const DIAGNOSTIC_POD_HEALTH_CONFIDENCE_V1 = {
    id: 'diagnostic.pod-health.confidence.v1',
    kind: 'mapping',
    inputs: ['probeEvidencePresent', 'lastLogsPresent'],
    mapping: {
        High: 'probeEvidencePresent==true && lastLogsPresent==true',
        Low: 'otherwise'
    }
};
