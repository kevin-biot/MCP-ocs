/**
 * ChromaDB Integration - Using Working MCP-files Implementation
 * 
 * Smart approach: Use the proven working ChromaMemoryManager instead of reimplementing
 */

import { ChromaMemoryManager } from './mcp-files-memory-extension.js';
import type { ConversationMemory, OperationalMemory } from './shared-memory';

/**
 * Wrapper to adapt MCP-files ChromaMemoryManager to our interface
 */
export class MCPFilesChromaAdapter {
  private chromaManager: ChromaMemoryManager;
  private available = false;
  private convCollection: string;
  private opCollection: string;
  
  constructor(host: string, port: number, memoryDir: string) {
    // Use the working MCP-files implementation directly
    this.chromaManager = new ChromaMemoryManager(memoryDir);
    const prefix = process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
    this.convCollection = `${prefix}conversations`;
    this.opCollection = `${prefix}operational`;
  }
  
  async initialize(): Promise<void> {
    const v = process.env.MCP_OCS_FORCE_JSON;
    const forceJson = v && ['1','true','yes','on'].includes(String(v).toLowerCase());
    await this.chromaManager.initialize();
    if (forceJson) {
      this.available = false;
    } else {
      try {
        this.available = await this.chromaManager.isAvailable();
      } catch {
        this.available = false;
      }
    }
  }
  
  isChromaAvailable(): boolean {
    return this.available;
  }
  
  async storeConversation(memory: ConversationMemory): Promise<boolean> {
    // Adapt our conversation format to MCP-files format
    const mcpFilesMemory = {
      sessionId: memory.sessionId,
      timestamp: memory.timestamp,
      userMessage: memory.userMessage,
      assistantResponse: memory.assistantResponse,
      context: memory.context,
      tags: [...memory.tags, `domain:${memory.domain}`] // Add domain as tag
    };
    
    return await this.chromaManager.storeConversation(mcpFilesMemory, this.convCollection);
  }
  
  async storeOperational(memory: OperationalMemory): Promise<boolean> {
    // Convert operational memory to conversation format for MCP-files
    const operationalAsConversation = {
      sessionId: `incident-${memory.incidentId}`,
      timestamp: memory.timestamp,
      userMessage: `Incident: ${memory.symptoms.join(', ')}`,
      assistantResponse: `Root Cause: ${memory.rootCause || 'Unknown'}\nResolution: ${memory.resolution || 'Pending'}`,
      context: memory.affectedResources,
      tags: [...memory.tags, `domain:${memory.domain}`, `environment:${memory.environment}`, 'operational']
    };
    
    return await this.chromaManager.storeConversation(operationalAsConversation, this.opCollection);
  }
  
  async searchConversations(query: string, limit: number = 5): Promise<any[]> {
    const results = await this.chromaManager.searchRelevantMemoriesInCollection(this.convCollection, query, undefined, limit);

    return results.map((result) => {
      const metaRaw = (result && typeof result === 'object' && 'metadata' in result) ? (result as any).metadata : {};
      const content = (result && typeof result === 'object' && 'content' in result) ? (result as any).content : '';
      const distance = (result && typeof result === 'object' && typeof (result as any).distance === 'number') ? (result as any).distance : undefined;
      const meta = (typeof metaRaw === 'object' && metaRaw !== null) ? metaRaw as Record<string, unknown> : {};
      const ctx = meta.context;
      const tagsRaw = meta.tags;
      const context: string[] = Array.isArray(ctx)
        ? (ctx as unknown[]).filter((t): t is string => typeof t === 'string')
        : (typeof ctx === 'string' ? (ctx as string).split(/,\s*/).filter(Boolean) : []);
      const tags: string[] = Array.isArray(tagsRaw)
        ? (tagsRaw as unknown[]).filter((t): t is string => typeof t === 'string')
        : (typeof tagsRaw === 'string' ? (tagsRaw as string).split(/,\s*/).filter(Boolean) : []);

      return {
        memory: {
          sessionId: typeof meta.sessionId === 'string' ? meta.sessionId : 'unknown',
          domain: typeof meta.domain === 'string' ? meta.domain : 'mcp-ocs',
          timestamp: typeof meta.timestamp === 'number' ? meta.timestamp : Date.now(),
          userMessage: typeof meta.userMessage === 'string' ? meta.userMessage : (typeof content === 'string' ? content.split('\n')[0] : ''),
          assistantResponse: typeof meta.assistantResponse === 'string' ? meta.assistantResponse : (typeof content === 'string' ? content : ''),
          context,
          tags
        },
        similarity: typeof distance === 'number' ? (1 - distance) : (typeof (result as any)?.similarity === 'number' ? (result as any).similarity : 0.5),
        relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof (result as any)?.relevance === 'number' ? (result as any).relevance : 50)
      };
    });
  }
  
  async searchOperational(query: string, limit: number = 5): Promise<any[]> {
    // Search with operational tag bias
    let results = await this.chromaManager.searchRelevantMemoriesInCollection(this.opCollection, `${query}`, undefined, limit);

    // Prefer incident-style entries: explicit incidentId, operational tag, or assistantResponse containing 'Root Cause:'
    try {
      const filtered = results.filter((r: any) => {
        const meta = r?.metadata || {};
        const tags = Array.isArray(meta.tags)
          ? meta.tags
          : typeof meta.tags === 'string'
            ? meta.tags.split(/,\s*/).filter(Boolean)
            : [];
        const hasIncident = !!meta.incidentId || (typeof meta.sessionId === 'string' && meta.sessionId.startsWith('incident-'));
        const hasOpTag = tags.includes('operational') || tags.includes('tool_execution');
        const hasRoot = typeof meta.assistantResponse === 'string' && meta.assistantResponse.includes('Root Cause:');
        return hasIncident || hasOpTag || hasRoot;
      });
      if (filtered.length > 0) results = filtered;

      // Deduplicate by incidentId + timestamp + content
      const seen = new Set<string>();
      results = results.filter((r: any) => {
        const m = r?.metadata || {};
        const key = [m.incidentId || m.sessionId || '', m.timestamp || '', r.content || ''].join('|');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch {}

    return results.map((result) => {
      const metaRaw = (result && typeof result === 'object' && 'metadata' in result) ? (result as any).metadata : {};
      const content = (result && typeof result === 'object' && 'content' in result) ? (result as any).content : '';
      const distance = (result && typeof result === 'object' && typeof (result as any).distance === 'number') ? (result as any).distance : undefined;
      const meta = (typeof metaRaw === 'object' && metaRaw !== null) ? metaRaw as Record<string, unknown> : {};
      const affected = meta.affectedResources;
      const ctx = meta.context;
      const tagsRaw = meta.tags;
      const context: string[] = Array.isArray(affected)
        ? (affected as unknown[]).filter((t): t is string => typeof t === 'string')
        : Array.isArray(ctx)
          ? (ctx as unknown[]).filter((t): t is string => typeof t === 'string')
          : (typeof ctx === 'string' ? (ctx as string).split(/,\s*/).filter(Boolean) : []);
      const tags: string[] = Array.isArray(tagsRaw)
        ? (tagsRaw as unknown[]).filter((t): t is string => typeof t === 'string')
        : (typeof tagsRaw === 'string' ? (tagsRaw as string).split(/,\s*/).filter(Boolean) : []);
      const assistant = typeof meta.assistantResponse === 'string' ? meta.assistantResponse : '';
      const root = (assistant.split('Root Cause: ')[1] || '').split('\n')[0] || (typeof meta.rootCause === 'string' ? meta.rootCause : 'Unknown');
      const resolution = (assistant.split('Resolution: ')[1] || '') || (typeof meta.resolution === 'string' ? meta.resolution : 'Pending');
      const rawId = (typeof meta.incidentId === 'string' ? meta.incidentId : (typeof meta.sessionId === 'string' ? meta.sessionId : 'unknown'));
      const incidentId = String(rawId).replace(/^incident-/, '');
      return {
        memory: {
          incidentId,
          domain: typeof meta.domain === 'string' ? meta.domain : 'mcp-ocs',
          timestamp: typeof meta.timestamp === 'number' ? meta.timestamp : Date.now(),
          symptoms: [typeof meta.userMessage === 'string' ? meta.userMessage : (typeof content === 'string' ? content : 'Unknown')],
          rootCause: root,
          resolution,
          environment: typeof meta.environment === 'string' ? meta.environment : 'unknown',
          affectedResources: context,
          diagnosticSteps: [],
          tags
        },
        similarity: typeof distance === 'number' ? (1 - distance) : (typeof (result as any)?.similarity === 'number' ? (result as any).similarity : 0.5),
        relevance: typeof distance === 'number' ? (1 - distance) * 100 : (typeof (result as any)?.relevance === 'number' ? (result as any).relevance : 50)
      };
    });
  }

  // Add missing methods that shared-memory expects
  async addDocuments(collectionName: string, documents: any[]): Promise<void> {
    const v = process.env.CAPTURE_MODE;
    const cap = v && ['1','true','yes','on'].includes(String(v).toLowerCase());
    const log = cap ? console.error : console.log;
    log(`📝 Adding ${documents.length} documents to ${collectionName} via MCP-files adapter`);

    // Persist as conversations for JSON fallback search compatibility
    for (const doc of documents) {
      const content: string = doc.content || doc.document || '';
      const meta: any = doc.metadata || {};
      const ts: number = meta.timestamp || Date.now();
      const tagsArr: string[] = Array.isArray(meta.tags) ? meta.tags : (typeof meta.tags === 'string' ? String(meta.tags).split(/,\s*/) : []);
      const ctxArr: string[] = Array.isArray(meta.context) ? meta.context : (typeof meta.context === 'string' ? String(meta.context).split(/,\s*/) : []);

      if (collectionName === 'conversations') {
        const parts = content.split('\n');
        const userMessage = parts[0] || '';
        const assistantResponse = content;
        await this.chromaManager.storeConversation({
          sessionId: meta.sessionId || 'unknown',
          timestamp: ts,
          userMessage,
          assistantResponse,
          context: ctxArr,
          tags: tagsArr
        }, this.convCollection);
      } else if (collectionName === 'operational') {
        // Convert to a conversation-like record similar to storeOperational()
        const rootCause = meta.rootCause || 'Unknown';
        const assistantResponse = `Root Cause: ${rootCause}\nResolution: ${meta.resolution || 'Pending'}`;
        await this.chromaManager.storeConversation({
          sessionId: `incident-${meta.incidentId || 'unknown'}`,
          timestamp: ts,
          userMessage: content || (meta.symptoms ? String(meta.symptoms) : ''),
          assistantResponse,
          context: Array.isArray(meta.affectedResources) ? meta.affectedResources : ctxArr,
          tags: [...tagsArr, 'operational']
        }, this.opCollection);
      }
    }
  }
  
  async queryCollection(collectionName: string, queryText: string, limit: number = 5): Promise<any[]> {
    // Use the search methods instead
    if (collectionName === 'conversations') {
      const results = await this.searchConversations(queryText, limit);
      return results.map((r: any) => ({ ...r, id: `conv_${Date.now()}`, content: r.memory.userMessage, metadata: r.memory }));
    } else {
      const results = await this.searchOperational(queryText, limit);
      return results.map((r: any) => ({ ...r, id: `op_${Date.now()}`, content: r.memory.symptoms.join(' '), metadata: r.memory }));
    }
  }
}
