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
  
  constructor(host: string, port: number, memoryDir: string) {
    // Use the working MCP-files implementation directly
    this.chromaManager = new ChromaMemoryManager(memoryDir);
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
    
    return await this.chromaManager.storeConversation(mcpFilesMemory);
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
    
    return await this.chromaManager.storeConversation(operationalAsConversation);
  }
  
  async searchConversations(query: string, limit: number = 5): Promise<any[]> {
    const results = await this.chromaManager.searchRelevantMemories(query, undefined, limit);

    return results.map((result: any) => {
      const meta = result.metadata || {};
      const context = Array.isArray(meta.context)
        ? meta.context
        : typeof meta.context === 'string'
          ? meta.context.split(/,\s*/).filter(Boolean)
          : [];
      const tags = Array.isArray(meta.tags)
        ? meta.tags
        : typeof meta.tags === 'string'
          ? meta.tags.split(/,\s*/).filter(Boolean)
          : [];
      return {
        memory: {
          sessionId: meta.sessionId || 'unknown',
          domain: meta.domain || 'mcp-ocs',
          timestamp: meta.timestamp || Date.now(),
          userMessage: meta.userMessage || (typeof result.content === 'string' ? result.content.split('\n')[0] : ''),
          assistantResponse: meta.assistantResponse || result.content || '',
          context,
          tags
        },
        similarity: typeof result.distance === 'number' ? (1 - result.distance) : (result.similarity ?? 0.5),
        relevance: typeof result.distance === 'number' ? (1 - result.distance) * 100 : (result.relevance ?? 50)
      };
    });
  }
  
  async searchOperational(query: string, limit: number = 5): Promise<any[]> {
    // Search with operational tag bias
    let results = await this.chromaManager.searchRelevantMemories(`${query} operational`, undefined, limit);

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

    return results.map((result: any) => {
      const meta = result.metadata || {};
      const context = Array.isArray(meta.affectedResources)
        ? meta.affectedResources
        : Array.isArray(meta.context)
          ? meta.context
          : typeof meta.context === 'string'
            ? meta.context.split(/,\s*/).filter(Boolean)
            : [];
      const tags = Array.isArray(meta.tags)
        ? meta.tags
        : typeof meta.tags === 'string'
          ? meta.tags.split(/,\s*/).filter(Boolean)
          : [];
      const assistant = meta.assistantResponse || '';
      const root = (assistant.split('Root Cause: ')[1] || '').split('\n')[0] || meta.rootCause || 'Unknown';
      const resolution = (assistant.split('Resolution: ')[1] || '') || meta.resolution || 'Pending';
      return {
        memory: {
          incidentId: (meta.incidentId || meta.sessionId || 'unknown').toString().replace(/^incident-/, ''),
          domain: meta.domain || 'mcp-ocs',
          timestamp: meta.timestamp || Date.now(),
          symptoms: [meta.userMessage || 'Unknown'],
          rootCause: root,
          resolution,
          environment: (meta.environment as any) || 'unknown',
          affectedResources: context,
          diagnosticSteps: [],
          tags
        },
        similarity: typeof result.distance === 'number' ? (1 - result.distance) : (result.similarity ?? 0.5),
        relevance: typeof result.distance === 'number' ? (1 - result.distance) * 100 : (result.relevance ?? 50)
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
        });
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
        });
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
