import { ChromaMemoryManager } from '../dist/src/lib/memory/chroma-memory-manager.js';

const chroma = new ChromaMemoryManager('./memory');
await chroma.initialize();

// Ensure both logical collections exist upfront
const prefix = process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
const collections = [`${prefix}conversations`, `${prefix}operational`];
for (const name of collections) {
  try {
    await chroma.createCollection(name);
  } catch (e) {
    try { console.error('[chroma-ensure] createCollection error (non-fatal):', e?.message || String(e)); } catch {}
  }
}

