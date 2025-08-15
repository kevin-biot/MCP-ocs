export declare class ToolMemoryGateway {
    private adapter;
    private initialized;
    constructor(memoryDir?: string);
    initialize(): Promise<void>;
    storeToolExecution(toolName: string, args: any, result: any, sessionId: string, tags?: string[], domain?: 'openshift' | 'kubernetes' | 'devops' | 'production', environment?: 'dev' | 'test' | 'staging' | 'prod', severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<boolean>;
    searchToolIncidents(query: string, domainFilter?: 'openshift' | 'kubernetes' | 'devops' | 'production', limit?: number): Promise<any[]>;
    isMemoryAvailable(): Promise<boolean>;
}
