export declare class EvidenceCompletenessCalculator {
    static calculateCompleteness(evidence: Record<string, unknown>, requiredFields: string[]): number;
    private static isFieldComplete;
    private static getFieldValue;
}
export declare function getRequiredFieldsForTemplateType(templateType: string): string[];
export declare class EvidenceThresholdManager {
    private static readonly DEFAULT_THRESHOLD;
    private static readonly LEGACY_THRESHOLD;
    private static readonly LEGACY_IDS;
    static thresholdFor(templateId: string, fallback?: number): number;
}
