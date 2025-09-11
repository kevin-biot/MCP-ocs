#!/usr/bin/env tsx
import { ChromaMemoryManager } from '../lib/memory/chroma-memory-manager.js';
async function main() {
    const host = process.env.CHROMA_HOST || '127.0.0.1';
    const port = process.env.CHROMA_PORT ? Number(process.env.CHROMA_PORT) : 8000;
    const tenant = process.env.CHROMA_TENANT || 'mcp-ocs';
    const database = process.env.CHROMA_DATABASE || 'prod';
    const explicit = process.env.CHROMA_COLLECTION ? String(process.env.CHROMA_COLLECTION) : '';
    const prefix = process.env.CHROMA_COLLECTION_PREFIX || (explicit ? '' : 'mcp-ocs-');
    const memDir = process.env.SHARED_MEMORY_DIR || './memory/default';
    const mgr = new ChromaMemoryManager(memDir);
    await mgr.initialize();
    const available = await mgr.isAvailable();
    if (!available) {
        console.log(JSON.stringify({ ok: false, reason: 'chroma_unavailable', chroma: { host, port, tenant, database } }, null, 2));
        return;
    }
    const present = await mgr.listCollections();
    const strategy = explicit ? 'unified' : 'separate';
    const expected = explicit
        ? [explicit]
        : [`${prefix}conversations`, `${prefix}operational`, `${prefix}tool_exec`];
    const presentNames = new Set(present.map(c => c.name));
    const missing = expected.filter(n => !presentNames.has(n));
    const unprefixed = !explicit ? present.filter(c => !c.name.startsWith(prefix)) : [];
    const isolated = explicit ? true : unprefixed.length === 0;
    const out = {
        ok: true,
        chroma: { host, port, tenant, database, available },
        strategy,
        expected,
        present,
        missing,
        isolation: { prefix, isolated, unprefixed },
    };
    console.log(JSON.stringify(out, null, 2));
}
main().catch(err => { console.error(String(err?.message || err)); process.exit(1); });
