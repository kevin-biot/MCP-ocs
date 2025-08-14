/**
 * Fixed ChromaDB Client - Using Official ChromaDB JavaScript Client
 * Based on working MCP-files implementation
 */
/**
 * ChromaDB Client - FIXED using official client library
 */
export declare class ChromaDBClientFixed {
    private client;
    private collections;
    private isAvailable;
    private embeddingFunction;
    constructor(host: string, port: number);
    initialize(): Promise<void>;
    isChromaAvailable(): boolean;
    createCollection(name: string): Promise<void>;
    private getCollection;
    addDocuments(collectionName: string, documents: any[]): Promise<void>;
    queryCollection(collectionName: string, queryText: string, limit?: number): Promise<any[]>;
}
