/**
 * Shared Memory Manager - ADR-003 Implementation
 * 
 * Hybrid ChromaDB + JSON fallback architecture for persistent memory
 * Supports conversation and operational memory with vector similarity search
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Types
export interface ConversationMemory {
  sessionId: string;
  domain: string;           // 'openshift', 'files', 'router'
  timestamp: number;
  userMessage: string;
  assistantResponse: string;
  context: string[];        // Auto-extracted technical terms
  tags: string[];          // Categorization labels
}

export interface OperationalMemory {
  incidentId: string;
  domain: string;
  timestamp: number;
  symptoms: string[];       // Observable problems
  rootCause?: string;       // Determined cause
  resolution?: string;      // Applied solution
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
 * Context Extractor for automatic tag and context generation
 */
class ContextExtractor {
  extractTechnicalTags(text: string): string[] {
    const patterns = [
      /\b(kubernetes|k8s|openshift|docker|container)\b/gi,
      /\b(pod|deployment|service|ingress|route|configmap|secret)\b/gi,
      /\b(cpu|memory|storage|network|dns|tls)\b/gi,
      /\b(error|warning|failure|timeout|crash|oom)\b/gi,
      /\b(dev|test|staging|prod|production)\b/gi
    ];
    
    const matches = new Set<string>();
    patterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        found.forEach(match => matches.add(match.toLowerCase()));
      }
    });
    
    return Array.from(matches);
  }
  
  extractResourceNames(text: string): string[] {
    const patterns = [
      /\b[\w-]+\.[\w-]+\.[\w-]+\b/g,    // K8s resource names
      /\b[\w-]+-\w{8,}\b/g,             // Generated names
      /\/[\w\/-]+/g                      // File paths
    ];
    
    const matches = new Set<string>();
    patterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        found.forEach(match => matches.add(match));
      }
    });
    
    return Array.from(matches);
  }

  extractContext(userMessage: string, assistantResponse: string): string[] {
    const combinedText = `${userMessage} ${assistantResponse}`;
    const context = new Set<string>();
    
    // Add technical tags
    this.extractTechnicalTags(combinedText).forEach(tag => context.add(tag));
    
    // Add resource names
    this.extractResourceNames(combinedText).forEach(resource => context.add(resource));
    
    return Array.from(context);
  }

  generateTags(userMessage: string, assistantResponse: string, domain: string): string[] {
    const tags = new Set<string>();
    
    // Add domain tag
    tags.add(domain);
    
    // Add operation type tags
    const operationPatterns = {
      'read_operation': /\b(get|list|describe|show|view)\b/gi,
      'write_operation': /\b(create|apply|update|patch|edit)\b/gi,
      'delete_operation': /\b(delete|remove|destroy)\b/gi,
      'diagnostic': /\b(debug|troubleshoot|diagnose|investigate)\b/gi,
      'error': /\b(error|fail|crash|exception)\b/gi,
      'performance': /\b(slow|performance|optimization|latency)\b/gi
    };
    
    const combinedText = `${userMessage} ${assistantResponse}`;
    Object.entries(operationPatterns).forEach(([tag, pattern]) => {
      if (pattern.test(combinedText)) {
        tags.add(tag);
      }
    });
    
    return Array.from(tags);
  }
}

/**
 * JSON Fallback Storage for when ChromaDB is unavailable
 */
class JsonFallbackStorage {
  private memoryDir: string;
  private namespace: string;

  constructor(memoryDir: string, namespace: string) {
    this.memoryDir = memoryDir;
    this.namespace = namespace;
  }

  async initialize(): Promise<void> {
    await fs.mkdir(path.join(this.memoryDir, this.namespace, 'conversations'), { recursive: true });
    await fs.mkdir(path.join(this.memoryDir, this.namespace, 'operational'), { recursive: true });
  }

  async storeConversation(memory: ConversationMemory): Promise<string> {
    const filename = `${memory.sessionId}_${memory.timestamp}.json`;
    const filepath = path.join(this.memoryDir, this.namespace, 'conversations', filename);
    
    await fs.writeFile(filepath, JSON.stringify(memory, null, 2));
    return `${memory.sessionId}_${memory.timestamp}`;
  }

  async storeOperational(memory: OperationalMemory): Promise<string> {
    const filename = `${memory.incidentId}_${memory.timestamp}.json`;
    const filepath = path.join(this.memoryDir, this.namespace, 'operational', filename);
    
    await fs.writeFile(filepath, JSON.stringify(memory, null, 2));
    return `${memory.incidentId}_${memory.timestamp}`;
  }

  async searchConversations(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    const conversationsDir = path.join(this.memoryDir, this.namespace, 'conversations');
    const files = await fs.readdir(conversationsDir).catch(() => []);
    
    const results: MemorySearchResult[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const filepath = path.join(conversationsDir, file);
        const content = await fs.readFile(filepath, 'utf8');
        const memory: ConversationMemory = JSON.parse(content);
        
        const similarity = this.calculateTextSimilarity(query, memory.userMessage + ' ' + memory.assistantResponse);
        if (similarity > 0.1) { // Basic threshold
          results.push({
            memory,
            similarity,
            relevance: similarity
          });
        }
      } catch (error) {
        console.error(`Error reading memory file ${file}:`, error);
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  async searchOperational(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    const operationalDir = path.join(this.memoryDir, this.namespace, 'operational');
    const files = await fs.readdir(operationalDir).catch(() => []);
    
    const results: MemorySearchResult[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const filepath = path.join(operationalDir, file);
        const content = await fs.readFile(filepath, 'utf8');
        const memory: OperationalMemory = JSON.parse(content);
        
        const searchText = memory.symptoms.join(' ') + ' ' + (memory.rootCause || '') + ' ' + (memory.resolution || '');
        const similarity = this.calculateTextSimilarity(query, searchText);
        
        if (similarity > 0.1) {
          results.push({
            memory,
            similarity,
            relevance: similarity
          });
        }
      } catch (error) {
        console.error(`Error reading operational memory file ${file}:`, error);
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private calculateTextSimilarity(query: string, text: string): number {
    // Simple text similarity using word overlap
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const textWords = new Set(text.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...queryWords].filter(word => textWords.has(word)));
    const union = new Set([...queryWords, ...textWords]);
    
    return intersection.size / union.size;
  }

  async getStats(): Promise<Partial<MemoryStats>> {
    const conversationsDir = path.join(this.memoryDir, this.namespace, 'conversations');
    const operationalDir = path.join(this.memoryDir, this.namespace, 'operational');
    
    const [conversationFiles, operationalFiles] = await Promise.all([
      fs.readdir(conversationsDir).catch(() => []),
      fs.readdir(operationalDir).catch(() => [])
    ]);
    
    return {
      totalConversations: conversationFiles.filter(f => f.endsWith('.json')).length,
      totalOperational: operationalFiles.filter(f => f.endsWith('.json')).length,
      chromaAvailable: false
    };
  }
}

/**
 * ChromaDB Client (placeholder - will integrate with actual ChromaDB)
 */
class ChromaDBClient {
  private host: string;
  private port: number;
  private isAvailable: boolean = false;

  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
  }

  async initialize(): Promise<void> {
    try {
      // Try to connect to ChromaDB
      // For now, we'll simulate this check
      // In real implementation, use: await fetch(`http://${this.host}:${this.port}/api/v1/heartbeat`)
      this.isAvailable = false; // Set to false until real ChromaDB integration
      console.error(`ChromaDB connection attempted at ${this.host}:${this.port} - not available yet`);
    } catch (error) {
      this.isAvailable = false;
      console.error('ChromaDB not available, using JSON fallback');
    }
  }

  isChromaAvailable(): boolean {
    return this.isAvailable;
  }

  // Placeholder methods for ChromaDB operations
  async createCollection(name: string): Promise<void> {
    if (!this.isAvailable) throw new Error('ChromaDB not available');
    // Implementation will use actual ChromaDB client
  }

  async addDocuments(collection: string, documents: any[]): Promise<void> {
    if (!this.isAvailable) throw new Error('ChromaDB not available');
    // Implementation will use actual ChromaDB client
  }

  async queryCollection(collection: string, query: string, limit: number): Promise<any[]> {
    if (!this.isAvailable) throw new Error('ChromaDB not available');
    // Implementation will use actual ChromaDB client
    return [];
  }
}

/**
 * Main Shared Memory Manager
 */
export class SharedMemoryManager {
  private config: SharedMemoryConfig;
  private contextExtractor: ContextExtractor;
  private jsonStorage: JsonFallbackStorage;
  private chromaClient: ChromaDBClient;

  constructor(config: SharedMemoryConfig) {
    this.config = config;
    this.contextExtractor = new ContextExtractor();
    this.jsonStorage = new JsonFallbackStorage(config.memoryDir, config.namespace);
    this.chromaClient = new ChromaDBClient(
      config.chromaHost || '127.0.0.1', 
      config.chromaPort || 8000
    );
  }

  async initialize(): Promise<void> {
    console.error('🧠 Initializing shared memory system...');
    
    // Always initialize JSON storage
    await this.jsonStorage.initialize();
    
    // Try to initialize ChromaDB
    await this.chromaClient.initialize();
    
    console.error(`✅ Memory system initialized (ChromaDB: ${this.isChromaAvailable() ? 'available' : 'fallback mode'})`);
  }

  async storeConversation(memory: ConversationMemory): Promise<string> {
    // Auto-extract context and tags if not provided
    if (memory.context.length === 0) {
      memory.context = this.contextExtractor.extractContext(memory.userMessage, memory.assistantResponse);
    }
    
    if (memory.tags.length === 0) {
      memory.tags = this.contextExtractor.generateTags(memory.userMessage, memory.assistantResponse, memory.domain);
    }

    // Always store in JSON (primary for fallback, backup for ChromaDB)
    const jsonId = await this.jsonStorage.storeConversation(memory);
    
    // Store in ChromaDB if available
    if (this.chromaClient.isChromaAvailable()) {
      try {
        // Implementation will store in ChromaDB collection
        console.error('📝 Stored conversation in ChromaDB and JSON');
      } catch (error) {
        console.error('⚠️ ChromaDB storage failed, JSON backup complete:', error);
      }
    } else {
      console.error('📝 Stored conversation in JSON (ChromaDB unavailable)');
    }
    
    return jsonId;
  }

  async storeOperational(memory: OperationalMemory): Promise<string> {
    // Always store in JSON
    const jsonId = await this.jsonStorage.storeOperational(memory);
    
    // Store in ChromaDB if available
    if (this.chromaClient.isChromaAvailable()) {
      try {
        // Implementation will store in ChromaDB collection
        console.error('📊 Stored operational memory in ChromaDB and JSON');
      } catch (error) {
        console.error('⚠️ ChromaDB storage failed, JSON backup complete:', error);
      }
    } else {
      console.error('📊 Stored operational memory in JSON (ChromaDB unavailable)');
    }
    
    return jsonId;
  }

  async searchConversations(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    if (this.chromaClient.isChromaAvailable()) {
      try {
        // Use ChromaDB vector search
        return await this.vectorSearchConversations(query, limit);
      } catch (error) {
        console.error('ChromaDB search failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON text search
    return await this.jsonStorage.searchConversations(query, limit);
  }

  async searchOperational(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    if (this.chromaClient.isChromaAvailable()) {
      try {
        // Use ChromaDB vector search
        return await this.vectorSearchOperational(query, limit);
      } catch (error) {
        console.error('ChromaDB search failed, falling back to JSON:', error);
      }
    }
    
    // Fallback to JSON text search
    return await this.jsonStorage.searchOperational(query, limit);
  }

  async getStats(): Promise<MemoryStats> {
    const jsonStats = await this.jsonStorage.getStats();
    
    return {
      totalConversations: jsonStats.totalConversations || 0,
      totalOperational: jsonStats.totalOperational || 0,
      chromaAvailable: this.chromaClient.isChromaAvailable(),
      storageUsed: await this.calculateStorageUsage(),
      lastCleanup: null, // TODO: Implement cleanup tracking
      namespace: this.config.namespace
    };
  }

  isChromaAvailable(): boolean {
    return this.chromaClient.isChromaAvailable();
  }

  async close(): Promise<void> {
    console.error('🧠 Closing memory system...');
    // Cleanup operations if needed
  }

  /**
   * Private helper methods
   */

  private async vectorSearchConversations(query: string, limit: number): Promise<MemorySearchResult[]> {
    // Placeholder for ChromaDB vector search
    // Will implement with actual ChromaDB client
    return [];
  }

  private async vectorSearchOperational(query: string, limit: number): Promise<MemorySearchResult[]> {
    // Placeholder for ChromaDB vector search
    // Will implement with actual ChromaDB client
    return [];
  }

  private async calculateStorageUsage(): Promise<string> {
    try {
      const dirPath = path.join(this.config.memoryDir, this.config.namespace);
      const stats = await this.getDirectorySize(dirPath);
      return this.formatBytes(stats);
    } catch (error) {
      return 'unknown';
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          totalSize += await this.getDirectorySize(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return totalSize;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
