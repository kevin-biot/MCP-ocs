import { promises as fs } from 'fs';
import path from 'path';

export enum KnowledgeSourceClass {
  USER_PROVIDED = 'user_provided',
  ENGINEER_ADDED = 'engineer_added',
  SYSTEM_GENERATED = 'system_generated',
  EXTERNAL_API = 'external_api',
  DOCUMENT_PARSED = 'document_parsed'
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

export class ChromaMemoryManager {
  private collectionName = 'llm_conversation_memory';
  private memoryDir: string;
  private initialized = false;
  private host = '127.0.0.1';
  private port = 8000;
  private serverAvailable = false;
  private embedder: { embed(texts: string[]): Promise<number[][]>; method: string; model?: string; dim?: number } | null = null;
  private tenant = process.env.CHROMA_TENANT || 'default';
  private database = process.env.CHROMA_DATABASE || 'default';
  private collectionIdCache: Map<string, string> = new Map();
  
  // Safe logger available on instances; typed for TS
  private log(...args: any[]): void {
    if (isCaptureMode()) {
      try { console.error(...args); } catch {}
      return;
    }
    try { console.log(...args); } catch {}
  }

  constructor(memoryDir: string) {
    this.memoryDir = memoryDir;
    // Allow overriding host/port via environment
    try {
      if (process.env.CHROMA_HOST) this.host = String(process.env.CHROMA_HOST);
      if (process.env.CHROMA_PORT) {
        const p = parseInt(String(process.env.CHROMA_PORT), 10);
        if (!Number.isNaN(p) && p > 0) this.port = p;
      }
    } catch {}
    // No client SDK; we will talk to Chroma REST directly and handle embeddings locally
  }

  // Allow switching collections safely (e.g., for benchmarks)
  setCollectionName(name: string): void {
    if (!name || typeof name !== 'string') throw new Error('Invalid collection name');
    this.collectionName = name;
  }

  getCollectionName(): string { return this.collectionName; }
  
  private async ensureServerSideEmbeddings(name: string): Promise<void> {
    const base = `http://${this.host}:${this.port}/api/v2`;
    try {
      const res = await fetch(`${base}/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          embedding_function: {
            type: 'known',
            name: 'sentence-transformers',
            config: { model: 'all-MiniLM-L6-v2' }
          }
        })
      });
      if (!res.ok && res.status !== 409) {
        const txt = await res.text().catch(() => '');
        this.log(`⚠️ Server-side embedding config not applied: ${res.status} ${txt}`);
      } else {
        this.log('✓ Server-side embedding function ensured for collection');
      }
    } catch (e) {
      this.log('⚠️ Could not reach Chroma v2 API for embedding config (continuing)');
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure memory directory exists
      await fs.mkdir(this.memoryDir, { recursive: true });

      // Probe Chroma REST v2
      this.serverAvailable = await this.pingChroma();
      if (this.serverAvailable) {
        await this.ensureCollection(this.collectionName);
        await this.ensureEmbedder();
        this.log("✓ Chroma memory manager initialized (REST + local embeddings)");
      } else {
        this.log("✓ Memory manager initialized (JSON-only mode)");
      }

      this.initialized = true;
    } catch (error) {
      console.error("✗ ChromaDB failed, using JSON-only mode:", error);
      this.serverAvailable = false;
      this.initialized = true; // Still consider it initialized, just without ChromaDB
    }
  }

  async isAvailable(): Promise<boolean> { return this.initialized && this.serverAvailable; }

  async storeConversation(memory: ConversationMemory): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Always store to JSON as backup
    await this.storeConversationToJson(memory);
    
    if (!this.serverAvailable) {
      return true; // JSON storage succeeded
    }

    try {
      const id = `${memory.sessionId}_${memory.timestamp}`;
      const document = `User: ${memory.userMessage}\nAssistant: ${memory.assistantResponse}`;
      const embeddings = await this.embedTexts([document]);
      this.log('💾 Storing to ChromaDB:', {
        id,
        documentLength: document.length,
        sessionId: memory.sessionId
      });
      await this.restAdd(this.collectionName, {
        ids: [id],
        documents: [document],
        metadatas: [{
          sessionId: memory.sessionId,
          timestamp: memory.timestamp,
          userMessage: memory.userMessage,
          assistantResponse: memory.assistantResponse,
          // Chroma v2 metadata prefers scalar or simple types; serialize arrays
          context: Array.isArray(memory.context) ? memory.context.join(', ') : String(memory.context ?? ''),
          tags: Array.isArray(memory.tags) ? memory.tags.join(', ') : String(memory.tags ?? '')
        }],
        embeddings
      });
      
      this.log('✅ Successfully stored to ChromaDB');
      return true;
    } catch (error) {
      console.error('ChromaDB storage failed, but JSON backup succeeded:', error);
      return true; // JSON storage is still working
    }
  }

  async storeConversationToJson(memory: ConversationMemory): Promise<boolean> {
    try {
      const sessionFile = path.join(this.memoryDir, `${memory.sessionId}.json`);
      
      let existingData: ConversationMemory[] = [];
      try {
        const content = await fs.readFile(sessionFile, 'utf8');
        existingData = JSON.parse(content);
      } catch (error) {
        // File doesn't exist or is invalid, start with empty array
      }
      
      existingData.push(memory);
      
      await fs.writeFile(sessionFile, JSON.stringify(existingData, null, 2));
      return true;
    } catch (error) {
      console.error('JSON storage failed:', error);
      return false;
    }
  }

  async searchRelevantMemories(query: string, sessionId?: string, limit: number = 5): Promise<MemorySearchResult[]> {
    this.log(`🔍 Searching for: "${query}" (sessionId: ${sessionId || 'all'}, limit: ${limit})`);
    const normalize = (s: string) => String(s || '')
      .toLowerCase()
      .replace(/[\-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const qNorm = normalize(query);
    const qTokens = qNorm.split(' ').filter(Boolean);
    if (this.serverAvailable) {
      try {
        this.log('📊 Attempting ChromaDB vector search...');
        const embeddings = await this.embedTexts([query]);
        let results = await this.restQuery(this.collectionName, embeddings[0], limit, sessionId);
        // Re-rank with phrase/session/tags boosts using hyphen/underscore normalization
        try {
          const ranked = results.map((r: any) => {
            const content = normalize(r?.content || '');
            const meta = r?.metadata || {};
            const session = normalize(meta.sessionId || '');
            const tagsArr: string[] = Array.isArray(meta.tags)
              ? meta.tags
              : typeof meta.tags === 'string'
                ? String(meta.tags).split(/,\s*/).filter(Boolean)
                : [];
            const tagsNorm = tagsArr.map(normalize);
            let boost = 0;
            if (content.includes(qNorm)) boost = Math.max(boost, 3);
            if (session.includes(qNorm)) boost = Math.max(boost, 2);
            if (tagsNorm.some(t => qTokens.includes(t))) boost = Math.max(boost, 1);
            return { r, boost };
          });
          ranked.sort((a, b) => {
            if (b.boost !== a.boost) return b.boost - a.boost;
            const da = typeof a.r?.distance === 'number' ? a.r.distance : 1.0;
            const db = typeof b.r?.distance === 'number' ? b.r.distance : 1.0;
            if (da !== db) return da - db; // nearer first
            const ta = a.r?.metadata?.timestamp || 0;
            const tb = b.r?.metadata?.timestamp || 0;
            return tb - ta; // recent first
          });
          results = ranked.map(x => x.r);
        } catch {}
        // Exclude operational-style entries from conversation queries
        try {
          const nonOp = results.filter((r: any) => {
            const meta = r?.metadata || {};
            const tags = Array.isArray(meta.tags)
              ? meta.tags
              : typeof meta.tags === 'string'
                ? meta.tags.split(/,\s*/).filter(Boolean)
                : [];
            const hasIncident = !!meta.incidentId || (typeof meta.sessionId === 'string' && meta.sessionId.startsWith('incident-'));
            const hasRoot = typeof meta.assistantResponse === 'string' && meta.assistantResponse.includes('Root Cause:');
            const isOperational = tags.includes('operational') || hasIncident || hasRoot;
            return !isOperational;
          });
          if (nonOp.length > 0) results = nonOp;
        } catch {}

        // Deduplicate by (userMessage, assistantResponse, incidentId, content)
        const seen = new Set<string>();
        results = results.filter((r: any) => {
          const m = r?.metadata || {};
          const key = [m.userMessage || '', m.assistantResponse || '', m.incidentId || '', r.content || ''].join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        // After boost, keep order; ensure recent-first only as a final tie-breaker (handled above)
        if (results.length > 0) return results.slice(0, limit);
        this.log('⚠️ ChromaDB returned no results, falling back to JSON search');
      } catch (error) {
        console.error('❌ Chroma search failed, falling back to JSON search:', error);
      }
    } else {
      this.log('⚠️ ChromaDB not available, using JSON search directly');
    }

    // Fallback to JSON search
    this.log('📄 Using JSON search fallback...');
    const jsonResults = await this.searchJsonMemories(query, sessionId, limit);
    this.log(`📄 JSON search returned ${jsonResults.length} results`);
    return jsonResults;
  }

  async searchJsonMemories(query: string, sessionId?: string, limit: number = 5): Promise<MemorySearchResult[]> {
    try {
      const results: MemorySearchResult[] = [];
      const queryLower = query.toLowerCase();
      
      // Read all session files or specific session
      const files = sessionId 
        ? [`${sessionId}.json`]
        : await fs.readdir(this.memoryDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(this.memoryDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const memories: ConversationMemory[] = JSON.parse(content);
          
          for (const memory of memories) {
            const searchText = `${memory.userMessage} ${memory.assistantResponse} ${memory.tags.join(' ')}`.toLowerCase();
            
            if (searchText.includes(queryLower)) {
              results.push({
                content: `User: ${memory.userMessage}\nAssistant: ${memory.assistantResponse}`,
                metadata: {
                  sessionId: memory.sessionId,
                  timestamp: memory.timestamp,
                  tags: memory.tags,
                  context: memory.context
                },
                distance: 0.5 // Dummy distance for JSON search
              });
            }
          }
        } catch (error) {
          // Skip invalid files
          continue;
        }
      }
      
      return results.slice(0, limit);
    } catch (error) {
      console.error('JSON search failed:', error);
      return [];
    }
  }

  // --- REST helpers ---
  private async pingChroma(): Promise<boolean> {
    try {
      const res = await fetch(`http://${this.host}:${this.port}/api/v2/heartbeat`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async ensureCollection(name: string): Promise<void> {
    try {
      // First, list existing collections in tenant/database
      const listUrl = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections`;
      let listRes = await fetch(listUrl, { method: 'GET' });
      if (listRes.ok) {
        const data: any = await listRes.json().catch(() => ({}));
        const found = (data.collections || data || []).find((c: any) => c?.name === name);
        if (found?.id) {
          this.collectionIdCache.set(name, found.id);
          return;
        }
      }

      // Create collection in tenant/database
      const createRes = await fetch(listUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
      });
      if (createRes.ok) {
        const created: any = await createRes.json().catch(() => ({}));
        const id = created?.id || created?.collection?.id;
        if (id) this.collectionIdCache.set(name, id);
        return;
      }

      // Fallback: try root-level create
      const res = await fetch(`http://${this.host}:${this.port}/api/v2/collections`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
      });
      if (res.ok || res.status === 409) {
        // Try to resolve id again via list
        listRes = await fetch(listUrl, { method: 'GET' });
        if (listRes.ok) {
          const data: any = await listRes.json().catch(() => ({}));
          const found = (data.collections || data || []).find((c: any) => c?.name === name);
          if (found?.id) this.collectionIdCache.set(name, found.id);
        }
        return;
      } else {
        const txt = await res.text().catch(() => '');
        this.log(`⚠️ ensureCollection returned ${res.status}: ${txt}`);
      }
    } catch (e) {
      this.log('⚠️ ensureCollection failed (continuing with JSON only)');
      this.serverAvailable = false;
    }
  }

  // Lightweight collection utilities
  async listCollections(): Promise<{ id: string, name: string }[]> {
    const listUrl = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections`;
    try {
      const res = await fetch(listUrl, { method: 'GET' });
      if (res.ok) {
        const data: any = await res.json().catch(() => ({}));
        const arr: any[] = Array.isArray(data) ? data : (data.collections || []);
        return arr.map((c: any) => ({ id: c.id, name: c.name })).filter((x: any) => x.id && x.name);
      }
    } catch {}
    return [];
  }

  async createCollection(name: string): Promise<void> {
    await this.ensureCollection(name);
  }

  async switchCollection(name: string): Promise<void> {
    await this.ensureCollection(name);
    this.setCollectionName(name);
  }

  private async restAdd(collection: string, payload: { ids: string[]; documents: string[]; metadatas: any[]; embeddings: number[][]; }): Promise<void> {
    const id = await this.getCollectionId(collection);
    const url = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections/${id}/add`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Chroma add failed: ${res.status} ${txt}`);
    }
  }

  private async restDelete(collection: string, body: any): Promise<number | null> {
    const id = await this.getCollectionId(collection);
    const url = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections/${id}/delete`;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Chroma delete failed: ${res.status} ${txt}`);
    }
    try {
      const data: any = await res.json();
      // Some servers return {deleted: N}
      const deleted = typeof data?.deleted === 'number' ? data.deleted : null;
      return deleted;
    } catch {
      return null;
    }
  }

  // Best-effort cleanup: delete by sessionId pattern or document contains pattern
  async deleteBySessionPattern(pattern: string): Promise<{ ok: boolean; deleted: number | null }>{
    if (!this.serverAvailable) {
      this.log('⚠️ ChromaDB not available; no vector cleanup performed');
      return { ok: false, deleted: null };
    }
    try {
      // Prefer where_document contains pattern since docs include sessionId
      const deleted = await this.restDelete(this.collectionName, {
        where_document: { '$contains': pattern }
      });
      this.log(`🧹 Cleanup delete where_document contains "${pattern}" completed${deleted!==null?` (${deleted} items)`:''}`);
      // Also attempt metadata contains pattern (server may ignore if unsupported)
      try {
        const del2 = await this.restDelete(this.collectionName, {
          where: { sessionId: { '$contains': pattern } }
        });
        if (del2 !== null) this.log(`🧹 Metadata-based cleanup deleted ${del2} items`);
      } catch {}
      return { ok: true, deleted };
    } catch (e) {
      console.error('Cleanup delete failed:', e);
      return { ok: false, deleted: null };
    }
  }

  private async restQuery(collection: string, queryEmbedding: number[], limit: number, sessionId?: string): Promise<MemorySearchResult[]> {
    const id = await this.getCollectionId(collection);
    const url = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections/${id}/query`;
    const where = sessionId ? { sessionId } : undefined as any;
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query_embeddings: [queryEmbedding], n_results: limit, where }) });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Chroma query failed: ${res.status} ${txt}`);
    }
    const data: any = await res.json().catch(() => ({}));
    const ids = data.ids?.[0] || [];
    const docs = data.documents?.[0] || [];
    const metas = data.metadatas?.[0] || [];
    const dists = data.distances?.[0] || [];
    const results: MemorySearchResult[] = [];
    for (let i = 0; i < ids.length; i++) {
      results.push({
        content: docs[i] || '',
        metadata: metas[i] || {},
        distance: typeof dists[i] === 'number' ? dists[i] : 1.0
      });
    }
    return results;
  }

  private async getCollectionId(name: string): Promise<string> {
    const cached = this.collectionIdCache.get(name);
    if (cached) return cached;
    // Resolve by listing in tenant/database
    const listUrl = `http://${this.host}:${this.port}/api/v2/tenants/${this.tenant}/databases/${this.database}/collections`;
    const listRes = await fetch(listUrl, { method: 'GET' });
    if (listRes.ok) {
      const data: any = await listRes.json().catch(() => ({}));
      const found = (data.collections || data || []).find((c: any) => c?.name === name);
      if (found?.id) {
        this.collectionIdCache.set(name, found.id);
        return found.id;
      }
    }
    // Try ensure again, then read cache
    await this.ensureCollection(name);
    const after = this.collectionIdCache.get(name);
    if (!after) throw new Error('Collection id not found');
    return after;
  }

  // --- Embedding helpers ---
  private async ensureEmbedder(): Promise<void> {
    if (this.embedder) return;
    // Try to use @xenova/transformers; fallback to simple embedder
    try {
      // @ts-ignore
      const { pipeline } = await import('@xenova/transformers');
      const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.embedder = {
        async embed(texts: string[]) {
          const vecs: number[][] = [];
          for (const t of texts) {
            const out: any = await pipe(t, { pooling: 'mean', normalize: true });
            const arr = Array.from(out.data as Float32Array);
            vecs.push(arr);
          }
          return vecs;
        },
        method: 'xenova',
        model: 'Xenova/all-MiniLM-L6-v2',
        dim: 384
      };
      this.log('✓ Local embedding pipeline ready');
    } catch (e) {
      this.log('⚠️ @xenova/transformers not available, using simple hashing embeddings');
      this.embedder = { async embed(texts: string[]) { return texts.map(t => simpleHashEmbedding(t)); }, method: 'simple-hash-fallback', dim: 384 };
    }
  }

  private async embedTexts(texts: string[]): Promise<number[][]> {
    if (!this.embedder) await this.ensureEmbedder();
    return this.embedder!.embed(texts);
  }

  // Diagnostics for embeddings
  async getEmbeddingInfo(): Promise<{ method: string; model?: string; dimensions: number; fallback: boolean; speedMs: number }>{
    const t0 = Date.now();
    await this.ensureEmbedder();
    const probe = await this.embedTexts(['embedding info probe']);
    const dt = Date.now() - t0;
    const dim = Array.isArray(probe?.[0]) ? probe[0].length : (this.embedder?.dim || 0);
    const method = this.embedder?.method || 'unknown';
    const model = this.embedder?.model;
    return { method, model, dimensions: dim, fallback: method !== 'xenova', speedMs: dt };
  }

  private coerceMemoriesFromJson(fileBase: string, raw: any): ConversationMemory[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      // If array of structured conversation memories or mixed objects
      return raw.map((r) => coerceToConversation(fileBase, r));
    }
    if (typeof raw === 'object') {
      return [coerceToConversation(fileBase, raw)];
    }
    return [];
  }

  async listSessions(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.memoryDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Failed to list sessions:', error);
      return [];
    }
  }

  async getAllSessions(): Promise<string[]> {
    return this.listSessions();
  }

  async getSessionSummary(sessionId: string): Promise<any> {
    try {
      // Try to get from vector search first
      if (this.serverAvailable) {
        const results = await this.searchRelevantMemories("", sessionId, 10);
        if (results.length > 0) {
          return {
            sessionId,
            conversationCount: results.length,
            recentMemories: results.slice(0, 3)
          };
        }
      }
      
      // Fallback to JSON
      const sessionFile = path.join(this.memoryDir, `${sessionId}.json`);
      const content = await fs.readFile(sessionFile, 'utf8');
      const memories: ConversationMemory[] = JSON.parse(content);
      
      return {
        sessionId,
        conversationCount: memories.length,
        tags: [...new Set(memories.flatMap(m => m.tags))],
        context: [...new Set(memories.flatMap(m => m.context))],
        timeRange: {
          earliest: Math.min(...memories.map(m => m.timestamp)),
          latest: Math.max(...memories.map(m => m.timestamp))
        }
      };
    } catch (error) {
      console.error(`Failed to get session summary for ${sessionId}:`, error);
      return null;
    }
  }

  async buildContextPrompt(currentMessage: string, sessionId?: string, maxLength: number = 2000): Promise<string> {
    try {
      const relevantMemories = await this.searchRelevantMemories(currentMessage, sessionId, 3);
      
      if (relevantMemories.length === 0) {
        return "";
      }
      
      let context = "## Relevant Context from Previous Conversations:\n\n";
      let currentLength = context.length;
      
      for (const memory of relevantMemories) {
        const addition = `### ${memory.metadata.sessionId || 'Session'}\n${memory.content}\n\n`;
        if (currentLength + addition.length > maxLength) {
          break;
        }
        context += addition;
        currentLength += addition.length;
      }
      
      return context;
    } catch (error) {
      console.error('Failed to build context prompt:', error);
      return "";
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionFile = path.join(this.memoryDir, `${sessionId}.json`);
      await fs.unlink(sessionFile);
      
      // TODO: Also delete from ChromaDB if available
      
      return true;
    } catch (error) {
      console.error(`Failed to delete session ${sessionId}:`, error);
      return false;
    }
  }

  async reloadAllMemoriesFromJson(): Promise<{ loaded: number, errors: number }> {
    if (!this.serverAvailable) {
      console.error('ChromaDB not available for reload');
      return { loaded: 0, errors: 0 };
    }

    try {
      const sessionFiles = await fs.readdir(this.memoryDir);
      let loaded = 0;
      let errors = 0;
      this.log(`🔄 Starting bulk reload of ${sessionFiles.length} session files into ChromaDB (client embeddings)...`);

      // Ensure collection exists
      await this.ensureCollection(this.collectionName);
      await this.ensureEmbedder();

      for (const file of sessionFiles) {
        if (!file.endsWith('.json')) continue;
        try {
          const filePath = path.join(this.memoryDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          const raw = JSON.parse(content);
          const memories: ConversationMemory[] = this.coerceMemoriesFromJson(path.basename(filePath, '.json'), raw);

          // Batch reload for each file for efficiency
          const ids: string[] = [];
          const documents: string[] = [];
          const metadatas: any[] = [];
          for (const memory of memories) {
            ids.push(`${memory.sessionId}_${memory.timestamp}`);
            documents.push(`User: ${memory.userMessage}\nAssistant: ${memory.assistantResponse}`);
            metadatas.push({
              sessionId: memory.sessionId,
              timestamp: memory.timestamp,
              userMessage: memory.userMessage,
              assistantResponse: memory.assistantResponse,
              context: Array.isArray(memory.context) ? memory.context.join(', ') : String(memory.context ?? ''),
              tags: Array.isArray(memory.tags) ? memory.tags.join(', ') : String(memory.tags ?? '')
            });
          }

          // Embed and add in a few chunks to avoid huge payloads
          const chunkSize = 64;
          for (let i = 0; i < ids.length; i += chunkSize) {
            const idsChunk = ids.slice(i, i + chunkSize);
            const docsChunk = documents.slice(i, i + chunkSize);
            const metaChunk = metadatas.slice(i, i + chunkSize);
            const embeddings = await this.embedTexts(docsChunk);
            await this.restAdd(this.collectionName, {
              ids: idsChunk,
              documents: docsChunk,
              metadatas: metaChunk,
              embeddings
            });
            loaded += idsChunk.length;
          }

          this.log(`✓ Loaded ${memories.length} memories from ${file}`);
        } catch (error) {
          console.error(`✗ Failed to load ${file}:`, error);
          errors++;
        }
      }

      this.log(`🎉 Bulk reload complete: ${loaded} memories loaded, ${errors} errors`);
      return { loaded, errors };
    } catch (error) {
      console.error('Bulk reload failed:', error);
      return { loaded: 0, errors: 1 };
    }
  }

  // JSON cleanup helpers (remove files created by benchmarks)
  async deleteJsonByFilenamePrefix(prefix: string): Promise<{ deleted: number }>{
    let deleted = 0;
    try {
      const entries = await fs.readdir(this.memoryDir).catch(() => [] as string[]);
      for (const file of entries) {
        if (!file.endsWith('.json')) continue;
        if (!file.startsWith(prefix)) continue;
        try {
          await fs.unlink(path.join(this.memoryDir, file));
          deleted++;
        } catch {}
      }
    } catch {}
    return { deleted };
  }
}

// Utility functions - fix to match expected signatures
export function extractTags(text: string): string[] {
  const commonTags = [
    'javascript', 'typescript', 'python', 'react', 'node', 'docker', 
    'kubernetes', 'aws', 'database', 'api', 'frontend', 'backend',
    'deployment', 'security', 'performance', 'testing', 'debugging',
    'configuration', 'integration', 'authentication', 'monitoring'
  ];
  
  const textLower = text.toLowerCase();
  return commonTags.filter(tag => textLower.includes(tag));
}

export function extractContext(text: string): string[] {
  const context: string[] = [];
  
  // Extract file references
  const fileRegex = /(?:file:|filename:|path:)\s*([^\s,]+)/gi;
  let match;
  while ((match = fileRegex.exec(text)) !== null) {
    context.push(`file: ${match[1]}`);
  }
  
  // Extract URLs
  const urlRegex = /https?:\/\/[^\s,]+/gi;
  while ((match = urlRegex.exec(text)) !== null) {
    context.push(`url: ${match[0]}`);
  }
  
  return [...new Set(context)];
}

// Local helper to detect capture mode; module scoped
function isCaptureMode(): boolean {
  const v = process.env.CAPTURE_MODE;
  if (!v) return false;
  const s = String(v).toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

// Simple deterministic embedding (fallback) – 384-dim hashed bag-of-words
function simpleHashEmbedding(text: string): number[] {
  const dim = 384;
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    let h = 0;
    for (let c = 0; c < words[i].length; c++) {
      h = ((h << 5) - h) + words[i].charCodeAt(c);
      h |= 0;
    }
    const idx = Math.abs(h) % dim;
    vec[idx] += 1 / (i + 1);
  }
  // normalize
  const mag = Math.sqrt(vec.reduce((s, x) => s + x*x, 0));
  return vec.map(v => mag > 0 ? v / mag : 0);
}

// Coerce various JSON memory shapes into ConversationMemory[]
function coerceToConversation(fileBase: string, obj: any): ConversationMemory {
  const now = Date.now();
  const sessionId = obj?.sessionId || fileBase;
  const timestamp = typeof obj?.timestamp === 'number' ? obj.timestamp : now;
  const userMessage = obj?.userMessage || obj?.query || obj?.title || `Migrated from ${fileBase}`;
  const assistantResponse = obj?.assistantResponse || obj?.summary || JSON.stringify(obj).slice(0, 1000);
  const context = Array.isArray(obj?.context) ? obj.context : [];
  const tags = Array.isArray(obj?.tags) ? obj.tags : [];
  return { sessionId, timestamp, userMessage, assistantResponse, context, tags };
}
