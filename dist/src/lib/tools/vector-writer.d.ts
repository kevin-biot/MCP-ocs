export interface VectorWriteInput {
    toolId: string;
    argsSummary: Record<string, unknown>;
    resultSummary: string;
    sessionId: string;
    domain?: string;
    environment?: 'dev' | 'test' | 'staging' | 'prod';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    extraTags?: string[];
}
export declare function writeVectorToolExec(input: VectorWriteInput): Promise<boolean>;
