export const TRIAGE_PRIORITY_V1 = {
    id: 'triage-priority.v1',
    kind: 'weighted',
    inputs: ['blastRadius', 'customerPaths', 'operatorsDegraded', 'timeSinceFirstEventMin'],
    weights: { blastRadius: 0.4, customerPaths: 0.3, operatorsDegraded: 0.2, timeSinceFirstEventMin: 0.1 },
    normalize: { timeSinceFirstEventMin: 'clamp:0..180->0..1' },
    bands: { P1: '>=0.8', P2: '>=0.55', P3: 'otherwise' }
};
