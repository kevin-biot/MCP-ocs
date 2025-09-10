#!/usr/bin/env node
import { ChromaMemoryManager } from '../src/lib/memory/mcp-files-memory-extension.js';

const TEST_COLLECTION = 'mcp-ocs-test-vector-validation';

async function main() {
  const mgr = new ChromaMemoryManager('./memory/default');
  await mgr.initialize();
  const serverOk = await mgr.isAvailable();
  const started = Date.now();
  const log = (msg: any) => console.error(typeof msg === 'string' ? msg : JSON.stringify(msg));

  if (!serverOk) {
    log({ subsystem: 'memory', event: 'vector_safe_test', step: 'init', status: 'skipped', reason: 'server_unavailable' });
    console.log(JSON.stringify({ ok: false, reason: 'server_unavailable' }, null, 2));
    return;
  }

  // Ensure isolated test collection
  await mgr.createCollection(TEST_COLLECTION);
  log({ subsystem: 'memory', event: 'vector_safe_test', step: 'collection_created', collection: TEST_COLLECTION });

  // Store one test memory
  const ts = Date.now();
  const test = {
    sessionId: 'vector-safe-test',
    timestamp: ts,
    userMessage: 'Vector test probe unique-phrase-42',
    assistantResponse: 'Response to vector test probe',
    context: ['probe','vector'],
    tags: ['vector_test','isolated']
  };
  await mgr.storeConversation(test, TEST_COLLECTION);
  log({ subsystem: 'memory', event: 'store_conversation', collection: TEST_COLLECTION, sessionId: test.sessionId, ts, status: 'ok' });

  // Search for the same phrase
  const results = await mgr.searchRelevantMemoriesInCollection(TEST_COLLECTION, 'unique-phrase-42', undefined, 1);
  const hit = results && results[0];
  const distance = hit?.distance;
  const ok = Array.isArray(results) && results.length > 0;
  log({ subsystem: 'memory', event: 'search_conversations', collection: TEST_COLLECTION, query: 'unique-phrase-42', count: results.length, distance });

  // Cleanup: drop the test collection
  const cleaned = await mgr.deleteCollection(TEST_COLLECTION);
  log({ subsystem: 'memory', event: 'vector_safe_test', step: 'collection_deleted', collection: TEST_COLLECTION, cleaned });

  console.log(JSON.stringify({ ok, distance, elapsedMs: Date.now() - started }, null, 2));
}

main().catch(err => { console.error({ subsystem: 'memory', event: 'vector_safe_test_error', message: String(err?.message||err) }); process.exit(1); });

