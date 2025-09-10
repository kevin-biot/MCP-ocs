import { promises as fs } from 'fs';
import path from 'path';
import { ChromaMemoryManager } from './mcp-files-memory-extension.js';

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

export interface SearchOptions { topK?: number; sessionId?: string }

export interface MemoryStats { totalConversations: number; totalOperational: number; chromaAvailable: boolean; storageUsed: string }

/**
 * UnifiedMemoryAdapter
 * Facade over ChromaMemoryManager so all code paths share one backend.
 */
export class UnifiedMemoryAdapter {
  private chroma: ChromaMemoryManager;
  private memoryDir: string;
  private available = false;
  private convCollection: string;
  private opCollection: string;

  constructor(config: MemoryConfig) {
    this.memoryDir = config.memoryDir;
    // Pass through optional host/port via env for Chroma manager
    try {
      if (config.chromaHost) process.env.CHROMA_HOST = String(config.chromaHost);
      if (typeof config.chromaPort === 'number') process.env.CHROMA_PORT = String(config.chromaPort);
    } catch {}
    const prefix = process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
    this.convCollection = `${prefix}conversations`;
    this.opCollection = `${prefix}operational`;
    this.chroma = new ChromaMemoryManager(config.memoryDir);
  }

  async initialize(): Promise<void> {
    await this.chroma.initialize();
    try {
      // Chroma manager exposes availability synchronously after init
      const av = await this.chroma.isAvailable();
      this.available = !!av;
    } catch { this.available = false; }
  }

  isAvailable(): boolean { return this.available; }

  async storeConversation(data: ConversationData): Promise<void> {
    const tags = Array.isArray(data.tags) ? data.tags : [];
    await this.chroma.storeConversation({
      sessionId: data.sessionId,
      timestamp: data.timestamp,
      userMessage: data.userMessage,
      assistantResponse: data.assistantResponse,
      context: data.context,
      tags: [...tags, `domain:${data.domain}`]
    }, this.convCollection);
  }

  async storeOperational(data: OperationalData): Promise<void> {
    const assistant = `Root Cause: ${data.rootCause || 'Unknown'}\nResolution: ${data.resolution || 'Pending'}`;
    await this.chroma.storeConversation({
      sessionId: `incident-${data.incidentId}`,
      timestamp: data.timestamp,
      userMessage: `Incident: ${data.symptoms.join(', ')}`,
      assistantResponse: assistant,
      context: data.affectedResources,
      tags: [...data.tags, `domain:${data.domain}`, `environment:${data.environment}`, 'operational']
    }, this.opCollection);
  }

  async storeToolExecution(
    toolName: string,
    args: any,
    result: any,
    sessionId: string,
    tags: string[] = [],
    domain: string = 'mcp-ocs',
    environment: 'dev' | 'test' | 'staging' | 'prod' = 'prod',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.chroma.storeConversation({
      sessionId,
      timestamp: Date.now(),
      userMessage: `Tool ${toolName} executed with args: ${JSON.stringify(args)}`,
      assistantResponse: typeof result === 'string' ? result : JSON.stringify(result),
      context: [],
      tags: [
        ...tags,
        `tool:${toolName}`,
        `domain:${domain}`,
        `environment:${environment}`,
        `severity:${severity}`,
        'tool_execution'
      ]
    }, this.convCollection);
  }

  async searchRelevantMemories(query: string, options: SearchOptions = {}): Promise<MemoryResult[]> {
    const topK = options.topK ?? 5;
    const sessionId = options.sessionId;
    const results = await this.chroma.searchRelevantMemoriesInCollection(this.convCollection, query, sessionId, topK);
    return results as any;
  }

  async getStats(): Promise<MemoryStats> {
    const dir = this.memoryDir;
    const files = await fs.readdir(dir).catch(() => [] as string[]);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    const totalOperational = jsonFiles.filter(f => f.startsWith('incident-')).length;
    const totalConversations = jsonFiles.length - totalOperational;
    const chromaAvailable = await this.chroma.isAvailable();
    const storageUsed = await this.getDirectorySize(dir).then(this.formatBytes).catch(() => 'unknown');
    return { totalConversations: Math.max(0, totalConversations), totalOperational: Math.max(0, totalOperational), chromaAvailable, storageUsed };
  }

  async searchConversations(query: string, topK: number = 5): Promise<Array<{ memory: any; similarity: number; relevance: number }>> {
    const raw = await this.searchRelevantMemories(query, { topK });
    return raw.map((r: any) => {
      const meta = r?.metadata || {};
      const content: string = r?.content || '';
      const distance = typeof r?.distance === 'number' ? r.distance : undefined;
      return {
        memory: {
          sessionId: meta.sessionId || 'unknown',
          domain: meta.domain || 'mcp-ocs',
          timestamp: meta.timestamp || Date.now(),
          userMessage: typeof meta.userMessage === 'string' ? meta.userMessage : (content.split('\n')[0] || ''),
          assistantResponse: typeof meta.assistantResponse === 'string' ? meta.assistantResponse : content,
          context: this.normArray(meta.context),
          tags: this.normArray(meta.tags)
        },
        similarity: typeof distance === 'number' ? (1 - distance) : (typeof r?.similarity === 'number' ? r.similarity : 0.5),
        relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof r?.relevance === 'number' ? r.relevance : 50)
      };
    });
  }

  async searchOperational(query: string, topK: number = 5): Promise<Array<{ memory: any; similarity: number; relevance: number }>> {
    // First try plain query to be JSON-friendly; then try with an operational hint
    let raw: any[] = await this.chroma.searchRelevantMemoriesInCollection(this.opCollection, query, undefined, topK) as any;
    if (!raw || raw.length === 0) {
      raw = await this.searchRelevantMemories(`${query} operational`, { topK }) as any;
    }
    try {
      const filtered = raw.filter((r: any) => {
        const meta = r?.metadata || {};
        const tags = this.normArray(meta.tags);
        const hasIncident = !!meta.incidentId || (typeof meta.sessionId === 'string' && meta.sessionId.startsWith('incident-'));
        const hasOpTag = tags.includes('operational') || tags.includes('tool_execution');
        const hasRoot = typeof meta.assistantResponse === 'string' && meta.assistantResponse.includes('Root Cause:');
        return hasIncident || hasOpTag || hasRoot;
      });
      if (filtered.length > 0) raw = filtered;
    } catch {}

    return raw.map((r: any) => {
      const meta = r?.metadata || {};
      const content: string = r?.content || '';
      const distance = typeof r?.distance === 'number' ? r.distance : undefined;
      const affected = this.normArray(meta.affectedResources);
      const context = affected.length ? affected : this.normArray(meta.context);
      const assistant = typeof meta.assistantResponse === 'string' ? meta.assistantResponse : '';
      const root = (assistant.split('Root Cause: ')[1] || '').split('\n')[0] || (typeof meta.rootCause === 'string' ? meta.rootCause : 'Unknown');
      const resolution = (assistant.split('Resolution: ')[1] || '') || (typeof meta.resolution === 'string' ? meta.resolution : 'Pending');
      const rawId = (typeof meta.incidentId === 'string' ? meta.incidentId : (typeof meta.sessionId === 'string' ? meta.sessionId : 'unknown'));
      const incidentId = String(rawId).replace(/^incident-/, '');
      const tags = this.normArray(meta.tags);
      const envFromMeta = typeof meta.environment === 'string' ? meta.environment : undefined;
      const envFromTag = (tags.find(t => t.startsWith('environment:')) || '').split(':')[1];
      const envCandidate = (envFromMeta || envFromTag || '').toLowerCase();
      const environment: 'dev' | 'test' | 'staging' | 'prod' = (['dev','test','staging','prod'] as const).includes(envCandidate as any)
        ? (envCandidate as any)
        : 'prod';
      const domainFromTag = (tags.find(t => t.startsWith('domain:')) || '').split(':')[1];
      const domain = meta.domain || domainFromTag || 'mcp-ocs';

      const firstLine = (content.split('\n')[0] || '').replace(/^User:\s*/, '');
      const symptomText = firstLine.replace(/^Incident:\s*/, '');
      return {
        memory: {
          incidentId,
          domain,
          timestamp: meta.timestamp || Date.now(),
          symptoms: [typeof meta.userMessage === 'string' ? meta.userMessage : (symptomText || 'Unknown')],
          rootCause: root,
          resolution,
          environment,
          affectedResources: context,
          diagnosticSteps: [],
          tags
        },
        similarity: typeof distance === 'number' ? (1 - distance) : (typeof r?.similarity === 'number' ? r.similarity : 0.5),
        relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof r?.relevance === 'number' ? r.relevance : 50)
      };
    });
  }

  private normArray(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string');
    if (typeof raw === 'string') return raw.split(/,\s*/).filter(Boolean);
    return [];
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    try {
      const items = await fs.readdir(dirPath);
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        totalSize += stats.isDirectory() ? await this.getDirectorySize(itemPath) : stats.size;
      }
    } catch {}
    return totalSize;
  }

  private formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
}
