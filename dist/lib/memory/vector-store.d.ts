/**
 * Vector Store Interface for Memory Management
 *
 * Provides abstraction layer for vector-based memory storage with semantic search capabilities.
 */
export interface VectorStoreConfig {
    collectionName: string;
    embeddingFunction: 'openai' | 'sentence-transformers' | 'custom';
}
export interface VectorQueryOptions {
    query: string;
    filter?: any;
    limit?: number;
    similarityThreshold?: number;
}
export interface VectorStoreResult {
    id: string;
    embedding: number[];
    metadata: any;
    content: string;
    score?: number;
}
export declare class VectorStore {
    private collectionName;
    private embeddingFunction;
    constructor(config: VectorStoreConfig);
    /**
     * Add a new record to the vector store
     */
    add(record: {
        id: string;
        embedding: number[];
        metadata: any;
        content: string;
    }): Promise<void>;
    /**
     * Query the vector store for semantically similar records
     */
    query(options: VectorQueryOptions): Promise<VectorStoreResult[]>;
    /**
     * Get a specific record by ID
     */
    get(id: string): Promise<VectorStoreResult | null>;
    /**
     * Delete records older than timestamp
     */
    deleteOlderThan(timestamp: number): Promise<number>;
    /**
     * Get collection statistics
     */
    getStats(): Promise<any>;
    /**
     * Generate embedding for text content
     */
    generateEmbedding(text: string): Promise<number[]>;
}
