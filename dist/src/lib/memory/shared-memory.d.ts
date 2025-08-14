/**
 * Shared Memory Manager - ADR-003 Implementation
 *
 * Hybrid ChromaDB + JSON fallback architecture for persistent memory
 * Supports conversation and operational memory with vector similarity search
 */
export interface ConversationMemory {
    sessionId: string;
    domain: string;
    timestamp: number;
    userMessage: string;
    assistantResponse: string;
    context: string[];
    tags: string[];
}
export interface OperationalMemory {
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
export interface MemorySearchResult {
    memory: ConversationMemory | OperationalMemory;
    similarity: number;
    relevance: number;
}
export interface SharedMemoryConfig {
    domain: string;
    namespace: string;
    chromaHost?: string;
    chromaPort?: number;
    memoryDir: string;
    enableCompression?: boolean;
    retentionDays?: number;
}
export interface MemoryStats {
    totalConversations: number;
    totalOperational: number;
    chromaAvailable: boolean;
    storageUsed: string;
    lastCleanup: Date | null;
    namespace: string;
}
/**
 * Main Shared Memory Manager
 */
export declare class SharedMemoryManager {
    private config;
    private contextExtractor;
    private jsonStorage;
    private chromaClient;
    constructor(config: SharedMemoryConfig);
    initialize(): Promise<void>;
    storeConversation(memory: ConversationMemory): Promise<string>;
    storeOperational(memory: OperationalMemory): Promise<string>;
    searchConversations(query: string, limit?: number): Promise<MemorySearchResult[]>;
    searchOperational(query: string, limit?: number): Promise<MemorySearchResult[]>;
    getStats(): Promise<MemoryStats>;
    isChromaAvailable(): boolean;
    close(): Promise<void>;
    /**
     * Private helper methods
     */
    private vectorSearchConversations;
    private vectorSearchOperational;
    private calculateStorageUsage;
    private getDirectorySize;
    private formatBytes;
}
