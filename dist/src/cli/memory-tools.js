#!/usr/bin/env tsx
import { ChromaMemoryManager } from '../lib/memory/mcp-files-memory-extension.js';
import { nowEpoch } from '../utils/time.js';
import { MCPFilesChromaAdapter } from '../lib/memory/mcp-files-adapter.js';
function usage() {
    console.error('Usage:\n' +
        '  tsx src/cli/memory-tools.ts health [memoryDir]\n' +
        '  tsx src/cli/memory-tools.ts reload [memoryDir]\n' +
        '  tsx src/cli/memory-tools.ts search "<query>" [limit] [sessionId]\n' +
        '  tsx src/cli/memory-tools.ts find "<query>" [limit]');
    process.exit(2);
}
async function main() {
    const [, , rawCmd] = process.argv;
    const cmd = (rawCmd || 'health').toLowerCase();
    // Resolve memory directory
    const envDir = process.env.SHARED_MEMORY_DIR;
    const defaultDir = envDir && envDir.trim().length > 0 ? envDir : './memory/default';
    if (cmd === 'health' || cmd === 'reload') {
        const dirArg = process.argv[3];
        const memoryDir = dirArg || defaultDir;
        const mgr = new ChromaMemoryManager(memoryDir);
        await mgr.initialize();
        if (cmd === 'health') {
            const ok = await mgr.isAvailable();
            console.log(JSON.stringify({ ok, host: process.env.CHROMA_HOST || '127.0.0.1', port: process.env.CHROMA_PORT || 8000 }, null, 2));
            return;
        }
        // reload
        const out = await mgr.reloadAllMemoriesFromJson();
        console.log(JSON.stringify({ reloaded: out.loaded, errors: out.errors }, null, 2));
        return;
    }
    if (cmd === 'search') {
        const query = process.argv[3];
        const limitArg = process.argv[4];
        const sessionId = process.argv[5];
        if (!query)
            usage();
        const limit = limitArg ? Math.max(1, parseInt(limitArg, 10) || 5) : 5;
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        const results = await mgr.searchRelevantMemories(query, sessionId, limit);
        console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
        return;
    }
    if (cmd === 'find') {
        const query = process.argv[3];
        const limitArg = process.argv[4];
        if (!query)
            usage();
        const limit = limitArg ? Math.max(1, parseInt(limitArg, 10) || 5) : 5;
        const memoryDir = defaultDir;
        const host = process.env.CHROMA_HOST || '127.0.0.1';
        const port = parseInt(String(process.env.CHROMA_PORT || '8000'), 10) || 8000;
        const adapter = new MCPFilesChromaAdapter(String(host), Number(port), memoryDir);
        await adapter.initialize();
        const results = await adapter.searchOperational(query, limit);
        console.log(JSON.stringify({ ok: true, count: results.length, results }, null, 2));
        return;
    }
    if (cmd === 'clean-bench') {
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        const res = await mgr.deleteBySessionPattern('bench-');
        const json = await mgr.deleteJsonByFilenamePrefix('bench-');
        console.log(JSON.stringify({ action: 'clean-bench', vector: res, json }, null, 2));
        return;
    }
    if (cmd === 'delete-pattern') {
        const pattern = process.argv[3];
        if (!pattern)
            usage();
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        const res = await mgr.deleteBySessionPattern(pattern);
        console.log(JSON.stringify({ action: 'delete-pattern', pattern, ...res }, null, 2));
        return;
    }
    if (cmd === 'collections:list') {
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        const cols = await mgr.listCollections();
        console.log(JSON.stringify({ collections: cols }, null, 2));
        return;
    }
    if (cmd === 'collections:switch') {
        const name = process.argv[3];
        if (!name)
            usage();
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        await mgr.switchCollection(name);
        console.log(JSON.stringify({ ok: true, active: mgr.getCollectionName() }, null, 2));
        return;
    }
    if (cmd === 'embedding-info') {
        const mgr = new ChromaMemoryManager(defaultDir);
        await mgr.initialize();
        const info = await mgr.getEmbeddingInfo();
        console.log(JSON.stringify({ ok: true, ...info }, null, 2));
        return;
    }
    if (cmd === 'test-consistency') {
        // Validate embedding consistency across store/search and vector quality on exact match
        const unique = `consistency-${nowEpoch()}-${Math.random().toString(36).slice(2, 8)}`;
        const phrase = `Exact consistency test ${unique}`;
        const memDir = defaultDir;
        // Store via one instance
        const writer = new ChromaMemoryManager(memDir);
        await writer.initialize();
        const infoStore = await writer.getEmbeddingInfo();
        await writer.storeConversation({
            sessionId: unique,
            timestamp: nowEpoch(),
            userMessage: phrase,
            assistantResponse: `Response for ${phrase}`,
            context: ['consistency'],
            tags: ['consistency', 'test']
        });
        // Search via fresh instance
        const reader = new ChromaMemoryManager(memDir);
        await reader.initialize();
        const infoSearch = await reader.getEmbeddingInfo();
        const results = await reader.searchRelevantMemories(phrase, undefined, 1);
        const usedVector = await reader.isAvailable();
        const exactDist = results.length > 0 && results[0] ? results[0].distance : null;
        const consistent = usedVector && exactDist !== null ? (exactDist < 0.4 && infoStore.method === infoSearch.method) : false;
        console.log(JSON.stringify({
            methodStore: infoStore.method,
            dimensionsStore: infoStore.dimensions,
            methodSearch: infoSearch.method,
            dimensionsSearch: infoSearch.dimensions,
            exactMatchDistance: exactDist,
            consistent,
            usedVector,
            fallback: infoStore.fallback || infoSearch.fallback
        }, null, 2));
        return;
    }
    usage();
}
main().catch((e) => { console.error(e); process.exit(1); });
