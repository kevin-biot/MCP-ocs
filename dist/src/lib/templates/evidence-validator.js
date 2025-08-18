export class EvidenceValidator {
    contract;
    constructor(contract) {
        this.contract = contract;
    }
    // Minimal stub: check presence of required keys
    validate(evidence) {
        const missing = [];
        for (const key of this.contract.required || []) {
            if (typeof evidence[key] === 'undefined')
                missing.push(key);
        }
        const have = (this.contract.required?.length || 0) - missing.length;
        const completeness = (this.contract.required?.length || 0) === 0 ? 1 : have / (this.contract.required.length);
        return { completeness, missing };
    }
}
