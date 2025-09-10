export declare enum KnowledgeSourceClass {
    USER_PROVIDED = "user_provided",
    ENGINEER_ADDED = "engineer_added",
    SYSTEM_GENERATED = "system_generated",
    EXTERNAL_API = "external_api",
    DOCUMENT_PARSED = "document_parsed"
}
export interface ConversationMemory {
    sessionId: string;
    timestamp: number;
    userMessage: string;
    assistantResponse: string;
    context: string[];
    tags: string[];
    source?: KnowledgeSourceClass;
}
export interface MemorySearchResult {
    content: string;
    metadata: any;
    distance: number;
}
export declare class ChromaMemoryManager {
    private collectionName;
    private memoryDir;
    private initialized;
    private host;
    private port;
    private serverAvailable;
    private embedder;
    private tenant;
    private database;
    private collectionIdCache;
    private log;
    constructor(memoryDir: string);
    setCollectionName(name: string): void;
    getCollectionName(): string;
    private ensureServerSideEmbeddings;
    initialize(): Promise<void>;
    isAvailable(): Promise<boolean>;
    storeConversation(memory: ConversationMemory, collectionOverride?: string): Promise<boolean>;
    storeConversationToJson(memory: ConversationMemory): Promise<boolean>;
    searchRelevantMemories(query: string, sessionId?: string, limit?: number): Promise<MemorySearchResult[]>;
    searchRelevantMemoriesInCollection(collection: string, query: string, sessionId?: string, limit?: number): Promise<MemorySearchResult[]>;
    searchJsonMemories(query: string, sessionId?: string, limit?: number): Promise<MemorySearchResult[]>;
    private pingChroma;
    private ensureCollection;
    listCollections(): Promise<{
        id: string;
        name: string;
    }[]>;
    createCollection(name: string): Promise<void>;
    switchCollection(name: string): Promise<void>;
    deleteCollection(name: string): Promise<boolean>;
    private restAdd;
    private restDelete;
    deleteBySessionPattern(pattern: string): Promise<{
        ok: boolean;
        deleted: number | null;
    }>;
    private restQuery;
    private getCollectionId;
    private ensureEmbedder;
    private embedTexts;
    getEmbeddingInfo(): Promise<{
        method: string;
        model?: string;
        dimensions: number;
        fallback: boolean;
        speedMs: number;
    }>;
    private coerceMemoriesFromJson;
    listSessions(): Promise<string[]>;
    getAllSessions(): Promise<string[]>;
    getSessionSummary(sessionId: string): Promise<any>;
    buildContextPrompt(currentMessage: string, sessionId?: string, maxLength?: number): Promise<string>;
    deleteSession(sessionId: string): Promise<boolean>;
    reloadAllMemoriesFromJson(): Promise<{
        loaded: number;
        errors: number;
    }>;
    deleteJsonByFilenamePrefix(prefix: string): Promise<{
        deleted: number;
    }>;
}
export declare function extractTags(text: string): string[];
export declare function extractContext(text: string): string[];
