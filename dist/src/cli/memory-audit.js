#!/usr/bin/env tsx
import { ChromaMemoryManager } from '../lib/memory/chroma-memory-manager.js';
async function main() {
    const prefix = process.env.CHROMA_COLLECTION_PREFIX || 'mcp-ocs-';
    const memDir = process.env.SHARED_MEMORY_DIR || './memory/default';
    const mgr = new ChromaMemoryManager(memDir);
    await mgr.initialize();
    const ok = await mgr.isAvailable();
    if (!ok) {
        console.log(JSON.stringify({ ok: false, reason: 'chroma_unavailable' }, null, 2));
        return;
    }
    const cols = await mgr.listCollections();
    const unprefixed = cols.filter(c => !c.name.startsWith(prefix));
    console.log(JSON.stringify({ ok: true, prefix, collections: cols, unprefixed, isolated: unprefixed.length === 0 }, null, 2));
}
main().catch(err => { console.error(String(err?.message || err)); process.exit(1); });
