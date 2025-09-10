#!/usr/bin/env tsx
import { SharedMemoryManager } from '../lib/memory/shared-memory.js';
async function main() {
    const query = process.argv[2] || 'smoke-test';
    const sessionId = `smoke-${Date.now()}`;
    const memory = new SharedMemoryManager({
        domain: 'mcp-ocs', namespace: 'default', memoryDir: './memory',
        enableCompression: true, retentionDays: 7
    });
    // Store a tiny conversation
    await memory.storeConversation({
        sessionId,
        domain: 'knowledge',
        timestamp: Date.now(),
        userMessage: `Smoke store ${query}`,
        assistantResponse: `Ack ${query}`,
        context: ['smoke'],
        tags: ['smoke', 'validation']
    });
    // Search conversations
    const conv = await memory.searchConversations(query, 3);
    // Search operational (tolerate empty)
    const op = await memory.searchOperational(query, 3);
    const out = {
        ok: conv.length >= 1,
        sessionId,
        query,
        counts: { conversations: conv.length, operational: op.length },
        unified: true,
        jsonOnly: !!process.env.MCP_OCS_FORCE_JSON
    };
    console.log(JSON.stringify(out, null, 2));
}
main().catch(err => { console.error(String(err?.message || err)); process.exit(1); });
