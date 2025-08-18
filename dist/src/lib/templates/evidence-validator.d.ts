import { VersionedEvidenceContract } from './template-types.js';
export interface EvidenceMap {
    [key: string]: any;
}
export declare class EvidenceValidator {
    private contract;
    constructor(contract: VersionedEvidenceContract);
    validate(evidence: EvidenceMap): {
        completeness: number;
        missing: string[];
    };
}
