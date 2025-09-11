export interface MemoryConfig {
    memoryDir: string;
    chromaHost?: string;
    chromaPort?: number;
}
export interface ConversationData {
    sessionId: string;
    domain: string;
    timestamp: number;
    userMessage: string;
    assistantResponse: string;
    context: string[];
    tags: string[];
}
export interface OperationalData {
    incidentId: string;
    domain: string;
    timestamp: number;
    symptoms: string[];
    rootCause?: string;
    resolution?: string;
    environment: 'dev' | 'test' | 'staging' | 'prod';
    affectedResources: string[];
    diagnosticSteps: string[];
    tags: string[];
}
export interface MemoryResult {
    content: string;
    metadata: any;
    distance?: number;
    similarity?: number;
    relevance?: number;
}
export interface SearchOptions {
    topK?: number;
    sessionId?: string;
}
export interface MemoryStats {
    totalConversations: number;
    totalOperational: number;
    chromaAvailable: boolean;
    storageUsed: string;
}
/**
 * UnifiedMemoryAdapter
 * Facade over ChromaMemoryManager so all code paths share one backend.
 */
export declare class UnifiedMemoryAdapter {
    private chroma;
    private memoryDir;
    private available;
    private convCollection;
    private opCollection;
    private toolExecCollection;
    private strategyUnified;
    private unifiedCollection;
    constructor(config: MemoryConfig);
    initialize(): Promise<void>;
    isAvailable(): boolean;
    storeConversation(data: ConversationData): Promise<void>;
    storeOperational(data: OperationalData): Promise<void>;
    storeToolExecution(toolName: string, args: any, result: any, sessionId: string, tags?: string[], domain?: string, environment?: 'dev' | 'test' | 'staging' | 'prod', severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<void>;
    searchRelevantMemories(query: string, options?: SearchOptions): Promise<MemoryResult[]>;
    getStats(): Promise<MemoryStats>;
    searchConversations(query: string, topK?: number): Promise<Array<{
        memory: any;
        similarity: number;
        relevance: number;
    }>>;
    searchOperational(query: string, topK?: number): Promise<Array<{
        memory: any;
        similarity: number;
        relevance: number;
    }>>;
    private normArray;
    private getDirectorySize;
    private formatBytes;
}
