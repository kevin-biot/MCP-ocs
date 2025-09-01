#!/usr/bin/env tsx

import { ChromaMemoryManager } from '../lib/memory/mcp-files-memory-extension.js';

type BenchOpts = {
  docs?: number;
  queries?: number;
  topk?: number;
  payloadWords?: number;
  memoryDir?: string;
};

function rndWord(): string {
  const a = 'abcdefghijklmnopqrstuvwxyz';
  const len = 5 + Math.floor(Math.random() * 6);
  let s = '';
  for (let i = 0; i < len; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

function genPayload(words: number): string {
  const arr: string[] = [];
  for (let i = 0; i < words; i++) arr.push(rndWord());
  return arr.join(' ');
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function bench(opts: BenchOpts, csvPath?: string) {
  const docs = opts.docs ?? 300;
  const queries = opts.queries ?? Math.min(50, docs);
  const topk = opts.topk ?? 5;
  const payloadWords = opts.payloadWords ?? 24;
  const memoryDir = opts.memoryDir || process.env.SHARED_MEMORY_DIR || './memory/default';

  const mgr = new ChromaMemoryManager(memoryDir);
  await mgr.initialize();

  // Use a dedicated benchmark collection; never pollute production
  const BENCHMARK_COLLECTION = process.env.BENCHMARK_COLLECTION || 'benchmark_test_data';
  if (BENCHMARK_COLLECTION === 'llm_conversation_memory') {
    throw new Error('Benchmark cannot use production collection! Use dedicated test collection.');
  }
  mgr.setCollectionName(BENCHMARK_COLLECTION);

  const testRunId = `bench-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const labels: string[] = [];
  const insertLat: number[] = [];

  const insertStartAll = Date.now();
  for (let i = 0; i < docs; i++) {
    const label = `${testRunId}-topic-${i}`;
    labels.push(label);
    const start = Date.now();
    await mgr.storeConversation({
      sessionId: `${testRunId}-${i}`,
      timestamp: Date.now(),
      userMessage: `${label} ${genPayload(payloadWords)}`,
      assistantResponse: `Response for ${label}: ${genPayload(payloadWords)}`,
      context: ['bench', testRunId],
      tags: ['bench','vector']
    });
    insertLat.push(Date.now() - start);
    // Yield occasionally to avoid tight loop blockage
    if (i % 100 === 0) await sleep(5);
  }

  const pick = (n: number) => {
    const idx = new Set<number>();
    while (idx.size < n && idx.size < labels.length) {
      idx.add(Math.floor(Math.random() * labels.length));
    }
    const out: string[] = [];
    for (const i of Array.from(idx)) {
      const v = labels[i];
      if (typeof v === 'string') out.push(v);
    }
    return out;
  };

  const insertElapsedAll = Date.now() - insertStartAll;
  const sample = pick(queries);
  const queryLat: number[] = [];
  let top1Hits = 0;
  const top1Dist: number[] = [];

  for (const label of sample) {
    const q = label; // exact phrase should be strong signal
    const start = Date.now();
    const results = await mgr.searchRelevantMemories(q, undefined, topk);
    const dur = Date.now() - start;
    queryLat.push(dur);
    if (results.length > 0) {
      const top = results[0];
      if (top) {
        top1Dist.push(top.distance);
        const content = top.content ?? '';
        const userMessage = top.metadata?.userMessage ?? '';
        if (content.includes(label) || userMessage.includes(label)) top1Hits++;
      }
    }
  }

  const p = (arr: number[], q: number) => {
    if (arr.length === 0) return 0;
    const a = [...arr].sort((x, y) => x - y);
    const idx = Math.floor((a.length - 1) * q);
    return a[idx];
  };

  const summary = {
    runId: testRunId,
    docs,
    queries,
    topk,
    insertLatencyMs: {
      p50: p(insertLat, 0.5), p95: p(insertLat, 0.95), max: Math.max(...insertLat), avg: insertLat.reduce((s, x) => s + x, 0) / insertLat.length
    },
    queryLatencyMs: {
      p50: p(queryLat, 0.5), p95: p(queryLat, 0.95), max: Math.max(...queryLat), avg: queryLat.reduce((s, x) => s + x, 0) / queryLat.length
    },
    throughput: {
      insertDocsPerSec: insertElapsedAll > 0 ? (docs / (insertElapsedAll / 1000)) : null,
      queryPerSec: queryLat.length > 0 ? (queryLat.length / (queryLat.reduce((s, x) => s + x, 0) / 1000)) : null
    },
    top1: {
      accuracy: sample.length ? top1Hits / sample.length : 0,
      distanceAvg: top1Dist.length ? top1Dist.reduce((s, x) => s + x, 0) / top1Dist.length : null
    }
  };

  console.log(JSON.stringify(summary, null, 2));

  // Optional CSV output
  if (csvPath) {
    const fs = await import('fs');
    const hdr = [
      'timestamp','runId','docs','queries','topk',
      'ins_p50','ins_p95','ins_max','ins_avg','ins_tps',
      'qry_p50','qry_p95','qry_max','qry_avg','qry_qps',
      'top1_acc','top1_dist_avg'
    ].join(',') + '\n';
    const row = [
      new Date().toISOString(), testRunId, docs, queries, topk,
      summary.insertLatencyMs.p50, summary.insertLatencyMs.p95, summary.insertLatencyMs.max, summary.insertLatencyMs.avg, summary.throughput.insertDocsPerSec ?? '',
      summary.queryLatencyMs.p50, summary.queryLatencyMs.p95, summary.queryLatencyMs.max, summary.queryLatencyMs.avg, summary.throughput.queryPerSec ?? '',
      summary.top1.accuracy, summary.top1.distanceAvg ?? ''
    ].join(',') + '\n';
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, hdr + row);
    } else {
      fs.appendFileSync(csvPath, row);
    }
  }
}

async function main() {
  const [, , cmd, dirArg, docsArg, queriesArg, csvArg] = process.argv;
  if (!cmd || cmd === 'help') {
    console.error('Usage: tsx src/cli/memory-bench.ts run [memoryDir] [docs] [queries]');
    process.exit(2);
  }
  if (cmd === 'run') {
    const docs = docsArg ? parseInt(docsArg, 10) : undefined;
    const queries = queriesArg ? parseInt(queriesArg, 10) : undefined;
    const opts: BenchOpts = {};
    if (typeof dirArg === 'string') opts.memoryDir = dirArg;
    if (typeof docs === 'number') opts.docs = docs;
    if (typeof queries === 'number') opts.queries = queries;
    await bench(opts, csvArg);
    return;
  }
  console.error('Unknown command:', cmd);
  process.exit(2);
}

main().catch(e => { console.error(e); process.exit(1); });
