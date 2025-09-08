export const EVIDENCE_CONFIDENCE_V1 = {
    id: 'evidence-confidence.v1',
    kind: 'mapping',
    inputs: ['evidenceCompleteness', 'toolAgreement', 'freshnessMin'],
    mapping: {
        High: 'evidenceCompleteness>=0.9 && toolAgreement>=0.8 && freshnessMin<=10',
        Medium: 'evidenceCompleteness>=0.75',
        Low: 'otherwise'
    }
};
