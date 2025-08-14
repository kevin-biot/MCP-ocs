/**
 * Fixed ChromaDB Client - Using Official ChromaDB JavaScript Client
 * Based on working MCP-files implementation
 */
import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
/**
 * ChromaDB Client - FIXED using official client library
 */
export class ChromaDBClientFixed {
    client = null;
    collections = new Map();
    isAvailable = false;
    embeddingFunction = new DefaultEmbeddingFunction();
    constructor(host, port) {
        try {
            // Use official ChromaDB client with embedding function
            this.client = new ChromaClient({
                host,
                port
            });
            console.log("✓ ChromaDB client initialized with official library");
        }
        catch (error) {
            console.error('ChromaDB initialization failed:', error);
            this.client = null;
        }
    }
    async initialize() {
        if (!this.client) {
            this.isAvailable = false;
            return;
        }
        try {
            // Test connection with heartbeat
            await this.client.heartbeat();
            this.isAvailable = true;
            console.log("✅ ChromaDB connection successful");
        }
        catch (error) {
            console.error('ChromaDB connection failed:', error);
            this.isAvailable = false;
            this.client = null;
        }
    }
    isChromaAvailable() {
        return this.isAvailable && this.client !== null;
    }
    async createCollection(name) {
        if (!this.client)
            throw new Error('ChromaDB not available');
        try {
            // Try to get existing collection first
            let collection;
            try {
                collection = await this.client.getCollection({
                    name,
                    embeddingFunction: this.embeddingFunction
                });
                console.log(`✓ Connected to existing ChromaDB collection: ${name}`);
            }
            catch (getError) {
                // Collection doesn't exist, create it
                collection = await this.client.createCollection({
                    name,
                    embeddingFunction: this.embeddingFunction,
                    metadata: {
                        "hnsw:space": "cosine"
                    }
                });
                console.log(`✓ Created new ChromaDB collection: ${name}`);
            }
            this.collections.set(name, collection);
        }
        catch (error) {
            throw new Error(`Failed to create collection ${name}: ${error}`);
        }
    }
    async getCollection(name) {
        if (!this.collections.has(name)) {
            await this.createCollection(name);
        }
        return this.collections.get(name);
    }
    async addDocuments(collectionName, documents) {
        if (!this.client || documents.length === 0)
            return;
        try {
            const collection = await this.getCollection(collectionName);
            const ids = documents.map((_, index) => `${collectionName}_${Date.now()}_${index}`);
            const documentsContent = documents.map(doc => doc.content || JSON.stringify(doc));
            // Fix metadata - flatten arrays and objects to strings for ChromaDB compatibility
            const metadatas = documents.map(doc => {
                const metadata = doc.metadata || {};
                const flatMetadata = {};
                for (const [key, value] of Object.entries(metadata)) {
                    if (Array.isArray(value)) {
                        flatMetadata[key] = value.join(', '); // Convert arrays to comma-separated strings
                    }
                    else if (typeof value === 'object' && value !== null) {
                        flatMetadata[key] = JSON.stringify(value); // Convert objects to JSON strings
                    }
                    else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
                        flatMetadata[key] = value; // Keep simple types as-is
                    }
                    else {
                        flatMetadata[key] = String(value); // Convert everything else to string
                    }
                }
                return flatMetadata;
            });
            // Use official client's add method
            await collection.add({
                ids,
                documents: documentsContent,
                metadatas
            });
            console.log(`✅ Successfully stored ${documents.length} documents in ChromaDB collection '${collectionName}'`);
        }
        catch (error) {
            throw new Error(`Failed to add documents to ${collectionName}: ${error}`);
        }
    }
    async queryCollection(collectionName, queryText, limit = 5) {
        if (!this.client)
            return [];
        try {
            const collection = await this.getCollection(collectionName);
            // Use official client's query method
            const results = await collection.query({
                queryTexts: [queryText],
                nResults: limit
            });
            console.log(`🔍 ChromaDB query returned ${results.documents[0]?.length || 0} results`);
            if (results.documents[0] && results.documents[0].length > 0) {
                return results.documents[0].map((doc, index) => ({
                    id: results.ids[0][index],
                    content: doc,
                    metadata: results.metadatas[0][index],
                    distance: results.distances[0][index],
                    similarity: 1 - results.distances[0][index]
                }));
            }
            return [];
        }
        catch (error) {
            console.error(`ChromaDB query failed for ${collectionName}:`, error);
            return [];
        }
    }
}
