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
    private client;
    private collection;
    private memoryDir;
    private initialized;
    constructor(memoryDir: string);
    initialize(): Promise<void>;
    isAvailable(): Promise<boolean>;
    storeConversation(memory: ConversationMemory): Promise<boolean>;
    storeConversationToJson(memory: ConversationMemory): Promise<boolean>;
    searchRelevantMemories(query: string, sessionId?: string, limit?: number): Promise<MemorySearchResult[]>;
    searchJsonMemories(query: string, sessionId?: string, limit?: number): Promise<MemorySearchResult[]>;
    listSessions(): Promise<string[]>;
    getAllSessions(): Promise<string[]>;
    getSessionSummary(sessionId: string): Promise<any>;
    buildContextPrompt(currentMessage: string, sessionId?: string, maxLength?: number): Promise<string>;
    deleteSession(sessionId: string): Promise<boolean>;
    reloadAllMemoriesFromJson(): Promise<{
        loaded: number;
        errors: number;
    }>;
}
export declare function extractTags(text: string): string[];
export declare function extractContext(text: string): string[];
