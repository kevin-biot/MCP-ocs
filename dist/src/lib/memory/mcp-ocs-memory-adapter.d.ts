export interface OCSIncidentMemory {
    sessionId: string;
    timestamp: number;
    userMessage: string;
    assistantResponse: string;
    context: string[];
    tags: string[];
    domain: 'openshift' | 'kubernetes' | 'devops' | 'production';
    environment: 'dev' | 'test' | 'staging' | 'prod';
    severity: 'low' | 'medium' | 'high' | 'critical';
    resourceType?: string;
}
export declare class MCPOcsMemoryAdapter {
    private memoryManager;
    constructor(memoryDir: string);
    initialize(): Promise<void>;
    storeIncidentMemory(memory: OCSIncidentMemory): Promise<boolean>;
    searchIncidents(query: string, domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production', limit?: number): Promise<any[]>;
    generateStructuredIncidentResponse(query: string, sessionId?: string): Promise<{
        summary: string;
        relatedIncidents: any[];
        rootCauseAnalysis: string;
        recommendations: string[];
        severitySummary: 'low' | 'medium' | 'high' | 'critical';
    }>;
    private generateRootCauseAnalysis;
    private extractRecommendations;
    private classifyAggregateSeverity;
    private normalizeTags;
    isMemoryAvailable(): Promise<boolean>;
}
