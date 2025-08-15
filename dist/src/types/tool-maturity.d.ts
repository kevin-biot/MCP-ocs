export declare enum ToolMaturity {
    PRODUCTION = "production",
    BETA = "beta",
    ALPHA = "alpha",
    DEVELOPMENT = "development"
}
export interface ToolDefinitionMeta {
    name: string;
    maturity: ToolMaturity;
    lastValidated: string;
    testCoverage: number;
    mcpCompatible: boolean;
    validationSession?: string;
    successRate?: string;
    realClusterTested?: boolean;
    llmTested?: string;
    notes?: string;
}
