/**
 * ChromaDB Integration - Using Working MCP-files Implementation
 *
 * Smart approach: Use the proven working ChromaMemoryManager instead of reimplementing
 */
import type { ConversationMemory, OperationalMemory } from './shared-memory';
/**
 * Wrapper to adapt MCP-files ChromaMemoryManager to our interface
 */
export declare class MCPFilesChromaAdapter {
    private chromaManager;
    constructor(host: string, port: number, memoryDir: string);
    initialize(): Promise<void>;
    isChromaAvailable(): boolean;
    storeConversation(memory: ConversationMemory): Promise<boolean>;
    storeOperational(memory: OperationalMemory): Promise<boolean>;
    searchConversations(query: string, limit?: number): Promise<any[]>;
    searchOperational(query: string, limit?: number): Promise<any[]>;
    addDocuments(collectionName: string, documents: any[]): Promise<void>;
    queryCollection(collectionName: string, queryText: string, limit?: number): Promise<any[]>;
}
